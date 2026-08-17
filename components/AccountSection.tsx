import React, { useState } from "react";
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  User,
  Mail,
  Edit3,
  Save,
  LogOut,
  Sliders,
  CheckCircle2,
  Calendar,
  Zap,
  DollarSign,
  Globe,
  QrCode
} from "lucide-react";
import { UserProfile, MalaysianUniversity } from "../types";
import { MALAYSIAN_UNIVERSITIES } from "../data";
import { GoogleMapsStationInput } from "./GoogleMapsStationInput";
import { MalaysianCheckoutModal, CheckoutPlan, PaymentReceipt } from "./MalaysianCheckoutModal";
import { checkEmailOrPhoneTaken, normalizePhoneNumber } from "../accountStorage";

interface AccountSectionProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenAuth?: (mode: "login" | "signup") => void;
  onLogout: () => void;
}


export const AccountSection: React.FC<AccountSectionProps> = ({
  user,
  onUpdateUser,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(user);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<CheckoutPlan>({
    id: "monthly",
    name: "Monthly Student Pro",
    priceMYR: 6.90,
    period: "/ month",
    badge: "Most Popular",
    description: "Unlimited transit comparator & cheap food guide"
  });

  // Sync state if user changes externally
  React.useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleOpenUpgrade = (planType: "weekly" | "monthly" | "semester" | "yearly") => {
    const plansMap: Record<string, CheckoutPlan> = {
      weekly: {
        id: "weekly",
        name: "Weekly Pass",
        priceMYR: 2.50,
        period: "/ week",
        badge: "Budget Trial",
        description: "Save ~RM 30/mo in transit & food leaks"
      },
      monthly: {
        id: "monthly",
        name: "Monthly Student Pro",
        priceMYR: 6.90,
        period: "/ month",
        badge: "Most Popular",
        description: "Save up to RM 180/mo with meal & fare tricks"
      },
      semester: {
        id: "semester",
        name: "Semester Pass (6 Mos)",
        priceMYR: 29.90,
        period: "/ semester",
        badge: "Best Student Value",
        description: "Save up to RM 950 across your semester"
      },
      yearly: {
        id: "yearly",
        name: "Annual Scholar Pass",
        priceMYR: 49.90,
        period: "/ full year",
        badge: "Maximum Savings",
        description: "Save over RM 2,000 in university life costs"
      }
    };

    setTargetUpgradePlan(plansMap[planType] || plansMap.monthly);
    setIsCheckoutOpen(true);
  };

  const handlePaymentSuccess = (receipt: PaymentReceipt) => {
    const renewDays = targetUpgradePlan.id === "yearly" ? 365 : targetUpgradePlan.id === "semester" ? 180 : targetUpgradePlan.id === "monthly" ? 30 : 7;
    const updatedUser: UserProfile = {
      ...user,
      subscriptionPlan: targetUpgradePlan.id as any,
      subscriptionStatus: "active",
      subscriptionRenewsAt: new Date(Date.now() + renewDays * 86400000).toISOString()
    };
    onUpdateUser(updatedUser);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Validate uniqueness if email or phone changed
    const emailChanged = formData.email?.trim().toLowerCase() !== user.email?.trim().toLowerCase();
    const phoneChanged = normalizePhoneNumber(formData.phoneNumber || "") !== normalizePhoneNumber(user.phoneNumber || "");

    if (emailChanged || phoneChanged) {
      const { emailTaken, phoneTaken } = checkEmailOrPhoneTaken(
        emailChanged ? formData.email : "",
        phoneChanged ? (formData.phoneNumber || "") : ""
      );
      if (emailChanged && emailTaken) {
        setSaveError(`The email address "${formData.email}" is already registered to another student account.`);
        return;
      }
      if (phoneChanged && phoneTaken) {
        setSaveError(`The phone number "${formData.phoneNumber}" is already registered to another account.`);
        return;
      }
    }

    const isMalaysian = formData.nationality === "Malaysian";
    const cleanedData: UserProfile = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      phoneNumber: normalizePhoneNumber(formData.phoneNumber || ""),
      hasRapidKlConcession: isMalaysian ? formData.hasRapidKlConcession : false,
      concessionExpiry: isMalaysian && formData.hasRapidKlConcession ? (formData.concessionExpiry || "Dec 2026") : ""
    };
    onUpdateUser(cleanedData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleNationalityChange = (newNationality: "Malaysian" | "International") => {
    setFormData((prev) => ({
      ...prev,
      nationality: newNationality,
      hasRapidKlConcession: newNationality === "Malaysian" ? prev.hasRapidKlConcession : false
    }));
  };

  const handleUniChange = (uniName: string) => {
    const foundUni = MALAYSIAN_UNIVERSITIES.find((u) => u.name === uniName);
    setFormData((prev) => ({
      ...prev,
      university: uniName,
      campusStation: foundUni ? foundUni.campusStation : prev.campusStation
    }));
  };

  const isUserMalaysian = (user.nationality || "Malaysian") === "Malaysian";

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fed618] text-black p-5 rounded-3xl border-4 border-black brutal-shadow">
        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: user.avatarColor || "#fb7185" }}
            className="w-12 h-12 rounded-2xl border-3 border-black text-black font-verdana font-black text-xl flex items-center justify-center brutal-shadow-sm shrink-0"
          >
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-verdana font-black leading-tight text-black">
              {user.name}
            </h2>
            <p className="text-xs font-bold text-black/80">
              {user.university} • {user.studentId} • {isUserMalaysian ? "🇲🇾 Malaysian" : "🌐 International"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onLogout}
            className="bg-rose-500 hover:bg-rose-600 text-white border-3 border-black text-xs font-black uppercase px-4 py-2.5 rounded-xl brutal-shadow brutal-btn flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="bg-rose-500 text-white p-3.5 rounded-2xl border-4 border-black brutal-shadow text-xs font-black flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-white shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-[#4ade80] text-black p-3.5 rounded-2xl border-4 border-black brutal-shadow text-xs font-black flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>Student profile & nationality configuration updated successfully!</span>
        </div>
      )}

      {/* 2. Matriculation Digital Card & Profile Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Matriculation Card (Left 5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white text-black p-6 rounded-3xl border-4 border-black brutal-shadow space-y-4 relative overflow-hidden">
            {/* Top university crest badge */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-black" />
                <span className="font-verdana font-black text-xs uppercase tracking-tight">
                  Student Matriculation Card
                </span>
              </div>
              <span className="text-[9px] font-black uppercase bg-[#fed618] border-2 border-black px-2 py-0.5 rounded-md">
                ACTIVE
              </span>
            </div>

            {/* Profile Avatar & Details */}
            <div className="flex items-center gap-4 py-2">
              <div
                style={{ backgroundColor: user.avatarColor || "#fb7185" }}
                className="w-16 h-16 rounded-2xl border-3 border-black text-black font-verdana font-black text-2xl flex items-center justify-center shrink-0 brutal-shadow-sm"
              >
                {user.name.charAt(0)}
              </div>
              <div className="space-y-0.5 overflow-hidden">
                <h3 className="font-verdana font-black text-sm text-black truncate">
                  {user.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-700">
                  {user.studentId}
                </p>
                <p className="text-[10px] font-bold text-slate-500 truncate">
                  {user.faculty}
                </p>
              </div>
            </div>

            {/* University & Route Info */}
            <div className="bg-slate-100 p-3 rounded-2xl border-2 border-black space-y-1.5 text-xs font-bold">
              <div className="flex justify-between">
                <span className="text-slate-500">Nationality:</span>
                <span className="text-black font-black">
                  {isUserMalaysian ? "🇲🇾 Malaysian Citizen" : "🌐 International Student"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Registered Phone:</span>
                <span className="text-black font-black">
                  {user.phoneNumber || "012-345 6789"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Institution:</span>
                <span className="text-black font-black text-right truncate max-w-[170px]">
                  {user.university.split("(")[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Study Level:</span>
                <span className="text-black font-black">{user.yearOfStudy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campus Station:</span>
                <span className="text-black font-black text-right truncate max-w-[170px]">
                  {user.campusStation.split("(")[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Monthly Budget:</span>
                <span className="text-black font-black">RM {user.monthlyBudget.toFixed(2)}</span>
              </div>
            </div>

            {/* Concession Status Pill */}
            {isUserMalaysian && user.hasRapidKlConcession ? (
              <div className="bg-[#4ade80] text-black p-2.5 rounded-xl border-2 border-black flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>RapidKL 50% Concession Active</span>
                </div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">
                  Exp: {user.concessionExpiry || "Dec 2026"}
                </span>
              </div>
            ) : isUserMalaysian ? (
              <div className="bg-[#fed618] text-black p-2.5 rounded-xl border-2 border-black flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-black" />
                  <span>50% Concession Not Active</span>
                </div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-bold">
                  Eligible (Apply TnG)
                </span>
              </div>
            ) : (
              <div className="bg-[#e2e8f0] text-slate-800 p-2.5 rounded-xl border-2 border-black flex items-center justify-between text-xs font-black">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-slate-800" />
                  <span>Standard Fare (Non-Malaysian)</span>
                </div>
                <span className="text-[10px] bg-slate-800 text-white px-2 py-0.5 rounded font-bold">
                  No Concession
                </span>
              </div>
            )}

            {/* Fake Barcode Graphic */}
            <div className="pt-2 flex flex-col items-center space-y-1">
              <div className="w-full h-8 bg-black/10 rounded-lg flex items-center justify-center px-4 space-x-1.5">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className={`bg-black h-5 ${i % 3 === 0 ? "w-1.5" : i % 2 === 0 ? "w-0.5" : "w-1"}`}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500">
                {user.studentId} • VALID 2026
              </span>
            </div>

          </div>

          {/* Student Pro Subscription Status */}
          <div className="bg-[#181338] p-4 rounded-3xl border-4 border-black text-white space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[#fed618] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#fed618]" />
                <span>Active Student Pass</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold uppercase">
                {user.subscriptionStatus || "Active"}
              </span>
            </div>
            <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Plan:</span>
                <span className="font-black text-[#fed618] uppercase">
                  {user.subscriptionPlan === "yearly"
                    ? "Annual Scholar Pass (RM 49.90)"
                    : user.subscriptionPlan === "semester"
                    ? "Semester Pass (RM 29.90)"
                    : user.subscriptionPlan === "weekly"
                    ? "Weekly Pass (RM 2.50)"
                    : "Monthly Student Pro (RM 6.90)"}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-white/70">
                <span>Renews:</span>
                <span className="font-bold text-white">
                  {user.subscriptionRenewsAt
                    ? new Date(user.subscriptionRenewsAt).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : "Auto-renews (Cancel anytime)"}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleOpenUpgrade(user.subscriptionPlan === "monthly" ? "semester" : "monthly")}
              className="w-full bg-[#fed618] hover:bg-[#fde047] text-black font-black text-xs uppercase py-2.5 px-3 rounded-xl border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer brutal-btn transition-all"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Renew / Upgrade via FPX & DuitNow QR →</span>
            </button>
          </div>


          {/* Quick Actions in Card */}
          <div className="bg-black p-4 rounded-3xl border-4 border-black text-white space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase text-[#fed618]">Account Status</span>
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-bold">Local Sync</span>
            </div>
            <p className="text-[11px] font-bold text-white/80">
              Logged in as <strong className="text-white">{user.email}</strong>.
            </p>
            <button
              onClick={onLogout}
              className="w-full bg-[#fb7185] hover:bg-[#f43f5e] text-black font-black text-xs uppercase py-2 px-3 rounded-xl border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer brutal-btn mt-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Edit / View Profile Form (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-[#5850ec] p-5 sm:p-6 rounded-3xl border-4 border-black brutal-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#fed618]" />
              <h3 className="text-sm font-verdana font-black uppercase text-white">
                Student Profile & Budget Settings
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-[#fed618] hover:bg-[#fde047] text-black font-black text-xs uppercase px-3 py-1.5 rounded-xl border-2 border-black brutal-shadow-sm brutal-btn flex items-center gap-1 cursor-pointer"
            >
              {isEditing ? (
                <>Cancel</>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-3.5 text-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Student ID / Matric
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>
            </div>

            {/* Nationality Selection */}
            <div>
              <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                Student Nationality (Determines 50% Concession Eligibility)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleNationalityChange("Malaysian")}
                  className={`p-2.5 rounded-xl border-3 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    formData.nationality === "Malaysian"
                      ? "bg-[#4ade80] text-black brutal-shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                  } ${!isEditing ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span>🇲🇾 Malaysian (50% Eligible)</span>
                </button>
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => handleNationalityChange("International")}
                  className={`p-2.5 rounded-xl border-3 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    formData.nationality === "International"
                      ? "bg-[#38bdf8] text-black brutal-shadow-sm"
                      : "bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                  } ${!isEditing ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span>🌐 International (Standard)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phoneNumber || ""}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="012-345 6789"
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Year of Study
                </label>
                <select
                  disabled={!isEditing}
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                >
                  <option value="Year 1 (Freshman)">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                University
              </label>
              <select
                disabled={!isEditing}
                value={formData.university}
                onChange={(e) => handleUniChange(e.target.value)}
                className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
              >
                {MALAYSIAN_UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Commute Stations with Google Maps Menu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <GoogleMapsStationInput
                  id="acc-home-station"
                  label="Home / Departure Station"
                  value={formData.homeStation}
                  onChange={(val) => setFormData({ ...formData, homeStation: val })}
                  role="departure"
                  placeholder="e.g. KJ14 Pasar Seni, Gombak..."
                />
              </div>
              <div>
                <GoogleMapsStationInput
                  id="acc-campus-station"
                  label="Campus Arrival Station"
                  value={formData.campusStation}
                  onChange={(val) => setFormData({ ...formData, campusStation: val })}
                  role="destination"
                  placeholder="e.g. KJ19 Universiti, SunMed..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Monthly Allowance Target (RM)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.monthlyBudget}
                  onChange={(e) => setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-white/80 block mb-1">
                  Daily Food Budget (RM)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={formData.dailyFoodBudget || 20}
                  onChange={(e) => setFormData({ ...formData, dailyFoodBudget: parseFloat(e.target.value) || 20 })}
                  className="w-full bg-white disabled:bg-white/80 text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none"
                />
              </div>
            </div>

            {/* RapidKL Concession Checkbox */}
            <div className={`p-3 rounded-2xl border-2 border-black transition-all ${
              formData.nationality === "Malaysian" ? "bg-black/20" : "bg-black/40 opacity-70"
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-concession"
                  disabled={!isEditing || formData.nationality !== "Malaysian"}
                  checked={formData.hasRapidKlConcession && formData.nationality === "Malaysian"}
                  onChange={(e) => setFormData({ ...formData, hasRapidKlConcession: e.target.checked })}
                  className="w-4 h-4 rounded text-[#facc15] focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <label htmlFor="edit-concession" className="text-xs font-bold text-white cursor-pointer">
                  RapidKL 50% Student Concession Card Enabled (Malaysian Only)
                </label>
              </div>
              {formData.nationality !== "Malaysian" && (
                <p className="text-[10px] text-[#fb7185] mt-1 pl-6 font-bold">
                  International students do not qualify for the 50% RapidKL Concession Card per Prasarana policy.
                </p>
              )}
            </div>

            {isEditing && (
              <button
                type="submit"
                className="w-full bg-[#4ade80] hover:bg-[#86efac] text-black font-verdana font-black text-xs uppercase py-3 px-4 rounded-2xl border-4 border-black brutal-shadow brutal-btn flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            )}
          </form>
        </div>

      </div>

      {/* Legal & Copyright Info */}
      <div className="pt-6 border-t-2 border-black/10 text-center space-y-1">
        <p className="text-[11px] font-black uppercase tracking-wider text-white/80">
          © {new Date().getFullYear()} UniMate Technologies. All rights reserved.
        </p>
        <p className="text-[10px] font-medium text-white/60">
          Proprietary Student Financial Co-Pilot Platform • Protected under Intellectual Property & Copyright Laws
        </p>
      </div>

      {/* Malaysian FPX & DuitNow QR Pass Upgrade Checkout Modal */}
      <MalaysianCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={targetUpgradePlan}
        studentData={{
          name: user.name,
          email: user.email,
          university: user.university,
          nationality: user.nationality || "Malaysian",
          hasRapidKlConcession: user.hasRapidKlConcession,
          campusStation: user.campusStation || "KJ19 Universiti (LRT)",
          monthlyBudget: user.monthlyBudget || 850
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};


