"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
import {
  IconBuilding,
  IconSearch,
  IconMapPin,
  IconHome2,
  IconAdjustments,
  IconX,
  IconLoader2,
  IconHeart,
  IconHeartFilled,
  IconApps,
  IconBed,
  IconBuildingSkyscraper,
  IconStairs,
  IconHome,
  IconShoppingBag,
  IconBriefcase,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconChevronLeft,
  IconChevronRight,
  IconMap,
  IconList,
} from "@tabler/icons-react";

const MarketplaceMap = dynamic(() => import("@/components/MarketplaceMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg,#F5F4F0 25%,#FBFAF8 50%,#F5F4F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  ),
});

const CATEGORIES: { val: string; lbl: string; icon: React.ElementType }[] = [
  { val: "", lbl: "Tous", icon: IconApps },
  { val: "chambre", lbl: "Chambre", icon: IconBed },
  { val: "studio", lbl: "Studio", icon: IconHome2 },
  { val: "f1", lbl: "F1", icon: IconBuildingSkyscraper },
  { val: "f2", lbl: "F2", icon: IconBuildingSkyscraper },
  { val: "f3", lbl: "F3", icon: IconBuildingSkyscraper },
  { val: "f4_plus", lbl: "F4+", icon: IconBuildingSkyscraper },
  { val: "duplex", lbl: "Duplex", icon: IconStairs },
  { val: "villa", lbl: "Villa", icon: IconHome },
  { val: "boutique", lbl: "Boutique", icon: IconShoppingBag },
  { val: "bureau", lbl: "Bureau", icon: IconBriefcase },
  { val: "magasin", lbl: "Magasin", icon: IconBuildingStore },
  { val: "entrepot", lbl: "Entrepôt", icon: IconBuildingWarehouse },
];

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg,#EDEBE6 25%,#F5F4F0 50%,#EDEBE6 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

