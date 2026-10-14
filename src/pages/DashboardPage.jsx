import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieChartIcon,
  PlusCircle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import BudgetProgress from '../components/ui/BudgetProgress';
import Header3DObject from '../components/three/Header3DObject';
import {
  CategoryDonutChart,
  MonthlySpendingBarChart,
  IncomeVsExpensesLineChart
} from '../components/charts/FinanceCharts';
import { useFinance } from '../context/FinanceContext';
import { MONTHS, formatINR, formatReadableDate } from '../utils/formatters';
import { getCategoryMeta } from '../utils/categories';

export default function DashboardPage() {
  const {
    selectedMonth,
    selectedYear,
    monthlySummary,
    categoryBreakdown,
    sixMonthHistory,
    monthlyTransactions,
    settings
  } = useFinance();

  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  // Staggered GSAP entrance animation for dashboard cards
  useEffect(() => {
    if (settings?.reducedMotion) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dash-animate',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'power3.out'
        }
      );
    }, dashboardRef);
    return () => ctx.revert();
  }, [selectedMonth, selectedYear, settings?.reducedMotion]);

  const recentFive = monthlyTransactions.slice(0, 5);

  const summaryCards = [
    {
      id: 'income',
      label: 'Total Monthly Income',
      value: monthlySummary.totalIncome,
      isCurrency: true,
      icon: TrendingUp,
      accent: '#34D399',
      status: 'Available Cash Inflow',
      statusColor: 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/30'
    },
    {
      id: 'expenses',
      label: 'Total Monthly Expenses',
      value: monthlySummary.totalExpenses,
      isCurrency: true,
      icon: TrendingDown,
      accent: '#22D3EE',
      status: `${monthlySummary.expenseCount} expense transactions`,
      statusColor: 'text-[#22D3EE] bg-[#22D3EE]/10 border-[#22D3EE]/30'
    },
    {
      id: 'remaining',
      label: 'Remaining Budget',
      value: monthlySummary.remainingBudget,
      isCurrency: true,
      icon: Wallet,
      accent: monthlySummary.isOverspent ? '#FB7185' : '#8B5CF6',
      status: monthlySummary.isOverspent
        ? 'Budget Exceeded'
        : `From ${formatINR(monthlySummary.monthlyBudget)} cap`,
      statusColor: monthlySummary.isOverspent
        ? 'text-[#FB7185] bg-[#FB7185]/15 border-[#FB7185]/35'
        : 'text-[#8B5CF6] bg-[#8B5CF6]/15 border-[#8B5CF6]/35'
    },
    {
      id: 'percent',
      label: 'Budget Used Percentage',
      value: monthlySummary.budgetUsedPercentage,
      isCurrency: false,
      decimals: 2,
      suffix: '%',
      icon: PieChartIcon,
      accent:
        monthlySummary.budgetUsedPercentage > 100
          ? '#FB7185'
          : monthlySummary.budgetUsedPercentage >= 80
          ? '#FBBF24'
          : '#34D399',
      status:
        monthlySummary.budgetUsedPercentage > 100
          ? 'Overspent Alert'
          : monthlySummary.budgetUsedPercentage >= 80
          ? 'Approaching Limit'
          : 'Optimal Spending Pace',
      statusColor:
        monthlySummary.budgetUsedPercentage > 100
          ? 'text-[#FB7185] bg-[#FB7185]/15 border-[#FB7185]/35'
          : monthlySummary.budgetUsedPercentage >= 80
          ? 'text-[#FBBF24] bg-[#FBBF24]/15 border-[#FBBF24]/35'
          : 'text-[#34D399] bg-[#34D399]/10 border-[#34D399]/30'
    }
  ];

  return (
    <div ref={dashboardRef} className="space-y-6">
      {/* Hero Header Banner with Lightweight 3D Financial Gem */}
      <GlassCard className="dash-animate p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-4">
          <Header3DObject reducedMotion={settings?.reducedMotion} />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30 mb-1.5">
              <Sparkles className="w-3 h-3" />
              <span>{MONTHS[selectedMonth]} {selectedYear} Financial Overview</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-bold text-[#F8FAFC]">
              Smart Wealth Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
              Net Monthly Cash Flow:{' '}
              <span
                className={`font-heading font-semibold ${
                  monthlySummary.netCashFlow >= 0 ? 'text-[#34D399]' : 'text-[#FB7185]'
                }`}
              >
                {monthlySummary.netCashFlow >= 0 ? '+' : ''}
                {formatINR(monthlySummary.netCashFlow)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <GradientButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/income')}
            className="flex-1 sm:flex-initial"
          >
            + Add Income
          </GradientButton>
          <GradientButton
            size="sm"
            onClick={() => navigate('/add-expense')}
            className="flex-1 sm:flex-initial"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </GradientButton>
        </div>
      </GlassCard>

      {/* Four Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <GlassCard
              key={card.id}
              interactive
              className="dash-animate p-5 flex flex-col justify-between"
            >
              {/* Soft gradient glow */}
              <div
                className="pointer-events-none absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-25"
                style={{ backgroundColor: card.accent }}
              />

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#94A3B8]">{card.label}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
                  style={{
                    backgroundColor: `${card.accent}18`,
                    color: card.accent
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="my-3 text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC] tracking-tight">
                <AnimatedCounter
                  value={card.value}
                  isCurrency={card.isCurrency}
                  decimals={card.decimals || 0}
                  suffix={card.suffix || ''}
                />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${card.statusColor}`}
                >
                  {card.status}
                </span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Primary Charts Row: Category Donut + Budget Usage Circular Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Expenses by Category Donut Chart */}
        <GlassCard className="dash-animate lg:col-span-7 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                Expenses by Category
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Distribution of {formatINR(monthlySummary.totalExpenses)} spent in {MONTHS[selectedMonth]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="text-xs font-medium text-[#22D3EE] hover:underline flex items-center gap-1"
            >
              Details <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
            <CategoryDonutChart data={categoryBreakdown} height={240} />

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {categoryBreakdown
                .filter((c) => c.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => navigate(`/categories?selected=${cat.id}`)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs font-medium text-[#F8FAFC]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-heading font-semibold text-[#F8FAFC] block">
                        {formatINR(cat.amount)}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </GlassCard>

        {/* Budget Overview & Circular Progress Chart */}
        <GlassCard className="dash-animate lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                Budget Overview
              </h2>
              <p className="text-xs text-[#94A3B8]">
                Real-time spending limit monitor
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/budget')}
              className="text-xs font-medium text-[#22D3EE] hover:underline flex items-center gap-1"
            >
              Adjust <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="my-2 flex justify-center">
            <BudgetProgress percentage={monthlySummary.budgetUsedPercentage} size={200} />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 text-center">
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-[11px] text-[#94A3B8]">Monthly Budget</p>
              <p className="text-xs sm:text-sm font-heading font-bold text-[#F8FAFC] mt-0.5">
                {formatINR(monthlySummary.monthlyBudget)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-[11px] text-[#94A3B8]">Amount Spent</p>
              <p className="text-xs sm:text-sm font-heading font-bold text-[#22D3EE] mt-0.5">
                {formatINR(monthlySummary.totalExpenses)}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.02]">
              <p className="text-[11px] text-[#94A3B8]">Remaining</p>
              <p
                className={`text-xs sm:text-sm font-heading font-bold mt-0.5 ${
                  monthlySummary.remainingBudget < 0 ? 'text-[#FB7185]' : 'text-[#34D399]'
                }`}
              >
                {formatINR(monthlySummary.remainingBudget)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Secondary Charts Row: Monthly Spending Bar Chart + Income vs Expenses Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="dash-animate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                Monthly Spending Trend
              </h2>
              <p className="text-xs text-[#94A3B8]">6-month expense comparison</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="text-xs font-medium text-[#22D3EE] hover:underline"
            >
              Full Analytics
            </button>
          </div>
          <MonthlySpendingBarChart data={sixMonthHistory} height={250} />
        </GlassCard>

        <GlassCard className="dash-animate">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                Income vs Expenses
              </h2>
              <p className="text-xs text-[#94A3B8]">Cash inflow and outflow trajectory</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/reports')}
              className="text-xs font-medium text-[#22D3EE] hover:underline"
            >
              Export Report
            </button>
          </div>
          <IncomeVsExpensesLineChart data={sixMonthHistory} height={250} />
        </GlassCard>
      </div>

      {/* Recent 5 Transactions Section */}
      <GlassCard className="dash-animate">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
              Recent Transactions
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Latest 5 entries recorded in {MONTHS[selectedMonth]} {selectedYear}
            </p>
          </div>
          <GradientButton
            variant="secondary"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </GradientButton>
        </div>

        {recentFive.length === 0 ? (
          <div className="py-10 text-center text-sm text-[#94A3B8]">
            No transactions recorded for this month yet. Click "Add Expense" to log your first entry!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentFive.map((tx) => {
              const meta = getCategoryMeta(tx.category, tx.type);
              const Icon = meta.icon;
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
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
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{formatReadableDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-heading font-bold ${
                        isIncome ? 'text-[#34D399]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </p>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${
                        isIncome ? 'text-[#34D399]' : 'text-[#FB7185]'
                      }`}
                    >
                      {isIncome ? (
                        <>
                          <ArrowDownLeft className="w-3 h-3" /> Income
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3" /> Expense
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
