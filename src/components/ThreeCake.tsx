import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type CakeCustomizerProps = {
  baseId?: string;
  creamId?: string;
  styleId?: string;
  sizeId?: string;
  messageText?: string;
  messageColor?: string;
  interactive?: boolean;
  className?: string;
};

// Color palettes for bases and frostings
const FLAVOR_COLORS: Record<string, { sponge: number; roughness: number; metalness: number }> = {
  vanilla: { sponge: 0xf5e3c3, roughness: 0.65, metalness: 0.05 },
  chocolate: { sponge: 0x3d2217, roughness: 0.45, metalness: 0.08 },
  redvelvet: { sponge: 0x8a1c2d, roughness: 0.55, metalness: 0.05 },
  matcha: { sponge: 0x6e8b4e, roughness: 0.6, metalness: 0.04 },
  carrot: { sponge: 0xb8652d, roughness: 0.7, metalness: 0.05 },
};

const CREAM_COLORS: Record<string, { cream: number; roughness: number; clearcoat: number }> = {
  whipped: { cream: 0xfbf8f3, roughness: 0.35, clearcoat: 0.3 },
  butter: { cream: 0xfff3da, roughness: 0.4, clearcoat: 0.2 },
  mousse: { cream: 0x4a2a1f, roughness: 0.28, clearcoat: 0.4 },
  ganache: { cream: 0x24140d, roughness: 0.15, clearcoat: 0.9 },
};

/**
 * Creates procedural sponge crumb bump map on HTML5 Canvas
 */
function createCrumbTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, 256, 256);

  // Noise pores
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const rad = Math.random() * 2 + 0.5;
    const val = Math.floor(Math.random() * 80 + 90);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

/**
 * Creates dynamic text canvas for the piped inscription plaque
 */
