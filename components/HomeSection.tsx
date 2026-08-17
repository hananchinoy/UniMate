import React from "react";
import {
  Navigation,
  Utensils,
  Receipt,
  PiggyBank,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Clock,
  Compass,
  Lightbulb,
  Building2,
  Users
} from "lucide-react";
import { UserProfile, ExpenseItem, ActiveTab } from "../types";
import { CAMPUS_HACKS } from "../data";
import { BuddySmileyIcon } from "./BuddySmileyIcon";

interface HomeSectionProps {
  user: UserProfile;
  totalSpent: number;
  remainingSavings: number;
  savingsRate: number;
  spentRate: number;
  expensesList: ExpenseItem[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenAuth: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  user,
  totalSpent,
  remainingSavings,
  savingsRate,
  spentRate,
  expensesList,
  onNavigate,
  onOpenAuth
}) => {
  return (
    <div className="space-y-6">
      
      {/* 1. Hero Welcome Card */}
      <div className="bg-[#fed618] text-black border-4 border-black p-5 sm:p-7 rounded-3xl brutal-shadow relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase bg-black text-white px-2.5 py-0.5 rounded-full tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-[#fed618]" />
                {user.university}
              </span>
              {user.hasRapidKlConcession && (
                <span className="text-[10px] font-black uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  50% Concession Active
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-verdana font-black text-black leading-tight">
              Welcome, {user.name.split(" ")[0]} 👋
            </h2>
            <p className="text-xs font-bold text-black/80 max-w-xl">
              Your personalized university companion. Compare public transport (RapidKL LRT/MRT/Bus 50% concession) with Grab, Bolt, and other transport apps in real-time, scan eWallet receipts, and master your student budget.
            </p>
          </div>

          <button
            id="btn-home-get-started"
            onClick={() => onNavigate("commute")}
            className="self-start sm:self-center bg-white hover:bg-neutral-100 text-black border-3 border-black font-black text-xs uppercase px-5 py-2.5 rounded-2xl brutal-shadow brutal-btn flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Compare Fares</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Friendly buddy + smiley background watermark emblem */}
        <BuddySmileyIcon className="absolute -bottom-6 -right-6 w-36 h-36 text-black/10 pointer-events-none" />
      </div>

      {/* 2. Key Metrics Pulse Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        
        {/* Net Savings */}
        <div className="bg-[#4ade80] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
          <span className="text-[10px] font-black uppercase flex items-center gap-1 text-black/80">
            <PiggyBank className="w-3.5 h-3.5" />
            Net Savings
          </span>
          <div className="text-2xl font-verdana font-black">
            RM {remainingSavings.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-black/80">{savingsRate.toFixed(0)}% of allowance left</div>
        </div>

        {/* Monthly Spent */}
        <div className="bg-[#fb7185] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
          <span className="text-[10px] font-black uppercase flex items-center gap-1 text-black/80">
            <TrendingDown className="w-3.5 h-3.5" />
            Total Spent
          </span>
          <div className="text-2xl font-verdana font-black">
            RM {totalSpent.toFixed(2)}
          </div>
          <div className="text-[10px] font-bold text-black/80">{expensesList.length} expenses logged</div>
        </div>

        {/* Commute Route */}
        <div className="bg-[#38bdf8] text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
          <span className="text-[10px] font-black uppercase flex items-center gap-1 text-black/80">
            <Navigation className="w-3.5 h-3.5" />
            Ride Fare Radar
          </span>
          <div className="text-xs font-verdana font-black truncate">
            Grab vs Bolt vs inDrive
          </div>
          <div className="text-[10px] font-bold text-black/80">Saves RM3–RM8/ride vs surge</div>
        </div>

        {/* Food Target */}
        <div className="bg-white text-black p-4 rounded-2xl border-4 border-black brutal-shadow space-y-1">
          <span className="text-[10px] font-black uppercase flex items-center gap-1 text-slate-600">
            <Utensils className="w-3.5 h-3.5" />
            Daily Meal Budget
          </span>
          <div className="text-2xl font-verdana font-black">
            RM {user.dailyFoodBudget || 20}.00
          </div>
          <div className="text-[10px] font-bold text-slate-500">Mamak & Cafeteria Target</div>
        </div>

      </div>

      {/* 3. 3 Core Feature Cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#fed618]" />
            STUDENT TOOLS & SHORTCUTS
          </h3>
          <span className="text-[10px] font-bold text-white/70">Click any card to jump in</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Commute Fare Engine */}
          <div
            onClick={() => onNavigate("commute")}
            className="bg-[#38bdf8] hover:bg-[#7dd3fc] text-black p-5 rounded-3xl border-4 border-black brutal-shadow cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center border-2 border-black">
                <Navigation className="w-6 h-6 text-[#38bdf8]" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded-lg">
                  RIDE-HAILING & TRANSIT
                </span>
                <span className="text-[10px] font-black uppercase bg-[#4285F4] text-white px-2 py-0.5 rounded-lg border border-black">
                  🗺️ Maps Menu
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-verdana font-black text-black">
                Ride-Hailing & Transit Comparator
              </h4>
              <p className="text-xs font-bold text-black/80">
                Compare Grab vs Bolt vs inDrive vs Kumpool and RapidKL transit from any pickup to any destination.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-black/10 text-xs font-black">
              <span>Compare Any Location & Fares</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Food Nutrition & Macros */}
          <div
            onClick={() => onNavigate("food")}
            className="bg-[#fb7185] hover:bg-[#fda4af] text-black p-5 rounded-3xl border-4 border-black brutal-shadow cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center border-2 border-black">
                <Utensils className="w-6 h-6 text-[#fb7185]" />
              </div>
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded-lg">
                RM3-RM8 EATS & NUTRITION
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-verdana font-black text-black">
                Campus Cheap Meals & Nutrition Guide
              </h4>
              <p className="text-xs font-bold text-black/80">
                Discover cheap meals under RM8 near your campus, log daily meals (Breakfast, Lunch, Dinner, Snacks), and track macros with AI.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-black/10 text-xs font-black">
              <span>Find Cheap Meals & Log Nutrition</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Monthly Allowance Budget */}
          <div
            onClick={() => onNavigate("savings")}
            className="bg-[#4ade80] hover:bg-[#86efac] text-black p-5 rounded-3xl border-4 border-black brutal-shadow cursor-pointer transition-all hover:-translate-y-1 flex flex-col justify-between space-y-4 group"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center border-2 border-black">
                <PiggyBank className="w-6 h-6 text-[#4ade80]" />
              </div>
              <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 rounded-lg">
                ALLOWANCE TRACKER
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-verdana font-black text-black">
                Monthly Allowance & Savings
              </h4>
              <p className="text-xs font-bold text-black/80">
                Set allowance targets, log spending categories, and track monthly surplus to avoid end-of-month broke days.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t-2 border-black/10 text-xs font-black">
              <span>View Full Balance & Logs</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Campus Hacks & Money-Saving Perks */}
      <div className="bg-black text-white p-5 rounded-3xl border-4 border-black brutal-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-[#fed618]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#fed618]">
              KL & SELANGOR CAMPUS SAVINGS HACKS
            </h3>
          </div>
          <span className="text-[10px] font-bold text-white/70 hidden sm:inline">Updated for 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAMPUS_HACKS.map((hack) => (
            <div
              key={hack.id}
              className="p-3.5 rounded-2xl border-2 border-white/30 bg-white/5 space-y-1"
            >
              <span
                style={{ backgroundColor: hack.color }}
                className="text-[9px] font-black text-black px-2 py-0.5 rounded uppercase tracking-wider inline-block"
              >
                {hack.tag}
              </span>
              <h5 className="text-xs font-black text-white mt-1">
                {hack.title}
              </h5>
              <p className="text-[11px] font-bold text-white/80 leading-relaxed">
                {hack.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
