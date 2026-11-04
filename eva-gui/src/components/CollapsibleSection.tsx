'use client';

import React, { useRef } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle2, Edit3, Check } from 'lucide-react';
import { SectionConfig, SectionValidation, SummaryItem } from '../lib/sectionConfig';

interface CollapsibleSectionProps {
  config: SectionConfig;
  validation: SectionValidation;
  summaryItems: SummaryItem[];
  isCollapsed: boolean;
  onToggle: () => void;
  onFinish?: () => void;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  config,
  validation,
  summaryItems,
  isCollapsed,
  onToggle,
  onFinish,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isComplete, errors, warnings } = validation;
  const hasErrors = errors.length > 0;
  const hasWarnings = warnings.length > 0 && !hasErrors;

  // Determine badge styling and label
  const renderStatusBadge = () => {
    if (hasErrors) {
      return (
        <span
          className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 text-xs font-semibold"
          title={errors.join('; ')}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          <span>Fehler ({errors.length})</span>
        </span>
      );
    }
    if (isComplete) {
      return (
        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Erfasst</span>
        </span>
      );
    }
    return (
      <span
        className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 text-xs font-semibold"
        title={hasWarnings ? warnings.join('; ') : undefined}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
        <span>Offen</span>
      </span>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const contentId = `${config.id}-content`;
  const headerId = `${config.id}-header`;

  return (
    <div
      ref={containerRef}
      id={config.id}
      data-section-id={config.id}
      data-is-complete={isComplete}
      data-has-errors={hasErrors}
      tabIndex={-1}
      className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
        hasErrors
          ? 'border-rose-300 ring-1 ring-rose-100'
          : isCollapsed
          ? 'border-slate-200 hover:border-slate-300'
          : 'border-slate-200 ring-1 ring-blue-500/10'
      }`}
    >
      {/* Header Bar */}
      <div
        id={headerId}
        role="button"
        tabIndex={0}
        aria-expanded={!isCollapsed}
        aria-controls={contentId}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-sm ring-2 ring-blue-100 shrink-0">
            {config.number}
          </span>
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
              <span className="truncate">{config.title}</span>
              {config.badge && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                  {config.badge}
                </span>
              )}
            </h2>
            {config.subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 truncate hidden sm:block">
                {config.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {renderStatusBadge()}
          <span
            aria-hidden="true"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-slate-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-slate-500" />
            )}
          </span>
        </div>
      </div>

      {/* Validation Errors banner if any */}
      {hasErrors && (
        <div className="mx-6 mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Eingabefehler (automatisches Einklappen gesperrt):</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Collapsed Compact Summary View */}
      {isCollapsed ? (
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="px-6 pb-5 pt-0 border-t border-slate-100 text-xs text-slate-600 animate-fadeIn"
        >
          {summaryItems.length > 0 ? (
            <div className="pt-3.5 flex flex-wrap items-center gap-2">
              {summaryItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                    item.highlight
                      ? 'bg-blue-50/70 text-blue-900 border-blue-200 font-semibold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 font-normal'
                  }`}
                >
                  <span className="text-slate-400 font-medium">{item.label}:</span>
                  <span className="text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="pt-3 text-slate-400 italic">Noch keine Daten erfasst.</p>
          )}

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Sektion ist eingeklappt. Klicken Sie auf Bearbeiten, um Anpassungen vorzunehmen.
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Aufklappen / Bearbeiten</span>
            </button>
          </div>
        </div>
      ) : (
        /* Expanded Form View */
        <div
          id={contentId}
          role="region"
          aria-labelledby={headerId}
          className="px-6 pb-6 pt-0 border-t border-slate-100"
        >
          <div className="pt-4">{children}</div>

          {/* Section Action Bar (Fertig / Einklappen button) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {isComplete && !hasErrors ? (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Alle Pflichtdaten für diesen Abschnitt erfasst.
                </span>
              ) : hasErrors ? (
                <span className="text-rose-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Bitte korrigieren Sie die markierten Fehler.
                </span>
              ) : (
                <span>Erfassen Sie alle relevanten Daten für diese Sektion.</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (onFinish) {
                  onFinish();
                } else {
                  onToggle();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white transition-colors border border-slate-200 hover:border-blue-600 shadow-xs"
              title="Abschnitt fertigstellen und einklappen"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Fertig / Einklappen</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
