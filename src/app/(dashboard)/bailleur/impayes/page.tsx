"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconSend,
  IconPhone,
  IconMail,
  IconHome2,
  IconClock,
  IconCheck,
  IconX,
  IconLoader2,
  IconCalendar,
  IconCurrencyDollar,
  IconFilter,
  IconChevronRight,
  IconBell,
} from "@tabler/icons-react";

// ── Types ──────────────────────────────────────────────────
interface Impaye {
  contrat_id: number;
  locataire: {
    id: number;
    nom_complet: string;
    email: string;
    telephone: string;
  };
  bien: { id: number; titre: string; adresse: string };
  loyer_mensuel: number;
  mois: number;
  annee: number;
  jours_retard: number;
  paiement_id: number | null;
  statut: "en_attente" | "non_initie";
}

const MOIS = [
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

function Badge({ statut, jours }: { statut: Impaye["statut"]; jours: number }) {
  if (statut === "non_initie")
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: "#F1F5F9", color: "#64748B" }}
      >
        <IconX size={11} /> Non initié
      </span>
    );
  const urgence = jours >= 7;
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: urgence ? "#FEF2F2" : "#FFFBEB",
        color: urgence ? "#DC2626" : "#D97706",
      }}
    >
      <IconClock size={11} /> {jours}j de retard
    </span>
  );
}

function Avatar({ nom }: { nom: string }) {
  const colors = [
    "#3B82F6",
    "#059669",
    "#D97706",
    "#7C3AED",
    "#EF4444",
    "#06B6D4",
  ];
  const color = colors[(nom.charCodeAt(0) ?? 0) % colors.length];
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "12px",
        background: `${color}18`,
        border: `1.5px solid ${color}30`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: 15,
        color,
        flexShrink: 0,
      }}
    >
      {nom.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Drawer détail ──────────────────────────────────────────
function DrawerDetail({
  imp,
  onClose,
  onRelance,
}: {
  imp: Impaye;
  onClose: () => void;
  onRelance: (id: number, jours: number) => Promise<void>;
}) {
  const [relancing, setRelancing] = useState(false);

  const handleRelance = async () => {
    setRelancing(true);
    await onRelance(imp.contrat_id, imp.jours_retard);
    setRelancing(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,.35)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
        style={{
          width: "min(420px,100vw)",
          background: "#fff",
          boxShadow: "-8px 0 40px rgba(0,0,0,.15)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10"
          style={{ borderBottom: "1px solid #F1F5F9" }}
        >
          <h2 className="text-sm font-bold" style={{ color: "#0F172A" }}>
            Détail impayé
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#F1F5F9" }}
          >
            <IconX size={15} style={{ color: "#64748B" }} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Locataire */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
          >
            <Avatar nom={imp.locataire.nom_complet} />
            <div className="flex-1 min-w-0">
              <h3
                className="font-bold text-sm truncate"
                style={{ color: "#0F172A" }}
              >
                {imp.locataire.nom_complet}
              </h3>
              <p className="text-xs truncate" style={{ color: "#94A3B8" }}>
                {imp.locataire.email}
              </p>
              <div className="mt-1.5">
                <Badge statut={imp.statut} jours={imp.jours_retard} />
              </div>
            </div>
          </div>

          {/* Montant */}
          <div className="rounded-2xl overflow-hidden">
            <div
              className="p-5 text-center"
              style={{ background: "linear-gradient(135deg,#7F1D1D,#DC2626)" }}
            >
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,255,255,.6)" }}
              >
                Loyer impayé
              </p>
              <p
                className="text-4xl font-bold text-white mb-1"
                style={{ letterSpacing: "-1px" }}
              >
                {imp.loyer_mensuel.toLocaleString("fr-FR")} XAF
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,.65)" }}>
                {MOIS[imp.mois]} {imp.annee}
              </p>
            </div>
          </div>

          {/* Bien */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "#94A3B8" }}
            >
              Logement
            </div>
            <div
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: "#F8FAFC" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                <IconHome2 size={15} />
              </div>
              <div>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  {imp.bien.titre}
                </div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>
                  {imp.bien.adresse}
                </div>
              </div>
            </div>
          </div>

          {/* Contacts */}
          <div>
            <div
              className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: "#94A3B8" }}
            >
              Contacts
            </div>
            <div className="space-y-2">
              {[
                {
                  ico: <IconMail size={14} />,
                  val: imp.locataire.email,
                  lbl: "Email",
                },
                {
                  ico: <IconPhone size={14} />,
                  val: imp.locataire.telephone,
                  lbl: "Téléphone",
                },
              ].map((row) => (
                <div
                  key={row.lbl}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#F8FAFC" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF6FF", color: "#2563EB" }}
                  >
                    {row.ico}
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: "#94A3B8" }}>
                      {row.lbl}
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: "#0F172A" }}
                    >
                      {row.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleRelance}
              disabled={relancing}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white"
              style={{
                background: relancing
                  ? "#94A3B8"
                  : "linear-gradient(135deg,#DC2626,#B91C1C)",
                boxShadow: relancing ? "none" : "0 4px 14px rgba(220,38,38,.4)",
              }}
            >
              {relancing ? (
                <>
                  <IconLoader2
                    size={15}
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  Envoi en cours...
                </>
              ) : (
                <>
                  <IconSend size={15} /> Envoyer une relance par email
                </>
              )}
            </motion.button>

            <a
              href={`tel:${imp.locataire.telephone}`}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "#F1F5F9",
                color: "#475569",
                textDecoration: "none",
                display: "flex",
              }}
            >
              <IconPhone size={14} /> Appeler le locataire
            </a>
          </div>
        </div>
      </motion.div>
    </>
  );
}

