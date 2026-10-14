import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PiggyBank,
  Plus,
  Coins,
  Pencil,
  Trash2,
  Calendar,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useFinance } from '../context/FinanceContext';
import { formatINR, formatReadableDate } from '../utils/formatters';

const GOAL_COLORS = ['#22D3EE', '#34D399', '#8B5CF6', '#FBBF24', '#F472B6'];

export default function SavingsGoalsPage() {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    addGoalContribution,
    deleteSavingsGoal
  } = useFinance();

  // Create / Edit Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalForm, setGoalForm] = useState({
    title: '',
    targetAmount: '',
    savedAmount: '0',
    targetDate: '',
    color: '#22D3EE'
  });

  // Add Contribution modal state
  const [contributingGoal, setContributingGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [activeCoinGoalId, setActiveCoinGoalId] = useState(null);

  // Delete confirmation state
  const [deletingGoal, setDeletingGoal] = useState(null);

  const totals = useMemo(() => {
    const totalTarget = savingsGoals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
    const totalSaved = savingsGoals.reduce((acc, g) => acc + (Number(g.savedAmount) || 0), 0);
    const overallPct =
      totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0;
    return { totalTarget, totalSaved, overallPct };
  }, [savingsGoals]);

  const openCreateModal = () => {
    setEditingGoal(null);
    setGoalForm({
      title: '',
      targetAmount: '',
      savedAmount: '0',
      targetDate: '2027-03-31',
      color: GOAL_COLORS[savingsGoals.length % GOAL_COLORS.length]
    });
    setShowGoalModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      targetAmount: String(goal.targetAmount),
      savedAmount: String(goal.savedAmount),
      targetDate: goal.targetDate || '',
      color: goal.color || '#22D3EE'
    });
    setShowGoalModal(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const target = Number(goalForm.targetAmount);
    const saved = Number(goalForm.savedAmount || 0);

    if (!goalForm.title.trim()) {
      toast.error('Please enter a goal name');
      return;
    }
    if (!Number.isFinite(target) || target <= 0) {
      toast.error('Target amount must be greater than ₹0');
      return;
    }
    if (!Number.isFinite(saved) || saved < 0) {
      toast.error('Saved amount cannot be negative');
      return;
    }

    if (editingGoal) {
      updateSavingsGoal(editingGoal.id, {
        title: goalForm.title.trim(),
        targetAmount: target,
        savedAmount: saved,
        targetDate: goalForm.targetDate,
        color: goalForm.color
      });
      toast.success(`Updated "${goalForm.title}"`);
    } else {
      addSavingsGoal({
        title: goalForm.title.trim(),
        targetAmount: target,
        savedAmount: saved,
        targetDate: goalForm.targetDate,
        color: goalForm.color
      });
      toast.success(`Created new savings goal: "${goalForm.title}"`);
    }

    setShowGoalModal(false);
  };

  const handleContributeSubmit = (e) => {
    e.preventDefault();
    const amt = Number(contributionAmount);
    if (!contributingGoal || !Number.isFinite(amt) || amt <= 0) {
      toast.error('Please enter a valid positive contribution amount');
      return;
    }

    addGoalContribution(contributingGoal.id, amt);
    const goalId = contributingGoal.id;
    const goalTitle = contributingGoal.title;

    setContributingGoal(null);
    setContributionAmount('');
    setActiveCoinGoalId(goalId);
    toast.success(`Added ${formatINR(amt)} to "${goalTitle}"!`);

    setTimeout(() => {
      setActiveCoinGoalId(null);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Savings Goals & Vaults
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Build dedicated wealth vaults for milestones. Goal contributions are tracked separately from expenses to prevent double-counting.
          </p>
        </div>

        <GradientButton size="sm" onClick={openCreateModal}>
          <Plus className="w-4 h-4" />
          Create Savings Goal
        </GradientButton>
      </div>

      {/* Top Glass Piggy Bank & Coin Stack Visual Banner */}
      <GlassCard className="p-6 border border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
          {/* Interactive Glass Piggy Bank & Coin Stack Visual */}
          <div className="lg:col-span-5 flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#22D3EE]/20 via-[#10182B] to-[#8B5CF6]/25 border border-white/15 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <PiggyBank className="w-11 h-11 text-[#22D3EE]" />
              {/* Decorative 3D Coin Stack Bars */}
              <div className="absolute -bottom-2 -right-2 flex items-end gap-1 bg-[#070B18]/90 px-2 py-1.5 rounded-xl border border-white/10">
                <div className="w-2.5 h-3 rounded-sm bg-[#FBBF24]" />
                <div className="w-2.5 h-5 rounded-sm bg-[#22D3EE]" />
                <div className="w-2.5 h-7 rounded-sm bg-[#34D399]" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#22D3EE] bg-[#22D3EE]/10 px-2.5 py-0.5 rounded-full border border-[#22D3EE]/25">
                <Sparkles className="w-3 h-3" /> Isolated Goal Vaults
              </span>
              <h2 className="text-xl font-heading font-bold text-[#F8FAFC] mt-1.5">
                Total Saved: <AnimatedCounter value={totals.totalSaved} />
              </h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Target across {savingsGoals.length} active goals: {formatINR(totals.totalTarget)} ({totals.overallPct}%)
              </p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Combined Milestone Completion</span>
              <span className="font-heading font-bold text-[#34D399]">{totals.overallPct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totals.overallPct, 100)}%` }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] via-[#8B5CF6] to-[#34D399]"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Goals Grid */}
      {savingsGoals.length === 0 ? (
        <GlassCard className="py-16 text-center">
          <PiggyBank className="w-12 h-12 text-[#22D3EE] mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-heading font-semibold text-[#F8FAFC]">
            No Savings Goals Created Yet
          </h3>
          <p className="text-sm text-[#94A3B8] max-w-md mx-auto mt-1">
            Create your first goal (e.g., Laptop, Travel, Emergency Fund, Education) to start building your savings stack.
          </p>
          <GradientButton size="sm" onClick={openCreateModal} className="mt-4">
            <Plus className="w-4 h-4" /> Create First Goal
          </GradientButton>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {savingsGoals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Number(((goal.savedAmount / goal.targetAmount) * 100).toFixed(1))
                : 0;
            const clampedPct = Math.min(pct, 100);
            const remaining = Math.max(0, goal.targetAmount - goal.savedAmount);
            const isCoinAnimating = activeCoinGoalId === goal.id;

            return (
              <GlassCard
                key={goal.id}
                interactive
                className="p-6 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Animated Coin Drop Effect when Contribution is Added */}
                <AnimatePresence>
                  {isCoinAnimating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#070B18]/60 backdrop-blur-xs"
                    >
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ y: -60, x: (i - 2.5) * 26, opacity: 1, scale: 0.7 }}
                          animate={{ y: 40, opacity: 0, scale: 1.15, rotate: i * 45 }}
                          transition={{ duration: 0.75, ease: 'easeOut' }}
                          className="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-[#FBBF24] to-[#22D3EE] flex items-center justify-center text-[#070B18] font-bold text-xs shadow-[0_0_15px_rgba(251,191,36,0.8)]"
                        >
                          ₹
                        </motion.div>
                      ))}
                      <span className="px-3 py-1.5 rounded-full bg-[#34D399]/20 border border-[#34D399] text-[#34D399] font-heading font-bold text-xs">
                        + Contribution Added!
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center border border-white/15 shrink-0"
                        style={{
                          backgroundColor: `${goal.color || '#22D3EE'}20`,
                          color: goal.color || '#22D3EE'
                        }}
                      >
                        <PiggyBank className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                          {goal.title}
                        </h3>
                        {goal.targetDate && (
                          <p className="text-xs text-[#94A3B8] flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3 text-[#22D3EE]" />
                            Target: {formatReadableDate(goal.targetDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(goal)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#22D3EE] hover:bg-white/10"
                        title="Edit goal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingGoal(goal)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#FB7185] hover:bg-[#FB7185]/10"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Numbers Row */}
                  <div className="mt-5 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-[#94A3B8] block">Saved So Far</span>
                      <span className="text-2xl font-heading font-bold text-[#F8FAFC]">
                        <AnimatedCounter value={goal.savedAmount} />
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#94A3B8] block">Target Goal</span>
                      <span className="text-sm font-heading font-semibold text-[#94A3B8]">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span
                        className="font-heading font-bold"
                        style={{ color: goal.color || '#22D3EE' }}
                      >
                        {pct}% Complete
                      </span>
                      <span className="text-[#94A3B8]">
                        {remaining > 0 ? `${formatINR(remaining)} to go` : 'Goal Achieved! 🎉'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${clampedPct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: goal.color || '#22D3EE',
                          boxShadow: `0 0 12px ${goal.color || '#22D3EE'}80`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action: Add Contribution */}
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Coins className="w-4 h-4 text-[#FBBF24]" />
                    <span>Quick Contribute:</span>
                  </div>
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setContributingGoal(goal);
                      setContributionAmount('2000');
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#22D3EE]" />
                    Add Contribution
                  </GradientButton>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="glass-panel rounded-2xl max-w-md w-full p-6 border border-white/15"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-lg font-heading font-bold text-[#F8FAFC]">
                  {editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGoal} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MacBook Pro / Europe Trip"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Target Amount (₹) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="100000"
                      value={goalForm.targetAmount}
                      onChange={(e) => setGoalForm((p) => ({ ...p, targetAmount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Initial Saved (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={goalForm.savedAmount}
                      onChange={(e) => setGoalForm((p) => ({ ...p, savedAmount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={goalForm.targetDate}
                      onChange={(e) => setGoalForm((p) => ({ ...p, targetDate: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-2 pt-1.5">
                      {GOAL_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setGoalForm((p) => ({ ...p, color: col }))}
                          className={`w-6 h-6 rounded-full border-2 transition-transform ${
                            goalForm.color === col ? 'scale-125 border-white' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowGoalModal(false)}
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" size="sm">
                    <Check className="w-4 h-4" />
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </GradientButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contribution Modal */}
      <AnimatePresence>
        {contributingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="glass-panel rounded-2xl max-w-sm w-full p-6 border border-white/15"
            >
              <h3 className="text-lg font-heading font-bold text-[#F8FAFC]">
                Add Contribution
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Depositing into <strong className="text-[#22D3EE]">{contributingGoal.title}</strong>
              </p>

              <form onSubmit={handleContributeSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                    Contribution Amount (INR)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-base font-heading font-bold fintech-input"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[1000, 2500, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setContributionAmount(String(preset))}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#22D3EE] border border-white/10"
                    >
                      +{formatINR(preset)}
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <GradientButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setContributingGoal(null)}
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton type="submit" size="sm">
                    <Coins className="w-4 h-4" />
                    Deposit Coins
                  </GradientButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingGoal)}
        title="Delete Savings Goal?"
        message={
          deletingGoal
            ? `Are you sure you want to delete "${deletingGoal.title}" (${formatINR(
                deletingGoal.savedAmount
              )} saved)?`
            : ''
        }
        confirmLabel="Delete Goal"
        onConfirm={() => {
          deleteSavingsGoal(deletingGoal.id);
          toast.success(`Deleted goal "${deletingGoal.title}"`);
          setDeletingGoal(null);
        }}
        onCancel={() => setDeletingGoal(null)}
      />
    </div>
  );
}
