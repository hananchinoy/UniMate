import React, { useState } from "react";
import {
  GraduationCap,
  Sparkles,
  ShieldAlert,
  UserPlus,
  Compass,
  MapPin,
  Clock,
  Smartphone,
  Utensils,
  LogIn,
  CheckCircle2,
  ArrowDown,
  CreditCard,
  Zap,
  TrendingDown,
  ShieldCheck,
  Award,
  QrCode,
  Building2,
  Wallet
} from "lucide-react";
import { UserProfile } from "../types";
import { MALAYSIAN_UNIVERSITIES } from "../data";
import { BuddySmileyIcon } from "./BuddySmileyIcon";
import {
  checkEmailOrPhoneTaken,
  registerAccount,
  normalizePhoneNumber,
  validateEmail,
  validatePhoneNumber
} from "../accountStorage";
import {
  MalaysianCheckoutModal,
  CheckoutPlan,
  StudentRegistrationData,
  PaymentReceipt
} from "./MalaysianCheckoutModal";

interface RegistrationViewProps {
  onRegister: (user: UserProfile) => void;
  onOpenLogin?: () => void;
}


export const SUBSCRIPTION_PLANS = [
  {
    id: "weekly" as const,
    name: "Weekly Pass",
    badge: "Budget Trial",
    price: "RM 2.50",
    period: "/ week",
    subtext: "Less than the price of 1 teh tarik",
    popular: false,
    savingsText: "Save ~RM 30/mo in commute & food leaks",
    features: [
      "Full RapidKL & MRT fare comparator",
      "Interactive Google Maps station & location directory",
      "5 daily meal nutrition & cheap spot scans",
      "Standard budget & allowance tracker"
    ]
  },
  {
    id: "monthly" as const,
    name: "Monthly Student Pro",
    badge: "Most Popular",
    price: "RM 6.90",
    period: "/ month",
    subtext: "Only RM 0.23 / day — cancel anytime",
    popular: true,
    savingsText: "Save up to RM 180/mo with meal & fare tricks",
    features: [
      "Unlimited transit fare & Grab surge checks",
      "Multi-app ride-hailing & route optimizer",
      "Full Campus Cheap Meal guide (RM3-8)",
      "Real-time allowance & PTPTN burn tracker",
      "Concession card renewal alert service"
    ]
  },
  {
    id: "semester" as const,
    name: "Semester Pass (6 Mos)",
    badge: "Best Student Value",
    price: "RM 29.90",
    period: "/ semester",
    subtext: "Equivalent to RM 4.98/mo (Save 28%)",
    popular: false,
    savingsText: "Save up to RM 950 across your semester",
    features: [
      "Everything in Monthly Student Pro",
      "Multi-semester savings analytics",
      "Campus roommate & shared bills splitter",
      "Priority RapidKL concession assistance",
      "Offline transit timetable & map pins"
    ]
  },
  {
    id: "yearly" as const,
    name: "Annual Scholar Pass",
    badge: "Maximum Savings",
    price: "RM 49.90",
    period: "/ full year",
    subtext: "Only RM 4.15/mo (Save 40% vs monthly)",
    popular: false,
    savingsText: "Save over RM 2,000 in university life costs",
    features: [
      "All features for 365 uninterrupted days",
      "VIP Student Deal unlocks across KL/Selangor",
      "Unlimited AI meal calorie & macro reports",
      "Lifetime data export for resume & budgeting",
      "Free updates for all new rail line extensions"
    ]
  }
];

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onRegister, onOpenLogin }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [nationality, setNationality] = useState<"Malaysian" | "International">("Malaysian");
  const [university, setUniversity] = useState(MALAYSIAN_UNIVERSITIES[0].name);
  const [customUniversity, setCustomUniversity] = useState("");
  const [faculty, setFaculty] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("Year 1");
  const [monthlyBudget, setMonthlyBudget] = useState("850");
  const [dailyFoodBudget, setDailyFoodBudget] = useState("20");
  const [hasConcession, setHasConcession] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "semester" | "yearly">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);

  const selectedUniObj =
    MALAYSIAN_UNIVERSITIES.find((u) => u.name === university) || MALAYSIAN_UNIVERSITIES[0];

  const isOtherUniversity = university.startsWith("Other") || selectedUniObj.id === "other";

  const handleUniversityChange = (newUniName: string) => {
    setUniversity(newUniName);
  };

  const handleNationalityChange = (val: "Malaysian" | "International") => {
    setNationality(val);
    if (val === "International") {
      setHasConcession(false);
    } else {
      setHasConcession(true);
    }
  };

  const activePlanDetails = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan) || SUBSCRIPTION_PLANS[1];

  const planNumericalPrice = {
    weekly: 2.50,
    monthly: 6.90,
    semester: 29.90,
    yearly: 49.90
  }[selectedPlan] || 6.90;

  const checkoutPlanData: CheckoutPlan = {
    id: activePlanDetails.id,
    name: activePlanDetails.name,
    priceMYR: planNumericalPrice,
    period: activePlanDetails.period,
    badge: activePlanDetails.badge,
    description: activePlanDetails.savingsText
  };

  const studentRegistrationData: StudentRegistrationData = {
    name: name.trim() || "Student User",
    email: email.trim() || "student@unimate.my",
    phone: phoneNumber.trim(),
    university: isOtherUniversity ? customUniversity.trim() || "Other University" : university,
    nationality: nationality,
    hasRapidKlConcession: nationality === "Malaysian" ? hasConcession : false,
    campusStation: selectedUniObj.campusStation || "KJ19 Universiti (LRT)",
    monthlyBudget: parseFloat(monthlyBudget) || 850
  };

  const emailValidation = email ? validateEmail(email) : null;
  const phoneValidation = phoneNumber ? validatePhoneNumber(phoneNumber, nationality) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter your full name as shown on your student card.");
      return;
    }
    
    // Strict Email Validation
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      setError(emailResult.error || "Please enter a valid student or campus email address.");
      return;
    }

    // Strict Phone Number Validation
    const phoneResult = validatePhoneNumber(phoneNumber, nationality);
    if (!phoneResult.isValid) {
      setError(phoneResult.error || "Please enter a valid Malaysian mobile phone number.");
      return;
    }

    // Compulsory Password Validation
    if (!password.trim()) {
      setError("Password is compulsory. Please create an account password (minimum 6 characters).");
      return;
    }
    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Check uniqueness of Email and Phone Number across all accounts
    const { emailTaken, phoneTaken } = checkEmailOrPhoneTaken(emailResult.normalized, phoneResult.normalized);
    if (emailTaken) {
      setError(`The email address "${emailResult.normalized}" is already registered to an existing account. Please sign in or use a different email.`);
      return;
    }
    if (phoneTaken) {
      setError(`The phone number "${phoneResult.normalized}" is already registered to an existing account. Each phone number can only be used for one account.`);
      return;
    }

    // Launch Malaysian FPX / DuitNow QR Checkout Modal
    setIsCheckoutModalOpen(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    const effectiveUniversity = isOtherUniversity
      ? customUniversity.trim() || "Other University"
      : university;

    const isMalaysian = nationality === "Malaysian";
    const effectiveConcession = isMalaysian ? hasConcession : false;

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: normalizePhoneNumber(phoneNumber),
      password: password.trim(),
      studentId: studentId.trim() || `SISWA-${Math.floor(1000 + Math.random() * 9000)}`,
      nationality: nationality,
      university: effectiveUniversity,
      faculty: faculty.trim() || "General Studies",
      yearOfStudy: yearOfStudy,
      monthlyBudget: parseFloat(monthlyBudget) || 850,
      dailyFoodBudget: parseFloat(dailyFoodBudget) || 20,
      hasRapidKlConcession: effectiveConcession,
      concessionExpiry: effectiveConcession ? "Dec 2026" : "",
      homeStation: "KJ14 Pasar Seni (LRT)",
      campusStation: selectedUniObj.campusStation || "KJ19 Universiti (LRT)",
      avatarColor: isMalaysian ? "#fb7185" : "#38bdf8",
      createdAt: new Date().toISOString(),
      subscriptionPlan: selectedPlan,
      subscriptionStatus: "active",
      subscriptionRenewsAt: new Date(
        Date.now() + (selectedPlan === "yearly" ? 365 : selectedPlan === "semester" ? 180 : selectedPlan === "monthly" ? 30 : 7) * 86400000
      ).toISOString()
    };

    const regResult = registerAccount(newUser);
    if (!regResult.success) {
      setError(regResult.error || "Failed to create account.");
      return;
    }

    onRegister(regResult.user || newUser);
  };


  return (
    <div className="w-full max-w-6xl mx-auto bg-[#202044] border border-white/15 rounded-[28px] sm:rounded-[40px] shadow-2xl overflow-hidden text-white my-2 sm:my-4 scroll-smooth min-w-0">
      {/* 1. Formal App Bar / Header */}
      <header className="bg-[#202044] backdrop-blur border-b border-white/10 px-6 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#fed618] text-black flex items-center justify-center font-black shrink-0 border border-white/20 shadow-md text-base pl-0">
            <BuddySmileyIcon className="w-7 h-7 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[19px] font-verdana font-black tracking-tight text-white uppercase">
                UniMate Malaysia
              </span>
            </div>
            <p className="text-xs font-semibold text-white/70 tracking-wide uppercase">
              THE ONLY COMPANION A STUDENT REALLY NEEDS
            </p>
          </div>
        </div>

        {/* Top Actions & Sign In / Sign Up Bar */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center flex-wrap">
          {onOpenLogin && (
            <button
              type="button"
              onClick={onOpenLogin}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase px-4 py-2 rounded-xl backdrop-blur flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          <a
            href="#pricing-section"
            className="bg-[#fed618] hover:bg-[#fde047] text-black border border-amber-300 font-black text-xs uppercase px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-black" />
            <span>Join From RM 2.50</span>
          </a>
        </div>
      </header>

      {/* 2. Formal Hero Statement with High-Converting Student Copy */}
      <section className="p-6 sm:p-10 md:p-12 border-b border-white/10 space-y-6 bg-gradient-to-b from-[#181338]/80 to-[#151033]/50">
        <div className="max-w-3xl space-y-3.5">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-verdana font-black uppercase tracking-tight text-white leading-tight">
            stop worrying about grab and food. spend smarter. eat better
          </h1>

          <div>
            <div className="inline-flex items-center gap-2 bg-[#fed618]/15 text-[#fed618] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#fed618]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#fed618]" />
              <span>a platform built to simplify your uni life</span>
            </div>
          </div>

          <p className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-neutral-200 leading-relaxed">
            Master your daily commute with real-time price comparing between apps. Compare fares across ride-hailing services, discover hidden cheap campus meals under RM8, and automatically track your budget and daily nutrition goals.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5" /> Average User Saves RM 154/mo
            </span>
            <span className="bg-white/5 border border-white/15 text-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              🍛 RM3 - RM8 Campus Cheap Eats
            </span>
            <span className="bg-white/5 border border-white/15 text-neutral-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              ⚡ Multi-Ride Hailing Radar
            </span>
          </div>

          {/* Social Proof & Value Callout Bar */}
          <div className="mt-4 p-4 rounded-2xl bg-[#242121] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-300 font-medium">
              <span>Loved by students from Monash, Sunway, APU and more</span>
            </div>
            <a
              href="#pricing-section"
              className="text-[#fed618] hover:text-[#fde047] font-black uppercase text-xs flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <span>View Student Subscription Options</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Scrollable Features Showcase (Sequential scroll instead of tabs/buttons) */}
      <section className="pt-[18px] pl-6 sm:pl-10 pr-6 sm:pr-10 pb-[21px] md:p-12 border-b border-white/10 space-y-8 bg-[#202044]">
        <div className="border-b border-white/10 pt-0 pb-1 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-[25px] sm:text-3xl font-verdana font-black uppercase tracking-tight text-[#fff8f8]">
              what unimate does for you
            </h2>
          </div>
          <p className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
            <span>Scroll down to inspect all modules</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#fed618] animate-bounce" />
          </p>
        </div>

        {/* Feature 1: Commute & Rail Navigator */}
        <div className="bg-[#121028] hover:bg-[#151230] rounded-3xl border border-white/10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all duration-300 shadow-lg">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#38bdf8]/20 text-[#38bdf8] text-xs font-black px-3 py-0.5 rounded-full border border-[#38bdf8]/40 uppercase">
                Module 01
              </span>
              <span className="font-bold text-xs uppercase tracking-wide text-neutral-300">
                Ride-Hailing & Fare Intelligence
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-verdana font-black uppercase leading-tight text-white">
              ride hailing and public transport comparator
            </h3>

            <div className="space-y-1.5 pt-1 text-xs font-medium text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>Real-time ride-hailing fare comparison (Grab vs Bolt vs inDrive vs Kumpool)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#38bdf8] shrink-0" />
                <span>Instant surge pricing detector to avoid paying 1.5x–2.5x peak-hour markups</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Also includes RapidKL LRT/MRT & feeder bus benchmarks for total flexibility</span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Visual Mockup */}
          <div className="lg:col-span-6 bg-[#0e0a26] text-white p-3.5 sm:p-5 rounded-2xl border border-white/15 shadow-inner space-y-3.5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-black border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-1.5 text-[#fed618] min-w-0 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Sunway Pyramid ➔ Monash Univ</span>
              </div>
              <span className="text-[#38bdf8] bg-sky-950/80 border border-sky-500/40 px-2 py-0.5 rounded-md text-[10px] font-bold self-start sm:self-auto shrink-0">
                ⚡ Save RM 5.70
              </span>
            </div>

            {/* Red, Blue, Green Comparison Cards - Responsive & Clean Box Layout */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <div className="bg-rose-950/60 p-2 sm:p-2.5 rounded-xl border border-rose-500/40 space-y-1 min-w-0 flex flex-col justify-between">
                <div className="text-[9px] sm:text-[10px] text-rose-300 font-black uppercase leading-tight truncate">
                  Grab (1.4x)
                </div>
                <div className="text-xs sm:text-base md:text-lg font-black text-rose-400 tracking-tight leading-none">
                  RM 16.50
                </div>
                <div className="text-[9px] text-white/70 flex items-center gap-1 leading-none">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">12 mins</span>
                </div>
              </div>

              <div className="bg-sky-950/60 p-2 sm:p-2.5 rounded-xl border border-sky-500/40 space-y-1 min-w-0 flex flex-col justify-between">
                <div className="text-[9px] sm:text-[10px] text-sky-300 font-black uppercase leading-tight truncate">
                  Bolt Ride
                </div>
                <div className="text-xs sm:text-base md:text-lg font-black text-sky-300 tracking-tight leading-none">
                  RM 12.00
                </div>
                <div className="text-[9px] text-white/70 flex items-center gap-1 leading-none">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">10 mins</span>
                </div>
              </div>

              <div className="bg-emerald-950/60 p-2 sm:p-2.5 rounded-xl border border-emerald-500/40 space-y-1 min-w-0 flex flex-col justify-between">
                <div className="text-[9px] sm:text-[10px] text-emerald-300 font-black uppercase leading-tight truncate">
                  inDrive Bid
                </div>
                <div className="text-xs sm:text-base md:text-lg font-black text-[#44f287] tracking-tight leading-none">
                  RM 10.50
                </div>
                <div className="text-[9px] text-white/70 flex items-center gap-1 leading-none">
                  <Clock className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">11 mins</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-2 rounded-xl text-[11px] font-medium text-white/80 flex items-center justify-between">
              <span className="text-white/60">💡 Public Transit alternative:</span>
              <span className="font-bold text-emerald-300">BRT SunMed (RM 1.20)</span>
            </div>
          </div>
        </div>

        {/* Feature 2: Campus Cheap Meal Finder & Price Hunter */}
        <div className="bg-[#121028] hover:bg-[#151230] rounded-3xl border border-white/10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all duration-300 shadow-lg">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#fb7185]/20 text-[#fb7185] text-xs font-black px-3 py-0.5 rounded-full border border-[#fb7185]/40 uppercase">
                Module 02
              </span>
              <span className="font-bold text-xs uppercase tracking-wide text-neutral-300">
                Campus Cheap Meal Finder
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-verdana font-black uppercase leading-tight text-white">
              campus cheap meal & stall finder (RM3 - RM8)
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Eat hearty, delicious, and healthy student meals without overspending. Filter 20+ authentic stalls and campus cafeterias near UM, Sunway, Monash, APU, UKM, UiTM, and more under RM8.00.
            </p>

            <div className="space-y-1.5 pt-1 text-xs font-medium text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Verified stall locations, prices, student hacks, and walking distances</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>AI Cheap Meal Scout powered by Gemini for custom budget dish queries</span>
              </div>
            </div>
          </div>

          {/* Mock Cheap Meal Visual */}
          <div className="lg:col-span-6 bg-[#0e0a26] text-white p-5 rounded-2xl border border-white/15 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs font-black border-b border-white/10 pb-2">
              <span className="text-[#fed618] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Campus Cheap Meal Spot
              </span>
              <span className="text-emerald-400 text-[10px] font-bold">RM 6.50 Average</span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-white text-xs">Nasi Campur (Ayam Goreng Berempah + Sayur)</div>
              <div className="text-[10px] text-neutral-400">Kafeteria KK12 / KK8 • Universiti Malaya</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-emerald-950/60 border border-emerald-500/30 p-2 rounded-lg text-emerald-300">
                Budget: <span className="font-bold text-white">Under RM 7.00</span>
              </div>
              <div className="bg-sky-950/60 border border-sky-500/30 p-2 rounded-lg text-sky-300">
                Diet: <span className="font-bold text-white">🟢 Halal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Campus Nutrition & Cheap Meals */}
        <div className="bg-[#121028] hover:bg-[#151230] rounded-3xl border border-white/10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all duration-300 shadow-lg">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#fb7185]/20 text-[#fb7185] text-xs font-black px-3 py-0.5 rounded-full border border-[#fb7185]/40 uppercase">
                Module 03
              </span>
              <span className="font-bold text-xs uppercase tracking-wide text-neutral-300">
                Dining & Nutrition
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-verdana font-black uppercase leading-tight text-white">
              cheap meal and nutrition guide
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Stay healthy without blowing your budget. Find wholesome Nasi Campur, Economy Rice, and Mamak options near your campus that cost under RM8 per plate with complete macronutrient estimations.
            </p>

            <div className="space-y-1.5 pt-1 text-xs font-medium text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Presets for Nasi Lemak, Mixed Rice, Roti Canai, and Ban Mian</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant calorie, protein, carb, and sodium estimates per dish</span>
              </div>
            </div>
          </div>

          {/* Mock Food Card */}
          <div className="lg:col-span-6 bg-[#0e0a26] text-white p-5 rounded-2xl border border-white/15 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs font-black border-b border-white/10 pb-2">
              <span className="text-[#fed618] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" /> Popular Student Meal
              </span>
              <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[10px] font-bold">
                Student Value
              </span>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
              <div className="font-bold text-white text-sm">Nasi Campur (Ayam Kunyit + Sayur Kangkung)</div>
              <div className="text-[11px] text-neutral-300">Average Stall Price: <span className="text-[#44f287] font-black">RM 7.00</span></div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-sm sm:text-base font-black text-amber-400 truncate">520 kcal</div>
                <div className="text-[9px] uppercase font-bold text-white/70 truncate">Calories</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-sm sm:text-base font-black text-emerald-400 truncate">28g Pro</div>
                <div className="text-[9px] uppercase font-bold text-white/70 truncate">Protein</div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                <div className="text-sm sm:text-base font-black text-sky-400 truncate">Budget OK</div>
                <div className="text-[9px] uppercase font-bold text-white/70 truncate">Cheap Meal</div>
              </div>
            </div>

            <div className="bg-emerald-950/70 border border-emerald-500/40 p-2.5 rounded-xl text-[11px] font-medium text-emerald-300 flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-white/90">Meal Pacing:</span>
              <span className="font-bold text-[#44f287]">Affordable Student Choice</span>
            </div>
          </div>
        </div>

        {/* Feature 4: Allowance & Net Savings Ledger */}
        <div className="bg-[#121028] hover:bg-[#151230] rounded-3xl border border-white/10 p-5 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center transition-all duration-300 shadow-lg">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#fed618]/20 text-[#fed618] text-xs font-black px-3 py-0.5 rounded-full border border-[#fed618]/40 uppercase">
                Module 04
              </span>
              <span className="font-bold text-xs uppercase tracking-wide text-neutral-300">
                Budget & Allowance Tracking
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-verdana font-black uppercase leading-tight text-white">
              Allowance & Semester Savings Ledger
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
              Maintain control over your semester finances. Track PTPTN loans, JPA scholarships, and allowance disbursements with real-time burn rate gauges and projected month-end savings.
            </p>

            <div className="space-y-1.5 pt-1 text-xs font-medium text-neutral-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Visual category breakdowns & monthly allowance forecasts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Emergency fund build-up & semester-end buffer targets</span>
              </div>
            </div>
          </div>

          {/* Interactive Feature Visual Mockup */}
          <div className="lg:col-span-6 bg-[#0e0a26] text-white p-5 rounded-2xl border border-white/15 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs font-black">
              <span>Monthly Allowance: RM 850.00</span>
              <span className="text-[#44f287]">Saved: RM 420.00 (49%)</span>
            </div>

            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/20">
              <div className="bg-[#44f287] h-full w-[49%]" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-medium">
              <div className="bg-white/5 p-2 rounded-xl text-neutral-300">
                Spent: <span className="text-white font-bold">RM 430.00</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl text-neutral-300">
                Buffer Left: <span className="text-[#fed618] font-bold">16 Days</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Affordable Student Subscription & Pricing Section */}
      <section id="pricing-section" className="p-6 sm:p-10 md:p-12 border-b border-white/10 space-y-8 bg-gradient-to-b from-[#151033]/60 to-[#0e0a26]">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-[#fed618]/15 text-[#fed618] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#fed618]/30">
            <CreditCard className="w-3.5 h-3.5" />
            <span>student friendly prices</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-verdana font-black uppercase tracking-tight text-[#ffc632]">
            Choose Your Student Pass
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Priced affordably for Malaysian student budgets. UniMate pays for itself on day one just by avoiding a single surge-priced Grab ride or finding a cheaper campus lunch.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between border-2 ${
                  isSelected
                    ? "bg-[#1f1847] border-[#fed618] shadow-2xl scale-[1.02]"
                    : "bg-white/[0.04] hover:bg-white/[0.08] border-white/15"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fed618] text-black font-black text-[10px] uppercase px-3 py-0.5 rounded-full border border-amber-300 shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-white tracking-wide">{plan.name}</h3>
                    {!plan.popular && (
                      <span className="text-[10px] font-bold text-neutral-400 uppercase bg-white/5 px-2 py-0.5 rounded-md">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-verdana font-black text-white">{plan.price}</span>
                      <span className="text-xs text-neutral-400 font-bold">{plan.period}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 font-medium mt-1">{plan.subtext}</p>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-[10px] font-bold text-emerald-300">
                    ✨ {plan.savingsText}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#44f287] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan.id);
                    }}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? "bg-[#fed618] text-black shadow-md"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        <span>Selected Plan</span>
                      </>
                    ) : (
                      <span>Select {plan.name}</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All plans include instant digital access, seamless renewal management, and full data privacy.</span>
          </div>
          <span className="text-[#fed618] font-bold shrink-0">🇲🇾 Maybank / Malaysian Bank Transfer Accepted</span>
        </div>
      </section>

      {/* 5. Formal Sign In & Sign Up Action Section */}
      <section id="auth-section" className="p-6 sm:p-10 md:p-12 space-y-6 bg-[#202044] border-t border-[#403f3f]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-white/15">
              <UserPlus className="w-3.5 h-3.5 text-[#fed618]" />
              <span>Step 2: Access the Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-verdana font-black uppercase text-white">
              Create Your Student Profile
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-normal mt-1">
              Select your institution, set your departure station, and start optimizing your daily budget with your selected{" "}
              <span className="text-[#fed618] font-bold uppercase">
                {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name} ({SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.price})
              </span>.
            </p>
          </div>

          {onOpenLogin && (
            <div className="bg-white/5 p-3.5 rounded-2xl border border-white/15 flex items-center justify-between sm:justify-end gap-3">
              <div className="text-left">
                <div className="text-[10px] font-bold text-neutral-400 uppercase">Existing Member?</div>
                <div className="text-xs font-bold text-white">Sign into account</div>
              </div>
              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-[#fed618] hover:bg-[#fde047] text-black border border-amber-300 font-black text-xs uppercase px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* The Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-500/20 border border-rose-500/40 text-rose-200 p-4 rounded-2xl font-bold text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Identity Card Box */}
          <div className="bg-[#202044] p-5 sm:p-7 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#fed618] flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              1. Student Identity & Academic Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Full Name (As in Student Card) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nur Aina binti Roslan"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Student / Campus Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aina.roslan@siswa.um.edu.my"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Mobile / WhatsApp No. *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 012-345 6789"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Password */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Account Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters (Compulsory)"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Student Matrix / ID No.
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. U2004589"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>

              {/* Nationality */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Nationality (For 50% Concession)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNationalityChange("Malaysian")}
                    className={`py-3 px-2 rounded-xl border font-bold text-xs uppercase cursor-pointer transition-all ${
                      nationality === "Malaysian"
                        ? "bg-[#fed618] text-black border-amber-400 shadow-sm"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    🇲🇾 Malaysian
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNationalityChange("International")}
                    className={`py-3 px-2 rounded-xl border font-bold text-xs uppercase cursor-pointer transition-all ${
                      nationality === "International"
                        ? "bg-[#fed618] text-black border-amber-400 shadow-sm"
                        : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    🌐 International
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* University Selector */}
              <div className={isOtherUniversity ? "sm:col-span-1" : "sm:col-span-1"}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  University / College *
                </label>
                <select
                  value={university}
                  onChange={(e) => handleUniversityChange(e.target.value)}
                  className="w-full bg-[#1e1945] text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] cursor-pointer"
                >
                  {MALAYSIAN_UNIVERSITIES.map((u) => (
                    <option key={u.name} value={u.name} className="bg-[#1e1945] text-white">
                      {u.name} {u.shortCode !== "Other" ? `(${u.shortCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom University Name if 'Other' selected */}
              {isOtherUniversity && (
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#fed618] block mb-1">
                    Specify University / College Name *
                  </label>
                  <input
                    type="text"
                    value={customUniversity}
                    onChange={(e) => setCustomUniversity(e.target.value)}
                    placeholder="e.g. INTI International College, UTHM, UniKL..."
                    className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-[#fed618]/50 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                  />
                </div>
              )}

              {/* Faculty */}
              <div className={isOtherUniversity ? "sm:col-span-2" : "sm:col-span-1"}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Faculty / School
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="e.g. Faculty of Computer Science"
                  className="w-full bg-white/10 text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] placeholder:text-white/40"
                />
              </div>

              {/* Year of Study */}
              <div className={isOtherUniversity ? "sm:col-span-1" : "sm:col-span-1"}>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Year of Study
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full bg-[#1e1945] text-white font-medium text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618] cursor-pointer"
                >
                  <option value="Foundation" className="bg-[#1e1945] text-white">Foundation / Matriculation</option>
                  <option value="Year 1" className="bg-[#1e1945] text-white">Year 1 Undergraduate</option>
                  <option value="Year 2" className="bg-[#1e1945] text-white">Year 2 Undergraduate</option>
                  <option value="Year 3" className="bg-[#1e1945] text-white">Year 3 Undergraduate</option>
                  <option value="Year 4" className="bg-[#1e1945] text-white">Year 4 Undergraduate</option>
                  <option value="Postgraduate" className="bg-[#1e1945] text-white">Postgraduate (Master/PhD)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Concession Configuration Box */}
          <div className="bg-[#202044] p-5 sm:p-7 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#fed618] flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              2. Allowance & Daily Meal Budget
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Budget */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Monthly Allowance / Budget (RM)
                </label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="850"
                  className="w-full bg-white/10 text-white font-bold text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618]"
                />
              </div>

              {/* Daily Food Budget */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/90 block mb-1">
                  Target Daily Meal Budget (RM)
                </label>
                <input
                  type="number"
                  value={dailyFoodBudget}
                  onChange={(e) => setDailyFoodBudget(e.target.value)}
                  placeholder="20"
                  className="w-full bg-white/10 text-white font-bold text-sm p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#fed618]"
                />
              </div>
            </div>

            {/* Concession Checkbox */}
            <div
              className={`p-3.5 rounded-2xl border transition-all ${
                nationality === "Malaysian" ? "bg-white/5 border-white/15" : "bg-white/5 border-white/10 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="reg-concession"
                  disabled={nationality !== "Malaysian"}
                  checked={hasConcession && nationality === "Malaysian"}
                  onChange={(e) => setHasConcession(e.target.checked)}
                  className="w-5 h-5 rounded text-[#fed618] focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor="reg-concession"
                  className={`text-xs font-medium ${
                    nationality === "Malaysian" ? "text-white cursor-pointer" : "text-white/60 cursor-not-allowed"
                  }`}
                >
                  I have an active RapidKL 50% Student Concession Card (Malaysian MyKad Only)
                </label>
              </div>
              {nationality !== "Malaysian" && (
                <p className="text-[10px] text-rose-300 mt-1.5 pl-8 font-medium">
                  International students pay standard cashless/token fare per RapidKL transport policy.
                </p>
              )}
            </div>
          </div>

          {/* Selected Plan Summary & Submit Button */}
          <div className="bg-[#1f1847] p-5 rounded-3xl border-2 border-[#fed618]/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-white/70 block">Selected Membership</span>
                <span className="text-base font-black text-white">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xl font-verdana font-black text-[#fed618]">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.price}
                </span>
                <span className="text-[11px] text-white/70 block">
                  {SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.period}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#fed618] hover:bg-[#fde047] text-black font-black text-base uppercase py-4 px-6 rounded-2xl border border-amber-300 shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-5 h-5 text-black" />
              <span>Proceed to Bank Transfer Checkout ({SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan)?.price}) →</span>
            </button>
            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-white/70 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#44f287]" />
                <span>Instant Bank Transfer Activation</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#44f287]" />
                <span>Verified Malaysian Student Security</span>
              </span>
            </div>
          </div>
        </form>
      </section>

      {/* Official Copyright & Legal Protection Footer */}
      <footer className="w-full max-w-5xl mx-auto pt-8 pb-12 text-center space-y-2 text-white/50 text-xs border-t border-white/10 mt-8 bg-[#131111] rounded-none">
        <p className="font-semibold text-white/70">
          © {new Date().getFullYear()} UniMate Technologies. All rights reserved.
        </p>
        <p className="max-w-2xl mx-auto text-[11px] leading-relaxed">
          UniMate™, the multi-app ride comparison radar, and proprietary financial co-pilot algorithms are protected under Malaysian copyright laws and international intellectual property conventions. Unauthorized reproduction, scraping, or copying of UI assets and system logic is strictly prohibited.
        </p>
      </footer>

      {/* Real Malaysian FPX & DuitNow QR Checkout Modal */}
      <MalaysianCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        selectedPlan={checkoutPlanData}
        studentData={studentRegistrationData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

