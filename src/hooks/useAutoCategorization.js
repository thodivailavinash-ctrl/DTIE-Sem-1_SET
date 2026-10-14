import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to automatically classify transaction descriptions using the secure server-side AI endpoint.
 *
 * Requirements met:
 * - Debounces keystrokes (wait briefly before sending request).
 * - Cancels or ignores stale requests if the user continues typing.
 * - Allows manual immediate trigger on input blur.
 * - Shows loading, suggested category, confidence, and short reason.
 * - Supports both "expense" and "income" categories.
 * - Never transmits user PII, only description and type.
 *
 * @param {Object} options
 * @param {string} options.description - current input description
 * @param {'expense'|'income'} options.type - transaction type
 * @param {Function} options.onSuggestionApplied - callback when a valid category suggestion arrives
 * @param {boolean} options.enabled - whether auto-classification is enabled
 */
export function useAutoCategorization({
  description,
  type = 'expense',
  onSuggestionApplied,
  enabled = true
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState(null);
  const [isManualOverride, setIsManualOverride] = useState(false);

  // Keep track of active request ID to ignore stale responses
  const activeRequestIdRef = useRef(0);
  const lastClassifiedDescRef = useRef('');
  const abortControllerRef = useRef(null);

  const fetchCategorization = useCallback(
    async (textToClassify, currentType) => {
      const cleanText = (textToClassify || '').trim();
      if (!cleanText || cleanText.length < 2 || !enabled) {
        setSuggestion(null);
        setError(null);
        setLoading(false);
        return;
      }

      // Do not re-fetch if exactly the same description and type was just classified
      if (lastClassifiedDescRef.current === `${cleanText}__${currentType}`) {
        return;
      }

      // Abort any ongoing in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const requestId = ++activeRequestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/categorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            description: cleanText,
            type: currentType
          }),
          signal: abortControllerRef.current.signal
        });

        // Ignore if a newer request has started
        if (requestId !== activeRequestIdRef.current) {
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          // AI service unavailable or key missing
          const errorMsg =
            data.code === 'API_KEY_MISSING'
              ? 'AI categorization unavailable: GEMINI_API_KEY is not set on the server.'
              : data.error || 'AI categorization unavailable.';
          setError(errorMsg);
          setSuggestion(null);
          setLoading(false);
          return;
        }

        if (data.category) {
          lastClassifiedDescRef.current = `${cleanText}__${currentType}`;
          const result = {
            category: data.category,
            confidence: data.confidence ?? 0.8,
            reason: data.reason || 'AI categorized',
            isLowConfidence: (data.confidence ?? 0.8) < 0.65
          };

          setSuggestion(result);
          setIsManualOverride(false);

          if (typeof onSuggestionApplied === 'function') {
            onSuggestionApplied(result);
          }
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          return; // Request intentionally cancelled
        }
        if (requestId === activeRequestIdRef.current) {
          setError('Could not reach AI service. You can select a category manually.');
          setSuggestion(null);
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [enabled, onSuggestionApplied]
  );

  // Debounced effect: wait 650ms after user pauses typing before dispatching
  useEffect(() => {
    const clean = (description || '').trim();
    if (!clean || clean.length < 2 || !enabled) {
      setSuggestion(null);
      setError(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchCategorization(clean, type);
    }, 650);

    return () => clearTimeout(timer);
  }, [description, type, enabled, fetchCategorization]);

  // Immediate classification on input blur
  const triggerImmediate = useCallback(() => {
    const clean = (description || '').trim();
    if (clean && clean.length >= 2) {
      fetchCategorization(clean, type);
    }
  }, [description, type, fetchCategorization]);

  // Reset or clear suggestion
  const clearSuggestion = useCallback(() => {
    setSuggestion(null);
    setError(null);
    setLoading(false);
    lastClassifiedDescRef.current = '';
    setIsManualOverride(false);
  }, []);

  // Mark manual override when user intentionally changes the suggested category
  const markManualOverride = useCallback(() => {
    setIsManualOverride(true);
  }, []);

  return {
    loading,
    suggestion,
    error,
    isManualOverride,
    triggerImmediate,
    clearSuggestion,
    markManualOverride,
    reclassify: () => fetchCategorization(description, type)
  };
}