function RechercheContent() {
  const searchParams = useSearchParams();

  const [biens, setBiens] = useState<Bien[]>([]);
  const [count, setCount] = useState(0);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [favoris, setFavoris] = useState<Set<number>>(new Set());
  const [pendingFavori, setPendingFavori] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  // ── Filtres initiaux repris de l'URL (venant de la page d'accueil marketplace) ──
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categorie, setCategorie] = useState(searchParams.get("type_bien") ?? "");
  const [prixMin, setPrixMin] = useState(searchParams.get("prix_min") ?? "");
  const [prixMax, setPrixMax] = useState(searchParams.get("prix_max") ?? "");

  const catScrollRef = useRef<HTMLDivElement>(null);

  const buildParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (categorie) params.type_bien = categorie;
    if (prixMin) params.prix_min = prixMin;
    if (prixMax) params.prix_max = prixMax;
    return params;
  }, [search, categorie, prixMin, prixMax]);

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

  useEffect(() => {
    if (!isLoggedIn()) return;
    api
      .get<PaginatedResponse<{ bien: { id: number } }>>("/favoris/")
      .then((res) => {
        setFavoris(new Set(res.data.results.map((f) => f.bien.id)));
      })
      .catch(() => {});
  }, []);

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

  const toggleFavori = async (e: React.MouseEvent, bienId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn()) {
      toast("Connectez-vous pour enregistrer ce bien en favori.");
      return;
    }
    setPendingFavori(bienId);
    const estFavori = favoris.has(bienId);
    try {
      if (estFavori) {
        await api.delete(`/favoris/${bienId}/`);
        setFavoris((prev) => {
          const next = new Set(prev);
          next.delete(bienId);
          return next;
        });
      } else {
        await api.post(`/favoris/${bienId}/`);
        setFavoris((prev) => new Set(prev).add(bienId));
      }
    } catch {
      toast.error("Impossible de mettre à jour vos favoris.");
    } finally {
      setPendingFavori(null);
    }
  };

  const scrollCategories = (dir: 1 | -1) => {
    catScrollRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  const hasActiveFilters = !!(prixMin || prixMax);

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .mp-card{transition:transform .25s ease, box-shadow .25s ease}
        .mp-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(15,23,42,.10)}
        .mp-cat-scroll::-webkit-scrollbar{display:none}
        .mp-cat-scroll{scrollbar-width:none;-ms-overflow-style:none}
        .mp-heart{transition:transform .15s ease}
        .mp-heart:active{transform:scale(0.85)}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
        {/* ── Header ── */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "rgba(255,255,255,.94)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid #EDEBE6",
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: "1180px", margin: "0 auto", padding: "16px 20px" }}
          >
            <Link href="/marketplace" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}
              >
                <IconBuilding size={16} color="white" />
              </div>
              <span
                className="text-sm font-extrabold tracking-tight"
                style={{ color: "#0F172A" }}
              >
                LocCam
              </span>
            </Link>

            <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
              <div
                className="relative w-full flex items-center"
                style={{
                  border: "1px solid #E2E0D9",
                  borderRadius: "999px",
                  boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                }}
              >
                <IconSearch size={15} style={{ marginLeft: 16, color: "#78716C", flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && load()}
                  placeholder="Quartier, ville, titre du bien…"
                  className="w-full text-sm bg-transparent"
                  style={{ padding: "11px 14px", border: "none", outline: "none" }}
                />
                <button
                  onClick={load}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 34,
                    height: 34,
                    marginRight: 4,
                    borderRadius: "999px",
                    background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <IconSearch size={13} color="white" />
                </button>
              </div>
            </div>

            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2.5 rounded-full flex-shrink-0"
              style={{ background: "#0F172A", color: "#fff" }}
            >
              Espace bailleur
            </Link>
          </div>

          {/* Recherche mobile */}
          <div className="sm:hidden" style={{ padding: "0 20px 14px" }}>
            <div
              className="relative w-full flex items-center"
              style={{ border: "1px solid #E2E0D9", borderRadius: "999px" }}
            >
              <IconSearch size={15} style={{ marginLeft: 14, color: "#78716C", flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                placeholder="Rechercher un quartier…"
                className="w-full text-sm bg-transparent"
                style={{ padding: "10px 14px", border: "none", outline: "none" }}
              />
            </div>
          </div>

          {/* ── Barre de catégories (signature Airbnb) ── */}
          <div className="relative" style={{ borderTop: "1px solid #F5F4F0" }}>
            <div
              ref={catScrollRef}
              className="mp-cat-scroll flex items-center gap-1 overflow-x-auto"
              style={{ maxWidth: "1180px", margin: "0 auto", padding: "12px 44px" }}
            >
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const active = categorie === c.val;
                return (
                  <button
                    key={c.val}
                    onClick={() => setCategorie(c.val)}
                    className="flex flex-col items-center gap-1.5 flex-shrink-0"
                    style={{
                      padding: "6px 14px 10px",
                      background: "none",
                      border: "none",
                      borderBottom: active ? "2px solid #0F172A" : "2px solid transparent",
                      cursor: "pointer",
                      opacity: active ? 1 : 0.62,
                    }}
                  >
                    <Icon size={20} style={{ color: "#0F172A" }} stroke={1.5} />
                    <span
                      className="text-xs whitespace-nowrap"
                      style={{ color: "#0F172A", fontWeight: active ? 700 : 500 }}
                    >
                      {c.lbl}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => scrollCategories(-1)}
              className="hidden md:flex items-center justify-center absolute left-1 top-1/2"
              style={{
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "999px",
                background: "#fff",
                border: "1px solid #E2E0D9",
                boxShadow: "0 2px 6px rgba(15,23,42,.08)",
                cursor: "pointer",
              }}
            >
              <IconChevronLeft size={13} />
            </button>
            <button
              onClick={() => scrollCategories(1)}
              className="hidden md:flex items-center justify-center absolute right-1 top-1/2"
              style={{
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                borderRadius: "999px",
                background: "#fff",
                border: "1px solid #E2E0D9",
                boxShadow: "0 2px 6px rgba(15,23,42,.08)",
                cursor: "pointer",
              }}
            >
              <IconChevronRight size={13} />
            </button>
          </div>
        </header>

        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "20px 20px 0" }}>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm" style={{ color: "#78716C" }}>
              {loading
                ? "Recherche en cours…"
                : `${count} bien${count > 1 ? "s" : ""} disponible${count > 1 ? "s" : ""}`}
            </p>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full"
              style={{
                background: hasActiveFilters ? "#EFF6FF" : "#fff",
                color: hasActiveFilters ? "#2563EB" : "#0F172A",
                border: `1px solid ${hasActiveFilters ? "#BFDBFE" : "#E2E0D9"}`,
              }}
            >
              <IconAdjustments size={14} />
              Prix
              {hasActiveFilters && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2563EB" }} />
              )}
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-3 items-end mb-6 p-4 rounded-2xl"
              style={{ background: "#FBFAF8", border: "1px solid #EDEBE6" }}
            >
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#44403C" }}>
                  Loyer min (XAF)
                </label>
                <input
                  type="number"
                  value={prixMin}
                  onChange={(e) => setPrixMin(e.target.value)}
                  placeholder="0"
                  className="text-sm"
                  style={{ padding: "9px 12px", borderRadius: "9px", border: "1px solid #E2E0D9", width: "130px" }}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#44403C" }}>
                  Loyer max (XAF)
                </label>
                <input
                  type="number"
                  value={prixMax}
                  onChange={(e) => setPrixMax(e.target.value)}
                  placeholder="500 000"
                  className="text-sm"
                  style={{ padding: "9px 12px", borderRadius: "9px", border: "1px solid #E2E0D9", width: "130px" }}
                />
              </div>
              <button
                onClick={load}
                className="text-sm font-semibold px-4 py-2.5 rounded-full text-white"
                style={{ background: "#0F172A", border: "none", cursor: "pointer" }}
              >
                Appliquer
              </button>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setPrixMin("");
                    setPrixMax("");
                    setTimeout(load, 0);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-2.5"
                  style={{ background: "none", border: "none", color: "#A8A29E", cursor: "pointer" }}
                >
                  <IconX size={13} /> Réinitialiser
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* ── Résultats : liste + carte (comme Airbnb) ── */}
        <div style={{ maxWidth: "1440px", margin: "0 auto", padding: "0 20px 70px" }}>
          <div className="flex gap-7">
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <Skeleton className="aspect-square mb-3" />
                        <Skeleton className="h-3.5 w-3/4 mb-2" />
                        <Skeleton className="h-3.5 w-1/2" />
                      </div>
                    ))}
                </div>
              ) : biens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#F5F4F0" }}
                  >
                    <IconHome2 size={28} style={{ color: "#A8A29E" }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: "#0F172A" }}>
                    Aucun bien ne correspond à votre recherche
                  </h3>
                  <p className="text-sm" style={{ color: "#78716C" }}>
                    Essayez d'élargir vos critères ou une autre catégorie.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-8">
                    {biens.map((b, i) => {
                      const estFavori = favoris.has(b.id);
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i, 8) * 0.03 }}
                          onMouseEnter={() => setHoveredId(b.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <Link href={`/marketplace/${b.id}`}>
                            <div className="mp-card">
                              <div
                                className="relative rounded-2xl overflow-hidden mb-2.5"
                                style={{
                                  aspectRatio: "1 / 1",
                                  background: "linear-gradient(135deg,#F5F4F0,#EDEBE6)",
                                  outline: hoveredId === b.id ? "2px solid #0F172A" : "none",
                                  outlineOffset: "2px",
                                }}
                              >
                                {b.photos && b.photos.length > 0 ? (
                                  <img
                                    src={b.photos.find((p) => p.est_principale)?.url ?? b.photos[0].url}
                                    alt={b.titre}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <IconBuilding size={32} style={{ color: "#D6D3CE" }} />
                                  </div>
                                )}
                                <button
                                  onClick={(e) => toggleFavori(e, b.id)}
                                  className="mp-heart absolute top-2.5 right-2.5 flex items-center justify-center"
                                  style={{
                                    width: 30,
                                    height: 30,
                                    background: "none",
                                    border: "none",
                                    cursor: pendingFavori === b.id ? "wait" : "pointer",
                                  }}
                                >
                                  {pendingFavori === b.id ? (
                                    <IconLoader2
                                      size={17}
                                      color="#fff"
                                      style={{
                                        animation: "spin .8s linear infinite",
                                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))",
                                      }}
                                    />
                                  ) : estFavori ? (
                                    <IconHeartFilled
                                      size={19}
                                      style={{ color: "#E11D48", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }}
                                    />
                                  ) : (
                                    <IconHeart
                                      size={19}
                                      style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}
                                      strokeWidth={2}
                                    />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <h3
                                  className="text-sm font-semibold truncate"
                                  style={{ color: "#0F172A" }}
                                >
                                  {b.titre}
                                </h3>
                              </div>
                              <div className="flex items-center gap-1 mb-1">
                                <IconMapPin size={11} style={{ color: "#A8A29E", flexShrink: 0 }} />
                                <span className="text-xs truncate" style={{ color: "#78716C" }}>
                                  {b.adresse}
                                </span>
                              </div>
                              <div className="text-sm" style={{ color: "#0F172A" }}>
                                <span className="font-bold">{b.prix.toLocaleString("fr-FR")} XAF</span>
                                <span style={{ color: "#78716C" }}> / mois</span>
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>

                  {nextUrl && (
                    <div className="flex justify-center mt-10">
                      <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full"
                        style={{ background: "#fff", border: "1px solid #E2E0D9", color: "#0F172A" }}
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

            {/* ── Carte desktop, sticky ── */}
            {!loading && biens.length > 0 && (
              <div
                className="hidden lg:block flex-shrink-0"
                style={{
                  width: "440px",
                  position: "sticky",
                  top: "140px",
                  height: "calc(100vh - 160px)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #EDEBE6",
                }}
              >
                <MarketplaceMap biens={biens} hoveredId={hoveredId} onHover={setHoveredId} />
              </div>
            )}
          </div>
        </div>

        {/* ── Bouton flottant carte (mobile) ── */}
        {!loading && biens.length > 0 && !mobileMapOpen && (
          <button
            onClick={() => setMobileMapOpen(true)}
            className="lg:hidden flex items-center gap-2 text-sm font-semibold"
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
              padding: "12px 20px",
              borderRadius: "999px",
              background: "#0F172A",
              color: "#fff",
              border: "none",
              boxShadow: "0 8px 24px rgba(15,23,42,.35)",
              cursor: "pointer",
            }}
          >
            <IconMap size={16} /> Afficher la carte
          </button>
        )}

        {/* ── Carte plein écran (mobile) ── */}
        {mobileMapOpen && (
          <div
            className="lg:hidden"
            style={{ position: "fixed", inset: 0, zIndex: 60, background: "#fff" }}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <MarketplaceMap biens={biens} hoveredId={hoveredId} onHover={setHoveredId} />
            </div>
            <button
              onClick={() => setMobileMapOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{
                position: "fixed",
                bottom: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "12px 20px",
                borderRadius: "999px",
                background: "#0F172A",
                color: "#fff",
                border: "none",
                boxShadow: "0 8px 24px rgba(15,23,42,.35)",
                cursor: "pointer",
              }}
            >
              <IconList size={16} /> Afficher la liste
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function MarketplaceRecherchePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#fff" }} />
      }
    >
      <RechercheContent />
    </Suspense>
  );
}
