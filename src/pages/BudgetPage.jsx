import React, { useState, useEffect } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  IndianRupee,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import BudgetProgress from '../components/ui/BudgetProgress';
import { useFinance } from '../context/FinanceContext';
import { MONTHS, formatINR } from '../utils/formatters';

const PRESET_BUDGETS = [20000, 25000, 35000, 45000, 60000];

export default function BudgetPage() {
  const {
    selectedMonth,
    selectedYear,
    monthlySummary,
    categoryBreakdown,
    setMonthlyBudget
  } = useFinance();

  const [budgetInput, setBudgetInput] = useState(String(monthlySummary.monthlyBudget));

  useEffect(() => {
    setBudgetInput(String(monthlySummary.monthlyBudget));
  }, [monthlySummary.monthlyBudget, selectedMonth, selectedYear]);

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const numeric = Number(budgetInput);
    if (Number.isNaN(numeric) || numeric < 0) {
      toast.error('Please enter a valid non-negative budget amount');
      return;
    }
    setMonthlyBudget(numeric, selectedMonth, selectedYear);
    toast.success(
      `Monthly budget for ${MONTHS[selectedMonth]} ${selectedYear} set to ${formatINR(numeric)}`
    );
  };

  const pct = monthlySummary.budgetUsedPercentage;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
          Budget Manager
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Configure and monitor your spending cap for {MONTHS[selectedMonth]} {selectedYear}.
        </p>
      </div>

      {/* Overspending / Warning Banner */}
      {monthlySummary.isOverspent ? (
        <div className="p-4 rounded-2xl bg-[#FB7185]/15 border border-[#FB7185]/40 flex items-start gap-3.5 shadow-[0_0_25px_rgba(251,113,133,0.2)]">
          <AlertTriangle className="w-6 h-6 text-[#FB7185] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-heading font-bold text-[#FB7185]">
              Overspending Alert — Budget Exceeded by {formatINR(Math.abs(monthlySummary.remainingBudget))}!
            </h3>
            <p className="text-xs text-[#F8FAFC]/90 mt-0.5">
              Your total expenses ({formatINR(monthlySummary.totalExpenses)}) have reached{' '}
              <strong>{pct}%</strong> of your {formatINR(monthlySummary.monthlyBudget)} monthly cap.
              Consider reviewing discretionary categories or adjusting your budget below.
            </p>
          </div>
        </div>
      ) : pct >= 80 ? (
        <div className="p-4 rounded-2xl bg-[#FBBF24]/15 border border-[#FBBF24]/40 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-[#FBBF24] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-heading font-bold text-[#FBBF24]">
              Approaching Monthly Limit ({pct}% Used)
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              You have {formatINR(monthlySummary.remainingBudget)} remaining before reaching your{' '}
              {formatINR(monthlySummary.monthlyBudget)} target.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/30 flex items-start gap-3.5">
          <CheckCircle2 className="w-5 h-5 text-[#34D399] shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-heading font-bold text-[#34D399]">
              Healthy Budget Utilization ({pct}% Used)
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              You have {formatINR(monthlySummary.remainingBudget)} safely available out of your{' '}
              {formatINR(monthlySummary.monthlyBudget)} budget for {MONTHS[selectedMonth]}.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Large Circular Progress + Budget Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <GlassCard className="lg:col-span-5 flex flex-col items-center justify-center p-8 text-center">
          <BudgetProgress
            percentage={pct}
            size={250}
            strokeWidth={18}
            subLabel={`of ${formatINR(monthlySummary.monthlyBudget)} spent`}
          />

          <div className="w-full grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-[#94A3B8]">Total Expenses</p>
              <p className="text-lg font-heading font-bold text-[#22D3EE] mt-0.5">
                <AnimatedCounter value={monthlySummary.totalExpenses} />
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <p className="text-xs text-[#94A3B8]">Remaining Budget</p>
              <p
                className={`text-lg font-heading font-bold mt-0.5 ${
                  monthlySummary.remainingBudget < 0 ? 'text-[#FB7185]' : 'text-[#34D399]'
                }`}
              >
                <AnimatedCounter value={monthlySummary.remainingBudget} />
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
                  Configure Monthly Spending Cap
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Applies to {MONTHS[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveBudget} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-2">
                  Monthly Budget Amount (INR)
                </label>
                <div className="relative">
                  <IndianRupee className="w-5 h-5 text-[#22D3EE] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-xl font-heading font-bold fintech-input"
                  />
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div>
                <span className="block text-xs text-[#94A3B8] mb-2">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BUDGETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setBudgetInput(String(preset));
                        setMonthlyBudget(preset, selectedMonth, selectedYear);
                        toast.success(`Budget updated to ${formatINR(preset)}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold border transition-all ${
                        Number(budgetInput) === preset
                          ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]'
                          : 'bg-white/[0.03] border-white/10 text-[#94A3B8] hover:text-white'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <GradientButton type="submit" size="md">
                  <Check className="w-4 h-4" />
                  Save Monthly Budget
                </GradientButton>
              </div>
            </form>
          </div>

          {/* Formula Reference Box */}
          <div className="mt-8 p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-[#94A3B8] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#F8FAFC] font-heading font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span>Live Calculation Breakdown</span>
            </div>
            <p>
              • <strong>Remaining Budget</strong> = {formatINR(monthlySummary.monthlyBudget)} −{' '}
              {formatINR(monthlySummary.totalExpenses)} ={' '}
              <span className="text-[#F8FAFC] font-semibold">
                {formatINR(monthlySummary.remainingBudget)}
              </span>
            </p>
            <p>
              • <strong>Budget Used %</strong> = ({formatINR(monthlySummary.totalExpenses)} ÷{' '}
              {formatINR(monthlySummary.monthlyBudget)}) × 100 ={' '}
              <span className="text-[#22D3EE] font-semibold">{pct}%</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Category Share of Monthly Budget */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-heading font-bold text-[#F8FAFC] mb-4">
          Category Consumption vs Total Budget
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryBreakdown.map((cat) => {
            const Icon = cat.icon;
            const shareOfBudget =
              monthlySummary.monthlyBudget > 0
                ? Number(((cat.amount / monthlySummary.monthlyBudget) * 100).toFixed(1))
                : 0;

            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-medium text-[#F8FAFC]">
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="text-xs text-[#94A3B8]">{shareOfBudget}% of budget</span>
                </div>
                <p className="text-base font-heading font-bold text-[#F8FAFC] mt-2">
                  {formatINR(cat.amount)}
                </p>
                <div className="mt-2 w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(shareOfBudget, 100)}%`,
                      backgroundColor: cat.color
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
