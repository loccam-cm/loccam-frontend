"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { Bien } from "@/types";

const DOUALA_CENTER: [number, number] = [4.0511, 9.7679];

function priceIcon(price: number, active: boolean) {
  const label = price >= 1000 ? `${Math.round(price / 1000)}k` : `${price}`;
  return L.divIcon({
    className: "",
    html: `<div style="
      display:inline-block;
      background:${active ? "#0F172A" : "#fff"};
      color:${active ? "#fff" : "#0F172A"};
      padding:6px 11px;
      border-radius:999px;
      font-size:12px;
      font-weight:700;
      font-family:inherit;
      box-shadow:0 2px 8px rgba(15,23,42,.28);
      border:1.5px solid ${active ? "#0F172A" : "#E2E0D9"};
      white-space:nowrap;
      transform:${active ? "scale(1.08)" : "scale(1)"};
      transition:all .15s ease;
    ">${label} XAF</div>`,
    iconSize: [1, 1],
    iconAnchor: [label.length * 3 + 20, 15],
  });
}

function FitToMarkers({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
    }
  }, [points, map]);
  return null;
}

interface MarketplaceMapProps {
  biens: Bien[];
  hoveredId: number | null;
  onHover?: (id: number | null) => void;
}

export default function MarketplaceMap({ biens, hoveredId, onHover }: MarketplaceMapProps) {
  const geoBiens = useMemo(
    () => biens.filter((b) => b.latitude != null && b.longitude != null),
    [biens]
  );
  const points = useMemo(
    () => geoBiens.map((b) => [b.latitude as number, b.longitude as number] as [number, number]),
    [geoBiens]
  );

  return (
    <MapContainer
      center={DOUALA_CENTER}
      zoom={12}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom={true}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitToMarkers points={points} />
      {geoBiens.map((b) => (
        <Marker
          key={b.id}
          position={[b.latitude as number, b.longitude as number]}
          icon={priceIcon(b.prix, hoveredId === b.id)}
          eventHandlers={{
            mouseover: () => onHover?.(b.id),
            mouseout: () => onHover?.(null),
          }}
        >
          <Popup closeButton={false} minWidth={200}>
            <Link href={`/marketplace/${b.id}`} style={{ textDecoration: "none", color: "#0F172A" }}>
              <div style={{ width: 180 }}>
                <div
                  style={{
                    width: "100%",
                    height: 110,
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 6,
                    background: "#F5F4F0",
                  }}
                >
                  {b.photos && b.photos.length > 0 ? (
                    <img
                      src={b.photos.find((p) => p.est_principale)?.url ?? b.photos[0].url}
                      alt={b.titre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : null}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{b.titre}</div>
                <div style={{ fontSize: 12 }}>
                  <strong>{b.prix.toLocaleString("fr-FR")} XAF</strong>
                  <span style={{ color: "#78716C" }}> /mois</span>
                </div>
              </div>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
