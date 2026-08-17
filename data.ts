export interface AppBlueprint {
  appName: string;
  targetAudience: string;
  subscriptions: string;
  techStack: string;
}

export interface TerminalCommand {
  label: string;
  cmd: string;
  explanation: string;
  stage: "backend" | "frontend" | "cloud";
}

export interface MockReceiptSMS {
  title: string;
  snippet: string;
  category: string;
}

export interface TransitCommute {
  from: string;
  to: string;
  desc: string;
}

export interface PresetMealInput {
  name: string;
  description: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sodium?: number;
}

export const BLUEPRINT_DATA: AppBlueprint = {
  appName: "UniPal (Student XPRIZE Companion)",
  targetAudience: "University Students in Malaysia navigating rapidKL LRT/MRT lines (Kelana Jaya, Kajang lines) & hunting budget meals.",
  subscriptions: "Touch 'n Go eWallet & online banking FPX weekly micro-subscriptions (RM2 - RM3 / week) for high-frequency transport benefits.",
  techStack: "Flutter Frontend App (with deep links, offline first cache, System Health integrations) + Python FastAPI backend Hosted on Google Cloud Run + Firebase Firestore."
};

export const MAC_TERMINAL_STEPS: TerminalCommand[] = [
  {
    label: "Activate Virtual Environment",
    cmd: "source venv/bin/activate",
    explanation: "Isolated Python package sandbox to prevent runtime library clutter.",
    stage: "backend"
  },
  {
    label: "Install Dependencies",
    cmd: "pip install fastapi uvicorn google-genai firebase-admin pydantic",
    explanation: "Installs modern developer SDKs including the Google GenAI SDK.",
    stage: "backend"
  },
  {
    label: "Create First FastAPI App",
    cmd: "cat << 'EOF' > main.py\nfrom fastapi import FastAPI\n\napp = FastAPI(title='UniPal Backend')\n\n@app.get('/health')\ndef health():\n    return {'status': 'active', 'concession': 'Concession 50% Enabled'}\nEOF",
    explanation: "Generates your root module with concession diagnostics ready.",
    stage: "backend"
  },
  {
    label: "Run Local Python Server",
    cmd: "uvicorn main:app --reload --port 8000",
    explanation: "Launches the high-performance live-reload development server.",
    stage: "backend"
  },
  {
    label: "Initialize Flutter Project",
    cmd: "flutter create --org com.unipal unipal_app",
    explanation: "Scaffolds standard iOS/Android Flutter project architecture.",
    stage: "frontend"
  },
  {
    label: "Add Flutter Packages",
    cmd: "flutter pub add http firebase_core cloud_firestore health",
    explanation: "Adds necessary system permission APIs, network proxies, and Firebase clients.",
    stage: "frontend"
  },
  {
    label: "Authenticate GCP Project",
    cmd: "gcloud auth login && gcloud config set project unipal-xprize",
    explanation: "Connects your local terminal securely with the Google Cloud platform.",
    stage: "cloud"
  },
  {
    label: "Deploy fastapi to Cloud Run",
    cmd: "gcloud run deploy unipal-backend --source . --region asia-east1 --allow-unauthenticated",
    explanation: "Builds, containerizes and releases backend securely onto Serverless Cloud Run.",
    stage: "cloud"
  }
];

export const MOCK_SMS_TEMPLATES: MockReceiptSMS[] = [
  {
    title: "TnG eWallet Transfer (Mamak Meal)",
    snippet: "Transfer successful: RM12.80 to Restoran Ali Maju. Ref: 202606081442. Bal: RM42.10.",
    category: "Food"
  },
  {
    title: "TnG Card LRT Tap Out (Universiti LRT)",
    snippet: "LRT Transit fare deducted RM1.70. Bal: RM8.30. Transit Card rapidKL Co.",
    category: "Transport"
  }
];

