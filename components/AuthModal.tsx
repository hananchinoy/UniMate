import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  LogIn,
  Sparkles,
  GraduationCap,
  Building2,
  CheckCircle2,
  Globe,
  ShieldAlert,
  Smartphone,
  Mail,
  Lock,
  UserCheck
} from "lucide-react";
import { UserProfile } from "../types";
import { MALAYSIAN_UNIVERSITIES } from "../data";
import {
  getRegisteredAccounts,
  checkEmailOrPhoneTaken,
  registerAccount,
  loginAccount,
  normalizePhoneNumber
} from "../accountStorage";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserProfile) => void;
  initialMode?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  initialMode = "login"
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Sign in identifier (Email or Phone)
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [nationality, setNationality] = useState<"Malaysian" | "International">("Malaysian");
  const [university, setUniversity] = useState(MALAYSIAN_UNIVERSITIES[0].name);
  const [faculty, setFaculty] = useState("Computer Science & IT");
  const [yearOfStudy, setYearOfStudy] = useState("Year 2");
  const [monthlyBudget, setMonthlyBudget] = useState("850");
  const [hasConcession, setHasConcession] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleNationalityChange = (val: "Malaysian" | "International") => {
    setNationality(val);
    if (val === "International") {
      setHasConcession(false);
    } else {
      setHasConcession(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full student name.");
        return;
      }
      if (!email.trim()) {
        setError("Please enter your student email address.");
        return;
      }
      if (!phoneNumber.trim()) {
        setError("Please enter your Malaysian mobile phone number.");
        return;
      }
      if (!password.trim()) {
        setError("Password is compulsory. Please create a password for your student account (minimum 6 characters).");
        return;
      }
      if (password.trim().length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }

      // Check unique email and unique phone number
      const { emailTaken, phoneTaken } = checkEmailOrPhoneTaken(email, phoneNumber);
      if (emailTaken) {
        setError(`An account with the email "${email.trim()}" is already registered. You cannot reuse the same email for a different account. Please sign in or use another email.`);
        return;
      }
      if (phoneTaken) {
        setError(`An account with the phone number "${phoneNumber.trim()}" is already registered. Each phone number can only be linked to one account.`);
        return;
      }

      const selectedUniObj =
        MALAYSIAN_UNIVERSITIES.find((u) => u.name === university) || MALAYSIAN_UNIVERSITIES[0];
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
        university: university,
        faculty: faculty.trim() || "General Studies",
        yearOfStudy: yearOfStudy,
        monthlyBudget: parseFloat(monthlyBudget) || 850,
        dailyFoodBudget: 20,
        hasRapidKlConcession: effectiveConcession,
        concessionExpiry: effectiveConcession ? "Dec 2026" : "",
        homeStation: "KJ14 Pasar Seni (LRT)",
        campusStation: selectedUniObj.campusStation,
        avatarColor: isMalaysian ? "#fb7185" : "#38bdf8",
        createdAt: new Date().toISOString(),
        subscriptionPlan: "monthly",
        subscriptionStatus: "active"
      };

      const result = registerAccount(newUser);
      if (!result.success) {
        setError(result.error || "Failed to register account.");
        return;
      }

      onLogin(result.user || newUser);
      onClose();
    } else {
      // Login mode - Validate registered credentials
      if (!loginIdentifier.trim()) {
        setError("Please enter your registered email address or phone number.");
        return;
      }
      if (!loginPassword.trim()) {
        setError("Password is compulsory. Please enter your account password.");
        return;
      }

      const loginResult = loginAccount(loginIdentifier, loginPassword);
      if (!loginResult.success || !loginResult.user) {
        setError(
          loginResult.error ||
            "No registered student account was found with these credentials. Please check your details or sign up for a new account."
        );
        return;
      }

      onLogin(loginResult.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div
        id="auth-modal"
        className="w-full max-w-lg bg-[#5850ec] border-4 sm:border-6 border-black rounded-3xl brutal-shadow-2xl overflow-hidden text-white relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-[#fed618] text-black border-b-4 border-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-black" />
            <h2 className="text-base sm:text-lg font-verdana font-black uppercase tracking-tight">
              {mode === "login" ? "Student Sign In" : "Register Student Account"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 bg-black/30 p-1 rounded-2xl border-2 border-black">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-[#fed618] text-black border-2 border-black brutal-shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`py-2 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-[#fed618] text-black border-2 border-black brutal-shadow"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Register New
            </button>
          </div>

          {error && (
            <div className="bg-[#fb7185] text-black p-3.5 rounded-2xl border-3 border-black text-xs font-black flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "login" ? (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                    Registered Email or Phone Number *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. amirah.zulkifli@siswa.um.edu.my or 0123456789"
                      className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>
                  <p className="text-[9px] text-white/70 mt-1">
                    Enter the exact email or phone number used during registration.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password (Compulsory)"
                    className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Siti Nurhaliza / Lucas Tan"
                    className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                      Student Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@siswa.edu.my"
                      className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="012-345 6789"
                      className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                    Account Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters (Compulsory)"
                    className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                  />
                </div>

                {/* Nationality Section */}
                <div className="bg-black/30 p-3 rounded-2xl border-2 border-black space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#fed618] flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" />
                      Student Nationality (Concession Eligibility)
                    </label>
                    <span className="text-[9px] font-mono text-white/70">
                      {nationality === "Malaysian" ? "50% Concession Eligible" : "Standard Fare Only"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleNationalityChange("Malaysian")}
                      className={`p-2 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        nationality === "Malaysian"
                          ? "bg-[#4ade80] text-black brutal-shadow-sm scale-[1.02]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <span>🇲🇾 Malaysian</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNationalityChange("International")}
                      className={`p-2 rounded-xl border-2 border-black font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        nationality === "International"
                          ? "bg-[#38bdf8] text-black brutal-shadow-sm scale-[1.02]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <span>🌐 International</span>
                    </button>
                  </div>

                  {nationality === "International" && (
                    <div className="bg-[#fb7185]/20 border border-[#fb7185] p-2 rounded-xl text-[10px] font-bold text-[#fecdd3] flex items-start gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-[#fb7185] shrink-0 mt-0.5" />
                      <span>
                        <strong>RapidKL Policy Notice:</strong> RapidKL 50% Student Concession cards and My50 unlimited travel passes are strictly reserved for Malaysian citizens with valid MyKad / MyKid.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                      Student ID / Matric
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. UM220491"
                      className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                      Year of Study
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
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
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/80 block mb-1">
                    University / College
                  </label>
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-white text-black font-bold text-xs p-2.5 rounded-xl border-3 border-black focus:outline-none focus:ring-2 focus:ring-[#facc15]"
                  >
                    {MALAYSIAN_UNIVERSITIES.map((uni) => (
                      <option key={uni.id} value={uni.name}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* RapidKL Concession Checkbox (Active only if Malaysian) */}
                <div
                  className={`p-2.5 rounded-xl border-2 border-black transition-all ${
                    nationality === "Malaysian" ? "bg-black/20" : "bg-black/40 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rapidkl-concession"
                      disabled={nationality !== "Malaysian"}
                      checked={hasConcession && nationality === "Malaysian"}
                      onChange={(e) => setHasConcession(e.target.checked)}
                      className="w-4 h-4 rounded text-[#facc15] focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="rapidkl-concession"
                      className={`text-xs font-bold ${
                        nationality === "Malaysian" ? "text-white cursor-pointer" : "text-white/60 cursor-not-allowed"
                      }`}
                    >
                      I have an active RapidKL 50% Student Concession Card (Malaysian Only)
                    </label>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-[#fed618] hover:bg-[#fde047] text-black font-verdana font-black text-sm uppercase py-3 px-4 rounded-2xl border-4 border-black brutal-shadow brutal-btn flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {mode === "login" ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In to Student Account</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register & Activate Student Account</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
