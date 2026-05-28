"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
import UploadFichier from '@/components/UploadFichier'
import {
  IconHome2,
  IconPlus,
  IconSearch,
  IconFilter,
  IconBuilding,
  IconMapPin,
  IconCurrencyDollar,
  IconEye,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconBed,
  IconDoor,
  IconAlertCircle,
  IconRefresh,
  IconArrowLeft,
} from "@tabler/icons-react";

// ── Types ────────────────────────────────────────────────────
interface Structure {
  id: number;
  nom: string;
}

interface FormData {
  titre: string;
  description: string;
  adresse: string;
  ville: string;
  prix: string;
  caution: string;
  type_bien: string;
  categorie: string;
  surface: string;
  nb_pieces: string;
  nb_chambres: string;
  etage: string;
  structure: string;
  meuble: boolean;
  eau_incluse: boolean;
  elec_incluse: boolean;
}

const TYPES_BIEN = [
  { val: "studio", lbl: "Studio" },
  { val: "f1", lbl: "F1" },
  { val: "f2", lbl: "F2" },
  { val: "f3", lbl: "F3" },
  { val: "f4", lbl: "F4+" },
  { val: "duplex", lbl: "Duplex" },
  { val: "villa", lbl: "Villa" },
  { val: "boutique", lbl: "Boutique" },
  { val: "bureau", lbl: "Bureau" },
  { val: "magasin", lbl: "Magasin" },
  { val: "entrepot", lbl: "Entrepôt" },
];

const CATEGORIES = [
  { val: "residentiel", lbl: "Résidentiel" },
  { val: "commercial", lbl: "Commercial" },
  { val: "mixte", lbl: "Mixte" },
];

const VILLES = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Limbé",
  "Kribi",
  "Garoua",
  "Ngaoundéré",
  "Autre",
];

// ── Skeleton ─────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl ${className}`}
      style={{
        background:
          "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ── Badge statut ─────────────────────────────────────────────
function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; col: string; lbl: string }> = {
    libre: { bg: "#ECFDF5", col: "#059669", lbl: "Libre" },
    occupe: { bg: "#EFF6FF", col: "#2563EB", lbl: "Occupé" },
    en_travaux: { bg: "#FFFBEB", col: "#D97706", lbl: "En travaux" },
    indisponible: { bg: "#FEF2F2", col: "#DC2626", lbl: "Indisponible" },
  };
  const s = map[statut] ?? { bg: "#F1F5F9", col: "#64748B", lbl: statut };
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.col }}
    >
      {s.lbl}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
