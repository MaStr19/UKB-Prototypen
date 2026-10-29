import React from 'react';

interface SectionHeaderProps {
  number: number;
  title: string;
  subtitle?: string;
  badge?: string;
  isComplete?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  number,
  title,
  subtitle,
  badge,
  isComplete,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-5">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm ring-2 ring-blue-100">
          {number}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {typeof isComplete === 'boolean' && (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isComplete ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Erfasst
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Offen
            </span>
          )}
        </div>
      )}
    </div>
  );
};
