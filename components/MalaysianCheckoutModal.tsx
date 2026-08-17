import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
  Hash,
  HelpCircle,
  ShieldAlert,
  CreditCard
} from "lucide-react";

export interface CheckoutPlan {
  id: string;
  name: string;
  priceMYR: number;
  period: string;
  badge?: string;
  description: string;
}

export interface StudentRegistrationData {
  name: string;
  email: string;
  phone?: string;
  university: string;
  nationality: string;
  hasRapidKlConcession: boolean;
  campusStation: string;
  monthlyBudget: number;
}

interface MalaysianCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: CheckoutPlan;
  studentData: StudentRegistrationData;
  onPaymentSuccess: (receipt: PaymentReceipt) => void;
}

export interface PaymentReceipt {
  sessionId: string;
  planId: string;
  planName: string;
  amountMYR: number;
  paymentMethod: string;
  receiptNumber: string;
  authCode: string;
  paidAt: string;
  studentName: string;
  studentEmail: string;
  university: string;
  recipientName: string;
  bankOrEwalletName?: string;
}

// Official Payment Recipient Configuration (Bank Transfer Only)
const BANK_PAYMENT_CONFIG = {
  recipientName: "UniMate Official",
  maybank: {
    bankName: "Maybank (Malayan Banking Berhad)",
    accountNumber: "1686 0321 1346",
    accountNumberFormatted: "1686 0321 1346",
    accountNumberRaw: "168603211346",
    accountHolder: "UniMate Official",
    accountType: "Savings / Interbank GIRO & DuitNow Transfer",
    swiftCode: "MBBEMYKL",
    logo: "🐯",
    color: "#FFD100"
  }
};

