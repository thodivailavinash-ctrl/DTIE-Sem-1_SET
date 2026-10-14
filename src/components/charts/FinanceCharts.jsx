import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { formatINR } from '../../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="glass-panel rounded-xl px-3.5 py-2.5 border border-white/15 shadow-xl text-xs">
      {label && <p className="font-heading font-semibold text-[#F8FAFC] mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#94A3B8]">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.payload?.color || '#22D3EE' }}
              />
              {entry.name}:
            </span>
            <span className="font-heading font-semibold text-[#F8FAFC]">
              {formatINR(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryDonutChart({ data = [], height = 270 }) {
  const activeData = data.filter((d) => d.amount > 0);

  if (activeData.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center text-center text-sm text-[#94A3B8]"
      >
        <p>No expense data recorded for this month yet.</p>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={3}
            stroke="none"
          >
            {activeData.map((entry) => (
              <Cell key={entry.id} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlySpendingBarChart({ data = [], height = 270 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barCyanViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.75} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="expenses"
            name="Monthly Expenses"
            fill="url(#barCyanViolet)"
            radius={[8, 8, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeVsExpensesLineChart({ data = [], height = 270 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px', color: '#94A3B8' }}
          />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#34D399"
            strokeWidth={3}
            dot={{ r: 4, fill: '#34D399', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#34D399' }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#FB7185"
            strokeWidth={3}
            dot={{ r: 4, fill: '#FB7185', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#FB7185' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SpendingTrendAreaChart({ data = [], height = 280 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="areaCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="areaViolet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Actual Spending"
            stroke="#22D3EE"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#areaCyan)"
          />
          <Area
            type="monotone"
            dataKey="savings"
            name="Net Monthly Savings"
            stroke="#8B5CF6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#areaViolet)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
