import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Map as MapIcon,
  Search,
  ChevronDown,
  X,
  Sparkles,
  Train,
  CheckCircle2,
  Building2,
  GraduationCap
} from "lucide-react";
import { TRANSIT_STATIONS, TransitStation } from "../transitStations";
import { REAL_LOCATIONS_DATABASE, RealLocationOption } from "../realLocationsData";
import { GoogleMapsStationMenuModal } from "./GoogleMapsStationMenuModal";

interface GoogleMapsStationInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  role?: "departure" | "destination" | "general";
  helperText?: string;
  className?: string;
}

export const GoogleMapsStationInput: React.FC<GoogleMapsStationInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Select campus, hangout spot, student residence, or station...",
  role = "general",
  helperText,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter combined real places + stations for auto-suggest
  const suggestions = React.useMemo(() => {
    const q = value.trim().toLowerCase();
    
    // Real locations on map (campuses, hangout spots/malls, student residences)
    const matchingPlaces = REAL_LOCATIONS_DATABASE.filter((place) => {
      if (!q) return place.popularForStudents;
      return (
        place.name.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        place.area.toLowerCase().includes(q) ||
        place.category.toLowerCase().includes(q)
      );
    }).slice(0, 4);

    // Transit stations
    const matchingStations = TRANSIT_STATIONS.filter((station) => {
      if (!q) return station.popularForStudents;
      return (
        station.name.toLowerCase().includes(q) ||
        station.code.toLowerCase().includes(q) ||
        station.line.toLowerCase().includes(q) ||
        station.fullName.toLowerCase().includes(q) ||
        (station.nearbyUniversity && station.nearbyUniversity.toLowerCase().includes(q))
      );
    }).slice(0, 4);

    return {
      places: matchingPlaces,
      stations: matchingStations
    };
  }, [value]);

  const matchedStation = TRANSIT_STATIONS.find(
    (s) =>
      s.fullName.toLowerCase() === value.toLowerCase() ||
      s.name.toLowerCase() === value.toLowerCase()
  );

  const matchedPlace = REAL_LOCATIONS_DATABASE.find(
    (p) => p.name.toLowerCase() === value.toLowerCase()
  );

  return (
    <div className={`space-y-1.5 min-w-0 w-full ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <label
            htmlFor={id}
            className="text-xs font-bold uppercase tracking-wider text-[#fffefe] flex items-center gap-1.5 truncate"
          >
            {role === "departure" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-black shrink-0" />
            ) : role === "destination" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block border border-black shrink-0" />
            ) : (
              <MapPin className="w-3.5 h-3.5 text-[#fffefe] shrink-0" />
            )}
            <span className="text-[#fffafa] truncate">{label}</span>
          </label>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[10px] sm:text-[11px] font-black uppercase text-[#4285F4] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-md border border-black shrink-0"
          >
            <MapIcon className="w-3 h-3 text-[#4285F4]" />
            <span>Map Locations</span>
          </button>
        </div>
      )}

      {/* Input container with Maps trigger button */}
      <div className="relative flex items-center min-w-0 w-full">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-black shrink-0 z-10">
          {matchedStation ? (
            <div
              style={{ backgroundColor: matchedStation.lineColor }}
              className="w-5 h-5 rounded-md text-[9px] font-black text-white flex items-center justify-center border border-black shrink-0"
            >
              {matchedStation.code.slice(0, 2)}
            </div>
          ) : matchedPlace ? (
            <div className="w-5 h-5 rounded-md bg-black text-white text-[9px] font-black flex items-center justify-center border border-black shrink-0">
              {matchedPlace.category === "Campus"
                ? "🎓"
                : matchedPlace.category === "Mall"
                ? "🛍️"
                : "🏠"}
            </div>
          ) : (
            <MapPin className="w-4 h-4 text-neutral-500 shrink-0" />
          )}
        </div>

        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 sm:pr-24 py-2.5 sm:py-3 bg-white border-3 border-black rounded-2xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#4285F4] shadow-xs truncate"
        />

        {/* Action Controls on the Right side of the Input */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsDropdownOpen(true);
              }}
              className="w-6 h-6 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 flex items-center justify-center p-0.5 cursor-pointer"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Google Maps Menu Button */}
          <button
            id={id ? `${id}-btn-maps` : "btn-maps-trigger"}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#4285F4] hover:bg-[#3367d6] text-white border-2 border-black px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl font-black text-[10px] sm:text-[11px] uppercase flex items-center gap-1 brutal-shadow-xs cursor-pointer active:scale-95 transition-all shrink-0"
            title="Open interactive Map locations menu"
          >
            <MapIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* Quick Dropdown suggestions menu */}
      {isDropdownOpen && (
        <div className="absolute z-40 mt-1 w-full max-w-md bg-white border-3 border-black rounded-2xl brutal-shadow-lg overflow-hidden py-1">
          <div className="px-3 py-1.5 bg-neutral-100 border-b border-black flex items-center justify-between text-[10px] font-black uppercase text-neutral-600">
            <span>Campus, Hangout Spot & Station Suggestions</span>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                setIsModalOpen(true);
              }}
              className="text-[#4285F4] hover:underline flex items-center gap-1 font-black cursor-pointer"
            >
              <MapIcon className="w-3 h-3" />
              <span>Open Map</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Real Places Suggestions */}
            {suggestions.places.map((pl) => (
              <button
                key={pl.id}
                type="button"
                onClick={() => {
                  onChange(pl.name);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#fed618]/30 flex items-center justify-between gap-2 border-b border-neutral-100 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded border border-black shrink-0">
                    {pl.category === "Campus"
                      ? "🎓"
                      : pl.category === "Mall"
                      ? "🛍️"
                      : "🏠"}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-black truncate">
                      {pl.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {pl.address}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-black text-neutral-400 uppercase shrink-0">
                  Select
                </span>
              </button>
            ))}

            {/* Transit Stations Suggestions */}
            {suggestions.stations.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  onChange(st.fullName);
                  setIsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#623bff]/10 flex items-center justify-between gap-2 border-b border-neutral-100 last:border-0 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    style={{ backgroundColor: st.lineColor }}
                    className="text-white text-[9px] font-black px-1.5 py-0.5 rounded border border-black shrink-0"
                  >
                    {st.code}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-black truncate">
                      {st.name}
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {st.line} {st.nearbyUniversity ? `• ${st.nearbyUniversity}` : ""}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-black text-neutral-400 uppercase shrink-0">
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {helperText && (
        <p className="text-[11px] font-medium text-neutral-600 px-1">
          {helperText}
        </p>
      )}

      {/* Google Maps Full Interactive Modal */}
      <GoogleMapsStationMenuModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectStation={(st) => {
          onChange(st);
          setIsModalOpen(false);
        }}
        currentSelected={value}
        selectionTitle={
          label
            ? `Choose ${label}`
            : role === "departure"
            ? "Choose Departure (Campus / Hangout / Residence / Station)"
            : role === "destination"
            ? "Choose Destination (Campus / Hangout / Residence / Station)"
            : "Choose Location or Station"
        }
        role={role}
      />
    </div>
  );
};
