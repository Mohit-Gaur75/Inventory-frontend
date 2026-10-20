import React from 'react';

/**
 * Reusable Section component for consistent page sections
 * Provides proper spacing and optional titles
 */
const Section = ({ 
  children, 
  title,
  subtitle,
  className = '',
  containerClassName = '',
  background = 'bg-transparent',
  spacing = 'py-12',
  ...props 
}) => {
  return (
    <section className={`${background} ${spacing} ${className}`} {...props}>
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {subtitle && (
              <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-800 mt-2">
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

/**
 * Section Grid component for consistent grid layouts
 */
export const SectionGrid = ({ children, cols = 4, gap = 'gap-6', className = '' }) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colsClasses[cols]} ${gap} ${className}`}>
      {children}
    </div>
  );
};

export default Section;
