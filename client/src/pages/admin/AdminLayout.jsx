import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Ticket,
  Star,
  RotateCcw,
  ShieldAlert,
  ArrowLeft,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Inventory', to: '/admin/inventory', icon: Layers },
    { label: 'Coupons', to: '/admin/coupons', icon: Ticket },
    { label: 'Reviews', to: '/admin/reviews', icon: Star },
    { label: 'Returns', to: '/admin/returns', icon: RotateCcw },
    { label: 'Audit Trail', to: '/admin/audit-logs', icon: ShieldAlert }
  ];

  return (
    <div className="min-h-screen bg-sphere-canvas flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sphere-card border-r border-sphere-border flex flex-col shrink-0 sticky top-0 h-screen select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-sphere-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sphere-primary flex items-center justify-center text-white font-black text-sm shadow-md shadow-sphere-primary/30">
              S
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-sphere-heading">ShopSphere</span>
              <span className="block text-[10px] font-bold text-sphere-primary uppercase tracking-widest">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Admin Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-sphere-subtle px-3 py-2">
            Operations
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-sphere-primary text-white shadow-sm shadow-sphere-primary/20'
                    : 'text-sphere-subtle hover:text-sphere-heading hover:bg-sphere-canvas'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Quick Links & Footer */}
        <div className="p-4 border-t border-sphere-border space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-sphere-subtle hover:text-sphere-heading hover:bg-sphere-canvas transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" /> View Storefront
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-sphere-border/60">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-sphere-accent text-sphere-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-sphere-heading truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-sphere-subtle truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-sphere-subtle hover:text-rose-500 hover:bg-rose-50 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-sphere-card/90 backdrop-blur-md border-b border-sphere-border px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-xs font-bold text-sphere-subtle hover:text-sphere-heading flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold">
              System Online (MongoDB Active)
            </span>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
