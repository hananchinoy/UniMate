import React, { useState, useMemo, useRef } from "react";
import {
  MapPin,
  Search,
  X,
  Compass,
  Navigation,
  ExternalLink,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Train,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Map as MapIcon,
  ListFilter,
  ShoppingBag,
  Home as HomeIcon,
  Plane,
  Crosshair,
  AlertTriangle,
  Info
} from "lucide-react";
import {
  TRANSIT_STATIONS,
  TRANSIT_LINE_FILTERS,
  POPULAR_COMMUTE_PAIRS,
  TransitStation
} from "../transitStations";
import { REAL_LOCATIONS_DATABASE, RealLocationOption } from "../realLocationsData";

export interface CustomHotspot {
  id: string;
  name: string;
  category: "Mall" | "Campus" | "Residence";
  area: string;
  lat: number;
  lng: number;
  description: string;
  address?: string;
}

export const POPULAR_HOTSPOTS: CustomHotspot[] = REAL_LOCATIONS_DATABASE.map((loc) => ({
  id: loc.id,
  name: loc.name,
  category: loc.category,
  area: loc.area,
  lat: loc.lat,
  lng: loc.lng,
  description: loc.description,
  address: loc.address
}));

interface GoogleMapsStationMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (locationFullName: string) => void;
  currentSelected?: string;
  selectionTitle?: string;
  role?: "departure" | "destination" | "general";
  onSelectBoth?: (from: string, to: string) => void;
}

