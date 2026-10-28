import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-sphere-accent text-sphere-primary flex items-center justify-center shadow-lg shadow-sphere-primary/20">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '8s' }} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-sphere-primary">Error 404</span>
          <h1 className="text-4xl font-black text-sphere-heading tracking-tight">Lost in the Sphere?</h1>
          <p className="text-sm text-sphere-subtle">
            The page you're searching for might have been shifted, renamed, or temporarily tucked away.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" /> Back to Storefront
            </Button>
          </Link>
          <Link to="/shop" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" /> Browse Catalog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
