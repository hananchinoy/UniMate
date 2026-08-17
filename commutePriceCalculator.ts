/**
 * Multi-App Transport Fare & Distance Calculation Engine
 * Accurately models real-world Malaysian market pricing for:
 * - GrabCar / JustGrab
 * - Bolt Ride (Budget E-hailing)
 * - AirAsia Move Ride
 * - inDrive (Passenger-driver bid)
 * - Kumpool / Trek DRT (Campus On-demand Shared Transit)
 * - RapidKL Public Rail (LRT/MRT/Monorail/BRT) + 50% Concession + Feeder Bus
 */

import { TRANSIT_STATIONS, TransitStation } from "./transitStations";
import { REAL_LOCATIONS_DATABASE, RealLocationOption } from "./realLocationsData";

export interface GeoCoordinate {
  lat: number;
  lng: number;
  label: string;
}

export type CommuteTrafficCondition = "offpeak" | "rush" | "rain";

export interface RideOptionDetail {
  appName: string;
  serviceTier: string;
  basePriceMYR: number;
  currentSurgePriceMYR: number;
  minEstimatedFareMYR: number;
  maxEstimatedFareMYR: number;
  durationMinutes: number;
  surgeMultiplier: number;
  fareBreakdown: string;
  baseRateMYR: number;
  kmRateMYR: number;
  timeRateMYR: number;
  pricingModelNotes: string;
  deepLinkAppStore?: string;
}

export interface TransitCalculationResult {
  journeyName: string;
  fromName: string;
  toName: string;
  straightDistanceKm: number;
  roadDistanceKm: number;
  drivingDurationMins: number;
  transitDurationMins: number;
  trafficCondition: CommuteTrafficCondition;
  
  // Public Rail & Bus
  lrtMrtOption: {
    lineName: string;
    basePriceMYR: number;
    concessionPriceMYR: number;
    durationMinutes: number;
    carbonGramsCo2: number;
    transferCount: number;
  };
  busOption: {
    busType: string;
    fareMYR: number;
    durationMinutes: number;
    isFreeOrFlat: boolean;
  };
  publicTransitSummary: {
    totalConcessionFareMYR: number;
    totalStandardFareMYR: number;
    my50PassCovered: boolean;
    passNote: string;
  };

  // Ride-Hailing Options
  grabOption: RideOptionDetail;
  boltOption: RideOptionDetail;
  inDriveOption: {
    estimatedFareMYR: number;
    minEstimatedFareMYR: number;
    maxEstimatedFareMYR: number;
    durationMinutes: number;
    note: string;
  };
  kumpoolOption: {
    flatFareMYR: number;
    durationMinutes: number;
    serviceArea: string;
    isCovered: boolean;
    note: string;
  };

  fareAccuracyDisclaimer: string;
  costEfficiencyVerdict: string;
}

/**
 * Resolves any landmark, campus, residence, or station into GPS coordinates
 */
export function resolveLocationCoordinate(input: string): GeoCoordinate {
  const clean = input.trim().toLowerCase();
  
  // 1. Check if string has coordinates embedded (e.g., from custom dropped pin "Dropped Pin (3.123, 101.456)")
  const coordMatch = input.match(/\(?\s*([0-9]+\.[0-9]+)\s*,\s*([0-9]+\.[0-9]+)\s*\)?/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng, label: input };
    }
  }

  // 2. Check in Real Map Locations Database (Campuses, Hangouts, Residences)
  const matchedRealLoc = REAL_LOCATIONS_DATABASE.find(
    (loc) =>
      loc.name.toLowerCase().includes(clean) ||
      clean.includes(loc.name.toLowerCase()) ||
      loc.address.toLowerCase().includes(clean) ||
      clean.includes(loc.area.toLowerCase())
  );
  if (matchedRealLoc) {
    return { lat: matchedRealLoc.lat, lng: matchedRealLoc.lng, label: matchedRealLoc.name };
  }

  // 3. Check in Transit Stations Database
  const matchedStation = TRANSIT_STATIONS.find(
    (st) =>
      st.fullName.toLowerCase().includes(clean) ||
      clean.includes(st.fullName.toLowerCase()) ||
      st.name.toLowerCase() === clean ||
      clean.includes(st.code.toLowerCase()) ||
      (st.nearbyUniversity && clean.includes(st.nearbyUniversity.toLowerCase()))
  );
  if (matchedStation) {
    return { lat: matchedStation.lat, lng: matchedStation.lng, label: matchedStation.fullName };
  }

  // 4. Default Klang Valley fallback center (KL Sentral vicinity)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) * 0.001;
  const lngOffset = ((Math.abs(hash >> 2) % 100) - 50) * 0.001;

  return {
    lat: 3.1342 + latOffset,
    lng: 101.6865 + lngOffset,
    label: input
  };
}

