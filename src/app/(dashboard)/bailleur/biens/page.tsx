"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
import UploadFichier from "@/components/UploadFichier";
import BienGallerieManager from "@/components/biens/BienGallerieManager";
import { useSearchParams } from "next/navigation";
import PlanGate from '@/components/plan/PlanGate';
import {
  IconHome2,
  IconPlus,
  IconSearch,
  IconFilter,
  IconBuilding,
  IconMapPin,
  IconEye,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconLoader2,
  IconPhoto,
  IconLayoutGrid,
  IconList,
  IconAlertCircle,
  IconRefresh,
  IconArrowLeft,
  IconDroplet,
  IconBolt,
} from "@tabler/icons-react";

interface Structure {
  id: number;
  nom: string;
}

// ── FormData avec noms corrects alignés sur le modèle Django ──
interface FormData {
  titre: string;
  description: string;
  adresse: string;
  prix: string;
  type_bien: string;
  categorie: string;
  surface: string;
  structure: string;
  est_meuble: boolean; // était 'meuble'   → ignoré par Django
  est_climatise: boolean; // était 'elec_incluse' → ignoré par Django
  a_ascenseur: boolean; // nouveau champ
  tarif_eau: string; // nouveau — crée un Tarif
  tarif_elec: string; // nouveau — crée un Tarif
}

const TYPES_BIEN = [
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
  { val: "autre", lbl: "Autre" },
];

const CATEGORIES = [
  { val: "residentiel", lbl: "Résidentiel" },
  { val: "commercial", lbl: "Commercial" },
  { val: "mixte", lbl: "Mixte" },
];

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

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { bg: string; col: string; lbl: string }> = {
    libre: { bg: "#ECFDF5", col: "#059669", lbl: "Libre" },
    occupe: { bg: "#EFF6FF", col: "#2563EB", lbl: "Occupé" },
    maintenance: { bg: "#FFFBEB", col: "#D97706", lbl: "Maintenance" },
    inactif: { bg: "#FEF2F2", col: "#DC2626", lbl: "Inactif" },
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

// ── Toggle correct : position:relative inline + span unique ───
function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onChange(!value);
      }}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
        position: "relative", // ← obligatoire pour le span absolu
        transition: "background .2s",
        background: value ? "#2563EB" : "#E2E8F0",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "4px",
          left: value ? "22px" : "4px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          transition: "left .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        }}
      />
    </button>
  );
}

// ── Champ de formulaire réutilisable ──────────────────────────
function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block text-xs font-semibold mb-1.5"
        style={{ color: "#374151" }}
      >
        {label} {required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: "#EF4444" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const INPUT = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "1.5px solid #E2E8F0",
  fontSize: "13px",
  color: "#0F172A",
  outline: "none",
  background: "#fff",
  fontFamily: "inherit",
  boxSizing: "border-box" as const,
};