export const MalaysianCheckoutModal: React.FC<MalaysianCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  studentData,
  onPaymentSuccess
}) => {
  // Inputs - Reference Number Only
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [senderName, setSenderName] = useState<string>(studentData.name || "");
  const [senderBank, setSenderBank] = useState<string>("Maybank (MAE / M2U)");
  const [showBankRefGuide, setShowBankRefGuide] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [aiAuditStep, setAiAuditStep] = useState<number>(0);

  // Checkout session state
  const [session, setSession] = useState<any>(null);
  const [, setLoading] = useState<boolean>(false);
  const [verifyingPayment, setVerifyingPayment] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);

  // Cycle through audit messages while verifying
  useEffect(() => {
    let timer: any;
    if (verifyingPayment) {
      setAiAuditStep(0);
      timer = setInterval(() => {
        setAiAuditStep((prev) => (prev + 1) % 3);
      }, 700);
    }
    return () => clearInterval(timer);
  }, [verifyingPayment]);
  
  // Copy state feedbacks
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [copiedName, setCopiedName] = useState<boolean>(false);
  const [copiedAmount, setCopiedAmount] = useState<boolean>(false);

  // Initialize payment session on modal open or plan change
  useEffect(() => {
    if (!isOpen) return;

    const initSession = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/payment/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            amountMYR: selectedPlan.priceMYR,
            paymentMethod: "bank_transfer",
            studentName: studentData.name,
            studentEmail: studentData.email,
            university: studentData.university
          })
        });
        const data = await res.json();
        if (data.session) {
          setSession(data.session);
        }
      } catch (err) {
        console.error("Failed to init payment session", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, [isOpen, selectedPlan]);

  const handleCopyText = (text: string, type: "account" | "name" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "account") {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else if (type === "name") {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else if (type === "amount") {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  // Auto-fill sample reference for testing convenience
  const handleFillSampleRef = () => {
    const randomRef = `MBB-TRX-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${Math.floor(100000 + Math.random() * 900000)}`;
    setTransactionRef(randomRef);
    setVerificationError(null);
  };

  // Payment Verification Submission via Reference Number only
  const handleVerifyAndProceed = async () => {
    setVerificationError(null);

    const cleanRef = transactionRef.trim();

    if (!cleanRef) {
      setVerificationError("Please enter your Bank Transfer Reference Number or Approval Code.");
      return;
    }

    setVerifyingPayment(true);

    try {
      const res = await fetch("/api/payment/submit-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session?.sessionId || `UM-${Date.now()}`,
          studentName: studentData.name,
          studentEmail: studentData.email,
          university: studentData.university,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          amountMYR: selectedPlan.priceMYR,
          paymentMethod: "Maybank Bank Transfer",
          transactionRef: cleanRef,
          senderBankOrWallet: senderBank || "Maybank Transfer",
          senderName: senderName || studentData.name
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to verify payment reference number.");
      }

      const completedReceipt: PaymentReceipt = {
        sessionId: data.submission.sessionId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amountMYR: selectedPlan.priceMYR,
        paymentMethod: "Maybank Bank Transfer",
        receiptNumber: data.submission.receiptNumber || cleanRef,
        authCode: data.submission.authCode,
        paidAt: data.submission.submittedAt,
        studentName: studentData.name,
        studentEmail: studentData.email,
        university: studentData.university,
        recipientName: BANK_PAYMENT_CONFIG.recipientName,
        bankOrEwalletName: senderBank || "Maybank (Malayan Banking Berhad)"
      };

      setReceipt(completedReceipt);
      setPaymentCompleted(true);
    } catch (err: any) {
      console.error("Payment verification error:", err);
      setVerificationError(err.message || "Failed to verify payment reference. Please check your reference number.");
    } finally {
      setVerifyingPayment(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0e0a22] text-white rounded-3xl border-4 border-black brutal-shadow overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-[#181338] p-4 sm:p-5 border-b-2 border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fed618] text-black font-black flex items-center justify-center text-lg border-2 border-black">
              🇲🇾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-verdana font-black uppercase text-white">
                  Student Pass Bank Transfer
                </h3>
                <span className="text-[10px] bg-emerald-400 text-black font-black px-2 py-0.5 rounded-full uppercase">
                  Verified Checkout
                </span>
              </div>
              <p className="text-xs text-white/70">
                Official Account: <strong className="text-white">UniMate Verified Official</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* If Payment Completed: Show Official Verified Receipt */}
          {paymentCompleted && receipt ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-950/60 border-2 border-emerald-500/50 p-5 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-400 text-black flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-black uppercase text-emerald-300">
                  Bank Transfer Verified & Pass Activated!
                </h4>
                <p className="text-xs text-neutral-300 max-w-md mx-auto">
                  Your UniMate <strong>{receipt.planName}</strong> has been confirmed and activated for{" "}
                  <strong>{receipt.studentName}</strong> ({receipt.university}).
                </p>
              </div>

              {/* Official Receipt Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Security Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Bank Reference Approved</span>
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Recipient Account</span>
                  <span className="font-bold text-white">{receipt.recipientName} (Maybank)</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Payment Channel</span>
                  <span className="font-bold text-[#fed618]">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Reference Number</span>
                  <span className="font-bold text-emerald-300">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-neutral-400">Student Account</span>
                  <span className="font-bold text-white">{receipt.studentEmail}</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm font-sans font-black">
                  <span className="text-white uppercase">Amount Paid</span>
                  <span className="text-xl text-[#44f287]">RM {receipt.amountMYR.toFixed(2)}</span>
                </div>
              </div>

              {/* Launch App Button */}
              <button
                onClick={() => {
                  onPaymentSuccess(receipt);
                  onClose();
                }}
                className="w-full bg-[#fed618] hover:bg-[#ffe14d] text-black font-black uppercase text-sm py-3.5 px-6 rounded-2xl border-3 border-black brutal-shadow brutal-btn flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                <span>Launch UniMate Dashboard Now →</span>
              </button>
            </div>
          ) : (
            <>
              {/* Order Summary Pill */}
              <div className="bg-white/[0.04] border border-white/10 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-black text-neutral-400">Plan Selected</div>
                  <div className="font-verdana font-black text-sm text-white">
                    {selectedPlan.name} ({selectedPlan.period})
                  </div>
                  <div className="text-[11px] text-neutral-300">{studentData.university} Student</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-black text-neutral-400">Total Payable</div>
                  <div className="text-2xl font-black text-[#44f287] font-verdana leading-none flex items-center justify-end gap-1.5">
                    <span>RM {selectedPlan.priceMYR.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(selectedPlan.priceMYR.toFixed(2), "amount")}
                      className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy Amount"
                    >
                      {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[10px] text-neutral-400">Direct student bank transfer</div>
                </div>
              </div>

              {/* STEP 1: MAYBANK OFFICIAL BANK DETAILS CARD */}
              <div className="bg-[#FFD100] text-black p-5 rounded-3xl border-4 border-black brutal-shadow space-y-3.5">
                <div className="flex items-center justify-between border-b-2 border-black/20 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-black text-[#FFD100] flex items-center justify-center text-lg font-black shrink-0">
                      🐯
                    </div>
                    <div>
                      <div className="font-verdana font-black text-sm uppercase text-black leading-tight">
                        Maybank (Malayan Banking)
                      </div>
                      <div className="text-[10px] font-bold text-neutral-800">
                        Instant Interbank Transfer / DuitNow Transfer
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-black text-[#FFD100] font-black px-2.5 py-1 rounded-full uppercase shrink-0">
                    Official Account
                  </span>
                </div>

                {/* Account Number Box with 1-Click Copy */}
                <div className="bg-black text-white p-3.5 rounded-2xl border-2 border-black flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-neutral-400">Official Account Number</div>
                    <div className="text-xl sm:text-2xl font-mono font-black text-[#FFD100] tracking-wider">
                      {BANK_PAYMENT_CONFIG.maybank.accountNumberFormatted}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyText(BANK_PAYMENT_CONFIG.maybank.accountNumberRaw, "account")}
                    className="bg-white/20 hover:bg-white/30 text-white font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy No.</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Account Holder & Amount Rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-black/20 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-black text-neutral-700">Account Holder</div>
                      <div className="font-bold text-black">{BANK_PAYMENT_CONFIG.maybank.accountHolder}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText(BANK_PAYMENT_CONFIG.maybank.accountHolder, "name")}
                      className="text-neutral-700 hover:text-black cursor-pointer"
                      title="Copy Name"
                    >
                      {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-xl border border-black/20 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-black text-neutral-700">Exact Amount</div>
                      <div className="font-black text-black">RM {selectedPlan.priceMYR.toFixed(2)}</div>
                    </div>
                    <span className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded">MYR</span>
                  </div>
                </div>

                <div className="text-[10px] text-neutral-800 bg-white/40 p-2 rounded-xl border border-black/10 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-black shrink-0" />
                  <span>Transfer from any Malaysian bank (Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank, Bank Islam, etc.)</span>
                </div>
              </div>

              {/* STEP 2: REFERENCE NUMBER ENTRY */}
              <div className="bg-gradient-to-br from-[#1c1445] to-[#120b33] border-2 border-[#fed618]/40 rounded-3xl p-4 sm:p-5 space-y-4">
                
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-[#fed618]">
                    <ShieldCheck className="w-4 h-4 text-[#fed618]" />
                    <span>Step 2: Enter Bank Reference Number</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Instant Pass Activation</span>
                  </div>
                </div>

                {/* SENDER BANK SELECTOR */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-400">
                    Transferred From (Your Bank):
                  </label>
                  <select
                    value={senderBank}
                    onChange={(e) => setSenderBank(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fed618]"
                  >
                    <option value="Maybank (MAE / M2U)">Maybank (MAE / M2U)</option>
                    <option value="CIMB Clicks">CIMB Clicks</option>
                    <option value="Public Bank (PBe)">Public Bank (PBe)</option>
                    <option value="RHB Now">RHB Now</option>
                    <option value="Hong Leong Connect">Hong Leong Connect</option>
                    <option value="AmOnline (AmBank)">AmOnline (AmBank)</option>
                    <option value="Bank Islam">Bank Islam</option>
                    <option value="Bank Muamalat">Bank Muamalat</option>
                    <option value="Alliance Bank">Alliance Bank</option>
                    <option value="Affin Bank">Affin Bank</option>
                    <option value="BSN (myBSN)">BSN (myBSN)</option>
                    <option value="UOB Malaysia">UOB Malaysia</option>
                    <option value="Other Bank Transfer">Other Bank Transfer</option>
                  </select>
                </div>

                {/* BANK REFERENCE NUMBER INPUT */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-[#fed618]" />
                      <span>Bank Reference No. / Transaction ID / Approval Code</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowBankRefGuide(!showBankRefGuide)}
                      className="text-[10px] text-[#fed618] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Where is reference number?</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => {
                        setTransactionRef(e.target.value);
                        if (verificationError) setVerificationError(null);
                      }}
                      placeholder="e.g. 202608151234 or MBB-TRX-123456 or TRX-..."
                      className="w-full bg-black/60 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#fed618] font-mono pr-24"
                    />
                    <button
                      type="button"
                      onClick={handleFillSampleRef}
                      className="absolute right-1.5 top-1.5 bottom-1.5 bg-white/10 hover:bg-white/20 text-[#fed618] font-bold text-[10px] px-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Auto Fill</span>
                    </button>
                  </div>
                </div>

                {/* Explanatory Guide Drawer for Bank Transaction Number */}
                {showBankRefGuide && (
                  <div className="bg-black/80 border border-white/15 rounded-2xl p-3.5 text-xs space-y-2 text-neutral-300 animate-fade-in">
                    <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-3.5 h-3.5 text-[#FFD100]" />
                      <span>How to find your Bank Transfer Reference:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-neutral-300">
                      <li>Open your banking app (Maybank MAE, CIMB, Public Bank, RHB, etc.).</li>
                      <li>Go to <strong>Transaction History / Activity</strong>.</li>
                      <li>Tap your latest transfer to <strong>UniMate Official</strong>.</li>
                      <li>Look for <strong>"Reference No."</strong>, <strong>"Transaction ID"</strong>, or <strong>"Approval Code"</strong>.</li>
                    </ol>
                  </div>
                )}

                {/* Validation Error Alert */}
                {verificationError && (
                  <div className="bg-red-950/90 border-2 border-red-500/80 p-3.5 rounded-2xl text-red-200 text-xs space-y-1.5 animate-fade-in">
                    <div className="flex items-center gap-2 font-bold text-red-300">
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Verification Notice</span>
                    </div>
                    <p className="text-[11px] text-red-200 leading-relaxed pl-6">
                      {verificationError}
                    </p>
                  </div>
                )}

                {/* Verify & Unlock Access Button */}
                <button
                  type="button"
                  onClick={handleVerifyAndProceed}
                  disabled={verifyingPayment}
                  className="w-full bg-[#fed618] hover:bg-[#ffe14d] text-black font-black uppercase text-sm py-3.5 px-6 rounded-2xl border-3 border-black brutal-shadow brutal-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  {verifyingPayment ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>
                        {aiAuditStep === 0 && "Verifying Bank Reference Number..."}
                        {aiAuditStep === 1 && "Validating Transfer Details..."}
                        {aiAuditStep === 2 && "Activating Student Pass..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-black" />
                      <span>Verify Reference & Unlock UniMate →</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secure Footer */}
              <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] text-neutral-400">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Maybank Official Account (UniMate Official)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400 font-medium">
                  <span>Student Guaranteed</span>
                  <span>•</span>
                  <span>Instant Verification</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
