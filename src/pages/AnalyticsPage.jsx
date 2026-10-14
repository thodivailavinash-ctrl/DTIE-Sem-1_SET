import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Flame,
  Calculator,
  Scale,
  Calendar,
  Filter
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import {
  CategoryDonutChart,
  MonthlySpendingBarChart,
  IncomeVsExpensesLineChart,
  SpendingTrendAreaChart
} from '../components/charts/FinanceCharts';
import { useFinance } from '../context/FinanceContext';
import { MONTHS, formatINR } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/categories';

export default function AnalyticsPage() {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    monthlySummary,
    categoryBreakdown,
    sixMonthHistory
  } = useFinance();

  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Highest spending category for the selected month
  const highestCategory = useMemo(() => {
    const active = categoryBreakdown.filter((c) => c.amount > 0);
    if (active.length === 0) return null;
    return active.reduce((max, curr) => (curr.amount > max.amount ? curr : max), active[0]);
  }, [categoryBreakdown]);

  // Real month-over-month comparison from sixMonthHistory (current is index 5, previous is index 4)
  const monthOverMonthComparison = useMemo(() => {
    if (sixMonthHistory.length < 2) return null;
    const current = sixMonthHistory[sixMonthHistory.length - 1];
    const prev = sixMonthHistory[sixMonthHistory.length - 2];

    if (!prev || prev.expenses === 0) {
      return {
        available: false,
        message: `No prior month baseline available in ${prev?.fullName || 'previous month'} for trend comparison.`
      };
    }

    const diff = current.expenses - prev.expenses;
    const pctChange = Number(((diff / prev.expenses) * 100).toFixed(1));
    return {
      available: true,
      prevName: prev.name,
      prevAmount: prev.expenses,
      diff,
      pctChange
    };
  }, [sixMonthHistory]);

  const filteredCategoryBreakdown = useMemo(() => {
    if (categoryFilter === 'ALL') return categoryBreakdown;
    return categoryBreakdown.filter((c) => c.id === categoryFilter);
  }, [categoryBreakdown, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header & Period / Category Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Financial Analytics & Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Deep multi-month visualizations and category velocity for {MONTHS[selectedMonth]} {selectedYear}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Select */}
          <div className="flex items-center gap-2 bg-[#10182B] border border-white/10 rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-[#22D3EE]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Analytics month"
              className="bg-transparent text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i} className="bg-[#10182B]">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              aria-label="Analytics year"
              className="bg-transparent text-xs font-medium text-[#94A3B8] focus:outline-none cursor-pointer"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-[#10182B]">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-[#10182B] border border-white/10 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-[#8B5CF6]" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter analytics category"
              className="bg-transparent text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#10182B]">All Categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#10182B]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Three Key Analytical Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Spending Category */}
        <GlassCard interactive className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">Highest Spending Category</span>
            <div className="w-9 h-9 rounded-xl bg-[#FB7185]/15 text-[#FB7185] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          {highestCategory ? (
            <>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="text-xl font-heading font-bold text-[#F8FAFC]">
                  {highestCategory.name}
                </h3>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${highestCategory.color}20`,
                    color: highestCategory.color
                  }}
                >
                  {highestCategory.percentage}% of total
                </span>
              </div>
              <p className="text-lg font-heading font-semibold text-[#22D3EE] mt-1">
                {formatINR(highestCategory.amount)}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[#94A3B8]">
              No expenses recorded in {MONTHS[selectedMonth]} yet.
            </p>
          )}
        </GlassCard>

        {/* Average Expense per Transaction */}
        <GlassCard interactive className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">
              Average Expense / Transaction
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            <AnimatedCounter value={monthlySummary.avgExpensePerTx} />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Across {monthlySummary.expenseCount} expense transaction{monthlySummary.expenseCount === 1 ? '' : 's'}
          </p>
        </GlassCard>

        {/* Income Minus Expenses Summary & Real MoM Comparison */}
        <GlassCard interactive className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#94A3B8]">
              Income Minus Expenses (Net)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#34D399]/15 text-[#34D399] flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl sm:text-3xl font-heading font-bold ${
              monthlySummary.netCashFlow >= 0 ? 'text-[#34D399]' : 'text-[#FB7185]'
            }`}
          >
            <AnimatedCounter value={monthlySummary.netCashFlow} />
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            {monthOverMonthComparison?.available ? (
              <span>
                Expenses {monthOverMonthComparison.pctChange > 0 ? 'up' : 'down'}{' '}
                <strong className="text-[#F8FAFC]">
                  {Math.abs(monthOverMonthComparison.pctChange)}%
                </strong>{' '}
                vs {monthOverMonthComparison.prevName} ({formatINR(monthOverMonthComparison.prevAmount)})
              </span>
            ) : (
              <span>{monthOverMonthComparison?.message}</span>
            )}
          </p>
        </GlassCard>
      </div>

      {/* 4 Required Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Distribution Donut Chart */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
                Category Distribution
              </h2>
              <p className="text-xs text-[#94A3B8]">
                {categoryFilter === 'ALL'
                  ? 'All expense categories'
                  : `Filtered by ${categoryFilter}`}
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#22D3EE]" />
          </div>
          <CategoryDonutChart data={filteredCategoryBreakdown} height={280} />
        </GlassCard>

        {/* 2. Monthly Spending Bar Chart */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
              Monthly Spending Bar Chart
            </h2>
            <p className="text-xs text-[#94A3B8]">
              6-month historical outflow ending {MONTHS[selectedMonth]} {selectedYear}
            </p>
          </div>
          <MonthlySpendingBarChart data={sixMonthHistory} height={280} />
        </GlassCard>

        {/* 3. Income vs Expense Line Chart */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
              Income vs Expense Line Chart
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Monthly cash flow equilibrium and savings margin
            </p>
          </div>
          <IncomeVsExpensesLineChart data={sixMonthHistory} height={280} />
        </GlassCard>

        {/* 4. Spending Trend Area Chart */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-heading font-bold text-[#F8FAFC]">
              Spending & Net Savings Area Trend
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Area visualization of actual spending vs retained monthly savings
            </p>
          </div>
          <SpendingTrendAreaChart data={sixMonthHistory} height={280} />
        </GlassCard>
      </div>
    </div>
  );
}
