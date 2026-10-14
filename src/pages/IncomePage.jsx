import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  ArrowDownLeft,
  Info,
  X,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useFinance } from '../context/FinanceContext';
import { INCOME_SOURCES, PAYMENT_METHODS, getCategoryMeta } from '../utils/categories';
import {
  MONTHS,
  formatINR,
  formatReadableDate,
  getTodayDateString
} from '../utils/formatters';
import { useAutoCategorization } from '../hooks/useAutoCategorization';
import { useVoiceInput } from '../hooks/useVoiceInput';
import AiCategoryBadge from '../components/ui/AiCategoryBadge';
import VoiceInputButton from '../components/ui/VoiceInputButton';

const incomeSchema = z.object({
  amount: z
    .string()
    .min(1, 'Income amount is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: 'Amount must be greater than ₹0'
    }),
  category: z.string().min(1, 'Select an income source'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is required'),
  paymentMethod: z.string().optional()
});

export default function IncomePage() {
  const {
    selectedMonth,
    selectedYear,
    monthlyTransactions,
    monthlySummary,
    addTransaction,
    updateTransaction,
    deleteTransaction
  } = useFinance();

  const [editingIncome, setEditingIncome] = useState(null);
  const [deletingIncome, setDeletingIncome] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: '',
      category: 'Salary',
      date: getTodayDateString(),
      description: '',
      paymentMethod: 'Net Banking'
    }
  });

  const selectedSource = watch('category');
  const watchedDescription = watch('description');

  // AI Auto-categorization hook for Income sources
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
    type: 'income',
    onSuggestionApplied: (sugg) => {
      setValue('category', sugg.category, { shouldValidate: true });
    }
  });

  // Voice input hook for income description
  const {
    isListening: isVoiceListening,
    isSupported: isVoiceSupported,
    toggleListening: toggleVoiceListening
  } = useVoiceInput({
    onTranscript: (spokenText) => {
      setValue('description', spokenText, { shouldValidate: true, shouldDirty: true });
    }
  });

  const incomeTransactions = useMemo(
    () => monthlyTransactions.filter((tx) => tx.type === 'income'),
    [monthlyTransactions]
  );

  // Breakdown by income source
  const sourceTotals = useMemo(() => {
    const map = {};
    INCOME_SOURCES.forEach((s) => {
      map[s.id] = 0;
    });
    incomeTransactions.forEach((tx) => {
      const key = map[tx.category] !== undefined ? tx.category : 'Other';
      map[key] += Number(tx.amount) || 0;
    });
    return INCOME_SOURCES.map((s) => ({
      ...s,
      amount: map[s.id] || 0
    }));
  }, [incomeTransactions]);

  const onSubmit = (data) => {
    const isAiSuggested = aiSuggestion && aiSuggestion.category === data.category && !isManualOverride;

    if (editingIncome) {
      updateTransaction(editingIncome.id, {
        type: 'income',
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        description: data.description.trim(),
        paymentMethod: data.paymentMethod || 'Net Banking',
        aiSuggested: Boolean(isAiSuggested),
        aiConfidence: aiSuggestion?.confidence,
        aiReason: aiSuggestion?.reason
      });
      toast.success('Income record updated');
      setEditingIncome(null);
    } else {
      addTransaction({
        type: 'income',
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        description: data.description.trim(),
        paymentMethod: data.paymentMethod || 'Net Banking',
        aiSuggested: Boolean(isAiSuggested),
        aiConfidence: aiSuggestion?.confidence,
        aiReason: aiSuggestion?.reason
      });
      toast.success(`Added ${formatINR(Number(data.amount))} (${data.category}) to income!`);
    }

    reset({
      amount: '',
      category: 'Salary',
      date: getTodayDateString(),
      description: '',
      paymentMethod: 'Net Banking'
    });
    clearAiSuggestion();
  };

  const startEditing = (tx) => {
    setEditingIncome(tx);
    setValue('amount', String(tx.amount));
    setValue('category', tx.category);
    setValue('date', tx.date);
    setValue('description', tx.description);
    setValue('paymentMethod', tx.paymentMethod || 'Net Banking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditing = () => {
    setEditingIncome(null);
    reset({
      amount: '',
      category: 'Salary',
      date: getTodayDateString(),
      description: '',
      paymentMethod: 'Net Banking'
    });
    clearAiSuggestion();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
          Income Management
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Track monthly earnings across Salary, Freelance, Business, Gift, and Other sources.
        </p>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard interactive className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">
              {MONTHS[selectedMonth]} {selectedYear} Income
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-heading font-bold text-[#34D399]">
            <AnimatedCounter value={monthlySummary.totalIncome} />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            From {incomeTransactions.length} recorded inflow{incomeTransactions.length === 1 ? '' : 's'}
          </p>
        </GlassCard>

        <GlassCard interactive className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Net Available Cash</span>
            <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl sm:text-3xl font-heading font-bold ${
              monthlySummary.netCashFlow >= 0 ? 'text-[#F8FAFC]' : 'text-[#FB7185]'
            }`}
          >
            <AnimatedCounter value={monthlySummary.netCashFlow} />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Total Income minus {formatINR(monthlySummary.totalExpenses)} expenses
          </p>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between bg-[#8B5CF6]/5 border-[#8B5CF6]/25">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#8B5CF6] shrink-0 mt-0.5" />
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              <strong className="text-[#F8FAFC]">Smart Distinction:</strong> Income increases your{' '}
              <span className="text-[#34D399]">Net Available Cash</span>, while your{' '}
              <span className="text-[#22D3EE]">Monthly Spending Budget ({formatINR(monthlySummary.monthlyBudget)})</span>{' '}
              is configured independently in Budget Manager.
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Add / Edit Income Form + Source Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-7 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
              {editingIncome ? 'Edit Income Entry' : 'Record New Income'}
            </h2>
            {editingIncome && (
              <button
                type="button"
                onClick={cancelEditing}
                className="text-xs text-[#FB7185] hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Amount in INR (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="e.g. 40000"
                  {...register('amount')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-heading font-semibold fintech-input"
                />
                {errors.amount && (
                  <p className="text-xs text-[#FB7185] mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                  Date Received *
                </label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                />
                {errors.date && (
                  <p className="text-xs text-[#FB7185] mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 flex items-center justify-between">
                    <span>Description *</span>
                    <div className="flex items-center gap-2">
                      {isVoiceListening && (
                        <span className="text-[11px] text-[#FB7185] font-semibold animate-pulse">
                          Listening...
                        </span>
                      )}
                      <span className="text-[11px] text-[#34D399] font-normal">AI auto-categorization enabled</span>
                    </div>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="e.g. Monthly salary / Freelance web app / Gumroad royalties"
                      {...register('description')}
                      onBlur={triggerAiImmediate}
                      className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm fintech-input"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        isListening={isVoiceListening}
                        isSupported={isVoiceSupported}
                        onClick={toggleVoiceListening}
                        title="Click to speak income description"
                      />
                    </div>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-[#FB7185] mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Deposit Mode
                  </label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input cursor-pointer"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm} className="bg-[#10182B]">
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Category Suggestion Badge for Income */}
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
                onChangeCategory={() => {}}
                onRetry={reclassifyAi}
              />
            </div>

            {/* Income Source Pills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#94A3B8]">
                  Income Source: <strong className="text-[#34D399]">{selectedSource}</strong>
                  {aiSuggestion && aiSuggestion.category === selectedSource && !isManualOverride && (
                    <span className="ml-2 text-[10px] text-[#34D399] font-normal">(AI Suggested)</span>
                  )}
                </label>
                <span className="text-[11px] text-[#94A3B8]">Click any source to change</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {INCOME_SOURCES.map((src) => {
                  const Icon = src.icon;
                  const active = selectedSource === src.id;
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => {
                        setValue('category', src.id, { shouldValidate: true });
                        markManualOverride();
                      }}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        active
                          ? 'bg-[#34D399]/15 border-[#34D399] text-[#F8FAFC]'
                          : 'bg-white/[0.02] border-white/10 text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" style={{ color: src.color }} />
                      <span className="text-xs font-medium">{src.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              {editingIncome && (
                <GradientButton variant="secondary" size="sm" onClick={cancelEditing}>
                  Cancel
                </GradientButton>
              )}
              <GradientButton type="submit" size="md">
                {editingIncome ? (
                  <>
                    <Check className="w-4 h-4" /> Update Income
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Income
                  </>
                )}
              </GradientButton>
            </div>
          </form>
        </GlassCard>

        {/* Income Sources Breakdown */}
        <GlassCard className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
              Income by Source
            </h2>
            <p className="text-xs text-[#94A3B8] mb-4">
              Breakdown for {MONTHS[selectedMonth]} {selectedYear}
            </p>

            <div className="space-y-3">
              {sourceTotals.map((src) => {
                const Icon = src.icon;
                const pct =
                  monthlySummary.totalIncome > 0
                    ? Math.round((src.amount / monthlySummary.totalIncome) * 100)
                    : 0;

                return (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/5"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-2 font-medium text-[#F8FAFC]">
                        <Icon className="w-4 h-4" style={{ color: src.color }} />
                        {src.name}
                      </span>
                      <span className="font-heading font-semibold text-[#F8FAFC]">
                        {formatINR(src.amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: src.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Income History List */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-heading font-bold text-[#F8FAFC] mb-4">
          Income History ({MONTHS[selectedMonth]} {selectedYear})
        </h2>

        {incomeTransactions.length === 0 ? (
          <p className="text-sm text-[#94A3B8] py-8 text-center">
            No income entries recorded for this month yet.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {incomeTransactions.map((tx) => {
              const meta = getCategoryMeta(tx.category, 'income');
              const Icon = meta.icon;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${meta.color}18`,
                        color: meta.color
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F8FAFC] truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#94A3B8] mt-0.5">
                        <span className="text-[#34D399] font-medium">{tx.category}</span>
                        <span>•</span>
                        <span>{formatReadableDate(tx.date)}</span>
                        <span>•</span>
                        <span>{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-heading font-bold text-[#34D399] flex items-center gap-1">
                      <ArrowDownLeft className="w-4 h-4" />+{formatINR(tx.amount)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => startEditing(tx)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22D3EE] hover:bg-[#22D3EE]/10"
                        title="Edit income"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingIncome(tx)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FB7185] hover:bg-[#FB7185]/10"
                        title="Delete income"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        isOpen={Boolean(deletingIncome)}
        title="Delete Income Record?"
        message={
          deletingIncome
            ? `Are you sure you want to delete "${deletingIncome.description}" (${formatINR(
                deletingIncome.amount
              )})?`
            : ''
        }
        confirmLabel="Delete Income"
        onConfirm={() => {
          deleteTransaction(deletingIncome.id);
          toast.success('Income record deleted');
          setDeletingIncome(null);
        }}
        onCancel={() => setDeletingIncome(null)}
      />
    </div>
  );
}
