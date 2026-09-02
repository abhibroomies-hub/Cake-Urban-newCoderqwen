export interface AreaData {
  slug: string;
  cityName: string;
  citySlug: string;
  areaName: string;
  title: string;
  metaDesc: string;
  pincode: string;
  landmarks: string[];
  sla: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
  intent?: string; // 'standard' | 'midnight' | 'birthday' | 'eggless' | 'anniversary' | 'photo' | 'custom' | 'chocolate' | 'pinata' | 'same-day'
  intentBadge?: string;
  intentTitle?: string;
}

export interface CityHubData {
  citySlug: string;
  cityName: string;
  title: string;
  metaDesc: string;
  description: string;
  areas: AreaData[];
}

export const SEO_INTENTS: Record<string, { label: string; prefix: string; heading: string; badge: string; desc: string }> = {
  "standard": {
    label: "All Hampers & Cookies",
    prefix: "cake-delivery-in",
    heading: "Luxury Gift Hamper & Cookie Delivery in",
    badge: "⚡ 30-45 Mins Express",
    desc: "Order exquisite luxury gift hampers, gourmet cookies & crispy namkeens delivered right to your doorstep."
  },
  "midnight": {
    label: "Midnight Delivery",
    prefix: "midnight-cake-delivery-in",
    heading: "Midnight Surprise Gift Hamper Delivery in",
    badge: "🌙 Guaranteed 12 AM Delivery",
    desc: "Make birthdays & anniversaries unforgettable with guaranteed midnight gift hamper delivery between 11:00 PM and 12:30 AM."
  },
  "birthday": {
    label: "Birthday Hampers",
    prefix: "birthday-cake-delivery-in",
    heading: "Birthday Gift Hamper & Cookie Delivery in",
    badge: "🎉 Birthday Special",
    desc: "Celebrate special milestones with handcrafted birthday gift boxes, gourmet cookies, candles and personalized notes."
  },
  "eggless": {
    label: "Anniversary & Romance",
    prefix: "eggless-cake-delivery-in",
    heading: "Anniversary Gift Box & Macaron Delivery in",
    badge: "❤️ Romantic Milestone Specials",
    desc: "Express love with premium anniversary gift hampers, French macarons, red rose boxes & keepsake tins."
  },
  "anniversary": {
    label: "Corporate Gifting",
    prefix: "anniversary-cake-delivery-in",
    heading: "Corporate Gifting & Executive Hamper Delivery in",
    badge: "🏢 Bulk & Custom Branding",
    desc: "Impress clients, partners, and employees with premium corporate gift boxes featuring cookies, nuts and custom sleeves."
  },
  "photo": {
    label: "Marriage Shagun",
    prefix: "photo-cake-delivery-in",
    heading: "Marriage Shagun & Trousseau Hamper Delivery in",
    badge: "💍 Traditional Wedding Gifting",
    desc: "Exquisite wedding trousseau and shagun gift hampers crafted for Indian weddings, engagement ceremonies, and return favors."
  },
  "custom": {
    label: "Return Favors",
    prefix: "custom-cake-delivery-in",
    heading: "Party Return Gift Pack Delivery in",
    badge: "🎁 Guest Favors & Pouches",
    desc: "Delight your party guests with beautifully packaged return gift pouches, mini cookies, and crunchy namkeens."
  },
  "chocolate": {
    label: "Gourmet Cookies",
    prefix: "chocolate-cake-delivery-in",
    heading: "Artisanal Choc-Chip Cookie Delivery in",
    badge: "🍪 72-Hour Cold-Fermented",
    desc: "Decadent choc-chip cookie stacks, molten centers, butter shortbread and macaron boxes baked with pure butter."
  },
  "pinata": {
    label: "Crispy Namkeens",
    prefix: "pinata-cake-delivery-in",
    heading: "Royal Bhujia & Roasted Makhana Delivery in",
    badge: "🔥 Traditional Crunch",
    desc: "Crispy Bikaner bhujia, peri-peri roasted makhana, dry fruit shahi mixture and flaky methi mathri."
  },
  "same-day": {
    label: "Same Day Express",
    prefix: "same-day-cake-delivery-in",
    heading: "Same Day 35-Min Rush Hamper Delivery in",
    badge: "🚀 Immediate Express Dispatch",
    desc: "Last-minute gifting emergency? Our express delivery riders deliver luxury gift hampers and gourmet cookies within 35-45 minutes."
  }
};