// ── Page principale ────────────────────────────────────────
export default function ImpayesPage() {
  const { user } = useAuth();
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Impaye | null>(null);
  const [search, setSearch] = useState("");
  const [filtre, setFiltre] = useState<"tous" | "en_attente" | "non_initie">(
    "tous",
  );

  // ✅ Initialisation côté client uniquement
  const [mois, setMois] = useState<number>(() => new Date().getMonth() + 1);
  const [annee, setAnnee] = useState<number>(() => new Date().getFullYear());

  useEffect(() => {
    const init = async () => {
      await load();
    };
    init();
  }, [mois, annee]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Impaye[]>(
        `/paiements/impayes/?mois=${mois}&annee=${annee}`,
      );
      setImpayes(res.data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const handleRelance = async (contrat_id: number, jours_retard: number) => {
    try {
      await api.post(`/paiements/relancer/${contrat_id}/`, {
        mois,
        annee,
        jours_retard,
      });
      toast.success("Relance envoyée avec succès !");
      setSelected(null);
    } catch {
      toast.error("Erreur lors de l'envoi de la relance");
    }
  };

  const filtered = impayes.filter((imp) => {
    const matchSearch =
      !search ||
      imp.locataire.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      imp.locataire.email.toLowerCase().includes(search.toLowerCase()) ||
      imp.bien.titre.toLowerCase().includes(search.toLowerCase());
    const matchFiltre = filtre === "tous" || imp.statut === filtre;
    return matchSearch && matchFiltre;
  });

  const stats = {
    total: impayes.length,
    en_attente: impayes.filter((i) => i.statut === "en_attente").length,
    non_initie: impayes.filter((i) => i.statut === "non_initie").length,
    montant: impayes.reduce((a, i) => a + i.loyer_mensuel, 0),
  };

  // ✅ Boutons toujours relatifs à aujourd'hui
  const boutonsMois = [-2, -1, 0].map((offset) => {
    const today = new Date();
    const d = new Date(today.getFullYear(), today.getMonth() + offset);
    return { m: d.getMonth() + 1, a: d.getFullYear() };
  });

  if (!user) return null;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#E2E8F0;border-radius:4px}
        .row-h{transition:background .12s}.row-h:hover{background:#FEF2F2}
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Header */}
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
              <span className="hidden sm:inline">Retour</span>
            </Link>
            <div
              className="h-5 w-px flex-shrink-0"
              style={{ background: "#E2E8F0" }}
            />
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconAlertCircle
                size={17}
                style={{ color: "#DC2626", flexShrink: 0 }}
              />
              <h1
                className="text-sm font-bold truncate"
                style={{ color: "#0F172A" }}
              >
                Impayés
              </h1>
              {!loading && impayes.length > 0 && (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: "#FEF2F2", color: "#DC2626" }}
                >
                  {impayes.length}
                </span>
              )}
            </div>
            <button
              onClick={load}
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
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
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 pt-4 pb-6 space-y-4">
              {/* Sélecteur mois — toujours relatif à aujourd'hui */}
              <div
                className="flex items-center gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                <IconCalendar
                  size={15}
                  style={{ color: "#94A3B8", flexShrink: 0 }}
                />
                <div className="flex gap-1.5">
                  {boutonsMois.map(({ m, a }) => {
                    const actif = m === mois && a === annee;
                    return (
                      <button
                        key={`${m}-${a}`}
                        onClick={() => {
                          setMois(m);
                          setAnnee(a);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-all"
                        style={
                          actif
                            ? { background: "#DC2626", color: "white" }
                            : { background: "#F1F5F9", color: "#64748B" }
                        }
                      >
                        {MOIS[m].slice(0, 3)} {a}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stats */}
              {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    {
                      lbl: "Total impayés",
                      val: stats.total,
                      col: "#DC2626",
                      bg: "#FEF2F2",
                      ico: <IconAlertCircle size={15} />,
                    },
                    {
                      lbl: "En attente",
                      val: stats.en_attente,
                      col: "#D97706",
                      bg: "#FFFBEB",
                      ico: <IconClock size={15} />,
                    },
                    {
                      lbl: "Non initiés",
                      val: stats.non_initie,
                      col: "#64748B",
                      bg: "#F1F5F9",
                      ico: <IconX size={15} />,
                    },
                    {
                      lbl: "Montant total",
                      val: `${stats.montant.toLocaleString("fr-FR")} XAF`,
                      col: "#DC2626",
                      bg: "#FEF2F2",
                      ico: <IconCurrencyDollar size={15} />,
                    },
                  ].map((s) => (
                    <div
                      key={s.lbl}
                      className="bg-white rounded-2xl p-4 flex items-center gap-3"
                      style={{ border: "1px solid #E2E8F0" }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.bg, color: s.col }}
                      >
                        {s.ico}
                      </div>
                      <div className="min-w-0">
                        <div
                          className="font-bold text-sm truncate"
                          style={{ color: s.col }}
                        >
                          {s.val}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: "#94A3B8" }}
                        >
                          {s.lbl}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filtres + recherche */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <IconFilter
                    size={13}
                    style={{
                      position: "absolute",
                      left: "11px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#94A3B8",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Locataire, bien..."
                    style={{
                      width: "100%",
                      height: "40px",
                      paddingLeft: "32px",
                      paddingRight: "12px",
                      border: "1.5px solid #E2E8F0",
                      borderRadius: "10px",
                      fontSize: "13px",
                      color: "#0F172A",
                      outline: "none",
                      background: "white",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
                <div
                  className="flex gap-1 p-1 rounded-xl flex-shrink-0"
                  style={{ background: "#F1F5F9" }}
                >
                  {[
                    { val: "tous", lbl: "Tous" },
                    { val: "en_attente", lbl: "En attente" },
                    { val: "non_initie", lbl: "Non initiés" },
                  ].map((f) => (
                    <button
                      key={f.val}
                      onClick={() => setFiltre(f.val as typeof filtre)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={
                        filtre === f.val
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
              </div>

              {/* Liste */}
              {loading ? (
                <div className="space-y-3">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="h-20 rounded-2xl"
                        style={{
                          background:
                            "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl"
                  style={{ border: "1px solid #E2E8F0" }}
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "#ECFDF5" }}
                  >
                    <IconCheck size={28} style={{ color: "#059669" }} />
                  </div>
                  <h3
                    className="text-base font-bold mb-2"
                    style={{ color: "#0F172A" }}
                  >
                    {search || filtre !== "tous"
                      ? "Aucun résultat"
                      : "Aucun impayé !"}
                  </h3>
                  <p className="text-sm" style={{ color: "#64748B" }}>
                    {search || filtre !== "tous"
                      ? "Modifiez vos filtres"
                      : `Tous les loyers de ${MOIS[mois]} ${annee} ont été payés.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((imp, i) => (
                    <motion.div
                      key={imp.contrat_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="row-h bg-white flex items-center gap-3 p-4 rounded-2xl cursor-pointer"
                      style={{ border: "1px solid #E2E8F0" }}
                      onClick={() => setSelected(imp)}
                    >
                      <Avatar nom={imp.locataire.nom_complet} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span
                            className="text-sm font-bold truncate"
                            style={{ color: "#0F172A" }}
                          >
                            {imp.locataire.nom_complet}
                          </span>
                          <Badge statut={imp.statut} jours={imp.jours_retard} />
                        </div>
                        <div
                          className="flex items-center gap-2 text-xs"
                          style={{ color: "#94A3B8" }}
                        >
                          <IconHome2 size={11} />
                          <span className="truncate">{imp.bien.titre}</span>
                          <span>·</span>
                          <span
                            className="font-semibold"
                            style={{ color: "#DC2626" }}
                          >
                            {imp.loyer_mensuel.toLocaleString("fr-FR")} XAF
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRelance(imp.contrat_id, imp.jours_retard);
                          }}
                          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                          style={{ background: "#FEF2F2", color: "#DC2626" }}
                        >
                          <IconBell size={12} /> Relancer
                        </button>
                        <IconChevronRight
                          size={15}
                          style={{ color: "#CBD5E1" }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Drawer */}
        <AnimatePresence>
          {selected && (
            <DrawerDetail
              imp={selected}
              onClose={() => setSelected(null)}
              onRelance={handleRelance}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
