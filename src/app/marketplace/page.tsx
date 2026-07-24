"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
import {
  IconBuilding,
  IconSearch,
  IconMapPin,
  IconHome2,
  IconAdjustments,
  IconX,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";

const TYPES_BIEN = [
  { val: "", lbl: "Tous les types" },
  { val: "chambre", lbl: "Chambre" },
  { val: "studio", lbl: "Studio" },
  { val: "f1", lbl: "F1" },
  { val: "f2", lbl: "F2" },
  { val: "f3", lbl: "F3" },
  { val: "f4_plus", lbl: "F4 et plus" },
  { val: "duplex", lbl: "Duplex" },
  { val: "villa", lbl: "Villa" },
  { val: "boutique", lbl: "Boutique" },
  { val: "bureau", lbl: "Bureau" },
  { val: "magasin", lbl: "Magasin" },
  { val: "entrepot", lbl: "Entrepôt" },
];

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export default function MarketplacePage() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [typeBien, setTypeBien] = useState("");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (typeBien) params.type_bien = typeBien;
    if (prixMin) params.prix_min = prixMin;
    if (prixMax) params.prix_max = prixMax;
    return params;
  }, [search, typeBien, prixMin, prixMax]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Bien>>("/marketplace/biens/", {
        params: buildParams(),
      });
      setBiens(res.data.results);
      setCount(res.data.count);
      setNextUrl(res.data.next);
    } catch {
      setBiens([]);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMore = async () => {
    if (!nextUrl) return;
    setLoadingMore(true);
    try {
      const res = await api.get<PaginatedResponse<Bien>>(nextUrl);
      setBiens((prev) => [...prev, ...res.data.results]);
      setNextUrl(res.data.next);
    } catch {
    } finally {
      setLoadingMore(false);
    }
  };

  const resetFilters = () => {
    setTypeBien("");
    setPrixMin("");
    setPrixMax("");
  };

  const hasActiveFilters = !!(typeBien || prixMin || prixMax);

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mp-card{transition:all .2s ease}
        .mp-card:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(0,0,0,.09)}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        {/* ── Header ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255,255,255,.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: "1180px", margin: "0 auto", padding: "14px 20px" }}
          >
            <Link href="/landing" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}
              >
                <IconBuilding size={16} color="white" />
              </div>
              <span className="text-sm font-extrabold" style={{ color: "#0F172A" }}>
                LocCam
              </span>
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: "#0F172A", color: "#fff" }}
            >
              Espace bailleur
            </Link>
          </div>
        </header>

        {/* ── Titre + recherche ── */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "32px 20px 0" }}>
          <h1 className="text-2xl font-extrabold mb-1.5" style={{ color: "#0F172A" }}>
            Trouvez votre prochain logement
          </h1>
          <p className="text-sm mb-6" style={{ color: "#64748B" }}>
            {loading ? "Recherche en cours…" : `${count} bien${count > 1 ? "s" : ""} disponible${count > 1 ? "s" : ""}`}
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
            <div className="relative flex-1">
              <IconSearch
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94A3B8",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Quartier, ville, titre du bien…"
                className="w-full text-sm"
                style={{
                  padding: "12px 14px 12px 40px",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  background: "#fff",
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{
                background: hasActiveFilters ? "#EFF6FF" : "#fff",
                color: hasActiveFilters ? "#2563EB" : "#475569",
                border: `1px solid ${hasActiveFilters ? "#BFDBFE" : "#E2E8F0"}`,
              }}
            >
              <IconAdjustments size={15} />
              Filtres
              {hasActiveFilters && (
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "#2563EB" }}
                />
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-3 items-end mb-6 p-4 rounded-2xl"
              style={{ background: "#fff", border: "1px solid #E2E8F0" }}
            >
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#475569" }}>
                  Type de bien
                </label>
                <select
                  value={typeBien}
                  onChange={(e) => setTypeBien(e.target.value)}
                  className="text-sm"
                  style={{
                    padding: "9px 12px",
                    borderRadius: "9px",
                    border: "1px solid #E2E8F0",
                    background: "#fff",
                    minWidth: "160px",
                  }}
                >
                  {TYPES_BIEN.map((t) => (
                    <option key={t.val} value={t.val}>
                      {t.lbl}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#475569" }}>
                  Loyer min (XAF)
                </label>
                <input
                  type="number"
                  value={prixMin}
                  onChange={(e) => setPrixMin(e.target.value)}
                  placeholder="0"
                  className="text-sm"
                  style={{
                    padding: "9px 12px",
                    borderRadius: "9px",
                    border: "1px solid #E2E8F0",
                    width: "120px",
                  }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#475569" }}>
                  Loyer max (XAF)
                </label>
                <input
                  type="number"
                  value={prixMax}
                  onChange={(e) => setPrixMax(e.target.value)}
                  placeholder="500 000"
                  className="text-sm"
                  style={{
                    padding: "9px 12px",
                    borderRadius: "9px",
                    border: "1px solid #E2E8F0",
                    width: "120px",
                  }}
                />
              </div>
              <button
                onClick={load}
                className="text-sm font-semibold px-4 py-2.5 rounded-lg text-white"
                style={{ background: "#2563EB", border: "none", cursor: "pointer" }}
              >
                Appliquer
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    resetFilters();
                    setTimeout(load, 0);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2.5"
                  style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer" }}
                >
                  <IconX size={13} /> Réinitialiser
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Grille de résultats ── */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "0 20px 60px" }}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-72" />
                ))}
            </div>
          ) : biens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#EFF6FF" }}
              >
                <IconHome2 size={28} style={{ color: "#93C5FD" }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#0F172A" }}>
                Aucun bien ne correspond à votre recherche
              </h3>
              <p className="text-sm" style={{ color: "#64748B" }}>
                Essayez d'élargir vos critères de recherche.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {biens.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.04 }}
                  >
                    <Link href={`/marketplace/${b.id}`}>
                      <div
                        className="mp-card bg-white rounded-2xl overflow-hidden"
                        style={{ border: "1px solid #E2E8F0" }}
                      >
                        <div
                          className="relative h-48 overflow-hidden"
                          style={{ background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)" }}
                        >
                          {b.photos && b.photos.length > 0 ? (
                            <img
                              src={b.photos.find((p) => p.est_principale)?.url ?? b.photos[0].url}
                              alt={b.titre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconBuilding size={36} style={{ color: "#93C5FD" }} />
                            </div>
                          )}
                          <div className="absolute top-3 left-3">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{ background: "rgba(255,255,255,.92)", color: "#475569" }}
                            >
                              {TYPES_BIEN.find((t) => t.val === b.type_bien)?.lbl ?? b.type_bien}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3
                            className="text-sm font-bold mb-1 truncate"
                            style={{ color: "#0F172A" }}
                          >
                            {b.titre}
                          </h3>
                          <div className="flex items-center gap-1.5 mb-3">
                            <IconMapPin size={12} style={{ color: "#94A3B8", flexShrink: 0 }} />
                            <span className="text-xs truncate" style={{ color: "#64748B" }}>
                              {b.adresse}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-base font-extrabold" style={{ color: "#059669" }}>
                              {b.prix.toLocaleString("fr-FR")} XAF
                              <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                                {" "}/mois
                              </span>
                            </div>
                            <IconChevronRight size={16} style={{ color: "#CBD5E1" }} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {nextUrl && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl"
                    style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#334155" }}
                  >
                    {loadingMore && (
                      <IconLoader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                    )}
                    Voir plus de biens
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
