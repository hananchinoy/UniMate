/**
 * Comprehensive Klang Valley & Malaysian University Transit Stations
 * Includes LRT, MRT, Monorail, BRT, KTM lines, university campuses & landmarks
 * with accurate coordinates, line identifiers, and student context.
 */

export interface TransitStation {
  id: string;
  code: string;
  name: string;
  fullName: string;
  line: string;
  lineCategory: "LRT_KJ" | "MRT_KG" | "MRT_PY" | "LRT_SP" | "BRT_SB" | "KL_MONORAIL" | "KTM_KOMUTER" | "CAMPUS";
  lineColor: string;
  lat: number;
  lng: number;
  area: string;
  nearbyUniversity?: string;
  isInterchange?: boolean;
  interchangeWith?: string[];
  description?: string;
  popularForStudents?: boolean;
}

export const TRANSIT_STATIONS: TransitStation[] = [
  // ==========================================
  // 1. LRT KELANA JAYA LINE (Red / Crimson)
  // ==========================================
  {
    id: "kj-19",
    code: "KJ19",
    name: "Universiti",
    fullName: "KJ19 Universiti (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1147,
    lng: 101.6617,
    area: "Bangsar South / Pantai",
    nearbyUniversity: "Universiti Malaya (UM) & KL Gateway",
    isInterchange: false,
    description: "Main transit gateway for Universiti Malaya (UM) students. Shuttle buses connect directly to campus faculties.",
    popularForStudents: true
  },
  {
    id: "kj-14",
    code: "KJ14",
    name: "Pasar Seni",
    fullName: "KJ14 Pasar Seni (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1425,
    lng: 101.6961,
    area: "Chinatown / Central KL",
    nearbyUniversity: "Central Market, SEGi College KL",
    isInterchange: true,
    interchangeWith: ["KG16 Pasar Seni (MRT Kajang)"],
    description: "Major central interchange hub connecting LRT Kelana Jaya line directly to MRT Kajang line.",
    popularForStudents: true
  },
  {
    id: "kj-15",
    code: "KJ15",
    name: "KL Sentral",
    fullName: "KJ15 KL Sentral (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1342,
    lng: 101.6865,
    area: "Brickfields / KL Sentral",
    nearbyUniversity: "Brickfields Asia College (BAC), Methodist College",
    isInterchange: true,
    interchangeWith: ["MR1 KL Monorail", "KG15 Muzium Negara (MRT)", "KTM Komuter", "ERL Airport Express"],
    description: "Malaysia's largest public transportation hub connecting all rail networks.",
    popularForStudents: true
  },
  {
    id: "kj-20",
    code: "KJ20",
    name: "SS15",
    fullName: "KJ20 SS15 (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.0760,
    lng: 101.5901,
    area: "Subang Jaya SS15",
    nearbyUniversity: "Taylor's Uni, INTI College, Sunway Uni",
    isInterchange: false,
    description: "Heart of Subang Jaya student district, famous for cafes, boba street, and study spots.",
    popularForStudents: true
  },
  {
    id: "kj-28",
    code: "KJ28",
    name: "USJ 7",
    fullName: "KJ28 USJ 7 (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.0545,
    lng: 101.5925,
    area: "Subang USJ",
    nearbyUniversity: "Sunway University & Monash (via BRT)",
    isInterchange: true,
    interchangeWith: ["SB7 USJ 7 (BRT Sunway)"],
    description: "Interchange connecting Kelana Jaya rail line with the BRT Sunway elevated busway.",
    popularForStudents: true
  },
  {
    id: "kj-11",
    code: "KJ11",
    name: "Gombak",
    fullName: "KJ11 Gombak (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.2312,
    lng: 101.7247,
    area: "Gombak / Setapak",
    nearbyUniversity: "TAR UMT (Tunku Abdul Rahman UMT), IIUM Gombak",
    isInterchange: false,
    description: "Northern terminus for students living around Setapak and IIUM / TAR UMT campuses.",
    popularForStudents: true
  },
  {
    id: "kj-10",
    code: "KJ10",
    name: "Taman Melati",
    fullName: "KJ10 Taman Melati (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.2238,
    lng: 101.7208,
    area: "Setapak",
    nearbyUniversity: "TAR UMT (Direct Shuttle Buses)",
    isInterchange: false,
    description: "Primary student transit station for TAR UMT (TARC) university students.",
    popularForStudents: true
  },
  {
    id: "kj-13",
    code: "KJ13",
    name: "Masjid Jamek",
    fullName: "KJ13 Masjid Jamek (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1495,
    lng: 101.6965,
    area: "Historic KL",
    nearbyUniversity: "City Uni KL, Victoria Institution",
    isInterchange: true,
    interchangeWith: ["AG7/SP7 Masjid Jamek (Sri Petaling/Ampang Line)"],
    description: "Major downtown interchange between Kelana Jaya and Sri Petaling/Ampang LRT lines.",
    popularForStudents: true
  },
  {
    id: "kj-10-klcc",
    code: "KJ10",
    name: "KLCC",
    fullName: "KJ10 KLCC (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1593,
    lng: 101.7138,
    area: "KLCC City Centre",
    nearbyUniversity: "Petronas Twin Towers, Suria KLCC",
    isInterchange: false,
    description: "Petronas Twin Towers station, premier study library & bookstore access.",
    popularForStudents: false
  },
  {
    id: "kj-18",
    code: "KJ18",
    name: "Kerinchi",
    fullName: "KJ18 Kerinchi (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1158,
    lng: 101.6687,
    area: "Bangsar South",
    nearbyUniversity: "Universiti Malaya Medical Centre (UMMC)",
    isInterchange: false,
    description: "Serves Bangsar South student apartments and UMMC medical student hostel.",
    popularForStudents: true
  },
  {
    id: "kj-22",
    code: "KJ22",
    name: "Taman Jaya",
    fullName: "KJ22 Taman Jaya (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1042,
    lng: 101.6543,
    area: "Petaling Jaya Section 52",
    nearbyUniversity: "Amity Global Institute, PJ New Town",
    isInterchange: false,
    description: "Opposite Amcorp Mall, popular flea market and student library access.",
    popularForStudents: false
  },
  {
    id: "kj-24",
    code: "KJ24",
    name: "Kelana Jaya",
    fullName: "KJ24 Kelana Jaya (LRT)",
    line: "Kelana Jaya LRT",
    lineCategory: "LRT_KJ",
    lineColor: "#e11d48",
    lat: 3.1128,
    lng: 101.6038,
    area: "Kelana Jaya / SS4",
    nearbyUniversity: "Lincoln University College",
    isInterchange: false,
    description: "Major bus hub connecting Sunway Pyramid and Damansara Utama student feeder buses.",
    popularForStudents: true
  },

  // ==========================================
  // 2. MRT KAJANG LINE (Emerald Green)
  // ==========================================
  {
    id: "kg-31",
    code: "KG31",
    name: "Kajang (UKM Gateway)",
    fullName: "KG31 Kajang (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 2.9830,
    lng: 101.7905,
    area: "Kajang / Bangi",
    nearbyUniversity: "Universiti Kebangsaan Malaysia (UKM)",
    isInterchange: true,
    interchangeWith: ["KB06 Kajang (KTM Komuter)"],
    description: "Southern hub for UKM Bangi students with KTM Komuter cross-platform transfers.",
    popularForStudents: true
  },
  {
    id: "kg-16",
    code: "KG16",
    name: "Pasar Seni MRT",
    fullName: "KG16 Pasar Seni (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.1425,
    lng: 101.6961,
    area: "Chinatown / Central KL",
    nearbyUniversity: "Central KL Colleges",
    isInterchange: true,
    interchangeWith: ["KJ14 Pasar Seni (LRT Kelana Jaya)"],
    description: "Underground interchange linking Kajang MRT directly to Kelana Jaya LRT.",
    popularForStudents: true
  },
  {
    id: "kg-18",
    code: "KG18",
    name: "Muzium Negara",
    fullName: "KG18 Muzium Negara (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.1378,
    lng: 101.6876,
    area: "KL Sentral Hub",
    nearbyUniversity: "BAC, Methodist College",
    isInterchange: true,
    interchangeWith: ["KJ15 KL Sentral (LRT)", "KTM Komuter", "Monorail"],
    description: "Underground pedestrian linked to KL Sentral concourse (200m walkway).",
    popularForStudents: true
  },
  {
    id: "kg-22",
    code: "KG22",
    name: "Taman Connaught",
    fullName: "KG22 Taman Connaught (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.0789,
    lng: 101.7454,
    area: "Cheras / Connaught",
    nearbyUniversity: "UCSI University South Wing",
    isInterchange: false,
    description: "Prime station for UCSI University students and Connaught Night Market commuters.",
    popularForStudents: true
  },
  {
    id: "kg-29",
    code: "KG29",
    name: "Bukit Dukung",
    fullName: "KG29 Bukit Dukung (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.0274,
    lng: 101.7719,
    area: "Sungai Long / Kajang",
    nearbyUniversity: "UTAR Sungai Long Campus (RapidKL T415 Bus)",
    isInterchange: false,
    description: "Main feeder bus hub for UTAR Sg Long university students.",
    popularForStudents: true
  },
  {
    id: "kg-20",
    code: "KG20",
    name: "Tun Razak Exchange (TRX)",
    fullName: "KG20 Tun Razak Exchange (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.1428,
    lng: 101.7196,
    area: "TRX Financial District",
    nearbyUniversity: "The Exchange TRX, INCEIF University",
    isInterchange: true,
    interchangeWith: ["PY23 TRX (MRT Putrajaya Line)"],
    description: "Central underground interchange linking Kajang MRT and Putrajaya MRT lines.",
    popularForStudents: true
  },
  {
    id: "kg-09",
    code: "KG09",
    name: "Bandar Utama",
    fullName: "KG09 Bandar Utama (MRT)",
    line: "MRT Kajang Line",
    lineCategory: "MRT_KG",
    lineColor: "#059669",
    lat: 3.1504,
    lng: 101.6146,
    area: "Damansara / Bandar Utama",
    nearbyUniversity: "First City University College",
    isInterchange: true,
    description: "Direct bridge into 1 Utama Shopping Centre and student housing in Damansara.",
    popularForStudents: true
  },

  // ==========================================
  // 3. MRT PUTRAJAYA LINE (Amber / Gold)
  // ==========================================
  {
    id: "py-34",
    code: "PY34",
    name: "UPM",
    fullName: "PY34 UPM (MRT Putrajaya Line)",
    line: "MRT Putrajaya Line",
    lineCategory: "MRT_PY",
    lineColor: "#d97706",
    lat: 3.0034,
    lng: 101.7082,
    area: "Serdang / UPM",
    nearbyUniversity: "Universiti Putra Malaysia (UPM)",
    isInterchange: false,
    description: "Dedicated campus station for Universiti Putra Malaysia students and faculty.",
    popularForStudents: true
  },
  {
    id: "py-41",
    code: "PY41",
    name: "Cyberjaya City Centre",
    fullName: "PY41 Cyberjaya City Centre (MRT)",
    line: "MRT Putrajaya Line",
    lineCategory: "MRT_PY",
    lineColor: "#d97706",
    lat: 2.9238,
    lng: 101.6669,
    area: "Cyberjaya Tech Hub",
    nearbyUniversity: "Multimedia University (MMU), University of Cyberjaya",
    isInterchange: false,
    description: "High-tech student transit for MMU and Cyberjaya tech universities.",
    popularForStudents: true
  },
  {
    id: "py-42",
    code: "PY42",
    name: "Putrajaya Sentral",
    fullName: "PY42 Putrajaya Sentral (MRT)",
    line: "MRT Putrajaya Line",
    lineCategory: "MRT_PY",
    lineColor: "#d97706",
    lat: 2.9327,
    lng: 101.6702,
    area: "Putrajaya Precinct 7",
    nearbyUniversity: "Heriot-Watt University Malaysia, UNITEN",
    isInterchange: true,
    interchangeWith: ["ERL KLIA Transit", "Putrajaya Intercity Bus Terminal"],
    description: "Major southern transport terminal for administrative capital & university buses.",
    popularForStudents: true
  },
  {
    id: "py-27",
    code: "PY27",
    name: "Kuchai",
    fullName: "PY27 Kuchai (MRT)",
    line: "MRT Putrajaya Line",
    lineCategory: "MRT_PY",
    lineColor: "#d97706",
    lat: 3.0883,
    lng: 101.6918,
    area: "Kuchai Lama",
    nearbyUniversity: "Student apartments & night food eateries",
    isInterchange: false,
    description: "Popular student residential hub with affordable housing and food options.",
    popularForStudents: false
  },

  // ==========================================
  // 4. BRT SUNWAY LINE (Teal / Cyan)
  // ==========================================
  {
    id: "sb-4",
    code: "SB4",
    name: "SunMed",
    fullName: "SB4 SunMed (BRT Sunway Line)",
    line: "BRT Sunway Line",
    lineCategory: "BRT_SB",
    lineColor: "#0d9488",
    lat: 3.0658,
    lng: 101.6105,
    area: "Bandar Sunway",
    nearbyUniversity: "Sunway University & Sunway College",
    isInterchange: false,
    description: "Direct elevated walkway into Sunway Medical Centre and Sunway University campus.",
    popularForStudents: true
  },
  {
    id: "sb-5",
    code: "SB5",
    name: "SunU-Monash",
    fullName: "SB5 SunU-Monash (BRT)",
    line: "BRT Sunway Line",
    lineCategory: "BRT_SB",
    lineColor: "#0d9488",
    lat: 3.0635,
    lng: 101.6028,
    area: "Bandar Sunway",
    nearbyUniversity: "Monash University Malaysia & Sunway University",
    isInterchange: false,
    description: "Prime university station located directly in front of Monash Malaysia gate.",
    popularForStudents: true
  },
  {
    id: "sb-1",
    code: "SB1",
    name: "Setia Jaya",
    fullName: "SB1 Setia Jaya (BRT)",
    line: "BRT Sunway Line",
    lineCategory: "BRT_SB",
    lineColor: "#0d9488",
    lat: 3.0825,
    lng: 101.6110,
    area: "Bandar Sunway / PJ",
    nearbyUniversity: "Sunway Education Hub Gateway",
    isInterchange: true,
    interchangeWith: ["KD08 Setia Jaya (KTM Komuter)"],
    description: "Interchange connecting KTM Komuter Klang-Port line to the Sunway BRT elevated busway.",
    popularForStudents: true
  },
  {
    id: "sb-7",
    code: "SB7",
    name: "USJ 7 BRT",
    fullName: "SB7 USJ 7 (BRT Sunway)",
    line: "BRT Sunway Line",
    lineCategory: "BRT_SB",
    lineColor: "#0d9488",
    lat: 3.0545,
    lng: 101.5925,
    area: "Subang USJ",
    nearbyUniversity: "Sunway / Monash Commuters",
    isInterchange: true,
    interchangeWith: ["KJ28 USJ 7 (LRT Kelana Jaya)"],
    description: "Western terminus of BRT connecting to Kelana Jaya LRT line.",
    popularForStudents: true
  },

  // ==========================================
  // 5. LRT SRI PETALING & AMPANG LINES (Maroon)
  // ==========================================
  {
    id: "sp-18",
    code: "SP18",
    name: "Bukit Jalil",
    fullName: "SP18 Bukit Jalil (LRT Sri Petaling)",
    line: "LRT Sri Petaling Line",
    lineCategory: "LRT_SP",
    lineColor: "#92400e",
    lat: 3.0583,
    lng: 101.6917,
    area: "Bukit Jalil / Technology Park",
    nearbyUniversity: "Asia Pacific University (APU), International Medical University (IMU)",
    isInterchange: false,
    description: "Main transit stop for APU and IMU medical students with university shuttle pick-ups.",
    popularForStudents: true
  },
  {
    id: "sp-16",
    code: "SP16",
    name: "Bandar Tasik Selatan (TBS)",
    fullName: "SP16 Bandar Tasik Selatan (LRT)",
    line: "LRT Sri Petaling Line",
    lineCategory: "LRT_SP",
    lineColor: "#92400e",
    lat: 3.0763,
    lng: 101.7118,
    area: "Cheras / TBS",
    nearbyUniversity: "National Defence University of Malaysia (UPNM)",
    isInterchange: true,
    interchangeWith: ["KB04 KTM Komuter", "ERL KLIA Transit", "Terminal Bersepadu Selatan (TBS)"],
    description: "Malaysia's premier interstate bus terminal and four-railway multimodal hub.",
    popularForStudents: true
  },
  {
    id: "sp-07",
    code: "SP7",
    name: "Masjid Jamek (Sri Petaling)",
    fullName: "SP7 Masjid Jamek (LRT)",
    line: "LRT Sri Petaling Line",
    lineCategory: "LRT_SP",
    lineColor: "#92400e",
    lat: 3.1495,
    lng: 101.6965,
    area: "Historic KL",
    nearbyUniversity: "Downtown Colleges",
    isInterchange: true,
    interchangeWith: ["KJ13 Masjid Jamek (LRT Kelana Jaya)"],
    description: "Core central transfer between Ampang/Sri Petaling and Kelana Jaya lines.",
    popularForStudents: false
  },

  // ==========================================
  // 6. KTM KOMUTER LINES (Sky Blue)
  // ==========================================
  {
    id: "kb-06",
    code: "KB06",
    name: "UKM Bangi (KTM)",
    fullName: "KB06 UKM (KTM Komuter)",
    line: "KTM Komuter Seremban Line",
    lineCategory: "KTM_KOMUTER",
    lineColor: "#0284c7",
    lat: 2.9312,
    lng: 101.7925,
    area: "Bangi / UKM",
    nearbyUniversity: "Universiti Kebangsaan Malaysia (UKM)",
    isInterchange: false,
    description: "Located right at the main entrance gate of UKM Bangi campus.",
    popularForStudents: true
  },
  {
    id: "kd-11",
    code: "KD11",
    name: "Padang Jawa (KTM)",
    fullName: "KD11 Padang Jawa (KTM)",
    line: "KTM Komuter Port Klang Line",
    lineCategory: "KTM_KOMUTER",
    lineColor: "#0284c7",
    lat: 3.0562,
    lng: 101.4912,
    area: "Shah Alam",
    nearbyUniversity: "Universiti Teknologi MARA (UiTM Shah Alam)",
    isInterchange: false,
    description: "Main rail stop for UiTM Shah Alam students (5 mins via campus bus / Grab).",
    popularForStudents: true
  },
  {
    id: "kb-05",
    code: "KB05",
    name: "Serdang (KTM)",
    fullName: "KB05 Serdang (KTM)",
    line: "KTM Komuter Seremban Line",
    lineCategory: "KTM_KOMUTER",
    lineColor: "#0284c7",
    lat: 3.0232,
    lng: 101.7161,
    area: "Serdang / Mines",
    nearbyUniversity: "UPM & UNITEN (Feeder buses)",
    isInterchange: false,
    description: "Convenient rail link near The Mines Shopping Mall and UPM Serdang.",
    popularForStudents: true
  },

  // ==========================================
  // 7. KL MONORAIL (Light Green)
  // ==========================================
  {
    id: "mr-06",
    code: "MR6",
    name: "Bukit Bintang",
    fullName: "MR6 Bukit Bintang (Monorail)",
    line: "KL Monorail Line",
    lineCategory: "KL_MONORAIL",
    lineColor: "#65a30d",
    lat: 3.1465,
    lng: 101.7115,
    area: "Bukit Bintang / Golden Triangle",
    nearbyUniversity: "Pavilion KL, Plaza Low Yat, Berjaya Times Square",
    isInterchange: true,
    interchangeWith: ["KG18A Bukit Bintang (MRT Kajang)"],
    description: "Bustling youth shopping, electronics, tech hub, and dining central.",
    popularForStudents: true
  },

  // ==========================================
  // 8. CAMPUS LANDMARKS & UNIVERSITY GATES
  // ==========================================
  {
    id: "campus-um",
    code: "UM",
    name: "Universiti Malaya (UM Gate / Library)",
    fullName: "Universiti Malaya (UM Main Campus)",
    line: "University Campus Hub",
    lineCategory: "CAMPUS",
    lineColor: "#623bff",
    lat: 3.1209,
    lng: 101.6538,
    area: "Kuala Lumpur",
    nearbyUniversity: "Universiti Malaya (UM)",
    isInterchange: false,
    description: "Main campus landmark, DTC, Central Library and Faculty of Arts & Science.",
    popularForStudents: true
  },
  {
    id: "campus-sunway",
    code: "SUNWAY",
    name: "Sunway University & College Hub",
    fullName: "Sunway University Campus (Bandar Sunway)",
    line: "University Campus Hub",
    lineCategory: "CAMPUS",
    lineColor: "#623bff",
    lat: 3.0673,
    lng: 101.6033,
    area: "Bandar Sunway",
    nearbyUniversity: "Sunway University / College",
    isInterchange: false,
    description: "Canopy walkway connects directly to Sunway Pyramid & BRT stations.",
    popularForStudents: true
  },
  {
    id: "campus-taylors",
    code: "TAYLORS",
    name: "Taylor's University Lakeside Campus",
    fullName: "Taylor's University Lakeside Campus (Subang)",
    line: "University Campus Hub",
    lineCategory: "CAMPUS",
    lineColor: "#623bff",
    lat: 3.0628,
    lng: 101.6169,
    area: "Subang Jaya",
    nearbyUniversity: "Taylor's University Lakeside",
    isInterchange: false,
    description: "Famous lakeside campus, served by shuttle buses to SS15 LRT and SunMed BRT.",
    popularForStudents: true
  },
  {
    id: "campus-utar",
    code: "UTAR",
    name: "UTAR Sungai Long Campus",
    fullName: "Universiti Tunku Abdul Rahman (UTAR Sg Long)",
    line: "University Campus Hub",
    lineCategory: "CAMPUS",
    lineColor: "#623bff",
    lat: 3.0401,
    lng: 101.7944,
    area: "Bandar Sungai Long, Kajang",
    nearbyUniversity: "UTAR Sg Long",
    isInterchange: false,
    description: "Town centre campus with rapid transit bus links to Bukit Dukung MRT.",
    popularForStudents: true
  },
  {
    id: "campus-apu",
    code: "APU",
    name: "Asia Pacific University (APU TPM)",
    fullName: "Asia Pacific University (APU Campus Technology Park)",
    line: "University Campus Hub",
    lineCategory: "CAMPUS",
    lineColor: "#623bff",
    lat: 3.0558,
    lng: 101.7005,
    area: "Bukit Jalil / Technology Park Malaysia",
    nearbyUniversity: "Asia Pacific University (APU)",
    isInterchange: false,
    description: "State-of-the-art tech campus connected via regular free shuttles to Bukit Jalil LRT.",
    popularForStudents: true
  }
];