function createMessageTexture(text: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;

  // Dark chocolate or royal plaque base
  ctx.fillStyle = "#1e130d";
  ctx.roundRect ? ctx.roundRect(10, 10, 492, 140, 24) : ctx.rect(10, 10, 492, 140);
  ctx.fill();

  // Golden border stroke
  ctx.strokeStyle = "#e8b04b";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inscribed text
  ctx.font = "bold 34px 'Fraunces', Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colorHex || "#e8b04b";
  ctx.fillText(text || "Happy Celebration!", 256, 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function ThreeCake({
  baseId = "chocolate",
  creamId = "whipped",
  styleId = "drip",
  sizeId = "8",
  messageText = "Happy Celebration!",
  messageColor = "#e8b04b",
  interactive = true,
  className = "w-full h-96",
}: CakeCustomizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [studioLight, setStudioLight] = useState<"warm" | "dramatic">("warm");

  // Keep references to Three.js objects to allow smooth prop updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cakeGroupRef = useRef<THREE.Group | null>(null);
  const plaqueMeshRef = useRef<THREE.Mesh | null>(null);
  const lightsRef = useRef<{
    keyLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    rimLight: THREE.PointLight;
    ambient: THREE.AmbientLight;
  } | null>(null);

  // Interactive mouse dragging state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.2);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "none";
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambient = new THREE.AmbientLight(0xfff7f0, 1.1);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xfff0e2, 2.4);
    keyLight.position.set(5, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xccddff, 1.2);
    fillLight.position.set(-6, 4, -4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffddaa, 3.2, 15);
    rimLight.position.set(0, 4.5, -4.5);
    scene.add(rimLight);

    lightsRef.current = { keyLight, fillLight, rimLight, ambient };

    // Cake Group
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);
    cakeGroupRef.current = cakeGroup;

    // Pedestal Plate (White Ceramic & Gold Rim)
    const standGeo = new THREE.CylinderGeometry(2.5, 2.7, 0.2, 64);
    const standMat = new THREE.MeshStandardMaterial({
      color: 0x1f1b18,
      roughness: 0.2,
      metalness: 0.15,
    });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = -1.1;
    stand.receiveShadow = true;
    cakeGroup.add(stand);

    const goldRimGeo = new THREE.TorusGeometry(2.7, 0.05, 16, 64);
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xe8b04b,
      roughness: 0.25,
      metalness: 0.85,
    });
    const goldRim = new THREE.Mesh(goldRimGeo, goldRimMat);
    goldRim.rotation.x = Math.PI / 2;
    goldRim.position.y = -1.0;
    cakeGroup.add(goldRim);

    // Crumb normal texture
    const crumbTexture = createCrumbTexture();

    // Bottom Sponge Tier
    const baseConfig = FLAVOR_COLORS[baseId] || FLAVOR_COLORS.chocolate;
    const creamConfig = CREAM_COLORS[creamId] || CREAM_COLORS.whipped;

    const tier1Radius = sizeId === "12" ? 2.1 : sizeId === "10" ? 1.9 : sizeId === "6" ? 1.5 : 1.7;
    const tier1Height = 1.1;
    const tier1Geo = new THREE.CylinderGeometry(tier1Radius, tier1Radius, tier1Height, 48);
    const tier1Mat = new THREE.MeshStandardMaterial({
      color: baseConfig.sponge,
      roughness: baseConfig.roughness,
      metalness: baseConfig.metalness,
      bumpMap: crumbTexture,
      bumpScale: 0.015,
    });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = -0.45;
    tier1.castShadow = true;
    tier1.receiveShadow = true;
    cakeGroup.add(tier1);

    // Cream Frosting Band around tier 1
    const creamBandGeo = new THREE.CylinderGeometry(tier1Radius + 0.04, tier1Radius + 0.04, 0.22, 48);
    const creamMat = new THREE.MeshStandardMaterial({
      color: creamConfig.cream,
      roughness: creamConfig.roughness,
      metalness: 0.05,
    });
    const creamBand = new THREE.Mesh(creamBandGeo, creamMat);
    creamBand.position.y = 0.15;
    cakeGroup.add(creamBand);

    // Top Sponge Tier (if 8"+ or celebration style)
    const tier2Radius = tier1Radius * 0.7;
    const tier2Height = 0.9;
    const tier2Geo = new THREE.CylinderGeometry(tier2Radius, tier2Radius, tier2Height, 48);
    const tier2Mat = new THREE.MeshStandardMaterial({
      color: baseConfig.sponge,
      roughness: baseConfig.roughness,
      metalness: baseConfig.metalness,
      bumpMap: crumbTexture,
      bumpScale: 0.015,
    });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 0.72;
    tier2.castShadow = true;
    tier2.receiveShadow = true;
    cakeGroup.add(tier2);

    // Top Frosting Coat
    const topFrostingGeo = new THREE.CylinderGeometry(tier2Radius + 0.03, tier2Radius + 0.03, 0.18, 48);
    const topFrosting = new THREE.Mesh(topFrostingGeo, creamMat);
    topFrosting.position.y = 1.22;
    cakeGroup.add(topFrosting);

    // Cascading Ganache Drips (Style = drip or luxury)
    if (styleId === "drip" || styleId === "luxury") {
      const dripMat = new THREE.MeshStandardMaterial({
        color: styleId === "luxury" ? 0x24140d : 0x3b1c11,
        roughness: 0.15,
        metalness: 0.1,
      });
      // Piped teardrops hanging around tier 2
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2;
        const dripLength = 0.2 + Math.sin(i * 3.4) * 0.14 + 0.1;
        const dripGeo = new THREE.ConeGeometry(0.065, dripLength, 12);
        const dripMesh = new THREE.Mesh(dripGeo, dripMat);
        dripMesh.rotation.x = Math.PI;
        dripMesh.position.set(
          Math.cos(angle) * (tier2Radius + 0.02),
          1.18 - dripLength / 2,
          Math.sin(angle) * (tier2Radius + 0.02)
        );
        cakeGroup.add(dripMesh);
      }
    }

    // Rosettes & Cream Swirls
    const rosetteMat = new THREE.MeshStandardMaterial({
      color: creamConfig.cream,
      roughness: creamConfig.roughness,
    });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const swirlGeo = new THREE.SphereGeometry(0.12, 16, 16);
      swirlGeo.scale(1, 1.4, 1);
      const swirl = new THREE.Mesh(swirlGeo, rosetteMat);
      swirl.position.set(Math.cos(angle) * (tier2Radius - 0.12), 1.34, Math.sin(angle) * (tier2Radius - 0.12));
      cakeGroup.add(swirl);
    }

    // Edible Gold Flakes & Colorful Sprinkles on Top
    const sprinkleColors = [0xe23e5f, 0xe8b04b, 0xaacb78, 0xffffff, 0x4a90e2];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (tier2Radius - 0.22);
      const spColor = sprinkleColors[i % sprinkleColors.length];
      const spMat = new THREE.MeshStandardMaterial({
        color: styleId === "luxury" ? 0xe8b04b : spColor,
        roughness: styleId === "luxury" ? 0.2 : 0.4,
        metalness: styleId === "luxury" ? 0.8 : 0.0,
      });
      const spGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.08, 8);
      const sprinkle = new THREE.Mesh(spGeo, spMat);
      sprinkle.position.set(Math.cos(angle) * dist, 1.32, Math.sin(angle) * dist);
      sprinkle.rotation.set(Math.random(), Math.random(), Math.random());
      cakeGroup.add(sprinkle);
    }

    // Gourmet Fresh Raspberries / Berries on top
    const berryMat = new THREE.MeshStandardMaterial({
      color: 0xc22b4b,
      roughness: 0.18,
      metalness: 0.05,
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.3;
      const berryGeo = new THREE.DodecahedronGeometry(0.14, 2);
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.position.set(Math.cos(angle) * 0.55, 1.38, Math.sin(angle) * 0.55);
      cakeGroup.add(berry);
    }

    // Central Celebration Candle
    const candleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 16);
    const candleMat = new THREE.MeshStandardMaterial({
      color: 0xe8b04b,
      roughness: 0.2,
      metalness: 0.6,
    });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.y = 1.76;
    cakeGroup.add(candle);

    // Glowing Flame
    const flameGeo = new THREE.ConeGeometry(0.09, 0.25, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 2.25;
    cakeGroup.add(flame);

    // Inscription Plaque (Chocolate Tag in front)
    const msgTexture = createMessageTexture(messageText, messageColor);
    const plaqueGeo = new THREE.PlaneGeometry(1.6, 0.5);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: msgTexture,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
    });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, 0.42, tier1Radius + 0.15);
    plaqueMesh.rotation.x = -0.12;
    cakeGroup.add(plaqueMesh);
    plaqueMeshRef.current = plaqueMesh;

    // Animation Render Loop
    let reqId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && !isDraggingRef.current) {
        cakeGroup.rotation.y += 0.007;
      } else {
        // Apply inertia dampening
        cakeGroup.rotation.y += velocityRef.current.x;
        cakeGroup.rotation.x += velocityRef.current.y;
        // Clamp x rotation so the cake doesn't flip upside down
        cakeGroup.rotation.x = Math.max(-0.4, Math.min(0.6, cakeGroup.rotation.x));
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;
      }

      // Gentle flame flicker
      flame.scale.set(
        1 + Math.sin(clock.getElapsedTime() * 12) * 0.12,
        1 + Math.cos(clock.getElapsedTime() * 15) * 0.15,
        1
      );

      renderer.render(scene, camera);
    };
    animate();

    // Mouse & Touch Orbit Handlers
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = (e.clientX - prevMouseRef.current.x) * 0.008;
      const dy = (e.clientY - prevMouseRef.current.y) * 0.008;
      velocityRef.current = { x: dx, y: dy };
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    if (interactive) {
      dom.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 400;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (interactive) {
        dom.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      }
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [baseId, creamId, styleId, sizeId, messageText, messageColor, interactive]);

  // Lighting mode switcher
  const toggleLighting = () => {
    if (!lightsRef.current) return;
    if (studioLight === "warm") {
      setStudioLight("dramatic");
      lightsRef.current.keyLight.intensity = 1.4;
      lightsRef.current.rimLight.intensity = 4.8;
      lightsRef.current.fillLight.intensity = 0.6;
    } else {
      setStudioLight("warm");
      lightsRef.current.keyLight.intensity = 2.4;
      lightsRef.current.rimLight.intensity = 3.2;
      lightsRef.current.fillLight.intensity = 1.2;
    }
  };

  const resetView = () => {
    if (cakeGroupRef.current) {
      cakeGroupRef.current.rotation.set(0, 0, 0);
      velocityRef.current = { x: 0, y: 0 };
    }
  };

  return (
    <div className={`relative ${className} select-none overflow-hidden clip-tile bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 border border-ink-800`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Viewport HUD Overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 bg-ink-950/80 border border-ink-700/80 text-blaze-400 font-bold backdrop-blur clip-tag">
          3D Studio · 60 FPS
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
        <button
          type="button"
          onClick={() => setIsRotating(!isRotating)}
          title="Toggle Auto Spin"
          className={`px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase border transition-colors rounded backdrop-blur ${
            isRotating
              ? "bg-blaze-500/20 border-blaze-500 text-blaze-400"
              : "bg-ink-900/80 border-ink-700 text-ink-300 hover:text-ink-100"
          }`}
        >
          {isRotating ? "⏸ Pause Spin" : "▶ Auto Spin"}
        </button>
        <button
          type="button"
          onClick={toggleLighting}
          title="Toggle Studio Lighting"
          className="px-2 py-1 text-[10px] font-mono tracking-wider uppercase border border-ink-700 bg-ink-900/80 text-ink-300 hover:text-ink-100 rounded backdrop-blur transition-colors"
        >
          💡 {studioLight === "warm" ? "Studio" : "Dramatic"}
        </button>
        <button
          type="button"
          onClick={resetView}
          title="Reset Camera Angle"
          className="px-2 py-1 text-[10px] font-mono tracking-wider uppercase border border-ink-700 bg-ink-900/80 text-ink-300 hover:text-ink-100 rounded backdrop-blur transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      <div className="absolute bottom-2.5 inset-x-0 text-center pointer-events-none">
        <span className="font-mono text-[9px] tracking-[0.25em] text-ink-400 uppercase bg-ink-950/60 px-3 py-1 rounded-full border border-ink-800">
          Drag to inspect 360° · Real-time bake texture
        </span>
      </div>
    </div>
  );
}