// Base Master City Registry with dozens of high-priority locations
export const DELHI_NCR_CITIES: Record<string, CityHubData> = {
  faridabad: {
    citySlug: "faridabad",
    cityName: "Faridabad",
    title: "Cake Delivery in Faridabad | Midnight Cake Shop & Bakery | CakeUrban",
    metaDesc: "Order fresh birthday cakes, designer cakes & midnight delivery in Faridabad. Serving Sector 14, 15, 16, 21, NIT, Ballabgarh, Neharpar & all sectors in 30-45 mins. 100% Eggless available.",
    description: "Faridabad's premier artisanal bakery and cake delivery service. From industrial hubs in Sector 24 to residential sectors like Sector 14, 15, 16, 21, Greenfields, Charmwood, and Greater Faridabad (Neharpar), we deliver freshly baked Belgian chocolate, fruit gateaux, and custom celebration cakes with 30–45 minute express delivery.",
    areas: [
      {
        slug: "sector-15-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 15 & 15A",
        title: "Cake Shop & Delivery in Sector 15 Faridabad | Midnight Delivery",
        metaDesc: "Best cake delivery in Sector 15 Faridabad. Order fresh birthday, anniversary & designer cakes with 35 mins express & midnight delivery. 100% eggless options.",
        pincode: "121007",
        landmarks: ["Sector 15 Main Market", "Opposite HDFC Bank", "HUDA Ground", "Sector 15A Community Center"],
        sla: "30-40 mins",
        highlights: [
          "Free express delivery across Sector 15, 15A & HUDA Market on orders above ₹799",
          "Special midnight surprise cake delivery available until 12:30 AM",
          "Custom photo cakes & designer fondant cakes baked fresh to order"
        ],
        faqs: [
          { q: "Do you offer midnight cake delivery in Sector 15 Faridabad?", a: "Yes! We provide guaranteed midnight cake delivery in Sector 15 & 15A between 11:00 PM and 12:30 AM." },
          { q: "Are all cakes 100% eggless in Sector 15?", a: "Yes, we offer both egg and 100% eggless variants for all our signature cakes without compromising on texture." },
          { q: "What is the average delivery time during daytime?", a: "Standard delivery to Sector 15 residential and market areas takes 30 to 40 minutes." }
        ]
      },
      {
        slug: "sector-16-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 16 & 16A",
        title: "Birthday Cake Delivery in Sector 16 Faridabad | CakeUrban",
        metaDesc: "Order freshly baked cakes in Sector 16 Faridabad. Choose from chocolate truffle, red velvet, fruit chantilly with express doorstep delivery.",
        pincode: "121002",
        landmarks: ["Sector 16 Market", "Botanical Garden area", "Old Faridabad Metro", "Crown Interiorz vicinity"],
        sla: "30-40 mins",
        highlights: [
          "Delivering freshly baked artisanal cakes directly to Sector 16 & 16A homes",
          "Same-day and midnight slots open 365 days a year",
          "Complimentary birthday candles and greeting card with every order"
        ],
        faqs: [
          { q: "Can I customize a birthday cake for Sector 16 delivery?", a: "Absolutely! You can choose custom messages, sizes from 500g to 5kg, and cake flavors." }
        ]
      },
      {
        slug: "sector-14-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 14",
        title: "Cake Delivery in Sector 14 Faridabad | Bakery & Midnight Cakes",
        metaDesc: "Order fresh cakes in Sector 14 Faridabad. Premium designer cakes, anniversary specials & midnight delivery. 100% fresh baked.",
        pincode: "121007",
        landmarks: ["Sector 14 Main Market", "HUDA Complex", "Apeejay School area"],
        sla: "30-40 mins",
        highlights: [
          "Serving Sector 14 upscale residential bungalows & market places",
          "Fast dispatch from local central bakery hub in Faridabad"
        ],
        faqs: [
          { q: "Do you deliver to Sector 14 market shops and residences?", a: "Yes, our delivery partners reach all locations across Sector 14 within 35 minutes." }
        ]
      },
      {
        slug: "sector-21-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 21 (21A, 21B, 21C, 21D)",
        title: "Cake Shop in Sector 21 Faridabad (21A & 21B) | CakeUrban",
        metaDesc: "Fast cake delivery in Sector 21A, 21B, 21C & 21D Faridabad. Premium designer cakes, anniversary specials & midnight delivery. Order now!",
        pincode: "121001",
        landmarks: ["Sector 21 Club", "Greenfields border", "Badkhal Mor Metro", "Sector 21C Market"],
        sla: "30-45 mins",
        highlights: [
          "Serving Sector 21A, 21B, 21C and surrounding residential societies",
          "Temperature-controlled delivery bags ensuring pristine cake structure"
        ],
        faqs: [
          { q: "Is late night delivery available in Sector 21?", a: "Yes, midnight orders can be placed up to 9 PM for midnight delivery slots." }
        ]
      },
      {
        slug: "nit-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "NIT Faridabad (1, 2, 3, 5)",
        title: "Cake Delivery in NIT Faridabad (1, 2, 3, 5) | CakeUrban",
        metaDesc: "Order birthday & wedding cakes in NIT Faridabad. Fast local delivery across NIT 1, 2, 3 & 5 markets. Fresh & eggless cakes available.",
        pincode: "121001",
        landmarks: ["Neelam Chowk", "Bata Chowk", "NIT Market No. 1", "NIT Market No. 5", "BK Chowk"],
        sla: "30-45 mins",
        highlights: [
          "Serving all NIT blocks with dedicated local delivery riders",
          "Affordable celebration combos with flowers and balloons"
        ],
        faqs: [
          { q: "Do you deliver near Neelam Chowk?", a: "Yes, Neelam Chowk and Bata Chowk areas have express 35-minute delivery windows." }
        ]
      },
      {
        slug: "greater-faridabad-neharpar",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Greater Faridabad (Sector 75-89, Neharpar)",
        title: "Cake Delivery in Greater Faridabad & Neharpar (Sectors 75-89)",
        metaDesc: "Order fresh cakes in Greater Faridabad high-rises. BPTP Parklands, Omaxe, Puri Pranayam & Sector 81-88 covered with express delivery.",
        pincode: "121002",
        landmarks: ["BPTP Bridge", "Kheri Pul", "Puri Pranayam", "Sector 81 VIP Floors", "Bata Flyover"],
        sla: "35-45 mins",
        highlights: [
          "Delivery to all gated high-rises along Neharpar & BPTP Parklands",
          "Tower doorstep delivery with security coordination"
        ],
        faqs: [
          { q: "Do you deliver to BPTP societies in Greater Faridabad?", a: "Yes, we deliver across BPTP Park Floors, Park Grandeura, Princess Park, and all surrounding societies." }
        ]
      },
      {
        slug: "ballabgarh-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Ballabgarh",
        title: "Cake Delivery in Ballabgarh Faridabad | Midnight Bakery",
        metaDesc: "Fresh cake delivery in Ballabgarh, Sector 2, 3, 55, 56 & Chawla Colony. Express delivery and eggless birthday cakes online.",
        pincode: "121004",
        landmarks: ["Raja Nahar Singh Metro", "Main Market Ballabgarh", "Sector 2 HUDA", "Sohna Road Ballabgarh"],
        sla: "35-50 mins",
        highlights: [
          "Fast delivery to Sector 2, Sector 3, Chawla Colony, and Adarsh Nagar",
          "Custom multi-tier cakes and wedding celebration cakes"
        ],
        faqs: [
          { q: "Is midnight cake delivery available in Ballabgarh?", a: "Yes, midnight delivery is available across Ballabgarh and surrounding sectors." }
        ]
      },
      {
        slug: "greenfields-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Greenfields Colony & Charmwood",
        title: "Cake Delivery in Greenfields Colony & Charmwood Village Faridabad",
        metaDesc: "Order fresh cakes in Greenfields Colony & Charmwood Village Faridabad. Express delivery from local bakery with midnight options.",
        pincode: "121009",
        landmarks: ["Greenfields Block A-B", "Charmwood Village Plaza", "Surajkund Road", "Manav Rachna vicinity"],
        sla: "30-45 mins",
        highlights: [
          "Serving Greenfields, Charmwood, and Surajkund luxury apartments",
          "Special gourmet truffle and Belgian chocolate cakes"
        ],
        faqs: [
          { q: "How fast do you deliver in Greenfields?", a: "Deliveries to Greenfields Colony take approximately 30 to 45 minutes." }
        ]
      }
    ]
  },
  gurgaon: {
    citySlug: "gurgaon",
    cityName: "Gurgaon",
    title: "Cake Delivery in Gurgaon | Midnight Cake Shop & Bakery | CakeUrban",
    metaDesc: "Best cake shop in Gurgaon. Order birthday cakes in DLF Phase 1-5, Golf Course Road, Sector 14, 29, 45, 56 & Sohna Road. 30 mins delivery & midnight specials.",
    description: "Gurgaon's favorite premium cake delivery service. From corporate hubs in Cyber City and Udyog Vihar to residential hubs in DLF Phase 1-5, Golf Course Road, Golf Course Extension, Sohna Road, and Dwarka Expressway, we craft artisanal Belgian chocolates, fruit tarts, and customized tiered celebration cakes.",
    areas: [
      {
        slug: "dlf-phase-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "DLF Phase 1, 2, 3, 4 & 5",
        title: "Cake Delivery in DLF Phase Gurgaon | Midnight Cake Shop",
        metaDesc: "Premium cake shop in DLF Phase 1, 2, 3, 4 & 5 Gurgaon. Order gourmet cakes with midnight delivery and express 30 min doorstep service.",
        pincode: "122002",
        landmarks: ["Cyber Hub", "Galleria Market", "Mega Mall", "DLF Phase 2 Rapid Metro", "Supermart 1 & 2"],
        sla: "25-35 mins",
        highlights: [
          "Express delivery covering Galleria Market, Phase 4, and Supermart areas",
          "Gourmet gift hampers and luxury chocolate boxes available",
          "Zero preservatives, 100% pure butter and Belgian cocoa used"
        ],
        faqs: [
          { q: "Can you deliver to DLF Phase 5 high-rises at midnight?", a: "Yes, our delivery partners coordinate directly with gate security for seamless midnight deliveries." }
        ]
      },
      {
        slug: "golf-course-road-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Golf Course Road & Extension",
        title: "Cake Shop on Golf Course Road Gurgaon | CakeUrban",
        metaDesc: "Order designer birthday & anniversary cakes on Golf Course Road Gurgaon. Fast delivery to Aralias, Magnolias, Camellias & all luxury societies.",
        pincode: "122003",
        landmarks: ["Sector 42/53 Rapid Metro", "The Aralias", "The Magnolias", "One Horizon Center", "Golf Course Extn Road"],
        sla: "30-40 mins",
        highlights: [
          "Specialized luxury packaging for premium designer cakes",
          "Delivering to all upscale condominiums along Golf Course Road & Extension"
        ],
        faqs: [
          { q: "Do you make custom designer cakes for golf course residences?", a: "Yes, our master pâtissiers craft bespoke multi-tier cakes for private parties and anniversaries." }
        ]
      },
      {
        slug: "sohna-road-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Sohna Road (Sector 47, 48, 49, 50)",
        title: "Cake Delivery on Sohna Road Gurgaon | Sector 47, 48, 49",
        metaDesc: "Order fresh cakes on Sohna Road Gurgaon. Fast delivery to Malibu Towne, Vipul Greens, Orchid Petals & Vatika City. Midnight delivery available.",
        pincode: "122018",
        landmarks: ["Subhash Chowk", "Vipul Greens", "Malibu Towne", "Omaxe Celebration Mall", "Vatika City"],
        sla: "30-40 mins",
        highlights: [
          "Covering all residential high-rises on Sohna Road & Southern Peripheral Road",
          "Freshly baked gourmet cheesecakes and Belgian chocolate cakes"
        ],
        faqs: [
          { q: "Is midnight delivery available on Sohna Road?", a: "Yes, midnight cake delivery is active across all Sohna Road societies." }
        ]
      },
      {
        slug: "sector-56-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Sector 56 & 57 Gurgaon",
        title: "Cake Delivery in Sector 56 & 57 Gurgaon | Midnight Bakery",
        metaDesc: "Fresh cake delivery in Sector 56, 57 & Hong Kong Bazaar Gurgaon. 30 min express delivery, photo cakes & eggless options.",
        pincode: "122011",
        landmarks: ["Hong Kong Bazaar", "Sector 56 Rapid Metro", "Huda Market Sector 56", "Sushant Lok 2"],
        sla: "25-35 mins",
        highlights: [
          "Direct dispatch to Sector 55, 56, 57, and Golf Course Extension",
          "Same-day celebration cakes and midnight slots"
        ],
        faqs: [
          { q: "Can I get cake delivery in 30 minutes in Sector 56?", a: "Yes, our local Gurgaon hub delivers to Sector 56 in 25-35 minutes." }
        ]
      },
      {
        slug: "sector-14-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Sector 14 & Old Gurgaon",
        title: "Cake Delivery in Sector 14 Gurgaon | Old Gurgaon Bakery",
        metaDesc: "Order birthday cakes in Sector 14, Sector 15 & Old DLF Gurgaon. Express 30 min delivery, eggless cakes & customized designs.",
        pincode: "122001",
        landmarks: ["Sector 14 Main Market", "Girls College", "Old Railway Road", "MG Road Metro"],
        sla: "25-35 mins",
        highlights: [
          "Delivering to Sector 14, 15, 17, 31, and Old Gurgaon neighborhoods",
          "Rich variety of chocolate truffle, black forest, and fresh fruit cakes"
        ],
        faqs: [
          { q: "Do you deliver to Sector 14 market?", a: "Yes, we deliver to both market shops and residential addresses in Sector 14." }
        ]
      },
      {
        slug: "cyber-city-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Cyber City & Udyog Vihar",
        title: "Corporate Cake Delivery in Cyber City & Udyog Vihar Gurgaon",
        metaDesc: "Order corporate celebration cakes in DLF Cyber City & Udyog Vihar Gurgaon. Office birthdays, farewells & team parties delivered on time.",
        pincode: "122002",
        landmarks: ["Cyber City Building 10", "DLF Cyber Hub", "Udyog Vihar Phase 1-5", "Ambiance Mall vicinity"],
        sla: "20-30 mins",
        highlights: [
          "Special bulk cakes, logo cakes & mini dessert boxes for corporate events",
          "Priority desk-side delivery to office towers"
        ],
        faqs: [
          { q: "Can you deliver directly to office floors in Cyber City?", a: "Yes, we coordinate with corporate desk receptions for seamless office celebrations." }
        ]
      }
    ]
  },
  noida: {
    citySlug: "noida",
    cityName: "Noida",
    title: "Cake Delivery in Noida & Greater Noida | Midnight Bakery | CakeUrban",
    metaDesc: "Order fresh cakes in Noida Sector 18, 62, 76, 137, Greater Noida & Gaur City. Express 30-min delivery, 100% eggless options and midnight celebration cakes.",
    description: "Noida's top-rated artisan bakery delivering across Sector 18 market, film city, residential sectors 50, 62, 75, 76, 128, 137, 150, Greater Noida West (Noida Extension), and Greater Noida Pari Chowk. Experience rich Belgian chocolate, blueberry cheesecakes, and custom birthday cakes delivered right on time.",
    areas: [
      {
        slug: "sector-18-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 18 & Atta Market",
        title: "Cake Shop in Sector 18 Noida | Midnight Cake Delivery",
        metaDesc: "Order birthday cakes near Sector 18 Noida market & DLF Mall. Express 30 min delivery & midnight cake orders available. Fresh & eggless.",
        pincode: "201301",
        landmarks: ["Sector 18 Metro Station", "DLF Mall of India", "Atta Market", "The Great India Place", "Radisson Blu Sector 18"],
        sla: "25-35 mins",
        highlights: [
          "Express dispatch from our Noida central kitchen hub",
          "Serving Sector 18 commercial and surrounding residential blocks (Sector 15, 16, 19, 27)",
          "Wide range of eggless chocolate fudge and fresh fruit cakes"
        ],
        faqs: [
          { q: "Is midnight delivery available in Sector 18 Noida?", a: "Yes, midnight slots are active every night with guaranteed delivery before 12:30 AM." }
        ]
      },
      {
        slug: "sector-62-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 62 & Electronic City",
        title: "Cake Delivery in Sector 62 Noida | IT Park & Residential",
        metaDesc: "Fast cake delivery in Sector 62 Noida. Perfect for office celebrations, birthdays & midnight parties. Order fresh cakes online.",
        pincode: "201309",
        landmarks: ["Noida Electronic City Metro", "Fortis Hospital Noida", "Institutional Area", "Totem Plaza Sector 62"],
        sla: "25-35 mins",
        highlights: [
          "Special corporate team celebration cake packages",
          "Delivering to all IT parks, colleges, and residential societies in Sector 62 & 63"
        ],
        faqs: [
          { q: "Do you deliver to corporate offices in Sector 62?", a: "Yes, we routinely deliver to office receptions and IT campuses with prior security clearance notes." }
        ]
      },
      {
        slug: "sector-76-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 74, 75, 76, 77, 78 & 79",
        title: "Cake Delivery in Noida Sector 76, 77, 78 & 79",
        metaDesc: "Order cakes in Noida Sector 76 high-rises. Amrapali, Supertech, Mahagun & Apex societies covered with 30 min express delivery.",
        pincode: "201304",
        landmarks: ["Sector 76 Metro Station", "Amrapali Silicon City", "Apex Florians", "Mahagun Moderne", "Spectrum Metro Mall Sector 75"],
        sla: "25-35 mins",
        highlights: [
          "Express society-gate delivery across Noida Expressway residential belt",
          "Freshly baked upon order confirmation — zero frozen storage"
        ],
        faqs: [
          { q: "How do deliveries work for gated high-rises in Sector 76?", a: "Our delivery partner brings the cake directly to your tower lobby or gate as per society rules." }
        ]
      },
      {
        slug: "sector-137-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 137 & Noida Expressway",
        title: "Cake Delivery in Sector 137 Noida Expressway | Midnight Bakery",
        metaDesc: "Order cakes in Sector 137, 128, 143 Noida Expressway. Paras Tierea, Purvanchal Royal Park & Jaypee Wish Town covered.",
        pincode: "201305",
        landmarks: ["Sector 137 Metro Station", "Paras Tierea", "Purvanchal Royal Park", "Felix Hospital", "Advant Navis Business Park"],
        sla: "30-40 mins",
        highlights: [
          "Direct express delivery to Jaypee Greens Wish Town & Sector 137 residential towers",
          "Guaranteed temperature-controlled delivery for fondant & cream cakes"
        ],
        faqs: [
          { q: "Do you deliver to Sector 137 societies at midnight?", a: "Yes, our midnight team delivers to all societies along Noida-Greater Noida Expressway." }
        ]
      },
      {
        slug: "noida-extension-gaur-city",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Gaur City & Noida Extension (Gr Noida West)",
        title: "Cake Delivery in Gaur City & Noida Extension (Gr Noida West)",
        metaDesc: "Fast cake delivery in Gaur City 1, Gaur City 2 & Noida Extension. Fresh birthday cakes, eggless options & midnight surprise delivery.",
        pincode: "201009",
        landmarks: ["Gaur City Mall", "Char Murti Chowk", "Gaur Saundaryam", "Supertech Eco Village", "Panchsheel Greens"],
        sla: "30-45 mins",
        highlights: [
          "Rapid delivery across Gaur City 1, Gaur City 2, Sector 1, 4, 10, 12, 16 Greater Noida West",
          "Special kids birthday cartoon theme cakes and smash cakes"
        ],
        faqs: [
          { q: "How fast is delivery to Gaur City societies?", a: "Orders are delivered in 30 to 45 minutes across all Greater Noida West sectors." }
        ]
      },
      {
        slug: "greater-noida-pari-chowk",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Greater Noida (Pari Chowk, Alpha, Beta, Gamma)",
        title: "Cake Delivery in Greater Noida (Pari Chowk, Alpha, Beta)",
        metaDesc: "Order fresh cakes in Greater Noida Alpha 1, Beta 1, Gamma, Delta & Pari Chowk. Express delivery and midnight celebration cakes.",
        pincode: "201308",
        landmarks: ["Pari Chowk", "Ansal Plaza Greater Noida", "Alpha 1 Metro", "Jaypee Greens Golf Course", "Gautam Buddha University"],
        sla: "35-50 mins",
        highlights: [
          "Serving all Alpha, Beta, Gamma, Delta, Omega and Knowledge Park sectors",
          "Student birthday combos and midnight surprise cakes"
        ],
        faqs: [
          { q: "Do you deliver to colleges and hostels in Greater Noida Knowledge Park?", a: "Yes, we deliver to student hostels, campus gates, and residential apartments." }
        ]
      }
    ]
  },
  delhi: {
    citySlug: "delhi",
    cityName: "Delhi",
    title: "Cake Delivery in Delhi | Midnight Bakery & Cake Shop | CakeUrban",
    metaDesc: "Order fresh birthday & anniversary cakes in Delhi. Serving Dwarka, Rohini, South Delhi, Lajpat Nagar, Saket, Connaught Place & more. Midnight delivery available.",
    description: "Delhi's premier artisan bakery serving South Delhi, West Delhi, Dwarka, Rohini, East Delhi, and Central Delhi. Enjoy authentic Belgian chocolate cakes, red velvet, and designer theme cakes with fast doorstep delivery.",
    areas: [
      {
        slug: "dwarka-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Dwarka (Sector 1 to 23)",
        title: "Cake Delivery in Dwarka Delhi (Sector 1 to 23) | CakeUrban",
        metaDesc: "Best cake shop in Dwarka Delhi. Order birthday cakes across Sector 6, 10, 12, 21 with midnight delivery and 30 min express service.",
        pincode: "110075",
        landmarks: ["Sector 10 Market", "Vegas Mall Dwarka", "Sector 21 Metro", "Sector 6 Central Market", "Sector 12 City Centre"],
        sla: "25-35 mins",
        highlights: [
          "Comprehensive coverage across all Dwarka sectors (1 through 23)",
          "Fresh fruit gateaux and Belgian chocolate truffle specialist",
          "Custom photo cakes printed with edible ink"
        ],
        faqs: [
          { q: "Do you deliver across all Dwarka sectors?", a: "Yes, we have dedicated delivery hubs ensuring fast delivery to every sector in Dwarka." }
        ]
      },
      {
        slug: "south-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "South Delhi (Saket, GK, Hauz Khas, Lajpat)",
        title: "Cake Delivery in South Delhi | Lajpat Nagar, Saket, Greater Kailash",
        metaDesc: "Gourmet cake delivery in South Delhi including GK 1-2, Saket, Lajpat Nagar, Defense Colony & Hauz Khas. Order designer birthday cakes with midnight delivery.",
        pincode: "110024",
        landmarks: ["Select Citywalk Saket", "Greater Kailash M-Block", "Lajpat Nagar Central Market", "Hauz Khas Village", "Defense Colony Flyover"],
        sla: "30-40 mins",
        highlights: [
          "Artisanal luxury cakes crafted for upscale South Delhi celebrations",
          "Same day and midnight delivery slots open daily"
        ],
        faqs: [
          { q: "Can you deliver midnight cakes in Greater Kailash?", a: "Yes! Midnight delivery is fully operational across GK 1, GK 2, and Saket." }
        ]
      },
      {
        slug: "rohini-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Rohini (Sector 1 to 24)",
        title: "Cake Delivery in Rohini Delhi (Sector 1 to 24) | Midnight Cake Shop",
        metaDesc: "Fast cake delivery in Rohini Delhi. Order birthday cakes, eggless truffle & midnight cakes in Rohini Sector 7, 8, 9, 11, 13, 15, 18, 24.",
        pincode: "110085",
        landmarks: ["Unity One Mall Rohini", "Sector 9 Market", "Rithala Metro Station", "Rohini West Metro", "Prashant Vihar"],
        sla: "30-40 mins",
        highlights: [
          "Full coverage of all Rohini residential sectors and DDA pockets",
          "Kids theme birthday cakes & eggless options"
        ],
        faqs: [
          { q: "Is midnight cake delivery available in Rohini?", a: "Yes, midnight orders are delivered across all sectors of Rohini." }
        ]
      },
      {
        slug: "connaught-place-central-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Connaught Place & Central Delhi",
        title: "Cake Delivery in Connaught Place (CP) & Central Delhi | CakeUrban",
        metaDesc: "Order cakes in Connaught Place, Karol Bagh, Paharganj & Rajendra Nagar. Corporate cake delivery and midnight celebration cakes.",
        pincode: "110001",
        landmarks: ["Inner Circle CP", "Rajiv Chowk Metro", "Barakhamba Road", "Janpath", "Karol Bagh Market"],
        sla: "25-35 mins",
        highlights: [
          "Corporate event cakes, restaurant delivery & celebration cakes in CP",
          "Quick dispatch across Central Delhi and Karol Bagh"
        ],
        faqs: [
          { q: "Can you deliver directly to a restaurant or lounge in CP?", a: "Yes, provide table details or contact person and we deliver directly to the venue." }
        ]
      },
      {
        slug: "janakpuri-west-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Janakpuri & West Delhi (Rajouri, Punjabi Bagh)",
        title: "Cake Delivery in Janakpuri & West Delhi | Rajouri Garden, Punjabi Bagh",
        metaDesc: "Fresh cake delivery in Janakpuri, Rajouri Garden, Punjabi Bagh & Paschim Vihar. Eggless cakes, designer birthday cakes & midnight surprise.",
        pincode: "110058",
        landmarks: ["Janakpuri District Centre", "Rajouri Garden Main Market", "Club Road Punjabi Bagh", "Tilak Nagar Metro"],
        sla: "30-40 mins",
        highlights: [
          "Covering Janakpuri Blocks A-D, Rajouri Garden, Paschim Vihar, and Tagore Garden",
          "Decadent chocolate truffle, red velvet, and customized fondant cakes"
        ],
        faqs: [
          { q: "Do you offer pure vegetarian eggless cakes in Janakpuri?", a: "Yes, 100% eggless cakes are baked with premium ingredients." }
        ]
      },
      {
        slug: "mayur-vihar-east-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Mayur Vihar & East Delhi (Laxmi Nagar, Preet Vihar)",
        title: "Cake Delivery in Mayur Vihar & East Delhi | Preet Vihar, Laxmi Nagar",
        metaDesc: "Order cakes in Mayur Vihar Phase 1, 2, 3, Preet Vihar & Laxmi Nagar. Express delivery & midnight birthday celebration cakes.",
        pincode: "110091",
        landmarks: ["Mayur Vihar Phase 1 Metro", "Star City Mall", "Preet Vihar Commercial Complex", "Akshardham vicinity"],
        sla: "30-40 mins",
        highlights: [
          "Fast delivery to Mayur Vihar Phase 1, 2, 3, Patparganj societies, and Preet Vihar",
          "Freshly baked pastries, cupcakes, and party cakes"
        ],
        faqs: [
          { q: "Is midnight cake delivery available in Mayur Vihar Phase 1?", a: "Yes, midnight delivery is operational every night in Mayur Vihar." }
        ]
      }
    ]
  },
  ghaziabad: {
    citySlug: "ghaziabad",
    cityName: "Ghaziabad",
    title: "Cake Delivery in Ghaziabad | Indirapuram, Vaishali & Raj Nagar",
    metaDesc: "Order fresh cakes in Ghaziabad. Indirapuram, Vaishali, Vasundhara, Kaushambi & Raj Nagar Extension covered. Express 30 min delivery and midnight celebration cakes.",
    description: "Ghaziabad's top bakery delivering across Indirapuram (Shipra Suncity, Nyaya Khand, Vaibhav Khand, Ahinsa Khand), Vaishali, Vasundhara, Kaushambi, Crossings Republik, and Raj Nagar Extension. Fresh ingredients, eggless options, and gorgeous designs.",
    areas: [
      {
        slug: "indirapuram-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Indirapuram (Ahinsa, Vaibhav, Nyaya Khand)",
        title: "Cake Shop & Delivery in Indirapuram Ghaziabad | Midnight Cakes",
        metaDesc: "Best cake delivery in Indirapuram Ghaziabad. Order birthday & anniversary cakes with 30 min express and midnight delivery. 100% eggless.",
        pincode: "201014",
        landmarks: ["Habitat Centre Indirapuram", "Shipra Mall", "Ahinsa Khand 1 & 2", "Vaibhav Khand", "Swarna Jayanti Park"],
        sla: "25-35 mins",
        highlights: [
          "Rapid dispatch covering Ahinsa Khand, Vaibhav Khand, and Nyaya Khand",
          "Specialized kids birthday theme cakes and anniversary tier cakes",
          "100% eggless guarantee with zero compromise on sponge fluffiness"
        ],
        faqs: [
          { q: "Do you deliver late night in Indirapuram?", a: "Yes, our midnight delivery team operates in Indirapuram until 12:30 AM every night." }
        ]
      },
      {
        slug: "vaishali-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Vaishali (Sector 1 to 6)",
        title: "Cake Delivery in Vaishali Ghaziabad | Sector 1 to 6",
        metaDesc: "Order fresh cakes in Vaishali Ghaziabad Sector 1, 2, 3, 4 & 5. Express delivery & midnight birthday cakes. Order online now.",
        pincode: "201010",
        landmarks: ["Vaishali Metro Station", "Mahagun Metro Mall", "Sector 4 Market", "Shopprix Mall Vaishali"],
        sla: "25-35 mins",
        highlights: [
          "Serving Vaishali sectors and nearby Anand Vihar border areas",
          "Freshly baked gourmet brownies, jar cakes, and celebration cakes"
        ],
        faqs: [
          { q: "Is same-day delivery available in Vaishali?", a: "Yes, same-day delivery is available in 30 minutes." }
        ]
      },
      {
        slug: "vasundhara-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Vasundhara (Sector 1 to 19)",
        title: "Cake Delivery in Vasundhara Ghaziabad | Midnight Cake Shop",
        metaDesc: "Order cakes in Vasundhara Ghaziabad Sector 1 to 19. Fast delivery, photo cakes, designer birthday cakes & midnight surprise.",
        pincode: "201012",
        landmarks: ["Vasundhara Sector 14", "Mewar Institute", "Sector 11 Market", "Olive County"],
        sla: "30-40 mins",
        highlights: [
          "Direct express delivery to all residential sectors in Vasundhara",
          "Freshly whipped cream cakes and rich chocolate fudge"
        ],
        faqs: [
          { q: "Can I order a custom photo cake in Vasundhara?", a: "Yes, upload your photo and we bake it with high-resolution edible sugar sheets." }
        ]
      },
      {
        slug: "raj-nagar-extension-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Raj Nagar & Raj Nagar Extension",
        title: "Cake Delivery in Raj Nagar Extension Ghaziabad | Bakery",
        metaDesc: "Fast cake delivery in Raj Nagar Extension high-rises & Raj Nagar Sector 1-14. Midnight surprise cakes and birthday combos.",
        pincode: "201017",
        landmarks: ["KDP Grand Savanna", "River Heights", "VVIP Addresses", "ALT Centre Raj Nagar"],
        sla: "30-45 mins",
        highlights: [
          "Serving all high-rise townships along NH-58 and Raj Nagar Extension",
          "Guaranteed fresh delivery with damage-proof packaging"
        ],
        faqs: [
          { q: "Do you deliver to high-rises in Raj Nagar Extension?", a: "Yes, our delivery partners coordinate with security gates for swift society deliveries." }
        ]
      },
      {
        slug: "crossings-republik-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Crossings Republik Ghaziabad",
        title: "Cake Delivery in Crossings Republik Ghaziabad | Midnight Cakes",
        metaDesc: "Order birthday cakes in Crossings Republik Ghaziabad. Supertech, Mahagun, Panchsheel & Paramount covered with express delivery.",
        pincode: "201016",
        landmarks: ["ABES Engineering College", "Crossings Plaza", "GH-7 Crossings", "Supertech Livingston"],
        sla: "30-45 mins",
        highlights: [
          "Express delivery to all GH-societies inside Crossings Republik township",
          "Midnight surprise birthday delivery available"
        ],
        faqs: [
          { q: "How fast is delivery to Crossings Republik?", a: "Standard delivery time is 30-40 minutes from order confirmation." }
        ]
      }
    ]
  }
};

