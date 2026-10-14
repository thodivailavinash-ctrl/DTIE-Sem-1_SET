import React from 'react';
import { Sparkles, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * Visual badge & control displaying the AI-suggested category, confidence, and reason.
 * Allows the user to click "Change" to manually override or pick another category.
 */
export default function AiCategoryBadge({
  loading = false,
  suggestion = null,
  error = null,
  isManualOverride = false,
  onResetToSuggestion,
  onChangeCategory,
  onRetry
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/25 text-xs text-[#22D3EE] animate-pulse">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        <span className="font-medium">AI analyzing transaction description...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#94A3B8]">
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
          <span className="truncate">{error}</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="text-[11px] font-medium text-[#22D3EE] hover:underline shrink-0 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!suggestion) {
    return null;
  }

  const confidencePct = Math.round((suggestion.confidence ?? 0.8) * 100);
  const isLowConfidence = suggestion.isLowConfidence || confidencePct < 65;

  return (
    <div
      className={`p-3 rounded-xl border text-xs transition-all ${
        isLowConfidence
          ? 'bg-[#FBBF24]/10 border-[#FBBF24]/30 text-[#FBBF24]'
          : 'bg-[#22D3EE]/10 border-[#22D3EE]/30 text-[#F8FAFC]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1 rounded-lg bg-white/10 shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#F8FAFC]">
                Suggested: <span className="text-[#22D3EE]">{suggestion.category}</span>
              </span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold border ${
                  isLowConfidence
                    ? 'bg-[#FBBF24]/20 text-[#FBBF24] border-[#FBBF24]/40'
                    : 'bg-[#34D399]/20 text-[#34D399] border-[#34D399]/40'
                }`}
              >
                {confidencePct}% confidence
              </span>
              {isManualOverride && (
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-medium bg-white/10 text-[#94A3B8]">
                  Manually adjusted
                </span>
              )}
            </div>

            <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
              {suggestion.reason}
            </p>

            {isLowConfidence && !isManualOverride && (
              <p className="text-[11px] text-[#FBBF24] font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Please check this suggestion.
              </p>
            )}
          </div>
        </div>

        {/* Change / Reset controls */}
        <div className="shrink-0 flex items-center gap-2">
          {isManualOverride && onResetToSuggestion && (
            <button
              type="button"
              onClick={onResetToSuggestion}
              className="text-[11px] font-medium text-[#22D3EE] hover:underline"
            >
              Reset to AI
            </button>
          )}
          {onChangeCategory && (
            <button
              type="button"
              onClick={onChangeCategory}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-medium text-[#F8FAFC] transition-colors"
            >
              Change
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
