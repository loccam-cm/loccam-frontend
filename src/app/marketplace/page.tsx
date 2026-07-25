"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
import {
  IconBuilding,
  IconSearch,
  IconMapPin,
  IconChevronLeft,
  IconChevronRight,
  IconHeart,
  IconHeartFilled,
  IconLoader2,
  IconHome2,
  IconBed,
  IconBuildingSkyscraper,
  IconStairs,
  IconHome,
  IconShoppingBag,
  IconBriefcase,
  IconFlame,
} from "@tabler/icons-react";

const GROUPES: { val: string; titre: string; icon: React.ElementType }[] = [
  { val: "studio", titre: "Studios à Douala", icon: IconHome2 },
  { val: "chambre", titre: "Chambres à Douala", icon: IconBed },
  { val: "f2", titre: "Appartements F2 à Douala", icon: IconBuildingSkyscraper },
  { val: "f3", titre: "Appartements F3 à Douala", icon: IconBuildingSkyscraper },
  { val: "duplex", titre: "Duplex à Douala", icon: IconStairs },
  { val: "villa", titre: "Villas à Douala", icon: IconHome },
  { val: "boutique", titre: "Boutiques à Douala", icon: IconShoppingBag },
  { val: "bureau", titre: "Bureaux à Douala", icon: IconBriefcase },
];

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

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

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

function BienCard({
  b,
  estFavori,
  pending,
  onToggleFavori,
  badge,
}: {
  b: Bien;
  estFavori: boolean;
  pending: boolean;
  onToggleFavori: (e: React.MouseEvent) => void;
  badge?: string;
}) {
  return (
    <Link href={`/marketplace/${b.id}`}>
      <div className="mp-card" style={{ width: "220px" }}>
        <div
          className="relative rounded-2xl overflow-hidden mb-2.5"
          style={{
            aspectRatio: "1 / 1",
            background: "linear-gradient(135deg,#F5F4F0,#EDEBE6)",
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
              <IconBuilding size={30} style={{ color: "#D6D3CE" }} />
            </div>
          )}
          {badge && (
            <span
              className="absolute top-2.5 left-2.5 flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: "#fff", color: "#0F172A" }}
            >
              <IconFlame size={11} style={{ color: "#EA580C" }} /> {badge}
            </span>
          )}
          <button
            onClick={onToggleFavori}
            className="mp-heart absolute top-2.5 right-2.5 flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              background: "none",
              border: "none",
              cursor: pending ? "wait" : "pointer",
            }}
          >
            {pending ? (
              <IconLoader2
                size={16}
                color="#fff"
                style={{ animation: "spin .8s linear infinite", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}
              />
            ) : estFavori ? (
              <IconHeartFilled size={18} style={{ color: "#E11D48", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.35))" }} />
            ) : (
              <IconHeart size={18} style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }} strokeWidth={2} />
            )}
          </button>
        </div>
        <h3 className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
          {b.titre}
        </h3>
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
  );
}