export const POPULAR_COMMUTE_PAIRS = [
  {
    id: "pair-1",
    from: "KJ14 Pasar Seni (LRT)",
    to: "KJ19 Universiti (LRT)",
    title: "Chinatown ⇄ Universiti Malaya",
    badge: "UM Daily Commute",
    savings: "RM 12.50 vs Grab"
  },
  {
    id: "pair-2",
    from: "KJ15 KL Sentral (LRT)",
    to: "KJ20 SS15 (LRT)",
    title: "KL Sentral ⇄ Subang SS15",
    badge: "Taylor's / INTI",
    savings: "RM 18.00 vs Grab"
  },
  {
    id: "pair-3",
    from: "KG18 Muzium Negara (MRT)",
    to: "KG31 Kajang (MRT)",
    title: "KL Central ⇄ UKM Bangi",
    badge: "UKM Commute",
    savings: "RM 24.00 vs Grab"
  },
  {
    id: "pair-4",
    from: "KJ11 Gombak (LRT)",
    to: "KJ15 KL Sentral (LRT)",
    title: "Gombak / Setapak ⇄ KL Sentral",
    badge: "TAR UMT Hub",
    savings: "RM 16.50 vs Grab"
  },
  {
    id: "pair-5",
    from: "SB7 USJ 7 (BRT Sunway)",
    to: "SB4 SunMed (BRT Sunway Line)",
    title: "USJ 7 LRT ⇄ Sunway Campus",
    badge: "Sunway / Monash",
    savings: "RM 9.00 vs Grab"
  },
  {
    id: "pair-6",
    from: "KG22 Taman Connaught (MRT)",
    to: "KG16 Pasar Seni (MRT)",
    title: "UCSI Cheras ⇄ Central KL",
    badge: "UCSI Student",
    savings: "RM 14.20 vs Grab"
  },
  {
    id: "pair-7",
    from: "PY42 Putrajaya Sentral (MRT)",
    to: "PY34 UPM (MRT Putrajaya Line)",
    title: "Putrajaya ⇄ UPM Serdang",
    badge: "UPM Students",
    savings: "RM 11.00 vs Grab"
  }
];

export const TRANSIT_LINE_FILTERS = [
  { id: "ALL", label: "All Stations & Campuses", color: "#000000" },
  { id: "CAMPUS", label: "🎓 Universities", color: "#623bff" },
  { id: "LRT_KJ", label: "🔴 LRT Kelana Jaya", color: "#e11d48" },
  { id: "MRT_KG", label: "🟢 MRT Kajang", color: "#059669" },
  { id: "MRT_PY", label: "🟡 MRT Putrajaya", color: "#d97706" },
  { id: "BRT_SB", label: "🟢 BRT Sunway", color: "#0d9488" },
  { id: "LRT_SP", label: "🟤 LRT Sri Petaling", color: "#92400e" },
  { id: "KTM_KOMUTER", label: "🔵 KTM Komuter", color: "#0284c7" },
  { id: "KL_MONORAIL", label: "🟢 KL Monorail", color: "#65a30d" }
];
