const bcrypt = require('bcryptjs');
const { User, Product, Rental, MaintenanceRequest } = require('../config/db');

// List of cities and common tenure options
const cities = ['New York', 'San Francisco', 'Los Angeles', 'Chicago'];
const tenureOptions = [3, 6, 12, 24];

// Furniture Categories Data
const furnitureTemplates = [
  {
    type: 'Sofa',
    titles: [
      'Nordic Chester Fabric Sofa', 'Hampton Tufted Leather Sectional', 'Milan Velvet Loveseat', 
      'Pacific Powered Reclining Sofa', 'Brooklyn Daybed Sleeper', 'Scandinavia Modular Couch',
      'Minimalist Woven Linen Sofa', 'Italian Full-Grain Leather Couch', 'Convertible Futon Sleeper',
      'Harbor Slouchy Lounge Sofa', 'Madison Ergonomic Accent Sofa', 'Vista Velvet L-Shape Sectional',
      'Urban Studio Compact Loveseat'
    ],
    descriptions: [
      'Luxurious tufted back cushions with premium high-density memory foam for deep relaxation. Solid oak legs.',
      'L-shaped top-grain leather sectional with built-in USB charging ports and modular seating configuration.',
      'Elegantly tailored velvet upholstery with gold-plated metal legs. Perfect for modern luxury living rooms.',
      'Electric power recliner with independent back and headrest controls. Plush padding and cup holders.',
      'Sleek multi-functional daybed with pull-out trundle bed. Ideal for small apartments or guest rooms.',
      'Modular sofa pieces that allow you to customize your seating layout. Stain-resistant smart fabric.',
      'Clean lines and textured weave linen fabric. Natural wood frame with supportive spring suspension.',
      'Handcrafted using premium Italian full-grain hide. Develops a beautiful vintage patina over time.',
      'Easy click-clack mechanism converts from a comfortable sofa to a flat guest bed in seconds.',
      'Extra deep seats and plush feather-blend cushions for ultimate sink-in comfort. Removable covers.',
      'Features high-performance contour lumbar support and breathable fabric for long seating comfort.',
      'A massive 5-seater corner sectional upholstered in velvet, bringing class and comfort to larger spaces.',
      'Space-saving 2-seater couch with retro wooden legs and button-tufted detail. Perfect for studio layouts.'
    ],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 25, rentMax: 85
  },
  {
    type: 'Bed',
    titles: [
      'Orthopedic Queen Platform Bed', 'Upholstered Tufted King Bed Frame', 'Solomon Solid Walnut Bed Frame',
      'Hygge Japandi Canopy Bed Frame', 'Astoria Storage Drawer Bed Frame', 'Helix Memory Foam Bed Set',
      'Cascade Floating Bed Frame', 'Richmond Wingback Bed Frame', 'Nirvana Bamboo Platform Bed',
      'Sovereign Velvet Tufted Bed', 'Metro Twin Studio Trundle Bed', 'Loft Industrial Metal Bed Frame',
      'Zen Solid Oak Platform Bed Frame'
    ],
    descriptions: [
      'Premium queen bed frame with wood slats, including a multi-layer orthopaedic memory foam mattress.',
      'Chic king size headboard upholstered in durable woven fabric with deep button diamond tufting.',
      'Minimalist platform bed frame made of solid American walnut wood. No box spring required.',
      'Clean silhouette combining Japanese and Scandinavian aesthetics. Natural ash wood finish.',
      'Under-bed storage drawers on smooth roller wheels. Ideal for maximizing bedroom storage.',
      'Includes premium hybrid pocket spring mattress and wood frame. Breathable cooling top gel layer.',
      'Concealed supports create a stunning floating look. Headboard features warm warm LED lighting.',
      'Classic high wingback headboard with linen finish, adding structural drama and elegance.',
      'Eco-friendly solid bamboo design with sturdy low profile. Sleek natural varnished look.',
      'Opulent plush velvet upholstered frame with vertical channel tufting. Sturdy steel center supports.',
      'Convertible twin bed with pull-out second trundle mattress. Ideal for kids rooms or guests.',
      'Matte black iron framework combined with rustic reclaimed wood panels. Sturdy non-noise design.',
      'Japanese style low platform bed crafted from Japanese white oak. Promotes airflow and Zen vibes.'
    ],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 35, rentMax: 95
  },
  {
    type: 'Table',
    titles: [
      'Minimalist Walnut Dining Table', 'Carrara Marble Round Dining Table', 'Urban Reclaimed Wood Desk',
      'Nesting Coffee Tables (Set of 3)', 'Solid Oak Executive Desk', 'Aero Glass Console Table',
      'Japandi Live-Edge Dining Table', 'Metro Height-Adjustable Standing Desk', 'Vibe Concrete Coffee Table',
      'Nordic Extendable Dining Table', 'Chelsea Walnut Writing Desk', 'Lumina LED Gaming Desk',
      'Summit Slate Top Pub Table'
    ],
    descriptions: [
      'Beautiful walnut veneer dining table that comfortably seats 6. Sturdy flared wooden legs.',
      'Stunning natural Italian Carrara marble tabletop supported by a heavy matte black metal pedestal.',
      'Sleek industrial study desk crafted from solid reclaimed pine and durable steel supports.',
      'Trio of circular nesting tables in walnut, brass, and black steel finishes. Space-saving storage.',
      'Spacious double-pedestal desk with deep filing drawers and integrated cable management cutouts.',
      'Tempered glass top console table with geometric gold-finished frame. Perfect for entryways.',
      'Features a unique natural live-edge top from sustainably harvested oak wood. Heavy iron U-legs.',
      'Electric motorized lift with programmable presets. Quiet double motor adjustment.',
      'Hand-cast concrete slab top with a modern minimalist base. Weatherproof for indoor/outdoor use.',
      'Extends easily from 4-seater to 8-seater. Built-in extension leaves slide smoothly.',
      'Mid-century writing desk featuring three storage drawers with modern gold hardware.',
      'Carbon fiber textured surface, built-in cup holder, headphone hook, and app-controlled RGB lights.',
      'Counter-height pub table with circular slate tile inlay. Perfect for home bars or breakfast nooks.'
    ],
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 15, rentMax: 60
  },
  {
    type: 'Chair',
    titles: [
      'Ergonomic Mesh Office Task Chair', 'Premium Leather Accent Lounge Chair', 'Nordic Wishbone Dining Chairs (Set of 2)',
      'Pacific Velvet Vanity Swivel Chair', 'Eames-Style Lounge Chair & Ottoman', 'Urban Industrial Metal Barstools (Set of 2)',
      'Harbor Outdoor Wicker Armchair', 'Madison Boucle Accent Chair', 'Matrix High-Back Gaming Throne',
      'Chic Rattan Hanging Egg Chair', 'Sleek Cantilever Leather Dining Chairs', 'Solomon Velvet Bar Stools (Set of 2)',
      'Hygge Sheepskin Lounge Chair'
    ],
    descriptions: [
      'Ergonomic office chair featuring mesh backing, adjustable 3D armrests, and dynamic lumbar support.',
      'Mid-century accent lounge chair in rich caramel top-grain leather with walnut wood frame.',
      'Classic mid-century wishbone chairs with hand-woven paper cord seats and solid beechwood frames.',
      'Elegant vanity chair upholstered in velvet with 360-degree rotation and height adjustment.',
      'Faithful replica featuring premium molded plywood shells and soft aniline leather cushions.',
      'Industrial counter height stools with distressed wood seats and sturdy matte black iron frames.',
      'Weather-resistant synthetic wicker with thick cream-colored quick-dry foam cushions.',
      'Cozy, textured boucle fabric chair with deep seat and circular wood base. Modern design.',
      'Ergonomic gaming chair with memory foam neck pillow, lumbar support, and 180-degree recline.',
      'Bohemian style hanging pod chair with stand, thick weather-proof cushions, and safety strap.',
      'Features a flexible chrome-plated steel frame and padded black faux-leather seats.',
      'Plush velvet upholstery with gold-painted metal frame and comfortable integrated footrests.',
      'Ultra soft Icelandic sheepskin lining on a minimalist black powder-coated steel frame.'
    ],
    images: [
      'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507504038482-76210f6ecdd6?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 10, rentMax: 70
  }
];

// Appliances Categories Data
const applianceTemplates = [
  {
    type: 'Fridge',
    titles: [
      'Samsung Double Door Refrigerator (320L)', 'LG French Door Smart Fridge (580L)', 'Whirlpool Single Door Refrigerator (190L)',
      'Bosch No-Frost Bottom Freezer Refrigerator', 'Haier Convertible Side-by-Side Refrigerator', 'Retro Compact Mini Refrigerator (90L)',
      'Hitachi Multi-Door Smart Inverter Fridge', 'Panasonic Inverter Frost-Free Refrigerator', 'Smeg Style Aesthetic Refrigerator',
      'Samsung Bespoke Multi-Door Refrigerator', 'LG InstaView Door-in-Door Refrigerator', 'Whirlpool Intellifresh Convertible Fridge',
      'Hisense French Door Refrigerator with Ice Maker'
    ],
    descriptions: [
      'Convertible 5-in-1 digital inverter refrigerator. Energy efficient, silent, and smart cooling tech.',
      'Sleek French door configuration with Wi-Fi enabled ThinQ control and premium built-in water dispenser.',
      'Compact single door fridge featuring Direct Cool technology and spacious vegetable crisper drawers.',
      'High-performance bottom mount freezer with VitaFresh humidity control drawers to keep food fresh longer.',
      'Convertible zone allows switching between fridge and freezer space as needed. Twin turbo cooling.',
      'Vintage retro design with chrome handle. Ideal for bedrooms, game rooms, or small offices.',
      'Premium multi-door design with auto ice maker, vacuum compartment, and eco monitoring systems.',
      'Double control cooling sensors with AG Clean antibacterial filter to eliminate bad odors.',
      'Iconic 1950s retro aesthetic combined with modern frost-free cooling and energy saving ratings.',
      'Customizable color panels and modular design. Intelligent triple cooling system for optimal freshness.',
      'Knock twice on the sleek glass panel to see inside without opening the door. Reduces cold air loss.',
      'Intelligent sensors adjust cooling based on internal load and ambient weather. Convertible freezer.',
      'Features external water dispenser, automatic icemaker, and fingerprint-resistant stainless steel finish.'
    ],
    images: [
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571175432290-ef02471960d3?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 20, rentMax: 110
  },
  {
    type: 'Washer',
    titles: [
      'LG Front-Load Inverter Washer (8kg)', 'Samsung Fully Automatic Top-Load Washer', 'IFB Front-Load Smart Washer & Dryer',
      'Bosch Fully Automatic Front-Load Washing Machine', 'Whirlpool Semi-Automatic Twin Tub Washer', 'Panasonic Smart Inverter Top-Load Washer',
      'Haier Direct Motion Motor Front-Load Washer', 'Miele Premium Eco Front-Load Washing Machine', 'LG Smart AI Direct Drive Washer (10.5kg)',
      'Samsung EcoBubble Front-Load Washer (9kg)', 'Whirlpool 360 Bloomwash Pro Top-Load Washer', 'Maytag Commercial Grade Front-Load Washer',
      'Electrolux UltimateCare Washer & Dryer Combo'
    ],
    descriptions: [
      'Quiet direct drive motor with AI fabric sensors. Steam allergen wash cycle and smartphone app controls.',
      'Wobble technology provides gentle fabric care. Magic filter collects lint, fluff, and particles.',
      'Full cycle washer and dryer combo with active oxygen refresh and express 15-minute quick wash.',
      'EcoSilence Drive motor delivers silent operation. Anti-Vibration side walls minimize shaking.',
      'High capacity twin tub semi-automatic washer with powerful scrubbing pulsator and rapid spin dryer.',
      'Equipped with active foam system and built-in water heater for stain removal and sanitizing.',
      'Direct motion motor connected directly to the drum, reducing noise, vibration, and energy usage.',
      'Engineered in Germany. Patented honeycomb drum protects fabrics. Smart load-sensing tech.',
      'TurboWash technology cleans clothes in under 39 minutes. Deep learning fabric protection.',
      'EcoBubble tech turns detergent into bubbles to penetrate fabric quickly and wash effectively in cold water.',
      'Heats water to kill 99.9% of bacteria. Hexa Bloom impeller ensures thorough wash with low friction.',
      'Commercial grade components built to last. Powerful wash cycles for heavily soiled laundry.',
      'SensorWash auto-detects soil levels to customize cycle. Condenser drying requires no external venting.'
    ],
    images: [
      'https://images.unsplash.com/photo-1610557892470-76d88819936f?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 18, rentMax: 75
  },
  {
    type: 'TV',
    titles: [
      'Sony Bravia 4K UHD Smart TV (55")', 'Samsung QLED 4K Smart TV (65")', 'LG OLED Evo 4K Cinema TV (55")',
      'OnePlus Smart Android LED TV (43")', 'TCL QLED 4K Google TV (50")', 'Xiaomi Mi Smart LED TV (32")',
      'Sony Bravia XR OLED TV (65")', 'Samsung Neo QLED 8K Smart TV (75")', 'LG Ultra Large UHD TV (75")',
      'Vizio MQX Series 120Hz Gaming TV (50")', 'Hisense ULED 4K Smart Google TV (65")', 'Philips Ambilight 4K Smart TV (55")',
      'Sony Soundbar & Wireless Subwoofer System'
    ],
    descriptions: [
      'Cinematic HDR processor X1. Google TV integration, immersive Dolby Vision, and low latency input.',
      'Quantum Processor 4K upscaling. Dual LED backlight technology and built-in Alexa/Google Assistant.',
      'Self-lit OLED pixels deliver infinite contrast and perfect blacks. Ultimate gaming and cinema screen.',
      'Bezel-less design with Dolby Audio. Android TV platform with access to all streaming apps.',
      'Hands-free voice control Google TV with HDR10+ and Dolby Atmos audio. Wide color gamut.',
      'Perfect budget friendly HD smart TV. PatchWall interface with Android TV and Google Assistant.',
      'Cognitive Processor XR mimics human sight and sound. Acoustic Surface Audio+ turns screen into speaker.',
      'Stunning 8K resolution with Quantum Mini LEDs. Quantum HDR 64x for extreme detailing.',
      'Massive cinematic screen with active HDR, webOS smart platform, and AI Sound upmixing.',
      'Built for gaming. Supports 120Hz refresh rate, AMD FreeSync Premium, and ultra low input lag.',
      'Mini-LED technology combined with Quantum Dot color. Dolby Vision IQ and filmmaker mode.',
      'Intelligent LEDs behind the screen project on-screen colors onto the wall in real-time. Immersive design.',
      '300W total output with Dolby Digital surround sound. Bluetooth connectivity and HDMI ARC setup.'
    ],
    images: [
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 15, rentMax: 120
  },
  {
    type: 'Climate',
    titles: [
      'Dyson Pure Cool Air Purifier & Fan', 'LG Dual Inverter Split Air Conditioner (1.5 Ton)', 'Xiaomi Smart Air Purifier 4',
      'Havells High-Speed Tower Air Cooler', 'Voltas Adjustable Split Air Conditioner (1.0 Ton)', 'Honeywell HEPA Air Purifier',
      'Carrier Hybrid Inverter 5-Star Split AC', 'Philips Air Purifier with NanoProtect HEPA', 'Dyson Hot+Cool Jet Focus Fan Heater',
      'Blue Star Portable Inverter Air Conditioner', 'Coway Professional Air Purifier', 'Lasko High-Velocity Oscillating Tower Fan',
      'DeLonghi Dehumidifier & Air Purifier Combo'
    ],
    descriptions: [
      'Intelligent cooling tower fan with glass HEPA filter capture system. Real-time air quality reports.',
      'Fast cooling dual rotary compressor with energy-saving active control and antibacterial filters.',
      'High-efficiency filter cleans a 400 sq ft room in 15 mins. Quiet operation with smart app control.',
      'High-speed air delivery tower cooler with wood-wool cooling pads and large water tank capacity.',
      'Adjustable tonnage modes run AC at different capacities based on heat load. Silent sleep mode.',
      'Premium HEPA filter captures 99.97% of microscopic allergens. Quiet Clean air delivery.',
      'Instantly cools in high ambient temperatures. PM 2.5 filter ensures clean air intake.',
      'Nanoprotect HEPA filter captures ultra-fine particles. Real-time feedback ring displays quality.',
      'Heats room quickly in winter, cools you in summer. Intelligent thermostat control.',
      'Portable AC on wheels. No permanent installation required. Dehumidifying function.',
      'Multi-stage filtration with green anti-flu HEPA filter. Extremely quiet and energy-saving.',
      'Powerful air velocity with wide oscillation. Remote control operation and timer settings.',
      'Removes excess moisture from the air while purifying it using an active carbon filter.'
    ],
    images: [
      'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80'
    ],
    rentMin: 12, rentMax: 65
  }
];

async function seed() {
  console.log('🌱 Starting database seeding on Supabase...');
  
  try {
    // 1. Clear existing data
    console.log('🗑️ Clearing existing database collections...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Rental.deleteMany({});
    await MaintenanceRequest.deleteMany({});

    // 2. Create standard hashed passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const vendorPassword = await bcrypt.hash('vendor123', salt);
    const userPassword = await bcrypt.hash('user123', salt);

    // 3. Define Users
    const adminUser = {
      _id: 'usr_admin01',
      name: 'Sarah Jenkins',
      email: 'admin@rentease.com',
      password: adminPassword,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      address: 'Suite 400, RentEase Headquarters, NYC',
      createdAt: new Date().toISOString()
    };

    const vendorUser = {
      _id: 'usr_vendor01',
      name: 'IKEA Distribution Corp',
      email: 'vendor@rentease.com',
      password: vendorPassword,
      role: 'vendor',
      phone: '+1 (555) 384-9210',
      address: '77 Logistics Blvd, Newark, NJ',
      createdAt: new Date().toISOString()
    };

    const regularUser = {
      _id: 'usr_customer01',
      name: 'John Doe',
      email: 'user@rentease.com',
      password: userPassword,
      role: 'user',
      phone: '+1 (555) 728-1934',
      address: 'Apartment 4B, 120 W 81st St, New York, NY 10024',
      createdAt: new Date().toISOString()
    };

    console.log('👤 Creating default users...');
    await User.create(adminUser);
    await User.create(vendorUser);
    await User.create(regularUser);

    console.log('✅ Created default users.');

    // 4. Generate 104 Premium Products
    const products = [];

    // Helper to distribute items across cities and stock
    let cityIndex = 0;

    // Generate 52 Furniture products (13 of each sub-type: Sofa, Bed, Table, Chair)
    furnitureTemplates.forEach((subCat) => {
      for (let i = 0; i < 13; i++) {
        const title = subCat.titles[i];
        const description = subCat.descriptions[i];
        
        // Calculate random but deterministic rent/deposit within range
        const monthlyRent = Math.floor(subCat.rentMin + ((subCat.rentMax - subCat.rentMin) / 12) * i);
        const securityDeposit = monthlyRent * 3;
        
        // Select image by rotating
        const imgUrl = subCat.images[i % subCat.images.length];
        
        const city = cities[cityIndex % cities.length];
        cityIndex++;
        
        products.push({
          _id: `prod_fur_${subCat.type.toLowerCase()}_${i + 1}`,
          title,
          category: 'furniture',
          description,
          monthlyRent,
          securityDeposit,
          images: [imgUrl],
          tenureOptions: tenureOptions,
          stock: Math.floor(4 + (i % 8)), // stock between 4 and 11
          city,
          availability: true,
          vendorId: 'usr_vendor01',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString() // scattered creation dates
        });
      }
    });

    // Generate 52 Appliance products (13 of each sub-type: Fridge, Washer, TV, Climate)
    applianceTemplates.forEach((subCat) => {
      for (let i = 0; i < 13; i++) {
        const title = subCat.titles[i];
        const description = subCat.descriptions[i];
        
        // Calculate random but deterministic rent/deposit within range
        const monthlyRent = Math.floor(subCat.rentMin + ((subCat.rentMax - subCat.rentMin) / 12) * i);
        const securityDeposit = monthlyRent * 3;
        
        // Select image by rotating
        const imgUrl = subCat.images[i % subCat.images.length];
        
        const city = cities[cityIndex % cities.length];
        cityIndex++;
        
        products.push({
          _id: `prod_app_${subCat.type.toLowerCase()}_${i + 1}`,
          title,
          category: 'appliances',
          description,
          monthlyRent,
          securityDeposit,
          images: [imgUrl],
          tenureOptions: tenureOptions,
          stock: Math.floor(3 + (i % 10)), // stock between 3 and 12
          city,
          availability: true,
          vendorId: 'usr_vendor01',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });

    console.log(`📦 Seeding ${products.length} premium products into Supabase...`);
    for (const product of products) {
      await Product.create(product);
    }
    
    console.log(`✅ Loaded ${products.length} default furniture & appliances into catalog.`);
    console.log(`🎉 Database seeding finished successfully!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
