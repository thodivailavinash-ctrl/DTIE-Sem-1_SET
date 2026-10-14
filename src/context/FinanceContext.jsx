import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DEMO_USER_ID, DEMO_USER_PROFILE, buildSeedDataForUser } from '../data/seedData';
import { createPasswordVerifier, verifyPassword } from '../utils/cryptoAuth';
import { parseLocalDate, generateId } from '../utils/formatters';
import { EXPENSE_CATEGORIES } from '../utils/categories';

const FinanceContext = createContext(null);

const STORAGE_KEYS = {
  USERS: 'myfinance_users_v1',
  SESSION: 'myfinance_session_v1',
  SETTINGS: 'myfinance_settings_v1',
  USER_DATA_PREFIX: 'myfinance_data_v1_'
};

export function FinanceProvider({ children }) {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Settings state (persisted)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to read settings', e);
    }
    return {
      currency: 'INR',
      theme: 'dark',
      reducedMotion: false
    };
  });

  // Apply theme & reduced motion classes to HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [settings]);

  // Users registry (with Demo user pre-initialized)
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USERS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load users', e);
    }
    return [DEMO_USER_PROFILE];
  });

  // Ensure demo user is always present and has initial data
  useEffect(() => {
    let mounted = true;
    async function ensureDemoAccount() {
      try {
        const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
        let parsedUsers = rawUsers ? JSON.parse(rawUsers) : [];
        let demoUser = parsedUsers.find((u) => u.id === DEMO_USER_ID || u.email === DEMO_USER_PROFILE.email);

        if (!demoUser) {
          const { salt, verifier } = await createPasswordVerifier('Demo@1234');
          demoUser = {
            ...DEMO_USER_PROFILE,
            salt,
            verifier
          };
          parsedUsers = [demoUser, ...parsedUsers];
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
          if (mounted) setUsers(parsedUsers);
        } else if (!demoUser.verifier) {
          const { salt, verifier } = await createPasswordVerifier('Demo@1234');
          demoUser.salt = salt;
          demoUser.verifier = verifier;
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsedUsers));
          if (mounted) setUsers(parsedUsers);
        }

        const demoDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${DEMO_USER_ID}`;
        if (!localStorage.getItem(demoDataKey)) {
          const seed = buildSeedDataForUser(DEMO_USER_ID);
          localStorage.setItem(demoDataKey, JSON.stringify(seed));
        }
      } catch (e) {
        console.error('Error initializing demo user:', e);
      }
    }
    ensureDemoAccount();
    return () => {
      mounted = false;
    };
  }, []);

  // Current Authenticated User Session
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    }
    return null;
  });

  // Active User's Financial Data (Transactions, Budgets, SavingsGoals)
  const [userData, setUserData] = useState({
    transactions: [],
    budgets: [],
    savingsGoals: []
  });

  // Load user data when currentUser changes
  useEffect(() => {
    if (!currentUser?.id) {
      setUserData({ transactions: [], budgets: [], savingsGoals: [] });
      return;
    }
    const key = `${STORAGE_KEYS.USER_DATA_PREFIX}${currentUser.id}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData({
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
          budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
          savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : []
        });
      } else {
        // Seed initial data if demo user or empty data with default ₹35,000 budget for new user
        const initial = currentUser.id === DEMO_USER_ID
          ? buildSeedDataForUser(DEMO_USER_ID)
          : {
              transactions: [],
              budgets: [
                {
                  id: `budget_${currentUser.id}_${now.getFullYear()}_${now.getMonth()}`,
                  userId: currentUser.id,
                  month: now.getMonth(),
                  year: now.getFullYear(),
                  amount: 35000
                }
              ],
              savingsGoals: []
            };
        localStorage.setItem(key, JSON.stringify(initial));
        setUserData(initial);
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    }
  }, [currentUser?.id]);

  // Helper to persist userData changes immediately
  const persistUserData = useCallback(
    (updater) => {
      setUserData((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        if (currentUser?.id) {
          try {
            localStorage.setItem(
              `${STORAGE_KEYS.USER_DATA_PREFIX}${currentUser.id}`,
              JSON.stringify(next)
            );
          } catch (e) {
            console.error('Failed to persist user data', e);
          }
        }
        return next;
      });
    },
    [currentUser?.id]
  );

  // ================= AUTHENTICATION ACTIONS =================

  const login = async (email, password, rememberMe = true) => {
    const cleanEmail = email.trim().toLowerCase();
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const list = rawUsers ? JSON.parse(rawUsers) : users;

    // Support direct login to Demo account
    const matchedUser = list.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      throw new Error('No account found with this email address. Try Demo Mode or Sign Up.');
    }

    if (matchedUser.salt && matchedUser.verifier) {
      const isValid = await verifyPassword(password, matchedUser.salt, matchedUser.verifier);
      if (!isValid) {
        throw new Error('Invalid password. For Demo account, use Demo@1234 or click Enter Demo Mode.');
      }
    }

    const sessionUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      createdAt: matchedUser.createdAt,
      isDemoAccount: Boolean(matchedUser.isDemoAccount)
    };

    setCurrentUser(sessionUser);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    }
    return sessionUser;
  };

  const register = async ({ name, email, password, seedWithSampleData = true }) => {
    const cleanEmail = email.trim().toLowerCase();
    const rawUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const list = rawUsers ? JSON.parse(rawUsers) : [...users];

    if (list.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const { salt, verifier } = await createPasswordVerifier(password);
    const newUserId = generateId('user');
    const newUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      salt,
      verifier,
      isDemoAccount: false
    };

    const updatedUsers = [...list, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Initialize user's financial store (optionally pre-seeded with realistic demo transactions so their college presentation has rich charts immediately)
    const initialData = seedWithSampleData
      ? buildSeedDataForUser(newUserId)
      : {
          transactions: [],
          budgets: [
            {
              id: `budget_${newUserId}_${now.getFullYear()}_${now.getMonth()}`,
              userId: newUserId,
              month: now.getMonth(),
              year: now.getFullYear(),
              amount: 35000
            }
          ],
          savingsGoals: []
        };

    localStorage.setItem(`${STORAGE_KEYS.USER_DATA_PREFIX}${newUserId}`, JSON.stringify(initialData));

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      isDemoAccount: false
    };

    setCurrentUser(sessionUser);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const enterDemoMode = () => {
    const demoDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${DEMO_USER_ID}`;
    if (!localStorage.getItem(demoDataKey)) {
      const seed = buildSeedDataForUser(DEMO_USER_ID);
      localStorage.setItem(demoDataKey, JSON.stringify(seed));
    }
    const sessionUser = { ...DEMO_USER_PROFILE };
    setCurrentUser(sessionUser);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionUser));
    return sessionUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  };

  const updateProfileName = (newName) => {
    if (!currentUser || !newName.trim()) return;
    const trimmed = newName.trim();
    const updatedSession = { ...currentUser, name: trimmed };
    setCurrentUser(updatedSession);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedSession));

    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, name: trimmed } : u));
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
  };

  const resetDemoData = () => {
    const targetId = currentUser?.id || DEMO_USER_ID;
    const freshSeed = buildSeedDataForUser(targetId);
    localStorage.setItem(`${STORAGE_KEYS.USER_DATA_PREFIX}${targetId}`, JSON.stringify(freshSeed));
    setUserData(freshSeed);
    const current = new Date();
    setSelectedMonth(current.getMonth());
    setSelectedYear(current.getFullYear());
  };

  // ================= TRANSACTIONS CRUD =================

  const addTransaction = (txInput) => {
    if (!currentUser) return null;
    const newTx = {
      id: generateId('tx'),
      userId: currentUser.id,
      type: txInput.type === 'income' ? 'income' : 'expense',
      amount: Number(txInput.amount),
      category: txInput.category,
      description: txInput.description.trim(),
      date: txInput.date,
      paymentMethod: txInput.paymentMethod || 'UPI / GPay / PhonePe',
      createdAt: new Date().toISOString(),
      ...(txInput.aiSuggested !== undefined ? { aiSuggested: txInput.aiSuggested } : {}),
      ...(txInput.aiConfidence !== undefined ? { aiConfidence: txInput.aiConfidence } : {}),
      ...(txInput.aiReason ? { aiReason: txInput.aiReason } : {})
    };

    persistUserData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions]
    }));

    // Also switch selected month/year to match added transaction if user wants immediate visibility, or keep current if same
    const parsed = parseLocalDate(newTx.date);
    setSelectedMonth(parsed.month);
    setSelectedYear(parsed.year);

    return newTx;
  };

  const updateTransaction = (id, updatedFields) => {
    persistUserData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === id
          ? {
              ...tx,
              ...updatedFields,
              amount: Number(updatedFields.amount ?? tx.amount)
            }
          : tx
      )
    }));
  };

  const deleteTransaction = (id) => {
    persistUserData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id)
    }));
  };

  // ================= BUDGET CRUD =================

  const setMonthlyBudget = (amount, month = selectedMonth, year = selectedYear) => {
    if (!currentUser) return;
    const numericAmount = Math.max(0, Number(amount) || 0);
    persistUserData((prev) => {
      const existingIndex = prev.budgets.findIndex(
        (b) => b.month === month && b.year === year
      );
      let nextBudgets;
      if (existingIndex >= 0) {
        nextBudgets = prev.budgets.map((b, idx) =>
          idx === existingIndex ? { ...b, amount: numericAmount } : b
        );
      } else {
        nextBudgets = [
          ...prev.budgets,
          {
            id: `budget_${currentUser.id}_${year}_${month}`,
            userId: currentUser.id,
            month,
            year,
            amount: numericAmount
          }
        ];
      }
      return { ...prev, budgets: nextBudgets };
    });
  };

  // ================= SAVINGS GOALS CRUD =================

  const addSavingsGoal = (goalInput) => {
    if (!currentUser) return null;
    const newGoal = {
      id: generateId('goal'),
      userId: currentUser.id,
      title: goalInput.title.trim(),
      targetAmount: Number(goalInput.targetAmount),
      savedAmount: Number(goalInput.savedAmount || 0),
      targetDate: goalInput.targetDate || '',
      category: goalInput.category || 'Other',
      color: goalInput.color || '#22D3EE'
    };
    persistUserData((prev) => ({
      ...prev,
      savingsGoals: [newGoal, ...prev.savingsGoals]
    }));
    return newGoal;
  };

  const updateSavingsGoal = (id, updates) => {
    persistUserData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id
          ? {
              ...g,
              ...updates,
              targetAmount: Number(updates.targetAmount ?? g.targetAmount),
              savedAmount: Number(updates.savedAmount ?? g.savedAmount)
            }
          : g
      )
    }));
  };

  const addGoalContribution = (id, contributionAmount) => {
    const addAmt = Number(contributionAmount) || 0;
    if (addAmt <= 0) return;
    persistUserData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map((g) =>
        g.id === id
          ? { ...g, savedAmount: g.savedAmount + addAmt }
          : g
      )
    }));
  };

  const deleteSavingsGoal = (id) => {
    persistUserData((prev) => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter((g) => g.id !== id)
    }));
  };

  // ================= DERIVED FINANCIAL METRICS =================

  // Transactions filtered for the currently selected month & year
  const monthlyTransactions = useMemo(() => {
    return userData.transactions
      .filter((tx) => {
        const { month, year } = parseLocalDate(tx.date);
        return month === selectedMonth && year === selectedYear;
      })
      .sort((a, b) => {
        if (b.date !== a.date) return b.date.localeCompare(a.date);
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [userData.transactions, selectedMonth, selectedYear]);

  // Current month's configured budget (defaults to 35,000 if not explicitly set for that month)
  const currentMonthlyBudget = useMemo(() => {
    const found = userData.budgets.find(
      (b) => b.month === selectedMonth && b.year === selectedYear
    );
    return found ? Number(found.amount) : 35000;
  }, [userData.budgets, selectedMonth, selectedYear]);

  // Summary calculations for selected month
  const monthlySummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const tx of monthlyTransactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpenses += amt;
      }
    }

    const remainingBudget = currentMonthlyBudget - totalExpenses;
    const budgetUsedPercentage =
      currentMonthlyBudget > 0
        ? Number(((totalExpenses / currentMonthlyBudget) * 100).toFixed(2))
        : totalExpenses > 0
        ? 100
        : 0;

    const netCashFlow = totalIncome - totalExpenses;
    const expenseCount = monthlyTransactions.filter((t) => t.type === 'expense').length;
    const avgExpensePerTx = expenseCount > 0 ? Math.round(totalExpenses / expenseCount) : 0;

    return {
      totalIncome,
      totalExpenses,
      monthlyBudget: currentMonthlyBudget,
      remainingBudget,
      budgetUsedPercentage,
      netCashFlow,
      expenseCount,
      avgExpensePerTx,
      isOverspent: currentMonthlyBudget > 0 && totalExpenses > currentMonthlyBudget
    };
  }, [monthlyTransactions, currentMonthlyBudget]);

  // Category Breakdown for selected month
  const categoryBreakdown = useMemo(() => {
    const totalsByCat = {};
    const countByCat = {};
    EXPENSE_CATEGORIES.forEach((c) => {
      totalsByCat[c.id] = 0;
      countByCat[c.id] = 0;
    });

    monthlyTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const cat = totalsByCat[tx.category] !== undefined ? tx.category : 'Other';
        totalsByCat[cat] += Number(tx.amount) || 0;
        countByCat[cat] += 1;
      });

    return EXPENSE_CATEGORIES.map((cat) => {
      const amount = totalsByCat[cat.id] || 0;
      const count = countByCat[cat.id] || 0;
      const percentage =
        monthlySummary.totalExpenses > 0
          ? Number(((amount / monthlySummary.totalExpenses) * 100).toFixed(1))
          : 0;
      return {
        ...cat,
        amount,
        count,
        percentage
      };
    });
  }, [monthlyTransactions, monthlySummary.totalExpenses]);

  // Multi-month trend data (last 6 months ending at selectedMonth/selectedYear)
  const sixMonthHistory = useMemo(() => {
    const result = [];
    const shortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let offset = -5; offset <= 0; offset++) {
      const d = new Date(selectedYear, selectedMonth + offset, 1);
      const m = d.getMonth();
      const y = d.getFullYear();

      let income = 0;
      let expenses = 0;

      userData.transactions.forEach((tx) => {
        const parsed = parseLocalDate(tx.date);
        if (parsed.month === m && parsed.year === y) {
          if (tx.type === 'income') income += Number(tx.amount) || 0;
          else expenses += Number(tx.amount) || 0;
        }
      });

      const budgetObj = userData.budgets.find((b) => b.month === m && b.year === y);
      const budget = budgetObj ? Number(budgetObj.amount) : 35000;

      result.push({
        monthIndex: m,
        year: y,
        name: shortNames[m],
        fullName: `${shortNames[m]} ${y}`,
        income,
        expenses,
        savings: Math.max(0, income - expenses),
        budget
      });
    }
    return result;
  }, [userData.transactions, userData.budgets, selectedMonth, selectedYear]);

  const value = {
    currentUser,
    settings,
    setSettings,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    transactions: userData.transactions,
    monthlyTransactions,
    budgets: userData.budgets,
    savingsGoals: userData.savingsGoals,
    monthlySummary,
    categoryBreakdown,
    sixMonthHistory,
    login,
    register,
    enterDemoMode,
    logout,
    updateProfileName,
    resetDemoData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setMonthlyBudget,
    addSavingsGoal,
    updateSavingsGoal,
    addGoalContribution,
    deleteSavingsGoal
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
