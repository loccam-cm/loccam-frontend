"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconDroplet,
  IconBolt,
  IconPlus,
  IconArrowLeft,
  IconBuilding,
  IconCalendar,
  IconCheck,
  IconLoader2,
  IconX,
  IconHome2,
  IconChevronRight,
  IconBrandWhatsapp,
  IconRefresh,
  IconAlertCircle,
  IconSend,
  IconClock,
  IconUser,
  IconCurrencyDollar,
} from "@tabler/icons-react";

// ── Types ─────────────────────────────────────────────────────
interface Structure {
  id: number;
  nom: string;
  type_structure: string;
  adresse: string;
}
interface Bien {
  id: number;
  titre: string;
  adresse: string;
  statut: string;
  structure_id: number | null;
}
interface Contrat {
  id: number;
  bien: { id: number; titre: string } | number;
  locataire: { id: number; nom_complet: string; telephone: string };
  statut: string;
}

interface Releve {
  id: number;
  contrat: number;
  bien: number;
  bien_titre: string;
  bien_adresse: string;
  locataire_nom: string;
  locataire_tel: string;
  mois: number;
  annee: number;
  index_eau_debut: string | null;
  index_eau_fin: string | null;
  tarif_eau: string;
  conso_eau: number;
  montant_eau: number;
  index_elec_debut: string | null;
  index_elec_fin: string | null;
  tarif_elec: string;
  conso_elec: number;
  montant_elec: number;
  montant_total: number;
  statut: "brouillon" | "envoye" | "paye";
  statut_display: string;
  date_saisie: string;
}

// ── Constantes ────────────────────────────────────────────────
const MOIS_FR = [
  "",
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];
const now = new Date();

const STATUT = {
  brouillon: {
    bg: "#F1F5F9",
    col: "#64748B",
    border: "#E2E8F0",
    ico: <IconClock size={11} />,
    lbl: "Brouillon",
  },
  envoye: {
    bg: "#EFF6FF",
    col: "#2563EB",
    border: "#BFDBFE",
    ico: <IconSend size={11} />,
    lbl: "Envoyé",
  },
  paye: {
    bg: "#ECFDF5",
    col: "#059669",
    border: "#A7F3D0",
    ico: <IconCheck size={11} />,
    lbl: "Payé",
  },
};

// ── Helpers ───────────────────────────────────────────────────
const toFloat = (v: string) => parseFloat(v) || 0;
const calcConso = (debut: string, fin: string) =>
  Math.max(0, toFloat(fin) - toFloat(debut));

// ── Step indicator ────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ["Structure", "Bien", "Index"];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
              style={{
                background:
                  i < current
                    ? "#059669"
                    : i === current
                      ? "#7C3AED"
                      : "#E2E8F0",
                color: i <= current ? "#fff" : "#94A3B8",
              }}
            >
              {i < current ? <IconCheck size={14} /> : i + 1}
            </div>
            <span
              className="text-xs mt-1 font-medium"
              style={{
                color:
                  i === current
                    ? "#7C3AED"
                    : i < current
                      ? "#059669"
                      : "#94A3B8",
              }}
            >
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className="h-0.5 flex-1 mb-5 mx-1 transition-all"
              style={{ background: i < current ? "#059669" : "#E2E8F0" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Badge statut ──────────────────────────────────────────────
function BadgeStatut({ statut }: { statut: Releve["statut"] }) {
  const s = STATUT[statut];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{
        background: s.bg,
        color: s.col,
        border: `1px solid ${s.border}`,
      }}
    >
      {s.ico}
      {s.lbl}
    </span>
  );
}

