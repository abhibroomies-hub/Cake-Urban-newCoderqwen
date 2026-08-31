import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ThreeCake({ className = "w-full h-80" }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff5f0, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 2.0);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xe23e5f, 3, 10);
    pointLight.position.set(-3, 2, 3);
    scene.add(pointLight);

    // Cake Group
    const cakeGroup = new THREE.Group();
    scene.add(cakeGroup);

    // Bottom tier
    const tier1Geo = new THREE.CylinderGeometry(1.8, 1.8, 1.2, 32);
    const tier1Mat = new THREE.MeshStandardMaterial({ color: 0x3f2417, roughness: 0.3, metalness: 0.1 });
    const tier1 = new THREE.Mesh(tier1Geo, tier1Mat);
    tier1.position.y = -0.6;
    cakeGroup.add(tier1);

    // Middle tier cream frosting
    const cream1Geo = new THREE.CylinderGeometry(1.85, 1.85, 0.2, 32);
    const cream1Mat = new THREE.MeshStandardMaterial({ color: 0xf7f1e8, roughness: 0.4 });
    const cream1 = new THREE.Mesh(cream1Geo, cream1Mat);
    cream1.position.y = 0.1;
    cakeGroup.add(cream1);

    // Top tier
    const tier2Geo = new THREE.CylinderGeometry(1.2, 1.2, 1.0, 32);
    const tier2Mat = new THREE.MeshStandardMaterial({ color: 0xe23e5f, roughness: 0.25 });
    const tier2 = new THREE.Mesh(tier2Geo, tier2Mat);
    tier2.position.y = 0.7;
    cakeGroup.add(tier2);

    // Top frosting drip
    const dripGeo = new THREE.CylinderGeometry(1.22, 1.22, 0.15, 32);
    const dripMat = new THREE.MeshStandardMaterial({ color: 0xf1e0bd, roughness: 0.2 });
    const drip = new THREE.Mesh(dripGeo, dripMat);
    drip.position.y = 1.25;
    cakeGroup.add(drip);

    // Berries / Sprinkles on top
    const berryGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xc22b4b, roughness: 0.2 });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const berry = new THREE.Mesh(berryGeo, berryMat);
      berry.position.set(Math.cos(angle) * 0.75, 1.35, Math.sin(angle) * 0.75);
      cakeGroup.add(berry);
    }

    // Center candle
    const candleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16);
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xd69740, roughness: 0.3 });
    const candle = new THREE.Mesh(candleGeo, candleMat);
    candle.position.y = 1.75;
    cakeGroup.add(candle);

    // Flame
    const flameGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const flame = new THREE.Mesh(flameGeo, flameMat);
    flame.position.y = 2.25;
    cakeGroup.add(flame);

    // Animation loop
    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      cakeGroup.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 300;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className={className} />;
}
