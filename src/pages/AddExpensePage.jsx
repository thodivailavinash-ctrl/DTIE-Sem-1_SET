import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PlusCircle,
  CheckCircle2,
  Calendar,
  FileText,
  CreditCard,
  IndianRupee,
  ArrowLeft,
  Coins
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../utils/categories';
import { getTodayDateString, formatINR } from '../utils/formatters';
import { useFinance } from '../context/FinanceContext';
import { useAutoCategorization } from '../hooks/useAutoCategorization';
import { useVoiceInput } from '../hooks/useVoiceInput';
import AiCategoryBadge from '../components/ui/AiCategoryBadge';
import VoiceInputButton from '../components/ui/VoiceInputButton';

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be a positive number greater than ₹0'
    }),
  category: z.string().min(1, 'Please select a category'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description must be at least 2 characters'),
  paymentMethod: z.string().optional()
});

export default function AddExpensePage() {
  const { addTransaction, monthlySummary } = useFinance();
  const navigate = useNavigate();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [coinBurst, setCoinBurst] = useState(false);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: '',
      category: 'Food',
      date: getTodayDateString(),
      description: '',
      paymentMethod: 'UPI / GPay / PhonePe'
    }
  });

  const selectedCategory = watch('category');
  const watchedDescription = watch('description');

  // AI Auto-categorization hook
  const {
    loading: aiLoading,
    suggestion: aiSuggestion,
    error: aiError,
    isManualOverride,
    triggerImmediate: triggerAiImmediate,
    markManualOverride,
    clearSuggestion: clearAiSuggestion,
    reclassify: reclassifyAi
  } = useAutoCategorization({
    description: watchedDescription,
    type: 'expense',
    onSuggestionApplied: (sugg) => {
      setValue('category', sugg.category, { shouldValidate: true });
    }
  });

  // Voice input hook for description
  const {
    isListening: isVoiceListening,
    isSupported: isVoiceSupported,
    toggleListening: toggleVoiceListening
  } = useVoiceInput({
    onTranscript: (spokenText) => {
      setValue('description', spokenText, { shouldValidate: true, shouldDirty: true });
    }
  });

  const onSubmit = (data) => {
    // 1. Persist transaction to application state & LocalStorage FIRST
    const isAiSuggested = aiSuggestion && aiSuggestion.category === data.category && !isManualOverride;
    const savedTx = addTransaction({
      type: 'expense',
      amount: Number(data.amount),
      category: data.category,
      date: data.date,
      description: data.description,
      paymentMethod: data.paymentMethod || 'UPI / GPay / PhonePe',
      aiSuggested: Boolean(isAiSuggested),
      aiConfidence: aiSuggestion?.confidence,
      aiReason: aiSuggestion?.reason
    });

    if (!savedTx) {
      toast.error('Could not save expense');
      return;
    }

    // 2. Play coin burst & button success state after actual save
    setSavedSuccess(true);
    setCoinBurst(true);
    toast.success(`Saved ₹${Number(data.amount).toLocaleString('en-IN')} under ${data.category}!`);

    setTimeout(() => {
      reset({
        amount: '',
        category: data.category,
        date: getTodayDateString(),
        description: '',
        paymentMethod: data.paymentMethod
      });
      clearAiSuggestion();
      setShowCategoryGrid(false);
      setSavedSuccess(false);
      setCoinBurst(false);
    }, 1100);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Add New Expense
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Record a new INR expense and update your monthly budget in real time.
          </p>
        </div>

        <GradientButton variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </GradientButton>
      </div>

      {/* Live Budget Impact Strip */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">Monthly Budget</p>
          <p className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC] mt-0.5">
            {formatINR(monthlySummary.monthlyBudget)}
          </p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">Current Spent</p>
          <p className="text-base sm:text-lg font-heading font-bold text-[#22D3EE] mt-0.5">
            {formatINR(monthlySummary.totalExpenses)}
          </p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-xs text-[#94A3B8]">Remaining</p>
          <p
            className={`text-base sm:text-lg font-heading font-bold mt-0.5 ${
              monthlySummary.remainingBudget < 0 ? 'text-[#FB7185]' : 'text-[#34D399]'
            }`}
          >
            {formatINR(monthlySummary.remainingBudget)}
          </p>
        </GlassCard>
      </div>

      {/* Main Expense Form Card */}
      <GlassCard animatedBorder className="p-6 sm:p-8 relative overflow-hidden">
        {/* Coin Burst Animation on Save */}
        <AnimatePresence>
          {coinBurst && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#070B18]/60 backdrop-blur-sm"
            >
              <div className="relative flex flex-col items-center">
                {[...Array(7)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ y: 20, x: 0, scale: 0.4, opacity: 1 }}
                    animate={{
                      y: -85 - idx * 12,
                      x: (idx - 3) * 32,
                      scale: 1.1,
                      rotate: idx * 60,
                      opacity: 0
                    }}
                    transition={{ duration: 0.85, ease: 'easeOut' }}
                    className="absolute w-9 h-9 rounded-full bg-gradient-to-tr from-[#FBBF24] to-[#22D3EE] flex items-center justify-center text-[#070B18] font-bold shadow-[0_0_20px_rgba(251,191,36,0.7)]"
                  >
                    ₹
                  </motion.div>
                ))}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#34D399]/20 border border-[#34D399] flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                    <CheckCircle2 className="w-9 h-9 text-[#34D399]" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[#F8FAFC]">
                    Expense Saved!
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-0.5">
                    Dashboard metrics updated immediately
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                Amount in INR (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#22D3EE] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="e.g. 850"
                  {...register('amount')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-base font-heading font-semibold fintech-input"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-[#FB7185] mt-1.5">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                Transaction Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#8B5CF6] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  {...register('date')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm fintech-input"
                />
              </div>
              {errors.date && (
                <p className="text-xs text-[#FB7185] mt-1.5">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Description & Payment Method */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-2 flex items-center justify-between">
                  <span>Description *</span>
                  <div className="flex items-center gap-2">
                    {isVoiceListening && (
                      <span className="text-[11px] text-[#FB7185] font-semibold animate-pulse">
                        Listening... Speak now
                      </span>
                    )}
                    <span className="text-[11px] text-[#22D3EE] font-normal">AI auto-categorization enabled</span>
                  </div>
                </label>
                <div className="relative flex items-center">
                  <FileText className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Uber ride to campus / Lunch at cafe"
                    {...register('description')}
                    onBlur={triggerAiImmediate}
                    className="w-full pl-10 pr-12 py-3 rounded-xl text-sm fintech-input"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceInputButton
                      isListening={isVoiceListening}
                      isSupported={isVoiceSupported}
                      onClick={toggleVoiceListening}
                      title="Click to speak transaction description"
                    />
                  </div>
                </div>
                {errors.description && (
                  <p className="text-xs text-[#FB7185] mt-1.5">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                  Payment Method (Optional)
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    {...register('paymentMethod')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm fintech-input cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm} className="bg-[#10182B] text-white">
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* AI Category Suggestion Badge with Confidence, Reason, and Change Control */}
            <AiCategoryBadge
              loading={aiLoading}
              suggestion={aiSuggestion}
              error={aiError}
              isManualOverride={isManualOverride}
              onResetToSuggestion={() => {
                if (aiSuggestion) {
                  setValue('category', aiSuggestion.category, { shouldValidate: true });
                }
              }}
              onChangeCategory={() => setShowCategoryGrid((prev) => !prev)}
              onRetry={reclassifyAi}
            />
          </div>

          {/* Category Selector (Always available, with active category indicator and toggle/change) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-medium text-[#94A3B8]">
                Category: <strong className="text-[#22D3EE]">{selectedCategory}</strong>
                {aiSuggestion && aiSuggestion.category === selectedCategory && !isManualOverride && (
                  <span className="ml-2 text-[10px] text-[#34D399] font-normal">(AI Suggested)</span>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowCategoryGrid((p) => !p)}
                className="text-xs text-[#22D3EE] hover:underline font-medium"
              >
                {showCategoryGrid ? 'Hide Category List' : 'Change Category'}
              </button>
            </div>

            {/* Category Grid */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 transition-all ${showCategoryGrid ? 'block' : 'hidden sm:grid'}`}>
              {EXPENSE_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setValue('category', cat.id, { shouldValidate: true });
                      markManualOverride();
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/[0.08] border-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${cat.color}20`,
                        color: cat.color
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#F8FAFC] truncate">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="text-xs text-[#FB7185] mt-1.5">{errors.category.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-white/10">
            <GradientButton
              type="button"
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Cancel
            </GradientButton>
            <GradientButton
              type="submit"
              variant={savedSuccess ? 'success' : 'primary'}
              className="w-full sm:w-auto min-w-[170px]"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved Successfully</span>
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  <span>Save Expense</span>
                </>
              )}
            </GradientButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
