/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Home,
  Navigation,
  Utensils,
  Receipt,
  PiggyBank,
  User,
  MapPin,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Tag,
  Flame,
  Scale,
  HeartPulse,
  Plus,
  Trash2,
  Wallet,
  Check,
  TrendingDown,
  X,
  LogIn,
  GraduationCap,
  Users,
  Compass,
  Map as MapIcon,
  ArrowLeftRight
} from "lucide-react";
import {
  PRESET_MEALS,
  TransitCommute,
  PresetMealInput
} from "./data";
import { UserProfile, ExpenseItem, ActiveTab, LoggedMealItem } from "./types";
import { HomeSection } from "./components/HomeSection";
import { BuddySmileyIcon } from "./components/BuddySmileyIcon";
import { AccountSection } from "./components/AccountSection";
import { AuthModal } from "./components/AuthModal";
import { RegistrationView } from "./components/RegistrationView";
import { GoogleMapsStationInput } from "./components/GoogleMapsStationInput";
import { GoogleMapsStationMenuModal } from "./components/GoogleMapsStationMenuModal";
import { CheapMealFinder } from "./components/CheapMealFinder";
import { NutritionAdvisorSection } from "./components/NutritionAdvisorSection";
import { POPULAR_COMMUTE_PAIRS } from "./transitStations";
import { getRegisteredAccounts, normalizePhoneNumber } from "./accountStorage";
import { calculateDynamicTransit } from "./commutePriceCalculator";

