import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  User,
  Package,
  Wrench,
  Heart,
  Bell,
  Layers,
  MapPin,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccountLayout = () => {
  const { user, logout } = useAuth();

  const links = [
    { to: '/account', label: 'Profile & Settings', icon: User, end: true },
    { to: '/account/orders', label: 'Orders & Tracking', icon: Package },
    { to: '/account/product-library', label: 'Ownership Hub & Care', icon: Wrench, badge: 'Smart' },
    { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account/price-alerts', label: 'Price Alerts', icon: Bell },
    { to: '/account/collections', label: 'Saved Collections', icon: Layers },
    { to: '/account/notifications', label: 'Notifications', icon: Bell },
    { to: '/account/addresses', label: 'Delivery Addresses', icon: MapPin },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white rounded-3xl p-6 border border-gray-100 shadow-soft space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-sphere-violet/20"
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-sphere-charcoal truncate">{user?.name}</h3>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-sphere-violet text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-sphere-charcoal'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Outlet */}
        <main className="lg:col-span-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
