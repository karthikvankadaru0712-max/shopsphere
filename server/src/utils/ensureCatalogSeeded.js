export const ensureCatalogSeeded = async ({ Product, seedFn }) => {
  if (!Product || typeof Product.countDocuments !== 'function') {
    throw new Error('A Product model with countDocuments() is required.');
  }

  const count = await Product.countDocuments();
  if (count > 0) {
    return { seeded: false, count };
  }

  if (typeof seedFn !== 'function') {
    throw new Error('A seed function is required when the catalog is empty.');
  }

  await seedFn();
  const seededCount = await Product.countDocuments();

  return { seeded: true, count: seededCount };
};
