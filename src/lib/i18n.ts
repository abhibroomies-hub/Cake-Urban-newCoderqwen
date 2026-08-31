export type Lang = "en" | "hi" | "es";

const en = {
  "nav.shop": "Bakery", "nav.new": "Fresh Today", "nav.blog": "Journal", "nav.about": "About",
  "search.ph": "Search cakes, cookies, bakes…", "account": "Account", "wishlist": "Wishlist",
  "compare": "Compare", "cart": "Cart", "addToCart": "Add to Cart", "quickView": "Quick View",
  "checkout": "Checkout", "subtotal": "Subtotal", "total": "Total", "discount": "Discount",
  "shipping": "Delivery", "freeShipNote": "away from free same-day delivery", "freeShipDone": "Free same-day delivery unlocked",
  "apply": "Apply", "couponPh": "Coupon code", "shopNow": "Order fresh bakes", "explore": "Explore the bakery",
  "featured": "Fresh from the oven", "viewAll": "View all", "reviews": "reviews", "outOfStock": "Sold out today",
  "inStock": "Baking fresh", "lowStock": "Only {n} left", "qty": "Quantity", "size": "Size", "colorway": "Flavor",
  "buyNow": "Order now", "desc": "The story", "specs": "Bake sheet", "saveForLater": "Save for later",
  "remove": "Remove", "yourCart": "Your Box", "emptyCart": "Your box is empty", "continueShopping": "Browse the bakery",
  "newsletterTitle": "First slice on us", "newsletterSub": "New bakes, secret menus and 10% off your first order. Fresh in your inbox, never stale.",
  "subscribe": "Subscribe", "footerRights": "All rights reserved.", "cookieMsg": "We use cookies (the digital kind) to power carts, analytics and personalization — GDPR friendly.",
  "accept": "Accept", "decline": "Decline", "orderPlaced": "Order placed", "signedIn": "Signed in as",
  "filter": "Filters", "sort": "Sort", "price": "Price", "brand": "Line", "rating": "Rating", "category": "Category",
  "results": "results", "compareTray": "Compare tray", "clearAll": "Clear all", "theme": "Theme",
};

const hi: typeof en = {
  "nav.shop": "बेकरी", "nav.new": "आज ताज़ा", "nav.blog": "जर्नल", "nav.about": "परिचय",
  "search.ph": "केक, कुकीज़, बेक्स खोजें…", "account": "खाता", "wishlist": "विशलिस्ट",
  "compare": "तुलना", "cart": "कार्ट", "addToCart": "कार्ट में डालें", "quickView": "क्विक व्यू",
  "checkout": "चेकआउट", "subtotal": "उप-योग", "total": "कुल", "discount": "छूट",
  "shipping": "डिलीवरी", "freeShipNote": "फ्री सेम-डे डिलीवरी से दूर", "freeShipDone": "फ्री सेम-डे डिलीवरी अनलॉक",
  "apply": "लागू करें", "couponPh": "कूपन कोड", "shopNow": "ताज़ा ऑर्डर करें", "explore": "बेकरी देखें",
  "featured": "ओवन से ताज़ा", "viewAll": "सभी देखें", "reviews": "समीक्षाएँ", "outOfStock": "आज बिक गया",
  "inStock": "ताज़ा बन रहा है", "lowStock": "सिर्फ़ {n} बचे", "qty": "मात्रा", "size": "साइज़", "colorway": "फ़्लेवर",
  "buyNow": "अभी ऑर्डर करें", "desc": "कहानी", "specs": "बेक शीट", "saveForLater": "बाद के लिए सेव करें",
  "remove": "हटाएँ", "yourCart": "आपका बॉक्स", "emptyCart": "बॉक्स खाली है", "continueShopping": "बेकरी देखें",
  "newsletterTitle": "पहला स्लाइस हमारी ओर से", "newsletterSub": "नई बेक्स, सीक्रेट मेन्यू और पहले ऑर्डर पर 10% छूट।",
  "subscribe": "सब्सक्राइब", "footerRights": "सर्वाधिकार सुरक्षित।", "cookieMsg": "हम कुकीज़ (डिजिटल वाली) कार्ट, एनालिटिक्स और व्यक्तिगतकरण के लिए इस्तेमाल करते हैं — GDPR फ्रेंडली।",
  "accept": "स्वीकारें", "decline": "अस्वीकारें", "orderPlaced": "ऑर्डर हो गया", "signedIn": "साइन इन:",
  "filter": "फ़िल्टर", "sort": "क्रम", "price": "कीमत", "brand": "लाइन", "rating": "रेटिंग", "category": "श्रेणी",
  "results": "परिणाम", "compareTray": "तुलना ट्रे", "clearAll": "सब हटाएँ", "theme": "थीम",
};

const es: typeof en = {
  "nav.shop": "Pastelería", "nav.new": "Recién horneado", "nav.blog": "Diario", "nav.about": "Nosotros",
  "search.ph": "Busca pasteles, galletas…", "account": "Cuenta", "wishlist": "Favoritos",
  "compare": "Comparar", "cart": "Cesta", "addToCart": "Añadir", "quickView": "Vista rápida",
  "checkout": "Pagar", "subtotal": "Subtotal", "total": "Total", "discount": "Descuento",
  "shipping": "Entrega", "freeShipNote": "para entrega same-day gratis", "freeShipDone": "Entrega same-day gratis desbloqueada",
  "apply": "Aplicar", "couponPh": "Código", "shopNow": "Pide recién hecho", "explore": "Explora la pastelería",
  "featured": "Recién salido del horno", "viewAll": "Ver todo", "reviews": "reseñas", "outOfStock": "Agotado hoy",
  "inStock": "Horneando fresco", "lowStock": "Solo quedan {n}", "qty": "Cantidad", "size": "Tamaño", "colorway": "Sabor",
  "buyNow": "Pedir ahora", "desc": "La historia", "specs": "Ficha de horno", "saveForLater": "Guardar",
  "remove": "Quitar", "yourCart": "Tu caja", "emptyCart": "Tu caja está vacía", "continueShopping": "Ver la pastelería",
  "newsletterTitle": "La primera rebanada va por nosotros", "newsletterSub": "Nuevos pasteles, menús secretos y 10% en tu primer pedido.",
  "subscribe": "Suscribirse", "footerRights": "Todos los derechos reservados.", "cookieMsg": "Usamos cookies (digitales) para el carrito, analítica y personalización — GDPR friendly.",
  "accept": "Aceptar", "decline": "Rechazar", "orderPlaced": "Pedido realizado", "signedIn": "Sesión:",
  "filter": "Filtros", "sort": "Ordenar", "price": "Precio", "brand": "Línea", "rating": "Valoración", "category": "Categoría",
  "results": "resultados", "compareTray": "Bandeja de comparación", "clearAll": "Limpiar", "theme": "Tema",
};

const dicts: Record<Lang, typeof en> = { en, hi, es };

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  let s: string = (dicts[lang] as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
