import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  Target,
  BarChart3,
  PiggyBank
} from 'lucide-react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MOBILE_NAV = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/transactions', label: 'Txns', icon: ArrowLeftRight },
  { path: '/budget', label: 'Budget', icon: Target },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/goals', label: 'Goals', icon: PiggyBank }
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-bgPrimary text-textPrimary relative overflow-x-hidden">
      {/* Ambient Background Glow Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 no-print">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#22D3EE]/[0.06] blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-[#8B5CF6]/[0.06] blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-[#22D3EE]/[0.04] blur-[120px]" />
      </div>

      {/* Desktop Collapsible Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 relative z-10 ${
          collapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        <Topbar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating Add Expense Action Button */}
      {location.pathname !== '/add-expense' && (
        <button
          type="button"
          onClick={() => navigate('/add-expense')}
          aria-label="Quick Add Expense"
          className="fixed right-5 bottom-20 md:bottom-8 z-30 flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#22D3EE] to-[#8B5CF6] text-[#070B18] font-heading font-bold text-sm shadow-[0_0_25px_rgba(34,211,238,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] hover:scale-105 active:scale-95 transition-all no-print"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      )}

      {/* Mobile Responsive Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-white/10 px-2 py-1.5 flex items-center justify-around no-print">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-colors ${
                  isActive ? 'text-[#22D3EE]' : 'text-[#94A3B8] hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
