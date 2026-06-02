const bcrypt = require('bcryptjs');
const { User, Product, Rental, MaintenanceRequest } = require('../config/db');

async function seed() {
  console.log('🌱 Starting database seeding...');
  
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

    console.log('✅ Created default users:');
    console.log('   - Admin: admin@rentease.com (admin123)');
    console.log('   - Vendor: vendor@rentease.com (vendor123)');
    console.log('   - Customer: user@rentease.com (user123)');

    // 4. Define Products
    const sampleProducts = [
      // --- FURNITURE ---
      {
        _id: 'prod_fur01',
        title: 'Nordic 3-Seater Fabric Sofa',
        category: 'furniture',
        description: 'Impeccably tailored Grey Linen couch with solid oak wood legs. Highly comfortable premium high-density memory foam cushions, perfect for modern living spaces.',
        monthlyRent: 45,
        securityDeposit: 150,
        images: [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12, 24],
        stock: 8,
        city: 'New York',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_fur02',
        title: 'Minimalist Dining Set (4-Seater)',
        category: 'furniture',
        description: 'Mid-century modern round walnut wood dining table accompanied by four ergonomic charcoal fabric chairs with sturdy matte black steel framework.',
        monthlyRent: 35,
        securityDeposit: 100,
        images: [
          'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12, 18],
        stock: 5,
        city: 'San Francisco',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_fur03',
        title: 'Orthopedic Queen Platform Bed',
        category: 'furniture',
        description: 'Premium upholstered queen size bedframe including a multi-layer pocket spring orthopaedic mattress. Exceptional lower back support with plush headboard.',
        monthlyRent: 55,
        securityDeposit: 200,
        images: [
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [6, 12, 24],
        stock: 6,
        city: 'New York',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_fur04',
        title: 'Ergonomic Home Office Task Chair',
        category: 'furniture',
        description: 'High back mesh desk chair equipped with dynamic lumbar alignment support, fully customizable 3D armrests, and pneumatic seat height adjustment.',
        monthlyRent: 18,
        securityDeposit: 60,
        images: [
          'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12, 24],
        stock: 12,
        city: 'Los Angeles',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_fur05',
        title: 'Solid Oak Floating Media Console',
        category: 'furniture',
        description: 'Sleek wall-mounted walnut wood entertainment unit featuring spacious push-to-open cabinets, integrated wire routing cutouts, and a minimalist design.',
        monthlyRent: 22,
        securityDeposit: 80,
        images: [
          'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12],
        stock: 4,
        city: 'Chicago',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      // --- APPLIANCES ---
      {
        _id: 'prod_app01',
        title: 'Samsung Double Door Refrigerator (320L)',
        category: 'appliances',
        description: 'Smart Convertible double door frost-free fridge. Energy efficient digital inverter compressor with modular storage drawers and rapid cooling technology.',
        monthlyRent: 50,
        securityDeposit: 180,
        images: [
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [6, 12, 24],
        stock: 7,
        city: 'New York',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_app02',
        title: 'LG Front-Load Inverter Washer (8kg)',
        category: 'appliances',
        description: 'Super silent 6-motion fully automatic washing machine with AI Direct Drive fabric sensors, built-in allergy care steam cycle, and smartphone control hookups.',
        monthlyRent: 38,
        securityDeposit: 130,
        images: [
          'https://images.unsplash.com/photo-1610557892470-76d88819936f?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12, 24],
        stock: 9,
        city: 'San Francisco',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_app03',
        title: 'Sony Bravia 4K UHD Smart TV (55")',
        category: 'appliances',
        description: 'Jaw-dropping 4K HDR processor X1 cinematic screen. Google TV integration, immersive Dolby Vision audio, low latency gaming inputs, and premium design bezel.',
        monthlyRent: 42,
        securityDeposit: 160,
        images: [
          'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12, 24],
        stock: 10,
        city: 'Los Angeles',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_app04',
        title: 'Smart Convection Microwave (28L)',
        category: 'appliances',
        description: 'Premium convection oven supporting baking, roasting, slim frying, and auto-cook recipes. Ceramic enamel interior prevents scratches and makes cleaning seamless.',
        monthlyRent: 15,
        securityDeposit: 50,
        images: [
          'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12],
        stock: 15,
        city: 'Chicago',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      },
      {
        _id: 'prod_app05',
        title: 'Dyson Pure Cool Air Purifier & Fan',
        category: 'appliances',
        description: 'Intelligent cooling tower fan with glass HEPA filter capture system. Automatically senses and captures gaseous particles, displaying real-time reports.',
        monthlyRent: 28,
        securityDeposit: 90,
        images: [
          'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80'
        ],
        tenureOptions: [3, 6, 12],
        stock: 6,
        city: 'New York',
        availability: true,
        vendorId: 'usr_vendor01',
        createdAt: new Date().toISOString()
      }
    ];

    console.log('📦 Creating product catalog...');
    for (const product of sampleProducts) {
      await Product.create(product);
    }
    
    console.log(`✅ Loaded ${sampleProducts.length} default furniture & appliances into catalog.`);
    console.log(`🎉 Database seeding finished successfully!`);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

seed();
