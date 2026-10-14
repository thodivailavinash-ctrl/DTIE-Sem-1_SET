import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PlusCircle,
  Wallet,
  Target,
  Grid,
  BarChart3,
  PiggyBank,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useFinance } from '../../context/FinanceContext';

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/add-expense', label: 'Add Expense', icon: PlusCircle },
  { path: '/income', label: 'Income', icon: Wallet },
  { path: '/budget', label: 'Budget Manager', icon: Target },
  { path: '/categories', label: 'Categories', icon: Grid },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/goals', label: 'Savings Goals', icon: PiggyBank },
  { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout } = useFinance();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out safely');
    navigate('/login');
  };

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 glass-panel border-r border-white/10 transition-all duration-300 no-print ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(34,211,238,0.35)]">
            <Sparkles className="w-5 h-5 text-[#070B18]" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-heading font-bold text-lg tracking-tight text-[#F8FAFC] block leading-none">
                MyFinance
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#22D3EE] font-medium">
                Smart Tracker
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#22D3EE]/20 to-[#8B5CF6]/15 text-[#22D3EE] border border-[#22D3EE]/30 shadow-[0_0_15px_rgba(34,211,238,0.12)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#FB7185] hover:bg-[#FB7185]/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
