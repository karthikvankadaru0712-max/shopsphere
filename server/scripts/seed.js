import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Brand } from '../src/models/Brand.js';
import { Product } from '../src/models/Product.js';
import { Coupon } from '../src/models/Coupon.js';
import { Order } from '../src/models/Order.js';
import { Review } from '../src/models/Review.js';
import { PriceHistory } from '../src/models/PriceHistory.js';
import { InventoryMovement } from '../src/models/InventoryMovement.js';
import { SmartCollection } from '../src/models/SmartCollection.js';
import { Notification } from '../src/models/Notification.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Brand.deleteMany(),
      Product.deleteMany(),
      Coupon.deleteMany(),
      Order.deleteMany(),
      Review.deleteMany(),
      PriceHistory.deleteMany(),
      InventoryMovement.deleteMany(),
      SmartCollection.deleteMany(),
      Notification.deleteMany()
    ]);

    console.log('[Seed] Seeding Users...');
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('Admin@123456', salt);
    const customerHash = await bcrypt.hash('Customer@123456', salt);

    const admin = await User.create({
      name: 'Eleanor Vance (Admin)',
      email: 'admin@shopsphere.com',
      passwordHash: adminHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      accountStatus: 'active'
    });

    const customer = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      passwordHash: customerHash,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      addresses: [
        {
          fullName: 'Alex Rivera',
          phone: '+91 98765 43210',
          street: '42 Silicon Avenue, 3rd Floor',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560001',
          country: 'India',
          isDefault: true
        },
        {
          fullName: 'Alex Rivera (Studio)',
          phone: '+91 98765 43211',
          street: '18 Design District, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
          isDefault: false
        }
      ],
      preferences: {
        budget: 15000,
        preferredCategories: ['Audio', 'Home Office', 'Wearables'],
        interests: ['High Fidelity Audio', 'Ergonomic Workspaces', 'Eco Packaging'],
        newsletter: true
      },
      accountStatus: 'active'
    });

    console.log('[Seed] Seeding 8 Categories...');
    const categoriesData = [
      {
        name: 'Audio & Acoustics',
        slug: 'audio',
        description: 'Studio headphones, spatial earbuds, and acoustic home speakers',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        icon: 'Headphones'
      },
      {
        name: 'Home Office & Desk',
        slug: 'home-office',
        description: 'Minimal mechanical keyboards, monitor arms, and ergonomic desks',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        icon: 'Monitor'
      },
      {
        name: 'Wearables & Fitness',
        slug: 'wearables',
        description: 'Biometric smartwatches, titanium rings, and activity trackers',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        icon: 'Watch'
      },
      {
        name: 'Smart Living & IoT',
        slug: 'smart-living',
        description: 'Smart ambient lights, climate hubs, and automated power systems',
        image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
        icon: 'Cpu'
      },
      {
        name: 'Photography & Optics',
        slug: 'photography',
        description: 'Mirrorless lenses, gimbal stabilizers, and studio lighting',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
        icon: 'Camera'
      },
      {
        name: 'Lifestyle & Everyday',
        slug: 'lifestyle',
        description: 'Weatherproof carry backpacks, titanium pens, and travel flasks',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        icon: 'Briefcase'
      },
      {
        name: 'Computer Peripherals',
        slug: 'peripherals',
        description: 'Precision gaming mice, wireless charging pads, and Thunderbolt docks',
        image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        icon: 'Mouse'
      },
      {
        name: 'Power & Cable Management',
        slug: 'power-charging',
        description: 'GaN fast chargers, braided magnetic cables, and power banks',
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80',
        icon: 'Zap'
      }
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((c) => (catMap[c.slug] = c._id));

    console.log('[Seed] Seeding 10 Brands...');
    const brandsData = [
      { name: 'Aura Sound', slug: 'aura', description: 'Swedish precision high-fidelity audio engineering', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80' },
      { name: 'Nexa Ergonomics', slug: 'nexa', description: 'Architectural desk systems and minimalist work tools', logo: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=200&q=80' },
      { name: 'Lumina Tech', slug: 'lumina', description: 'Intelligent ambient lighting and optical sensor ecosystems', logo: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=200&q=80' },
      { name: 'EchoCore', slug: 'echocore', description: 'Smart IoT home automation with local privacy processing', logo: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=200&q=80' },
      { name: 'Horizon Optics', slug: 'horizon', description: 'Cinema-grade lenses and visual accessories for creators', logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80' },
      { name: 'Velox Precision', slug: 'velox', description: 'Ultra-lightweight gaming and productivity input hardware', logo: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80' },
      { name: 'Artisan Goods', slug: 'artisan', description: 'Crafted technical carry packs and sustainable travel vessels', logo: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=200&q=80' },
      { name: 'Nova Biometrics', slug: 'nova', description: 'Clinical-grade optical sensors in sleek titanium wear', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80' },
      { name: 'VoltStream', slug: 'voltstream', description: 'Next-generation Gallium Nitride modular energy systems', logo: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=200&q=80' },
      { name: 'Zenith Studio', slug: 'zenith', description: 'Refined acoustic isolation and studio monitoring gear', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80' }
    ];

    const brands = await Brand.insertMany(brandsData);
    const brandMap = {};
    brands.forEach((b) => (brandMap[b.slug] = b._id));

    console.log('[Seed] Seeding 40 Comprehensive Products with Product Passports & Specs...');

    const rawProducts = [
      // 1-5 Audio
      {
        name: 'Aura Studio Wireless ANC Headphones',
        slug: 'aura-studio-wireless-anc-headphones',
        SKU: 'AUR-HP-01',
        brand: brandMap['aura'],
        category: catMap['audio'],
        description: 'Precision engineered 40mm beryllium drivers paired with hybrid active noise cancellation. Delivers a neutral acoustic profile with rich spatial imaging, 45-hour battery life, and ultra-plush vegan lambskin ear pads.',
        shortDescription: 'Hybrid ANC wireless studio headphones with 45h battery life.',
        price: 18999,
        compareAtPrice: 22999,
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          { name: 'Midnight Charcoal', sku: 'AUR-HP-01-BLK', price: 18999, stock: 20, attributes: { color: 'Charcoal' } },
          { name: 'Warm Sandstone', sku: 'AUR-HP-01-SND', price: 18999, stock: 15, attributes: { color: 'Sandstone' } }
        ],
        specifications: [
          { key: 'Driver Size', value: '40mm Custom Beryllium' },
          { key: 'Battery Life', value: '45 Hours (ANC On)' },
          { key: 'Frequency Response', value: '10Hz - 40,000Hz' },
          { key: 'Connectivity', value: 'Bluetooth 5.3 & 3.5mm Analog' },
          { key: 'Weight', value: '254g' }
        ],
        productPassport: {
          origin: 'Gothenburg, Sweden',
          materials: 'Recycled aerospace aluminum, vegan bio-based memory foam',
          warranty: '2 Year Global Repair & Replace Warranty',
          repairability: 9,
          careInstructions: 'Wipe with damp microfiber cloth. Detachable earpads allow user replacement.',
          packaging: 'FSC Certified unbleached cardboard with soy ink',
          manufacturer: 'Aura Nordic Audio AB',
          returnPolicy: '15-day return window with zero restocking fee',
          sustainabilityClaims: '100% Carbon-offset manufacturing pipeline',
          verificationSource: 'Nordic Eco-Standard Audit 2025'
        },
        tags: ['audio', 'headphones', 'anc', 'travel', 'work-setup', 'music'],
        isFeatured: true,
        isTrending: true,
        salesCount: 142
      },
      {
        name: 'Zenith Clarity Pro In-Ear Earbuds',
        slug: 'zenith-clarity-pro-in-ear-earbuds',
        SKU: 'ZEN-EP-02',
        brand: brandMap['zenith'],
        category: catMap['audio'],
        description: 'True wireless audiophile in-ear monitors equipped with dual armature drivers and lossless LDAC transmission. Featuring water-resistant IPX5 build and customized acoustic seal tips.',
        shortDescription: 'Dual-driver true wireless earbuds with lossless LDAC audio.',
        price: 9499,
        compareAtPrice: 11999,
        stock: 48,
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          { name: 'Matte Obsidian', sku: 'ZEN-EP-02-BLK', price: 9499, stock: 28, attributes: { color: 'Black' } },
          { name: 'Frost White', sku: 'ZEN-EP-02-WHT', price: 9499, stock: 20, attributes: { color: 'White' } }
        ],
        specifications: [
          { key: 'Drivers', value: 'Balanced Armature + 10mm Dynamic' },
          { key: 'Water Resistance', value: 'IPX5' },
          { key: 'Battery', value: '8h buds + 24h wireless charging case' }
        ],
        productPassport: {
          origin: 'Tokyo, Japan',
          materials: 'Recycled ocean-bound polycarbonate',
          warranty: '1 Year Full Replacement Warranty',
          repairability: 7,
          packaging: 'Biodegradable sugarcane pulp mold',
          manufacturer: 'Zenith Studio Sound Corp'
        },
        tags: ['audio', 'earbuds', 'wireless', 'fitness-active', 'travel-kit'],
        isFeatured: true,
        isNewArrival: true,
        salesCount: 88
      },
      {
        name: 'Aura SoundBar Core Architectural Speaker',
        slug: 'aura-soundbar-core-architectural-speaker',
        SKU: 'AUR-SB-03',
        brand: brandMap['aura'],
        category: catMap['audio'],
        description: 'A visual and acoustic centerpiece for modern spaces. Wrapped in acoustic Kvadrat fabric with brushed aluminum edge trims and integrated AirPlay 2 and Spotify Connect.',
        shortDescription: 'High-end architectural room speaker with Kvadrat wool wrap.',
        price: 24999,
        compareAtPrice: 28999,
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Output Power', value: '120W RMS' },
          { key: 'Streaming Protocols', value: 'AirPlay 2, Spotify Connect, Tidal HiFi' }
        ],
        productPassport: {
          origin: 'Denmark',
          materials: 'Sustainable European oak base, 90% recycled wool textile',
          repairability: 8,
          warranty: '3 Year Extended Craftsmanship Guarantee'
        },
        tags: ['audio', 'speaker', 'home-living', 'minimal-lifestyle'],
        salesCount: 39
      },
      {
        name: 'Zenith DeskWave Studio Monitors (Pair)',
        slug: 'zenith-deskwave-studio-monitors-pair',
        SKU: 'ZEN-SP-04',
        brand: brandMap['zenith'],
        category: catMap['audio'],
        description: 'Reference-grade active desktop monitors for creators, music producers, and video editors who require uncolored sound reproduction.',
        shortDescription: 'Pair of bi-amped 5-inch reference studio monitors.',
        price: 16499,
        compareAtPrice: 19999,
        stock: 18,
        images: [
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Woofer', value: '5.25 inch Kevlar Cone' },
          { key: 'Inputs', value: 'Balanced TRS, XLR, RCA' }
        ],
        productPassport: { origin: 'Germany', repairability: 9, warranty: '2 Years' },
        tags: ['audio', 'studio', 'work-setup', 'creators'],
        salesCount: 61
      },
      {
        name: 'Aura Pulse Compact Bluetooth Speaker',
        slug: 'aura-pulse-compact-bluetooth-speaker',
        SKU: 'AUR-BT-05',
        brand: brandMap['aura'],
        category: catMap['audio'],
        description: 'Pocket-sized powerhouse with 360-degree sonic dispersion, IP67 waterproof certification, and 16 hours of continuous playback.',
        shortDescription: 'Pocket IP67 waterproof speaker with punchy bass.',
        price: 4999,
        compareAtPrice: 5999,
        stock: 60,
        images: [
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Vietnam', repairability: 7, warranty: '1 Year' },
        tags: ['audio', 'portable', 'travel-kit', 'college-essentials'],
        salesCount: 195
      },

      // 6-11 Home Office & Desk
      {
        name: 'Nexa Flow 75 Mechanical Keyboard',
        slug: 'nexa-flow-75-mechanical-keyboard',
        SKU: 'NEX-KB-06',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Precision CNC-milled 6063 aluminum chassis featuring gasket-mounted construction, factory-lubricated linear switches, dye-sub PBT keycaps, and tri-mode wireless connectivity.',
        shortDescription: 'CNC aluminum gasket-mounted custom wireless keyboard.',
        price: 11999,
        compareAtPrice: 14499,
        stock: 24,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          { name: 'Anodized Moon Gray / Linear Switch', sku: 'NEX-KB-06-GRY', price: 11999, stock: 14, attributes: { color: 'Gray' } },
          { name: 'E-White / Tactile Switch', sku: 'NEX-KB-06-WHT', price: 12499, stock: 10, attributes: { color: 'White' } }
        ],
        specifications: [
          { key: 'Layout', value: '75% Compact Form Factor' },
          { key: 'Mounting Style', value: 'Poron Gasket Mount' },
          { key: 'Connectivity', value: '2.4GHz, Bluetooth 5.1, USB-C' },
          { key: 'Keycaps', value: 'PBT Dye-Sublimated Cherry Profile' }
        ],
        productPassport: {
          origin: 'Seoul, South Korea',
          materials: '100% Recycled solid billet aluminum',
          warranty: '2 Year Hardware Warranty',
          repairability: 10,
          careInstructions: 'Hot-swappable PCB allows easy switch replacement without soldering.',
          packaging: '100% Recycled cardboard with magnetic closure'
        },
        tags: ['home-office', 'keyboard', 'work-setup', 'minimal-lifestyle', 'college-essentials'],
        isFeatured: true,
        isTrending: true,
        salesCount: 210
      },
      {
        name: 'Nexa Glide Ergonomic Vertical Mouse',
        slug: 'nexa-glide-ergonomic-vertical-mouse',
        SKU: 'NEX-MS-07',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Engineered at a 57-degree natural handshake angle to relieve wrist strain and forearm muscle fatigue. Features ultra-silent switches and an infinite kinetic scroll wheel.',
        shortDescription: '57-degree natural handshake ergonomic wireless mouse.',
        price: 4499,
        compareAtPrice: 5499,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Sensor', value: '4000 DPI Optical Sensor' },
          { key: 'Ergonomic Angle', value: '57 degrees' },
          { key: 'Battery', value: 'Rechargeable USB-C (up to 4 months)' }
        ],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '1 Year' },
        tags: ['home-office', 'mouse', 'ergonomic', 'work-setup'],
        isTrending: true,
        salesCount: 130
      },
      {
        name: 'Nexa Horizon Solid Walnut Monitor Stand',
        slug: 'nexa-horizon-solid-walnut-monitor-stand',
        SKU: 'NEX-MS-08',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Crafted from sustainable American Black Walnut with cork isolation feet and integrated cable management channel to elevate screens to optimal ergonomic eye height.',
        shortDescription: 'Solid American Walnut ergonomic desk riser.',
        price: 6999,
        compareAtPrice: 8499,
        stock: 22,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: {
          origin: 'Oregon, USA',
          materials: 'FSC Certified American Black Walnut, natural cork pads',
          repairability: 10,
          warranty: '5 Year Wood Craftsmanship Guarantee'
        },
        tags: ['home-office', 'desk-riser', 'minimal-lifestyle', 'work-setup'],
        salesCount: 94
      },
      {
        name: 'Nexa DeskMat Merino Wool & Cork',
        slug: 'nexa-deskmat-merino-wool-cork',
        SKU: 'NEX-DM-09',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Reversible desk pad composed of premium dense Merino wool felt on one side and natural Portuguese cork on the other. Anti-fray stitched border.',
        shortDescription: 'Dual-sided natural wool felt & Portuguese cork desk pad.',
        price: 2499,
        compareAtPrice: 3199,
        stock: 55,
        images: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Portugal', repairability: 10, warranty: '2 Years' },
        tags: ['home-office', 'desk-pad', 'minimal-lifestyle', 'college-essentials'],
        salesCount: 180
      },
      {
        name: 'Nexa Pivot Articulating Monitor Arm',
        slug: 'nexa-pivot-articulating-monitor-arm',
        SKU: 'NEX-MA-10',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Heavy-duty counterbalance gas-spring monitor arm supporting ultrawide displays up to 49 inches and 15 kg. Smooth 360-degree rotation and concealed wiring channel.',
        shortDescription: 'Counterbalanced gas-spring single arm for ultrawide monitors.',
        price: 7999,
        compareAtPrice: 9999,
        stock: 19,
        images: [
          'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Taiwan', repairability: 9, warranty: '3 Years' },
        tags: ['home-office', 'ergonomic', 'work-setup'],
        salesCount: 75
      },

      // 12-16 Wearables & Fitness
      {
        name: 'Nova Apex Titanium Smartwatch',
        slug: 'nova-apex-titanium-smartwatch',
        SKU: 'NOV-SW-11',
        brand: brandMap['nova'],
        category: catMap['wearables'],
        description: 'Grade 5 aerospace titanium case housing an edge-to-edge sapphire crystal AMOLED display. Features ECG heart tracking, SpO2 monitoring, multi-band GNSS GPS, and 14-day battery life.',
        shortDescription: 'Grade-5 titanium sapphire GPS smartwatch with 14-day battery.',
        price: 26999,
        compareAtPrice: 32999,
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          { name: 'Raw Brushed Titanium', sku: 'NOV-SW-11-RAW', price: 26999, stock: 15, attributes: { color: 'Titanium' } },
          { name: 'DLC Space Black', sku: 'NOV-SW-11-BLK', price: 27999, stock: 10, attributes: { color: 'Black' } }
        ],
        specifications: [
          { key: 'Case Material', value: 'Grade 5 Titanium & Sapphire Crystal' },
          { key: 'Display', value: '1.43 inch AMOLED 466x466 1000 nits' },
          { key: 'Water Rating', value: '10 ATM (100 meters)' },
          { key: 'Battery Duration', value: 'Up to 14 days standard usage' }
        ],
        productPassport: {
          origin: 'Switzerland & Taiwan',
          materials: 'Grade 5 Titanium, Sapphire Crystal glass, fluoroelastomer strap',
          warranty: '2 Year Comprehensive International Guarantee',
          repairability: 8,
          packaging: 'Recycled aluminum keepsake case'
        },
        tags: ['wearables', 'smartwatch', 'fitness-active', 'travel-kit'],
        isFeatured: true,
        isTrending: true,
        salesCount: 165
      },
      {
        name: 'Nova Halo Smart Health Ring',
        slug: 'nova-halo-smart-health-ring',
        SKU: 'NOV-RG-12',
        brand: brandMap['nova'],
        category: catMap['wearables'],
        description: 'Featherlight 3-gram titanium ring measuring continuous heart rate, sleep architecture, recovery scores, and body temperature variations with no subscription required.',
        shortDescription: 'Lightweight titanium smart ring with comprehensive sleep analytics.',
        price: 17999,
        compareAtPrice: 20999,
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Weight', value: '3.2 grams' },
          { key: 'Battery', value: '7 days per charge' },
          { key: 'Sensors', value: 'PPG sensor, skin temperature, 3D accelerometer' }
        ],
        productPassport: { origin: 'Finland', repairability: 7, warranty: '1 Year' },
        tags: ['wearables', 'health', 'fitness-active', 'minimal-lifestyle'],
        isNewArrival: true,
        salesCount: 92
      },
      {
        name: 'Nova Aero GPS Sport Band',
        slug: 'nova-aero-gps-sport-band',
        SKU: 'NOV-SB-13',
        brand: brandMap['nova'],
        category: catMap['wearables'],
        description: 'Streamlined athletic tracker designed for runners, cyclists, and swimmers. Bright sunlight-readable transflective display with offline GPS route tracking.',
        shortDescription: 'Sunlight-readable GPS athletic tracker with 20h GPS battery.',
        price: 8499,
        compareAtPrice: 10499,
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '1 Year' },
        tags: ['wearables', 'sports', 'fitness-active', 'college-essentials'],
        salesCount: 110
      },

      // 17-21 Smart Living & IoT
      {
        name: 'Lumina Horizon Smart Ambient Light Bar',
        slug: 'lumina-horizon-smart-ambient-light-bar',
        SKU: 'LUM-LB-14',
        brand: brandMap['lumina'],
        category: catMap['smart-living'],
        description: 'Sleek anodized aluminum monitor light bar with auto-dimming circadian sensors, zero screen glare, and touch-sensitive wireless desktop dial control.',
        shortDescription: 'Asymmetric optical monitor bar with wireless desktop rotary dial.',
        price: 5499,
        compareAtPrice: 6999,
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Color Rendering', value: 'Ra >= 95' },
          { key: 'Color Temperature', value: '2700K - 6500K Adjustable' },
          { key: 'Mounting', value: 'Counterweight gravity pivot mount' }
        ],
        productPassport: {
          origin: 'Shenzhen, High-Tech Corridor',
          materials: 'Anodized aluminum alloy, anti-glare polycarbonate optical lens',
          repairability: 9,
          warranty: '2 Year Replacement Warranty'
        },
        tags: ['smart-living', 'lighting', 'work-setup', 'minimal-lifestyle'],
        isFeatured: true,
        isTrending: true,
        salesCount: 310
      },
      {
        name: 'EchoCore Smart Air Quality & Climate Hub',
        slug: 'echocore-smart-air-quality-climate-hub',
        SKU: 'ECH-AQ-15',
        brand: brandMap['echocore'],
        category: catMap['smart-living'],
        description: 'Monitors real-time PM2.5, VOCs, CO2, temperature, and humidity. Integrates with HomeKit, Google Home, and Alexa via Matter protocol with an e-ink glare-free display.',
        shortDescription: 'Matter-enabled e-ink indoor environmental climate monitor.',
        price: 7499,
        compareAtPrice: 8999,
        stock: 33,
        images: [
          'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Sensors', value: 'Laser PM2.5, NDIR CO2, Swiss Sensirion Temp/RH' },
          { key: 'Connectivity', value: 'Thread, Matter, Wi-Fi 6' }
        ],
        productPassport: { origin: 'Estonia', repairability: 8, warranty: '2 Years' },
        tags: ['smart-living', 'climate', 'home', 'iot'],
        salesCount: 78
      },
      {
        name: 'Lumina Prism RGB Gradient Floor Lamp',
        slug: 'lumina-prism-rgb-gradient-floor-lamp',
        SKU: 'LUM-FL-16',
        brand: brandMap['lumina'],
        category: catMap['smart-living'],
        description: 'Corner architectural floor lamp casting smooth gradients and synchronized music reactive effects across your studio or living room.',
        shortDescription: 'Corner ambient gradient light column with app presets.',
        price: 8999,
        compareAtPrice: 10999,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'India', repairability: 9, warranty: '1 Year' },
        tags: ['smart-living', 'lighting', 'minimal-lifestyle'],
        salesCount: 88
      },

      // 22-26 Photography & Optics
      {
        name: 'Horizon Prime 35mm F/1.4 Cinema Lens',
        slug: 'horizon-prime-35mm-f14-cinema-lens',
        SKU: 'HOR-LN-17',
        brand: brandMap['horizon'],
        category: catMap['photography'],
        description: 'Full-frame manual cinema lens delivering organic skin tones, circular 12-blade bokeh, and zero focus breathing. Standard 0.8 MOD geared rings for follow focus systems.',
        shortDescription: 'Full-frame manual prime cinema lens with 12-blade aperture.',
        price: 34999,
        compareAtPrice: 39999,
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
        ],
        specifications: [
          { key: 'Focal Length', value: '35mm' },
          { key: 'Aperture Range', value: 'T1.5 - T22' },
          { key: 'Mount Options', value: 'Sony E, Canon RF, L-Mount' }
        ],
        productPassport: { origin: 'Japan', repairability: 10, warranty: '3 Years Professional Care' },
        tags: ['photography', 'lens', 'creators', 'video'],
        isFeatured: true,
        salesCount: 28
      },
      {
        name: 'Horizon Axis 3-Axis Pro Gimbal',
        slug: 'horizon-axis-3-axis-pro-gimbal',
        SKU: 'HOR-GB-18',
        brand: brandMap['horizon'],
        category: catMap['photography'],
        description: 'Carbon-fiber motorized camera stabilizer capable of balancing heavy DSLR payloads up to 4.5kg. Features built-in OLED status screen and automated follow modes.',
        shortDescription: 'Carbon fiber motorized camera gimbal stabilizer (4.5kg payload).',
        price: 21999,
        compareAtPrice: 25999,
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '2 Years' },
        tags: ['photography', 'gimbal', 'video', 'travel-kit'],
        salesCount: 46
      },

      // 27-31 Lifestyle & Carry
      {
        name: 'Artisan Apex 24L Weatherproof Commuter Pack',
        slug: 'artisan-apex-24l-weatherproof-commuter-pack',
        SKU: 'ART-BP-19',
        brand: brandMap['artisan'],
        category: catMap['lifestyle'],
        description: 'Constructed from recycled Cordura ballistic nylon with magnetic Fidlock buckles, suspended 16-inch laptop compartment, hidden passport security pocket, and ergonomic airflow back panel.',
        shortDescription: 'Cordura ballistic waterproof urban backpack with Fidlock magnets.',
        price: 8999,
        compareAtPrice: 10999,
        stock: 40,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80'
        ],
        variants: [
          { name: 'Pitch Black Cordura', sku: 'ART-BP-19-BLK', price: 8999, stock: 25, attributes: { color: 'Black' } },
          { name: 'Olive Drab', sku: 'ART-BP-19-OLV', price: 8999, stock: 15, attributes: { color: 'Olive' } }
        ],
        productPassport: {
          origin: 'Vietnam & Portugal',
          materials: '1000D Recycled Cordura, YKK AquaGuard zippers, Fidlock V-Buckles',
          warranty: 'Lifetime Craftsmanship Guarantee',
          repairability: 10,
          careInstructions: 'Spot clean with mild soap. Do not machine wash.'
        },
        tags: ['lifestyle', 'backpack', 'travel-kit', 'college-essentials', 'minimal-lifestyle'],
        isFeatured: true,
        salesCount: 220
      },
      {
        name: 'Artisan Vacuum Titanium Travel Flask 650ml',
        slug: 'artisan-vacuum-titanium-travel-flask-650ml',
        SKU: 'ART-FL-20',
        brand: brandMap['artisan'],
        category: catMap['lifestyle'],
        description: 'Double-walled vacuum insulated pure titanium bottle. Keeps liquids boiling hot for 18 hours or ice cold for 36 hours. Imparts zero metallic aftertaste.',
        shortDescription: 'Ultralight double-wall pure titanium 650ml insulated flask.',
        price: 3999,
        compareAtPrice: 4999,
        stock: 50,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Japan', materials: 'Medical Grade Pure Titanium', repairability: 10, warranty: '10 Years' },
        tags: ['lifestyle', 'flask', 'travel-kit', 'fitness-active', 'minimal-lifestyle'],
        salesCount: 140
      },

      // 32-36 Peripherals & Input
      {
        name: 'Velox Strike Superlight Wireless Gaming Mouse',
        slug: 'velox-strike-superlight-wireless-gaming-mouse',
        SKU: 'VLX-MS-21',
        brand: brandMap['velox'],
        category: catMap['peripherals'],
        description: 'Ultralightweight 49-gram solid-shell magnesium chassis. Equipped with 30,000 DPI PAW3950 optical sensor, 8000Hz polling rate, and optical micro switches.',
        shortDescription: '49-gram magnesium wireless 8000Hz polling esports mouse.',
        price: 9999,
        compareAtPrice: 12499,
        stock: 35,
        images: [
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'South Korea', repairability: 9, warranty: '2 Years' },
        tags: ['peripherals', 'gaming', 'mouse', 'work-setup'],
        isTrending: true,
        salesCount: 175
      },
      {
        name: 'Velox Apex Thunderbolt 4 Dock 12-in-1',
        slug: 'velox-apex-thunderbolt-4-dock-12-in-1',
        SKU: 'VLX-DK-22',
        brand: brandMap['velox'],
        category: catMap['peripherals'],
        description: 'Single-cable connectivity station providing 96W power delivery, dual 4K 120Hz display outputs, 2.5Gbps Ethernet, SD 4.0 card reader, and high-speed USB-A/C ports.',
        shortDescription: '12-in-1 Thunderbolt 4 aluminum desktop docking hub with 96W PD.',
        price: 15999,
        compareAtPrice: 18999,
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '2 Years' },
        tags: ['peripherals', 'dock', 'work-setup', 'creators'],
        salesCount: 84
      },

      // 37-40 Power & Charging
      {
        name: 'VoltStream 140W GaN 4-Port Fast Charger',
        slug: 'voltstream-140w-gan-4-port-fast-charger',
        SKU: 'VLT-CG-23',
        brand: brandMap['voltstream'],
        category: catMap['power-charging'],
        description: 'Gallium Nitride charging brick capable of fast charging two 16-inch laptops simultaneously at full speed with smart dynamic power allocation.',
        shortDescription: 'Pocket 140W GaN fast charger with 3x USB-C and 1x USB-A.',
        price: 4999,
        compareAtPrice: 5999,
        stock: 75,
        images: [
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: {
          origin: 'Taiwan',
          materials: 'Fire-resistant recyclable casing, GaN III silicon',
          repairability: 7,
          warranty: '2 Year Equipment Guarantee'
        },
        tags: ['power-charging', 'charger', 'travel-kit', 'college-essentials', 'work-setup'],
        isFeatured: true,
        salesCount: 340
      },
      {
        name: 'VoltStream Magnetic Wireless Power Bank 10,000mAh',
        slug: 'voltstream-magnetic-wireless-power-bank-10000mah',
        SKU: 'VLT-PB-24',
        brand: brandMap['voltstream'],
        category: catMap['power-charging'],
        description: 'Slim aluminum battery pack with snap-on MagSafe wireless alignment, integrated kickstand, and 30W two-way fast USB-C cable charging.',
        shortDescription: '10,000mAh magnetic wireless power bank with aluminum kickstand.',
        price: 3499,
        compareAtPrice: 4299,
        stock: 65,
        images: [
          'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'India', repairability: 8, warranty: '1 Year' },
        tags: ['power-charging', 'powerbank', 'travel-kit', 'college-essentials'],
        salesCount: 290
      },
      {
        name: 'VoltStream Braided Silicone Cable Duo Pack',
        slug: 'voltstream-braided-silicone-cable-duo-pack',
        SKU: 'VLT-CB-25',
        brand: brandMap['voltstream'],
        category: catMap['power-charging'],
        description: 'Tangle-free liquid silicone 100W USB-C to USB-C cables rated for over 30,000 bends. Includes genuine leather cable organizing ties.',
        shortDescription: 'Pair of 2-meter 100W soft-touch braided silicone cables.',
        price: 1299,
        compareAtPrice: 1699,
        stock: 120,
        images: [
          'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'India', repairability: 9, warranty: '2 Years Replacement' },
        tags: ['power-charging', 'cables', 'work-setup'],
        salesCount: 420
      },
      {
        name: 'Artisan Modular Leather Cable Organizer',
        slug: 'artisan-modular-leather-cable-organizer',
        SKU: 'ART-CO-26',
        brand: brandMap['artisan'],
        category: catMap['lifestyle'],
        description: 'Vegetable-tanned full-grain leather roll with custom elastic slots for chargers, flash drives, stylus pens, and dongles.',
        shortDescription: 'Vegetable-tanned full-grain leather travel electronics roll.',
        price: 1999,
        compareAtPrice: 2499,
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
        ],
        productPassport: { origin: 'Tuscany, Italy', repairability: 10, warranty: '5 Years' },
        tags: ['lifestyle', 'travel-kit', 'minimal-lifestyle', 'creators'],
        salesCount: 115
      },
      // Additional products to round to 40 items
      {
        name: 'Aura SoundCore Vinyl Hi-Fi Turntable',
        slug: 'aura-soundcore-vinyl-hifi-turntable',
        SKU: 'AUR-TT-27',
        brand: brandMap['aura'],
        category: catMap['audio'],
        description: 'Belt-drive audiophile turntable with carbon-fiber tonearm, Ortofon 2M Red cartridge, and built-in switchable phono preamplifier.',
        shortDescription: 'Belt-drive turntable with Ortofon cartridge & carbon tonearm.',
        price: 28999,
        compareAtPrice: 33999,
        stock: 8,
        images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Austria', repairability: 10, warranty: '3 Years' },
        tags: ['audio', 'vinyl', 'minimal-lifestyle'],
        salesCount: 22
      },
      {
        name: 'Nexa Stance Electric Standing Desk',
        slug: 'nexa-stance-electric-standing-desk',
        SKU: 'NEX-DK-28',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Dual-motor sit-stand desk frame with solid bamboo desktop, 4 programmable height memory presets, and anti-collision safety sensors.',
        shortDescription: 'Dual-motor electric standing desk with solid bamboo desktop.',
        price: 29999,
        compareAtPrice: 35999,
        stock: 12,
        images: ['https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Taiwan', repairability: 9, warranty: '5 Year Frame Warranty' },
        tags: ['home-office', 'standing-desk', 'work-setup', 'ergonomic'],
        salesCount: 48
      },
      {
        name: 'Nexa Ergonomic Mesh Task Chair',
        slug: 'nexa-ergonomic-mesh-task-chair',
        SKU: 'NEX-CH-29',
        brand: brandMap['nexa'],
        category: catMap['home-office'],
        description: 'Breathable dual-mesh backrest with dynamic lumbar support, 4D adjustable armrests, and synchronized tilt mechanism for all-day posture.',
        shortDescription: 'All-mesh ergonomic task chair with dynamic lumbar tracking.',
        price: 19999,
        compareAtPrice: 24999,
        stock: 15,
        images: ['https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Germany', repairability: 10, warranty: '5 Years' },
        tags: ['home-office', 'chair', 'ergonomic', 'work-setup'],
        salesCount: 82
      },
      {
        name: 'EchoCore Smart Video Doorbell Pro',
        slug: 'echocore-smart-video-doorbell-pro',
        SKU: 'ECH-DB-30',
        brand: brandMap['echocore'],
        category: catMap['smart-living'],
        description: '2K HDR video doorbell with local on-device facial recognition, 180-degree head-to-toe field of view, and encrypted MicroSD recording.',
        shortDescription: '2K HDR wireless smart doorbell with zero cloud subscription fees.',
        price: 8999,
        compareAtPrice: 10999,
        stock: 28,
        images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '2 Years' },
        tags: ['smart-living', 'security', 'home', 'iot'],
        salesCount: 64
      },
      {
        name: 'Horizon Mobile Creator Anamorphic Lens',
        slug: 'horizon-mobile-creator-anamorphic-lens',
        SKU: 'HOR-ML-31',
        brand: brandMap['horizon'],
        category: catMap['photography'],
        description: '1.33x anamorphic cinema attachment for smartphones. Produces signature organic horizontal lens flares and true 2.4:1 widescreen aspect ratio.',
        shortDescription: 'Smartphone 1.33x anamorphic attachment lens with bayonet mount.',
        price: 4999,
        compareAtPrice: 6499,
        stock: 40,
        images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Japan', repairability: 9, warranty: '1 Year' },
        tags: ['photography', 'smartphone', 'creators', 'travel-kit'],
        salesCount: 112
      },
      {
        name: 'Horizon Carbon Studio Tripod System',
        slug: 'horizon-carbon-studio-tripod-system',
        SKU: 'HOR-TP-32',
        brand: brandMap['horizon'],
        category: catMap['photography'],
        description: '8-layer carbon fiber legs with inverted ball head and Arca-Swiss quick release plate. Folds down to 38cm for ultra-compact travel packing.',
        shortDescription: '8-layer carbon fiber compact travel camera tripod.',
        price: 11499,
        compareAtPrice: 13999,
        stock: 22,
        images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Japan', repairability: 10, warranty: '3 Years' },
        tags: ['photography', 'tripod', 'travel-kit', 'creators'],
        salesCount: 54
      },
      {
        name: 'Artisan Tech Sling Bag 4L',
        slug: 'artisan-tech-sling-bag-4l',
        SKU: 'ART-SL-33',
        brand: brandMap['artisan'],
        category: catMap['lifestyle'],
        description: 'Crossbody tech sling bag made with X-Pac waterproof sailcloth. Quick-access front pocket with magnetic key leash and iPad mini padded sleeve.',
        shortDescription: 'X-Pac waterproof compact 4L tech crossbody sling.',
        price: 4299,
        compareAtPrice: 5299,
        stock: 58,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'USA & Vietnam', repairability: 10, warranty: 'Lifetime Guarantee' },
        tags: ['lifestyle', 'sling', 'travel-kit', 'college-essentials'],
        salesCount: 198
      },
      {
        name: 'Artisan Precision Machined Titanium Pen',
        slug: 'artisan-precision-machined-titanium-pen',
        SKU: 'ART-PN-34',
        brand: brandMap['artisan'],
        category: catMap['lifestyle'],
        description: 'CNC lathed solid titanium bolt-action ballpoint pen. Accepts standard Parker-style refills and includes a discreet ceramic glass breaker crown.',
        shortDescription: 'Solid titanium bolt-action daily carry pen with pocket clip.',
        price: 2799,
        compareAtPrice: 3499,
        stock: 70,
        images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Germany', repairability: 10, warranty: 'Lifetime Guarantee' },
        tags: ['lifestyle', 'edc', 'minimal-lifestyle', 'gift-finder'],
        salesCount: 230
      },
      {
        name: 'Velox Prism XL Extended Gaming Desk Pad',
        slug: 'velox-prism-xl-extended-gaming-desk-pad',
        SKU: 'VLX-MP-35',
        brand: brandMap['velox'],
        category: catMap['peripherals'],
        description: '900x400mm micro-woven cloth surface offering minimal friction glide for competitive tracking, surrounded by 4mm spill-resistant natural rubber base.',
        shortDescription: '900x400mm spill-resistant micro-texture gaming desk mat.',
        price: 1899,
        compareAtPrice: 2299,
        stock: 90,
        images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Taiwan', repairability: 8, warranty: '1 Year' },
        tags: ['peripherals', 'gaming', 'work-setup', 'college-essentials'],
        salesCount: 310
      },
      {
        name: 'Velox Wireless Mechanical Numpad',
        slug: 'velox-wireless-mechanical-numpad',
        SKU: 'VLX-NP-36',
        brand: brandMap['velox'],
        category: catMap['peripherals'],
        description: 'Dedicated 21-key wireless numeric keypad with CNC aluminum casing, programmable rotary media encoder, and hot-swap switch sockets.',
        shortDescription: 'Wireless aluminum 21-key mechanical numpad with rotary knob.',
        price: 3699,
        compareAtPrice: 4499,
        stock: 32,
        images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'South Korea', repairability: 10, warranty: '2 Years' },
        tags: ['peripherals', 'numpad', 'work-setup'],
        salesCount: 65
      },
      {
        name: 'VoltStream 65W GaN Travel Adapter Worldwide',
        slug: 'voltstream-65w-gan-travel-adapter-worldwide',
        SKU: 'VLT-TA-37',
        brand: brandMap['voltstream'],
        category: catMap['power-charging'],
        description: 'All-in-one universal travel adapter featuring slide-out US, UK, EU, and AU plugs with integrated 65W GaN USB-C fast charging.',
        shortDescription: 'Universal international travel adapter with built-in 65W GaN PD.',
        price: 3299,
        compareAtPrice: 3999,
        stock: 60,
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'China', repairability: 8, warranty: '1 Year' },
        tags: ['power-charging', 'travel-kit', 'adapter'],
        salesCount: 280
      },
      {
        name: 'VoltStream Wireless Charging Nightstand Pad',
        slug: 'voltstream-wireless-charging-nightstand-pad',
        SKU: 'VLT-WC-38',
        brand: brandMap['voltstream'],
        category: catMap['power-charging'],
        description: '3-in-1 folding wireless charging station for phone, smartwatch, and earbuds. Clad in soft vegan leather with ambient nightlight.',
        shortDescription: '3-in-1 folding wireless charger for phone, watch, and buds.',
        price: 3899,
        compareAtPrice: 4799,
        stock: 45,
        images: ['https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Vietnam', repairability: 8, warranty: '1 Year' },
        tags: ['power-charging', 'wireless', 'minimal-lifestyle', 'smart-living'],
        salesCount: 155
      },
      {
        name: 'Aura Spatial Audio Soundbar Subwoofer',
        slug: 'aura-spatial-audio-soundbar-subwoofer',
        SKU: 'AUR-SB-39',
        brand: brandMap['aura'],
        category: catMap['audio'],
        description: 'Wireless 8-inch downward-firing subwoofer pairing with Aura soundbars for deep, room-shaking 28Hz sub-bass response.',
        shortDescription: 'Wireless 8-inch 200W downward-firing active studio subwoofer.',
        price: 18999,
        compareAtPrice: 22999,
        stock: 14,
        images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Denmark', repairability: 8, warranty: '3 Years' },
        tags: ['audio', 'home-theater', 'soundbar'],
        salesCount: 42
      },
      {
        name: 'EchoCore Smart Motion & Light Sensor Duo',
        slug: 'echocore-smart-motion-light-sensor-duo',
        SKU: 'ECH-MS-40',
        brand: brandMap['echocore'],
        category: catMap['smart-living'],
        description: 'Battery-powered Thread sensor pack triggering automated lighting upon presence detection. 5-year battery life on coin cells.',
        shortDescription: 'Pack of 2 Thread/Matter ultra-low power ambient motion sensors.',
        price: 3199,
        compareAtPrice: 3899,
        stock: 55,
        images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'],
        productPassport: { origin: 'Estonia', repairability: 8, warranty: '2 Years' },
        tags: ['smart-living', 'sensors', 'iot', 'home'],
        salesCount: 88
      }
    ];

    const insertedProducts = await Product.insertMany(rawProducts);
    console.log(`[Seed] Successfully inserted ${insertedProducts.length} Products!`);

    console.log('[Seed] Seeding Demonstration Price Histories for PricePulse...');
    const priceHistories = [];
    for (const p of insertedProducts) {
      const now = new Date();
      // Generate 3 past price points
      const p1 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
      const p2 = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000);
      const p3 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

      priceHistories.push(
        {
          product: p._id,
          price: Math.round(p.price * 1.15),
          compareAtPrice: p.compareAtPrice,
          recordedAt: p1,
          reason: 'Initial Launch Price',
          isDemo: true
        },
        {
          product: p._id,
          price: Math.round(p.price * 1.05),
          compareAtPrice: p.compareAtPrice,
          recordedAt: p2,
          reason: 'Seasonal Promotional Adjustment',
          isDemo: true
        },
        {
          product: p._id,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          recordedAt: p3,
          reason: 'Best Value Price Calibration',
          isDemo: true
        }
      );
    }
    await PriceHistory.insertMany(priceHistories);

    console.log('[Seed] Seeding Active Coupons...');
    const couponsData = [
      {
        code: 'WELCOME10',
        description: '10% discount for first-time ShopSphere members',
        discountType: 'percentage',
        value: 10,
        minOrderAmount: 1000,
        maxDiscount: 2000,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'SPHERE20',
        description: '20% off on all premium orders above ₹5,000',
        discountType: 'percentage',
        value: 20,
        minOrderAmount: 5000,
        maxDiscount: 3500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'FREESHIP',
        description: 'Flat ₹150 off covering standard delivery cost',
        discountType: 'fixed',
        value: 150,
        minOrderAmount: 500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        isActive: true
      },
      {
        code: 'TECH15',
        description: '15% savings on all tech & audio gear',
        discountType: 'percentage',
        value: 15,
        minOrderAmount: 3000,
        maxDiscount: 2500,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 300,
        isActive: true
      }
    ];
    await Coupon.insertMany(couponsData);

    console.log('[Seed] Seeding Sample Orders across different states...');
    const auraHeadphones = insertedProducts.find((p) => p.SKU === 'AUR-HP-01');
    const nexaKeyboard = insertedProducts.find((p) => p.SKU === 'NEX-KB-06');
    const luminaLight = insertedProducts.find((p) => p.SKU === 'LUM-LB-14');
    const voltCharger = insertedProducts.find((p) => p.SKU === 'VLT-CG-23');

    // 1. Delivered Order for Customer (qualifies for verified review & ownership hub!)
    const deliveredOrder = await Order.create({
      orderNumber: 'SPHERE-2026-104921',
      customer: customer._id,
      items: [
        {
          product: auraHeadphones._id,
          name: auraHeadphones.name,
          image: auraHeadphones.images[0],
          price: auraHeadphones.price,
          quantity: 1,
          sku: auraHeadphones.SKU
        },
        {
          product: luminaLight._id,
          name: luminaLight.name,
          image: luminaLight.images[0],
          price: luminaLight.price,
          quantity: 1,
          sku: luminaLight.SKU
        }
      ],
      deliveryAddress: customer.addresses[0],
      shippingMethod: 'Express Courier Air',
      subtotal: auraHeadphones.price + luminaLight.price,
      discount: 2000,
      shipping: 0,
      tax: Math.round((auraHeadphones.price + luminaLight.price - 2000) * 0.18),
      total: (auraHeadphones.price + luminaLight.price - 2000) + Math.round((auraHeadphones.price + luminaLight.price - 2000) * 0.18),
      currency: 'INR',
      paymentMethod: 'mock',
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      statusHistory: [
        { status: 'confirmed', note: 'Payment processed successfully', changedAt: new Date(Date.now() - 7 * 86400000) },
        { status: 'shipped', note: 'Dispatched via BlueDart Express Air', changedAt: new Date(Date.now() - 4 * 86400000) },
        { status: 'delivered', note: 'Package handed to recipient at front desk', changedAt: new Date(Date.now() - 1 * 86400000) }
      ],
      couponSnapshot: { code: 'WELCOME10', discountAmount: 2000, discountType: 'percentage' }
    });

    // 2. In-Transit / Shipped Order
    await Order.create({
      orderNumber: 'SPHERE-2026-105183',
      customer: customer._id,
      items: [
        {
          product: nexaKeyboard._id,
          name: nexaKeyboard.name,
          image: nexaKeyboard.images[0],
          price: nexaKeyboard.price,
          quantity: 1,
          sku: nexaKeyboard.SKU
        }
      ],
      deliveryAddress: customer.addresses[0],
      shippingMethod: 'Standard Tracked Delivery',
      subtotal: nexaKeyboard.price,
      discount: 0,
      shipping: 0,
      tax: Math.round(nexaKeyboard.price * 0.18),
      total: nexaKeyboard.price + Math.round(nexaKeyboard.price * 0.18),
      currency: 'INR',
      paymentMethod: 'mock',
      paymentStatus: 'paid',
      fulfillmentStatus: 'shipped',
      statusHistory: [
        { status: 'confirmed', note: 'Order verified', changedAt: new Date(Date.now() - 2 * 86400000) },
        { status: 'shipped', note: 'Package in transit with DTDC Tracking: D1049281', changedAt: new Date(Date.now() - 1 * 86400000) }
      ]
    });

    // 3. Processing Order
    await Order.create({
      orderNumber: 'SPHERE-2026-106401',
      customer: customer._id,
      items: [
        {
          product: voltCharger._id,
          name: voltCharger.name,
          image: voltCharger.images[0],
          price: voltCharger.price,
          quantity: 2,
          sku: voltCharger.SKU
        }
      ],
      deliveryAddress: customer.addresses[1],
      shippingMethod: 'Standard Tracked Delivery',
      subtotal: voltCharger.price * 2,
      discount: 500,
      shipping: 0,
      tax: Math.round((voltCharger.price * 2 - 500) * 0.18),
      total: (voltCharger.price * 2 - 500) + Math.round((voltCharger.price * 2 - 500) * 0.18),
      currency: 'INR',
      paymentMethod: 'mock',
      paymentStatus: 'paid',
      fulfillmentStatus: 'processing',
      statusHistory: [
        { status: 'confirmed', note: 'Order placed via Mock Gateway', changedAt: new Date() }
      ]
    });

    console.log('[Seed] Seeding Verified Purchase Reviews...');
    const sampleReviews = [
      {
        user: customer._id,
        product: auraHeadphones._id,
        order: deliveredOrder._id,
        rating: 5,
        title: 'Breathtaking clarity and supreme build quality',
        body: 'The beryllium drivers truly set these apart. The soundstage is exceptionally wide with pinpoint instrument positioning. The vegan lambskin ear pads feel cloud-soft even during 8-hour coding sessions.',
        isVerifiedPurchase: true,
        helpfulCount: 24,
        status: 'approved'
      },
      {
        user: customer._id,
        product: luminaLight._id,
        order: deliveredOrder._id,
        rating: 5,
        title: 'Transformed my desk lighting and reduced eye strain completely',
        body: 'The wireless rotary dial is weighted like high-end audio equipment. Zero reflection on my curved monitor. Highly recommended for nighttime work.',
        isVerifiedPurchase: true,
        helpfulCount: 18,
        status: 'approved'
      }
    ];
    await Review.insertMany(sampleReviews);

    // Update rating summaries on seeded products
    for (const r of sampleReviews) {
      await Product.findByIdAndUpdate(r.product, {
        ratingSummary: {
          average: 5.0,
          count: 1,
          distribution: { 5: 1, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      });
    }

    // Assign realistic default ratings across remaining products
    for (const p of insertedProducts) {
      if (!sampleReviews.some((r) => r.product.toString() === p._id.toString())) {
        const avg = parseFloat((4.2 + Math.random() * 0.7).toFixed(1));
        const count = Math.floor(15 + Math.random() * 45);
        await Product.findByIdAndUpdate(p._id, {
          ratingSummary: {
            average: avg,
            count,
            distribution: {
              5: Math.floor(count * 0.6),
              4: Math.floor(count * 0.3),
              3: Math.floor(count * 0.08),
              2: Math.floor(count * 0.02),
              1: 0
            }
          }
        });
      }
    }

    console.log('[Seed] Seeding User Smart Collection...');
    await SmartCollection.create({
      owner: customer._id,
      name: 'Ultimate Developer Desk Setup',
      slug: 'ultimate-developer-desk-setup',
      description: 'Handpicked tools for high-focus coding, posture ergonomics, and acoustic isolation.',
      products: [nexaKeyboard._id, auraHeadphones._id, luminaLight._id, voltCharger._id],
      visibility: 'public',
      shareCode: 'desk-2026'
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create({
      user: customer._id,
      type: 'order_status',
      title: 'Order Delivered!',
      message: 'Your order SPHERE-2026-104921 has been delivered safely. Enjoy your new gear!',
      link: `/account/orders/${deliveredOrder._id}`,
      read: false
    });

    console.log('===========================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('👑 Admin Account:');
    console.log('   Email:    admin@shopsphere.com');
    console.log('   Password: Admin@123456');
    console.log('👤 Customer Account:');
    console.log('   Email:    alex@example.com');
    console.log('   Password: Customer@123456');
    console.log('📦 Products: 40');
    console.log('🏷️ Categories: 8');
    console.log('🏢 Brands: 10');
    console.log('🎫 Coupons: 4 (WELCOME10, SPHERE20, FREESHIP, TECH15)');
    console.log('===========================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedDatabase();
