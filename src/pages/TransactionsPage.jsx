import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PlusCircle, Wallet } from 'lucide-react';
import TransactionTable from '../components/ui/TransactionTable';
import GradientButton from '../components/ui/GradientButton';
import { useFinance } from '../context/FinanceContext';
import { MONTHS } from '../utils/formatters';

export default function TransactionsPage() {
  const { selectedMonth, selectedYear } = useFinance();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCategory = searchParams.get('category') || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Transactions Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Search, filter, sort, edit, or delete entries for {MONTHS[selectedMonth]} {selectedYear}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GradientButton variant="secondary" size="sm" onClick={() => navigate('/income')}>
            <Wallet className="w-4 h-4" />
            Add Income
          </GradientButton>
          <GradientButton size="sm" onClick={() => navigate('/add-expense')}>
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </GradientButton>
        </div>
      </div>

      <TransactionTable
        initialCategoryFilter={initialCategory}
        initialSearch={initialSearch}
      />
    </div>
  );
}
