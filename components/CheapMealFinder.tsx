import React, { useState, useMemo } from "react";
import {
  Utensils,
  Search,
  MapPin,
  Clock,
  Plus,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Sparkles,
  Info
} from "lucide-react";
import { CHEAP_CAMPUS_MEALS, CheapMealSpot } from "../cheapMealsData";

interface CheapMealFinderProps {
  userUniversity?: string;
  onSelectMealForNutrition: (meal: {
    name: string;
    description: string;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sodium?: number;
  }) => void;
}

export const CheapMealFinder: React.FC<CheapMealFinderProps> = ({
  userUniversity = "Universiti Malaya (UM)",
  onSelectMealForNutrition
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCampus, setSelectedCampus] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<"all" | "under5" | "under8" | "under10">("all");
  const [selectedDiet, setSelectedDiet] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Highly Accurate Multi-Token Search & Filter Logic
  const filteredMeals = useMemo(() => {
    const tokens = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return CHEAP_CAMPUS_MEALS.filter((meal) => {
      // 1. Campus Filter
      if (selectedCampus !== "all") {
        if (selectedCampus === "sunway") {
          if (meal.campusId !== "sunway" && meal.campusId !== "monash" && meal.campusId !== "all") {
            return false;
          }
        } else if (selectedCampus === "taylors") {
          if (meal.campusId !== "taylors" && meal.campusId !== "sunway" && meal.campusId !== "all") {
            return false;
          }
        } else {
          if (meal.campusId !== selectedCampus && meal.campusId !== "all") {
            return false;
          }
        }
      }

      // 2. Budget Price Range Filter
      if (selectedBudget === "under5" && meal.priceMYR > 5.0) return false;
      if (selectedBudget === "under8" && meal.priceMYR > 8.0) return false;
      if (selectedBudget === "under10" && meal.priceMYR > 10.0) return false;

      // 3. Dietary Filter
      if (selectedDiet !== "all" && meal.diet !== selectedDiet) {
        return false;
      }

      // 4. Category Filter
      if (selectedCategory !== "all" && meal.category !== selectedCategory) {
        return false;
      }

      // 5. Accurate Search Query (all words in search query must match anywhere in meal attributes)
      if (tokens.length > 0) {
        const searchableText = `
          ${meal.name}
          ${meal.spotName}
          ${meal.campusArea}
          ${meal.category}
          ${meal.studentHack}
          ${meal.diet}
          ${meal.distanceToStation}
          ${meal.priceMYR}
          ${meal.estimatedKcal}
          ${meal.proteinGrams}
        `.toLowerCase();

        const allTokensMatch = tokens.every((token) => searchableText.includes(token));
        if (!allTokensMatch) return false;
      }

      return true;
    });
  }, [searchQuery, selectedCampus, selectedBudget, selectedDiet, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className="bg-[#fb7185] text-black border-4 border-black p-5 sm:p-7 rounded-3xl brutal-shadow relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-black text-[#fb7185] px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider">
              <Utensils className="w-3.5 h-3.5" />
              <span>Campus Cheap Meal Finder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-verdana font-black text-black leading-tight uppercase">
              Eat Wholesome Meals for RM 3 – RM 8
            </h2>
            <p className="text-xs sm:text-sm font-bold text-black/80 max-w-xl leading-relaxed">
              Curated student meals across Malaysian university campuses. Discover high-protein Nasi Campur hacks, budget Mamak orders, and healthy vegetarian stalls under RM8 with full macro stats.
            </p>
            <div className="text-[11px] font-bold text-black/85 bg-white/40 border border-black/30 px-2.5 py-1 rounded-xl inline-block mt-1">
              ⚠️ <strong>Note:</strong> Food prices and nutritional values are estimates and may not be the same as in-app or actual on-campus vendor prices. AI can make mistakes.
            </div>
          </div>

          <div className="bg-black/20 p-3.5 rounded-2xl border-2 border-black space-y-1 shrink-0 self-start sm:self-center text-center">
            <div className="text-2xl sm:text-3xl font-verdana font-black text-black leading-none">
              RM 6.50
            </div>
            <span className="text-[10px] font-black uppercase text-black/90 block">
              Average Student Meal Cost
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Bar */}
      <div className="bg-[#121028] text-white p-4 sm:p-5 rounded-3xl border-4 border-black brutal-shadow space-y-3.5">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-4 h-4 text-white/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by dish name, stall, campus area, or keywords (e.g. Nasi Campur, Ban Mian, Chapati, SS15, UM, High Protein)..."
            className="w-full bg-white/10 text-white font-medium text-xs sm:text-sm pl-10 pr-16 py-3 rounded-2xl border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white text-xs font-bold bg-white/10 px-2 py-1 rounded-lg cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills Grid */}
        <div className="space-y-2.5 pt-1">
          {/* Budget Price Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#fed618] tracking-wider mr-1">
              Budget:
            </span>
            {[
              { id: "all", label: "All Prices" },
              { id: "under5", label: "🔥 Ultra Budget (< RM5)" },
              { id: "under8", label: "✨ Student Saver (RM5 - RM8)" },
              { id: "under10", label: "🍱 Full Set (< RM10)" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedBudget(btn.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-black uppercase transition-all cursor-pointer border ${
                  selectedBudget === btn.id
                    ? "bg-[#fed618] text-black border-black brutal-shadow-sm scale-102"
                    : "bg-white/5 text-white/80 border-white/15 hover:bg-white/15"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Campus Location Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#38bdf8] tracking-wider mr-1 flex items-center gap-0.5">
              <MapPin className="w-3 h-3" /> Campus:
            </span>
            {[
              { id: "all", label: "All Campuses" },
              { id: "um", label: "Universiti Malaya (UM)" },
              { id: "sunway", label: "Sunway / Monash" },
              { id: "apu", label: "APU (Bukit Jalil)" },
              { id: "ukm", label: "UKM Bangi" },
              { id: "uitm", label: "UiTM Shah Alam" },
              { id: "taylors", label: "Taylor's / SS15" },
              { id: "tarumt", label: "TAR UMT Setapak" },
              { id: "utar", label: "UTAR Sg Long" },
              { id: "upm", label: "UPM Serdang" },
              { id: "mmu", label: "MMU Cyberjaya" }
            ].map((camp) => (
              <button
                key={camp.id}
                onClick={() => setSelectedCampus(camp.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  selectedCampus === camp.id
                    ? "bg-[#38bdf8] text-black border-black font-black scale-102 shadow-sm"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                }`}
              >
                {camp.label}
              </button>
            ))}
          </div>

          {/* Dietary Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#4ade80] tracking-wider mr-1">
              Diet:
            </span>
            {[
              { id: "all", label: "All Diets" },
              { id: "Halal", label: "🟢 Halal" },
              { id: "Vegetarian", label: "🌱 Vegetarian" },
              { id: "Muslim-Friendly", label: "🤝 Muslim-Friendly" },
              { id: "Non-Halal", label: "🥢 Non-Halal / Chinese" }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiet(d.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  selectedDiet === d.id
                    ? "bg-[#4ade80] text-black border-black font-black scale-102 shadow-sm"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Food Category Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase text-[#f472b6] tracking-wider mr-1">
              Category:
            </span>
            {[
              { id: "all", label: "All Categories" },
              { id: "Economy Rice & Nasi Campur", label: "🍛 Economy Rice" },
              { id: "Nasi Lemak & Ayam", label: "🍗 Nasi Lemak / Ayam" },
              { id: "Noodles & Soup", label: "🍜 Noodles & Soup" },
              { id: "Mamak & Roti", label: "🫓 Mamak & Roti" },
              { id: "Vegetarian & Healthy", label: "🥗 Vegetarian" },
              { id: "Western & Budget Sets", label: "🍝 Western Sets" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  selectedCategory === cat.id
                    ? "bg-[#f472b6] text-black border-black font-black scale-102 shadow-sm"
                    : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Filtered Meals Cards Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-white">
              Campus Budget Stalls & Orders ({filteredMeals.length} spots found)
            </h3>
          </div>
          <span className="text-[11px] font-bold text-neutral-300">
            Click "Analyze & Log" to record meal in your nutrition guide
          </span>
        </div>

        {filteredMeals.length === 0 ? (
          <div className="bg-black/30 border-2 border-dashed border-white/20 p-8 rounded-3xl text-center space-y-3">
            <Utensils className="w-8 h-8 text-neutral-500 mx-auto" />
            <h4 className="text-sm font-black text-white uppercase">No meals match your search criteria</h4>
            <p className="text-xs text-neutral-300 max-w-md mx-auto">
              We couldn't find any meal spots matching "{searchQuery}". Try clearing search keywords or resetting category and campus filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCampus("all");
                setSelectedBudget("all");
                setSelectedDiet("all");
                setSelectedCategory("all");
              }}
              className="bg-[#fed618] hover:bg-[#fde047] text-black text-xs font-black uppercase px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md active:scale-95"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMeals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white text-black rounded-3xl border-4 border-black brutal-shadow p-4 sm:p-5 flex flex-col justify-between space-y-3.5 transition-all hover:-translate-y-0.5 group"
              >
                {/* Top Details & Price */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-black ${
                        meal.diet === "Halal"
                          ? "bg-[#4ade80] text-black"
                          : meal.diet === "Vegetarian"
                          ? "bg-emerald-200 text-emerald-950"
                          : meal.diet === "Muslim-Friendly"
                          ? "bg-sky-200 text-sky-950"
                          : "bg-amber-200 text-amber-950"
                      }`}
                    >
                      {meal.diet}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-verdana font-black text-black leading-none block">
                        RM {meal.priceMYR.toFixed(2)}
                      </span>
                      <span className="text-[9px] font-bold text-neutral-500">Student Price</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-verdana font-black text-neutral-900 leading-tight">
                      {meal.name}
                    </h4>
                    <p className="text-[11px] font-bold text-neutral-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span className="truncate">{meal.spotName} • {meal.campusArea}</span>
                    </p>
                  </div>

                  {/* Student Hack Pill */}
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] font-medium text-amber-950 space-y-0.5">
                    <span className="font-black text-[10px] uppercase text-amber-900 flex items-center gap-1">
                      💡 Student Hack:
                    </span>
                    <p className="leading-snug">{meal.studentHack}</p>
                  </div>
                </div>

                {/* Macro Statistics & Action Button */}
                <div className="space-y-2.5 pt-2 border-t-2 border-neutral-100">
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="bg-neutral-100 p-1.5 rounded-lg">
                      <div className="text-xs font-black text-neutral-900">{meal.estimatedKcal}</div>
                      <div className="text-[8px] uppercase font-bold text-neutral-500">kcal</div>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                      <div className="text-xs font-black text-emerald-700">{meal.proteinGrams}g</div>
                      <div className="text-[8px] uppercase font-bold text-emerald-800">Pro</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                      <div className="text-xs font-black text-amber-700">{meal.carbsGrams}g</div>
                      <div className="text-[8px] uppercase font-bold text-amber-800">Carbs</div>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                      <div className="text-xs font-black text-rose-700">{meal.fatGrams}g</div>
                      <div className="text-[8px] uppercase font-bold text-rose-800">Fat</div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectMealForNutrition({
                        name: meal.name,
                        description: `${meal.name} from ${meal.spotName} (${meal.campusArea}). ${meal.studentHack}`,
                        calories: meal.estimatedKcal,
                        protein: meal.proteinGrams,
                        carbs: meal.carbsGrams,
                        fat: meal.fatGrams
                      });
                    }}
                    className="w-full bg-[#fed618] hover:bg-[#fde047] text-black font-black text-xs uppercase py-2.5 px-3 rounded-xl border-2 border-black brutal-shadow-sm brutal-btn flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Analyze & Log in Nutrition Guide →</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
