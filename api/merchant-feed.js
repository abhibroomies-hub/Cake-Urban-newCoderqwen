const CANONICAL_SITE_URL = "https://www.cakeurban.com";

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const MERCHANT_PRODUCTS = [
  {
    id: "cu-cake-belgian-truffle",
    title: "100% Eggless Royal Belgian Chocolate Truffle Cake (0.5 Kg - 2 Kg)",
    desc: "Rich 54% Belgian dark chocolate ganache layered over moist 100% pure eggless chocolate sponge. Freshly baked to order with 30-45 min express cold-chain delivery across Faridabad, Gurgaon, Noida, Delhi and Ghaziabad.",
    link: "/product/c1",
    img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    priceInr: "649.00 INR",
    salePriceInr: "549.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Eggless Cakes > Chocolate Truffle Cakes",
  },
  {
    id: "cu-cake-rasmalai-pistachio",
    title: "100% Eggless Royal Rasmalai & Kashmiri Saffron Pistachio Cake",
    desc: "Freshly soaked Bengali rasmalai malai sponge topped with roasted Iranian pistachios, rose petals and saffron rabri cream. 100% pure vegetarian and eggless with 30-45 min delivery in Delhi NCR.",
    link: "/custom-cake/rasmalai-cake",
    img: "https://i.pinimg.com/736x/ed/63/f8/ed63f8e078267950345acfc4b0c970ec.jpg",
    priceInr: "799.00 INR",
    salePriceInr: "699.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Eggless Cakes > Fusion Rasmalai Cakes",
  },
  {
    id: "cu-cake-butterfly-lavender",
    title: "Custom Lavender Butterfly Aesthetic Birthday Cake (100% Eggless)",
    desc: "Trending Pinterest lavender & purple butterfly aesthetic birthday cake with edible shimmer butterflies and pearl detailing. 100% pure eggless with same-day & midnight delivery in Delhi NCR.",
    link: "/custom-cake/butterfly-cake",
    img: "https://i.pinimg.com/736x/66/43/4f/66434f01e84504790655519b5e6dcd35.jpg",
    priceInr: "1299.00 INR",
    salePriceInr: "1099.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Custom Theme Cakes > Butterfly Birthday Cakes",
  },
  {
    id: "cu-cake-vintage-heart",
    title: "Pink Vintage Lambeth Heart Anniversary & Birthday Cake (100% Eggless)",
    desc: "Hand-piped Korean & vintage Lambeth ribbon heart cake for birthdays, anniversaries and romantic surprises. 100% pure eggless sponge with 30-45 min express delivery.",
    link: "/custom-cake/vintage-heart-cake",
    img: "https://i.pinimg.com/736x/78/2b/27/782b276ce3ac3a102ca8f4d1732d9325.jpg",
    priceInr: "1199.00 INR",
    salePriceInr: "999.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Custom Theme Cakes > Vintage Heart Anniversary Cakes",
  },
  {
    id: "cu-cake-pineapple-cream",
    title: "100% Eggless Fresh Cream Pineapple Crunch Celebration Cake",
    desc: "Light vanilla sponge layered with caramelized golden pineapple compote, whipped dairy cream and roasted almond flakes. 30-45 min chilled delivery across Faridabad, Gurgaon, Noida & Delhi.",
    link: "/custom-cake/pineapple-cake",
    img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    priceInr: "549.00 INR",
    salePriceInr: "449.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Eggless Cakes > Fresh Fruit & Pineapple Cakes",
  },
  {
    id: "cu-cake-red-velvet-heart",
    title: "100% Eggless Romantic Red Velvet Cream Cheese Heart Cake",
    desc: "Velvety crimson cocoa sponge frosted with authentic Madagascar vanilla bean cream cheese frosting. Ideal for 1st anniversary, wife/husband birthday & midnight surprises.",
    link: "/custom-cake/red-velvet-cake",
    img: "https://i.pinimg.com/736x/ed/63/f8/ed63f8e078267950345acfc4b0c970ec.jpg",
    priceInr: "749.00 INR",
    salePriceInr: "649.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Eggless Cakes > Anniversary Red Velvet Cakes",
  },
  {
    id: "cu-cake-sugar-free-diabetic",
    title: "100% Sugar-Free & Eggless Belgian Dark Chocolate Almond Cake",
    desc: "Guilt-free stevia and maltitol sweetened 70% dark chocolate almond cake crafted for diabetic-friendly & fitness celebrations across Delhi NCR.",
    link: "/sugar-free-cake-delivery-in-vasant-kunj",
    img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    priceInr: "899.00 INR",
    salePriceInr: "749.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Eggless Cakes > Sugar-Free Healthy Cakes",
  },
  {
    id: "cu-cake-doraemon-kids",
    title: "Custom Doraemon Cartoon 1st & Kids Birthday Cake (100% Eggless)",
    desc: "Vibrant Doraemon 3D fondant & whipped cream birthday cake for boys and girls. 100% pure eggless, freshly baked with free custom name topper.",
    link: "/custom-cake/doraemon-cake",
    img: "https://i.pinimg.com/736x/66/43/4f/66434f01e84504790655519b5e6dcd35.jpg",
    priceInr: "1099.00 INR",
    salePriceInr: "899.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Custom Theme Cakes > Kids Cartoon Birthday Cakes",
  },
  {
    id: "cu-cake-spiderman-superhero",
    title: "Custom Spiderman Superhero Web Theme Birthday Cake (100% Eggless)",
    desc: "Action-packed Marvel Spiderman birthday cake in Belgian chocolate truffle or pineapple flavour. 100% pure eggless with 30-45 min express delivery.",
    link: "/custom-cake/spiderman-cake",
    img: "https://i.pinimg.com/736x/78/2b/27/782b276ce3ac3a102ca8f4d1732d9325.jpg",
    priceInr: "1149.00 INR",
    salePriceInr: "949.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Custom Theme Cakes > Kids Superhero Cakes",
  },
  {
    id: "cu-cake-2-tier-wedding",
    title: "Luxury 2-Tier Royal Wedding & 25th Anniversary Designer Cake (100% Eggless)",
    desc: "Handcrafted 2-tier floral & gold-leaf celebration cake for weddings, ring ceremonies, and 25th silver jubilee anniversaries across Faridabad, Gurgaon, Noida & Delhi.",
    link: "/custom-cake/2-tier-wedding-cake",
    img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
    priceInr: "2499.00 INR",
    salePriceInr: "2199.00 INR",
    category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
    productType: "Custom Theme Cakes > 2-Tier Wedding & Engagement Cakes",
  },
];

