import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import { useFinance } from '../context/FinanceContext';
import { MONTHS, formatINR, formatReadableDate } from '../utils/formatters';

export default function ReportsPage() {
  const {
    currentUser,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    monthlySummary,
    monthlyTransactions,
    categoryBreakdown
  } = useFinance();

  const printAreaRef = useRef(null);

  // Generate and download actual CSV of filtered monthly transactions
  const handleExportCSV = () => {
    if (monthlyTransactions.length === 0) {
      toast.error('No transactions available for the selected month to export.');
      return;
    }

    const headers = ['Transaction ID', 'Date', 'Description', 'Category', 'Type', 'Amount (INR)', 'Payment Method'];
    const rows = monthlyTransactions.map((tx) => [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.description.replace(/"/g, '""')}"`,
      `"${tx.category}"`,
      `"${tx.type}"`,
      tx.amount,
      `"${tx.paymentMethod || 'UPI / GPay / PhonePe'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `MyFinance_Report_${MONTHS[selectedMonth]}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${monthlyTransactions.length} transactions to CSV!`);
  };

  // Trigger browser print dialog formatted via print stylesheet for PDF generation
  const handlePrintPDF = () => {
    window.print();
  };

  const activeCategories = categoryBreakdown.filter((c) => c.amount > 0);

  return (
    <div className="space-y-6">
      {/* Top Header with Month Selector and Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#F8FAFC]">
            Financial Statement & Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">
            Audit-ready statement for {MONTHS[selectedMonth]} {selectedYear}. Download CSV or print/save as PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1.5 bg-[#10182B] border border-white/10 rounded-xl px-3 py-2 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#22D3EE]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              aria-label="Select report month"
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
              aria-label="Select report year"
              className="bg-transparent text-xs font-medium text-[#94A3B8] focus:outline-none cursor-pointer"
            >
              {[2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="bg-[#10182B]">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <GradientButton variant="secondary" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 text-[#22D3EE]" />
            Download CSV
          </GradientButton>

          <GradientButton size="sm" onClick={handlePrintPDF}>
            <Printer className="w-4 h-4" />
            Print / Save as PDF
          </GradientButton>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div ref={printAreaRef} className="space-y-6">
        {/* Printable Official Statement Header */}
        <GlassCard className="p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22D3EE] to-[#8B5CF6] flex items-center justify-center font-heading font-bold text-[#070B18] text-sm">
                  MF
                </div>
                <h2 className="text-xl font-heading font-bold text-[#F8FAFC]">
                  MyFinance Statement
                </h2>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                Account Holder: <strong className="text-[#F8FAFC]">{currentUser?.name || 'Aarav Sharma'}</strong> ({currentUser?.email})
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#22D3EE]/15 text-[#22D3EE] border border-[#22D3EE]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Local Statement
              </span>
              <p className="text-xs text-[#94A3B8] mt-1.5">
                Reporting Period: <strong className="text-[#F8FAFC]">{MONTHS[selectedMonth]} {selectedYear}</strong>
              </p>
            </div>
          </div>

          {/* Key Metric Highlights in Report */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] text-[#94A3B8] block">Total Monthly Income</span>
              <span className="text-base sm:text-lg font-heading font-bold text-[#34D399]">
                {formatINR(monthlySummary.totalIncome)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] text-[#94A3B8] block">Total Monthly Expenses</span>
              <span className="text-base sm:text-lg font-heading font-bold text-[#22D3EE]">
                {formatINR(monthlySummary.totalExpenses)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] text-[#94A3B8] block">Configured Budget</span>
              <span className="text-base sm:text-lg font-heading font-bold text-[#F8FAFC]">
                {formatINR(monthlySummary.monthlyBudget)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[11px] text-[#94A3B8] block">Remaining Budget</span>
              <span
                className={`text-base sm:text-lg font-heading font-bold ${
                  monthlySummary.remainingBudget < 0 ? 'text-[#FB7185]' : 'text-[#34D399]'
                }`}
              >
                {formatINR(monthlySummary.remainingBudget)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 col-span-2 md:col-span-1">
              <span className="text-[11px] text-[#94A3B8] block">Net Monthly Cash Flow</span>
              <span
                className={`text-base sm:text-lg font-heading font-bold ${
                  monthlySummary.netCashFlow >= 0 ? 'text-[#34D399]' : 'text-[#FB7185]'
                }`}
              >
                {monthlySummary.netCashFlow >= 0 ? '+' : ''}
                {formatINR(monthlySummary.netCashFlow)}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Category Breakdown Table */}
        <GlassCard className="p-6">
          <h3 className="text-base font-heading font-bold text-[#F8FAFC] mb-4">
            Category Breakdown Summary ({MONTHS[selectedMonth]} {selectedYear})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 uppercase tracking-wider text-[#94A3B8] bg-white/[0.02]">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                  <th className="py-2.5 px-3 text-right">% of Total Expenses</th>
                  <th className="py-2.5 px-3 text-right">% of Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeCategories.map((cat) => {
                  const shareOfBudget =
                    monthlySummary.monthlyBudget > 0
                      ? Number(((cat.amount / monthlySummary.monthlyBudget) * 100).toFixed(1))
                      : 0;
                  return (
                    <tr key={cat.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-medium text-[#F8FAFC]">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#94A3B8]">{cat.count}</td>
                      <td className="py-2.5 px-3 text-right font-heading font-semibold text-[#F8FAFC]">
                        {formatINR(cat.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#22D3EE] font-medium">
                        {cat.percentage}%
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#94A3B8]">{shareOfBudget}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Complete Transaction Ledger for Selected Month */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-heading font-bold text-[#F8FAFC]">
              Detailed Transactions List ({monthlyTransactions.length} records)
            </h3>
            <span className="text-xs text-[#94A3B8]">
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 uppercase tracking-wider text-[#94A3B8] bg-white/[0.02]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {monthlyTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02]">
                    <td className="py-2 px-3 text-[#94A3B8] whitespace-nowrap">
                      {formatReadableDate(tx.date)}
                    </td>
                    <td className="py-2 px-3 font-medium text-[#F8FAFC]">{tx.description}</td>
                    <td className="py-2 px-3 text-[#94A3B8]">{tx.category}</td>
                    <td className="py-2 px-3 text-[#94A3B8]">{tx.paymentMethod}</td>
                    <td className="py-2 px-3 uppercase text-[10px] font-semibold">
                      <span
                        className={tx.type === 'income' ? 'text-[#34D399]' : 'text-[#FB7185]'}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-heading font-bold ${
                        tx.type === 'income' ? 'text-[#34D399]' : 'text-[#F8FAFC]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
