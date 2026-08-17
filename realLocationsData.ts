/**
 * Comprehensive Real-Life Locations on the Map in Klang Valley & Malaysia
 * Includes Universities & Campuses, Hangout Spots & Malls, and Student Residences & Condominiums.
 */

export interface RealLocationOption {
  id: string;
  name: string;
  category: "Campus" | "Mall" | "Residence";
  address: string;
  area: string;
  lat: number;
  lng: number;
  description: string;
  popularForStudents?: boolean;
}

export const REAL_LOCATIONS_DATABASE: RealLocationOption[] = [
  // =========================================================================
  // 1. UNIVERSITIES & HIGHER EDUCATION CAMPUSES
  // =========================================================================
  {
    id: "campus-um",
    name: "Universiti Malaya (UM) Main Campus",
    category: "Campus",
    address: "Jalan Universiti, 50603 Kuala Lumpur",
    area: "Lembah Pantai / Bangsar South",
    lat: 3.1209,
    lng: 101.6538,
    description: "Malaysia's premier university. Near KJ19 Universiti LRT & KL Gateway.",
    popularForStudents: true
  },
  {
    id: "campus-sunway-uni",
    name: "Sunway University & Sunway College",
    category: "Campus",
    address: "5, Jalan Universiti, Bandar Sunway, 47500 Subang Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0673,
    lng: 101.6038,
    description: "Connected to Sunway Pyramid via elevated canopy walk & BRT Sunway Lagoon.",
    popularForStudents: true
  },
  {
    id: "campus-monash",
    name: "Monash University Malaysia",
    category: "Campus",
    address: "Jalan Lagoon Selatan, Bandar Sunway, 47500 Subang Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0648,
    lng: 101.6015,
    description: "Linked directly to SB4 SunMed BRT Station & Sunway Geo Avenue.",
    popularForStudents: true
  },
  {
    id: "campus-taylors",
    name: "Taylor's University Lakeside Campus",
    category: "Campus",
    address: "1, Jalan Taylors, 47500 Subang Jaya, Selangor",
    area: "Subang Jaya",
    lat: 3.0645,
    lng: 101.6171,
    description: "Lakeside student campus with shuttle buses to SS15 LRT and Sunway Pyramid.",
    popularForStudents: true
  },
  {
    id: "campus-tarumt",
    name: "Tunku Abdul Rahman UMT (TAR UMT)",
    category: "Campus",
    address: "Jalan Genting Kelang, Setapak, 53300 Kuala Lumpur",
    area: "Setapak / Wangsa Maju",
    lat: 3.2155,
    lng: 101.7289,
    description: "Main TAR UMT Setapak campus, connected via KJ10 Taman Melati & KJ11 Gombak feeder buses.",
    popularForStudents: true
  },
  {
    id: "campus-apu",
    name: "Asia Pacific University (APU)",
    category: "Campus",
    address: "Jalan Teknologi 5, Technology Park Malaysia, 57000 Bukit Jalil, Kuala Lumpur",
    area: "Bukit Jalil / TPM",
    lat: 3.0556,
    lng: 101.6997,
    description: "Technology Park campus with student shuttle buses to SP17 Bukit Jalil LRT.",
    popularForStudents: true
  },
  {
    id: "campus-ukm",
    name: "Universiti Kebangsaan Malaysia (UKM)",
    category: "Campus",
    address: "Jalan Universiti, 43600 Bangi, Selangor",
    area: "Bangi / Kajang",
    lat: 2.9289,
    lng: 101.7801,
    description: "UKM main campus served by UKM KTM Komuter station & feeder shuttles.",
    popularForStudents: true
  },
  {
    id: "campus-upm",
    name: "Universiti Putra Malaysia (UPM)",
    category: "Campus",
    address: "Jalan Universiti 1, 43400 Serdang, Selangor",
    area: "Serdang",
    lat: 2.9996,
    lng: 101.7082,
    description: "Directly connected to PY34 UPM MRT Putrajaya Line Station.",
    popularForStudents: true
  },
  {
    id: "campus-iium",
    name: "International Islamic University (IIUM Gombak)",
    category: "Campus",
    address: "Jalan Gombak, 53100 Kuala Lumpur",
    area: "Gombak",
    lat: 3.2505,
    lng: 101.7345,
    description: "Gombak main campus, accessible via KJ11 Gombak LRT feeder buses.",
    popularForStudents: true
  },
  {
    id: "campus-ucsi",
    name: "UCSI University South Wing",
    category: "Campus",
    address: "1, Jalan Menara Gading, UCSI Heights, 56000 Cheras, Kuala Lumpur",
    area: "Cheras / Taman Connaught",
    lat: 3.0792,
    lng: 101.7335,
    description: "Near KG22 Taman Connaught MRT Station and famous Wednesday night market.",
    popularForStudents: true
  },
  {
    id: "campus-inti-subang",
    name: "INTI International College Subang",
    category: "Campus",
    address: "3, Jalan SS 15/8, 47500 Subang Jaya, Selangor",
    area: "Subang Jaya SS15",
    lat: 3.0762,
    lng: 101.5888,
    description: "Located right inside Subang SS15 food and cafe district, 3 mins walk to KJ20 SS15 LRT.",
    popularForStudents: true
  },
  {
    id: "campus-uniten",
    name: "Universiti Tenaga Nasional (UNITEN)",
    category: "Campus",
    address: "Jalan IKRAM-UNITEN, 43000 Kajang, Selangor",
    area: "Kajang / Serdang",
    lat: 2.9682,
    lng: 101.7291,
    description: "Main Putrajaya/Kajang campus near IOI City Mall.",
    popularForStudents: true
  },
  {
    id: "campus-mmu",
    name: "Multimedia University (MMU Cyberjaya)",
    category: "Campus",
    address: "Persiaran Multimedia, 63100 Cyberjaya, Selangor",
    area: "Cyberjaya",
    lat: 2.9279,
    lng: 101.6419,
    description: "Cyberjaya digital university hub, accessible via PY41 Cyberjaya City Centre MRT.",
    popularForStudents: true
  },
  {
    id: "campus-segi-kd",
    name: "SEGi University Kota Damansara",
    category: "Campus",
    address: "9, Jalan Teknologi, Kota Damansara, 47810 Petaling Jaya, Selangor",
    area: "Kota Damansara",
    lat: 3.1481,
    lng: 101.5779,
    description: "Directly located beside KG06 Kota Damansara MRT Station.",
    popularForStudents: true
  },
  {
    id: "campus-help-subang",
    name: "HELP University Subang 2 Campus",
    category: "Campus",
    address: "Persiaran Cakerawala, Seksyen U4, 40150 Shah Alam, Selangor",
    area: "Subang Bestari",
    lat: 3.1618,
    lng: 101.5305,
    description: "HELP Subang 2 green campus with student shuttle buses to Kwasa Sentral MRT.",
    popularForStudents: true
  },

  // =========================================================================
  // 2. MAJOR SHOPPING MALLS & RETAIL HUBS
  // =========================================================================
  {
    id: "mall-sunway-pyramid",
    name: "Sunway Pyramid Shopping Mall",
    category: "Mall",
    address: "3, Jalan PJS 11/15, Bandar Sunway, 47500 Petaling Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0733,
    lng: 101.6067,
    description: "Iconic lion head mall with ice skating, cinema, and hundreds of budget eateries.",
    popularForStudents: true
  },
  {
    id: "mall-mid-valley",
    name: "Mid Valley Megamall & The Gardens",
    category: "Mall",
    address: "Lingkaran Syed Putra, Mid Valley City, 59200 Kuala Lumpur",
    area: "Mid Valley / Bangsar",
    lat: 3.1186,
    lng: 101.6775,
    description: "Directly connected to Mid Valley KTM Station & Abdullah Hukum LRT.",
    popularForStudents: true
  },
  {
    id: "mall-1-utama",
    name: "1 Utama Shopping Centre",
    category: "Mall",
    address: "1, Lebuh Bandar Utama, Bandar Utama, 47800 Petaling Jaya, Selangor",
    area: "Bandar Utama",
    lat: 3.1502,
    lng: 101.6152,
    description: "One of the world's largest malls. Direct link to KG09 Bandar Utama MRT.",
    popularForStudents: true
  },
  {
    id: "mall-pavilion-kl",
    name: "Pavilion Kuala Lumpur",
    category: "Mall",
    address: "168, Jalan Bukit Bintang, 55100 Kuala Lumpur",
    area: "Bukit Bintang / Golden Triangle",
    lat: 3.1488,
    lng: 101.7133,
    description: "World-class retail mall in Bukit Bintang, linked via air-conditioned bridge to KLCC.",
    popularForStudents: true
  },
  {
    id: "mall-suria-klcc",
    name: "Suria KLCC & Petronas Twin Towers",
    category: "Mall",
    address: "241, Suria KLCC, Kuala Lumpur City Centre, 50088 Kuala Lumpur",
    area: "KLCC",
    lat: 3.1578,
    lng: 101.7123,
    description: "Underground pedestrian link to KJ10 KLCC LRT and KLCC Park.",
    popularForStudents: true
  },
  {
    id: "mall-trx",
    name: "The Exchange TRX",
    category: "Mall",
    address: "Persiaran TRX, Tun Razak Exchange, 55188 Kuala Lumpur",
    area: "Tun Razak Exchange",
    lat: 3.1428,
    lng: 101.7188,
    description: "New financial district mall sitting atop KG20/PY23 Tun Razak Exchange MRT interchange.",
    popularForStudents: true
  },
  {
    id: "mall-pavilion-bj",
    name: "Pavilion Bukit Jalil",
    category: "Mall",
    address: "2, Persiaran Jalil 8, Bukit Jalil, 57000 Kuala Lumpur",
    area: "Bukit Jalil",
    lat: 3.0514,
    lng: 101.6702,
    description: "Mega lifestyle mall in Bukit Jalil near International Medical University (IMU) & APU.",
    popularForStudents: true
  },
  {
    id: "mall-ioi-city",
    name: "IOI City Mall Putrajaya",
    category: "Mall",
    address: "IOI Resort City, 62502 Putrajaya, Selangor",
    area: "Putrajaya / Serdang",
    lat: 2.9701,
    lng: 101.7144,
    description: "Malaysia's largest shopping mall with Olympic ice rink and District 21 park.",
    popularForStudents: true
  },
  {
    id: "mall-sunway-velocity",
    name: "Sunway Velocity Mall",
    category: "Mall",
    address: "Lingkaran SV, Sunway Velocity, 55100 Kuala Lumpur",
    area: "Cheras / Maluri",
    lat: 3.1278,
    lng: 101.7251,
    description: "Connected to KG22 Maluri MRT/LRT and Cochrane MRT stations.",
    popularForStudents: true
  },
  {
    id: "mall-mytown",
    name: "MyTOWN Shopping Centre & IKEA Cheras",
    category: "Mall",
    address: "6, Jalan Cochrane, Seksyen 90, 55100 Kuala Lumpur",
    area: "Cheras / Cochrane",
    lat: 3.1362,
    lng: 101.7229,
    description: "Direct underground link to KG21 Cochrane MRT Station.",
    popularForStudents: true
  },
  {
    id: "mall-nu-sentral",
    name: "Nu Sentral Shopping Centre",
    category: "Mall",
    address: "201, Jalan Tun Sambanthan, Brickfields, 50470 Kuala Lumpur",
    area: "KL Sentral / Brickfields",
    lat: 3.1332,
    lng: 101.6869,
    description: "Connected directly to KL Sentral concourse and KL Monorail.",
    popularForStudents: true
  },
  {
    id: "mall-paradigm",
    name: "Paradigm Mall Petaling Jaya",
    category: "Mall",
    address: "1, Jalan SS 7/26A, Kelana Jaya, 47301 Petaling Jaya, Selangor",
    area: "Kelana Jaya",
    lat: 3.1049,
    lng: 101.5958,
    description: "Major mall in Kelana Jaya with free shuttle buses to Kelana Jaya LRT.",
    popularForStudents: true
  },
  {
    id: "mall-starling",
    name: "The Starling Mall Uptown Damansara",
    category: "Mall",
    address: "6, Jalan SS 21/37, Damansara Utama, 47400 Petaling Jaya, Selangor",
    area: "Damansara Utama (Uptown)",
    lat: 3.1345,
    lng: 101.6231,
    description: "Eco-lifestyle mall in PJ Uptown surrounded by famous student cafes and village park nasi lemak.",
    popularForStudents: true
  },

  // =========================================================================
  // 3. POPULAR STUDENT CONDOMINIUMS & RESIDENTIAL HUBS
  // =========================================================================
  {
    id: "res-nadayu28",
    name: "Nadayu 28 Residences Sunway",
    category: "Residence",
    address: "Jalan PJS 11/7, Bandar Sunway, 47500 Subang Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0702,
    lng: 101.6042,
    description: "Prime student condominium directly opposite Sunway University & Monash.",
    popularForStudents: true
  },
  {
    id: "res-sunway-geo",
    name: "Sunway Geo Residences & Geo Avenue",
    category: "Residence",
    address: "Jalan Lagoon Selatan, Bandar Sunway, 47500 Subang Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0612,
    lng: 101.6120,
    description: "High-end student apartments linked via skybridge to Sunway Medical & Monash.",
    popularForStudents: true
  },
  {
    id: "res-pacific-place",
    name: "Pacific Place @ Ara Damansara",
    category: "Residence",
    address: "Jalan PJU 1A/4A, Ara Damansara, 47301 Petaling Jaya, Selangor",
    area: "Ara Damansara",
    lat: 3.1118,
    lng: 101.5861,
    description: "Massive student residential block 2 mins walk to KJ26 Lembah Subang LRT.",
    popularForStudents: true
  },
  {
    id: "res-south-view",
    name: "South View Serviced Apartments",
    category: "Residence",
    address: "Jalan Kerinchi, Bangsar South, 59200 Kuala Lumpur",
    area: "Bangsar South / Kerinchi",
    lat: 3.1129,
    lng: 101.6668,
    description: "Popular residence for Universiti Malaya (UM) and BAC students, near KJ18 Kerinchi LRT.",
    popularForStudents: true
  },
  {
    id: "res-pv128",
    name: "Platinum Lake PV128 / PV15 / PV16 Setapak",
    category: "Residence",
    address: "128, Jalan Genting Kelang, Danau Kota, 53300 Kuala Lumpur",
    area: "Setapak / Danau Kota",
    lat: 3.2012,
    lng: 101.7185,
    description: "The primary off-campus residential and food cluster for TAR UMT (TARC) students.",
    popularForStudents: true
  },
  {
    id: "res-parkhill",
    name: "Parkhill Residence Bukit Jalil",
    category: "Residence",
    address: "Technology Park Malaysia, 57000 Bukit Jalil, Kuala Lumpur",
    area: "Bukit Jalil",
    lat: 3.0569,
    lng: 101.6912,
    description: "Covered 400m walkway to SP17 Bukit Jalil LRT, popular among APU and IMU students.",
    popularForStudents: true
  },
  {
    id: "res-the-arc",
    name: "The Arc Cyberjaya",
    category: "Residence",
    address: "Persiaran Bestari, Cyber 11, 63000 Cyberjaya, Selangor",
    area: "Cyberjaya",
    lat: 2.9238,
    lng: 101.6375,
    description: "High-density student accommodation next to Multimedia University (MMU).",
    popularForStudents: true
  },
  {
    id: "res-arte-mk",
    name: "Arte Mont Kiara",
    category: "Residence",
    address: "Jalan Sultan Haji Ahmad Shah, Kompleks Kerajaan, 50480 Kuala Lumpur",
    area: "Mont Kiara / Dutamas",
    lat: 3.1762,
    lng: 101.6685,
    description: "Distinctive architecture towers near MITEC and Publika Shopping Gallery.",
    popularForStudents: false
  },
  {
    id: "res-m-vertica",
    name: "M Vertica KL City Residences",
    category: "Residence",
    address: "Jalan Cheras, Taman Maluri, 55100 Kuala Lumpur",
    area: "Cheras / Maluri",
    lat: 3.1218,
    lng: 101.7302,
    description: "Covered walkway to Maluri MRT & LRT Interchange stations.",
    popularForStudents: true
  },

  // =========================================================================
  // 4. REAL PHYSICAL STREET ADDRESSES & CIVIC LANDMARKS
  // =========================================================================
  // 4. STUDENT HUBS, FOOD SQUARES & CIVIC LANDMARKS (HANGOUT SPOTS)
  // =========================================================================
  {
    id: "addr-ss15-commercial",
    name: "SS15 Commercial Hub (Boba Street & Cafes)",
    category: "Mall",
    address: "Jalan SS 15/4 & Jalan SS 15/8, 47500 Subang Jaya, Selangor",
    area: "Subang Jaya SS15",
    lat: 3.0754,
    lng: 101.5899,
    description: "Dense student commercial square packed with student eateries, stationery, and cafes.",
    popularForStudents: true
  },
  {
    id: "addr-kl-sentral-hub",
    name: "KL Sentral Transportation Hub & Nu Sentral",
    category: "Mall",
    address: "Jalan Stesen Sentral 5, 50470 Kuala Lumpur",
    area: "KL Sentral / Brickfields",
    lat: 3.1342,
    lng: 101.6865,
    description: "Central multimodal terminal connecting LRT, MRT, Monorail, KTM, and Nu Sentral Mall.",
    popularForStudents: true
  },
  {
    id: "addr-bukit-bintang-crossing",
    name: "Bukit Bintang Crossing & Lot 10",
    category: "Mall",
    address: "Jalan Bukit Bintang & Jalan Sultan Ismail, 55100 Kuala Lumpur",
    area: "Bukit Bintang",
    lat: 3.1472,
    lng: 101.7108,
    description: "Famous pedestrian scramble crossing outside Lot 10 Hutong and Bukit Bintang MRT.",
    popularForStudents: true
  },
  {
    id: "addr-bangsar-telawi",
    name: "Jalan Telawi Bangsar Food & Cafe Square",
    category: "Mall",
    address: "Jalan Telawi 3, Bangsar Baru, 59100 Kuala Lumpur",
    area: "Bangsar",
    lat: 3.1311,
    lng: 101.6708,
    description: "Famous food, bakery, and social district in Bangsar.",
    popularForStudents: false
  },
  {
    id: "addr-sunway-medical",
    name: "Sunway Medical Centre (SunMed)",
    category: "Mall",
    address: "5, Jalan Lagoon Selatan, Bandar Sunway, 47500 Subang Jaya, Selangor",
    area: "Bandar Sunway",
    lat: 3.0658,
    lng: 101.6098,
    description: "Tertiary hospital linked directly to SB4 SunMed BRT station.",
    popularForStudents: false
  },
  {
    id: "addr-ummc-hospital",
    name: "University Malaya Medical Centre (UMMC / PPUM)",
    category: "Campus",
    address: "Jalan Universiti, Lembah Pantai, 59100 Kuala Lumpur",
    area: "Lembah Pantai / PJ",
    lat: 3.1165,
    lng: 101.6562,
    description: "Teaching hospital beside Universiti Malaya medical faculty.",
    popularForStudents: true
  },
  {
    id: "addr-klia-terminal-1",
    name: "KLIA Terminal 1 (Main Airport)",
    category: "Mall",
    address: "Kuala Lumpur International Airport, 64000 Sepang, Selangor",
    area: "Sepang",
    lat: 2.7538,
    lng: 101.7051,
    description: "Malaysia's main international airport hub for long-haul and regional flights.",
    popularForStudents: true
  },
  {
    id: "addr-klia-terminal-2",
    name: "KLIA Terminal 2 (Budget Carrier Terminal / AirAsia)",
    category: "Mall",
    address: "KLIA2 Airport Terminal, 64000 Sepang, Selangor",
    area: "Sepang",
    lat: 2.7432,
    lng: 101.6865,
    description: "Budget low-cost airport terminal linked via ERL transit train & airport express buses.",
    popularForStudents: true
  }
];
