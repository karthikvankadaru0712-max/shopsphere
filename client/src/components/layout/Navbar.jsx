import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User as UserIcon, Menu, X, Sparkles, Compass, Gift, Layers, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import api from '../../services/api';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSuggestions(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get('/products/search/suggestions', {
          params: { q: searchQuery.trim() }
        });
        if (res.success && res.data?.suggestions) {
          setSuggestions(res.data.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-1 sm:gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sphere-charcoal to-sphere-violet flex items-center justify-center text-white shadow-md shadow-sphere-violet/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl tracking-tighter">S</span>
            </div>
            <div>
              <span className="text-base sm:text-xl font-bold tracking-tight text-sphere-charcoal flex items-center gap-1">
                ShopSphere
                <span className="w-1.5 h-1.5 rounded-full bg-sphere-violet"></span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-medium hidden sm:block">
                Discover Better
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/shop" className="hover:text-sphere-violet transition-colors">
              Catalogue
            </Link>
            <Link to="/matchscore" className="flex items-center gap-1.5 hover:text-sphere-violet transition-colors">
              <Sparkles className="w-4 h-4 text-sphere-violet" />
              <span>MatchScore</span>
            </Link>
            <Link to="/vibefind" className="flex items-center gap-1.5 hover:text-sphere-violet transition-colors">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>VibeFind</span>
            </Link>
            <Link to="/gift-finder" className="flex items-center gap-1.5 hover:text-sphere-violet transition-colors">
              <Gift className="w-4 h-4 text-rose-500" />
              <span>Gift Finder</span>
            </Link>
            <Link to="/collections" className="flex items-center gap-1.5 hover:text-sphere-violet transition-colors">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Collections</span>
            </Link>
          </nav>

          {/* Live Search Bar */}
          <div ref={searchRef} className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search gear, acoustic, audio, desks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sphere-violet/30 focus:border-sphere-violet transition-all"
                />
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden z-50">
                <div className="p-2">
                  <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1 tracking-wider">
                    Instant Suggestions
                  </div>
                  {suggestions.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setShowSuggestions(false);
                        if (item.type === 'product') navigate(`/product/${item.slug}`);
                        else if (item.type === 'category') navigate(`/shop?category=${item.slug}`);
                        else if (item.type === 'brand') navigate(`/shop?brand=${item.slug}`);
                      }}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-8 h-8 rounded-lg object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                          <Search className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-sphere-charcoal truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-600 uppercase">{item.type}</p>
                      </div>
                      {item.price && (
                        <span className="text-xs font-bold text-sphere-violet">
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons: Wishlist, Cart, User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="relative hidden sm:inline-flex p-2.5 text-gray-700 hover:text-sphere-charcoal hover:bg-gray-50 rounded-full transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 text-gray-700 hover:text-sphere-charcoal hover:bg-gray-50 rounded-full transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-sphere-violet text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            <div ref={userMenuRef} className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-gray-200 hover:border-gray-300 bg-white transition-all"
                  >
                    <span className="text-xs font-semibold text-sphere-charcoal hidden sm:inline max-w-[100px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-sphere-violet/20"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-bold text-sphere-charcoal truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-600 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                            Administrator
                          </span>
                        )}
                      </div>

                      <div className="py-1 text-xs font-medium text-gray-700">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sphere-violet font-semibold"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link to="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                          My Profile
                        </Link>
                        <Link to="/account/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                          Orders & Tracking
                        </Link>
                        <Link to="/account/product-library" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                          Ownership Hub & Care
                        </Link>
                        <Link to="/account/price-alerts" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                          Price Alerts
                        </Link>
                        <Link to="/account/collections" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                          Saved Collections
                        </Link>
                      </div>

                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  aria-label="Sign in"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-full bg-sphere-charcoal text-white hover:bg-black transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-sphere-charcoal rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search gear, acoustic, desks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sphere-violet"
              />
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link to="/shop" className="block text-sm font-medium py-1.5 text-gray-800">
            Product Catalogue
          </Link>
          <Link to="/account/wishlist" className="flex items-center gap-2 text-sm font-medium py-1.5 text-gray-800">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link to="/matchscore" className="flex items-center gap-2 text-sm font-medium py-1.5 text-sphere-violet">
            <Sparkles className="w-4 h-4" /> MatchScore Assistant
          </Link>
          <Link to="/vibefind" className="flex items-center gap-2 text-sm font-medium py-1.5 text-emerald-600">
            <Compass className="w-4 h-4" /> VibeFind Lifestyle
          </Link>
          <Link to="/gift-finder" className="flex items-center gap-2 text-sm font-medium py-1.5 text-rose-500">
            <Gift className="w-4 h-4" /> Gift Finder Quiz
          </Link>
          <Link to="/collections" className="flex items-center gap-2 text-sm font-medium py-1.5 text-amber-600">
            <Layers className="w-4 h-4" /> Smart Collections
          </Link>
          {isAdmin && (
            <Link to="/admin" className="block text-sm font-semibold py-1.5 text-purple-600">
              Admin Portal &rarr;
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
