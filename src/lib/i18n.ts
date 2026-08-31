export type Lang = "en" | "hi" | "es";

const en = {
  "nav.shop": "Shop", "nav.new": "New In", "nav.blog": "Journal", "nav.about": "About",
  "search.ph": "Search gear, brands, collections…", "account": "Account", "wishlist": "Wishlist",
  "compare": "Compare", "cart": "Cart", "addToCart": "Add to Cart", "quickView": "Quick View",
  "checkout": "Checkout", "subtotal": "Subtotal", "total": "Total", "discount": "Discount",
  "shipping": "Shipping", "freeShipNote": "away from free express shipping", "freeShipDone": "You unlocked free express shipping",
  "apply": "Apply", "couponPh": "Coupon code", "shopNow": "Shop the drop", "explore": "Explore collections",
  "featured": "Featured Drops", "viewAll": "View all", "reviews": "reviews", "outOfStock": "Out of stock",
  "inStock": "In stock", "lowStock": "Only {n} left", "qty": "Quantity", "size": "Size", "colorway": "Colorway",
  "buyNow": "Buy now", "desc": "Description", "specs": "Specifications", "saveForLater": "Save for later",
  "remove": "Remove", "yourCart": "Your Cart", "emptyCart": "Your cart is empty", "continueShopping": "Continue shopping",
  "newsletterTitle": "Join the Velocity List", "newsletterSub": "Drops, lab notes and 10% off your first order. No noise, ever.",
  "subscribe": "Subscribe", "footerRights": "All rights reserved.", "cookieMsg": "We use cookies to power carts, analytics and personalization (GDPR).",
  "accept": "Accept", "decline": "Decline", "orderPlaced": "Order placed", "signedIn": "Signed in as",
  "filter": "Filters", "sort": "Sort", "price": "Price", "brand": "Brand", "rating": "Rating", "category": "Category",
  "results": "results", "compareTray": "Compare tray", "clearAll": "Clear all", "theme": "Theme",
};

const hi: typeof en = {
  "nav.shop": "शॉप", "nav.new": "नया", "nav.blog": "जर्नल", "nav.about": "परिचय",
  "search.ph": "गियर, ब्रांड खोजें…", "account": "खाता", "wishlist": "विशलिस्ट",
  "compare": "तुलना", "cart": "कार्ट", "addToCart": "कार्ट में डालें", "quickView": "क्विक व्यू",
  "checkout": "चेकआउट", "subtotal": "उप-योग", "total": "कुल", "discount": "छूट",
  "shipping": "शिपिंग", "freeShipNote": "फ्री एक्सप्रेस शिपिंग से दूर", "freeShipDone": "फ्री एक्सप्रेस शिपिंग अनलॉक",
  "apply": "लागू करें", "couponPh": "कूपन कोड", "shopNow": "अभी खरीदें", "explore": "कलेक्शन देखें",
  "featured": "फीचर्ड ड्रॉप्स", "viewAll": "सभी देखें", "reviews": "समीक्षाएँ", "outOfStock": "स्टॉक खत्म",
  "inStock": "स्टॉक में", "lowStock": "सिर्फ़ {n} बचे", "qty": "मात्रा", "size": "साइज़", "colorway": "रंग",
  "buyNow": "अभी खरीदें", "desc": "विवरण", "specs": "विनिर्देश", "saveForLater": "बाद के लिए सेव करें",
  "remove": "हटाएँ", "yourCart": "आपका कार्ट", "emptyCart": "कार्ट खाली है", "continueShopping": "खरीदारी जारी रखें",
  "newsletterTitle": "वेलोसिटी लिस्ट जॉइन करें", "newsletterSub": "ड्रॉप्स, लैब नोट्स और पहले ऑर्डर पर 10% छूट।",
  "subscribe": "सब्सक्राइब", "footerRights": "सर्वाधिकार सुरक्षित।", "cookieMsg": "हम कार्ट, एनालिटिक्स और व्यक्तिगतकरण के लिए कुकीज़ का उपयोग करते हैं (GDPR)।",
  "accept": "स्वीकारें", "decline": "अस्वीकारें", "orderPlaced": "ऑर्डर हो गया", "signedIn": "साइन इन:",
  "filter": "फ़िल्टर", "sort": "क्रम", "price": "कीमत", "brand": "ब्रांड", "rating": "रेटिंग", "category": "श्रेणी",
  "results": "परिणाम", "compareTray": "तुलना ट्रे", "clearAll": "सब हटाएँ", "theme": "थीम",
};

const es: typeof en = {
  "nav.shop": "Tienda", "nav.new": "Novedades", "nav.blog": "Diario", "nav.about": "Nosotros",
  "search.ph": "Busca equipo, marcas…", "account": "Cuenta", "wishlist": "Favoritos",
  "compare": "Comparar", "cart": "Cesta", "addToCart": "Añadir", "quickView": "Vista rápida",
  "checkout": "Pagar", "subtotal": "Subtotal", "total": "Total", "discount": "Descuento",
  "shipping": "Envío", "freeShipNote": "para envío exprés gratis", "freeShipDone": "Envío exprés gratis desbloqueado",
  "apply": "Aplicar", "couponPh": "Código", "shopNow": "Comprar", "explore": "Ver colecciones",
  "featured": "Destacados", "viewAll": "Ver todo", "reviews": "reseñas", "outOfStock": "Agotado",
  "inStock": "En stock", "lowStock": "Solo quedan {n}", "qty": "Cantidad", "size": "Talla", "colorway": "Color",
  "buyNow": "Comprar ya", "desc": "Descripción", "specs": "Especificaciones", "saveForLater": "Guardar",
  "remove": "Quitar", "yourCart": "Tu cesta", "emptyCart": "Tu cesta está vacía", "continueShopping": "Seguir comprando",
  "newsletterTitle": "Únete a la Velocity List", "newsletterSub": "Lanzamientos y 10% en tu primer pedido.",
  "subscribe": "Suscribirse", "footerRights": "Todos los derechos reservados.", "cookieMsg": "Usamos cookies para el carrito, analítica y personalización (GDPR).",
  "accept": "Aceptar", "decline": "Rechazar", "orderPlaced": "Pedido realizado", "signedIn": "Sesión:",
  "filter": "Filtros", "sort": "Ordenar", "price": "Precio", "brand": "Marca", "rating": "Valoración", "category": "Categoría",
  "results": "resultados", "compareTray": "Bandeja de comparación", "clearAll": "Limpiar", "theme": "Tema",
};

const dicts: Record<Lang, typeof en> = { en, hi, es };

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s: string = (dicts[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
