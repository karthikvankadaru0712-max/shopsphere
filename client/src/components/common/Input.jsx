import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      endIcon: EndIcon,
      onEndIconClick,
      helperText,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || Math.random().toString(36).substring(7);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-sphere-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sphere-violet focus:border-transparent transition-all duration-200 ${
              Icon ? 'pl-10' : ''
            } ${EndIcon ? 'pr-10' : ''} ${
              error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-gray-300'
            } ${className}`}
            {...props}
          />
          {EndIcon && (
            <button
              type="button"
              onClick={onEndIconClick}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <EndIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
