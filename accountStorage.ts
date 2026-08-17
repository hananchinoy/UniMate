import { UserProfile } from "./types";
import { MALAYSIAN_UNIVERSITIES } from "./data";

export const normalizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  // Strip spaces, hyphens, brackets, dots
  let cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
  if (cleaned.startsWith("+60")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("60") && cleaned.length >= 11 && cleaned.startsWith("601")) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned;
};

// RFC-compliant and domain-checked email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string; normalized: string } => {
  const normalized = (email || "").trim().toLowerCase();
  
  if (!normalized) {
    return { isValid: false, error: "Email address is required.", normalized: "" };
  }
  
  if (normalized.length < 5) {
    return { isValid: false, error: "Email address is too short.", normalized };
  }
  
  if (normalized.length > 100) {
    return { isValid: false, error: "Email address is too long.", normalized };
  }

  // Regex ensuring standard local-part, @ symbol, valid domain names, and at least a 2-letter TLD
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  if (!emailRegex.test(normalized)) {
    return {
      isValid: false,
      error: "Please enter a valid email format (e.g. student@siswa.um.edu.my or name@gmail.com).",
      normalized
    };
  }

  // Check for consecutive dots
  if (normalized.includes("..")) {
    return { isValid: false, error: "Email contains consecutive dots.", normalized };
  }

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Email must contain exactly one '@' symbol.", normalized };
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) {
    return { isValid: false, error: "Email address is incomplete.", normalized };
  }

  const domainSubparts = domainPart.split(".");
  const tld = domainSubparts[domainSubparts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, error: "Email must have a valid top-level domain (e.g. .edu.my, .my, .com).", normalized };
  }

  // Check for obvious repeating dummy accounts
  if (/^(.)\1*@\1*\.\w+$/.test(normalized) || localPart === "test" && domainPart === "test.com") {
    return { isValid: false, error: "Please enter your real campus or personal email address.", normalized };
  }

  return { isValid: true, normalized };
};

// Malaysian and International phone number validation
export const validatePhoneNumber = (
  phone: string,
  nationality: "Malaysian" | "International" = "Malaysian"
): { isValid: boolean; error?: string; normalized: string } => {
  const raw = (phone || "").trim();
  if (!raw) {
    return { isValid: false, error: "Phone number is required.", normalized: "" };
  }

  const normalized = normalizePhoneNumber(raw);

  // Check if international format starting with +
  if (raw.startsWith("+") && !raw.startsWith("+60")) {
    // International phone number
    const cleanIntl = raw.replace(/[\s\-\(\)\.]/g, "");
    const intlRegex = /^\+[1-9]\d{7,14}$/;
    if (!intlRegex.test(cleanIntl)) {
      return {
        isValid: false,
        error: "Please enter a valid international phone number with country code (e.g. +62 812 3456 7890, +65 9123 4567).",
        normalized: cleanIntl
      };
    }
    // Check repeating junk
    const digitsOnly = cleanIntl.slice(1);
    if (/^(.)\1+$/.test(digitsOnly)) {
      return { isValid: false, error: "Please enter a real phone number, not repeated digits.", normalized: cleanIntl };
    }
    return { isValid: true, normalized: cleanIntl };
  }

  // Malaysian Phone Number Checks
  // Check if it consists only of digits
  if (!/^\d+$/.test(normalized)) {
    if (nationality === "International") {
      return {
        isValid: false,
        error: "Please enter a valid international number starting with '+' or a Malaysian number (01x-xxx xxxx).",
        normalized
      };
    }
    return {
      isValid: false,
      error: "Malaysian mobile number must contain digits only.",
      normalized
    };
  }

  // Must start with valid Malaysian mobile prefix: 010, 011, 012, 013, 014, 015, 016, 017, 018, 019
  const validPrefixes = ["010", "011", "012", "013", "014", "015", "016", "017", "018", "019"];
  const prefix3 = normalized.slice(0, 3);

  if (!validPrefixes.includes(prefix3)) {
    if (nationality === "International" && !normalized.startsWith("01")) {
      return {
        isValid: false,
        error: "For international numbers, please include country code starting with '+' (e.g. +65, +62, +86).",
        normalized
      };
    }
    return {
      isValid: false,
      error: "Malaysian mobile number must start with a valid prefix (010, 011, 012, 013, 014, 015, 016, 017, 018, 019).",
      normalized
    };
  }

  // Length checks:
  // 011 numbers are 10 or 11 digits (e.g. 011-1234 5678 = 11 digits)
  // Other 01x numbers are 10 or 11 digits (e.g. 012-345 6789 = 10 digits)
  if (normalized.length < 10) {
    return {
      isValid: false,
      error: `Phone number is too short (${normalized.length} digits). Malaysian mobile numbers require 10 to 11 digits (e.g. 012-345 6789).`,
      normalized
    };
  }

  if (normalized.length > 11) {
    return {
      isValid: false,
      error: `Phone number is too long (${normalized.length} digits). Malaysian mobile numbers cannot exceed 11 digits.`,
      normalized
    };
  }

  // Check repeating digits like 01111111111 or 0122222222
  const bodyDigits = normalized.slice(3);
  if (/^(.)\1+$/.test(bodyDigits)) {
    return {
      isValid: false,
      error: "Please enter a genuine phone number, not repeated dummy digits.",
      normalized
    };
  }

  // Check sequential digits like 0123456789
  if (normalized === "0123456789" || normalized === "01234567890" || normalized === "01123456789") {
    return {
      isValid: false,
      error: "Please enter your real active phone number.",
      normalized
    };
  }

  return { isValid: true, normalized };
};

