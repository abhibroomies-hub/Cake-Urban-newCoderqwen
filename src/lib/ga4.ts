// Google Analytics 4 (GA4) Custom Event Helpers

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export const trackGa4Event = (eventName: string, params: Record<string, any>) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
};

export const trackProductView = (product: { id: string; name: string; price: number; category?: string }) => {
  trackGa4Event("view_item", {
    currency: "INR",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category || "Gourmet Bakery",
      },
    ],
  });
};

export const trackAddToCart = (product: { id: string; name: string; price: number; qty?: number }, qty = 1) => {
  trackGa4Event("add_to_cart", {
    currency: "INR",
    value: product.price * qty,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        quantity: qty,
      },
    ],
  });
};

export const trackPurchase = (orderId: string, total: number, items: { id?: string; productId?: string; name: string; price: number; qty: number }[]) => {
  trackGa4Event("purchase", {
    transaction_id: orderId,
    value: total,
    currency: "INR",
    tax: 0,
    shipping: 0,
    items: items.map((it) => ({
      item_id: it.id || it.productId || "item",
      item_name: it.name,
      price: it.price,
      quantity: it.qty,
    })),
  });
};
