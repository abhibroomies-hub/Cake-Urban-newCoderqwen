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
}

export interface CityHubData {
  citySlug: string;
  cityName: string;
  title: string;
  metaDesc: string;
  description: string;
  areas: AreaData[];
}

export const DELHI_NCR_CITIES: Record<string, CityHubData> = {
  faridabad: {
    citySlug: "faridabad",
    cityName: "Faridabad",
    title: "Cake Delivery in Faridabad | Midnight Cake Shop & Bakery | CakeUrban",
    metaDesc: "Order fresh birthday cakes, designer cakes & midnight delivery in Faridabad. Serving Sector 15, 16, 21, NIT, Ballabgarh & all areas in 35-45 mins. 100% Eggless available.",
    description: "Faridabad's premier artisanal bakery and cake delivery service. From industrial hubs in Sector 24 to residential sectors like Sector 15, 16, 21, and Greater Faridabad, we deliver freshly baked Belgian chocolate, fruit gateaux, and custom celebration cakes with 35–45 minute express delivery.",
    areas: [
      {
        slug: "sector-15-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 15",
        title: "Cake Shop & Delivery in Sector 15 Faridabad | Midnight Delivery",
        metaDesc: "Best cake delivery in Sector 15 Faridabad. Order fresh birthday, anniversary & designer cakes with 35 mins express & midnight delivery. 100% eggless options.",
        pincode: "121007",
        landmarks: ["Near Sector 15 Main Market", "Opposite HDFC Bank", "Huda Ground"],
        sla: "30-40 mins",
        highlights: [
          "Free express delivery across Sector 15 & HUDA Market on orders above ₹999",
          "Special midnight surprise cake delivery available until midnight",
          "Custom photo cakes & designer fondant cakes baked fresh to order"
        ],
        faqs: [
          { q: "Do you offer midnight cake delivery in Sector 15 Faridabad?", a: "Yes! We provide guaranteed midnight cake delivery in Sector 15 between 11 PM and 12:30 AM." },
          { q: "Are all cakes 100% eggless in Sector 15?", a: "Yes, we offer both egg and 100% eggless variants for all our signature cakes without compromising on texture." },
          { q: "What is the average delivery time during daytime?", a: "Standard delivery to Sector 15 residential and market areas takes 30 to 45 minutes." }
        ]
      },
      {
        slug: "sector-16-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 16",
        title: "Birthday Cake Delivery in Sector 16 Faridabad | CakeUrban",
        metaDesc: "Order freshly baked cakes in Sector 16 Faridabad. Choose from chocolate truffle, red velvet, fruit chantilly with express doorstep delivery.",
        pincode: "121002",
        landmarks: ["Near Sector 16 Market", "Botanical Garden area", "Crown Interiorz vicinity"],
        sla: "35-45 mins",
        highlights: [
          "Delivering freshly baked artisanal cakes directly to Sector 16 homes",
          "Same-day and midnight slots open 365 days a year",
          "Complimentary birthday candles and greeting card with every order"
        ],
        faqs: [
          { q: "Can I customize a birthday cake for Sector 16 delivery?", a: "Absolutely! You can choose custom messages, sizes from 500g to 3kg, and cake flavors." }
        ]
      },
      {
        slug: "sector-21-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "Sector 21",
        title: "Cake Shop in Sector 21 Faridabad (21A & 21B) | CakeUrban",
        metaDesc: "Fast cake delivery in Sector 21A & 21B Faridabad. Premium designer cakes, anniversary specials & midnight delivery. Order now!",
        pincode: "121001",
        landmarks: ["Sector 21 Club", "Greenfields border", "Badkal Mor approach"],
        sla: "30-45 mins",
        highlights: [
          "Serving Sector 21A, 21B, 21C and surrounding residential societies",
          "Temperature-controlled delivery vans ensuring pristine cake structure"
        ],
        faqs: [
          { q: "Is late night delivery available in Sector 21?", a: "Yes, midnight orders can be placed up to 8 PM for midnight delivery slots." }
        ]
      },
      {
        slug: "nit-faridabad",
        cityName: "Faridabad",
        citySlug: "faridabad",
        areaName: "NIT Faridabad",
        title: "Cake Delivery in NIT Faridabad (1, 2, 3, 5) | CakeUrban",
        metaDesc: "Order birthday & wedding cakes in NIT Faridabad. Fast local delivery across NIT 1, 2, 3 & 5 markets. Fresh & eggless cakes available.",
        pincode: "121001",
        landmarks: ["Neelam Chowk", "Bata Chowk", "NIT Market No. 1 & 5"],
        sla: "35-50 mins",
        highlights: [
          "Serving all NIT blocks with dedicated local delivery riders",
          "Affordable celebration combos with flowers and balloons"
        ],
        faqs: [
          { q: "Do you deliver near Neelam Chowk?", a: "Yes, Neelam Chowk and Bata Chowk areas have express 35-minute delivery windows." }
        ]
      }
    ]
  },
  gurgaon: {
    citySlug: "gurgaon",
    cityName: "Gurgaon",
    title: "Cake Delivery in Gurgaon | Midnight Cake Shop & Bakery | CakeUrban",
    metaDesc: "Best cake shop in Gurgaon. Order birthday cakes in DLF Phase, Golf Course Road, Sector 14, 29, 56 & Sohna Road. 30 mins delivery & midnight specials.",
    description: "Gurgaon's favorite premium cake delivery service. From corporate hubs in Cyber City and Udyog Vihar to residential hubs in DLF Phase 1-5, Golf Course Extension, and Sohna Road, we craft artisanal Belgian chocolates, fruit tarts, and customized tiered celebration cakes.",
    areas: [
      {
        slug: "dlf-phase-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "DLF Phase 1-5",
        title: "Cake Delivery in DLF Phase Gurgaon | Midnight Cake Shop",
        metaDesc: "Premium cake shop in DLF Phase 1, 2, 3, 4 & 5 Gurgaon. Order gourmet cakes with midnight delivery and express 30 min doorstep service.",
        pincode: "122002",
        landmarks: ["Cyber Hub", "Galleria Market", "Mega Mall vicinity"],
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
        areaName: "Golf Course Road",
        title: "Cake Shop on Golf Course Road Gurgaon | CakeUrban",
        metaDesc: "Order designer birthday & anniversary cakes on Golf Course Road Gurgaon. Fast delivery to Aralias, Magnolias & all luxury societies.",
        pincode: "122003",
        landmarks: ["Sector 42/53 Rapid Metro", "The Aralias", "Golf Course Extn Road"],
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
        slug: "sector-29-gurgaon",
        cityName: "Gurgaon",
        citySlug: "gurgaon",
        areaName: "Sector 29",
        title: "Birthday & Party Cake Delivery in Sector 29 Gurgaon",
        metaDesc: "Fast cake delivery near Sector 29 leisure valley Gurgaon. Perfect for birthday parties, midnight celebrations and corporate events.",
        pincode: "122001",
        landmarks: ["Leisure Valley Park", "Sector 29 Market", "Kingdom of Dreams vicinity"],
        sla: "25-35 mins",
        highlights: [
          "Serving restaurants, party venues, and hotels in Sector 29",
          "Late night emergency party cake delivery available"
        ],
        faqs: [
          { q: "Can you deliver directly to a restaurant in Sector 29?", a: "Yes, provide the venue name, table booking details or receiver phone number and we will deliver right to the venue." }
        ]
      }
    ]
  },
  noida: {
    citySlug: "noida",
    cityName: "Noida",
    title: "Cake Delivery in Noida | Midnight Cake Shop & Bakery | CakeUrban",
    metaDesc: "Order fresh cakes in Noida Sector 18, 62, 76, Greater Noida West. Express 30-min delivery, 100% eggless options and midnight celebration cakes.",
    description: "Noida's top-rated artisan bakery delivering across Sector 18 market, film city, residential sectors 50, 62, 76, 137, and Greater Noida West. Experience rich Belgian chocolate, blueberry cheesecakes, and custom birthday cakes delivered right on time.",
    areas: [
      {
        slug: "sector-18-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 18",
        title: "Cake Shop in Sector 18 Noida | Midnight Cake Delivery",
        metaDesc: "Order birthday cakes near Sector 18 Noida market & DLF Mall. Express 30 min delivery & midnight cake orders available. Fresh & eggless.",
        pincode: "201301",
        landmarks: ["Sector 18 Metro Station", "DLF Mall of India vicinity", "Atta Market"],
        sla: "25-35 mins",
        highlights: [
          "Express dispatch from our Noida central kitchen hub",
          "Serving Sector 18 commercial and surrounding residential blocks",
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
        areaName: "Sector 62",
        title: "Cake Delivery in Sector 62 Noida | IT Park & Residential",
        metaDesc: "Fast cake delivery in Sector 62 Noida. Perfect for office celebrations, birthdays & midnight parties. Order fresh cakes online.",
        pincode: "201309",
        landmarks: ["Electronic City Metro", "Fortis Hospital", "Institutional Area"],
        sla: "30-40 mins",
        highlights: [
          "Special corporate team celebration cake packages",
          "Delivering to all IT parks, colleges, and residential societies in Sector 62"
        ],
        faqs: [
          { q: "Do you deliver to corporate offices in Sector 62?", a: "Yes, we routinely deliver to office receptions and IT campuses with prior security clearance notes." }
        ]
      },
      {
        slug: "sector-76-noida",
        cityName: "Noida",
        citySlug: "noida",
        areaName: "Sector 76",
        title: "Cake Delivery in Noida Sector 76, 77, 78 & 79",
        metaDesc: "Order cakes in Noida Sector 76 high-rises. Amrapali, Supertech & Apex societies covered with 35 min express delivery.",
        pincode: "201304",
        landmarks: ["Sector 76 Metro Station", "Amrapali Silicon City", "Apex Florians"],
        sla: "30-45 mins",
        highlights: [
          "Express society-gate delivery across Noida Expressway residential belt",
          "Freshly baked upon order confirmation — zero frozen storage"
        ],
        faqs: [
          { q: "How do deliveries work for gated high-rises in Sector 76?", a: "Our delivery partner brings the cake directly to your tower lobby or gate as per society rules." }
        ]
      }
    ]
  },
  delhi: {
    citySlug: "delhi",
    cityName: "Delhi",
    title: "Cake Delivery in Delhi | Midnight Bakery & Cake Shop | CakeUrban",
    metaDesc: "Order fresh birthday & anniversary cakes in Delhi. Serving Dwarka, Rohini, South Delhi, Lajpat Nagar, Connaught Place & more. Midnight delivery available.",
    description: "Delhi's premier artisan bakery serving South Delhi, West Delhi, Dwarka, Rohini, and Central Delhi. Enjoy authentic Belgian chocolate cakes, red velvet, and designer theme cakes with fast doorstep delivery.",
    areas: [
      {
        slug: "dwarka-delhi",
        cityName: "Delhi",
        citySlug: "delhi",
        areaName: "Dwarka",
        title: "Cake Delivery in Dwarka Delhi (Sector 1 to 23) | CakeUrban",
        metaDesc: "Best cake shop in Dwarka Delhi. Order birthday cakes across Sector 6, 10, 12, 21 with midnight delivery and 35 min express service.",
        pincode: "110075",
        landmarks: ["Sector 10 Market", "Vegas Mall vicinity", "Sector 21 Metro Station"],
        sla: "30-40 mins",
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
        areaName: "South Delhi (Lajpat, Saket, GK)",
        title: "Cake Delivery in South Delhi | Lajpat Nagar, Saket, Greater Kailash",
        metaDesc: "Gourmet cake delivery in South Delhi including GK, Saket, Lajpat Nagar & Hauz Khas. Order designer birthday cakes with midnight delivery.",
        pincode: "110024",
        landmarks: ["Select Citywalk Saket", "Greater Kailash M-Block", "Lajpat Nagar Central Market"],
        sla: "35-45 mins",
        highlights: [
          "Artisanal luxury cakes crafted for upscale South Delhi celebrations",
          "Same day and midnight delivery slots open daily"
        ],
        faqs: [
          { q: "Can you deliver midnight cakes in Greater Kailash?", a: "Yes! Midnight delivery is fully operational across GK 1 & GK 2." }
        ]
      }
    ]
  },
  ghaziabad: {
    citySlug: "ghaziabad",
    cityName: "Ghaziabad",
    title: "Cake Delivery in Ghaziabad | Indirapuram, Vaishali & Raj Nagar",
    metaDesc: "Order fresh cakes in Ghaziabad. Indirapuram, Vaishali, Kaushambi & Raj Nagar Extension covered. Express 35 min delivery and midnight celebration cakes.",
    description: "Ghaziabad's top bakery delivering across Indirapuram (Shipra Suncity, Nyaya Khand), Vaishali, Kaushambi, and Raj Nagar Extension. Fresh ingredients, eggless options, and gorgeous designs.",
    areas: [
      {
        slug: "indirapuram-ghaziabad",
        cityName: "Ghaziabad",
        citySlug: "ghaziabad",
        areaName: "Indirapuram",
        title: "Cake Shop & Delivery in Indirapuram Ghaziabad | Midnight Cakes",
        metaDesc: "Best cake delivery in Indirapuram Ghaziabad. Order birthday & anniversary cakes with 30 min express and midnight delivery. 100% eggless.",
        pincode: "201014",
        landmarks: ["Habitat Centre Indirapuram", "Shipra Mall vicinity", "Ahinsa Khand"],
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
        areaName: "Vaishali",
        title: "Cake Delivery in Vaishali Ghaziabad | Sector 1 to 6",
        metaDesc: "Order fresh cakes in Vaishali Ghaziabad Sector 1, 2, 3, 4 & 5. Express delivery & midnight birthday cakes. Order online now.",
        pincode: "201010",
        landmarks: ["Vaishali Metro Station", "Mahagun Metro Mall", "Sector 4 Market"],
        sla: "30-40 mins",
        highlights: [
          "Serving Vaishali sectors and nearby Anand Vihar border areas",
          "Freshly baked gourmet brownies, jar cakes, and celebration cakes"
        ],
        faqs: [
          { q: "Is same-day delivery free in Vaishali?", a: "Standard delivery is free on orders above ₹999." }
        ]
      }
    ]
  }
};

export function getAllSeoAreas(): AreaData[] {
  const list: AreaData[] = [];
  Object.values(DELHI_NCR_CITIES).forEach((city) => {
    list.push(...city.areas);
  });
  return list;
}

export function getSeoAreaBySlug(slug: string): AreaData | undefined {
  for (const city of Object.values(DELHI_NCR_CITIES)) {
    const found = city.areas.find((a) => a.slug === slug);
    if (found) return found;
  }
  return undefined;
}
