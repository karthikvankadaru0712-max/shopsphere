import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { Brand } from '../src/models/Brand.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';

const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

const catalogCategories = [
  {
    name: 'Smartphones',
    slug: 'mobile-phones',
    description: 'Smartphones and mobile essentials for work, creativity, and everyday life.',
    icon: 'Smartphone',
    image: image('photo-1511707171634-5f897ff02aa9')
  },
  {
    name: 'Laptops & Computers',
    slug: 'laptops',
    description: 'Portable computers for study, creative work, and professional setups.',
    icon: 'Laptop',
    image: image('photo-1496181133206-80ce9b88a853')
  },
  {
    name: 'Fashion & Accessories',
    slug: 'fashion',
    description: 'Considered everyday clothing and accessories made to travel well.',
    icon: 'Shirt',
    image: image('photo-1529139574466-a303027c1d8b')
  }
];

const brandDetails = {
  nova: { name: 'Nova Biometrics', description: 'Thoughtful mobile and wearable technology.' },
  nexa: { name: 'Nexa Ergonomics', description: 'Designed computing and workspace essentials.' },
  artisan: { name: 'Artisan Goods', description: 'Well-made everyday carry and wardrobe essentials.' }
};

const products = [
  {
    name: 'Nova Orbit 5G Smartphone',
    slug: 'nova-orbit-5g-smartphone',
    SKU: 'NOVA-PH-41',
    brandSlug: 'nova',
    categorySlug: 'mobile-phones',
    description: 'A balanced 5G smartphone with a vivid OLED display, all-day battery, and a versatile camera system for everyday use.',
    shortDescription: '6.7-inch OLED 5G smartphone with a versatile camera.',
    price: 32999,
    compareAtPrice: 37999,
    stock: 32,
    images: [image('photo-1511707171634-5f897ff02aa9')],
    specifications: [{ key: 'Display', value: '6.7-inch OLED' }, { key: 'Connectivity', value: '5G, Wi-Fi 6, USB-C' }, { key: 'Battery', value: 'All-day fast charging' }],
    tags: ['mobile-phones', 'smartphone', '5g', 'everyday'],
    ratingSummary: { average: 4.7, count: 42 },
    isFeatured: true,
    salesCount: 340
  },
  {
    name: 'Nexa Air 14 Everyday Laptop',
    slug: 'nexa-air-14-everyday-laptop',
    SKU: 'NEX-LT-42',
    brandSlug: 'nexa',
    categorySlug: 'laptops',
    description: 'A light 14-inch laptop for study and office work, with a high-resolution display, fast solid-state storage, and USB-C charging.',
    shortDescription: 'Lightweight 14-inch laptop for study and everyday work.',
    price: 64999,
    compareAtPrice: 72999,
    stock: 18,
    images: [image('photo-1496181133206-80ce9b88a853')],
    specifications: [{ key: 'Display', value: '14-inch high-resolution IPS' }, { key: 'Memory', value: '16 GB' }, { key: 'Storage', value: '512 GB SSD' }],
    tags: ['laptops', 'computer', 'study', 'work-setup'],
    ratingSummary: { average: 4.6, count: 28 },
    isFeatured: true,
    salesCount: 210
  },
  {
    name: 'Artisan Modern Utility Overshirt',
    slug: 'artisan-modern-utility-overshirt',
    SKU: 'ART-FA-43',
    brandSlug: 'artisan',
    categorySlug: 'fashion',
    description: 'A versatile cotton-blend overshirt with clean lines, practical pockets, and an easy layer fit for changing seasons.',
    shortDescription: 'Easy-layer cotton-blend overshirt with utility pockets.',
    price: 3499,
    compareAtPrice: 4299,
    stock: 44,
    images: [image('photo-1521572163474-6864f9cf17ab')],
    variants: [
      { name: 'Sage / Medium', sku: 'ART-FA-43-SAG-M', price: 3499, stock: 14, attributes: { color: 'Sage', size: 'M' } },
      { name: 'Sage / Large', sku: 'ART-FA-43-SAG-L', price: 3499, stock: 12, attributes: { color: 'Sage', size: 'L' } },
      { name: 'Charcoal / Medium', sku: 'ART-FA-43-CHR-M', price: 3499, stock: 10, attributes: { color: 'Charcoal', size: 'M' } },
      { name: 'Charcoal / Large', sku: 'ART-FA-43-CHR-L', price: 3499, stock: 8, attributes: { color: 'Charcoal', size: 'L' } }
    ],
    tags: ['fashion', 'clothing', 'overshirt', 'everyday'],
    ratingSummary: { average: 4.5, count: 19 },
    isFeatured: true,
    salesCount: 155
  },
  {
    name: 'Nova Arc Camera Smartphone',
    slug: 'nova-arc-camera-smartphone',
    SKU: 'NOVA-PH-44',
    brandSlug: 'nova',
    categorySlug: 'mobile-phones',
    description: 'A creator-focused phone with optical image stabilization, an ultrawide camera, and a bright display for editing on the move.',
    shortDescription: '5G camera phone with stabilized main and ultrawide lenses.',
    price: 48999,
    compareAtPrice: 54999,
    stock: 21,
    images: [image('photo-1598327105666-5b89351aff97')],
    specifications: [{ key: 'Display', value: '6.8-inch AMOLED' }, { key: 'Main camera', value: 'Optically stabilized wide camera' }, { key: 'Connectivity', value: '5G, Wi-Fi 6E, USB-C' }],
    tags: ['mobile-phones', 'smartphone', 'camera', '5g', 'creators'],
    ratingSummary: { average: 4.8, count: 31 },
    isFeatured: true,
    salesCount: 188
  },
  {
    name: 'Horizon Creator 16 Laptop',
    slug: 'horizon-creator-16-laptop',
    SKU: 'HOR-LT-45',
    brandSlug: 'horizon',
    categorySlug: 'laptops',
    description: 'A color-accurate 16-inch creator laptop with discrete graphics, a precision touchpad, and ports for a flexible production setup.',
    shortDescription: '16-inch creator laptop with a color-accurate display.',
    price: 119999,
    compareAtPrice: 134999,
    stock: 11,
    images: [image('photo-1517336714731-489689fd1ca8')],
    specifications: [{ key: 'Display', value: '16-inch color-accurate IPS' }, { key: 'Memory', value: '32 GB' }, { key: 'Storage', value: '1 TB SSD' }],
    tags: ['laptops', 'computer', 'creators', 'photography'],
    ratingSummary: { average: 4.7, count: 16 },
    isFeatured: true,
    salesCount: 93
  },
  {
    name: 'Artisan Everyday Crossbody Bag',
    slug: 'artisan-everyday-crossbody-bag',
    SKU: 'ART-FA-46',
    brandSlug: 'artisan',
    categorySlug: 'fashion',
    description: 'A compact crossbody bag with weather-resistant fabric, organized pockets, and an adjustable strap for hands-free daily carry.',
    shortDescription: 'Compact weather-resistant crossbody with organized storage.',
    price: 2999,
    compareAtPrice: 3699,
    stock: 38,
    images: [image('photo-1553062407-98eeb64c6a62')],
    tags: ['fashion', 'accessories', 'bag', 'travel-kit'],
    ratingSummary: { average: 4.6, count: 23 },
    isFeatured: true,
    salesCount: 174
  },
  {
    name: 'Nova Core 5G Smartphone',
    slug: 'nova-core-5g-smartphone',
    SKU: 'NOVA-PH-47',
    brandSlug: 'nova',
    categorySlug: 'mobile-phones',
    description: 'A dependable 5G phone with a smooth high-refresh display, dual rear cameras, and a durable battery for everyday essentials.',
    shortDescription: 'Value-focused 5G phone with a smooth display and long battery life.',
    price: 21999,
    compareAtPrice: 25999,
    stock: 47,
    images: [image('photo-1512499617640-c74ae3a79d37')],
    specifications: [{ key: 'Display', value: '6.6-inch high-refresh LCD' }, { key: 'Connectivity', value: '5G, Wi-Fi 6, USB-C' }, { key: 'Battery', value: '5000 mAh' }],
    tags: ['mobile-phones', 'smartphone', '5g', 'everyday'],
    ratingSummary: { average: 4.4, count: 35 },
    isFeatured: true,
    salesCount: 260
  },
  {
    name: 'Artisan City Layering Jacket',
    slug: 'artisan-city-layering-jacket',
    SKU: 'ART-FA-48',
    brandSlug: 'artisan',
    categorySlug: 'fashion',
    description: 'A lightweight city jacket with a relaxed fit, clean hardware, and a packable profile for daily commutes and weekend travel.',
    shortDescription: 'Lightweight packable jacket for commuting and travel.',
    price: 5999,
    compareAtPrice: 7499,
    stock: 27,
    images: [image('photo-1529139574466-a303027c1d8b')],
    variants: [
      { name: 'Black / Medium', sku: 'ART-FA-48-BLK-M', price: 5999, stock: 8, attributes: { color: 'Black', size: 'M' } },
      { name: 'Black / Large', sku: 'ART-FA-48-BLK-L', price: 5999, stock: 7, attributes: { color: 'Black', size: 'L' } },
      { name: 'Olive / Medium', sku: 'ART-FA-48-OLV-M', price: 5999, stock: 6, attributes: { color: 'Olive', size: 'M' } },
      { name: 'Olive / Large', sku: 'ART-FA-48-OLV-L', price: 5999, stock: 6, attributes: { color: 'Olive', size: 'L' } }
    ],
    tags: ['fashion', 'clothing', 'jacket', 'travel-kit'],
    ratingSummary: { average: 4.5, count: 14 },
    isFeatured: true,
    salesCount: 102
  },
  {
    name: 'Nexa Studio 13 Laptop',
    slug: 'nexa-studio-13-laptop',
    SKU: 'NEX-LT-49',
    brandSlug: 'nexa',
    categorySlug: 'laptops',
    description: 'A compact 13-inch laptop with a crisp display, fast storage, and a lightweight aluminum body for mobile work and study.',
    shortDescription: 'Compact 13-inch aluminum laptop for work on the move.',
    price: 79999,
    compareAtPrice: 89999,
    stock: 15,
    images: [image('photo-1498050108023-c5249f4df085')],
    specifications: [{ key: 'Display', value: '13.6-inch high-resolution display' }, { key: 'Memory', value: '16 GB' }, { key: 'Storage', value: '1 TB SSD' }],
    tags: ['laptops', 'computer', 'work-setup', 'travel-kit'],
    ratingSummary: { average: 4.6, count: 21 },
    isFeatured: true,
    salesCount: 126
  }
];

