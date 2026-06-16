"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { PaginatedResponse } from "@/types";
import {
  IconBuilding,
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconX,
  IconCheck,
  IconLoader2,
  IconArrowLeft,
  IconRefresh,
  IconMapPin,
  IconHome2,
  IconAlertCircle,
  IconBuildingSkyscraper,
  IconBuildingCommunity,
  IconHomeDot,
  IconBuildingWarehouse,
  IconCamera,
  IconPhoto,
  IconChevronRight,
  IconTrendingUp,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────
interface Structure {
  id: number;
  nom: string;
  type_structure: string;
  adresse: string;
  ville?: string;
  description?: string;
  nb_biens?: number;
  nb_biens_occupes?: number;
  date_creation?: string;
  photo_url?: string;
}

interface FormData {
  nom: string;
  type_structure: string;
  adresse: string;
  ville: string;
  description: string;
}

const TYPES = [
  {
    val: "immeuble",
    lbl: "Immeuble",
    icon: <IconBuildingSkyscraper size={20} />,
    color: "#2563EB",
    bg: "#EFF6FF",
    gradient: "linear-gradient(135deg,#1E3A5F,#2563EB)",
  },
  {
    val: "residence",
    lbl: "Résidence",
    icon: <IconBuildingCommunity size={20} />,
    color: "#059669",
    bg: "#ECFDF5",
    gradient: "linear-gradient(135deg,#064E3B,#059669)",
  },
  {
    val: "villa",
    lbl: "Villa divisée",
    icon: <IconHomeDot size={20} />,
    color: "#D97706",
    bg: "#FFFBEB",
    gradient: "linear-gradient(135deg,#78350F,#D97706)",
  },
  {
    val: "entrepot",
    lbl: "Entrepôt",
    icon: <IconBuildingWarehouse size={20} />,
    color: "#7C3AED",
    bg: "#F5F3FF",
    gradient: "linear-gradient(135deg,#4C1D95,#7C3AED)",
  },
  {
    val: "autre",
    lbl: "Autre",
    icon: <IconBuilding size={20} />,
    color: "#475569",
    bg: "#F1F5F9",
    gradient: "linear-gradient(135deg,#1E293B,#475569)",
  },
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

function getType(val: string) {
  return TYPES.find((t) => t.val === val) ?? TYPES[4];
}

// ── Skeleton ───────────────────────────────────────────────
function Skeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white"
      style={{ border: "1px solid #E2E8F0" }}
    >
      <div
        style={{
          height: "140px",
          background:
            "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div className="p-4 space-y-3">
        <div
          style={{
            height: "14px",
            background: "#F1F5F9",
            borderRadius: "6px",
            width: "55%",
          }}
        />
        <div
          style={{
            height: "11px",
            background: "#F1F5F9",
            borderRadius: "5px",
            width: "75%",
          }}
        />
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "52px",
                background: "#F1F5F9",
                borderRadius: "10px",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Carte structure ────────────────────────────────────────
function StructureCard({
  s,
  i,
  onEdit,
  onDelete,
  onPhotoClick,
}: {
  s: Structure;
  i: number;
  onEdit: () => void;
  onDelete: () => void;
  onPhotoClick: () => void;
}) {
  const type = getType(s.type_structure);
  const total = s.nb_biens ?? 0;
  const occupes = s.nb_biens_occupes ?? 0;
  const pct = total > 0 ? Math.round((occupes / total) * 100) : 0;
  const pctColor = pct >= 80 ? "#059669" : pct >= 50 ? "#D97706" : "#EF4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-white rounded-2xl overflow-hidden"
      style={{
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 4px rgba(0,0,0,.04)",
      }}
    >
      {/* Cover */}
      <div className="relative overflow-hidden" style={{ height: "140px" }}>
        {s.photo_url ? (
          <img
            src={s.photo_url}
            alt={s.nom}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center relative"
            style={{ background: type.gradient }}
          >
            <div
              style={{
                opacity: 0.12,
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,.3) 1px, transparent 1px)",
                backgroundSize: "18px 18px",
              }}
            />
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                transform: "scale(2.2)",
              }}
            >
              {type.icon}
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "10px",
                fontWeight: 700,
                marginTop: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                position: "relative",
              }}
            >
              {type.lbl}
            </span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(255,255,255,0.93)",
              color: type.color,
              backdropFilter: "blur(8px)",
              fontSize: "11px",
            }}
          >
            {type.lbl}
          </span>
        </div>

        {/* Bouton photo — visible au hover sur desktop, toujours visible sur mobile */}
        <button
          onClick={onPhotoClick}
          className="absolute bottom-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold sm:opacity-0 sm:group-hover:opacity-100 transition-all"
          style={{
            background: "rgba(0,0,0,0.6)",
            color: "white",
            backdropFilter: "blur(6px)",
          }}
        >
          <IconCamera size={11} />
          <span className="hidden sm:inline">
            {s.photo_url ? "Changer" : "Photo"}
          </span>
          <span className="sm:hidden">
            {s.photo_url ? "Changer la photo" : "Ajouter une photo"}
          </span>
        </button>
      </div>

      {/* Corps */}
      <div className="p-4">
        {/* Titre + adresse */}
        <div className="mb-3">
          <h3
            className="font-bold text-sm mb-1 truncate"
            style={{ color: "#0F172A" }}
          >
            {s.nom}
          </h3>
          <div className="flex items-start gap-1.5">
            <IconMapPin
              size={11}
              style={{ color: "#94A3B8", flexShrink: 0, marginTop: "2px" }}
            />
            <span
              className="text-xs leading-relaxed"
              style={{
                color: "#64748B",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {s.adresse}
              {s.ville ? ` · ${s.ville}` : ""}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { lbl: "Biens", val: total, color: "#0F172A" },
            { lbl: "Occupés", val: occupes, color: "#059669" },
            { lbl: "Taux", val: `${pct}%`, color: pctColor },
          ].map((stat) => (
            <div
              key={stat.lbl}
              className="rounded-xl p-2.5 text-center"
              style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
            >
              <div
                className="text-xs mb-0.5"
                style={{ color: "#94A3B8", fontSize: "10px" }}
              >
                {stat.lbl}
              </div>
              <div
                className="font-bold"
                style={{ color: stat.color, fontSize: "18px", lineHeight: 1 }}
              >
                {stat.val}
              </div>
            </div>
          ))}
        </div>

        {/* Barre */}
        {total > 0 && (
          <div
            className="mb-3 h-1.5 rounded-full overflow-hidden"
            style={{ background: "#E2E8F0" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
              style={{ background: pctColor }}
            />
          </div>
        )}

        {/* Actions */}
        <div
          className="flex gap-2 pt-3"
          style={{ borderTop: "1px solid #F1F5F9" }}
        >
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold flex-shrink-0"
            style={{ background: "#EFF6FF", color: "#2563EB" }}
          >
            <IconEdit size={13} />
            <span className="hidden sm:inline">Modifier</span>
          </button>
          <Link
            href={`/bailleur/biens?structure=${s.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold min-w-0"
            style={{
              background: "#F8FAFC",
              color: "#475569",
              textDecoration: "none",
            }}
          >
            <IconHome2 size={13} style={{ flexShrink: 0 }} />
            <span className="truncate">Voir les biens</span>
            <IconChevronRight
              size={11}
              style={{ flexShrink: 0, marginLeft: "auto" }}
            />
          </Link>
          <button
            onClick={onDelete}
            className="w-9 flex items-center justify-center py-2 rounded-lg flex-shrink-0"
            style={{ background: "#FEF2F2", color: "#EF4444" }}
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Modal photo ────────────────────────────────────────────
function PhotoModal({
  structure,
  onClose,
  onSuccess,
}: {
  structure: Structure;
  onClose: () => void;
  onSuccess: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    setUploading(true);
    setProgress(0);
    const timer = setInterval(
      () => setProgress((p) => Math.min(p + 12, 85)),
      200,
    );
    try {
      const fd = new FormData();
      fd.append("fichier", file);
      fd.append("type_document", "structure");
      fd.append("objet_id", structure.id.toString());
      fd.append("est_principal", "true");
      const res = await api.post("/upload/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(timer);
      setProgress(100);
      toast.success("Photo mise à jour !");
      onSuccess(res.data.url_publique);
      setTimeout(onClose, 500);
    } catch {
      clearInterval(timer);
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-4 bottom-4 sm:inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4"
      >
        <div
          className="bg-white rounded-2xl p-5 w-full sm:max-w-sm"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,.25)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Photo de la structure
              </h3>
              <p
                className="text-xs mt-0.5 truncate"
                style={{ color: "#94A3B8", maxWidth: "200px" }}
              >
                {structure.nom}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#F1F5F9", color: "#64748B" }}
            >
              <IconX size={14} />
            </button>
          </div>

          <div
            className="rounded-xl overflow-hidden mb-4"
            style={{
              height: "130px",
              background: getType(structure.type_structure).gradient,
            }}
          >
            {structure.photo_url ? (
              <img
                src={structure.photo_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <IconPhoto
                  size={32}
                  style={{ color: "rgba(255,255,255,0.4)" }}
                />
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
              e.target.value = "";
            }}
            style={{ display: "none" }}
          />

          {uploading ? (
            <div
              className="p-4 rounded-xl"
              style={{ background: "#EFF6FF", border: "1px solid #DBEAFE" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconLoader2
                  size={14}
                  style={{
                    color: "#2563EB",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#2563EB" }}
                >
                  Upload... {progress}%
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "#DBEAFE" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  style={{ background: "#2563EB" }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
              style={{
                background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                color: "white",
                boxShadow: "0 4px 14px rgba(37,99,235,.4)",
              }}
            >
              <IconCamera size={16} />
              {structure.photo_url ? "Changer la photo" : "Choisir une photo"}
            </button>
          )}
          <p className="text-xs mt-2 text-center" style={{ color: "#94A3B8" }}>
            JPG, PNG ou WEBP · Max 5 Mo
          </p>
        </div>
      </motion.div>
    </>
  );
}

// ── Page principale ────────────────────────────────────────
export default function StructuresPage() {
  const { user } = useAuth();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Structure | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [photoModal, setPhotoModal] = useState<Structure | null>(null);

  const emptyForm: FormData = {
    nom: "",
    type_structure: "immeuble",
    adresse: "",
    ville: "Douala",
    description: "",
  };
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    const init = async () => {
      await load();
    };
    init();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse<Structure>>("/structures/");
      setStructures(res.data.results);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(emptyForm);
    setErrors({});
    setShowForm(true);
  };
  const openEdit = (s: Structure) => {
    setEditItem(s);
    setForm({
      nom: s.nom,
      type_structure: s.type_structure,
      adresse: s.adresse,
      ville: s.ville ?? "Douala",
      description: s.description ?? "",
    });
    setErrors({});
    setShowForm(true);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nom.trim()) e.nom = "Le nom est requis";
    if (!form.adresse.trim()) e.adresse = "L'adresse est requise";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/structures/${editItem.id}/`, form);
      } else {
        await api.post("/structures/", form);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        load();
      }, 1400);
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
    try {
      await api.delete(`/structures/${id}/`);
      setDeleteId(null);
      load();
    } catch {
      setDeleteId(null);
      toast.error("Erreur lors de la suppression");
    }
  };

  const set = (k: keyof FormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered = structures.filter(
    (s) =>
      !search ||
      s.nom.toLowerCase().includes(search.toLowerCase()) ||
      s.adresse.toLowerCase().includes(search.toLowerCase()),
  );

  const totalBiens = structures.reduce((a, s) => a + (s.nb_biens ?? 0), 0);
  const totalOccupes = structures.reduce(
    (a, s) => a + (s.nb_biens_occupes ?? 0),
    0,
  );
  const tauxGlobal =
    totalBiens > 0 ? Math.round((totalOccupes / totalBiens) * 100) : 0;

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .ifield{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;transition:border-color .15s;font-family:inherit}
        .ifield:focus{border-color:#2563EB;box-shadow:0 0 0 3px rgba(37,99,235,.1)}
        .ifield.err{border-color:#EF4444}
        .tfield{width:100%;padding:10px 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;resize:vertical;min-height:80px;font-family:inherit;transition:border-color .15s}
        .tfield:focus{border-color:#2563EB}
        .sfield{width:100%;height:42px;padding:0 12px;border-radius:10px;border:1.5px solid #E2E8F0;font-size:13px;color:#0F172A;outline:none;background:#fff;cursor:pointer;font-family:inherit}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* ── Header ── */}
          <header
            className="flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 flex-shrink-0 bg-white"
            style={{
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
            <Link
              href="/bailleur"
              className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
              style={{ color: "#64748B", textDecoration: "none" }}
            >
              <IconArrowLeft size={16} />
              <span className="hidden sm:inline">Tableau de bord</span>
            </Link>
            <div
              className="h-5 w-px flex-shrink-0"
              style={{ background: "#E2E8F0" }}
            />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconBuilding
                size={17}
                style={{ color: "#2563EB", flexShrink: 0 }}
              />
              <h1
                className="text-sm font-bold truncate"
                style={{ color: "#0F172A" }}
              >
                Mes structures
              </h1>
              {!loading && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: "#EFF6FF", color: "#2563EB" }}
                >
                  {structures.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
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
                className="flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                  boxShadow: "0 2px 8px rgba(37,99,235,.35)",
                }}
              >
                <IconPlus size={15} />
                <span className="hidden sm:inline">Nouvelle structure</span>
              </motion.button>
            </div>
          </header>

          {/* ── Contenu ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3">
              {/* Stats — scroll horizontal sur mobile */}
              {!loading && structures.length > 0 && (
                <div
                  className="flex gap-3 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3"
                  style={{ scrollbarWidth: "none" }}
                >
                  {[
                    {
                      lbl: "Structures",
                      val: structures.length,
                      color: "#2563EB",
                      bg: "#EFF6FF",
                      ico: <IconBuilding size={15} />,
                    },
                    {
                      lbl: "Biens totaux",
                      val: totalBiens,
                      color: "#7C3AED",
                      bg: "#F5F3FF",
                      ico: <IconHome2 size={15} />,
                    },
                    {
                      lbl: "Taux d'occupation",
                      val: `${tauxGlobal}%`,
                      color: tauxGlobal >= 80 ? "#059669" : "#D97706",
                      bg: tauxGlobal >= 80 ? "#ECFDF5" : "#FFFBEB",
                      ico: <IconTrendingUp size={15} />,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.lbl}
                      className="flex items-center gap-3 rounded-2xl p-3 sm:p-4 flex-shrink-0"
                      style={{
                        background: "white",
                        border: "1px solid #E2E8F0",
                        minWidth: "140px",
                      }}
                    >
                      <div
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: stat.bg, color: stat.color }}
                      >
                        {stat.ico}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="text-lg sm:text-xl font-bold"
                          style={{ color: "#0F172A", lineHeight: 1 }}
                        >
                          {stat.val}
                        </div>
                        <div
                          className="text-xs mt-0.5 truncate"
                          style={{ color: "#94A3B8" }}
                        >
                          {stat.lbl}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recherche */}
              <div className="relative">
                <IconSearch
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#94A3B8" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher une structure..."
                  className="ifield"
                  style={{ paddingLeft: "34px" }}
                />
              </div>
            </div>

            {/* Grille */}
            <div className="px-4 sm:px-6 pb-6">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} />
                    ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                    }}
                  >
                    <IconBuilding size={30} style={{ color: "#93C5FD" }} />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    {search
                      ? "Aucune structure trouvée"
                      : "Aucune structure pour l'instant"}
                  </h3>
                  <p
                    className="text-sm mb-5 max-w-xs"
                    style={{ color: "#64748B" }}
                  >
                    {search
                      ? "Modifiez votre recherche"
                      : "Créez votre premier immeuble, résidence ou villa divisée."}
                  </p>
                  {!search && (
                    <button
                      onClick={openAdd}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        boxShadow: "0 4px 14px rgba(37,99,235,.4)",
                      }}
                    >
                      <IconPlus size={15} /> Créer une structure
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((s, i) => (
                    <StructureCard
                      key={s.id}
                      s={s}
                      i={i}
                      onEdit={() => openEdit(s)}
                      onDelete={() => setDeleteId(s.id)}
                      onPhotoClick={() => setPhotoModal(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── DRAWER ── */}
        <AnimatePresence>
          {showForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                style={{
                  background: "rgba(0,0,0,.4)",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setShowForm(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 280 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: "min(480px, 100vw)",
                  background: "#fff",
                  boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div className="min-w-0 flex-1">
                    <h2
                      className="text-sm font-bold truncate"
                      style={{ color: "#0F172A" }}
                    >
                      {editItem
                        ? "Modifier la structure"
                        : "Nouvelle structure"}
                    </h2>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: "#94A3B8" }}
                    >
                      {editItem
                        ? `Modification de "${editItem.nom}"`
                        : "Immeuble, résidence, villa divisée..."}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ml-3"
                    style={{ background: "#F1F5F9" }}
                  >
                    <IconX size={15} style={{ color: "#64748B" }} />
                  </button>
                </div>

                <div className="px-5 py-5 space-y-6">
                  {/* Type */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Type
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {TYPES.map((t) => (
                        <button
                          key={t.val}
                          onClick={() => set("type_structure", t.val)}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "5px",
                            padding: "10px 6px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            border: `1.5px solid ${form.type_structure === t.val ? t.color : "#E2E8F0"}`,
                            background:
                              form.type_structure === t.val ? t.bg : "#fff",
                            transition: "all .15s",
                            fontFamily: "inherit",
                          }}
                        >
                          <span
                            style={{
                              color:
                                form.type_structure === t.val
                                  ? t.color
                                  : "#94A3B8",
                            }}
                          >
                            {t.icon}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color:
                                form.type_structure === t.val
                                  ? t.color
                                  : "#64748B",
                              textAlign: "center",
                              lineHeight: 1.2,
                              fontSize: "11px",
                            }}
                          >
                            {t.lbl}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Infos */}
                  <div>
                    <div
                      className="text-xs font-bold uppercase tracking-wider mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Informations
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label
                          className="block text-xs font-semibold mb-1.5"
                          style={{ color: "#374151" }}
                        >
                          Nom <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input
                          value={form.nom}
                          onChange={(e) => set("nom", e.target.value)}
                          placeholder="Ex: Immeuble Les Cocotiers"
                          className={`ifield ${errors.nom ? "err" : ""}`}
                        />
                        {errors.nom && (
                          <p
                            className="text-xs mt-1"
                            style={{ color: "#EF4444" }}
                          >
                            {errors.nom}
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
                          placeholder="Décrivez la structure..."
                          className="tfield"
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
                          placeholder="Ex: Bonapriso, Douala"
                          className={`ifield ${errors.adresse ? "err" : ""}`}
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
                          className="sfield"
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
                </div>

                <div
                  className="sticky bottom-0 bg-white px-5 py-4 flex gap-3"
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
                          size={15}
                          style={{ animation: "spin 1s linear infinite" }}
                        />{" "}
                        Enregistrement...
                      </>
                    ) : success ? (
                      <>
                        <IconCheck size={15} /> Enregistré !
                      </>
                    ) : (
                      <>
                        <IconCheck size={15} />{" "}
                        {editItem ? "Mettre à jour" : "Créer"}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── MODAL SUPPRESSION ── */}
        <AnimatePresence>
          {deleteId !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
              style={{
                background: "rgba(0,0,0,.5)",
                backdropFilter: "blur(6px)",
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl p-6 w-full max-w-sm"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#FEF2F2" }}
                >
                  <IconAlertCircle size={22} style={{ color: "#EF4444" }} />
                </div>
                <h3
                  className="text-sm font-bold mb-2"
                  style={{ color: "#0F172A" }}
                >
                  Supprimer cette structure ?
                </h3>
                <p
                  className="text-sm mb-5"
                  style={{ color: "#64748B", lineHeight: 1.6 }}
                >
                  Action irréversible. Tous les biens associés seront également
                  supprimés.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: "#F1F5F9", color: "#64748B" }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleDelete(deleteId)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{ background: "#EF4444" }}
                  >
                    Supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MODAL PHOTO ── */}
        <AnimatePresence>
          {photoModal && (
            <PhotoModal
              structure={photoModal}
              onClose={() => setPhotoModal(null)}
              onSuccess={(url) => {
                setStructures((prev) =>
                  prev.map((s) =>
                    s.id === photoModal.id ? { ...s, photo_url: url } : s,
                  ),
                );
                setPhotoModal(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