// ── Page principale ───────────────────────────────────────────
function BiensPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const structureId = searchParams.get("structure");

  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [filterStatut, setFilter] = useState("tous");
  const [showForm, setShowForm] = useState(false);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [editBien, setEditBien] = useState<Bien | null>(null);
  const [galerieBien, setGalerieBien] = useState<Bien | null>(null);

  const EMPTY_FORM: FormData = {
    titre: "",
    description: "",
    adresse: "",
    prix: "",
    type_bien: "studio",
    categorie: "residentiel",
    surface: "",
    structure: "",
    est_meuble: false,
    est_climatise: false,
    a_ascenseur: false,
    tarif_eau: "",
    tarif_elec: "",
  };
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const setF = (k: keyof FormData, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── Chargement ──────────────────────────────────────────────
  const load = async () => {
    setLoading(true);
    try {
      const biensUrl = structureId
        ? `/biens/?structure=${structureId}`
        : "/biens/";
      const [biensRes, structRes] = await Promise.all([
        api.get<PaginatedResponse<Bien>>(biensUrl),
        api.get<PaginatedResponse<Structure>>("/structures/"),
      ]);
      setBiens(biensRes.data.results);
      setStructures(structRes.data.results);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [structureId]);

  // ── Ouverture formulaire ─────────────────────────────────────
  const openAdd = () => {
    setEditBien(null);
    setForm({ ...EMPTY_FORM, structure: structures[0]?.id.toString() ?? "" });
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (b: Bien) => {
    setEditBien(b);
    setForm({
      titre: b.titre,
      description: b.description ?? "",
      adresse: b.adresse,
      prix: b.prix.toString(),
      type_bien: b.type_bien,
      categorie: b.categorie,
      surface: b.surface?.toString() ?? "",
      structure: b.structure?.toString() ?? "",
      est_meuble: (b as any).est_meuble ?? false,
      est_climatise: (b as any).est_climatise ?? false,
      a_ascenseur: (b as any).a_ascenseur ?? false,
      tarif_eau: "",
      tarif_elec: "", // rechargés depuis l'API si besoin
    });
    setErrors({});
    setShowForm(true);
  };

  // ── Validation ───────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.titre.trim()) e.titre = "Le titre est requis";
    if (!form.adresse.trim()) e.adresse = "L'adresse est requise";
    if (!form.prix || isNaN(Number(form.prix))) e.prix = "Loyer invalide";
    if (!form.structure) e.structure = "Choisissez une structure";
    if (form.tarif_eau && isNaN(Number(form.tarif_eau)))
      e.tarif_eau = "Valeur invalide";
    if (form.tarif_elec && isNaN(Number(form.tarif_elec)))
      e.tarif_elec = "Valeur invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // ── Payload aligné sur le modèle Bien de Django ──────────
      const payload = {
        titre: form.titre,
        description: form.description,
        adresse: form.adresse,
        prix: Number(form.prix),
        type_bien: form.type_bien,
        categorie: form.categorie,
        surface: form.surface ? Number(form.surface) : null,
        structure: Number(form.structure),
        est_meuble: form.est_meuble,
        est_climatise: form.est_climatise,
        a_ascenseur: form.a_ascenseur,
      };

      let bienId: number;
      if (editBien) {
        await api.put(`/biens/${editBien.id}/`, payload);
        bienId = editBien.id;
      } else {
        const res = await api.post("/biens/", payload);
        bienId = res.data.id;
      }

      // ── Sauvegarder les tarifs si renseignés ─────────────────
      if (form.tarif_eau || form.tarif_elec) {
        try {
          await api.post("/tarifs/", {
            bien: bienId,
            tarif_eau: parseFloat(form.tarif_eau) || 0,
            tarif_elec: parseFloat(form.tarif_elec) || 0,
            date_application: new Date().toISOString().split("T")[0],
          });
        } catch {
          // L'endpoint tarif peut ne pas exister encore — non bloquant
        }
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
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .bien-card{transition:all .2s ease}
        .bien-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.08)}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
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
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  cursor: "pointer",
                }}
              >
                <IconRefresh
                  size={15}
                  style={{
                    color: "#64748B",
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>

              <PlanGate nbBiens={biens.length}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={openAdd}
                    className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                      boxShadow: "0 2px 8px rgba(37,99,235,.35)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <IconPlus size={15} />
                    <span className="hidden sm:inline">Ajouter un bien</span>
                  </motion.button>
              </PlanGate>
              
            </div>
          </header>

          {structureId && (
            <div
              className="flex items-center gap-2 px-6 py-2 text-xs font-semibold flex-shrink-0"
              style={{
                background: "#EFF6FF",
                color: "#2563EB",
                borderBottom: "1px solid #DBEAFE",
              }}
            >
              <IconFilter size={13} />
              Filtrés par structure ·{" "}
              <Link
                href="/bailleur/biens"
                style={{ color: "#1D4ED8", textDecoration: "underline" }}
              >
                Voir tous les biens
              </Link>
            </div>
          )}

          {/* Toolbar */}
          <div
            className="flex items-center gap-3 px-6 py-4 flex-shrink-0 flex-wrap gap-y-2"
            style={{ background: "#fff", borderBottom: "1px solid #F1F5F9" }}
          >
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
                style={{ ...INPUT, paddingLeft: "36px" }}
              />
            </div>
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
                          border: "none",
                          cursor: "pointer",
                        }
                      : {
                          color: "#64748B",
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }
                  }
                >
                  {f.lbl}
                </button>
              ))}
            </div>
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{ background: "#F1F5F9" }}
            >
              {(
                [
                  ["grid", <IconLayoutGrid size={15} />],
                  ["list", <IconList size={15} />],
                ] as const
              ).map(([v, ico]) => (
                <button
                  key={v}
                  onClick={() => setView(v as "grid" | "list")}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={
                    view === v
                      ? {
                          background: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,.1)",
                          border: "none",
                          cursor: "pointer",
                        }
                      : {
                          border: "none",
                          cursor: "pointer",
                          background: "transparent",
                        }
                  }
                >
                  <span style={{ color: view === v ? "#2563EB" : "#94A3B8" }}>
                    {ico}
                  </span>
                </button>
              ))}
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
                    ? "Modifiez vos filtres"
                    : "Ajoutez votre premier bien"}
                </p>
                {!search && filterStatut === "tous" && (
                  <button
                    onClick={openAdd}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <IconPlus size={15} /> Ajouter un bien
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
                    transition={{ delay: i * 0.05 }}
                    className="bien-card bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                    }}
                  >
                    <div
                      className="relative h-44 overflow-hidden"
                      style={{
                        background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                      }}
                    >
                      {(b as any).photos?.length > 0 ? (
                        <img
                          src={
                            (b as any).photos.find((p: any) => p.est_principal)
                              ?.url_publique ??
                            (b as any).photos[0].url_publique
                          }
                          alt={b.titre}
                          className="w-full h-full object-cover"
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
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            background: "#EFF6FF",
                            color: "#2563EB",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <IconEdit size={13} /> Modifier
                        </button>
                        <button
                          onClick={() => setGalerieBien(b)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold"
                          style={{
                            background: "#F8FAFC",
                            color: "#64748B",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <IconEye size={13} /> Photos
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="w-9 flex items-center justify-center py-2 rounded-lg"
                          style={{
                            background: "#FEF2F2",
                            color: "#EF4444",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
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
                        style={{
                          background: "#EFF6FF",
                          color: "#2563EB",
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: "#FEF2F2",
                          color: "#EF4444",
                          border: "none",
                          cursor: "pointer",
                        }}
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

        {/* ── Drawer formulaire ── */}
        <AnimatePresence>
          {showForm && (
            <>
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
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
                style={{
                  width: "min(520px,100vw)",
                  background: "#fff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                }}
              >
                {/* En-tête */}
                <div
                  className="flex items-center justify-between px-6 py-5 flex-shrink-0"
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
                    style={{
                      background: "#F1F5F9",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <IconX size={16} style={{ color: "#64748B" }} />
                  </button>
                </div>

                {/* Corps scrollable */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                  {/* Infos générales */}
                  <section>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Informations générales
                    </div>
                    <div className="space-y-3">
                      <Field
                        label="Titre du bien"
                        required
                        error={errors.titre}
                      >
                        <input
                          value={form.titre}
                          onChange={(e) => setF("titre", e.target.value)}
                          placeholder="Ex: Studio meublé — Appartement 101"
                          style={{
                            ...INPUT,
                            borderColor: errors.titre ? "#EF4444" : "#E2E8F0",
                          }}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Type de bien">
                          <select
                            value={form.type_bien}
                            onChange={(e) => setF("type_bien", e.target.value)}
                            style={{ ...INPUT, cursor: "pointer" }}
                          >
                            {TYPES_BIEN.map((t) => (
                              <option key={t.val} value={t.val}>
                                {t.lbl}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Catégorie">
                          <select
                            value={form.categorie}
                            onChange={(e) => setF("categorie", e.target.value)}
                            style={{ ...INPUT, cursor: "pointer" }}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c.val} value={c.val}>
                                {c.lbl}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                      <Field
                        label="Structure / Immeuble"
                        required
                        error={errors.structure}
                      >
                        <select
                          value={form.structure}
                          onChange={(e) => setF("structure", e.target.value)}
                          style={{
                            ...INPUT,
                            cursor: "pointer",
                            borderColor: errors.structure
                              ? "#EF4444"
                              : "#E2E8F0",
                          }}
                        >
                          <option value="">-- Choisir une structure --</option>
                          {structures.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nom}
                            </option>
                          ))}
                        </select>
                        {structures.length === 0 && (
                          <p
                            className="text-xs mt-1.5 flex items-center gap-1"
                            style={{ color: "#D97706" }}
                          >
                            <IconAlertCircle size={12} /> Créez d&apos;abord une
                            structure dans &ldquo;Structures&rdquo;
                          </p>
                        )}
                      </Field>
                      <Field label="Description">
                        <textarea
                          value={form.description}
                          onChange={(e) => setF("description", e.target.value)}
                          placeholder="Décrivez le bien..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            border: "1.5px solid #E2E8F0",
                            fontSize: "13px",
                            color: "#0F172A",
                            outline: "none",
                            background: "#fff",
                            resize: "vertical",
                            minHeight: "80px",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* Localisation */}
                  <section>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Localisation
                    </div>
                    <Field label="Adresse" required error={errors.adresse}>
                      <input
                        value={form.adresse}
                        onChange={(e) => setF("adresse", e.target.value)}
                        placeholder="Ex: Logbessou, Douala"
                        style={{
                          ...INPUT,
                          borderColor: errors.adresse ? "#EF4444" : "#E2E8F0",
                        }}
                      />
                    </Field>
                  </section>

                  {/* Finances */}
                  <section>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Finances
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Loyer mensuel (XAF)"
                        required
                        error={errors.prix}
                      >
                        <input
                          type="number"
                          value={form.prix}
                          onChange={(e) => setF("prix", e.target.value)}
                          placeholder="85000"
                          style={{
                            ...INPUT,
                            borderColor: errors.prix ? "#EF4444" : "#E2E8F0",
                          }}
                        />
                      </Field>
                      <Field label="Surface (m²)">
                        <input
                          type="number"
                          value={form.surface}
                          onChange={(e) => setF("surface", e.target.value)}
                          placeholder="35"
                          style={INPUT}
                        />
                      </Field>
                    </div>
                  </section>

                  {/* ── Tarifs eau & électricité (NOUVEAU) ───────── */}
                  <section>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: "#94A3B8" }}
                    >
                      Tarifs eau & électricité
                    </div>
                    <p className="text-xs mb-3" style={{ color: "#94A3B8" }}>
                      Utilisés pour calculer les charges mensuelles du locataire
                    </p>
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="Tarif eau (XAF/m³)"
                          error={errors.tarif_eau}
                        >
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <IconDroplet
                                size={14}
                                style={{ color: "#0EA5E9" }}
                              />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={form.tarif_eau}
                              onChange={(e) =>
                                setF("tarif_eau", e.target.value)
                              }
                              placeholder="250"
                              style={{
                                ...INPUT,
                                paddingLeft: "30px",
                                background: "#F0F9FF",
                                borderColor: "#BAE6FD",
                              }}
                            />
                          </div>
                        </Field>
                        <Field
                          label="Tarif élec (XAF/kWh)"
                          error={errors.tarif_elec}
                        >
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <IconBolt
                                size={14}
                                style={{ color: "#F59E0B" }}
                              />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={form.tarif_elec}
                              onChange={(e) =>
                                setF("tarif_elec", e.target.value)
                              }
                              placeholder="100"
                              style={{
                                ...INPUT,
                                paddingLeft: "30px",
                                background: "#FFFBEB",
                                borderColor: "#FDE68A",
                              }}
                            />
                          </div>
                        </Field>
                      </div>
                      {(form.tarif_eau || form.tarif_elec) && (
                        <div
                          className="flex items-center gap-2 mt-3 pt-3 text-xs"
                          style={{
                            borderTop: "1px solid #E2E8F0",
                            color: "#059669",
                          }}
                        >
                          <IconCheck size={12} />
                          Ces tarifs seront utilisés pour les relevés mensuels
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Options */}
                  <section>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Options
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          key: "est_meuble" as const,
                          lbl: "Bien meublé",
                          sub: "Le logement est fourni avec des meubles",
                        },
                        {
                          key: "est_climatise" as const,
                          lbl: "Climatisé",
                          sub: "Climatisation installée dans le logement",
                        },
                        {
                          key: "a_ascenseur" as const,
                          lbl: "Ascenseur",
                          sub: "Accès ascenseur disponible",
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
                          {/* ✅ Toggle corrigé : composant dédié avec position:relative inline */}
                          <Toggle
                            value={form[o.key]}
                            onChange={(v) => setF(o.key, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Photos */}
                  <section>
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
                      onSuccess={() => load()}
                    />
                  </section>
                </div>

                {/* Pied drawer */}
                <div
                  className="flex-shrink-0 px-6 py-4 flex gap-3"
                  style={{
                    borderTop: "1px solid #F1F5F9",
                    boxShadow: "0 -4px 16px rgba(0,0,0,.06)",
                  }}
                >
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: "#F1F5F9",
                      color: "#64748B",
                      border: "none",
                      cursor: "pointer",
                    }}
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
                      border: "none",
                      cursor: "pointer",
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

        <AnimatePresence>
          {galerieBien && (
            <BienGallerieManager
              bienId={galerieBien.id}
              bienTitre={galerieBien.titre}
              photos={(galerieBien as any).photos ?? []}
              onClose={() => setGalerieBien(null)}
              onUpdate={() => load()}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function BiensPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-screen items-center justify-center"
          style={{ background: "#F1F5F9" }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "3px solid #E2E8F0",
              borderTopColor: "#2563EB",
              animation: "spin 0.7s linear infinite",
            }}
          />
        </div>
      }
    >
      <BiensPageContent />
    </Suspense>
  );
}