export const GoogleMapsStationMenuModal: React.FC<GoogleMapsStationMenuModalProps> = ({
  isOpen,
  onClose,
  onSelectStation,
  currentSelected = "",
  selectionTitle = "Choose Campus, Hangout Spot, Residence or Station",
  role = "general",
  onSelectBoth
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [activeView, setActiveView] = useState<"map" | "list">("map");
  
  // Selected location can be either a TransitStation or a RealLocationOption or a custom dropped pin
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    type: "station" | "place" | "pin";
    address?: string;
    area?: string;
    lat: number;
    lng: number;
    category?: string;
    description?: string;
    code?: string;
    lineColor?: string;
  }>(() => {
    // Attempt to match currentSelected in real locations or transit stations
    const matchedReal = REAL_LOCATIONS_DATABASE.find(
      (r) => r.name.toLowerCase() === currentSelected.toLowerCase() || currentSelected.toLowerCase().includes(r.name.toLowerCase())
    );
    if (matchedReal) {
      return {
        name: matchedReal.name,
        type: "place",
        address: matchedReal.address,
        area: matchedReal.area,
        lat: matchedReal.lat,
        lng: matchedReal.lng,
        category: matchedReal.category,
        description: matchedReal.description
      };
    }
    const matchedSt = TRANSIT_STATIONS.find(
      (s) => s.fullName.toLowerCase() === currentSelected.toLowerCase() || s.name.toLowerCase() === currentSelected.toLowerCase()
    ) || TRANSIT_STATIONS[0];
    return {
      name: matchedSt.fullName,
      type: "station",
      address: matchedSt.area,
      area: matchedSt.area,
      lat: matchedSt.lat,
      lng: matchedSt.lng,
      category: matchedSt.line,
      description: matchedSt.description,
      code: matchedSt.code,
      lineColor: matchedSt.lineColor
    };
  });

  const [hoveredLocation, setHoveredLocation] = useState<{
    name: string;
    category: string;
    lat: number;
    lng: number;
    color?: string;
  } | null>(null);

  const [customPin, setCustomPin] = useState<{ lat: number; lng: number; label: string } | null>(null);

  // Map interactive state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map coordinate transformation for SVG display
  const minLat = 2.70;
  const maxLat = 3.30;
  const minLng = 101.45;
  const maxLng = 101.85;

  const projectToMap = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 520 + 40;
    return { x, y };
  };

  const mapToCoordinates = (svgX: number, svgY: number) => {
    const lng = ((svgX - 30) / 740) * (maxLng - minLng) + minLng;
    const lat = maxLat - ((svgY - 40) / 520) * (maxLat - minLat);
    return { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
  };

  // Filter stations based on search and category
  const filteredStations = useMemo(() => {
    if (selectedCategory !== "ALL" && selectedCategory !== "TRANSIT" && !selectedCategory.startsWith("LINE_")) {
      return [];
    }
    return TRANSIT_STATIONS.filter((station) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        selectedCategory === "TRANSIT" ||
        station.lineCategory === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCategory;

      const matchesQuery =
        station.name.toLowerCase().includes(q) ||
        station.code.toLowerCase().includes(q) ||
        station.line.toLowerCase().includes(q) ||
        station.area.toLowerCase().includes(q) ||
        (station.nearbyUniversity && station.nearbyUniversity.toLowerCase().includes(q)) ||
        (station.description && station.description.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  // Filter real physical locations (campuses, hangout spots, student residences)
  const filteredRealPlaces = useMemo(() => {
    if (selectedCategory.startsWith("LINE_") || selectedCategory === "TRANSIT") {
      return [];
    }
    return REAL_LOCATIONS_DATABASE.filter((place) => {
      let matchesCat = true;
      if (selectedCategory === "CAMPUS") matchesCat = place.category === "Campus";
      else if (selectedCategory === "MALL") matchesCat = place.category === "Mall";
      else if (selectedCategory === "RESIDENCE") matchesCat = place.category === "Residence";

      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesCat;

      const matchesQuery =
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.area.toLowerCase().includes(q) ||
        place.category.toLowerCase().includes(q) ||
        place.description.toLowerCase().includes(q);

      return matchesCat && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapBackgroundClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
    const coords = mapToCoordinates(clickX, clickY);
    
    const pinName = `📍 Dropped Pin (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`;
    setCustomPin({
      lat: coords.lat,
      lng: coords.lng,
      label: pinName
    });

    setSelectedLocation({
      name: pinName,
      type: "pin",
      address: `GPS: ${coords.lat}, ${coords.lng} (Klang Valley)`,
      area: "Custom Map Coordinates",
      lat: coords.lat,
      lng: coords.lng,
      category: "Custom Pin",
      description: "Direct map coordinates for door-to-door ride-hailing and multimodal transit calculation."
    });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.3, 0.7));
  };

  const handleResetMap = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setCustomPin(null);
  };

  const handleConfirmSelect = (locationName: string) => {
    onSelectStation(locationName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="google-maps-station-modal"
        className="w-full max-w-5xl h-[92vh] max-h-[860px] bg-[#f8fafc] border-4 sm:border-8 border-black rounded-[28px] sm:rounded-[36px] brutal-shadow-2xl flex flex-col overflow-hidden text-black"
      >
        {/* Modal Top Bar - Google Maps Style Header */}
        <div className="bg-[#4285F4] text-white border-b-4 border-black p-3.5 sm:p-4 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-[#4285F4] border-3 border-black rounded-2xl flex items-center justify-center brutal-shadow-sm shrink-0">
              <MapIcon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-[#fed618] px-2 py-0.5 rounded-md">
                  Map Locations
                </span>
                {role === "departure" && (
                  <span className="text-[10px] font-black uppercase bg-emerald-900 text-white px-2 py-0.5 rounded-md">
                    Pickup / Origin
                  </span>
                )}
                {role === "destination" && (
                  <span className="text-[10px] font-black uppercase bg-rose-900 text-white px-2 py-0.5 rounded-md">
                    Dropoff / Destination
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-verdana font-black leading-tight text-white mt-0.5 truncate">
                {selectionTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Button */}
            <div className="hidden sm:flex bg-black/20 p-1 rounded-xl border-2 border-white/40">
              <button
                type="button"
                onClick={() => setActiveView("map")}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeView === "map"
                    ? "bg-white text-black brutal-shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map View</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("list")}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeView === "list"
                    ? "bg-white text-black brutal-shadow-xs"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List View</span>
              </button>
            </div>

            <button
              id="btn-close-map-modal"
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-neutral-100 text-black border-3 border-black rounded-xl flex items-center justify-center brutal-shadow-sm cursor-pointer transition-transform active:scale-95 shrink-0"
              title="Close Menu"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Disclaimer Notice Header (as requested by user) */}
        <div className="bg-amber-100 border-b-3 border-black px-3 py-1.5 flex items-center gap-2 text-[11px] font-bold text-amber-950 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Note:</strong> Prices and travel times are estimates and may not be the same as live in-app pricing due to dynamic traffic and surge. AI can make mistakes.
          </span>
        </div>

        {/* Search & Location Menu Options */}
        <div className="bg-white border-b-4 border-black p-3 sm:p-4 space-y-2.5 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search Input for Campuses, Hangouts, Residences & Stations on Map */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus, hangout spot, student residence, or transit station on map..."
                className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border-3 border-black rounded-2xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4285F4]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden bg-neutral-200 p-1 rounded-xl border-2 border-black">
              <button
                type="button"
                onClick={() => setActiveView("map")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer ${
                  activeView === "map" ? "bg-[#4285F4] text-white" : "text-black"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView("list")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase flex items-center justify-center gap-1 cursor-pointer ${
                  activeView === "list" ? "bg-[#4285F4] text-white" : "text-black"
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>List ({filteredRealPlaces.length + filteredStations.length})</span>
              </button>
            </div>
          </div>

          {/* Menu Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer shrink-0 ${
                selectedCategory === "ALL"
                  ? "bg-black text-white brutal-shadow-xs scale-[1.02]"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              🌟 All Map Locations ({REAL_LOCATIONS_DATABASE.length + TRANSIT_STATIONS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("CAMPUS")}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer shrink-0 ${
                selectedCategory === "CAMPUS"
                  ? "bg-[#623bff] text-white brutal-shadow-xs scale-[1.02]"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              🎓 Campuses & Universities
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("MALL")}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer shrink-0 ${
                selectedCategory === "MALL"
                  ? "bg-[#fed618] text-black brutal-shadow-xs scale-[1.02]"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              🛍️ Hangout Spots & Malls
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("RESIDENCE")}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer shrink-0 ${
                selectedCategory === "RESIDENCE"
                  ? "bg-[#4ade80] text-black brutal-shadow-xs scale-[1.02]"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              🏢 Student Residences & Condos
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("TRANSIT")}
              className={`px-3 py-1 rounded-xl text-xs font-black whitespace-nowrap transition-all border-2 border-black cursor-pointer shrink-0 ${
                selectedCategory === "TRANSIT"
                  ? "bg-sky-600 text-white brutal-shadow-xs scale-[1.02]"
                  : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
              }`}
            >
              🚇 RapidKL Rail Stations
            </button>
          </div>
        </div>

        {/* Main Content Area: Interactive Map Visualizer + Location Detail Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          
          {/* LEFT: Map Visualizer Area */}
          <div
            className={`flex-1 relative bg-[#e5e3df] overflow-hidden flex flex-col ${
              activeView === "list" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Map Canvas / SVG Layer */}
            <div
              className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <svg
                viewBox="0 0 800 600"
                className="w-full h-full"
                onClick={handleMapBackgroundClick}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out"
                }}
              >
                <defs>
                  {/* Map Grid Pattern */}
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5d3ce" strokeWidth="1" />
                  </pattern>
                  <filter id="mapShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.3" />
                  </filter>
                </defs>

                {/* Base Map Background */}
                <rect width="800" height="600" fill="#ebe7df" />
                <rect width="800" height="600" fill="url(#mapGrid)" />

                {/* Klang Valley Highway / Road Network Background Lines */}
                <g stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9">
                  {/* Federal Highway */}
                  <path d="M 50 320 Q 300 310 420 300 T 750 280" />
                  {/* LDP Expressway */}
                  <path d="M 280 50 Q 290 280 320 550" />
                  {/* KESAS / NPE */}
                  <path d="M 80 430 Q 350 410 650 390" />
                  {/* MRR2 Ring Road */}
                  <path d="M 580 80 Q 640 280 550 520" />
                </g>

                {/* RapidKL Rail Transit Lines */}
                <g fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
                  {/* Kelana Jaya LRT (Ruby Red) */}
                  <path d="M 220 330 L 260 310 L 320 295 L 390 275 L 430 260 L 460 250 L 520 220 L 580 140" stroke="#d90429" strokeWidth="5" />
                  {/* MRT Kajang Line (Green) */}
                  <path d="M 240 160 L 330 200 L 410 245 L 450 270 L 490 310 L 540 380 L 630 490" stroke="#009639" strokeWidth="5" />
                  {/* MRT Putrajaya Line (Yellow/Gold) */}
                  <path d="M 450 80 L 470 170 L 490 260 L 500 340 L 520 440 L 540 540" stroke="#ffb703" strokeWidth="5" />
                  {/* BRT Sunway (Teal) */}
                  <path d="M 260 360 L 280 375 L 290 395 L 305 405" stroke="#0077b6" strokeWidth="6" strokeDasharray="3 3" />
                </g>

                {/* Transit Station Circle Dots */}
                {TRANSIT_STATIONS.map((st) => {
                  const pt = projectToMap(st.lat, st.lng);
                  const isSelected = selectedLocation.name === st.fullName;
                  return (
                    <g
                      key={st.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation({
                          name: st.fullName,
                          type: "station",
                          address: st.area,
                          area: st.area,
                          lat: st.lat,
                          lng: st.lng,
                          category: st.line,
                          description: st.description,
                          code: st.code,
                          lineColor: st.lineColor
                        });
                        setCustomPin(null);
                      }}
                      onMouseEnter={() =>
                        setHoveredLocation({
                          name: st.name,
                          category: `${st.code} • ${st.line}`,
                          lat: st.lat,
                          lng: st.lng,
                          color: st.lineColor
                        })
                      }
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      <circle
                        r={isSelected ? 9 : 5.5}
                        fill={st.lineColor}
                        stroke="#000000"
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter={isSelected ? "url(#mapShadow)" : undefined}
                      />
                      <circle r={isSelected ? 3.5 : 2} fill="#ffffff" />
                    </g>
                  );
                })}

                {/* Real-Life Physical Landmarks (Campuses, Malls, Condos, Addresses) */}
                {REAL_LOCATIONS_DATABASE.map((place) => {
                  const pt = projectToMap(place.lat, place.lng);
                  const isSelected = selectedLocation.name === place.name;
                  const markerColor =
                    place.category === "Campus"
                      ? "#623bff"
                      : place.category === "Mall"
                      ? "#fed618"
                      : place.category === "Residence"
                      ? "#10b981"
                      : place.category === "Airport"
                      ? "#0284c7"
                      : "#ef4444";

                  return (
                    <g
                      key={place.id}
                      transform={`translate(${pt.x}, ${pt.y})`}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation({
                          name: place.name,
                          type: "place",
                          address: place.address,
                          area: place.area,
                          lat: place.lat,
                          lng: place.lng,
                          category: place.category,
                          description: place.description
                        });
                        setCustomPin(null);
                      }}
                      onMouseEnter={() =>
                        setHoveredLocation({
                          name: place.name,
                          category: `${place.category} • ${place.area}`,
                          lat: place.lat,
                          lng: place.lng,
                          color: markerColor
                        })
                      }
                      onMouseLeave={() => setHoveredLocation(null)}
                    >
                      {/* Landmark Outer Marker */}
                      <rect
                        x={-9}
                        y={-9}
                        width={18}
                        height={18}
                        rx={5}
                        fill={markerColor}
                        stroke="#000000"
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter="url(#mapShadow)"
                      />
                      <text
                        x={0}
                        y={3.5}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#000000"
                      >
                        {place.category === "Campus"
                          ? "🎓"
                          : place.category === "Mall"
                          ? "🛍️"
                          : place.category === "Residence"
                          ? "🏠"
                          : place.category === "Airport"
                          ? "✈️"
                          : "📍"}
                      </text>
                    </g>
                  );
                })}

                {/* Dropped Custom Pin (if user clicked on the map) */}
                {customPin && (
                  <g
                    transform={`translate(${projectToMap(customPin.lat, customPin.lng).x}, ${projectToMap(customPin.lat, customPin.lng).y})`}
                    filter="url(#mapShadow)"
                  >
                    <path
                      d="M 0 -22 C -8 -22 -14 -16 -14 -8 C -14 2 0 10 0 10 C 0 10 14 2 14 -8 C 14 -16 8 -22 0 -22 Z"
                      fill="#ef4444"
                      stroke="#000000"
                      strokeWidth="2.5"
                    />
                    <circle cx="0" cy="-8" r="4.5" fill="#ffffff" />
                  </g>
                )}
              </svg>

              {/* Map Floating HUD Controls */}
              <div className="absolute right-3 top-3 flex flex-col gap-1.5 bg-white border-3 border-black p-1.5 rounded-2xl brutal-shadow-sm">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-[#fed618] flex items-center justify-center font-bold text-black border border-black cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-[#fed618] flex items-center justify-center font-bold text-black border border-black cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetMap}
                  className="w-8 h-8 rounded-xl bg-neutral-100 hover:bg-[#fed618] flex items-center justify-center font-bold text-black border border-black cursor-pointer"
                  title="Reset Map View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Map Floating Legend */}
              <div className="absolute left-3 bottom-3 bg-white/95 backdrop-blur-md border-3 border-black p-2.5 rounded-2xl brutal-shadow-sm text-[10px] font-bold space-y-1 max-w-[210px] hidden sm:block">
                <div className="font-black uppercase text-neutral-500 tracking-wider text-[9px]">
                  Map Legend & Hotspots:
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#623bff] text-white flex items-center justify-center text-[8px] border border-black">🎓</span>
                  <span>Universities & Campuses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#fed618] text-black flex items-center justify-center text-[8px] border border-black">🛍️</span>
                  <span>Malls & Hangouts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-md bg-[#10b981] text-black flex items-center justify-center text-[8px] border border-black">🏠</span>
                  <span>Student Condominiums</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#d90429] border border-black inline-block"></span>
                  <span>LRT / MRT Stations (Clickable)</span>
                </div>
                <div className="text-[9px] text-neutral-500 pt-0.5">
                  Tip: Click anywhere to drop a custom GPS pin.
                </div>
              </div>

              {/* Hover Tooltip Overlay */}
              {hoveredLocation && (
                <div className="absolute top-3 left-3 bg-black text-white px-3 py-1.5 rounded-xl border-2 border-white brutal-shadow text-xs font-bold pointer-events-none flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredLocation.color || "#fed618" }} />
                  <div>
                    <div className="font-black">{hoveredLocation.name}</div>
                    <div className="text-[10px] text-neutral-300">{hoveredLocation.category}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Selected Location Card & Real Addresses / Stations List */}
          <div className="w-full md:w-[380px] bg-white border-t-4 md:border-t-0 md:border-l-4 border-black flex flex-col overflow-hidden shrink-0">
            
            {/* Selected Location Card */}
            <div className="p-4 bg-[#fed618]/20 border-b-4 border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-md">
                  Active Selection
                </span>
                <span className="text-[10px] font-black text-neutral-600">
                  {selectedLocation.type === "station" ? "🚇 Transit Station" : selectedLocation.type === "pin" ? "📍 GPS Dropped Pin" : "🏢 Real Physical Location"}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-verdana font-black text-black leading-tight">
                  {selectedLocation.name}
                </h3>
                {selectedLocation.address && (
                  <p className="text-xs font-bold text-neutral-700 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                    <span>{selectedLocation.address}</span>
                  </p>
                )}
                {selectedLocation.description && (
                  <p className="text-[11px] font-medium text-neutral-600 leading-relaxed pt-1">
                    {selectedLocation.description}
                  </p>
                )}
              </div>

              {/* Choose Location Main Button */}
              <button
                id="btn-confirm-location-select"
                type="button"
                onClick={() => handleConfirmSelect(selectedLocation.name)}
                className="w-full bg-[#4ade80] hover:bg-[#34d399] text-black border-3 border-black font-black text-xs uppercase py-3 rounded-2xl brutal-shadow brutal-btn flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Use "{selectedLocation.name.slice(0, 22)}{selectedLocation.name.length > 22 ? '...' : ''}"</span>
              </button>
            </div>

            {/* Popular Student Quick Presets */}
            <div className="p-3 bg-neutral-100 border-b-4 border-black">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1.5">
                ⚡ Popular Commute Pairs:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {POPULAR_COMMUTE_PAIRS.slice(0, 4).map((pair) => (
                  <button
                    key={pair.id}
                    type="button"
                    onClick={() => {
                      if (onSelectBoth) {
                        onSelectBoth(pair.from, pair.to);
                        onClose();
                      } else {
                        onSelectStation(role === "departure" ? pair.from : pair.to);
                        onClose();
                      }
                    }}
                    className="bg-white hover:bg-neutral-50 border-2 border-black px-2.5 py-1 rounded-xl text-[10px] font-black text-black shrink-0 text-left cursor-pointer transition-transform hover:-translate-y-0.5"
                  >
                    <div className="text-[#623bff] font-black">{pair.badge}</div>
                    <div className="truncate max-w-[130px]">{pair.title}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results & Real Physical Addresses + Stations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              
              {/* Real Places Section */}
              {filteredRealPlaces.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block px-1">
                    🏢 Real Addresses, Campuses & Malls ({filteredRealPlaces.length})
                  </span>
                  {filteredRealPlaces.map((place) => {
                    const isSelected = selectedLocation.name === place.name;
                    return (
                      <div
                        key={place.id}
                        onClick={() => {
                          setSelectedLocation({
                            name: place.name,
                            type: "place",
                            address: place.address,
                            area: place.area,
                            lat: place.lat,
                            lng: place.lng,
                            category: place.category,
                            description: place.description
                          });
                          setCustomPin(null);
                        }}
                        onDoubleClick={() => handleConfirmSelect(place.name)}
                        className={`p-2.5 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-[#fed618] text-black brutal-shadow-xs scale-[1.01]"
                            : "bg-white hover:bg-neutral-50 text-black"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0 border border-black">
                            {place.category === "Campus"
                              ? "🎓"
                              : place.category === "Mall"
                              ? "🛍️"
                              : place.category === "Residence"
                              ? "🏠"
                              : place.category === "Airport"
                              ? "✈️"
                              : "📍"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-xs text-black truncate">{place.name}</div>
                            <div className="text-[10px] text-neutral-600 truncate">{place.address}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmSelect(place.name);
                          }}
                          className="text-[10px] font-black uppercase bg-white border border-black px-2 py-1 rounded-lg text-black shrink-0 hover:bg-[#4ade80] cursor-pointer"
                        >
                          Select
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Transit Stations Section */}
              {filteredStations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-500 tracking-wider block px-1">
                    🚇 RapidKL Rail Stations ({filteredStations.length})
                  </span>
                  {filteredStations.map((station) => {
                    const isSelected = selectedLocation.name === station.fullName;
                    return (
                      <div
                        key={station.id}
                        onClick={() => {
                          setSelectedLocation({
                            name: station.fullName,
                            type: "station",
                            address: station.area,
                            area: station.area,
                            lat: station.lat,
                            lng: station.lng,
                            category: station.line,
                            description: station.description,
                            code: station.code,
                            lineColor: station.lineColor
                          });
                          setCustomPin(null);
                        }}
                        onDoubleClick={() => handleConfirmSelect(station.fullName)}
                        className={`p-2.5 rounded-2xl border-2 border-black cursor-pointer transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-[#623bff] text-white brutal-shadow-xs scale-[1.01]"
                            : "bg-white hover:bg-neutral-50 text-black"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            style={{
                              backgroundColor: isSelected ? "#ffffff" : station.lineColor,
                              color: isSelected ? station.lineColor : "#ffffff"
                            }}
                            className="w-8 h-8 rounded-xl border border-black font-black text-[10px] flex items-center justify-center shrink-0"
                          >
                            {station.code}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs truncate">
                              {station.name}
                            </div>
                            <div
                              className={`text-[10px] truncate ${
                                isSelected ? "text-white/80" : "text-neutral-500"
                              }`}
                            >
                              {station.line} • {station.area}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmSelect(station.fullName);
                          }}
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border-2 border-black shrink-0 transition-transform active:scale-95 cursor-pointer ${
                            isSelected
                              ? "bg-[#fed618] text-black hover:bg-white"
                              : "bg-neutral-100 hover:bg-[#fed618] text-black"
                          }`}
                        >
                          Select
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredRealPlaces.length === 0 && filteredStations.length === 0 && (
                <div className="p-6 text-center text-neutral-500 font-bold text-xs space-y-2">
                  <p>No map locations or transit stations matched "{searchQuery}".</p>
                  <p className="text-[11px] text-neutral-400">
                    Please choose one of the verified campuses, hangout spots, student residences, or transit stations above.
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Modal Actions */}
            <div className="p-3 bg-neutral-50 border-t-2 border-black flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-neutral-500">
                Double click any option to select instantly.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
