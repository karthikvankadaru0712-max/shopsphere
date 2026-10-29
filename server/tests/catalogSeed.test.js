import { describe, it, expect, vi } from 'vitest';
import { ensureCatalogSeeded } from '../src/utils/ensureCatalogSeeded.js';

describe('ensureCatalogSeeded', () => {
  it('keeps the catalog as-is when products already exist', async () => {
    const Product = {
      countDocuments: vi.fn().mockResolvedValue(12)
    };
    const seedFn = vi.fn();

    const result = await ensureCatalogSeeded({ Product, seedFn });

    expect(result.seeded).toBe(false);
    expect(result.count).toBe(12);
    expect(seedFn).not.toHaveBeenCalled();
  });

  it('runs the seed function when the product catalog is empty', async () => {
    const Product = {
      countDocuments: vi.fn().mockResolvedValue(0)
    };
    const seedFn = vi.fn().mockResolvedValue(undefined);

    const result = await ensureCatalogSeeded({ Product, seedFn });

    expect(result.seeded).toBe(true);
    expect(seedFn).toHaveBeenCalledTimes(1);
  });
});