const HIGH_INTENT_THEMES = [
  "barbie-doll-cake",
  "unicorn-cake",
  "cocomelon-cake",
  "shinchan-cake",
  "boss-baby-cake",
  "frozen-elsa-cake",
  "korean-bento-cake",
  "lotus-biscoff-cake",
  "ferrero-rocher-cake",
  "black-forest-cake",
  "butterscotch-cake",
  "fresh-fruit-cake",
  "strawberry-cake",
  "blueberry-cake",
  "photo-pulling-cake",
  "pinata-hammer-cake",
  "bomb-surprise-cake",
  "bride-to-be-cake",
  "baby-shower-cake",
  "engagement-ring-cake",
  "cricket-theme-cake",
  "car-theme-cake",
  "jungle-safari-cake",
  "avengers-cake",
  "25th-anniversary-cake",
  "50th-birthday-gold-cake",
  "1st-birthday-boy-cake",
  "1st-birthday-girl-cake",
  "doctor-theme-cake",
  "makeup-theme-cake",
];

const NCR_CITIES = ["faridabad", "gurgaon", "noida", "delhi", "ghaziabad"];

export function buildMerchantFeedXml(baseUrl = CANONICAL_SITE_URL) {
  const items = [...MERCHANT_PRODUCTS];

  // Expand with city + theme combinations for Google Shopping local inventory coverage
  for (const theme of HIGH_INTENT_THEMES) {
    const label = theme.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    items.push({
      id: `cu-${theme}`,
      title: `100% Eggless Custom ${label} — Same Day & 30-Min Delivery in Delhi NCR`,
      desc: `Order freshly baked 100% pure eggless ${label} online at CakeUrban. Customize weight, flavour (Belgian Chocolate, Rasmalai, Pineapple, Red Velvet) & name message with 30-45 min express cold-chain delivery.`,
      link: `/custom-cake/${theme}`,
      img: "https://i.pinimg.com/736x/11/63/1e/11631ec40ef315f65ce7876b5bdbc4c4.jpg",
      priceInr: "999.00 INR",
      salePriceInr: "799.00 INR",
      category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
      productType: `Custom Theme Cakes > ${label}`,
    });

    for (const city of NCR_CITIES) {
      const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
      items.push({
        id: `cu-${theme}-${city}`,
        title: `Custom ${label} Delivery in ${cityLabel} (100% Eggless) — 30-Min Express`,
        desc: `Order 100% pure eggless ${label} in ${cityLabel} from CakeUrban Bakehouse. Freshly baked to order with free custom name topper, 30-45 min express & 12 AM midnight doorstep delivery in ${cityLabel}.`,
        link: `/custom-cake/${theme}-in-${city}`,
        img: "https://i.pinimg.com/736x/66/43/4f/66434f01e84504790655519b5e6dcd35.jpg",
        priceInr: "999.00 INR",
        salePriceInr: "799.00 INR",
        category: "Food, Beverages & Tobacco > Food Items > Bakery > Cakes",
        productType: `Custom Theme Cakes > ${cityLabel} > ${label}`,
      });
    }
  }

  const xmlItems = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(`${baseUrl}${item.link}`)}</link>
      <description>${escapeXml(item.desc)}</description>
      <guid isPermaLink="true">${escapeXml(`${baseUrl}${item.link}`)}</guid>
      <g:id>${escapeXml(item.id)}</g:id>
      <g:title>${escapeXml(item.title)}</g:title>
      <g:description>${escapeXml(item.desc)}</g:description>
      <g:link>${escapeXml(`${baseUrl}${item.link}`)}</g:link>
      <g:image_link>${escapeXml(item.img)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>in_stock</g:availability>
      <g:price>${escapeXml(item.priceInr)}</g:price>
      <g:sale_price>${escapeXml(item.salePriceInr)}</g:sale_price>
      <g:brand>CakeUrban</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${escapeXml(item.category)}</g:google_product_category>
      <g:product_type>${escapeXml(item.productType)}</g:product_type>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>30-Min Express Cold-Chain Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>CakeUrban — 100% Pure Eggless Custom Theme Cakes, Cookies and Gift Hampers (Delhi NCR)</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Official Google Merchant Center Product Feed for CakeUrban. 100% pure eggless custom theme cakes, Belgian chocolate truffle cakes, rasmalai cakes, gourmet cookies and luxury gift hampers across Faridabad, Gurgaon, Noida, Delhi and Ghaziabad.</description>
${xmlItems}
  </channel>
</rss>`;
}

export default function handler(_req, res) {
  try {
    const xml = buildMerchantFeedXml(CANONICAL_SITE_URL);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  } catch (_err) {
    res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"></rss>`);
  }
}
