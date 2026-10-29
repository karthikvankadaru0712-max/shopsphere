import React from 'react';

const badgeVariants = {
  violet: 'bg-sphere-violet-light text-sphere-violet border-sphere-violet/20',
  mint: 'bg-sphere-mint text-emerald-800 border-emerald-300',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  charcoal: 'bg-sphere-charcoal text-white border-transparent',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  red: 'bg-red-50 text-red-700 border-red-200'
};

export const Badge = ({ children, variant = 'gray', className = '', icon: Icon }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeVariants[variant] || badgeVariants.gray} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
