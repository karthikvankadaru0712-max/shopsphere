import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-sphere-violet text-white hover:bg-sphere-violet-dark shadow-sm hover:shadow-glow',
  secondary: 'bg-sphere-charcoal text-white hover:bg-black shadow-sm',
  outline: 'border border-gray-300 text-sphere-charcoal bg-transparent hover:bg-gray-100',
  ghost: 'text-sphere-charcoal hover:bg-gray-100',
  mint: 'bg-sphere-mint text-emerald-900 hover:bg-emerald-200 font-medium',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl font-medium',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
};