/**
 * Universal Dynamic Area Resolver:
 * Accepts ANY slug (predefined OR programmatic like `sector-45-gurgaon`, `rohini-sector-15-delhi`, `dlf-phase-2-gurgaon`)
 * and returns rich, tailored AreaData so that no programmatic landing page ever returns 404!
 */
export function resolveAreaSlug(slug: string, intentKey = "standard"): AreaData {
  const cleanSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, "");
  
  // 1. Check if exact slug exists in predefined database
  for (const city of Object.values(DELHI_NCR_CITIES)) {
    const found = city.areas.find((a) => a.slug === cleanSlug);
    if (found) {
      return applyIntentToAreaData(found, intentKey);
    }
  }

  // 2. Dynamic slug decomposition & intelligent programmatic synthesis
  // Slugs follow patterns like:
  // "sector-15-faridabad", "dlf-phase-3-gurgaon", "sector-137-noida", "dwarka-sector-10-delhi", "indirapuram-ghaziabad"
  let cityName = "Delhi NCR";
  let citySlug = "delhi";
  let pincode = "110001";
  let sla = "30-45 mins";

  if (cleanSlug.includes("faridabad")) {
    cityName = "Faridabad";
    citySlug = "faridabad";
    pincode = "121001";
    sla = "30-40 mins";
  } else if (cleanSlug.includes("gurgaon") || cleanSlug.includes("gurugram")) {
    cityName = "Gurgaon";
    citySlug = "gurgaon";
    pincode = "122001";
    sla = "25-35 mins";
  } else if (cleanSlug.includes("noida") || cleanSlug.includes("greater-noida")) {
    cityName = "Noida";
    citySlug = "noida";
    pincode = "201301";
    sla = "30-40 mins";
  } else if (cleanSlug.includes("ghaziabad")) {
    cityName = "Ghaziabad";
    citySlug = "ghaziabad";
    pincode = "201001";
    sla = "30-45 mins";
  } else {
    cityName = "Delhi";
    citySlug = "delhi";
    pincode = "110001";
    sla = "30-45 mins";
  }

  // Formatted Area Name from slug
  // Strip city name suffix if present
  let rawArea = cleanSlug
    .replace(/-faridabad$/, "")
    .replace(/-gurgaon$/, "")
    .replace(/-gurugram$/, "")
    .replace(/-noida$/, "")
    .replace(/-ghaziabad$/, "")
    .replace(/-delhi$/, "");

  // Format words (e.g. "sector-45" -> "Sector 45", "dlf-phase-2" -> "DLF Phase 2")
  const areaWords = rawArea.split("-").map((w) => {
    if (w.toLowerCase() === "dlf") return "DLF";
    if (w.toLowerCase() === "nit") return "NIT";
    if (w.toLowerCase() === "gk") return "GK";
    if (w.toLowerCase() === "cp") return "CP";
    if (w.toLowerCase() === "it") return "IT";
    return w.charAt(0).toUpperCase() + w.slice(1);
  });
  const areaName = areaWords.join(" ");

  const intentConfig = SEO_INTENTS[intentKey] || SEO_INTENTS["standard"];

  const dynamicArea: AreaData = {
    slug: cleanSlug,
    cityName,
    citySlug,
    areaName,
    title: `${intentConfig.heading} ${areaName}, ${cityName} | Midnight Cake Shop`,
    metaDesc: `Best ${intentConfig.label.toLowerCase()} in ${areaName}, ${cityName}. 35-min express delivery & guaranteed midnight delivery. 100% fresh baked, eggless options & custom designs.`,
    pincode,
    landmarks: [`${areaName} Main Market`, `Central Road ${areaName}`, `Metro Station vicinity`],
    sla,
    highlights: [
      `30-45 minute express dispatch directly to ${areaName} homes & venues`,
      `Guaranteed midnight delivery between 11:00 PM and 12:30 AM 365 days a year`,
      `100% fresh baking on order confirmation — pure Belgian chocolate & high-quality cream`,
      `Free complimentary greeting card & party candles included with every cake`
    ],
    faqs: [
      {
        q: `Do you deliver cakes to ${areaName}, ${cityName} in 30-45 minutes?`,
        a: `Yes! Our local kitchen dispatch hub serves ${areaName} with express 30 to 45 minute doorstep delivery for birthdays and urgent celebrations.`
      },
      {
        q: `Can I order midnight cake delivery in ${areaName}?`,
        a: `Yes, guaranteed midnight surprise cake delivery is available across ${areaName}, ${cityName} between 11:00 PM and 12:30 AM.`
      },
      {
        q: `Are 100% eggless cakes available for delivery in ${areaName}?`,
        a: `Yes! Every cake on our menu is available in a 100% eggless vegetarian variant baked with pure dairy cream and natural ingredients.`
      },
      {
        q: `Can I customize a birthday or photo cake for ${areaName}?`,
        a: `Absolutely! You can upload high-resolution photos for edible sugar prints, request custom message pipings, and choose weights from 500g up to 5kg.`
      }
    ]
  };

  return applyIntentToAreaData(dynamicArea, intentKey);
}

function applyIntentToAreaData(base: AreaData, intentKey: string): AreaData {
  const intent = SEO_INTENTS[intentKey] || SEO_INTENTS["standard"];
  if (intentKey === "standard") {
    return {
      ...base,
      intent: "standard",
      intentBadge: intent.badge,
      intentTitle: `${base.areaName}, ${base.cityName}`
    };
  }

  return {
    ...base,
    title: `${intent.heading} ${base.areaName}, ${base.cityName} | CakeUrban`,
    metaDesc: `${intent.heading} in ${base.areaName}, ${base.cityName}. ${intent.desc} Order online with ${base.sla} express delivery & midnight slots.`,
    intent: intentKey,
    intentBadge: intent.badge,
    intentTitle: `${intent.label} in ${base.areaName}`
  };
}

export function getAllSeoAreas(): AreaData[] {
  const list: AreaData[] = [];
  Object.values(DELHI_NCR_CITIES).forEach((city) => {
    list.push(...city.areas);
  });
  return list;
}

export function getSeoAreaBySlug(slug: string, intentKey = "standard"): AreaData {
  return resolveAreaSlug(slug, intentKey);
}