export default function App() {
  // Navigation tabs: Home | Commute | Food | Savings | Account
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  
  // User Account & Authentication State (Null until user creates account with verified payment or logs into a registered account)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      // Clean up legacy keys
      localStorage.removeItem("unipal_user");

      const saved = localStorage.getItem("unimate_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          // Strictly verify that the user exists in registered accounts and has an active paid subscription
          const registered = getRegisteredAccounts();
          const matched = registered.find(
            (acc) =>
              acc.email?.trim().toLowerCase() === parsed.email?.trim().toLowerCase() ||
              (acc.phoneNumber && parsed.phoneNumber && normalizePhoneNumber(acc.phoneNumber) === normalizePhoneNumber(parsed.phoneNumber))
          );
          
          if (matched && matched.subscriptionStatus === "active") {
            return matched;
          }
        }
      }
      // If no valid paid/registered account, clear stale storage
      localStorage.removeItem("unimate_user");
    } catch (e) {
      console.warn("Could not read stored user:", e);
      try { localStorage.removeItem("unimate_user"); } catch (_) {}
    }
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  // Loading & Error States
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 1. Commute Optimizer State (no preset mock values)
  const [transitFrom, setTransitFrom] = useState<string>("");
  const [transitTo, setTransitTo] = useState<string>("");
  const [transitResponse, setTransitResponse] = useState<any | null>(null);
  const [isCommuteMapsModalOpen, setIsCommuteMapsModalOpen] = useState<boolean>(false);
  const [commuteMapsRole, setCommuteMapsRole] = useState<"departure" | "destination" | "general">("general");

  const handleSwapStations = () => {
    const temp = transitFrom;
    setTransitFrom(transitTo);
    setTransitTo(temp);
  };

  // 2. Food & Nutrition Guide State (Multi-Meal Tracker, Nutrition Advisor & Cheap Meal Finder)
  const [foodSubTab, setFoodSubTab] = useState<"cheap_meals" | "nutrition_tracker" | "nutrition_advisor">("cheap_meals");
  const [mealTypeInput, setMealTypeInput] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack" | "Late Night Study">("Lunch");
  const [mealTextInput, setMealTextInput] = useState<string>("");
  const [mealCostInput, setMealCostInput] = useState<string>("");
  const [logAsExpense, setLogAsExpense] = useState<boolean>(true);
  const [mealSuccessToast, setMealSuccessToast] = useState<string | null>(null);

  // Multi-Meal array storage (allows inputting meal for nutrition guide repeatedly)
  const [loggedMeals, setLoggedMeals] = useState<LoggedMealItem[]>(() => {
    try {
      const saved = localStorage.getItem("unimate_logged_meals");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read logged meals:", e);
    }
    return [
      {
        id: "meal-init-1",
        mealType: "Breakfast",
        name: "2 Roti Canai + Yellow Dhal Curry",
        description: "Two pan-fried flatbreads served with mixed split pea lentil curry (dhal) and small side of spicy chili sambal onion paste",
        calories: 620,
        proteinGrams: 16,
        carbsGrams: 78,
        fatGrams: 28,
        sodiumMg: 740,
        compositionBreakdown: "Carbohydrates from wheat flour, plant protein and dietary fiber from yellow dhal lentils.",
        loggedAt: "8:30 AM",
        costMYR: 4.00
      },
      {
        id: "meal-init-2",
        mealType: "Lunch",
        name: "Economy Mixed Rice (1 Meat + 1 Veg)",
        description: "1 scoop brown rice, turmeric fried chicken fillet, stir-fried garlic kangkung, and clear soup",
        calories: 560,
        proteinGrams: 34,
        carbsGrams: 55,
        fatGrams: 18,
        sodiumMg: 680,
        compositionBreakdown: "Lean poultry protein, micronutrients & fiber from vegetables, balanced energy for afternoon lectures.",
        loggedAt: "1:15 PM",
        costMYR: 6.50
      }
    ];
  });

  // Persist logged meals
  useEffect(() => {
    try {
      localStorage.setItem("unimate_logged_meals", JSON.stringify(loggedMeals));
    } catch (e) {
      console.warn("Could not persist logged meals:", e);
    }
  }, [loggedMeals]);

  // 3. Monthly Savings & Allowance Budget Tracker State
  const [monthlyIncome, setMonthlyIncome] = useState<number>(() => currentUser?.monthlyBudget || 850);
  const [expensesList, setExpensesList] = useState<ExpenseItem[]>(() => {
    try {
      const savedExp = localStorage.getItem("unimate_expenses");
      if (savedExp) return JSON.parse(savedExp);
    } catch (e) {
      console.warn("Could not read stored expenses:", e);
    }
    return [];
  });

  // Manual Expense Input Form State
  const [manualTitle, setManualTitle] = useState<string>("");
  const [manualAmount, setManualAmount] = useState<string>("");
  const [manualCategory, setManualCategory] = useState<"Food" | "Commute" | "Campus" | "Utilities" | "Other">("Food");

  // Synchronize stations when user logs in or registers
  useEffect(() => {
    if (currentUser) {
      if (!transitFrom && currentUser.homeStation) {
        setTransitFrom(currentUser.homeStation);
      }
      if (!transitTo && currentUser.campusStation) {
        setTransitTo(currentUser.campusStation);
      }
      setMonthlyIncome(currentUser.monthlyBudget || 850);
    }
  }, [currentUser]);

  // Persist expenses list
  useEffect(() => {
    try {
      localStorage.setItem("unimate_expenses", JSON.stringify(expensesList));
    } catch (e) {
      console.warn("Could not persist expenses:", e);
    }
  }, [expensesList]);

  // Sync user profile updates
  const handleUpdateUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    setMonthlyIncome(updated.monthlyBudget);
    try {
      localStorage.setItem("unimate_user", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not persist user:", e);
    }
  };

  const handleLoginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setMonthlyIncome(user.monthlyBudget);
    setTransitFrom(user.homeStation || "");
    setTransitTo(user.campusStation || "");
    try {
      localStorage.setItem("unimate_user", JSON.stringify(user));
    } catch (e) {
      console.warn("Could not persist user:", e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("unimate_user");
    localStorage.removeItem("unipal_user");
    setActiveTab("home");
    setTransitResponse(null);
  };

  const handleOpenAuth = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // API Call: Commute Route & Public vs Private Comparison (Zero-delay instant calculation + AI enhancement)
  const fetchTransitEstimate = async (fromLoc: string, toLoc: string) => {
    if (!fromLoc.trim() || !toLoc.trim()) return;
    
    // 1. Immediately calculate and set the multi-app dynamic transit fares
    const instantResult = calculateDynamicTransit(fromLoc, toLoc);
    setTransitResponse(instantResult);

    // 2. Fetch enhanced/live API response
    setLoadingAI(true);
    setAiError(null);
    try {
      const response = await fetch("/api/gemini/transit-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromLocation: fromLoc, toLocation: toLoc, appName: "UniMate" })
      });
      const data = await response.json();
      if (data.result) {
        setTransitResponse(data.result);
      }
    } catch (err: any) {
      console.warn("Using instant calculation route result:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  // Auto-refresh commute comparison whenever transitFrom or transitTo changes
  useEffect(() => {
    if (transitFrom.trim() && transitTo.trim()) {
      const dynamicRoute = calculateDynamicTransit(transitFrom, transitTo);
      setTransitResponse(dynamicRoute);
    }
  }, [transitFrom, transitTo]);

  // Function to analyze and log a meal (Supports multiple inputs throughout the day!)
  const handleAnalyzeAndLogMeal = async (
    customDesc?: string,
    customType?: "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Late Night Study",
    customCost?: number,
    presetNutrition?: {
      name: string;
      description: string;
      calories: number;
      protein?: number;
      carbs?: number;
      fat?: number;
      sodium?: number;
      compositionBreakdown?: string;
    }
  ) => {
    const descToUse = (customDesc || mealTextInput).trim();
    if (!descToUse && !presetNutrition) return;

    const typeToUse = customType || mealTypeInput;
    const costToUse = customCost !== undefined ? customCost : parseFloat(mealCostInput);

    setLoadingAI(true);
    setAiError(null);
    setMealSuccessToast(null);

    try {
      let analysisResult = presetNutrition;

      if (!analysisResult) {
        const response = await fetch("/api/gemini/analyze-meal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mealDescription: descToUse, appName: "UniMate" })
        });
        const data = await response.json();
        if (data.result) {
          analysisResult = {
            name: data.result.dishName || descToUse.slice(0, 30),
            description: descToUse,
            calories: Number(data.result.estimatedCalories) || 550,
            protein: Number(data.result.proteinGrams) || 22,
            carbs: Number(data.result.carbsGrams) || 60,
            fat: Number(data.result.fatGrams) || 16,
            sodium: Number(data.result.sodiumMg) || 650,
            compositionBreakdown: data.result.compositionBreakdown || "Malaysian student meal portion."
          };
        }
      }

      // Offline client fallback if API returns empty
      if (!analysisResult) {
        analysisResult = {
          name: descToUse.slice(0, 30),
          description: descToUse,
          calories: 560,
          protein: 24,
          carbs: 62,
          fat: 17,
          sodium: 680,
          compositionBreakdown: "Nutrient-rich campus meal with high energy for studying."
        };
      }

      const newLoggedMeal: LoggedMealItem = {
        id: `meal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        mealType: typeToUse,
        name: analysisResult.name || descToUse.slice(0, 30),
        description: analysisResult.description || descToUse,
        calories: Number(analysisResult.calories) || 550,
        proteinGrams: Number(analysisResult.protein) || 20,
        carbsGrams: Number(analysisResult.carbs) || 60,
        fatGrams: Number(analysisResult.fat) || 15,
        sodiumMg: Number(analysisResult.sodium) || 600,
        compositionBreakdown: analysisResult.compositionBreakdown || "Balanced campus meal portion.",
        loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        costMYR: !isNaN(costToUse) && costToUse > 0 ? costToUse : undefined
      };

      // Append to multi-meal list
      setLoggedMeals((prev) => [newLoggedMeal, ...prev]);

      // Automatically add to food expense if enabled
      if (logAsExpense && !isNaN(costToUse) && costToUse > 0) {
        const foodExpense: ExpenseItem = {
          id: `exp-${Date.now()}`,
          title: `${typeToUse}: ${newLoggedMeal.name}`,
          amount: costToUse,
          category: "Food",
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          source: "Manual"
        };
        setExpensesList((prev) => [foodExpense, ...prev]);
      }

      setMealTextInput("");
      setMealCostInput("");
      setMealSuccessToast(`Logged ${newLoggedMeal.name} (${typeToUse}) to your Daily Nutrition Guide! Add another meal below.`);
      setTimeout(() => setMealSuccessToast(null), 5000);
    } catch (err: any) {
      console.warn("Meal analysis error:", err);
      const fallbackMeal: LoggedMealItem = {
        id: `meal-${Date.now()}`,
        mealType: typeToUse,
        name: descToUse.slice(0, 30),
        description: descToUse,
        calories: 550,
        proteinGrams: 22,
        carbsGrams: 60,
        fatGrams: 16,
        sodiumMg: 650,
        compositionBreakdown: "Locally prepared Malaysian meal with standard macros.",
        loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        costMYR: !isNaN(costToUse) && costToUse > 0 ? costToUse : undefined
      };
      setLoggedMeals((prev) => [fallbackMeal, ...prev]);
      setMealTextInput("");
      setMealCostInput("");
      setMealSuccessToast(`Logged ${fallbackMeal.name} to your Nutrition Guide!`);
      setTimeout(() => setMealSuccessToast(null), 5000);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleDeleteLoggedMeal = (id: string) => {
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearAllMeals = () => {
    if (window.confirm("Reset all logged meals for today?")) {
      setLoggedMeals([]);
    }
  };

  // Add Manual Expense Item
  const handleAddManualExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(manualAmount);
    if (!manualTitle.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      title: manualTitle.trim(),
      amount: parsedAmt,
      category: manualCategory,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      source: "Manual"
    };

    setExpensesList((prev) => [newExpense, ...prev]);
    setManualTitle("");
    setManualAmount("");
  };

  // Delete Expense Item
  const handleDeleteExpense = (id: string) => {
    setExpensesList((prev) => prev.filter((item) => item.id !== id));
  };

  // Daily Nutrition Calculations
  const totalDailyCalories = loggedMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalDailyProtein = loggedMeals.reduce((sum, m) => sum + (m.proteinGrams || 0), 0);
  const totalDailyCarbs = loggedMeals.reduce((sum, m) => sum + (m.carbsGrams || 0), 0);
  const totalDailyFat = loggedMeals.reduce((sum, m) => sum + (m.fatGrams || 0), 0);
  const totalDailySodium = loggedMeals.reduce((sum, m) => sum + (m.sodiumMg || 0), 0);
  const targetCalories = 2000;
  const caloriePercent = Math.min(100, Math.round((totalDailyCalories / targetCalories) * 100));

  // Budget Calculations
  const totalSpent = expensesList.reduce((sum, item) => sum + item.amount, 0);
  const remainingSavings = monthlyIncome - totalSpent;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, (remainingSavings / monthlyIncome) * 100) : 0;
  const spentRate = monthlyIncome > 0 ? Math.min(100, (totalSpent / monthlyIncome) * 100) : 0;

  // IF NO USER IS LOGGED IN / REGISTERED YET: SHOW ONBOARDING REGISTRATION FIRST
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0c0822] text-white font-sans antialiased p-3 sm:p-6 md:p-8 flex flex-col items-center justify-center selection:bg-[#fed618] selection:text-black">
        <RegistrationView
          onRegister={handleLoginUser}
          onOpenLogin={() => handleOpenAuth("login")}
        />
        
        {/* Returning student login prompt */}
        <div className="text-center mt-3">
          <button
            onClick={() => handleOpenAuth("login")}
            className="text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white bg-white/10 hover:bg-white/20 py-2.5 px-5 rounded-full border border-white/20 backdrop-blur cursor-pointer transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5 text-[#fed618]" />
            <span>Already have an account? Sign In</span>
          </button>
        </div>

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLoginUser}
          initialMode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-[#8875f0] text-white font-sans antialiased p-2 sm:p-4 md:p-6 lg:p-8 flex items-center justify-center selection:bg-[#fed618] selection:text-black">
      
      {/* Neo-brutalist Playful App Shell (Static Layout) */}
      <div className="w-full max-w-7xl bg-[#623bff] border-4 sm:border-8 border-black rounded-[28px] sm:rounded-[40px] brutal-shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] relative">
        
        {/* ========================================================= */}
        {/* SIDEBAR (CYBER YELLOW WITH BOLD VERDANA TYPOGRAPHY) */}
        {/* ========================================================= */}
        <aside className="bg-[#fed618] text-black border-b-4 lg:border-b-0 lg:border-r-8 border-black p-4 sm:p-6 lg:p-7 flex flex-col justify-between space-y-6 shrink-0 min-w-0">
          
          {/* Brand Box */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 lg:block">
              <h1 className="font-verdana text-3xl sm:text-4xl lg:text-5xl font-black leading-[0.9] tracking-tight text-black">
                Uni<br className="hidden lg:inline" />Mate
              </h1>
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center ml-auto lg:hidden">
                <BuddySmileyIcon className="w-6 h-6 text-[#fed618]" />
              </div>
            </div>
            <p className="font-extrabold text-xs sm:text-sm text-black tracking-tight uppercase mt-2">
              The only companion a student (really) needs.
            </p>
          </div>

          {/* Desktop Tab Selector in Sidebar */}
          <div className="hidden lg:flex flex-col gap-2.5 my-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-black/60 px-1">Navigation</span>
            
            <button
              id="tab-btn-home"
              onClick={() => { setActiveTab("home"); setAiError(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-left border-3 border-black text-xs font-black uppercase flex items-center gap-2.5 transition-all brutal-btn cursor-pointer ${
                activeTab === "home"
                  ? "bg-white text-black brutal-shadow -translate-x-0.5 -translate-y-0.5"
                  : "bg-black/10 text-black hover:bg-white/60"
              }`}
            >
              <Home className="w-4 h-4 text-black" />
              <span>Home</span>
            </button>

            <button
              id="tab-btn-commute"
              onClick={() => { setActiveTab("commute"); setAiError(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-left border-3 border-black text-xs font-black uppercase flex items-center gap-2.5 transition-all brutal-btn cursor-pointer ${
                activeTab === "commute"
                  ? "bg-white text-black brutal-shadow -translate-x-0.5 -translate-y-0.5"
                  : "bg-black/10 text-black hover:bg-white/60"
              }`}
            >
              <Navigation className="w-4 h-4 text-black" />
              <span>Commute</span>
            </button>

            <button
              id="tab-btn-food"
              onClick={() => { setActiveTab("food"); setAiError(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-left border-3 border-black text-xs font-black uppercase flex items-center gap-2.5 transition-all brutal-btn cursor-pointer ${
                activeTab === "food"
                  ? "bg-white text-black brutal-shadow -translate-x-0.5 -translate-y-0.5"
                  : "bg-black/10 text-black hover:bg-white/60"
              }`}
            >
              <Utensils className="w-4 h-4 text-black" />
              <div className="flex items-center justify-between w-full">
                <span>Food & Nutrition</span>
                <span className="text-[9px] bg-black text-[#fed618] px-1.5 py-0.2 rounded font-bold">
                  {loggedMeals.length}
                </span>
              </div>
            </button>

            <button
              id="tab-btn-savings"
              onClick={() => { setActiveTab("savings"); setAiError(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-left border-3 border-black text-xs font-black uppercase flex items-center gap-2.5 transition-all brutal-btn cursor-pointer ${
                activeTab === "savings"
                  ? "bg-white text-black brutal-shadow -translate-x-0.5 -translate-y-0.5"
                  : "bg-black/10 text-black hover:bg-white/60"
              }`}
            >
              <PiggyBank className="w-4 h-4 text-black" />
              <span>Savings</span>
            </button>

            <button
              id="tab-btn-account"
              onClick={() => { setActiveTab("account"); setAiError(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-left border-3 border-black text-xs font-black uppercase flex items-center gap-2.5 transition-all brutal-btn cursor-pointer ${
                activeTab === "account"
                  ? "bg-white text-black brutal-shadow -translate-x-0.5 -translate-y-0.5"
                  : "bg-black/10 text-black hover:bg-white/60"
              }`}
            >
              <User className="w-4 h-4 text-black" />
              <div className="flex items-center justify-between w-full">
                <span>Account</span>
                <span className="text-[9px] bg-black text-white px-1.5 py-0.2 rounded font-bold">
                  {currentUser.studentId ? "ID" : "STUDENT"}
                </span>
              </div>
            </button>
          </div>

          {/* Stat Bubble */}
          <div className="bg-white border-4 border-black p-4 rounded-2xl -rotate-2 brutal-shadow text-black">
            <span className="text-[10px] font-black uppercase tracking-wider block text-black/70">
              {activeTab === "commute" ? "Ride-Hailing Savings" : activeTab === "food" ? "Daily Calorie Intake" : "Current Net Savings"}
            </span>
            <strong className="block text-2xl sm:text-3xl font-verdana font-black leading-tight mt-1 text-black">
              {activeTab === "commute" ? "RM 5.70" : activeTab === "food" ? `${totalDailyCalories} kcal` : `RM ${remainingSavings.toFixed(2)}`}
            </strong>
            <span className="text-[10px] font-bold text-slate-600 block mt-0.5">
              {activeTab === "commute" ? "Cheapest Ride vs Grab Surge" : activeTab === "food" ? `${totalDailyProtein}g Protein • ${loggedMeals.length} Meals Logged` : `${savingsRate.toFixed(0)}% of allowance kept`}
            </span>
          </div>

        </aside>

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA (Clean Static Flow) */}
        {/* ========================================================= */}
        <main className="p-4 sm:p-6 lg:p-8 flex flex-col justify-between space-y-6 relative min-w-0 w-full overflow-x-hidden">
          
          {/* Top Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-white/20 pb-4">
            <div className="flex items-center gap-3">
              <button
                id="btn-header-profile"
                onClick={() => setActiveTab("account")}
                className="flex items-center gap-2 bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-black cursor-pointer transition-all"
              >
                <div
                  style={{ backgroundColor: currentUser.avatarColor || "#fb7185" }}
                  className="w-5 h-5 rounded-full text-black text-[10px] font-black flex items-center justify-center"
                >
                  <User className="w-3.5 h-3.5 text-black" />
                </div>
                <span className="text-white font-bold">{currentUser.name}</span>
                <span className="text-[10px] text-[#fed618] font-black uppercase">
                  ({currentUser.studentId})
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Mint Wallet Pill */}
              <div className="bg-[#44f287] text-black border-2 sm:border-3 border-black px-3.5 py-1.5 rounded-full font-black text-xs brutal-shadow-sm flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-black" />
                <span className="text-black/70 font-bold">Saved:</span>
                <span>RM {remainingSavings.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Global AI Error Notice */}
          {aiError && (
            <div id="ai-error-notice" className="bg-[#fb7185] border-4 border-black text-black p-4 rounded-2xl brutal-shadow text-xs font-bold flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-black" />
                <span>{aiError}</span>
              </div>
              <button
                id="btn-dismiss-ai-error"
                type="button"
                onClick={() => setAiError(null)}
                className="p-1 hover:bg-black/10 rounded-lg transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-black" />
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 0: HOMEPAGE (STUDENT OVERVIEW & QUICK ACTIONS) */}
          {/* ========================================================= */}
          {activeTab === "home" && (
            <HomeSection
              user={currentUser}
              totalSpent={totalSpent}
              remainingSavings={remainingSavings}
              savingsRate={savingsRate}
              spentRate={spentRate}
              expensesList={expensesList}
              onNavigate={(tab) => { setActiveTab(tab); setAiError(null); }}
              onOpenAuth={() => handleOpenAuth("login")}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 5: ACCOUNT & MATRICULATION PROFILE */}
          {/* ========================================================= */}
          {activeTab === "account" && (
            <AccountSection
              user={currentUser}
              onUpdateUser={handleUpdateUser}
              onOpenAuth={handleOpenAuth}
              onLogout={handleLogout}
            />
          )}

          {/* ========================================================= */}
          {/* TAB 1: COMMUTE OPTIMIZER */}
          {/* ========================================================= */}
          {activeTab === "commute" && (
            <div className="space-y-6 min-w-0 w-full">
              
              {/* Hero Title & Description */}
              <div className="space-y-2 min-w-0">
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[0.95] text-white break-words">
                  MULTI-APP RIDE-HAILING & FARE RADAR
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-white/90 max-w-2xl leading-relaxed font-medium">
                  Never blindly book surging ride-hailings. Compare <strong>GrabCar, Bolt, inDrive, and Kumpool</strong> side-by-side in real-time to find the lowest fare before you book!
                </p>
                <div className="text-[11px] font-bold text-white/80 bg-black/40 border border-white/20 px-3 py-1.5 rounded-xl inline-block max-w-full">
                  ⚠️ <strong>Note:</strong> Prices, fares, and travel times are estimates and may not be the same as live in-app pricing (Grab, Bolt, inDrive, Kumpool, RapidKL) due to dynamic surge, weather, traffic, and platform updates. AI can make mistakes.
                </div>
              </div>

              {/* Neo-brutalist Input Form */}
              <div className="bg-black p-4 sm:p-6 lg:p-7 rounded-3xl border-4 border-black brutal-shadow-lg space-y-5 min-w-0 w-full">
                
                {/* Header with Google Maps Menu Quick Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-white/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#4285F4] animate-pulse shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Multi-App Route & Station Selector
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCommuteMapsRole("general");
                      setIsCommuteMapsModalOpen(true);
                    }}
                    className="self-start sm:self-center bg-[#4285F4] hover:bg-[#3367d6] text-white border-2 border-white/60 hover:border-white font-black text-xs uppercase px-3 py-1.5 rounded-xl brutal-shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>🗺️ Open Google Maps Transit Menu</span>
                  </button>
                </div>

                {/* Origin, Swap Button, and Destination Fields */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                  
                  {/* Origin Station */}
                  <div className="min-w-0 w-full">
                    <GoogleMapsStationInput
                      id="commute-input-from"
                      label="Origin (Home / Departure)"
                      value={transitFrom}
                      onChange={setTransitFrom}
                      role="departure"
                      placeholder="e.g. KJ14 Pasar Seni, Gombak, Subang..."
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex items-center justify-center pb-1">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 hover:bg-[#fed618] text-white hover:text-black border-2 border-white/40 hover:border-black rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90"
                      title="Swap Departure and Destination"
                    >
                      <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>

                  {/* Destination Station */}
                  <div className="min-w-0 w-full">
                    <GoogleMapsStationInput
                      id="commute-input-to"
                      label="Destination (Campus / Station)"
                      value={transitTo}
                      onChange={setTransitTo}
                      role="destination"
                      placeholder="e.g. KJ19 Universiti, SunMed, UKM..."
                    />
                  </div>

                </div>

                {/* Popular Student Commute Preset Shortcuts */}
                <div className="pt-2 border-t border-white/20 space-y-2 min-w-0 w-full">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-[#fed618] flex-wrap gap-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      Popular Student Commutes (One-Click Multi-App Compare):
                    </span>
                    <span className="text-white/60 text-[10px]">RapidKL & Greater KL</span>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 w-full min-w-0 scrollbar-thin">
                    {POPULAR_COMMUTE_PAIRS.map((pair) => {
                      const isMatch = transitFrom === pair.from && transitTo === pair.to;
                      return (
                        <button
                          key={pair.id}
                          type="button"
                          onClick={() => {
                            setTransitFrom(pair.from);
                            setTransitTo(pair.to);
                            fetchTransitEstimate(pair.from, pair.to);
                          }}
                          className={`px-3 py-2 rounded-2xl border-2 transition-all shrink-0 text-left cursor-pointer ${
                            isMatch
                              ? "bg-[#fed618] text-black border-black brutal-shadow-xs scale-[1.02]"
                              : "bg-white/10 hover:bg-white text-white hover:text-black border-white/30 hover:border-black"
                          }`}
                        >
                          <div className="text-[10px] font-black tracking-wider uppercase opacity-90">
                            {pair.badge}
                          </div>
                          <div className="text-xs font-bold whitespace-nowrap">
                            {pair.title}
                          </div>
                          <div className="text-[9px] font-black text-emerald-400 mt-0.5">
                            ⚡ {pair.savings}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  id="btn-calculate-transit"
                  onClick={() => fetchTransitEstimate(transitFrom, transitTo)}
                  disabled={loadingAI || !transitFrom.trim() || !transitTo.trim()}
                  className="w-full bg-[#fed618] hover:bg-[#fde047] disabled:opacity-50 text-black font-black py-3.5 sm:py-4 px-6 rounded-2xl border-4 border-black brutal-shadow brutal-btn text-sm sm:text-base uppercase flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  {loadingAI ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin text-black" />
                      Comparing Public Transit, Grab, Bolt, inDrive & Kumpool...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Compare All Transport Apps & Public Transit →
                    </>
                  )}
                </button>
              </div>

              {/* Commute Google Maps Modal */}
              <GoogleMapsStationMenuModal
                isOpen={isCommuteMapsModalOpen}
                onClose={() => setIsCommuteMapsModalOpen(false)}
                onSelectStation={(st) => {
                  if (commuteMapsRole === "departure") {
                    setTransitFrom(st);
                  } else if (commuteMapsRole === "destination") {
                    setTransitTo(st);
                  } else {
                    if (!transitFrom) setTransitFrom(st);
                    else setTransitTo(st);
                  }
                }}
                onSelectBoth={(fromSt, toSt) => {
                  setTransitFrom(fromSt);
                  setTransitTo(toSt);
                  fetchTransitEstimate(fromSt, toSt);
                }}
                currentSelected={commuteMapsRole === "departure" ? transitFrom : transitTo}
                selectionTitle="Choose Station from Google Maps Menu"
                role={commuteMapsRole}
              />

              {/* Transit Results Multi-App Comparison */}
              {transitResponse ? (
                <div className="space-y-4">
                  
                  {/* Trip Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-black/40 p-3 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-widest text-[#fed618]">
                        📍 {transitResponse.journeyName || `${transitFrom} → ${transitTo}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-1 rounded-full border border-emerald-500/40">
                        ⚡ LIVE MULTI-APP FARES
                      </span>
                    </div>
                  </div>

                  {/* 1. HIGHLIGHT: PUBLIC TRANSPORT SECTION (RAIL + BUS) */}
                  <div className="bg-[#181338] p-4 sm:p-5 rounded-3xl border-4 border-black text-white space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black">
                          🚆
                        </div>
                        <div>
                          <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                            <span>PUBLIC TRANSPORT (RAPIDKL RAIL & BUS)</span>
                            <span className="text-[9px] bg-emerald-400 text-black px-2 py-0.2 rounded-full font-bold">
                              RECOMMENDED FOR STUDENTS
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70">
                            {currentUser.nationality === "Malaysian" && currentUser.hasRapidKlConcession
                              ? "50% Student Concession Active • MyRapid Touch 'n Go Card"
                              : "Standard Adult Public Transit Fare"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-white/60 font-bold uppercase">Total Concession Fare</div>
                        <div className="text-2xl sm:text-3xl font-verdana font-black text-[#44f287]">
                          RM {(
                            currentUser.nationality === "Malaysian" && currentUser.hasRapidKlConcession
                              ? (transitResponse.lrtMrtOption?.concessionPriceMYR ?? (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80) * 0.5)
                              : (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80)
                          ).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown sub-grid for Public Transit */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {/* Train Component */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-emerald-400">
                          <span>RapidKL Rail</span>
                          <span>⏱ ~{transitResponse.lrtMrtOption?.durationMinutes ?? 18}m</span>
                        </div>
                        <div className="text-base font-black text-white">
                          RM {(
                            currentUser.nationality === "Malaysian" && currentUser.hasRapidKlConcession
                              ? (transitResponse.lrtMrtOption?.concessionPriceMYR ?? (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80) * 0.5)
                              : (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80)
                          ).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/70">
                          {transitResponse.lrtMrtOption?.lineName || "LRT / MRT Network"}
                        </div>
                        <div className="text-[9px] text-white/50">
                          🌱 {transitResponse.lrtMrtOption?.carbonGramsCo2 ?? 120}g CO₂ footprint
                        </div>
                      </div>

                      {/* Feeder Bus Component */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10 space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-sky-400">
                          <span>Feeder / City Bus</span>
                          <span>⏱ ~{transitResponse.busOption?.durationMinutes ?? 20}m</span>
                        </div>
                        <div className="text-base font-black text-white">
                          RM {(transitResponse.busOption?.fareMYR ?? 1.00).toFixed(2)}
                        </div>
                        <div className="text-[10px] text-white/70">
                          {transitResponse.busOption?.busType || "RapidKL T-Bus / GoKL / Smart Selangor"}
                        </div>
                        <div className="text-[9px] text-emerald-300">
                          ✓ Free on GoKL & Smart Selangor routes
                        </div>
                      </div>

                      {/* Pass Savings Summary */}
                      <div className="bg-emerald-950/40 p-3 rounded-2xl border border-emerald-500/30 space-y-1 flex flex-col justify-between">
                        <div className="text-[10px] font-black uppercase text-emerald-300">
                          My50 Pass Option
                        </div>
                        <div className="text-xs font-bold text-white leading-tight">
                          Unlimited rides for RM 50/month (~RM 1.67/day)
                        </div>
                        <div className="text-[9px] text-emerald-400 font-bold">
                          Includes all LRT, MRT, Monorail & RapidKL buses.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. RIDE-HAILING & TRANSPORT APPS COMPARISON GRID */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#fed618]" />
                        <span>RIDE-HAILING & ON-DEMAND TRANSPORT APPS</span>
                      </span>
                      <span className="text-[10px] font-bold text-white/70">4 e-Hailing & Shuttle Services</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
                      
                      {/* App 1: GrabCar */}
                      <div className="bg-[#facc15] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider">GrabCar</span>
                            <span className="text-[8px] bg-black text-white font-black px-1.5 py-0.5 rounded">
                              {(transitResponse.grabOption?.surgeMultiplier ?? 1.2) > 1.1 ? "SURGE ACTIVE" : "NORMAL"}
                            </span>
                          </div>
                          <div className="text-2xl font-verdana font-black leading-none my-1.5">
                            RM {(transitResponse.grabOption?.currentSurgePriceMYR ?? 15.00).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-black/80 space-y-0.5">
                            <div>Base: RM {(transitResponse.grabOption?.basePriceMYR ?? 11.00).toFixed(2)}</div>
                            <div>⏱ ~{(transitResponse.grabOption?.durationMinutes ?? 22)} mins</div>
                          </div>
                        </div>
                        <div className="text-[9px] font-black bg-black/10 p-1 rounded text-center mt-2">
                          GrabPay / Touch 'n Go
                        </div>
                      </div>

                      {/* App 2: Bolt */}
                      <div className="bg-[#38bdf8] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider">Bolt Ride</span>
                            <span className="text-[8px] bg-sky-900 text-white font-black px-1.5 py-0.5 rounded">
                              BUDGET
                            </span>
                          </div>
                          <div className="text-2xl font-verdana font-black leading-none my-1.5">
                            RM {(transitResponse.boltOption?.currentSurgePriceMYR ?? 12.80).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-black/80 space-y-0.5">
                            <div>Base: RM {(transitResponse.boltOption?.basePriceMYR ?? 9.50).toFixed(2)}</div>
                            <div>⏱ ~{(transitResponse.boltOption?.durationMinutes ?? 20)} mins</div>
                          </div>
                        </div>
                        <div className="text-[9px] font-black bg-black/10 p-1 rounded text-center mt-2">
                          {transitResponse.boltOption?.discountNote || "Cheaper than Grab"}
                        </div>
                      </div>

                      {/* App 3: inDrive */}
                      <div className="bg-[#a78bfa] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider">inDrive</span>
                            <span className="text-[8px] bg-purple-900 text-white font-black px-1.5 py-0.5 rounded">
                              BID FARE
                            </span>
                          </div>
                          <div className="text-2xl font-verdana font-black leading-none my-1.5">
                            RM {(transitResponse.inDriveOption?.estimatedFareMYR ?? 11.00).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-black/80 space-y-0.5">
                            <div>Student Bid: ~RM 10-12</div>
                            <div>⏱ ~{(transitResponse.inDriveOption?.durationMinutes ?? 21)} mins</div>
                          </div>
                        </div>
                        <div className="text-[9px] font-black bg-black/10 p-1 rounded text-center mt-2">
                          Set your own passenger bid
                        </div>
                      </div>

                      {/* App 4: Kumpool / Trek DRT Shuttle */}
                      <div className="bg-[#4ade80] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider">Kumpool DRT</span>
                            <span className="text-[8px] bg-emerald-900 text-white font-black px-1.5 py-0.5 rounded">
                              CAMPUS SHUTTLE
                            </span>
                          </div>
                          <div className="text-2xl font-verdana font-black leading-none my-1.5">
                            RM {(transitResponse.kumpoolOption?.flatFareMYR ?? 2.00).toFixed(2)}
                          </div>
                          <div className="text-[10px] font-bold text-black/80 space-y-0.5">
                            <div>Flat Zone Fare</div>
                            <div>⏱ ~{(transitResponse.kumpoolOption?.durationMinutes ?? 20)} mins</div>
                          </div>
                        </div>
                        <div className="text-[9px] font-black bg-black/10 p-1 rounded text-center mt-2">
                          On-demand shared student van
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* 3. SAVINGS ANALYSIS & AI VERDICT BOX */}
                  <div className="bg-white text-black p-5 rounded-2xl border-4 border-black brutal-shadow space-y-3">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                          <span>UNIMATE MULTI-APP TRANSIT RECOMMENDATION</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed">
                          {transitResponse.costEfficiencyVerdict || "Taking public rail with 50% student concession saves you significant budget compared to Grab and Bolt, while avoiding rush-hour traffic jams."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-400 px-2 py-0.5 rounded-md text-[11px] font-black">
                          🏆 Best Value: RapidKL LRT (RM {(
                            currentUser.nationality === "Malaysian" && currentUser.hasRapidKlConcession
                              ? (transitResponse.lrtMrtOption?.concessionPriceMYR ?? 1.40)
                              : (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80)
                          ).toFixed(2)})
                        </span>
                        <span className="bg-sky-100 text-sky-800 border border-sky-400 px-2 py-0.5 rounded-md text-[11px] font-black">
                          🚗 Best e-Hailing: Bolt (RM {(transitResponse.boltOption?.currentSurgePriceMYR ?? 12.80).toFixed(2)})
                        </span>
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        Save ~RM {(
                          (transitResponse.grabOption?.currentSurgePriceMYR ?? 15.00) -
                          (currentUser.nationality === "Malaysian" && currentUser.hasRapidKlConcession
                            ? (transitResponse.lrtMrtOption?.concessionPriceMYR ?? 1.40)
                            : (transitResponse.lrtMrtOption?.basePriceMYR ?? 2.80))
                        ).toFixed(2)} vs Grab on this trip
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-black/30 border-3 border-dashed border-white/30 p-8 rounded-3xl text-center space-y-2">
                  <Compass className="w-8 h-8 text-[#fed618] mx-auto" />
                  <h3 className="text-sm font-black uppercase text-white">No route compared yet</h3>
                  <p className="text-xs text-white/70 max-w-md mx-auto">
                    Enter your departure station above and click "Compare All Transport Apps & Public Transit" to see live RapidKL LRT/MRT/Bus fares vs Grab, Bolt, inDrive, and Kumpool rates.
                  </p>
                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: FOOD & NUTRITION (CHEAP MEAL FINDER + MULTI-MEAL TRACKER + NUTRITION ADVISOR) */}
          {/* ========================================================= */}
          {activeTab === "food" && (
            <div className="space-y-6">
              
              {/* Header with Sub-tab Switcher */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-white/20 pb-4">
                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-[0.95] text-white">
                    CAMPUS FOOD & NUTRITION GUIDE
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed font-medium">
                    Discover budget-friendly meals around your campus (RM3–RM8), track your full daily nutrition, and get personalized student dietary advice.
                  </p>
                  <div className="text-[11px] font-bold text-white/80 bg-black/40 border border-white/20 px-3 py-1 rounded-xl inline-block mt-0.5">
                    ⚠️ <strong>Note:</strong> Food prices and nutritional values are estimates and may not be the same as in-app or actual on-campus vendor prices. AI can make mistakes.
                  </div>
                </div>

                {/* Sub-Tab Switcher Pills */}
                <div className="flex flex-wrap items-center gap-2 bg-black/40 p-1.5 rounded-2xl border-2 border-black shrink-0">
                  <button
                    id="subtab-cheap-meals"
                    onClick={() => setFoodSubTab("cheap_meals")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all brutal-btn cursor-pointer flex items-center gap-1.5 ${
                      foodSubTab === "cheap_meals"
                        ? "bg-[#fed618] text-black brutal-shadow -translate-y-0.5"
                        : "text-white hover:text-[#fed618]"
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Cheap Meal Finder</span>
                  </button>

                  <button
                    id="subtab-nutrition-tracker"
                    onClick={() => setFoodSubTab("nutrition_tracker")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all brutal-btn cursor-pointer flex items-center gap-1.5 ${
                      foodSubTab === "nutrition_tracker"
                        ? "bg-[#4ade80] text-black brutal-shadow -translate-y-0.5"
                        : "text-white hover:text-[#4ade80]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Daily Nutrition Guide</span>
                    <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded-full font-mono">
                      {loggedMeals.length}
                    </span>
                  </button>

                  <button
                    id="subtab-nutrition-advisor"
                    onClick={() => setFoodSubTab("nutrition_advisor")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition-all brutal-btn cursor-pointer flex items-center gap-1.5 ${
                      foodSubTab === "nutrition_advisor"
                        ? "bg-[#38bdf8] text-black brutal-shadow -translate-y-0.5"
                        : "text-white hover:text-[#38bdf8]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Nutrition Advice</span>
                  </button>
                </div>
              </div>

              {/* VIEW 1: CHEAP MEAL FINDER */}
              {foodSubTab === "cheap_meals" && (
                <div className="space-y-4">
                  <CheapMealFinder
                    userUniversity={currentUser.university}
                    onSelectMealForNutrition={(meal) => {
                      setFoodSubTab("nutrition_tracker");
                      handleAnalyzeAndLogMeal(
                        meal.description,
                        "Lunch",
                        parseFloat(meal.priceMYR.replace(/[^0-9.]/g, "")),
                        {
                          name: meal.name,
                          description: meal.description,
                          calories: meal.calories,
                          protein: meal.protein,
                          carbs: meal.carbs,
                          fat: meal.fat,
                          sodium: meal.sodium,
                          compositionBreakdown: meal.composition
                        }
                      );
                    }}
                  />
                </div>
              )}

              {/* VIEW 3: SMART NUTRITION ADVISOR */}
              {foodSubTab === "nutrition_advisor" && (
                <div className="space-y-4">
                  <NutritionAdvisorSection
                    userUniversity={currentUser.university}
                    dailyFoodBudget={currentUser.dailyFoodBudget || 20}
                    totalDailyCalories={totalDailyCalories}
                    totalDailyProtein={totalDailyProtein}
                    onSelectMealForNutrition={(meal) => {
                      setFoodSubTab("nutrition_tracker");
                      handleAnalyzeAndLogMeal(
                        meal.description,
                        "Lunch",
                        6.50,
                        meal
                      );
                    }}
                  />
                </div>
              )}

              {/* VIEW 2: DAILY MULTI-MEAL NUTRITION GUIDE & TRACKER */}
              {foodSubTab === "nutrition_tracker" && (
                <div className="space-y-6">

                  {/* Toast notification */}
                  {mealSuccessToast && (
                    <div className="bg-[#4ade80] border-4 border-black text-black p-4 rounded-2xl brutal-shadow text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-5 h-5 shrink-0 text-black" />
                        <span>{mealSuccessToast}</span>
                      </div>
                      <button
                        onClick={() => setMealSuccessToast(null)}
                        className="text-black font-black hover:opacity-70 text-xs px-2 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Daily Cumulative Macro Overview Card */}
                  <div className="bg-black text-white p-5 rounded-3xl border-4 border-black brutal-shadow-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/20 pb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#fed618] block">
                          Today's Cumulative Fuel & Nutrition
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                          <span>{totalDailyCalories} / {targetCalories} kcal</span>
                          <span className="text-xs font-bold bg-[#fed618] text-black px-2 py-0.5 rounded-full">
                            {caloriePercent}% Goal
                          </span>
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {loggedMeals.length > 0 && (
                          <button
                            onClick={handleClearAllMeals}
                            className="text-[10px] font-black uppercase text-white/70 hover:text-rose-400 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
                          >
                            Reset Today
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden border border-black">
                      <div
                        className="bg-[#fed618] h-full transition-all duration-500 rounded-full"
                        style={{ width: `${caloriePercent}%` }}
                      />
                    </div>

                    {/* 4 Cumulative Macro Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white/10 border-2 border-white/20 p-3 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-white/70 uppercase block">Protein</span>
                        <span className="text-lg font-black text-[#4ade80]">{totalDailyProtein}g</span>
                        <span className="text-[9px] text-white/50 block">Muscle & Brain</span>
                      </div>
                      <div className="bg-white/10 border-2 border-white/20 p-3 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-white/70 uppercase block">Carbohydrates</span>
                        <span className="text-lg font-black text-[#fed618]">{totalDailyCarbs}g</span>
                        <span className="text-[9px] text-white/50 block">Study Stamina</span>
                      </div>
                      <div className="bg-white/10 border-2 border-white/20 p-3 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-white/70 uppercase block">Healthy Fats</span>
                        <span className="text-lg font-black text-[#fb7185]">{totalDailyFat}g</span>
                        <span className="text-[9px] text-white/50 block">Satiety & Focus</span>
                      </div>
                      <div className="bg-white/10 border-2 border-white/20 p-3 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-white/70 uppercase block">Sodium</span>
                        <span className="text-lg font-black text-[#38bdf8]">{totalDailySodium}mg</span>
                        <span className="text-[9px] text-white/50 block">Hydration Balance</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Meal Input Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    
                    {/* Meal Input Form */}
                    <div className="md:col-span-6 bg-black p-5 rounded-3xl border-4 border-black brutal-shadow-lg space-y-4">
                      <div>
                        <span className="text-[10px] font-black text-[#4ade80] uppercase tracking-wider block">
                          Step 1 • Select Meal Type
                        </span>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-2">
                          {(["Breakfast", "Lunch", "Dinner", "Snack", "Late Night Study"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setMealTypeInput(type)}
                              className={`py-1.5 px-1 rounded-xl text-[10px] font-black uppercase text-center border-2 border-black transition-all cursor-pointer ${
                                mealTypeInput === type
                                  ? "bg-[#fed618] text-black brutal-shadow scale-[1.02]"
                                  : "bg-white/10 text-white hover:bg-white/20"
                              }`}
                            >
                              {type.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Meal Description Input */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-white/80 uppercase block">
                          Step 2 • Describe Meal (Enter as many meals as you eat today!)
                        </label>
                        <textarea
                          rows={3}
                          value={mealTextInput}
                          onChange={(e) => setMealTextInput(e.target.value)}
                          className="w-full bg-white/10 border-2 border-white/30 rounded-xl p-3 text-xs text-white placeholder:text-white/40 focus:bg-white/20 focus:outline-none focus:border-[#fed618] leading-relaxed transition-all"
                          placeholder="e.g. 1 plate Nasi Lemak with boiled egg, cucumber slices, and hot Milo..."
                        />
                      </div>

                      {/* Cost & Expense Auto-sync */}
                      <div className="grid grid-cols-2 gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div>
                          <label className="text-[9px] font-bold text-white/80 uppercase block mb-1">
                            Price (RM, Optional)
                          </label>
                          <input
                            type="number"
                            step="0.10"
                            value={mealCostInput}
                            onChange={(e) => setMealCostInput(e.target.value)}
                            placeholder="e.g. 5.50"
                            className="w-full bg-white/10 border border-white/30 rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#fed618]"
                          />
                        </div>
                        <label className="flex items-center gap-2 text-[10px] text-white font-bold cursor-pointer mt-3">
                          <input
                            type="checkbox"
                            checked={logAsExpense}
                            onChange={(e) => setLogAsExpense(e.target.checked)}
                            className="rounded accent-[#fed618] w-4 h-4 cursor-pointer"
                          />
                          <span>Add to monthly expenses</span>
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        id="btn-log-meal-nutrition"
                        onClick={() => handleAnalyzeAndLogMeal()}
                        disabled={loadingAI || !mealTextInput.trim()}
                        className="w-full bg-[#fed618] hover:bg-[#fde047] disabled:opacity-50 text-black font-black py-3 px-4 rounded-xl border-3 border-black brutal-shadow brutal-btn text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {loadingAI ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Analyzing & Adding Meal...</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            <span>Add {mealTypeInput} to Nutrition Guide →</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Preset Malaysian Campus Meals */}
                    <div className="md:col-span-6 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black uppercase tracking-wider text-[#fed618] flex items-center gap-1.5">
                          <Utensils className="w-4 h-4 text-[#fed618]" />
                          QUICK CAMPUS MEAL SHORTCUTS (1-CLICK LOG)
                        </label>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {PRESET_MEALS.map((meal, idx) => (
                          <div
                            key={idx}
                            className="bg-black/40 hover:bg-black/60 border-2 border-black p-3 rounded-2xl transition-all flex items-center justify-between gap-3 text-white"
                          >
                            <div className="min-w-0">
                              <div className="font-black text-xs flex items-center gap-2">
                                <span className="truncate">{meal.name}</span>
                                <span className="text-[9px] font-mono bg-[#fed618] text-black px-1.5 py-0.2 rounded font-bold shrink-0">
                                  {meal.calories} kcal
                                </span>
                              </div>
                              <p className="text-[10px] text-white/70 line-clamp-1 mt-0.5">{meal.description}</p>
                            </div>

                            <button
                              onClick={() => {
                                handleAnalyzeAndLogMeal(
                                  meal.description,
                                  mealTypeInput,
                                  undefined,
                                  {
                                    name: meal.name,
                                    description: meal.description,
                                    calories: meal.calories,
                                    protein: meal.protein,
                                    carbs: meal.carbs,
                                    fat: meal.fat,
                                    sodium: meal.sodium
                                  }
                                );
                              }}
                              disabled={loadingAI}
                              className="bg-white hover:bg-[#fed618] text-black font-black text-[10px] uppercase px-3 py-1.5 rounded-xl border-2 border-black shrink-0 transition-all cursor-pointer brutal-btn"
                            >
                              + Log Now
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Today's Logged Meals History List */}
                  <div className="bg-white text-black p-5 rounded-3xl border-4 border-black brutal-shadow space-y-4">
                    <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Today's Logged Meals ({loggedMeals.length})</span>
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500">
                          Total: {totalDailyCalories} kcal • {totalDailyProtein}g protein • {totalDailyCarbs}g carbs • {totalDailyFat}g fats
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          const inputEl = document.querySelector("textarea");
                          inputEl?.focus();
                        }}
                        className="bg-black text-white hover:bg-slate-800 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        + Log Another Meal
                      </button>
                    </div>

                    {loggedMeals.length > 0 ? (
                      <div className="space-y-3">
                        {loggedMeals.map((m) => (
                          <div
                            key={m.id}
                            className="bg-slate-50 border-2 border-black p-4 rounded-2xl space-y-2 hover:bg-white transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border border-black uppercase ${
                                  m.mealType === "Breakfast" ? "bg-amber-200 text-amber-900" :
                                  m.mealType === "Lunch" ? "bg-emerald-200 text-emerald-900" :
                                  m.mealType === "Dinner" ? "bg-blue-200 text-blue-900" :
                                  "bg-purple-200 text-purple-900"
                                }`}>
                                  {m.mealType}
                                </span>
                                <h4 className="font-black text-sm text-black">{m.name}</h4>
                              </div>

                              <div className="flex items-center gap-3">
                                {m.costMYR !== undefined && (
                                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300">
                                    RM {m.costMYR.toFixed(2)}
                                  </span>
                                )}
                                <span className="text-sm font-verdana font-black text-black">
                                  {m.calories} kcal
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold">{m.loggedAt}</span>
                                <button
                                  onClick={() => handleDeleteLoggedMeal(m.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 transition-all cursor-pointer"
                                  title="Delete meal"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-600 font-medium">{m.description}</p>

                            {/* Macro Badges */}
                            <div className="grid grid-cols-4 gap-2 pt-1">
                              <div className="bg-emerald-50 border border-emerald-300 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] font-bold text-slate-500 block">Protein</span>
                                <span className="text-xs font-black text-emerald-800">{m.proteinGrams}g</span>
                              </div>
                              <div className="bg-amber-50 border border-amber-300 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] font-bold text-slate-500 block">Carbs</span>
                                <span className="text-xs font-black text-amber-800">{m.carbsGrams}g</span>
                              </div>
                              <div className="bg-rose-50 border border-rose-300 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] font-bold text-slate-500 block">Fats</span>
                                <span className="text-xs font-black text-rose-800">{m.fatGrams}g</span>
                              </div>
                              <div className="bg-sky-50 border border-sky-300 p-1.5 rounded-lg text-center">
                                <span className="text-[9px] font-bold text-slate-500 block">Sodium</span>
                                <span className="text-xs font-black text-sky-800">{m.sodiumMg}mg</span>
                              </div>
                            </div>

                            {m.compositionBreakdown && (
                              <div className="text-[10px] font-bold text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                                💡 {m.compositionBreakdown}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold space-y-1">
                        <Utensils className="w-6 h-6 mx-auto text-slate-300" />
                        <p>No meals logged yet today.</p>
                        <p className="text-[10px] text-slate-400">Describe what you ate above or select a campus favorite to start your daily nutrition tracker!</p>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: SAVINGS & BUDGET TRACKER */}
          {/* ========================================================= */}
          {activeTab === "savings" && (
            <div className="space-y-6">
              
              {/* Hero Title & Description */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[0.95] text-white">
                  STUDENT ALLOWANCE & EXPENSE TRACKER
                </h2>
                <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-medium">
                  Track every Ringgit you spend and build a healthy student emergency fund with automated category breakdowns.
                </p>
              </div>

              {/* Top 3 Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#4ade80] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Remaining Savings</span>
                  <div className="text-2xl sm:text-3xl font-verdana font-black">RM {remainingSavings.toFixed(2)}</div>
                  <span className="text-[10px] font-bold text-black/80">{savingsRate.toFixed(0)}% allowance remaining</span>
                </div>

                <div className="bg-[#fb7185] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Total Spent</span>
                  <div className="text-2xl sm:text-3xl font-verdana font-black">RM {totalSpent.toFixed(2)}</div>
                  <span className="text-[10px] font-bold text-black/80">{expensesList.length} expenses logged</span>
                </div>

                <div className="bg-[#38bdf8] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider">Monthly Allowance</span>
                  <div className="text-2xl sm:text-3xl font-verdana font-black">RM {monthlyIncome.toFixed(2)}</div>
                  <span className="text-[10px] font-bold text-black/80">Configurable in Account</span>
                </div>
              </div>

              {/* Add Expense & List Split */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Manual Add Form */}
                <div className="md:col-span-5 bg-black p-5 rounded-3xl border-4 border-black brutal-shadow-lg space-y-3">
                  <h3 className="text-xs font-black text-[#4ade80] uppercase tracking-wider">LOG EXPENSE MANUALLY</h3>
                  
                  <form onSubmit={handleAddManualExpense} className="space-y-3">
                    <div>
                      <label className="text-[10px] text-white/80 font-bold uppercase block mb-1">Item / Merchant Name</label>
                      <input
                        type="text"
                        value={manualTitle}
                        onChange={(e) => setManualTitle(e.target.value)}
                        placeholder="e.g. Books, Boba Tea..."
                        className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#fed618]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-white/80 font-bold uppercase block mb-1">Amount (RM)</label>
                        <input
                          type="number"
                          step="0.10"
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#fed618]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-white/80 font-bold uppercase block mb-1">Category</label>
                        <select
                          value={manualCategory}
                          onChange={(e: any) => setManualCategory(e.target.value)}
                          className="w-full bg-white/10 border border-white/30 rounded-xl px-2 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#fed618]"
                        >
                          <option value="Food" className="text-black">Food</option>
                          <option value="Commute" className="text-black">Commute</option>
                          <option value="Campus" className="text-black">Campus</option>
                          <option value="Utilities" className="text-black">Utilities</option>
                          <option value="Other" className="text-black">Other</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!manualTitle.trim() || !manualAmount}
                      className="w-full bg-[#fed618] hover:bg-[#fde047] disabled:opacity-50 text-black font-black py-2.5 px-3 rounded-xl border-3 border-black brutal-shadow brutal-btn text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Expense</span>
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="md:col-span-7 bg-white text-black p-5 rounded-3xl border-4 border-black brutal-shadow space-y-3">
                  <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                    <h3 className="text-xs font-black text-black uppercase tracking-wider">
                      MONTHLY LOGGED EXPENSES ({expensesList.length})
                    </h3>
                    <span className="text-xs font-black text-black">
                      Total: RM {totalSpent.toFixed(2)}
                    </span>
                  </div>

                  {expensesList.length > 0 ? (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {expensesList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2.5 rounded-xl border-2 border-black bg-slate-50 hover:bg-white transition-all text-xs"
                        >
                          <div>
                            <div className="font-black text-black flex items-center gap-1.5">
                              <span>{item.title}</span>
                              <span className="text-[8px] px-1 py-0.5 rounded bg-black text-white font-bold">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold">{item.date} • {item.source}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-sm">-RM {item.amount.toFixed(2)}</span>
                            <button
                              onClick={() => handleDeleteExpense(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs font-bold">
                      No expenses logged yet. Add your first transaction above or log a meal with expense auto-sync!
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* Bottom Nav Bar for Mobile / Small Screens (Static Layout with specified width and padding) */}
          <nav
            id="mobile-bottom-nav"
            style={{ width: "300px", paddingTop: "18px" }}
            className="flex lg:hidden items-center justify-between gap-1 border-t-2 border-white/20 max-w-full mx-auto shrink-0"
          >
            <button
              id="mobile-tab-home"
              onClick={() => { setActiveTab("home"); setAiError(null); }}
              className={`flex-1 py-2 px-1 rounded-xl text-center border-2 border-black text-[10px] font-black uppercase brutal-btn cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === "home" ? "bg-white text-black brutal-shadow scale-[1.02]" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-current" />
              <span className="truncate">Home</span>
            </button>
            <button
              id="mobile-tab-commute"
              onClick={() => { setActiveTab("commute"); setAiError(null); }}
              className={`flex-1 py-2 px-1 rounded-xl text-center border-2 border-black text-[10px] font-black uppercase brutal-btn cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === "commute" ? "bg-white text-black brutal-shadow scale-[1.02]" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <Navigation className="w-4 h-4 shrink-0 text-current" />
              <span className="truncate">Commute</span>
            </button>
            <button
              id="mobile-tab-food"
              onClick={() => { setActiveTab("food"); setAiError(null); }}
              className={`flex-1 py-2 px-1 rounded-xl text-center border-2 border-black text-[10px] font-black uppercase brutal-btn cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === "food" ? "bg-white text-black brutal-shadow scale-[1.02]" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <Utensils className="w-4 h-4 shrink-0 text-current" />
              <span className="truncate">Food</span>
            </button>
            <button
              id="mobile-tab-savings"
              onClick={() => { setActiveTab("savings"); setAiError(null); }}
              className={`flex-1 py-2 px-1 rounded-xl text-center border-2 border-black text-[10px] font-black uppercase brutal-btn cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === "savings" ? "bg-white text-black brutal-shadow scale-[1.02]" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <PiggyBank className="w-4 h-4 shrink-0 text-current" />
              <span className="truncate">Savings</span>
            </button>
            <button
              id="mobile-tab-account"
              onClick={() => { setActiveTab("account"); setAiError(null); }}
              className={`flex-1 py-2 px-1 rounded-xl text-center border-2 border-black text-[10px] font-black uppercase brutal-btn cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                activeTab === "account" ? "bg-white text-black brutal-shadow scale-[1.02]" : "bg-black/20 text-white hover:bg-black/30"
              }`}
            >
              <User className="w-4 h-4 shrink-0 text-current" />
              <span className="truncate">Account</span>
            </button>
          </nav>

          {/* Decorative Dashed Circle SVG */}
          <svg className="absolute bottom-4 right-4 w-28 h-28 opacity-15 pointer-events-none" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" strokeDasharray="20 10" />
          </svg>

        </main>

      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLoginUser}
        initialMode={authModalMode}
      />

    </div>
  );
}
