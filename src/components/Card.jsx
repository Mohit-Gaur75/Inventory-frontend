import React from 'react';

/**
 * Reusable Card component with consistent styling and hover states
 * Provides a clean directory-style aesthetic for content
 */
const Card = ({ 
  children, 
  className = '',
  hover = true,
  padding = 'p-6',
  ...props 
}) => {
  const hoverClasses = hover 
    ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' 
    : '';

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm ${hoverClasses} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header component for consistent card headers
 */
export const CardHeader = ({ title, subtitle, icon: Icon, action, className = '' }) => {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Icon className="w-5 h-5 text-teal-600" />
          </div>
        )}
        <div>
          {title && <h2 className="font-display font-bold text-lg text-slate-800">{title}</h2>}
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
};

export default Card;
