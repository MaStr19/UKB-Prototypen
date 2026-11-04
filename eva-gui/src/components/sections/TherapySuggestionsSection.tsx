'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { EvaRecord } from '../../types/eva';
import { suggest } from '../../ml/inference';
import {
  InferenceResult,
  Suggestion,
  TherapyTargetKey,
  ConfidenceTier,
} from '../../ml/types';
import {
  isFeedbackOptedIn,
  setFeedbackOptIn,
  logFeedbackDecision,
  exportFeedbackJson,
  clearStoredFeedback,
  getStoredFeedback,
} from '../../ml/feedback';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Layers,
  ShieldAlert,
  Loader2,
  Database,
  Download,
  Trash2,
  BrainCircuit,
  TrendingUp,
} from 'lucide-react';

interface Props {
  record: EvaRecord;
  onChange: <K extends keyof EvaRecord>(key: K, value: EvaRecord[K]) => void;
  onToast?: (msg: string) => void;
}

export const TherapySuggestionsSection: React.FC<Props> = ({ record, onChange, onToast }) => {
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optIn, setOptIn] = useState<boolean>(() => isFeedbackOptedIn());
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();


  // Run non-blocking inference when clinical inputs change
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      setIsLoading(true);
      suggest(record)
        .then((res) => {
          if (active) {
            startTransition(() => {
              setResult(res);
              setIsLoading(false);
            });
          }
        })
        .catch((err) => {
          console.error('Error running ML suggestion inference:', err);
          if (active) {
            setIsLoading(false);
            setResult({
              status: 'no_model',
              modelVersion: 'unknown',
              suggestions: [],
              message: 'Inferenzfehler beim Ausführen des Modells.',
            });
          }
        });
    }, 120); // debounce slightly for fast typing

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    record.substanzen,
    record.anamneseText,
    record.vitalGcs,
    record.vitalSpo2,
    record.vitalHf,
    record.vitalRr,
    record.vitalPh,
    record.vitalTemp,
    record.sympKeine,
    record.sympWachOrientiert,
    record.pssVor,
    record.zeitWert,
    record.zeitEinheit,
    record.alterWert,
    record.gewichtKg,
  ]);

  const handleToggleOptIn = (checked: boolean) => {
    setOptIn(checked);
    setFeedbackOptIn(checked);
    if (onToast) {
      onToast(
        checked
          ? '🔒 Lokales Feedback-Logging aktiviert (anonym, DSGVO-konform).'
          : 'Feedback-Logging deaktiviert.'
      );
    }
  };

  const handleAcceptSuggestion = (s: Suggestion) => {
    const updated = { ...record.therapien };
    const therapy = updated[s.therapyKey];

    if (therapy) {
      const newTherapy = { ...therapy, e: true };
      if (s.subOptionKey && newTherapy.subOptions) {
        newTherapy.subOptions = {
          ...newTherapy.subOptions,
          [s.subOptionKey]: true,
        };
      }
      updated[s.therapyKey] = newTherapy;
      onChange('therapien', updated);

      // Log decision event if opted in
      logFeedbackDecision({
        modelVersion: result?.modelVersion || '1.0.0',
        therapyId: s.therapyId,
        action: 'accepted',
        confidence: s.probability,
        activeFeatureKeys: s.explanation.map((e) => e.feature),
      });

      if (onToast) {
        onToast(`✅ Vorschlag übernommen: ${s.label} als empfohlen [e] markiert.`);
      }
    }
  };

  const handleRejectSuggestion = (s: Suggestion) => {
    setDismissedIds((prev) => ({ ...prev, [s.therapyId]: true }));

    // Log decision event if opted in
    logFeedbackDecision({
      modelVersion: result?.modelVersion || '1.0.0',
      therapyId: s.therapyId,
      action: 'rejected',
      confidence: s.probability,
      activeFeatureKeys: s.explanation.map((e) => e.feature),
    });

    if (onToast) {
      onToast(`❌ Vorschlag verworfen: ${s.label}`);
    }
  };

  const isAlreadyRecommended = (s: Suggestion): boolean => {
    const th = record.therapien[s.therapyKey];
    if (!th || !th.e) return false;
    if (s.subOptionKey && th.subOptions) {
      return Boolean(th.subOptions[s.subOptionKey]);
    }
    return true;
  };

  const getTierBadge = (tier: ConfidenceTier, prob: number) => {
    const pct = Math.round(prob * 100);
    switch (tier) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Hohe Konfidenz ({pct}%)
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            Moderate Konfidenz ({pct}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Prüfempfehlung ({pct}%)
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Clinical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold text-amber-950 flex items-center gap-1.5">
            <span>Klinischer Hinweis & Forschungs-Disclaimer</span>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.2 bg-amber-200/80 rounded border border-amber-300 text-amber-900">
              Synthetisches Modell
            </span>
          </p>
          <p className="mt-1 text-amber-850">
            Die folgenden Vorschläge basieren auf einem regularisierten Machine-Learning-Entscheidungsmodell,
            trainiert auf einem <strong>synthetischen Entwicklungskorpus</strong> (EAPCCT / EVA 5.26 Toxidrome).
            Dieses Modell ist <strong>nicht klinisch zugelassen</strong> und ersetzt keinesfalls die ärztliche
            Entscheidung oder toxikologische Leitlinienberatung. Vorschläge werden <em>niemals automatisch angewendet</em>.
          </p>
        </div>
      </div>

      {/* 2. Loading State or Status View */}
      {isLoading ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="font-medium">Berechne toxikologische Therapie- und Antidotvorschläge...</span>
        </div>
      ) : result?.status === 'insufficient_data' ? (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
          <Info className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Unzureichende Falldaten</p>
            <p className="text-slate-500 mt-0.5">{result.message}</p>
          </div>
        </div>
      ) : result?.status === 'low_confidence' ? (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="font-semibold text-slate-800">Keine spezifischen Vorschläge</p>
            <p className="text-slate-500 mt-0.5">{result.message}</p>
          </div>
        </div>
      ) : result?.status === 'no_model' ? (
        <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <p className="font-semibold text-rose-950">ML-Modell nicht verfügbar</p>
            <p className="text-rose-700 mt-0.5">{result.message}</p>
          </div>
        </div>
      ) : (
        /* 3. Suggestions List */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-blue-600" />
              Empfohlene Interventionen & Antidote ({result?.suggestions.filter((s) => !dismissedIds[s.therapyId]).length || 0})
            </span>
            <span className="text-[11px] text-slate-400">Sortiert nach berechneter Konfidenz</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {result?.suggestions
              .filter((s) => !dismissedIds[s.therapyId])
              .map((s) => {
                const alreadyAccepted = isAlreadyRecommended(s);

                return (
                  <div
                    key={s.therapyId}
                    className={`p-4 rounded-xl border transition-all ${
                      alreadyAccepted
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Therapy Name & Confidence */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm">{s.label}</h3>
                          {getTierBadge(s.confidenceTier, s.probability)}
                          {alreadyAccepted && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Im Protokoll empfohlen [e]
                            </span>
                          )}
                        </div>

                        {/* Top Driving Factors / Explanations */}
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-slate-400" />
                            Klinische Begründung:
                          </span>
                          {s.explanation.map((e, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] border border-slate-200"
                              title={`Feature ${e.feature} (Impact: ${e.impact > 0 ? '+' : ''}${e.impact})`}
                            >
                              <span>{e.description}</span>
                              <span className="font-mono text-[10px] text-slate-400">
                                ({e.impact > 0 ? '+' : ''}
                                {e.impact})
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right: Explicit User Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRejectSuggestion(s)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-medium transition-colors"
                          title="Vorschlag verwerfen"
                        >
                          <XCircle className="w-4 h-4 inline mr-1 text-slate-400" />
                          <span>Ablehnen</span>
                        </button>

                        <button
                          type="button"
                          disabled={alreadyAccepted}
                          onClick={() => handleAcceptSuggestion(s)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 ${
                            alreadyAccepted
                              ? 'bg-emerald-600 text-white cursor-default'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{alreadyAccepted ? 'Übernommen' : 'Übernehmen [e]'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 4. Opt-in Local Feedback Loop & Footer Metadata */}
      <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-500">
        {/* Opt-in Toggle */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => handleToggleOptIn(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
          />
          <div>
            <span className="font-medium text-slate-700">
              Lokales Feedback-Logging für Modell-Retraining (Opt-in, DSGVO-konform)
            </span>
            <p className="text-[11px] text-slate-400">
              Speichert ausschließlich anonymisierte Annahme-/Ablehnungs-Aktionen lokal im Browser ohne Personenbezug.
            </p>
          </div>
        </label>

        {/* Feedback management & metadata */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {optIn && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-[11px]">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Events: {getStoredFeedback().length}</span>
              <button
                type="button"
                onClick={exportFeedbackJson}
                className="hover:text-blue-600 ml-1 p-0.5 rounded"
                title="Feedback-Log als JSON herunterladen"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Lokale Feedback-Daten wirklich löschen?')) {
                    clearStoredFeedback();
                    if (onToast) onToast('Feedback-Speicher geleert.');
                  }
                }}
                className="hover:text-rose-600 ml-0.5 p-0.5 rounded"
                title="Feedback-Log löschen"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            <span>Modell: v{result?.modelVersion || '1.0.0'} (L2-Logistic) &bull; Stand: 2026-11-04</span>
          </div>
        </div>
      </div>
    </div>
  );
};
