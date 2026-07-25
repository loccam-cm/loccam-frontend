"use client";

import { useState, useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { IconCurrentLocation, IconLoader2, IconMapPin } from "@tabler/icons-react";

// Douala par défaut — évite de dépendre des icônes marker par défaut
// de Leaflet (cassées par les bundlers) en utilisant un divIcon inline.
const DEFAULT_CENTER: [number, number] = [4.0511, 9.7679];
const DEFAULT_ZOOM = 13;

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="
    width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#2563EB;transform:rotate(-45deg);
    box-shadow:0 2px 6px rgba(0,0,0,.35);
    border:2px solid #fff;
  "></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

function RecenterOnChange({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom() < 14 ? 15 : map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 260,
}: LocationPickerProps) {
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const hasPosition = latitude !== null && longitude !== null;
  const center: [number, number] = hasPosition
    ? [latitude as number, longitude as number]
    : DEFAULT_CENTER;

  const useMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setGeoError("Position refusée ou indisponible. Cliquez sur la carte pour placer le point manuellement.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs" style={{ color: "#64748B" }}>
          {hasPosition
            ? "Faites glisser le point ou cliquez ailleurs sur la carte pour ajuster."
            : "Cliquez sur la carte à l'emplacement exact du bien, ou utilisez votre position actuelle."}
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{
            background: "#EFF6FF",
            color: "#2563EB",
            border: "none",
            cursor: locating ? "wait" : "pointer",
          }}
        >
          {locating ? (
            <IconLoader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} />
          ) : (
            <IconCurrentLocation size={13} />
          )}
          Ma position
        </button>
      </div>

      <div
        style={{
          height,
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #E2E8F0",
        }}
      >
        <MapContainer
          center={center}
          zoom={hasPosition ? 15 : DEFAULT_ZOOM}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          {hasPosition && (
            <>
              <Marker
                position={center}
                icon={pinIcon}
                draggable
                eventHandlers={{
                  dragend: (e) => {
                    const m = e.target as L.Marker;
                    const pos = m.getLatLng();
                    onChange(pos.lat, pos.lng);
                  },
                }}
              />
              <RecenterOnChange lat={center[0]} lng={center[1]} />
            </>
          )}
        </MapContainer>
      </div>

      {geoError && (
        <p className="text-xs mt-1.5" style={{ color: "#DC2626" }}>
          {geoError}
        </p>
      )}
      {hasPosition && (
        <p className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "#94A3B8" }}>
          <IconMapPin size={11} />
          {(latitude as number).toFixed(6)}, {(longitude as number).toFixed(6)}
        </p>
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