// ── Carte relevé ──────────────────────────────────────────────
function CarteReleve({
  r,
  onEnvoyer,
  onWhatsApp,
}: {
  r: Releve;
  onEnvoyer: (id: number) => void;
  onWhatsApp: (r: Releve) => void;
}) {
  const [sending, setSending] = useState(false);

  const handleEnvoyer = async () => {
    setSending(true);
    await onEnvoyer(r.id);
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
    >
      {/* En-tête carte */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 gap-2">
        <div className="min-w-0">
          <div
            className="text-sm font-bold truncate"
            style={{ color: "#0F172A" }}
          >
            {r.bien_titre}
          </div>
          <div
            className="flex items-center gap-1.5 mt-0.5"
            style={{ color: "#94A3B8" }}
          >
            <IconCalendar size={11} />
            <span className="text-xs">
              {MOIS_FR[r.mois]} {r.annee}
            </span>
          </div>
          {r.locataire_nom && (
            <div
              className="flex items-center gap-1.5 mt-0.5"
              style={{ color: "#64748B" }}
            >
              <IconUser size={11} />
              <span className="text-xs font-medium">{r.locataire_nom}</span>
            </div>
          )}
        </div>
        <BadgeStatut statut={r.statut} />
      </div>

      {/* Index + consommation */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        {/* Eau */}
        <div className="rounded-xl p-2.5" style={{ background: "#F0F9FF" }}>
          <div className="flex items-center gap-1 mb-1.5">
            <IconDroplet size={11} style={{ color: "#0EA5E9" }} />
            <span className="text-xs font-bold" style={{ color: "#0284C7" }}>
              EAU
            </span>
          </div>
          {r.index_eau_debut && r.index_eau_fin ? (
            <>
              <div
                className="text-sm font-extrabold"
                style={{ color: "#0EA5E9" }}
              >
                {r.conso_eau.toFixed(2)} m³
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#7DD3FC" }}>
                {toFloat(r.index_eau_debut).toFixed(1)} →{" "}
                {toFloat(r.index_eau_fin).toFixed(1)}
              </div>
              {r.montant_eau > 0 && (
                <div
                  className="text-xs font-bold mt-1"
                  style={{ color: "#0284C7" }}
                >
                  {r.montant_eau.toLocaleString("fr-FR")} XAF
                </div>
              )}
            </>
          ) : (
            <div className="text-xs" style={{ color: "#BAE6FD" }}>
              Non renseigné
            </div>
          )}
        </div>

        {/* Élec */}
        <div className="rounded-xl p-2.5" style={{ background: "#FFFBEB" }}>
          <div className="flex items-center gap-1 mb-1.5">
            <IconBolt size={11} style={{ color: "#F59E0B" }} />
            <span className="text-xs font-bold" style={{ color: "#D97706" }}>
              ÉLEC
            </span>
          </div>
          {r.index_elec_debut && r.index_elec_fin ? (
            <>
              <div
                className="text-sm font-extrabold"
                style={{ color: "#F59E0B" }}
              >
                {r.conso_elec.toFixed(2)} kWh
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#FCD34D" }}>
                {toFloat(r.index_elec_debut).toFixed(1)} →{" "}
                {toFloat(r.index_elec_fin).toFixed(1)}
              </div>
              {r.montant_elec > 0 && (
                <div
                  className="text-xs font-bold mt-1"
                  style={{ color: "#D97706" }}
                >
                  {r.montant_elec.toLocaleString("fr-FR")} XAF
                </div>
              )}
            </>
          ) : (
            <div className="text-xs" style={{ color: "#FDE68A" }}>
              Non renseigné
            </div>
          )}
        </div>
      </div>

      {/* Total */}
      {r.montant_total > 0 && (
        <div
          className="mx-4 mb-3 px-3 py-2 rounded-xl flex items-center justify-between"
          style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}
        >
          <span className="text-xs font-semibold" style={{ color: "#059669" }}>
            Total charges
          </span>
          <span className="text-sm font-bold" style={{ color: "#059669" }}>
            {r.montant_total.toLocaleString("fr-FR")} XAF
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        {r.statut === "brouillon" && (
          <button
            onClick={handleEnvoyer}
            disabled={sending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "#EFF6FF",
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              cursor: "pointer",
            }}
          >
            {sending ? (
              <IconLoader2
                size={12}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <IconSend size={12} />
            )}
            Envoyer au locataire
          </button>
        )}
        <button
          onClick={() => onWhatsApp(r)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold"
          style={{
            background: "#DCFCE7",
            color: "#16A34A",
            border: "1px solid #A7F3D0",
            cursor: "pointer",
          }}
        >
          <IconBrandWhatsapp size={12} />
          WhatsApp
        </button>
      </div>
    </motion.div>
  );
}

// ── GroupesReleves ────────────────────────────────────────────
function GroupesReleves({
  releves,
  allBiens,
  structures,
  onEnvoyer,
  onWhatsApp,
}: {
  releves: Releve[];
  allBiens: Bien[];
  structures: Structure[];
  onEnvoyer: (id: number) => void;
  onWhatsApp: (r: Releve) => void;
}) {
  const [ouvert, setOuvert] = useState<number | "isole" | null>(null);

  const getBienStructureId = (bienId: number) =>
    allBiens.find((b) => b.id === bienId)?.structure_id ?? null;

  const groupes: {
    key: number | "isole";
    label: string;
    adresse: string;
    releves: Releve[];
    isStructure: boolean;
  }[] = [];

  structures.forEach((s) => {
    const rel = releves.filter((r) => getBienStructureId(r.bien) === s.id);
    if (rel.length > 0)
      groupes.push({
        key: s.id,
        label: s.nom,
        adresse: s.adresse,
        releves: rel,
        isStructure: true,
      });
  });
  const isoles = releves.filter((r) => getBienStructureId(r.bien) === null);
  if (isoles.length > 0)
    groupes.push({
      key: "isole",
      label: "Biens isolés",
      adresse: "Sans structure",
      releves: isoles,
      isStructure: false,
    });

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "#94A3B8" }}>
        {releves.length} relevé{releves.length > 1 ? "s" : ""} ·{" "}
        {groupes.length} groupe{groupes.length > 1 ? "s" : ""}
      </p>
      {groupes.map((groupe) => {
        const isOpen = ouvert === groupe.key;
        const nbEnvoyes = groupe.releves.filter(
          (r) => r.statut === "envoye",
        ).length;
        const nbBrouillons = groupe.releves.filter(
          (r) => r.statut === "brouillon",
        ).length;
        return (
          <motion.div
            key={String(groupe.key)}
            layout
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <button
              onClick={() => setOuvert(isOpen ? null : groupe.key)}
              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors"
              style={{ background: isOpen ? "#F0F9FF" : "#fff" }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: groupe.isStructure
                    ? "linear-gradient(135deg,#EFF6FF,#DBEAFE)"
                    : "#F1F5F9",
                  color: groupe.isStructure ? "#2563EB" : "#94A3B8",
                }}
              >
                {groupe.isStructure ? (
                  <IconBuilding size={20} />
                ) : (
                  <IconHome2 size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-sm font-bold truncate"
                  style={{ color: "#0F172A" }}
                >
                  {groupe.label}
                </div>
                <div
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "#94A3B8" }}
                >
                  {groupe.adresse}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {nbBrouillons > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: "#F1F5F9", color: "#64748B" }}
                    >
                      {nbBrouillons} brouillon{nbBrouillons > 1 ? "s" : ""}
                    </span>
                  )}
                  {nbEnvoyes > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                      style={{ background: "#EFF6FF", color: "#2563EB" }}
                    >
                      {nbEnvoyes} envoyé{nbEnvoyes > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <IconChevronRight size={16} style={{ color: "#CBD5E1" }} />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupe.releves.map((r) => (
                      <CarteReleve
                        key={r.id}
                        r={r}
                        onEnvoyer={onEnvoyer}
                        onWhatsApp={onWhatsApp}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────
export default function RelevesPage() {
  const { user } = useAuth();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [allBiens, setAllBiens] = useState<Bien[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [releves, setReleves] = useState<Releve[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tarifLoading, setTarifLoading] = useState(false);
  const [tarifs, setTarifs] = useState<{
    tarif_eau: number;
    tarif_elec: number;
  } | null>(null);

  const [step, setStep] = useState(0);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(
    null,
  );
  const [selectedBien, setSelectedBien] = useState<Bien | null>(null);
  const [selectedContrat, setSelectedContrat] = useState<Contrat | null>(null);
  const [isSansStructure, setIsSansStructure] = useState(false);

  const [form, setForm] = useState({
    mois: now.getMonth() + 1,
    annee: now.getFullYear(),
    index_eau_debut: "",
    index_eau_fin: "",
    index_elec_debut: "",
    index_elec_fin: "",
    envoyer_maintenant: false,
  });

  const setF = (k: string, v: string | number | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Calculs en temps réel
  const conso_eau = calcConso(form.index_eau_debut, form.index_eau_fin);
  const conso_elec = calcConso(form.index_elec_debut, form.index_elec_fin);
  const montant_eau = tarifs ? Math.round(conso_eau * tarifs.tarif_eau) : 0;
  const montant_elec = tarifs ? Math.round(conso_elec * tarifs.tarif_elec) : 0;
  const montant_total = montant_eau + montant_elec;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [structRes, biensRes, contratsRes, relevesRes] = await Promise.all([
        api.get("/structures/"),
        api.get("/biens/"),
        api.get("/contrats/"),
        api.get("/releves/"),
      ]);
      setStructures(structRes.data.results ?? structRes.data);
      setAllBiens(biensRes.data.results ?? biensRes.data);
      setContrats(contratsRes.data.results ?? contratsRes.data);
      setReleves(relevesRes.data.results ?? relevesRes.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const biensFiltres = isSansStructure
    ? allBiens.filter((b) => !b.structure_id && b.statut === "occupe")
    : selectedStructure
      ? allBiens.filter(
          (b) =>
            b.structure_id === selectedStructure.id && b.statut === "occupe",
        )
      : [];

  const selectionnerBien = async (b: Bien) => {
    setSelectedBien(b);
    // Trouver le contrat actif pour ce bien
    const contrat =
      contrats.find((c) => {
        const bienId = typeof c.bien === "object" ? c.bien.id : c.bien;
        return bienId === b.id && c.statut === "actif";
      }) ?? null;
    setSelectedContrat(contrat);
    // Charger les tarifs
    setTarifLoading(true);
    try {
      const res = await api.get(
        `/index/${b.id}/calcul/?mois=${form.mois}&annee=${form.annee}`,
      );
      if (res.data.tarif_eau !== undefined) {
        setTarifs({
          tarif_eau: res.data.tarif_eau,
          tarif_elec: res.data.tarif_elec,
        });
      }
    } catch {
      setTarifs(null);
    } finally {
      setTarifLoading(false);
      setStep(2);
    }
  };

  const handleSubmit = async (envoyer = false) => {
    if (!selectedBien || !selectedContrat) {
      toast.error("Aucun contrat actif pour ce bien.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/releves/", {
        contrat: selectedContrat.id,
        bien: selectedBien.id,
        mois: form.mois,
        annee: form.annee,
        index_eau_debut: form.index_eau_debut
          ? parseFloat(form.index_eau_debut)
          : null,
        index_eau_fin: form.index_eau_fin
          ? parseFloat(form.index_eau_fin)
          : null,
        index_elec_debut: form.index_elec_debut
          ? parseFloat(form.index_elec_debut)
          : null,
        index_elec_fin: form.index_elec_fin
          ? parseFloat(form.index_elec_fin)
          : null,
        statut: envoyer ? "envoye" : "brouillon",
      });
      toast.success(
        envoyer
          ? `Relevé envoyé à ${selectedContrat.locataire.nom_complet} !`
          : "Relevé enregistré en brouillon.",
      );
      resetForm();
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const msg = e.response?.data
        ? Object.values(e.response.data).flat()[0]
        : "Erreur.";
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setStep(0);
    setSelectedStructure(null);
    setSelectedBien(null);
    setSelectedContrat(null);
    setIsSansStructure(false);
    setTarifs(null);
    setForm({
      mois: now.getMonth() + 1,
      annee: now.getFullYear(),
      index_eau_debut: "",
      index_eau_fin: "",
      index_elec_debut: "",
      index_elec_fin: "",
      envoyer_maintenant: false,
    });
    setShowForm(false);
  };

  const envoyerReleve = async (id: number) => {
    try {
      await api.patch(`/releves/${id}/`, { statut: "envoye" });
      toast.success("Relevé envoyé au locataire !");
      load();
    } catch {
      toast.error("Erreur lors de l'envoi.");
    }
  };

  const partagerWhatsApp = (r: Releve) => {
    let msg = `Bonjour ${r.locataire_nom || ""},\n\n`;
    msg += `Voici votre relevé de consommation pour *${r.bien_titre}* — ${MOIS_FR[r.mois]} ${r.annee} :\n\n`;
    if (r.conso_eau > 0)
      msg += `💧 *Eau* : ${r.conso_eau.toFixed(2)} m³ → *${r.montant_eau.toLocaleString("fr-FR")} XAF*\n`;
    if (r.conso_elec > 0)
      msg += `⚡ *Électricité* : ${r.conso_elec.toFixed(2)} kWh → *${r.montant_elec.toLocaleString("fr-FR")} XAF*\n`;
    if (r.montant_total > 0)
      msg += `\n💰 *Total charges : ${r.montant_total.toLocaleString("fr-FR")} XAF*\n`;
    msg += `\nPayez vos charges directement sur LocCam.\n— Votre bailleur`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  if (!user) return null;

  const inputStyle = (color: string) => ({
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "10px",
    border: `1.5px solid ${color}20`,
    fontSize: "13px",
    outline: "none",
    background: `${color}08`,
    fontFamily: "inherit",
    color: "#0F172A",
    boxSizing: "border-box" as const,
  });

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
      `}</style>

      <div
        className="min-h-screen"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
          style={{
            borderBottom: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(0,0,0,.04)",
          }}
        >
          <Link
            href="/bailleur"
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#64748B", textDecoration: "none" }}
          >
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px" style={{ background: "#E2E8F0" }} />
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0EA5E9,#0284C7)" }}
            >
              <IconDroplet size={15} color="white" />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Relevés eau & électricité
              </h1>
              <p
                className="text-xs hidden sm:block"
                style={{ color: "#94A3B8" }}
              >
                Saisie mensuelle des index
              </p>
            </div>
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 sm:px-4 h-9 rounded-xl text-xs sm:text-sm font-bold text-white"
              style={{
                background: "linear-gradient(135deg,#0EA5E9,#0284C7)",
                boxShadow: "0 2px 8px rgba(14,165,233,.35)",
                border: "none",
                cursor: "pointer",
              }}
            >
              <IconPlus size={15} />
              <span className="hidden sm:inline">Nouveau relevé</span>
            </motion.button>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">
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
                  onClick={resetForm}
                />
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 280 }}
                  className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
                  style={{
                    width: "min(480px,100vw)",
                    background: "#fff",
                    boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
                  }}
                >
                  {/* En-tête drawer */}
                  <div
                    className="flex items-center justify-between px-6 py-5 flex-shrink-0"
                    style={{ borderBottom: "1px solid #F1F5F9" }}
                  >
                    <div>
                      <h2
                        className="text-base font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        Nouveau relevé
                      </h2>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#94A3B8" }}
                      >
                        Saisie des index eau & électricité
                      </p>
                    </div>
                    <button
                      onClick={resetForm}
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
                  <div className="flex-1 overflow-y-auto px-6 py-5">
                    <Steps current={step} />

                    {/* ── Étape 0 : Structure ── */}
                    {step === 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-3"
                          style={{ color: "#94A3B8" }}
                        >
                          Sélectionnez une structure
                        </p>
                        <div className="space-y-2">
                          {structures.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedStructure(s);
                                setIsSansStructure(false);
                                setStep(1);
                              }}
                              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                              style={{
                                background: "#F8FAFC",
                                border: "1.5px solid #E2E8F0",
                                cursor: "pointer",
                              }}
                            >
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: "#EFF6FF",
                                  color: "#2563EB",
                                }}
                              >
                                <IconBuilding size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className="text-sm font-bold truncate"
                                  style={{ color: "#0F172A" }}
                                >
                                  {s.nom}
                                </div>
                                <div
                                  className="text-xs truncate"
                                  style={{ color: "#94A3B8" }}
                                >
                                  {s.adresse}
                                </div>
                              </div>
                              <IconChevronRight
                                size={16}
                                style={{ color: "#CBD5E1" }}
                              />
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setIsSansStructure(true);
                              setSelectedStructure(null);
                              setStep(1);
                            }}
                            className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                            style={{
                              background: "#F8FAFC",
                              border: "1.5px dashed #CBD5E1",
                              cursor: "pointer",
                            }}
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{
                                background: "#F1F5F9",
                                color: "#94A3B8",
                              }}
                            >
                              <IconHome2 size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#475569" }}
                              >
                                Bien isolé
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "#94A3B8" }}
                              >
                                Sans structure associée
                              </div>
                            </div>
                            <IconChevronRight
                              size={16}
                              style={{ color: "#CBD5E1" }}
                            />
                          </button>
                        </div>
                        {structures.length === 0 && (
                          <div
                            className="flex items-center gap-2 p-3 rounded-xl mt-4"
                            style={{
                              background: "#FFFBEB",
                              border: "1px solid #FDE68A",
                            }}
                          >
                            <IconAlertCircle
                              size={15}
                              style={{ color: "#D97706", flexShrink: 0 }}
                            />
                            <p className="text-xs" style={{ color: "#92400E" }}>
                              Aucune structure. Sélectionnez un bien isolé.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── Étape 1 : Bien ── */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setStep(0)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{
                              color: "#7C3AED",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <IconArrowLeft size={13} /> Retour
                          </button>
                          {selectedStructure && (
                            <span
                              className="text-xs px-2 py-1 rounded-lg font-semibold"
                              style={{
                                background: "#EFF6FF",
                                color: "#2563EB",
                              }}
                            >
                              {selectedStructure.nom}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-3"
                          style={{ color: "#94A3B8" }}
                        >
                          Sélectionnez le bien occupé
                        </p>
                        {biensFiltres.length === 0 ? (
                          <div className="flex flex-col items-center py-10 text-center">
                            <IconHome2
                              size={32}
                              style={{ color: "#CBD5E1", marginBottom: "8px" }}
                            />
                            <p
                              className="text-sm font-medium"
                              style={{ color: "#64748B" }}
                            >
                              Aucun bien occupé
                            </p>
                            <p
                              className="text-xs mt-1"
                              style={{ color: "#94A3B8" }}
                            >
                              Seuls les biens occupés peuvent avoir un relevé
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {biensFiltres.map((b) => {
                              const contrat = contrats.find((c) => {
                                const bienId =
                                  typeof c.bien === "object"
                                    ? c.bien.id
                                    : c.bien;
                                return bienId === b.id && c.statut === "actif";
                              });
                              return (
                                <button
                                  key={b.id}
                                  onClick={() => selectionnerBien(b)}
                                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left"
                                  style={{
                                    background: "#F8FAFC",
                                    border: "1.5px solid #E2E8F0",
                                    cursor: "pointer",
                                  }}
                                >
                                  <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{
                                      background: "#ECFDF5",
                                      color: "#059669",
                                    }}
                                  >
                                    <IconHome2 size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="text-sm font-bold truncate"
                                      style={{ color: "#0F172A" }}
                                    >
                                      {b.titre}
                                    </div>
                                    {contrat && (
                                      <div
                                        className="flex items-center gap-1 mt-0.5"
                                        style={{ color: "#64748B" }}
                                      >
                                        <IconUser size={11} />
                                        <span className="text-xs">
                                          {contrat.locataire.nom_complet}
                                        </span>
                                      </div>
                                    )}
                                    {!contrat && (
                                      <span
                                        className="text-xs"
                                        style={{ color: "#F59E0B" }}
                                      >
                                        Aucun contrat actif
                                      </span>
                                    )}
                                  </div>
                                  <IconChevronRight
                                    size={16}
                                    style={{ color: "#CBD5E1" }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* ── Étape 2 : Index ── */}
                    {step === 2 && selectedBien && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-1 text-xs font-semibold"
                            style={{
                              color: "#7C3AED",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            <IconArrowLeft size={13} /> Retour
                          </button>
                          <span
                            className="text-xs px-2 py-1 rounded-lg font-semibold"
                            style={{ background: "#ECFDF5", color: "#059669" }}
                          >
                            {selectedBien.titre}
                          </span>
                        </div>

                        {/* Locataire info */}
                        {selectedContrat && (
                          <div
                            className="flex items-center gap-2 p-3 rounded-xl mb-4"
                            style={{
                              background: "#EFF6FF",
                              border: "1px solid #BFDBFE",
                            }}
                          >
                            <IconUser
                              size={14}
                              style={{ color: "#2563EB", flexShrink: 0 }}
                            />
                            <div>
                              <div
                                className="text-xs font-bold"
                                style={{ color: "#1D4ED8" }}
                              >
                                {selectedContrat.locataire.nom_complet}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "#93C5FD" }}
                              >
                                {selectedContrat.locataire.telephone}
                              </div>
                            </div>
                          </div>
                        )}
                        {!selectedContrat && (
                          <div
                            className="flex items-center gap-2 p-3 rounded-xl mb-4"
                            style={{
                              background: "#FFFBEB",
                              border: "1px solid #FDE68A",
                            }}
                          >
                            <IconAlertCircle
                              size={14}
                              style={{ color: "#D97706", flexShrink: 0 }}
                            />
                            <p className="text-xs" style={{ color: "#92400E" }}>
                              Aucun contrat actif — le relevé sera sauvegardé en
                              brouillon.
                            </p>
                          </div>
                        )}

                        {/* Période */}
                        <p
                          className="text-xs font-bold uppercase tracking-wider mb-2"
                          style={{ color: "#94A3B8" }}
                        >
                          Période
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label
                              className="block text-xs font-semibold mb-1.5"
                              style={{ color: "#374151" }}
                            >
                              Mois
                            </label>
                            <select
                              value={form.mois}
                              onChange={(e) =>
                                setF("mois", parseInt(e.target.value))
                              }
                              style={{
                                ...inputStyle("#64748B"),
                                cursor: "pointer",
                              }}
                            >
                              {MOIS_FR.slice(1).map((m, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                              className="block text-xs font-semibold mb-1.5"
                              style={{ color: "#374151" }}
                            >
                              Année
                            </label>
                            <input
                              type="number"
                              value={form.annee}
                              onChange={(e) =>
                                setF("annee", parseInt(e.target.value))
                              }
                              min={2020}
                              max={2100}
                              style={inputStyle("#64748B")}
                            />
                          </div>
                        </div>

                        {/* Eau */}
                        <div
                          className="p-4 rounded-2xl mb-4"
                          style={{
                            background: "#F0F9FF",
                            border: "1px solid #BAE6FD",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <IconDroplet
                              size={16}
                              style={{ color: "#0EA5E9" }}
                            />
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#0284C7" }}
                            >
                              Eau
                            </span>
                            {tarifLoading && (
                              <span
                                className="text-xs"
                                style={{ color: "#7DD3FC" }}
                              >
                                Chargement tarifs...
                              </span>
                            )}
                            {tarifs && (
                              <span
                                className="text-xs ml-auto"
                                style={{ color: "#7DD3FC" }}
                              >
                                {tarifs.tarif_eau} XAF/m³
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { k: "index_eau_debut", lbl: "Index début (m³)" },
                              { k: "index_eau_fin", lbl: "Index fin (m³)" },
                            ].map((f) => (
                              <div key={f.k}>
                                <label
                                  className="block text-xs font-semibold mb-1.5"
                                  style={{ color: "#0284C7" }}
                                >
                                  {f.lbl}
                                </label>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={
                                    form[f.k as keyof typeof form] as string
                                  }
                                  onChange={(e) => setF(f.k, e.target.value)}
                                  placeholder="0.000"
                                  style={{
                                    ...inputStyle("#0EA5E9"),
                                    background: "rgba(14,165,233,.06)",
                                    border: "1.5px solid rgba(14,165,233,.2)",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {conso_eau > 0 && (
                            <div
                              className="flex items-center justify-between mt-2 pt-2"
                              style={{
                                borderTop: "1px solid rgba(14,165,233,.15)",
                              }}
                            >
                              <span
                                className="text-xs"
                                style={{ color: "#0EA5E9" }}
                              >
                                Conso : {conso_eau.toFixed(2)} m³
                              </span>
                              {montant_eau > 0 && (
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: "#0284C7" }}
                                >
                                  {montant_eau.toLocaleString("fr-FR")} XAF
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Élec */}
                        <div
                          className="p-4 rounded-2xl mb-4"
                          style={{
                            background: "#FFFBEB",
                            border: "1px solid #FDE68A",
                          }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <IconBolt size={16} style={{ color: "#F59E0B" }} />
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#D97706" }}
                            >
                              Électricité
                            </span>
                            {tarifs && (
                              <span
                                className="text-xs ml-auto"
                                style={{ color: "#FCD34D" }}
                              >
                                {tarifs.tarif_elec} XAF/kWh
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              {
                                k: "index_elec_debut",
                                lbl: "Index début (kWh)",
                              },
                              { k: "index_elec_fin", lbl: "Index fin (kWh)" },
                            ].map((f) => (
                              <div key={f.k}>
                                <label
                                  className="block text-xs font-semibold mb-1.5"
                                  style={{ color: "#D97706" }}
                                >
                                  {f.lbl}
                                </label>
                                <input
                                  type="number"
                                  step="0.001"
                                  min="0"
                                  value={
                                    form[f.k as keyof typeof form] as string
                                  }
                                  onChange={(e) => setF(f.k, e.target.value)}
                                  placeholder="0.000"
                                  style={{
                                    ...inputStyle("#F59E0B"),
                                    background: "rgba(245,158,11,.06)",
                                    border: "1.5px solid rgba(245,158,11,.2)",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          {conso_elec > 0 && (
                            <div
                              className="flex items-center justify-between mt-2 pt-2"
                              style={{
                                borderTop: "1px solid rgba(245,158,11,.15)",
                              }}
                            >
                              <span
                                className="text-xs"
                                style={{ color: "#F59E0B" }}
                              >
                                Conso : {conso_elec.toFixed(2)} kWh
                              </span>
                              {montant_elec > 0 && (
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: "#D97706" }}
                                >
                                  {montant_elec.toLocaleString("fr-FR")} XAF
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Total preview */}
                        {montant_total > 0 && (
                          <div
                            className="flex items-center justify-between p-3 rounded-xl mb-4"
                            style={{
                              background: "#ECFDF5",
                              border: "1px solid #A7F3D0",
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <IconCurrencyDollar
                                size={16}
                                style={{ color: "#059669" }}
                              />
                              <span
                                className="text-sm font-bold"
                                style={{ color: "#059669" }}
                              >
                                Total charges
                              </span>
                            </div>
                            <span
                              className="text-lg font-black"
                              style={{ color: "#059669" }}
                            >
                              {montant_total.toLocaleString("fr-FR")} XAF
                            </span>
                          </div>
                        )}

                        {!tarifs && !tarifLoading && (
                          <div
                            className="flex items-center gap-2 p-3 rounded-xl mb-4"
                            style={{
                              background: "#FFFBEB",
                              border: "1px solid #FDE68A",
                            }}
                          >
                            <IconAlertCircle
                              size={13}
                              style={{ color: "#D97706", flexShrink: 0 }}
                            />
                            <p className="text-xs" style={{ color: "#92400E" }}>
                              Tarifs non configurés — les montants seront
                              calculés après enregistrement.
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Pied du drawer */}
                  {step === 2 && (
                    <div
                      className="flex-shrink-0 px-6 py-4 flex flex-col gap-2"
                      style={{
                        borderTop: "1px solid #F1F5F9",
                        boxShadow: "0 -4px 16px rgba(0,0,0,.06)",
                      }}
                    >
                      {selectedContrat && (
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSubmit(true)}
                          disabled={saving}
                          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#2563EB,#1D4ED8)",
                            boxShadow: "0 2px 10px rgba(37,99,235,.3)",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {saving ? (
                            <IconLoader2
                              size={15}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <IconSend size={15} />
                          )}
                          Enregistrer et envoyer au locataire
                        </motion.button>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={resetForm}
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
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleSubmit(false)}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#0EA5E9,#0284C7)",
                            boxShadow: "0 2px 10px rgba(14,165,233,.3)",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {saving ? (
                            <IconLoader2
                              size={15}
                              style={{ animation: "spin 1s linear infinite" }}
                            />
                          ) : (
                            <IconCheck size={15} />
                          )}
                          Brouillon
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Liste */}
          {loading ? (
            <div className="space-y-3">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl h-20"
                    style={{
                      background:
                        "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                ))}
            </div>
          ) : releves.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "#F0F9FF" }}
              >
                <IconDroplet size={24} style={{ color: "#7DD3FC" }} />
              </div>
              <h3
                className="text-sm font-bold mb-1"
                style={{ color: "#0F172A" }}
              >
                Aucun relevé enregistré
              </h3>
              <p className="text-xs mb-5" style={{ color: "#94A3B8" }}>
                Commencez par saisir les index mensuels de vos biens.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#0EA5E9,#0284C7)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <IconPlus size={14} /> Premier relevé
              </motion.button>
            </div>
          ) : (
            <GroupesReleves
              releves={releves}
              allBiens={allBiens}
              structures={structures}
              onEnvoyer={envoyerReleve}
              onWhatsApp={partagerWhatsApp}
            />
          )}
        </div>
      </div>
    </>
  );
}
