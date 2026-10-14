import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  Check,
  Inbox
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from './GlassCard';
import GradientButton from './GradientButton';
import ConfirmDialog from './ConfirmDialog';
import { formatINR, formatReadableDate } from '../../utils/formatters';
import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS, getCategoryMeta } from '../../utils/categories';
import { useFinance } from '../../context/FinanceContext';
import { useAutoCategorization } from '../../hooks/useAutoCategorization';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import AiCategoryBadge from './AiCategoryBadge';
import VoiceInputButton from './VoiceInputButton';

export default function TransactionTable({
  initialCategoryFilter = 'ALL',
  initialTypeFilter = 'ALL',
  initialSearch = '',
  compact = false
}) {
  const { monthlyTransactions, updateTransaction, deleteTransaction } = useFinance();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter);
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  // Edit modal state
  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: 'Food',
    type: 'expense',
    date: '',
    paymentMethod: 'UPI / GPay / PhonePe'
  });

  // Delete confirmation state
  const [deletingTx, setDeletingTx] = useState(null);

  // Sync external filter updates
  React.useEffect(() => {
    setCategoryFilter(initialCategoryFilter);
  }, [initialCategoryFilter]);

  React.useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  const allCategories = useMemo(() => {
    const names = new Set([
      ...EXPENSE_CATEGORIES.map((c) => c.id),
      ...INCOME_SOURCES.map((c) => c.id)
    ]);
    return Array.from(names);
  }, []);

  const filteredAndSorted = useMemo(() => {
    return monthlyTransactions
      .filter((tx) => {
        if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
        if (categoryFilter !== 'ALL' && tx.category !== categoryFilter) return false;
        if (dateFilter && tx.date !== dateFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchDesc = tx.description.toLowerCase().includes(q);
          const matchCat = tx.category.toLowerCase().includes(q);
          const matchMethod = (tx.paymentMethod || '').toLowerCase().includes(q);
          if (!matchDesc && !matchCat && !matchMethod) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [monthlyTransactions, typeFilter, categoryFilter, dateFilter, searchQuery, sortBy]);

  // Edit modal AI auto-categorization
  const originalEditDescRef = React.useRef('');

  const {
    loading: editAiLoading,
    suggestion: editAiSuggestion,
    error: editAiError,
    isManualOverride: isEditManualOverride,
    triggerImmediate: triggerEditAiImmediate,
    markManualOverride: markEditManualOverride,
    clearSuggestion: clearEditAiSuggestion,
    reclassify: reclassifyEditAi
  } = useAutoCategorization({
    description: editForm.description,
    type: editForm.type,
    // Only classify if editingTx is open and user changed description from original
    enabled: Boolean(editingTx && editForm.description.trim() !== originalEditDescRef.current.trim()),
    onSuggestionApplied: (sugg) => {
      setEditForm((prev) => ({ ...prev, category: sugg.category }));
    }
  });

  // Voice input hook for modal editing
  const {
    isListening: isEditVoiceListening,
    isSupported: isEditVoiceSupported,
    toggleListening: toggleEditVoiceListening
  } = useVoiceInput({
    onTranscript: (spokenText) => {
      setEditForm((prev) => ({ ...prev, description: spokenText }));
    }
  });

  const openEditModal = (tx) => {
    setEditingTx(tx);
    originalEditDescRef.current = tx.description || '';
    clearEditAiSuggestion();
    setEditForm({
      description: tx.description,
      amount: String(tx.amount),
      category: tx.category,
      type: tx.type,
      date: tx.date,
      paymentMethod: tx.paymentMethod || 'UPI / GPay / PhonePe'
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const numericAmt = Number(editForm.amount);
    if (!editForm.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!Number.isFinite(numericAmt) || numericAmt <= 0) {
      toast.error('Please enter a valid positive amount');
      return;
    }
    if (!editForm.date) {
      toast.error('Please select a valid date');
      return;
    }

    const isAiSuggested = editAiSuggestion && editAiSuggestion.category === editForm.category && !isEditManualOverride;

    updateTransaction(editingTx.id, {
      description: editForm.description.trim(),
      amount: numericAmt,
      category: editForm.category,
      type: editForm.type,
      date: editForm.date,
      paymentMethod: editForm.paymentMethod,
      ...(isAiSuggested
        ? {
            aiSuggested: true,
            aiConfidence: editAiSuggestion?.confidence,
            aiReason: editAiSuggestion?.reason
          }
        : {})
    });

    toast.success('Transaction updated successfully');
    setEditingTx(null);
    clearEditAiSuggestion();
  };

  const handleConfirmDelete = () => {
    if (!deletingTx) return;
    deleteTransaction(deletingTx.id);
    toast.success(`Deleted "${deletingTx.description}"`);
    setDeletingTx(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setTypeFilter('ALL');
    setDateFilter('');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      {!compact && (
        <GlassCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search description, category, UPI..."
                aria-label="Search transactions"
                className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm fintech-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by transaction type"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm fintech-input appearance-none cursor-pointer"
              >
                <option value="ALL" className="bg-[#10182B] text-white">All Types</option>
                <option value="expense" className="bg-[#10182B] text-white">Expenses Only</option>
                <option value="income" className="bg-[#10182B] text-white">Income Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input cursor-pointer"
              >
                <option value="ALL" className="bg-[#10182B] text-white">All Categories</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#10182B] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort transactions"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm fintech-input cursor-pointer"
              >
                <option value="date_desc" className="bg-[#10182B] text-white">Date: Newest First</option>
                <option value="date_asc" className="bg-[#10182B] text-white">Date: Oldest First</option>
                <option value="amount_desc" className="bg-[#10182B] text-white">Amount: High to Low</option>
                <option value="amount_asc" className="bg-[#10182B] text-white">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {/* Optional Date filter & active filter pill bar */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span>Filter exact date:</span>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg text-xs fintech-input"
                />
              </label>
              {(searchQuery || categoryFilter !== 'ALL' || typeFilter !== 'ALL' || dateFilter) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[#22D3EE] hover:underline font-medium"
                >
                  Reset all filters
                </button>
              )}
            </div>
            <div>
              Showing <span className="text-[#F8FAFC] font-semibold">{filteredAndSorted.length}</span> of{' '}
              <span className="text-[#F8FAFC] font-semibold">{monthlyTransactions.length}</span> transactions
            </div>
          </div>
        </GlassCard>
      )}

      {/* Transactions Glass Table */}
      <GlassCard className="p-0 overflow-hidden">
        {filteredAndSorted.length === 0 ? (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#22D3EE]/10 border border-[#22D3EE]/25 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-[#22D3EE]" />
            </div>
            <h3 className="text-base font-heading font-semibold text-[#F8FAFC]">
              No matching transactions found
            </h3>
            <p className="text-sm text-[#94A3B8] max-w-sm mt-1">
              Try adjusting your search query, category filter, or add a new transaction for this month.
            </p>
            {(searchQuery || categoryFilter !== 'ALL' || typeFilter !== 'ALL' || dateFilter) && (
              <GradientButton
                variant="secondary"
                size="sm"
                onClick={resetFilters}
                className="mt-4"
              >
                Clear Filters
              </GradientButton>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8] bg-white/[0.02]">
                  <th className="py-3.5 pl-6 pr-3">Description</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3 text-right">Amount</th>
                  <th className="py-3.5 pl-3 pr-6 text-right no-print">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                <AnimatePresence initial={false}>
                  {filteredAndSorted.map((tx) => {
                    const meta = getCategoryMeta(tx.category, tx.type);
                    const Icon = meta.icon;
                    const isIncome = tx.type === 'income';

                    return (
                      <motion.tr
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.18 }}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="py-3.5 pl-6 pr-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/10"
                              style={{
                                backgroundColor: `${meta.color}18`,
                                color: meta.color
                              }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#F8FAFC] truncate max-w-[220px] sm:max-w-xs">
                                {tx.description}
                              </p>
                              <p className="text-xs text-[#94A3B8] truncate">
                                {tx.paymentMethod || 'UPI / GPay / PhonePe'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
                            style={{
                              backgroundColor: `${meta.color}14`,
                              color: meta.color,
                              borderColor: `${meta.color}35`
                            }}
                          >
                            {tx.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap text-[#94A3B8] text-xs">
                          {formatReadableDate(tx.date)}
                        </td>

                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {isIncome ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#34D399]">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                              Income
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#FB7185]">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Expense
                            </span>
                          )}
                        </td>

                        <td
                          className={`py-3.5 px-3 whitespace-nowrap text-right font-heading font-semibold ${
                            isIncome ? 'text-[#34D399]' : 'text-[#F8FAFC]'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </td>

                        <td className="py-3.5 pl-3 pr-6 whitespace-nowrap text-right no-print">
                          <div className="inline-flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(tx)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22D3EE] hover:bg-[#22D3EE]/10 transition-colors"
                              title="Edit transaction"
                              aria-label={`Edit ${tx.description}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingTx(tx)}
                              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors"
                              title="Delete transaction"
                              aria-label={`Delete ${tx.description}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="glass-panel rounded-2xl max-w-lg w-full p-6 border border-white/15 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-heading font-semibold text-[#F8FAFC]">
                  Edit Transaction
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Type
                    </label>
                    <select
                      value={editForm.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setEditForm((prev) => ({
                          ...prev,
                          type: newType,
                          category: newType === 'income' ? 'Salary' : 'Food'
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    >
                      <option value="expense" className="bg-[#10182B]">Expense</option>
                      <option value="income" className="bg-[#10182B]">Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Amount (INR)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      required
                      value={editForm.amount}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 flex items-center justify-between">
                      <span>Category</span>
                      {editAiSuggestion && editAiSuggestion.category === editForm.category && !isEditManualOverride && (
                        <span className="text-[10px] text-[#22D3EE]">(AI Suggested)</span>
                      )}
                    </label>
                    <select
                      value={editForm.category}
                      onChange={(e) => {
                        setEditForm((prev) => ({ ...prev, category: e.target.value }));
                        markEditManualOverride();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    >
                      {(editForm.type === 'income' ? INCOME_SOURCES : EXPENSE_CATEGORIES).map((c) => (
                        <option key={c.id} value={c.id} className="bg-[#10182B]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.date}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5 flex items-center justify-between">
                    <span>Description</span>
                    <div className="flex items-center gap-2">
                      {isEditVoiceListening && (
                        <span className="text-[11px] text-[#FB7185] font-semibold animate-pulse">
                          Listening...
                        </span>
                      )}
                      <span className="text-[11px] text-[#22D3EE] font-normal">Edit to refresh AI suggestion</span>
                    </div>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      onBlur={triggerEditAiImmediate}
                      className="w-full pl-3.5 pr-11 py-2.5 rounded-xl text-sm fintech-input"
                    />
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                      <VoiceInputButton
                        isListening={isEditVoiceListening}
                        isSupported={isEditVoiceSupported}
                        onClick={toggleEditVoiceListening}
                        title="Click to speak updated description"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Suggestion in Edit Modal */}
                <AiCategoryBadge
                  loading={editAiLoading}
                  suggestion={editAiSuggestion}
                  error={editAiError}
                  isManualOverride={isEditManualOverride}
                  onResetToSuggestion={() => {
                    if (editAiSuggestion) {
                      setEditForm((prev) => ({ ...prev, category: editAiSuggestion.category }));
                    }
                  }}
                  onRetry={reclassifyEditAi}
                />

                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                  >
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm} className="bg-[#10182B]">
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <GradientButton variant="secondary" size="sm" onClick={() => setEditingTx(null)}>
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" size="sm">
                    <Check className="w-4 h-4" />
                    Save Changes
                  </GradientButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingTx)}
        title="Delete Transaction?"
        message={
          deletingTx
            ? `Are you sure you want to delete "${deletingTx.description}" (${formatINR(
                deletingTx.amount
              )})? Your dashboard totals and charts will update immediately.`
            : ''
        }
        confirmLabel="Delete Transaction"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTx(null)}
      />
    </div>
  );
}
