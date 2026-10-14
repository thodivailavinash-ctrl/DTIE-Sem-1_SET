import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  PlusCircle,
  X,
  ArrowUpRight
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import CategoryCard from '../components/ui/CategoryCard';
import GradientButton from '../components/ui/GradientButton';
import TransactionTable from '../components/ui/TransactionTable';
import { useFinance } from '../context/FinanceContext';
import { MONTHS, formatINR } from '../utils/formatters';

export default function CategoriesPage() {
  const {
    selectedMonth,
    selectedYear,
    categoryBreakdown,
    monthlySummary
  } = useFinance();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSelected = searchParams.get('selected') || null;
  const [selectedCategory, setSelectedCategory] = useState(initialSelected);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat.id);
    setSearchParams({ selected: cat.id });
  };

  const clearSelection = () => {
    setSelectedCategory(null);
    setSearchParams({});
  };

  const activeCategoryObj = useMemo(
    () => categoryBreakdown.find((c) => c.id === selectedCategory),
    [categoryBreakdown, selectedCategory]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Expense Categories
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Click any category card to inspect its underlying transactions for{' '}
            {MONTHS[selectedMonth]} {selectedYear}.
          </p>
        </div>

        <GradientButton size="sm" onClick={() => navigate('/add-expense')}>
          <PlusCircle className="w-4 h-4" />
          Add Expense
        </GradientButton>
      </div>

      {/* 8 Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryBreakdown.map((cat) => (
          <div
            key={cat.id}
            className={`rounded-2xl transition-all ${
              selectedCategory === cat.id
                ? 'ring-2 ring-[#22D3EE] shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                : ''
            }`}
          >
            <CategoryCard category={cat} onClick={handleSelectCategory} />
          </div>
        ))}
      </div>

      {/* Related Transactions Drawer / Section when a Category is Clicked */}
      {activeCategoryObj ? (
        <div className="space-y-4 pt-2">
          <GlassCard className="p-4 flex flex-wrap items-center justify-between gap-4 border-[#22D3EE]/40">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${activeCategoryObj.color}20`,
                  color: activeCategoryObj.color
                }}
              >
                <activeCategoryObj.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-heading font-bold text-[#F8FAFC]">
                  {activeCategoryObj.name} Transactions ({activeCategoryObj.count})
                </h2>
                <p className="text-xs text-[#94A3B8]">
                  Total Spent: <strong className="text-[#F8FAFC]">{formatINR(activeCategoryObj.amount)}</strong>{' '}
                  ({activeCategoryObj.percentage}% of monthly expenses)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GradientButton
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/transactions?category=${activeCategoryObj.id}`)}
              >
                <span>Open in Full Ledger</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </GradientButton>
              <button
                type="button"
                onClick={clearSelection}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#94A3B8] hover:text-white"
                aria-label="Close category filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </GlassCard>

          <TransactionTable
            initialCategoryFilter={activeCategoryObj.id}
            initialTypeFilter="expense"
            compact
          />
        </div>
      ) : (
        <GlassCard className="p-5 flex items-center justify-between text-xs sm:text-sm text-[#94A3B8]">
          <div className="flex items-center gap-2.5">
            <Grid className="w-4 h-4 text-[#22D3EE]" />
            <span>
              Select any category card above to filter its individual transactions immediately.
            </span>
          </div>
          <span className="font-heading font-semibold text-[#F8FAFC]">
            Total: {formatINR(monthlySummary.totalExpenses)}
          </span>
        </GlassCard>
      )}
    </div>
  );
}