export const PRESET_MEALS: PresetMealInput[] = [
  {
    name: "Nasi Lemak Ayam Goreng (Mamak style)",
    description: "Nasi Lemak coconut-infused rice with 1 fried chicken leg, full ladles of sweet sambal, half boiled egg, sliced cucumbers, roasted peanuts, and fried anchovies.",
    calories: 780,
    protein: 32,
    carbs: 85,
    fat: 34,
    sodium: 980
  },
  {
    name: "Roti Canai (2 pcs) with Yellow Dhal & Sambal",
    description: "Two pan-fried flatbreads served with mixed split pea lentil curry (dhal) and small side of spicy chili sambal onion paste.",
    calories: 620,
    protein: 16,
    carbs: 78,
    fat: 28,
    sodium: 740
  },
  {
    name: "Economy Mixed Rice (1 Meat + 1 Veg + Free Soup)",
    description: "1 scoop steamed white rice, turmeric fried chicken fillet, stir-fried garlic kangkung, and clear winter melon chicken soup.",
    calories: 560,
    protein: 34,
    carbs: 55,
    fat: 18,
    sodium: 680
  },
  {
    name: "Ban Mian / Pan Mee Soup with Poached Egg",
    description: "Handmade flat noodles in anchovy broth, minced chicken, sweet leaf mani cai, crispy fried anchovies, and runny soft-boiled egg.",
    calories: 480,
    protein: 26,
    carbs: 64,
    fat: 12,
    sodium: 820
  },
  {
    name: "2 Wholemeal Chapatis with Yellow Dhal",
    description: "Two freshly toasted dry-roasted whole wheat chapatis with rich cumin yellow dhal curry and sliced cucumber.",
    calories: 360,
    protein: 14,
    carbs: 58,
    fat: 7,
    sodium: 460
  },
  {
    name: "Hainanese Steamed Chicken Rice",
    description: "Fragrant seasoned chicken rice with sliced steamed chicken breast, cucumber slices, ginger garlic sauce, and chili dip.",
    calories: 540,
    protein: 31,
    carbs: 65,
    fat: 15,
    sodium: 720
  }
];

export const STUDENT_COMMUTES: TransitCommute[] = [
  {
    from: "KJ14 Pasar Seni (LRT)",
    to: "KJ19 Universiti (LRT)",
    desc: "Peak hours commute for students staying near Petaling Jaya / Bangsar commuting back to UM campus."
  },
  {
    from: "KG18 Muzium Negara (MRT)",
    to: "KG31 UKM (MRT)",
    desc: "Long commute from central KL Hub back to UKM campus in Bangi on Kajang MRT line."
  },
  {
    from: "KJ11 Gombak (LRT)",
    to: "KJ15 KL Sentral (LRT)",
    desc: "Common route for TAR UMT / Student housing commuters traveling to central transit hub."
  },
  {
    from: "KG22 Taman Connaught (MRT)",
    to: "KG16 Pasar Seni (MRT)",
    desc: "Commutes from dense student rental areas around Cheras (UCSI) into historic KL center."
  }
];

export interface BrandSuggestion {
  name: string;
  pronunciation: string;
  meaning: string;
  targetVibe: string;
  tagline: string;
}

export const BRAND_SUGGESTIONS: BrandSuggestion[] = [
  {
    name: "UniPal",
    pronunciation: "yoo-nee-pal",
    meaning: "The ultimate digital classmate & budget partner for Malaysian college lifelines.",
    targetVibe: "Friendly, Global, Helpful & Trustworthy",
    tagline: "Your campus buddy for cheaper travels and cleaner Mamak runs."
  },
  {
    name: "JomSiswa",
    pronunciation: "jom-sees-wa",
    meaning: "'Jom' is dynamic Malay for 'Let's Go', paired with 'Siswa' meaning university student.",
    targetVibe: "Vibrant, Energetic, Hyper-Local & Community-Centered",
    tagline: "Jom save on rides, log food macros, and conquer university life."
  },
  {
    name: "SiswaBuddy",
    pronunciation: "sees-wa-buh-dee",
    meaning: "Crosses localized 'Siswa' (student) with 'Buddy', positioning the app as a true co-pilot.",
    targetVibe: "Approachable, Practical, Empathetic & Smart",
    tagline: "The daily co-pilot tracking your sleep, budget, and LRT transit."
  },
  {
    name: "UniRinggit",
    pronunciation: "yoo-nee-ring-git",
    meaning: "Directly relates university lifestyle with Malaysian currency ('Ringgit' - RM).",
    targetVibe: "Finance-First, Clever, Budget-focused & Clean",
    tagline: "Stretch your student allowance from LRT taps to economy rice plates."
  },
  {
    name: "KawanUni",
    pronunciation: "ka-wan-yoo-nee",
    meaning: "'Kawan' is Malay for friend or companion. A 100% organic local adaptation of UniPal.",
    targetVibe: "Empathetic, Warm, Warm-toned & Support-Driven",
    tagline: "Best friend of rapidKL student commuters and night-study fuel loggers."
  },
  {
    name: "UniLaju",
    pronunciation: "yoo-nee-lah-joo",
    meaning: "'Laju' means rapid or fast in Malay. Excellent tribute to the LRT/MRT speed focus.",
    targetVibe: "High-performance, Modern, Tech-Vibe & Efficient",
    tagline: "Fast pricing estimates, instant receipt scanning, and smooth tracking."
  }
];

