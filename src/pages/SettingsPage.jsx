import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  User,
  Moon,
  Sun,
  Zap,
  RotateCcw,
  LogOut,
  IndianRupee,
  ShieldCheck,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useFinance } from '../context/FinanceContext';

export default function SettingsPage() {
  const {
    currentUser,
    settings,
    setSettings,
    updateProfileName,
    resetDemoData,
    logout
  } = useFinance();

  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    updateProfileName(displayName.trim());
    toast.success('Profile display name updated');
  };

  const toggleTheme = (newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    toast.success(`Theme set to ${newTheme === 'dark' ? 'Dark (Default)' : 'Light'}`);
  };

  const toggleReducedMotion = () => {
    const nextVal = !settings.reducedMotion;
    setSettings((prev) => ({ ...prev, reducedMotion: nextVal }));
    toast.info(nextVal ? 'Reduced motion enabled' : 'Full animations restored');
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
    toast.success('Sample demonstration data successfully restored to factory defaults!');
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success('Signed out safely');
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
          Preferences & Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
          Manage your account profile, fintech theme, reduced motion accessibility, and demo state.
        </p>
      </div>

      {/* Profile Section */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-bold text-[#F8FAFC]">
              Account Profile
            </h2>
            <p className="text-xs text-[#94A3B8]">
              Signed in as {currentUser?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm fintech-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">
                Currency
              </label>
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/10 text-sm text-[#F8FAFC]">
                <IndianRupee className="w-4 h-4 text-[#22D3EE]" />
                <span>INR — Indian Rupee (₹)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GradientButton type="submit" size="sm">
              <Check className="w-4 h-4" /> Save Profile
            </GradientButton>
          </div>
        </form>
      </GlassCard>

      {/* Appearance & Accessibility */}
      <GlassCard className="p-6">
        <h2 className="text-base font-heading font-bold text-[#F8FAFC] mb-4">
          Appearance & Accessibility
        </h2>

        <div className="space-y-4">
          {/* Theme Preference */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Theme Preference</p>
              <p className="text-xs text-[#94A3B8]">
                Switch between the signature dark fintech palette and clean light theme.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleTheme('dark')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-[#22D3EE]/20 border-[#22D3EE] text-[#22D3EE]'
                    : 'bg-white/5 border-white/10 text-[#94A3B8]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" /> Dark Mode
              </button>
              <button
                type="button"
                onClick={() => toggleTheme('light')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  settings.theme === 'light'
                    ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#8B5CF6]'
                    : 'bg-white/5 border-white/10 text-[#94A3B8]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Light Mode
              </button>
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Reduced Motion Mode</p>
              <p className="text-xs text-[#94A3B8]">
                Disables nonessential GSAP, 3D Canvas rotations, and floating physics for lower GPU usage.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                settings.reducedMotion
                  ? 'bg-[#34D399]/20 border-[#34D399] text-[#34D399]'
                  : 'bg-white/5 border-white/10 text-[#94A3B8]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {settings.reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Demo Controls & Session Management */}
      <GlassCard className="p-6 border border-[#FB7185]/20">
        <h2 className="text-base font-heading font-bold text-[#F8FAFC] mb-4">
          Demo Management & Session
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-[#F8FAFC]">Reset Demo Data</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Restores the standard ₹48k income, ₹35k budget, and ₹22k category sample transactions.
              </p>
            </div>
            <div className="mt-4">
              <GradientButton
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
              >
                <RotateCcw className="w-4 h-4 text-[#8B5CF6]" />
                Reset Sample Data
              </GradientButton>
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between">
            <div>
              <p className="text-sm font-medium text-[#FB7185]">Sign Out</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                End your local demonstration session and return to the 3D cinematic login screen.
              </p>
            </div>
            <div className="mt-4">
              <GradientButton
                variant="danger"
                size="sm"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </GradientButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Reset Confirmation Modal */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Data?"
        message="This will reload the official demonstration transactions, budgets, and savings goals from scratch. Any custom transactions you added will be refreshed."
        confirmLabel="Reset Data"
        variant="primary"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Sign Out of MyFinance?"
        message="Your demo transactions and configurations remain saved in your browser's LocalStorage and will be available when you sign back in."
        confirmLabel="Sign Out"
        variant="danger"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