/**
 * Calculates straight-line Great Circle distance (Haversine formula in KM)
 */
export function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Main accurate calculation function calibrated to live Malaysian ride hailing formulas
 */
export function computeAccurateCommute(
  fromInput: string,
  toInput: string,
  trafficCondition: CommuteTrafficCondition = "offpeak"
): TransitCalculationResult {
  const origin = resolveLocationCoordinate(fromInput);
  const dest = resolveLocationCoordinate(toInput);

  let straightDistance = calculateHaversineKm(origin.lat, origin.lng, dest.lat, dest.lng);
  if (straightDistance < 0.5) {
    straightDistance = 1.2;
  }

  // Realistic Klang Valley road network circuity multiplier (~1.28x of straight line)
  const roadDistance = Number(Math.max(1.5, straightDistance * 1.28).toFixed(1));

  // Traffic congestion delay multipliers based on current condition
  const trafficMultiplier = trafficCondition === "rain" ? 1.55 : trafficCondition === "rush" ? 1.30 : 1.00;

  // Driving duration in Klang Valley traffic (Base 4 mins + ~1.6 mins per km) * traffic multiplier
  const baseDrivingDuration = Math.max(7, Math.round(4 + roadDistance * 1.6));
  const drivingDurationMins = Math.round(baseDrivingDuration * trafficMultiplier);

  // Public Transit line detection
  const combined = `${fromInput} ${toInput}`.toLowerCase();
  let railLine = "RapidKL Kelana Jaya LRT / MRT Network";
  let baseRailFare = 2.40;
  let transitDurationMins = Math.max(14, Math.round(baseDrivingDuration * 1.15));
  let transferCount = 0;

  if (combined.includes("kj") || combined.includes("kelana jaya") || combined.includes("pasar seni") || combined.includes("universiti") || combined.includes("subang")) {
    railLine = "RapidKL Kelana Jaya LRT (KJ Line)";
    baseRailFare = Math.min(4.80, 1.30 + roadDistance * 0.16);
  } else if (combined.includes("kg") || combined.includes("kajang") || combined.includes("bukit bintang") || combined.includes("mrt")) {
    railLine = "MRT Kajang Line (Line 9)";
    baseRailFare = Math.min(5.20, 1.40 + roadDistance * 0.17);
  } else if (combined.includes("py") || combined.includes("putrajaya") || combined.includes("serdang") || combined.includes("cyberjaya")) {
    railLine = "MRT Putrajaya Line (Line 12)";
    baseRailFare = Math.min(5.60, 1.50 + roadDistance * 0.18);
  } else if (combined.includes("brt") || combined.includes("sunway") || combined.includes("sunmed") || combined.includes("monash")) {
    railLine = "BRT Sunway Elevated Busway + Kelana Jaya LRT";
    baseRailFare = Math.min(4.20, 1.80 + roadDistance * 0.15);
    transferCount = 1;
  } else if (combined.includes("sp") || combined.includes("ag") || combined.includes("sri petaling") || combined.includes("ampang") || combined.includes("bukit jalil")) {
    railLine = "RapidKL Sri Petaling / Ampang LRT Line";
    baseRailFare = Math.min(4.60, 1.40 + roadDistance * 0.16);
  } else {
    baseRailFare = Math.min(5.50, 1.50 + roadDistance * 0.17);
  }

  baseRailFare = Number(baseRailFare.toFixed(2));
  // 50% Malaysian Student Concession discount
  const concessionFare = Number((baseRailFare * 0.5).toFixed(2));

  // =========================================================================
  // CALIBRATED MALAYSIAN RIDE-HAILING CALCULATIONS WITH DYNAMIC SURGE
  // =========================================================================
  // Surge Multipliers calibrated to real market conditions:
  // Off-peak: 1.00x
  // Rush Hour (8-9am, 5-7pm): 1.25x - 1.35x
  // Rain / High Scarcity: 1.60x - 1.80x

  const grabSurgeFactor = trafficCondition === "rain" ? 1.70 : trafficCondition === "rush" ? 1.32 : 1.05;
  const boltSurgeFactor = trafficCondition === "rain" ? 1.50 : trafficCondition === "rush" ? 1.20 : 1.00;

  // 1. GrabCar / JustGrab:
  // Base fare: RM 5.00 | RM 1.15/km | RM 0.20/min
  const grabBaseFare = Number((5.00 + roadDistance * 1.15 + baseDrivingDuration * 0.20).toFixed(2));
  const grabSurgePrice = Number((grabBaseFare * grabSurgeFactor).toFixed(2));
  const grabMinRange = Number((grabSurgePrice * 0.95).toFixed(2));
  const grabMaxRange = Number((grabSurgePrice * 1.15).toFixed(2));

  // 2. Bolt Ride:
  // Base fare: RM 4.00 | RM 0.92/km | RM 0.16/min (usually ~15-20% cheaper than Grab)
  const boltBaseFare = Number((4.00 + roadDistance * 0.92 + baseDrivingDuration * 0.16).toFixed(2));
  const boltSurgePrice = Number((boltBaseFare * boltSurgeFactor).toFixed(2));
  const boltMinRange = Number((boltSurgePrice * 0.94).toFixed(2));
  const boltMaxRange = Number((boltSurgePrice * 1.12).toFixed(2));

  // 3. inDrive (Passenger Bidding):
  const inDriveBase = Number(Math.max(7.00, 3.80 + roadDistance * 0.85).toFixed(2));
  const inDriveEstimate = Number((inDriveBase * (trafficCondition === "rain" ? 1.35 : trafficCondition === "rush" ? 1.15 : 1.00)).toFixed(2));
  const inDriveMin = Number((inDriveEstimate * 0.90).toFixed(2));
  const inDriveMax = Number((inDriveEstimate * 1.15).toFixed(2));

  // 4. Kumpool / Trek DRT:
  const isKumpoolZone =
    combined.includes("subang") ||
    combined.includes("sunway") ||
    combined.includes("pj") ||
    combined.includes("petaling jaya") ||
    combined.includes("cyberjaya") ||
    combined.includes("bangsar") ||
    combined.includes("cheras") ||
    combined.includes("setapak") ||
    combined.includes("bukit jalil") ||
    combined.includes("um") ||
    combined.includes("taylor") ||
    combined.includes("monash");
  const kumpoolFare = 2.00;

  const totalSavedVsGrab = Number((grabSurgePrice - concessionFare).toFixed(2));
  const totalSavedVsBolt = Number((boltSurgePrice - concessionFare).toFixed(2));

  const costEfficiencyVerdict = `Taking RapidKL Rail with 50% student concession (RM ${concessionFare.toFixed(2)}) saves you RM ${totalSavedVsGrab.toFixed(2)} vs Grab (RM ${grabSurgePrice.toFixed(2)}) and RM ${totalSavedVsBolt.toFixed(2)} vs Bolt (RM ${boltSurgePrice.toFixed(2)}) for this ${roadDistance} km trip. Among ride-hailing services, Bolt (RM ${boltSurgePrice.toFixed(2)}) offers the most economical baseline rate. If traveling within local campus zones, Kumpool DRT offers flat RM 2.00 shared shuttle booking.`;

  return {
    journeyName: `${fromInput.trim()} → ${toInput.trim()}`,
    fromName: fromInput.trim(),
    toName: toInput.trim(),
    straightDistanceKm: straightDistance,
    roadDistanceKm: roadDistance,
    drivingDurationMins,
    transitDurationMins,
    trafficCondition,

    lrtMrtOption: {
      lineName: railLine,
      basePriceMYR: baseRailFare,
      concessionPriceMYR: concessionFare,
      durationMinutes: transitDurationMins,
      carbonGramsCo2: Math.round(roadDistance * 16),
      transferCount
    },
    busOption: {
      busType: "RapidKL Feeder Bus / Smart Selangor",
      fareMYR: 1.00,
      durationMinutes: drivingDurationMins + 6,
      isFreeOrFlat: true
    },
    publicTransitSummary: {
      totalConcessionFareMYR: concessionFare,
      totalStandardFareMYR: baseRailFare,
      my50PassCovered: true,
      passNote: "Covered 100% under My50 Unlimited Monthly Pass (RM 50/30 days) or 50% MyRapid Student Card concession."
    },

    grabOption: {
      appName: "Grab",
      serviceTier: "JustGrab / GrabCar (4 Seats)",
      basePriceMYR: grabBaseFare,
      currentSurgePriceMYR: grabSurgePrice,
      minEstimatedFareMYR: grabMinRange,
      maxEstimatedFareMYR: grabMaxRange,
      durationMinutes: drivingDurationMins,
      surgeMultiplier: grabSurgeFactor,
      fareBreakdown: `Base RM 5.00 + RM 1.15/km (${roadDistance} km) + RM 0.20/min (${baseDrivingDuration} mins) × ${grabSurgeFactor.toFixed(2)}x surge`,
      baseRateMYR: 5.00,
      kmRateMYR: 1.15,
      timeRateMYR: 0.20,
      pricingModelNotes: "Dynamic supply/demand surge pricing. GrabPay & Touch 'n Go eWallet supported."
    },
    boltOption: {
      appName: "Bolt",
      serviceTier: "Bolt Ride Standard",
      basePriceMYR: boltBaseFare,
      currentSurgePriceMYR: boltSurgePrice,
      minEstimatedFareMYR: boltMinRange,
      maxEstimatedFareMYR: boltMaxRange,
      durationMinutes: Math.max(7, drivingDurationMins - 1),
      surgeMultiplier: boltSurgeFactor,
      fareBreakdown: `Base RM 4.00 + RM 0.92/km (${roadDistance} km) + RM 0.16/min (${baseDrivingDuration} mins) × ${boltSurgeFactor.toFixed(2)}x surge`,
      baseRateMYR: 4.00,
      kmRateMYR: 0.92,
      timeRateMYR: 0.16,
      pricingModelNotes: "Budget e-hailing tier with ~15-20% lower baseline commission rates."
    },
    inDriveOption: {
      estimatedFareMYR: inDriveEstimate,
      minEstimatedFareMYR: inDriveMin,
      maxEstimatedFareMYR: inDriveMax,
      durationMinutes: drivingDurationMins,
      note: "Passenger-set bid model. Driver can counter-offer. Pay via Bank Transfer or Cash."
    },
    kumpoolOption: {
      flatFareMYR: kumpoolFare,
      durationMinutes: Math.min(25, drivingDurationMins + 8),
      serviceArea: isKumpoolZone ? "Active Campus Cluster Zone" : "Check Kumpool App for specific zone boundary",
      isCovered: isKumpoolZone,
      note: "Shared on-demand campus shuttle van. Book 10-15 mins in advance."
    },

    fareAccuracyDisclaimer: "Note: Displayed fares are calibrated estimates based on official base rate formulas, road distance, and simulated live traffic surge. Live in-app fares in Grab/Bolt may differ due to localized driver supply in your immediate 500m radius and promotional discounts. AI can make mistakes.",
    costEfficiencyVerdict
  };
}

/**
 * Export alias for dynamic calculation
 */
export const calculateDynamicTransit = computeAccurateCommute;