export const MALAYSIAN_UNIVERSITIES = [
  { id: "um", name: "Universiti Malaya (UM)", shortCode: "UM", campusStation: "KJ19 Universiti (LRT)" },
  { id: "ukm", name: "Universiti Kebangsaan Malaysia (UKM)", shortCode: "UKM", campusStation: "KB06 UKM (KTM)" },
  { id: "upm", name: "Universiti Putra Malaysia (UPM)", shortCode: "UPM", campusStation: "PY34 UPM (MRT Putrajaya Line)" },
  { id: "uitm", name: "Universiti Teknologi MARA (UiTM Shah Alam)", shortCode: "UiTM", campusStation: "KD11 Padang Jawa (KTM)" },
  { id: "sunway", name: "Sunway University / College", shortCode: "Sunway", campusStation: "SB4 SunMed (BRT Sunway Line)" },
  { id: "taylors", name: "Taylor's University Lakeside", shortCode: "Taylor's", campusStation: "SB5 SunU-Monash (BRT) / KJ20 SS15" },
  { id: "monash", name: "Monash University Malaysia", shortCode: "Monash", campusStation: "SB5 SunU-Monash (BRT)" },
  { id: "utar", name: "Universiti Tunku Abdul Rahman (UTAR Sg Long)", shortCode: "UTAR", campusStation: "KG29 Bukit Dukung (MRT)" },
  { id: "apu", name: "Asia Pacific University (APU)", shortCode: "APU", campusStation: "SP18 Bukit Jalil (LRT Sri Petaling)" },
  { id: "mmu", name: "Multimedia University (MMU Cyberjaya)", shortCode: "MMU", campusStation: "PY41 Cyberjaya City Centre (MRT)" },
  { id: "usm", name: "Universiti Sains Malaysia (USM)", shortCode: "USM", campusStation: "Bukit Jambul Hub" },
  { id: "utm", name: "Universiti Teknologi Malaysia (UTM KL)", shortCode: "UTM", campusStation: "KJ8 Damai (LRT Kelana Jaya)" },
  { id: "other", name: "Other University / College / Poly / Institute", shortCode: "Other", campusStation: "" }
];

export const DEFAULT_USER: any = {
  id: "usr-01",
  name: "Amirah Zulkifli",
  email: "amirah.z@siswa.um.edu.my",
  studentId: "UM220491",
  nationality: "Malaysian",
  university: "Universiti Malaya (UM)",
  faculty: "Faculty of Computer Science & Information Technology",
  yearOfStudy: "Year 2 (Undergraduate)",
  monthlyBudget: 850,
  dailyFoodBudget: 20,
  hasRapidKlConcession: true,
  concessionExpiry: "Nov 2026",
  homeStation: "KJ14 Pasar Seni (LRT)",
  campusStation: "KJ19 Universiti (LRT)",
  avatarColor: "#fb7185",
  createdAt: "2026-03-01"
};

export const CAMPUS_HACKS = [
  {
    id: "hack-1",
    tag: "TRANSIT PERK",
    color: "#38bdf8",
    title: "RapidKL My50 Unlimited Pass",
    desc: "For RM50/month (RM1.67/day), get unlimited rides on LRT, MRT, Monorail & BRT across campus transit lines (Malaysian citizens only with MyKad)."
  },
  {
    id: "hack-2",
    tag: "STUDENT CONCESSION",
    color: "#fed618",
    title: "50% Off Touch 'n Go Student Card",
    desc: "Malaysian students with valid MyKad & matriculation get 50% discount on single token and cashless RapidKL rail/bus fares."
  },
  {
    id: "hack-3",
    tag: "CAMPUS FOOD HACK",
    color: "#4ade80",
    title: "Economy Rice (Nasi Campur) Rule",
    desc: "Take 1 carb + 1 vege + 1 chicken drumstick for ~RM7.50 at campus cafes vs RM16+ on delivery apps."
  },
  {
    id: "hack-4",
    tag: "EPAYMENT SAVINGS",
    color: "#fb7185",
    title: "TnG eWallet Student Vouchers",
    desc: "Check the 'A+ Rewards' tab in Touch 'n Go eWallet every Monday for RM2-RM5 off FamilyMart, Zus Coffee & Tealive."
  }
];