const imageRepairs = {
  'voltstream-wireless-charging-nightstand-pad': image('photo-1603398938378-e54eab446dde'),
  'voltstream-65w-gan-travel-adapter-worldwide': image('photo-1609091839311-d5365f9ff1c5'),
  'artisan-precision-machined-titanium-pen': image('photo-1583485088034-697b5bc54ccd'),
  'velox-apex-thunderbolt-4-dock-12-in-1': image('photo-1603398938378-e54eab446dde'),
  'voltstream-140w-gan-4-port-fast-charger': image('photo-1609091839311-d5365f9ff1c5'),
  'voltstream-magnetic-wireless-power-bank-10000mah': image('photo-1609091839311-d5365f9ff1c5'),
  'nexa-ergonomic-mesh-task-chair': image('photo-1505843490538-5133c6c7d0e1')
};

const curatedOrder = [
  'nova-orbit-5g-smartphone',
  'nexa-air-14-everyday-laptop',
  'aura-studio-wireless-anc-headphones',
  'artisan-modern-utility-overshirt',
  'velox-wireless-mechanical-numpad',
  'nova-arc-camera-smartphone',
  'horizon-mobile-creator-anamorphic-lens',
  'horizon-creator-16-laptop',
  'artisan-everyday-crossbody-bag',
  'echocore-smart-video-doorbell-pro',
  'nova-core-5g-smartphone',
  'artisan-city-layering-jacket',
  'nexa-studio-13-laptop'
];