const STORAGE_KEY = "unimate_registered_accounts";

export const getRegisteredAccounts = (): UserProfile[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any legacy mock seed accounts
        const realUsers = parsed.filter(
          (u) =>
            u &&
            !u.id?.startsWith("usr-seed-") &&
            u.email !== "amirah.zulkifli@siswa.um.edu.my" &&
            u.email !== "lucas.tan@imail.sunway.edu.my" &&
            u.email !== "alexander.zhang@monash.edu.my"
        );
        return realUsers;
      }
    }
  } catch (e) {
    console.warn("Could not load registered accounts:", e);
  }
  return [];
};

export const checkEmailOrPhoneTaken = (
  email: string,
  phoneNumber: string,
  excludeUserId?: string
): { emailTaken: boolean; phoneTaken: boolean; existingAccountName?: string } => {
  const accounts = getRegisteredAccounts();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = normalizePhoneNumber(phoneNumber);

  let emailTaken = false;
  let phoneTaken = false;
  let existingAccountName: string | undefined = undefined;

  for (const acc of accounts) {
    if (excludeUserId && acc.id === excludeUserId) continue;

    if (cleanEmail && acc.email.trim().toLowerCase() === cleanEmail) {
      emailTaken = true;
      existingAccountName = acc.name;
    }
    if (cleanPhone && acc.phoneNumber && normalizePhoneNumber(acc.phoneNumber) === cleanPhone) {
      phoneTaken = true;
      existingAccountName = acc.name;
    }
  }

  return { emailTaken, phoneTaken, existingAccountName };
};

export const registerAccount = (
  newUser: UserProfile
): { success: boolean; error?: string; user?: UserProfile } => {
  // 1. Thorough Email Validation
  const emailValidation = validateEmail(newUser.email);
  if (!emailValidation.isValid) {
    return { success: false, error: emailValidation.error || "Please enter a valid student email address." };
  }
  const cleanEmail = emailValidation.normalized;

  // 2. Thorough Phone Validation
  const phoneValidation = validatePhoneNumber(
    newUser.phoneNumber || "",
    newUser.nationality === "International" ? "International" : "Malaysian"
  );
  if (!phoneValidation.isValid) {
    return { success: false, error: phoneValidation.error || "Please enter a valid mobile contact number." };
  }
  const cleanPhone = phoneValidation.normalized;

  // 3. Password Validation (Compulsory)
  if (!newUser.password || newUser.password.trim().length < 6) {
    return {
      success: false,
      error: "Password is compulsory. Please provide a password with at least 6 characters."
    };
  }

  const { emailTaken, phoneTaken } = checkEmailOrPhoneTaken(cleanEmail, cleanPhone, newUser.id);

  if (emailTaken) {
    return {
      success: false,
      error: `An account with the email "${newUser.email}" is already registered. Please sign in or use a different email.`
    };
  }

  if (phoneTaken) {
    return {
      success: false,
      error: `An account with the phone number "${newUser.phoneNumber}" is already registered. Each phone number can only be linked to one account.`
    };
  }

  const accounts = getRegisteredAccounts();
  const updatedAccounts = [...accounts, { ...newUser, email: cleanEmail, phoneNumber: cleanPhone, password: newUser.password.trim() }];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
  } catch (e) {
    console.warn("Could not save new registered account:", e);
  }

  // Also sync to server database endpoint asynchronously
  try {
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newUser, email: cleanEmail, phoneNumber: cleanPhone, password: newUser.password.trim() })
    }).catch(() => {});
  } catch (e) {
    // Non-blocking
  }

  return { success: true, user: { ...newUser, email: cleanEmail, phoneNumber: cleanPhone, password: newUser.password.trim() } };
};

export const loginAccount = (
  identifier: string,
  password?: string
): { success: boolean; error?: string; user?: UserProfile } => {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = normalizePhoneNumber(identifier);
  const accounts = getRegisteredAccounts();

  if (!identifier.trim()) {
    return {
      success: false,
      error: "Please enter your registered email or phone number."
    };
  }

  if (!password || !password.trim()) {
    return {
      success: false,
      error: "Password is compulsory. Please enter your account password."
    };
  }

  const matched = accounts.find((acc) => {
    const emailMatch = acc.email.trim().toLowerCase() === cleanId;
    const phoneMatch = acc.phoneNumber && normalizePhoneNumber(acc.phoneNumber) === cleanPhone;
    return emailMatch || phoneMatch;
  });

  if (!matched) {
    return {
      success: false,
      error: `No registered student account found for "${identifier}". You must log in with a valid registered account or create a new one.`
    };
  }

  // Compulsory Password Verification
  if (matched.password && matched.password !== password.trim()) {
    return {
      success: false,
      error: "Incorrect password. Please verify your password and try again."
    };
  }

  // Ensure subscription is active
  if (matched.subscriptionStatus !== "active") {
    return {
      success: false,
      error: "This student membership is inactive or unpaid. Please complete your registration and pass checkout."
    };
  }

  return { success: true, user: matched };
};