function CarrouselGroupe({
  titre,
  icon: Icon,
  biens,
  loading,
  favoris,
  pendingFavori,
  onToggleFavori,
  seuilPopulaire,
  voirToutHref,
}: {
  titre: string;
  icon: React.ElementType;
  biens: Bien[];
  loading: boolean;
  favoris: Set<number>;
  pendingFavori: number | null;
  onToggleFavori: (e: React.MouseEvent, id: number) => void;
  seuilPopulaire: number;
  voirToutHref: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => scrollRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  if (!loading && biens.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color: "#0F172A" }} stroke={1.5} />
          <h2 className="text-base font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
            {titre}
          </h2>
        </div>
        <Link
          href={voirToutHref}
          className="text-xs font-semibold flex-shrink-0"
          style={{ color: "#0F172A", textDecoration: "underline" }}
        >
          Tout afficher
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="mp-cat-scroll flex gap-4 overflow-x-auto pb-1"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {loading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} style={{ width: "220px", flexShrink: 0 }}>
                    <Skeleton className="aspect-square mb-2.5" />
                    <Skeleton className="h-3.5 w-3/4 mb-2" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                ))
            : biens.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 6) * 0.03 }}
                  style={{ flexShrink: 0, scrollSnapAlign: "start" }}
                >
                  <BienCard
                    b={b}
                    estFavori={favoris.has(b.id)}
                    pending={pendingFavori === b.id}
                    onToggleFavori={(e) => onToggleFavori(e, b.id)}
                    badge={b.nb_vues && b.nb_vues >= seuilPopulaire ? "Populaire" : undefined}
                  />
                </motion.div>
              ))}
        </div>
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex items-center justify-center absolute -left-4 top-1/3"
          style={{
            width: 32,
            height: 32,
            borderRadius: "999px",
            background: "#fff",
            border: "1px solid #E2E0D9",
            boxShadow: "0 2px 8px rgba(15,23,42,.12)",
            cursor: "pointer",
          }}
        >
          <IconChevronLeft size={15} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex items-center justify-center absolute -right-4 top-1/3"
          style={{
            width: 32,
            height: 32,
            borderRadius: "999px",
            background: "#fff",
            border: "1px solid #E2E0D9",
            boxShadow: "0 2px 8px rgba(15,23,42,.12)",
            cursor: "pointer",
          }}
        >
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function MarketplaceHomePage() {
  const router = useRouter();
  const [parType, setParType] = useState<Record<string, Bien[]>>({});
  const [loading, setLoading] = useState(true);
  const [favoris, setFavoris] = useState<Set<number>>(new Set());
  const [pendingFavori, setPendingFavori] = useState<number | null>(null);
  const [seuilPopulaire, setSeuilPopulaire] = useState(0);

  const [ou, setOu] = useState("");
  const [type, setType] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all(
      GROUPES.map((g) =>
        api
          .get<PaginatedResponse<Bien>>("/marketplace/biens/", {
            params: { type_bien: g.val },
          })
          .then((res) => [g.val, res.data.results] as const)
          .catch(() => [g.val, [] as Bien[]] as const)
      )
    ).then((entries) => {
      const map: Record<string, Bien[]> = {};
      let maxVues = 0;
      entries.forEach(([val, list]) => {
        map[val] = list;
        list.forEach((b) => {
          if ((b.nb_vues ?? 0) > maxVues) maxVues = b.nb_vues ?? 0;
        });
      });
      setParType(map);
      setSeuilPopulaire(Math.max(5, Math.round(maxVues * 0.7)));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) return;
    api
      .get<PaginatedResponse<{ bien: { id: number } }>>("/favoris/")
      .then((res) => setFavoris(new Set(res.data.results.map((f) => f.bien.id))))
      .catch(() => {});
  }, []);

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

  const lancerRecherche = () => {
    const params = new URLSearchParams();
    if (ou) params.set("search", ou);
    if (type) params.set("type_bien", type);
    if (budgetMax) params.set("prix_max", budgetMax);
    router.push(`/marketplace/recherche${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const groupesAffiches = GROUPES.filter((g) => loading || (parType[g.val]?.length ?? 0) > 0);

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
        <header style={{ borderBottom: "1px solid #EDEBE6" }}>
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: "1180px", margin: "0 auto", padding: "16px 20px" }}
          >
            <Link href="/landing" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#2563EB,#1D4ED8)" }}
              >
                <IconBuilding size={16} color="white" />
              </div>
              <span className="text-sm font-extrabold tracking-tight" style={{ color: "#0F172A" }}>
                LocCam
              </span>
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2.5 rounded-full flex-shrink-0"
              style={{ background: "#0F172A", color: "#fff" }}
            >
              Espace bailleur
            </Link>
          </div>
        </header>

        {/* ── Hero + barre de recherche en pilule ── */}
        <div
          style={{
            background: "linear-gradient(180deg,#FBFAF8 0%,#FFFFFF 100%)",
            borderBottom: "1px solid #F5F4F0",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto", padding: "56px 20px 44px", textAlign: "center" }}>
            <h1
              className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2"
              style={{ color: "#0F172A" }}
            >
              Trouvez votre prochain logement à Douala
            </h1>
            <p className="text-sm mb-8" style={{ color: "#78716C" }}>
              Studios, chambres, appartements, villas — publiés directement par des bailleurs vérifiés.
            </p>

            <div
              className="flex flex-col sm:flex-row items-stretch sm:items-center mx-auto"
              style={{
                maxWidth: "700px",
                background: "#fff",
                border: "1px solid #E2E0D9",
                borderRadius: "999px",
                boxShadow: "0 4px 16px rgba(15,23,42,.07)",
                padding: "6px",
              }}
            >
              <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5">
                <IconMapPin size={16} style={{ color: "#78716C", flexShrink: 0 }} />
                <div className="text-left w-full">
                  <div className="text-xs font-bold" style={{ color: "#0F172A" }}>Où ?</div>
                  <input
                    value={ou}
                    onChange={(e) => setOu(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && lancerRecherche()}
                    placeholder="Quartier, adresse…"
                    className="w-full text-sm bg-transparent"
                    style={{ border: "none", outline: "none", color: "#44403C" }}
                  />
                </div>
              </div>

              <div className="hidden sm:block" style={{ width: 1, height: 34, background: "#E2E0D9" }} />

              <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5">
                <IconHome2 size={16} style={{ color: "#78716C", flexShrink: 0 }} />
                <div className="text-left w-full">
                  <div className="text-xs font-bold" style={{ color: "#0F172A" }}>Type</div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-sm bg-transparent"
                    style={{ border: "none", outline: "none", color: "#44403C", cursor: "pointer" }}
                  >
                    {TYPES_BIEN.map((t) => (
                      <option key={t.val} value={t.val}>{t.lbl}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden sm:block" style={{ width: 1, height: 34, background: "#E2E0D9" }} />

              <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5">
                <div className="text-left w-full">
                  <div className="text-xs font-bold" style={{ color: "#0F172A" }}>Budget max</div>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && lancerRecherche()}
                    placeholder="XAF / mois"
                    className="w-full text-sm bg-transparent"
                    style={{ border: "none", outline: "none", color: "#44403C" }}
                  />
                </div>
              </div>

              <button
                onClick={lancerRecherche}
                className="flex items-center justify-center gap-2 text-sm font-bold text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 20px",
                  cursor: "pointer",
                  marginTop: "4px",
                }}
              >
                <IconSearch size={15} />
                <span className="sm:hidden">Rechercher</span>
              </button>
            </div>

            <Link
              href="/marketplace/recherche"
              className="inline-flex items-center gap-1.5 text-xs font-semibold mt-5"
              style={{ color: "#0F172A", textDecoration: "underline" }}
            >
              Ou parcourir tous les biens sur la carte
            </Link>
          </div>
        </div>

        {/* ── Carrousels par type de bien ── */}
        <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "40px 20px 70px" }}>
          {!loading && groupesAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#F5F4F0" }}
              >
                <IconHome2 size={28} style={{ color: "#A8A29E" }} />
              </div>
              <h3 className="text-base font-bold mb-2" style={{ color: "#0F172A" }}>
                Aucun bien publié pour le moment
              </h3>
              <p className="text-sm" style={{ color: "#78716C" }}>
                Reviens bientôt — de nouveaux logements sont ajoutés régulièrement.
              </p>
            </div>
          ) : (
            groupesAffiches.map((g) => (
              <CarrouselGroupe
                key={g.val}
                titre={g.titre}
                icon={g.icon}
                biens={loading ? [] : (parType[g.val] ?? []).slice(0, 8)}
                loading={loading}
                favoris={favoris}
                pendingFavori={pendingFavori}
                onToggleFavori={toggleFavori}
                seuilPopulaire={seuilPopulaire}
                voirToutHref={`/marketplace/recherche?type_bien=${g.val}`}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}