const updateCatalog = async () => {
  try {
    await connectDB();

    const categories = new Map();
    for (const category of catalogCategories) {
      const saved = await Category.findOneAndUpdate(
        { slug: category.slug },
        { $setOnInsert: category },
        { upsert: true, new: true, runValidators: true }
      );
      categories.set(category.slug, saved._id);
    }

    const brands = new Map();
    for (const [slug, details] of Object.entries(brandDetails)) {
      const brand = await Brand.findOne({ slug });
      if (!brand) throw new Error(`Required brand not found: ${slug}`);
      brands.set(slug, brand._id);
    }
    const horizon = await Brand.findOne({ slug: 'horizon' });
    if (!horizon) throw new Error('Required brand not found: horizon');
    brands.set('horizon', horizon._id);

    let addedCount = 0;
    for (const product of products) {
      const { brandSlug, categorySlug, ...fields } = product;
      const result = await Product.updateOne(
        { slug: fields.slug },
        {
          $setOnInsert: {
            ...fields,
            brand: brands.get(brandSlug),
            category: categories.get(categorySlug),
            catalogRank: 1000
          }
        },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
      addedCount += result.upsertedCount || 0;
    }

    let repairedCount = 0;
    for (const [slug, url] of Object.entries(imageRepairs)) {
      const result = await Product.updateOne({ slug }, { $set: { images: [url] } });
      repairedCount += result.modifiedCount || 0;
    }

    for (const [index, slug] of curatedOrder.entries()) {
      await Product.updateOne({ slug }, { $set: { catalogRank: index + 1 } });
    }

    const rankedCount = await Product.countDocuments({ catalogRank: { $exists: true } });
    const totalCount = await Product.countDocuments();
    await Product.updateMany(
      { catalogRank: { $exists: false } },
      { $set: { catalogRank: 1000 } }
    );

    console.log(`[Catalog] Added ${addedCount} products, repaired ${repairedCount} image URLs, ranked ${curatedOrder.length} featured products, and assigned default ranks to ${totalCount - rankedCount} existing products.`);
  } catch (error) {
    console.error('[Catalog] Update failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

updateCatalog();