//  PAGE
// ────────────────────────────────────────────────────────────
export default function BiensPage() {
  const { user } = useAuth();

  // Liste
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterStatut, setFilter] = useState("tous");

  // Formulaire
  const [showForm, setShowForm] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [editBien, setEditBien] = useState<Bien | null>(null);

  const [form, setForm] = useState<FormData>({
    titre: "",
    description: "",
    adresse: "",
    ville: "Douala",
    prix: "",
    caution: "",
    type_bien: "studio",
    categorie: "residentiel",
    surface: "",
    nb_pieces: "",
    nb_chambres: "",
    etage: "",
    structure: "",
    meuble: false,
    eau_incluse: false,
    elec_incluse: false,
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [biensRes, structRes] = await Promise.all([
        api.get<PaginatedResponse<Bien>>("/biens/"),
        api.get<PaginatedResponse<Structure>>("/structures/"),
      ]);
      setBiens(biensRes.data.results);
      // Charger les photos
      const photosRes = await api.get(
        "/documents/mes-documents/?type=photo_bien",
      );
      const photosData = photosRes.data ?? [];
      setBiens(
        biensRes.data.results.map((b: Bien) => ({
          ...b,
          photos: photosData.filter(
            (d: { object_id: number }) => d.object_id === b.id,
          ),
        })),
      );
      setStructures(structRes.data.results);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditBien(null);
    setForm({
      titre: "",
      description: "",
      adresse: "",
      ville: "Douala",
      prix: "",
      caution: "",
      type_bien: "studio",
      categorie: "residentiel",
      surface: "",
      nb_pieces: "",
      nb_chambres: "",
      etage: "",
      structure: structures[0]?.id.toString() ?? "",
      meuble: false,
      eau_incluse: false,
      elec_incluse: false,
    });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (b: Bien) => {
    setEditBien(b);
    setForm({
      titre: b.titre,
      description: b.description ?? "",
      adresse: b.adresse,
      ville: b.ville ?? "Douala",
      prix: b.prix.toString(),
      caution: b.caution?.toString() ?? "",
      type_bien: b.type_bien,
      categorie: b.categorie,
      surface: b.surface?.toString() ?? "",
      nb_pieces: b.nb_pieces?.toString() ?? "",
      nb_chambres: b.nb_chambres?.toString() ?? "",
      etage: b.etage?.toString() ?? "",
      structure: b.structure?.toString() ?? "",
      meuble: b.meuble ?? false,
      eau_incluse: b.eau_incluse ?? false,
      elec_incluse: b.elec_incluse ?? false,
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.titre.trim()) e.titre = "Le titre est requis";
    if (!form.adresse.trim()) e.adresse = "L'adresse est requise";
    if (!form.prix || isNaN(Number(form.prix))) e.prix = "Loyer invalide";
    if (!form.structure) e.structure = "Choisissez une structure";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        prix: Number(form.prix),
        caution: form.caution ? Number(form.caution) : null,
        surface: form.surface ? Number(form.surface) : null,
        nb_pieces: form.nb_pieces ? Number(form.nb_pieces) : null,
        nb_chambres: form.nb_chambres ? Number(form.nb_chambres) : null,
        etage: form.etage ? Number(form.etage) : null,
        structure: Number(form.structure),
      };
      if (editBien) {
        await api.put(`/biens/${editBien.id}/`, payload);
      } else {
        await api.post("/biens/", payload);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        load();
      }, 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      if (e.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.entries(e.response.data).forEach(([k, v]) => {
          apiErrors[k] = Array.isArray(v) ? v[0] : String(v);
        });
        setErrors(apiErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce bien ?")) return;
    try {
      await api.delete(`/biens/${id}/`);
      load();
    } catch {}
  };

  const set = (k: keyof FormData, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  // Filtrage
  const filtered = biens.filter((b) => {
    const matchSearch =
      !search ||
      b.titre.toLowerCase().includes(search.toLowerCase()) ||
      b.adresse.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === "tous" || b.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .bien-card{transition:all .2s ease}
        .bien-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.08)}
        .input-field{width:100%;height:40px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s}
        .input-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .input-field.error{border-color:#EF4444}
        .textarea-field{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:80px;transition:border-color .15s}
        .textarea-field:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .select-field{width:100%;height:40px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;cursor:pointer;transition:border-color .15s}
        .select-field:focus{border-color:#2563EB}
        .toggle{width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;transition:background .2s;flex-shrink:0}
        .toggle::after{content:'';position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* ── CONTENU ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header
            className="flex items-center gap-4 px-6 h-16 flex-shrink-0 bg-white"
            style={{
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
            <Link
              href="/bailleur"
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: "#64748B", textDecoration: "none" }}
            >
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <div className="h-5 w-px" style={{ background: "#E2E8F0" }} />
            <div className="flex items-center gap-2 flex-1">
              <IconHome2 size={18} style={{ color: "#2563EB" }} />
              <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Mes biens
              </h1>
              {!loading && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {biens.length} biens
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
              >
                <IconRefresh
                  size={15}
                  style={{
                    color: "#64748B",
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openAdd}
                className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                  boxShadow: "0 2px 8px rgba(37,99,235,.35)",
                }}
              >
                <IconPlus size={15} />
                <span className="hidden sm:inline">Ajouter un bien</span>
              </motion.button>
            </div>
          </header>

          {/* Toolbar */}
          <div
            className="flex items-center gap-3 px-6 py-4 flex-shrink-0 flex-wrap gap-y-2"
            style={{ background: "#fff", borderBottom: "1px solid #F1F5F9" }}
          >
            {/* Recherche */}
            <div className="relative flex-1 min-w-48">
              <IconSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#94A3B8" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un bien..."
                className="input-field"
                style={{ paddingLeft: "36px" }}
              />
            </div>

            {/* Filtre statut */}
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              {[
                { val: "tous", lbl: "Tous" },
                { val: "libre", lbl: "Libres" },
                { val: "occupe", lbl: "Occupés" },
              ].map((f) => (
                <button
                  key={f.val}
                  onClick={() => setFilter(f.val)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={
                    filterStatut === f.val
                      ? {
                          background: "#fff",
                          color: "#0F172A",
                          boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                        }
                      : { color: "#64748B", background: "transparent" }
                  }
                >
                  {f.lbl}
                </button>
              ))}
            </div>

            {/* Vue grid/list */}
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              <button
                onClick={() => setView("grid")}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={
                  view === "grid"
                    ? {
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                      }
                    : {}
                }
              >
                <IconLayoutGrid
                  size={15}
                  style={{ color: view === "grid" ? "#2563EB" : "#94A3B8" }}
                />
              </button>
              <button
                onClick={() => setView("list")}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={
                  view === "list"
                    ? {
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                      }
                    : {}
                }
              >
                <IconList
                  size={15}
                  style={{ color: view === "list" ? "#2563EB" : "#94A3B8" }}
                />
              </button>
            </div>
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton
                      key={i}
                      className={view === "grid" ? "h-64" : "h-24"}
                    />
                  ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#EFF6FF" }}
                >
                  <IconHome2 size={28} style={{ color: "#93C5FD" }} />
                </div>
                <h3
                  className="text-base font-bold mb-2"
                  style={{ color: "#0F172A" }}
                >
                  {search || filterStatut !== "tous"
                    ? "Aucun bien trouvé"
                    : "Aucun bien pour l'instant"}
                </h3>
                <p className="text-sm mb-5" style={{ color: "#64748B" }}>
                  {search || filterStatut !== "tous"
                    ? "Modifiez vos filtres de recherche"
                    : "Ajoutez votre premier bien pour commencer"}
                </p>
                {!search && filterStatut === "tous" && (
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                    }}
                  >
                    <IconPlus size={15} />
                    Ajouter un bien
                  </button>
                )}
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                    className="bien-card bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                    }}
                  >
                    {/* Image */}
                    <div
                      className="relative h-44 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                      }}
                    >
                      {b.photos && b.photos.length > 0 ? (
                        <img
                          src={
                            b.photos.find((p) => p.est_principal)
                              ?.url_publique ?? b.photos[0].url_publique
                          }
                          alt={b.titre}
                          className="w-full h-full object-cover"
                          style={{ transition: "transform .3s ease" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                          <IconBuilding
                            size={36}
                            style={{ color: "#93C5FD" }}
                          />
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#93C5FD" }}
                          >
                            Aucune photo
                          </span>
                        </div>
                      )}
                      {b.photos && b.photos.length > 0 && (
                        <div
                          className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg"
                          style={{
                            background: "rgba(0,0,0,.55)",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <IconPhoto size={11} color="white" />
                          <span className="text-xs font-semibold text-white">
                            {b.photos.length}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <StatutBadge statut={b.statut} />
                      </div>
                      <div className="absolute top-3 left-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(255,255,255,.92)",
                            color: "#475569",
                          }}
                        >
                          {TYPES_BIEN.find((t) => t.val === b.type_bien)?.lbl ??
                            b.type_bien}
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
                        <IconMapPin
                          size={12}
                          style={{ color: "#94A3B8", flexShrink: 0 }}
                        />
                        <span
                          className="text-xs truncate"
                          style={{ color: "#64748B" }}
                        >
                          {b.adresse}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div
                            className="text-xs mb-0.5"
                            style={{ color: "#94A3B8" }}
                          >
                            Loyer mensuel
                          </div>
                          <div
                            className="text-base font-bold"
                            style={{ color: "#059669" }}
                          >
                            {b.prix.toLocaleString("fr-FR")} XAF
                          </div>
                        </div>
                        {b.surface && (
                          <div className="text-right">
                            <div
                              className="text-xs mb-0.5"
                              style={{ color: "#94A3B8" }}
                            >
                              Surface
                            </div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {b.surface} m²
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className="flex gap-1.5 pt-3"
                        style={{ borderTop: "1px solid #F1F5F9" }}
                      >
                        <button
                          onClick={() => openEdit(b)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: "#EFF6FF", color: "#2563EB" }}
                        >
                          <IconEdit size={13} />
                          Modifier
                        </button>
                        <button
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: "#F8FAFC", color: "#64748B" }}
                        >
                          <IconEye size={13} />
                          Voir
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="w-9 flex items-center justify-center py-2 rounded-lg text-xs transition-colors"
                          style={{ background: "#FEF2F2", color: "#EF4444" }}
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Vue liste */
              <div className="flex flex-col gap-2">
                {filtered.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bien-card bg-white rounded-xl px-5 py-4 flex items-center gap-4"
                    style={{ border: "1px solid #E2E8F0" }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "#EFF6FF" }}
                    >
                      <IconHome2 size={22} style={{ color: "#3B82F6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3
                          className="text-sm font-bold truncate"
                          style={{ color: "#0F172A" }}
                        >
                          {b.titre}
                        </h3>
                        <StatutBadge statut={b.statut} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <IconMapPin size={11} style={{ color: "#94A3B8" }} />
                        <span
                          className="text-xs truncate"
                          style={{ color: "#64748B" }}
                        >
                          {b.adresse}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right hidden sm:block">
                      <div
                        className="text-xs mb-0.5"
                        style={{ color: "#94A3B8" }}
                      >
                        Loyer
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#059669" }}
                      >
                        {b.prix.toLocaleString("fr-FR")} XAF
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEdit(b)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "#FEF2F2", color: "#EF4444" }}
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── DRAWER FORMULAIRE ────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{
                  background: "rgba(0,0,0,.35)",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setShowForm(false)}
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: "min(520px, 100vw)",
                  background: "#fff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                }}
              >
                {/* Header drawer */}
                <div
                  className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div>
                    <h2
                      className="text-base font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {editBien ? "Modifier le bien" : "Ajouter un bien"}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                      {editBien
                        ? `Modification de "${editBien.titre}"`
                        : "Remplissez les informations du logement"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "#F1F5F9" }}
                  >
                    <IconX size={16} style={{ color: "#64748B" }} />
                  </button>
                </div>

                {/* Formulaire */}
                <div className="px-6 py-5 space-y-5">
                  {/* Informations générales */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Informations générales
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Titre du bien{" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          value={form.titre}
                          onChange={(e) => set("titre", e.target.value)}
                          placeholder="Ex: Studio meublé — Appartement 101"
                          className={`input-field ${errors.titre ? "error" : ""}`}
                        />
                        {errors.titre && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.titre}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "#374151" }}
                          >
                            Type de bien
                          </label>
                          <select
                            value={form.type_bien}
                            onChange={(e) => set("type_bien", e.target.value)}
                            className="select-field"
                          >
                            {TYPES_BIEN.map((t) => (
                              <option key={t.val} value={t.val}>
                                {t.lbl}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "#374151" }}
                          >
                            Catégorie
                          </label>
                          <select
                            value={form.categorie}
                            onChange={(e) => set("categorie", e.target.value)}
                            className="select-field"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.val} value={c.val}>
                                {c.lbl}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Structure / Immeuble{" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <select
                          value={form.structure}
                          onChange={(e) => set("structure", e.target.value)}
                          className={`select-field ${errors.structure ? "border-red-400" : ""}`}
                        >
                          <option value="">-- Choisir une structure --</option>
                          {structures.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nom}
                            </option>
                          ))}
                        </select>
                        {errors.structure && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.structure}
                          </p>
                        )}
                        {structures.length === 0 && (
                          <p
                            className="text-xs mt-1.5 flex items-center gap-1"
                            style={{ color: "#D97706" }}
                          >
                            <IconAlertCircle size={12} />
                            Créez d&apos;abord une structure dans
                            &ldquo;Structures&rdquo;
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Description
                        </label>
                        <textarea
                          value={form.description}
                          onChange={(e) => set("description", e.target.value)}
                          placeholder="Décrivez le bien..."
                          className="textarea-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Localisation
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Adresse <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          value={form.adresse}
                          onChange={(e) => set("adresse", e.target.value)}
                          placeholder="Ex: Bonapriso, rue du boulanger"
                          className={`input-field ${errors.adresse ? "error" : ""}`}
                        />
                        {errors.adresse && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.adresse}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Ville
                        </label>
                        <select
                          value={form.ville}
                          onChange={(e) => set("ville", e.target.value)}
                          className="select-field"
                        >
                          {VILLES.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Finances */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Finances
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Loyer mensuel (XAF){" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={form.prix}
                          onChange={(e) => set("prix", e.target.value)}
                          placeholder="85000"
                          className={`input-field ${errors.prix ? "error" : ""}`}
                        />
                        {errors.prix && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.prix}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Caution (XAF)
                        </label>
                        <input
                          type="number"
                          value={form.caution}
                          onChange={(e) => set("caution", e.target.value)}
                          placeholder="85000"
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Caractéristiques */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Caractéristiques
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "surface", lbl: "Surface (m²)", ph: "35" },
                        { key: "nb_pieces", lbl: "Nb pièces", ph: "2" },
                        { key: "nb_chambres", lbl: "Nb chambres", ph: "1" },
                        { key: "etage", lbl: "Étage", ph: "2" },
                      ].map((f) => (
                        <div key={f.key}>
                          <label
                            className="block text-xs font-semibold mb-1.5"
                            style={{ color: "#374151" }}
                          >
                            {f.lbl}
                          </label>
                          <input
                            type="number"
                            value={form[f.key as keyof FormData] as string}
                            onChange={(e) =>
                              set(f.key as keyof FormData, e.target.value)
                            }
                            placeholder={f.ph}
                            className="input-field"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Options incluses
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          key: "meuble",
                          lbl: "Bien meublé",
                          sub: "Le logement est fourni avec des meubles",
                        },
                        {
                          key: "eau_incluse",
                          lbl: "Eau incluse",
                          sub: "Charges eau comprises dans le loyer",
                        },
                        {
                          key: "elec_incluse",
                          lbl: "Électricité incluse",
                          sub: "Charges électricité comprises",
                        },
                      ].map((o) => (
                        <div
                          key={o.key}
                          className="flex items-center justify-between py-3 px-4 rounded-xl"
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #F1F5F9",
                          }}
                        >
                          <div>
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {o.lbl}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              {o.sub}
                            </div>
                          </div>
                          <button
                            className="toggle"
                            onClick={() =>
                              set(
                                o.key as keyof FormData,
                                !form[o.key as keyof FormData],
                              )
                            }
                            style={{
                              background: form[o.key as keyof FormData]
                                ? "#2563EB"
                                : "#E2E8F0",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: "3px",
                                left: form[o.key as keyof FormData]
                                  ? "21px"
                                  : "3px",
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                background: "#fff",
                                transition: "left .2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,.2)",
                              }}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photos */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Photos du bien
                    </div>
                    <UploadFichier
                      typeDocument="photo_bien"
                      objetId={editBien?.id}
                      estPrincipal={true}
                      label="Photo principale"
                      description="JPG, PNG ou WEBP · Max 5 MB"
                      onSuccess={(doc) => {
                        // Mettre à jour la liste des photos
                        console.log("Photo uploadée:", doc);
                      }}
                    />
                    <p className="text-xs mt-2" style={{ color: "#94A3B8" }}>
                      La photo principale sera affichée sur la fiche du bien
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="sticky bottom-0 bg-white px-6 py-4 flex gap-3"
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    boxShadow: "0 -4px 16px rgba(0,0,0,.06)",
                  }}
                >
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{ background: "#F1F5F9", color: "#64748B" }}
                  >
                    Annuler
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: success
                        ? "#059669"
                        : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                      boxShadow: "0 2px 10px rgba(37,99,235,.3)",
                    }}
                  >
                    {saving ? (
                      <>
                        <IconLoader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        Enregistrement...
                      </>
                    ) : success ? (
                      <>
                        <IconCheck size={16} /> Enregistré !
                      </>
                    ) : (
                      <>
                        <IconCheck size={16} />{" "}
                        {editBien ? "Mettre à jour" : "Ajouter le bien"}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
