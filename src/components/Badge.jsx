import React from 'react';
import { Sparkles, TrendingUp, Tag, Zap, Star } from 'lucide-react';

/**
 * Reusable Badge component for consistent badge styling across the app
 * Supports multiple variants: new, sale, trending, hot, featured
 */
const Badge = ({ 
  variant = 'default', 
  children, 
  icon: CustomIcon,
  className = '',
  size = 'sm',
  ...props 
}) => {
  const variants = {
    new: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      text: 'text-white',
      icon: Sparkles,
    },
    sale: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      text: 'text-white',
      icon: Tag,
    },
    trending: {
      bg: 'bg-gradient-to-r from-teal-500 to-teal-600',
      text: 'text-white',
      icon: TrendingUp,
    },
    hot: {
      bg: 'bg-gradient-to-r from-red-600 to-rose-500',
      text: 'text-white',
      icon: Zap,
    },
    featured: {
      bg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      text: 'text-white',
      icon: Star,
    },
    default: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      icon: null,
    },
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const config = variants[variant] || variants.default;
  const Icon = CustomIcon || config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ${config.bg} ${config.text} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

export default Badge;
