import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductGrid } from '../../components/products/ProductGrid';
import { ProductFilters } from '../../components/products/ProductFilters';
import { Drawer } from '../../components/common/Drawer';
import { Button } from '../../components/common/Button';
import api from '../../services/api';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse state from URL search params
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const qParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'curated';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 12 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch categories and brands metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/catalog/categories'),
          api.get('/catalog/brands')
        ]);
        if (catRes.success) setCategories(catRes.data.categories);
        if (brandRes.success) setBrands(brandRes.data.brands);
      } catch (err) {
        console.error('Metadata error:', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products with current active filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page: pageParam,
          limit: 12,
          sort: sortParam
        };
        if (categoryParam) params.category = categoryParam;
        if (brandParam) params.brand = brandParam;
        if (qParam) params.q = qParam;
        if (minPriceParam) params.minPrice = minPriceParam;
        if (maxPriceParam) params.maxPrice = maxPriceParam;
        if (ratingParam) params.rating = ratingParam;
        if (inStockParam) params.inStock = true;

        const res = await api.get('/products', { params });
        if (res.success && res.data) {
          setProducts(res.data.products);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Fetch products error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, brandParam, qParam, sortParam, minPriceParam, maxPriceParam, ratingParam, inStockParam, pageParam]);

  // Update query params helper
  const updateFilterParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value !== null && value !== '' && value !== false) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to first page on filter change
    setSearchParams(newParams);
  };

  const handleResetAll = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 xl:px-8 py-6 sm:py-8">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 sm:pb-6 border-b border-gray-200 gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sphere-violet mb-2">
            ShopSphere / Curated essentials
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-sphere-charcoal tracking-tight leading-tight">
            {qParam ? `Search Results for "${qParam}"` : categoryParam ? `Category: ${categoryParam}` : 'Catalogue'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Thoughtfully selected gear for everyday use · {pagination.total} products
          </p>
        </div>

        {/* Toolbar: Sorting & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="md"
            icon={SlidersHorizontal}
            onClick={() => setMobileFiltersOpen(true)}
            className="xl:hidden"
          >
            Filters
          </Button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={sortParam}
              onChange={(e) => updateFilterParam('sort', e.target.value)}
              className="max-w-[190px] px-3 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 bg-white text-sphere-charcoal focus:outline-none focus:ring-2 focus:ring-sphere-violet"
            >
              <option value="curated">Curated for you</option>
              <option value="newest">Newest Arrivals</option>
              <option value="bestseller">Best Sellers</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(categoryParam || brandParam || qParam || minPriceParam || maxPriceParam || inStockParam) && (
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-gray-100 text-xs">
          <span className="text-gray-400 font-semibold">Active filters:</span>
          {categoryParam && (
            <span className="inline-flex items-center gap-1 bg-sphere-violet-light text-sphere-violet px-2.5 py-1 rounded-full font-bold">
              Category: {categoryParam}
              <button onClick={() => updateFilterParam('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {brandParam && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold">
              Brand: {brandParam}
              <button onClick={() => updateFilterParam('brand', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {(minPriceParam || maxPriceParam) && (
            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-bold">
              Price: ₹{minPriceParam || '0'} - ₹{maxPriceParam || '∞'}
              <button onClick={() => { updateFilterParam('minPrice', ''); updateFilterParam('maxPrice', ''); }}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {inStockParam && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
              In Stock Only
              <button onClick={() => updateFilterParam('inStock', false)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={handleResetAll}
            className="text-xs text-sphere-violet font-semibold hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-[248px_minmax(0,1fr)] gap-5 xl:gap-7 pt-5 sm:pt-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden xl:block min-w-0">
          <div className="sticky top-28 bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
            <ProductFilters
              categories={categories}
              brands={brands}
              selectedCategory={categoryParam}
              onSelectCategory={(slug) => updateFilterParam('category', slug)}
              selectedBrand={brandParam}
              onSelectBrand={(slug) => updateFilterParam('brand', slug)}
              minPrice={minPriceParam}
              maxPrice={maxPriceParam}
              onPriceChange={(min, max) => {
                updateFilterParam('minPrice', min);
                updateFilterParam('maxPrice', max);
              }}
              rating={ratingParam}
              onRatingChange={(r) => updateFilterParam('rating', r)}
              inStock={inStockParam}
              onInStockToggle={(val) => updateFilterParam('inStock', val)}
              onReset={handleResetAll}
            />
          </div>
        </div>

        {/* Product Grid & Pagination */}
        <div className="min-w-0 space-y-7">
          <ProductGrid
            products={products}
            loading={loading}
            onResetFilters={handleResetAll}
          />

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-8 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                icon={ArrowLeft}
                disabled={!pagination.hasPrevPage}
                onClick={() => updateFilterParam('page', pageParam - 1)}
              >
                Previous
              </Button>
              <span className="text-xs font-semibold text-gray-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                icon={ArrowRight}
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilterParam('page', pageParam + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter Products"
        position="left"
      >
        <ProductFilters
          categories={categories}
          brands={brands}
          selectedCategory={categoryParam}
          onSelectCategory={(slug) => {
            updateFilterParam('category', slug);
            setMobileFiltersOpen(false);
          }}
          selectedBrand={brandParam}
          onSelectBrand={(slug) => {
            updateFilterParam('brand', slug);
            setMobileFiltersOpen(false);
          }}
          minPrice={minPriceParam}
          maxPrice={maxPriceParam}
          onPriceChange={(min, max) => {
            updateFilterParam('minPrice', min);
            updateFilterParam('maxPrice', max);
          }}
          rating={ratingParam}
          onRatingChange={(r) => updateFilterParam('rating', r)}
          inStock={inStockParam}
          onInStockToggle={(val) => updateFilterParam('inStock', val)}
          onReset={() => {
            handleResetAll();
            setMobileFiltersOpen(false);
          }}
        />
      </Drawer>
    </div>
  );
};
