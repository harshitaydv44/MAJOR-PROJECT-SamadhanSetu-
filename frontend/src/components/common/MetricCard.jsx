import React from 'react';

const colorStyles = {
  maroon: {
    border: 'border-l-4 border-l-gov-maroon',
    iconBg: 'bg-gov-maroon-surface text-gov-maroon',
    badge: 'text-gov-maroon bg-gov-maroon-surface'
  },
  navy: {
    border: 'border-l-4 border-l-gov-navy',
    iconBg: 'bg-gov-navy-surface text-gov-navy',
    badge: 'text-gov-navy bg-gov-navy-surface'
  },
  amber: {
    border: 'border-l-4 border-l-amber-600',
    iconBg: 'bg-amber-50 text-amber-700',
    badge: 'text-amber-800 bg-amber-50'
  },
  emerald: {
    border: 'border-l-4 border-l-emerald-600',
    iconBg: 'bg-emerald-50 text-emerald-700',
    badge: 'text-emerald-800 bg-emerald-50'
  },
  blue: {
    border: 'border-l-4 border-l-blue-600',
    iconBg: 'bg-blue-50 text-blue-700',
    badge: 'text-blue-800 bg-blue-50'
  },
  indigo: {
    border: 'border-l-4 border-l-indigo-600',
    iconBg: 'bg-indigo-50 text-indigo-700',
    badge: 'text-indigo-800 bg-indigo-50'
  },
  purple: {
    border: 'border-l-4 border-l-purple-600',
    iconBg: 'bg-purple-50 text-purple-700',
    badge: 'text-purple-800 bg-purple-50'
  },
  cyan: {
    border: 'border-l-4 border-l-cyan-600',
    iconBg: 'bg-cyan-50 text-cyan-700',
    badge: 'text-cyan-800 bg-cyan-50'
  }
};

const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon = null,
  accent = 'navy',
  badgeText = null,
  onClick
}) => {
  const currentStyle = colorStyles[accent] || colorStyles.navy;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-white border border-gov-border rounded-sm p-3 sm:p-3.5 shadow-gov-card hover:shadow-gov-hover transition-all duration-150 flex flex-col justify-between ${
        currentStyle.border
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top Header Row: Title & Badge + Anchored Icon */}
      <div className="flex items-start justify-between gap-1.5 w-full">
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1">
            <span className="text-[10px] sm:text-[11px] font-serif font-bold text-gov-text-secondary uppercase tracking-wider leading-tight">
              {title}
            </span>
            {badgeText && (
              <span className={`text-[9px] font-serif px-1.5 py-0.5 rounded-xs font-bold leading-none ${currentStyle.badge}`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
              currentStyle.iconBg
            }`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>

      {/* Middle Row: Primary Value */}
      <div className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-gov-navy leading-none tracking-tight">
        {value !== undefined ? value : '--'}
      </div>

      {/* Bottom Row: Subtitle */}
      {subtitle && (
        <p className="mt-1.5 text-[10px] sm:text-[11px] font-serif text-gov-text-muted truncate leading-tight">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default MetricCard;
