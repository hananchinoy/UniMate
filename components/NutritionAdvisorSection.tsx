import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Dumbbell,
  PiggyBank,
  Brain,
  Leaf,
  Scale,
  Utensils,
  Plus,
  Info,
  Droplets,
  Lightbulb,
  CheckCircle2,
  HelpCircle
} from "lucide-react";

interface NutritionAdvisorProps {
  userUniversity?: string;
  dailyFoodBudget?: number;
  totalDailyCalories?: number;
  totalDailyProtein?: number;
  onSelectMealForNutrition?: (meal: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
}

const DEFAULT_ADVICE: Record<string, any> = {
  high_protein: {
    title: "High Protein & Lean Muscle Campus Strategy",
    summary: "Target 1.4g - 1.8g protein per kg bodyweight. Prioritize Mamak boiled eggs (RM 1.50 ea), Economy Rice steamed chicken breast + tofu, or Ban Mian with double egg for clean lean mass.",
    macroFocus: { protein: "35%", carbs: "40%", fat: "25%" },
    recommendedDishes: ["Economy Mixed Rice (Chicken Breast + Tofu + Bayam)", "Chapati + Dhal with 2 Hard Boiled Eggs", "Steamed Chicken Rice (Breast portion) + Extra Cucumber"],
    studentHack: "Add 2 hard-boiled eggs from 7-Eleven or campus mamak to any carb-heavy meal to get +12g protein for RM 3.",
    hydrationTip: "Drink at least 2.5L water daily to aid protein synthesis during lecture days."
  },
  budget_saver: {
    title: "Ultra-Budget RM 12-15 Daily Nutrition",
    summary: "Breakfast: Roti Canai/Chapati + Dhal (RM 2.50). Lunch: Nasi Campur 1 egg + 2 vege (RM 4.50). Dinner: Ban Mian soup or vegetarian mixed rice (RM 5.50).",
    macroFocus: { protein: "25%", carbs: "55%", fat: "20%" },
    recommendedDishes: ["2 Chapati with Thick Dhal Curry (RM 3.50)", "Vegetarian Economy Rice (Tofu + Tempeh + Kangkung) (RM 5.00)", "Bihun Sup with Egg (RM 5.00)"],
    studentHack: "Fermented tempeh and yellow dhal lentils are the cheapest superfoods in Malaysia offering high fiber, iron, and protein.",
    hydrationTip: "Carry a 1L reusable bottle to campus water dispensers instead of buying sugary drinks."
  },
  exam_focus: {
    title: "Exam Study Stamina & Brain Power Strategy",
    summary: "Avoid high-glycemic sugar spikes (like sweet boba or sugary Milo) that cause post-lunch drowsiness. Choose complex carbs and omega-rich fats for 4+ hours of unbroken revision stamina.",
    macroFocus: { protein: "30%", carbs: "45%", fat: "25%" },
    recommendedDishes: ["Clear Soup Ban Mian with Sayur Manis & Poached Egg", "Wholemeal Chapati with Dhal & Tofu", "Economy Rice with Steamed Fish/Chicken & Stir-fried Broccoli"],
    studentHack: "Snack on a handful of roasted peanuts (kacang shandong) or bananas before study sessions for steady dopamine and potassium.",
    hydrationTip: "Sip iced green tea or lemon water to boost alertness without caffeine jitters."
  },
  low_glycemic: {
    title: "Stable Blood Sugar & Clean Digestion",
    summary: "Prioritize low GI carbohydrates like brown rice, chapati, and legumes. Always eat your greens and protein before white rice to blunt glucose spikes.",
    macroFocus: { protein: "30%", carbs: "40%", fat: "30%" },
    recommendedDishes: ["Vegetarian Mixed Rice with Tempeh & Long Beans", "Tosai with Sambar & Coconut Chutney", "Clear Chicken Soup Noodle with Egg"],
    studentHack: "Eating fiber/veggies first coats the intestine and dampens glucose spikes from rice by up to 35%.",
    hydrationTip: "Choose 'Teh O Ais Kosong' or 'Air Suam' at the campus cafeteria."
  },
  general: {
    title: "Balanced Daily Campus Fuel",
    summary: "Maintain regular meal intervals and prioritize whole foods available across university cafeterias to match your daily schedule.",
    macroFocus: { protein: "28%", carbs: "48%", fat: "24%" },
    recommendedDishes: ["Nasi Campur with 1 Lean Meat & 1 Green Vegetable", "Roti Telur with Dhal", "Soup Noodle with Greens & Egg"],
    studentHack: "Balancing one palm of protein, one fist of veggies, and one cupped hand of rice keeps you alert.",
    hydrationTip: "Drink a large glass of water first thing every morning before your first lecture."
  }
};

export const NutritionAdvisorSection: React.FC<NutritionAdvisorProps> = ({
  userUniversity = "Universiti Malaya (UM)",
  dailyFoodBudget = 20,
  totalDailyCalories = 0,
  totalDailyProtein = 0,
  onSelectMealForNutrition
}) => {
  const [selectedGoal, setSelectedGoal] = useState<
    "high_protein" | "budget_saver" | "exam_focus" | "low_glycemic" | "general"
  >("high_protein");
  const [customQuery, setCustomQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [adviceData, setAdviceData] = useState<any>(DEFAULT_ADVICE.high_protein);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>("");
  const [refreshedCount, setRefreshedCount] = useState<number>(0);

  const goalOptions = [
    {
      id: "high_protein",
      label: "High Protein & Muscle",
      icon: Dumbbell,
      badge: "Target: 80g-120g",
      desc: "For active students, gym sessions, and long-lasting lecture satiety"
    },
    {
      id: "budget_saver",
      label: "Ultra-Budget (< RM15/day)",
      icon: PiggyBank,
      badge: "Max Ringgit Efficiency",
      desc: "Maximum nutritional volume and balanced macros on tight allowance"
    },
    {
      id: "exam_focus",
      label: "Exam Stamina & Brain Power",
      icon: Brain,
      badge: "Zero Sugar Crashes",
      desc: "Steady glucose & omega energy for revision days and 3-hour exam focus"
    },
    {
      id: "low_glycemic",
      label: "Low Glycemic / Clean Digest",
      icon: Leaf,
      badge: "Fiber & Gut Health",
      desc: "Whole foods, tempeh, dhal, and unrefined grains"
    },
    {
      id: "general",
      label: "Balanced Campus Fuel",
      icon: Scale,
      badge: "Daily Equilibrium",
      desc: "Simple, realistic day-to-day cafeteria ordering tips"
    }
  ];

  const quickPrompts = [
    "Best high-protein meal under RM8 near campus",
    "Pre-exam breakfast with zero sugar crash",
    "Late-night library study snack options",
    "Clean vegetarian / vegan cafeteria plate",
    "Post-workout meal at campus mamak stall"
  ];

  const fetchAdvice = async (goal = selectedGoal, query = customQuery) => {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/nutrition-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          query,
          currentCalories: totalDailyCalories,
          currentProtein: totalDailyProtein,
          currentBudget: dailyFoodBudget,
          appName: "UniMate"
        })
      });
      const data = await response.json();
      if (data && data.result && data.result.title) {
        setAdviceData(data.result);
      } else {
        setAdviceData(DEFAULT_ADVICE[goal] || DEFAULT_ADVICE.general);
      }
    } catch (e) {
      console.warn("Error fetching nutrition advice, using robust fallback:", e);
      setAdviceData(DEFAULT_ADVICE[goal] || DEFAULT_ADVICE.general);
    } finally {
      const now = new Date();
      setLastRefreshedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setRefreshedCount((prev) => prev + 1);
      setLoading(false);
    }
  };

  // Automatically fetch on goal change or initial mount
  useEffect(() => {
    fetchAdvice(selectedGoal, customQuery);
  }, [selectedGoal]);

  const handleQuickPromptClick = (prompt: string) => {
    setCustomQuery(prompt);
    fetchAdvice(selectedGoal, prompt);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-[#4ade80] text-black border-4 border-black p-5 sm:p-7 rounded-3xl brutal-shadow relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-black text-[#4ade80] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Student Nutrition Advisor</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-verdana font-black text-black leading-tight uppercase">
              Personalized Campus Nutrition Strategy
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/80 max-w-xl leading-relaxed">
              Get targeted Malaysian student food advice tailored to your budget, academic schedule, and dietary targets.
            </p>
            <div className="text-[11px] font-bold text-black/85 bg-white/40 border border-black/30 px-2.5 py-1 rounded-xl inline-block mt-1">
              ⚠️ <strong>Note:</strong> Food prices and nutritional values are estimates and may not be the same as in-app or actual on-campus vendor prices. AI can make mistakes.
            </div>
          </div>

          <div className="bg-black/20 p-3.5 rounded-2xl border-2 border-black space-y-1 shrink-0 self-start sm:self-center text-center">
            <div className="text-xl sm:text-2xl font-verdana font-black text-black leading-none">
              RM {dailyFoodBudget} / Day
            </div>
            <span className="text-[10px] font-black uppercase text-black/90 block">
              Your Daily Target
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Goal Selection & Query Input */}
      <div className="bg-[#121028] text-white p-5 rounded-3xl border-4 border-black brutal-shadow space-y-4">
        <div>
          <label className="text-xs font-black uppercase tracking-wider text-[#fed618] block mb-2">
            Step 1 • Select Your Nutritional Focus:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-2.5">
            {goalOptions.map((opt) => {
              const IconComp = opt.icon;
              const isSelected = selectedGoal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedGoal(opt.id as any);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-white text-black border-black brutal-shadow scale-102 font-black"
                      : "bg-white/5 hover:bg-white/15 text-white/80 border-white/20"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <IconComp className={`w-4 h-4 ${isSelected ? "text-black" : "text-[#fed618]"}`} />
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                        isSelected ? "bg-black text-white" : "bg-white/20 text-white"
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-xs font-black leading-tight">{opt.label}</div>
                  </div>
                  <div className={`text-[10px] mt-2 line-clamp-2 ${isSelected ? "text-neutral-700 font-bold" : "text-neutral-400"}`}>
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Query Input & Quick Prompts */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-[#38bdf8] block">
              Step 2 • Ask Specific Question or Food Item (Optional):
            </label>
            {lastRefreshedTime && (
              <span className="text-[10px] font-bold text-white/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Updated at {lastRefreshedTime}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchAdvice(selectedGoal, customQuery);
                }
              }}
              placeholder="e.g. Best high-protein dishes under RM8 near campus, what to eat before a 3-hour exam..."
              className="flex-1 bg-white/10 text-white font-medium text-xs sm:text-sm px-4 py-3 rounded-2xl border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
            />
            <button
              onClick={() => fetchAdvice(selectedGoal, customQuery)}
              disabled={loading}
              className="bg-[#fed618] hover:bg-[#fde047] disabled:opacity-50 text-black text-xs font-black uppercase px-5 py-3 rounded-2xl border-2 border-black brutal-shadow brutal-btn cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Refreshing Advice...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-black" />
                  <span>Refresh Advice</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Clickable Suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-black uppercase text-white/50 flex items-center gap-1 mr-1">
              <HelpCircle className="w-3 h-3 text-[#fed618]" /> Quick Ask:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickPromptClick(prompt)}
                className="text-[10px] font-bold bg-white/10 hover:bg-[#fed618] hover:text-black text-white/90 border border-white/20 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Render Advice Output */}
      {adviceData && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Strategy Card */}
          <div className="bg-white text-black p-5 sm:p-6 rounded-3xl border-4 border-black brutal-shadow space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl font-verdana font-black text-black">
                  📋 {adviceData.title || "Student Nutrition Strategy"}
                </span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-xs font-black uppercase bg-[#fed618] text-black px-3 py-1 rounded-xl border border-black">
                  ⚡ Goal: {selectedGoal.replace("_", " ")}
                </span>
                {refreshedCount > 0 && (
                  <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-lg">
                    Refreshed #{refreshedCount}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm font-bold text-neutral-800 leading-relaxed">
              {adviceData.summary}
            </p>

            {/* Macro Distribution Target Bar */}
            {adviceData.macroFocus && (
              <div className="bg-neutral-50 border-2 border-neutral-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-black uppercase text-neutral-800">
                  <span>Recommended Macro Ratio Target:</span>
                  <span className="text-[11px] text-neutral-500 font-bold">Protein • Carbs • Fats</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-100 border border-emerald-300 p-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-emerald-900 block">Protein</span>
                    <span className="text-base font-black text-emerald-950">{adviceData.macroFocus.protein || "30%"}</span>
                  </div>
                  <div className="bg-amber-100 border border-amber-300 p-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-amber-900 block">Carbs</span>
                    <span className="text-base font-black text-amber-950">{adviceData.macroFocus.carbs || "45%"}</span>
                  </div>
                  <div className="bg-rose-100 border border-rose-300 p-2 rounded-xl">
                    <span className="text-[10px] font-black uppercase text-rose-900 block">Fats</span>
                    <span className="text-base font-black text-rose-950">{adviceData.macroFocus.fat || "25%"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Campus Dishes */}
            {adviceData.recommendedDishes && adviceData.recommendedDishes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  Top Recommended Campus Meals:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {adviceData.recommendedDishes.map((dish: string, index: number) => (
                    <div
                      key={index}
                      className="bg-neutral-50 border-2 border-black p-3 rounded-2xl flex flex-col justify-between space-y-2 hover:bg-amber-50/50 transition-all"
                    >
                      <div className="font-black text-xs text-neutral-900 leading-snug">
                        {dish}
                      </div>
                      {onSelectMealForNutrition && (
                        <button
                          onClick={() => {
                            onSelectMealForNutrition({
                              name: dish,
                              description: `${dish} recommended for ${selectedGoal.replace("_", " ")}`,
                              calories: 520,
                              protein: 28,
                              carbs: 60,
                              fat: 16
                            });
                          }}
                          className="w-full bg-[#fed618] hover:bg-[#fde047] text-black font-black text-[10px] uppercase py-1.5 px-2 rounded-xl border border-black transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Log in Daily Tracker</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Hack & Hydration Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-900">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Student Ordering Hack</span>
                </div>
                <p className="text-xs font-bold text-amber-950 leading-relaxed">
                  {adviceData.studentHack || "Ask for extra dhal gravy and water instead of sweetened syrups."}
                </p>
              </div>

              <div className="bg-sky-50 border-2 border-sky-300 p-3.5 rounded-2xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-sky-900">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>Cognitive Hydration Tip</span>
                </div>
                <p className="text-xs font-bold text-sky-950 leading-relaxed">
                  {adviceData.hydrationTip || "Drink 500ml water between classes to combat fatigue."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

