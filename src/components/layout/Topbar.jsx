import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { useFinance } from '../../context/FinanceContext';
import { MONTHS, formatINR } from '../../utils/formatters';

export default function Topbar() {
  const {
    currentUser,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    monthlySummary,
    logout,
    resetDemoData
  } = useFinance();

  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue('');
    } else {
      navigate('/transactions');
    }
  };

  // Dynamic notifications derived from actual budget & cash flow status
  const notifications = [];
  if (monthlySummary.isOverspent) {
    notifications.push({
      id: 'overspent',
      type: 'danger',
      title: 'Monthly Budget Exceeded',
      desc: `You have spent ${formatINR(monthlySummary.totalExpenses)} (${monthlySummary.budgetUsedPercentage}% of budget).`
    });
  } else if (monthlySummary.budgetUsedPercentage >= 80) {
    notifications.push({
      id: 'near_limit',
      type: 'warning',
      title: 'Approaching Budget Limit',
      desc: `${monthlySummary.budgetUsedPercentage}% of your ${formatINR(monthlySummary.monthlyBudget)} budget is used.`
    });
  } else {
    notifications.push({
      id: 'healthy',
      type: 'success',
      title: 'Budget On Track',
      desc: `You have ${formatINR(monthlySummary.remainingBudget)} remaining for ${MONTHS[selectedMonth]}.`
    });
  }

  return (
    <header className="sticky top-0 z-20 h-16 glass-panel border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 no-print">
      {/* Greeting */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="md:hidden w-9 h-9 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-[#070B18]" />
        </div>
        <div className="truncate">
          <p className="text-xs text-[#94A3B8] hidden sm:block">Welcome back,</p>
          <h2 className="text-sm sm:text-base font-heading font-bold text-[#F8FAFC] truncate flex items-center gap-2">
            <span>{currentUser?.name || 'Aarav Sharma'}</span>
            {currentUser?.isDemoAccount && (
              <span className="hidden lg:inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                Demo Mode
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Search Shortcut */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:block relative w-56 xl:w-64">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search transactions..."
            aria-label="Quick search transactions"
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs fintech-input"
          />
        </form>

        {/* Month & Year Selector */}
        <div className="flex items-center gap-1.5 bg-[#070B18]/60 border border-white/10 rounded-xl px-2.5 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#22D3EE] shrink-0" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            aria-label="Select month"
            className="bg-transparent text-xs font-medium text-[#F8FAFC] focus:outline-none cursor-pointer"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx} className="bg-[#10182B] text-white">
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            aria-label="Select year"
            className="bg-transparent text-xs font-medium text-[#94A3B8] focus:outline-none cursor-pointer"
          >
            {[2025, 2026, 2027].map((yr) => (
              <option key={yr} value={yr} className="bg-[#10182B] text-white">
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#F8FAFC] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span
              className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${
                monthlySummary.isOverspent ? 'bg-[#FB7185] animate-ping' : 'bg-[#22D3EE]'
              }`}
            />
            <span
              className={`w-2 h-2 rounded-full absolute top-1.5 right-1.5 ${
                monthlySummary.isOverspent ? 'bg-[#FB7185]' : 'bg-[#22D3EE]'
              }`}
            />
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 border border-white/15 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <span className="text-xs font-heading font-semibold uppercase tracking-wider text-[#94A3B8]">
                  Smart Alerts
                </span>
                <span className="text-[11px] text-[#22D3EE]">
                  {MONTHS[selectedMonth]} {selectedYear}
                </span>
              </div>
              <div className="mt-3 space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3"
                  >
                    {n.type === 'danger' || n.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-[#FB7185] shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold text-[#F8FAFC]">{n.title}</p>
                      <p className="text-xs text-[#94A3B8] mt-0.5">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            aria-label="User profile menu"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center text-[#070B18] font-heading font-bold text-xs">
              {(currentUser?.name || 'A')[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-[#F8FAFC] max-w-[90px] truncate">
              {currentUser?.name?.split(' ')[0] || 'Aarav'}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-white/15 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-[#94A3B8] truncate">{currentUser?.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#F8FAFC] hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#22D3EE]" />
                  Account & Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetDemoData();
                    setShowProfile(false);
                    toast.success('Sample demonstration data restored!');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#F8FAFC] hover:bg-white/10 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Restore Sample Data
                </button>
              </div>

              <div className="pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    logout();
                    toast.success('Signed out safely');
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#FB7185] hover:bg-[#FB7185]/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
