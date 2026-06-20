"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LocataireSkeleton } from "@/components/dashboard/locataire/LocataireSkeleton";
import { ProgressBar } from "@/components/dashboard/shared/ProgressBar";
import { LocataireDashboardData } from "@/types/locataire";
import { Contrat, Notification } from "@/types";
import {
  IconBell,
  IconHome2,
  IconDroplet,
  IconBolt,
  IconCheck,
  IconAlertTriangle,
  IconMessage,
  IconTool,
  IconFileText,
  IconCircleCheck,
} from "@tabler/icons-react";

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = Date.now();
    const run = () => {
      const p = Math.min((Date.now() - start) / 900, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display.toLocaleString("fr-FR")}</>;
}

const NOTIF_STYLES: Record<
  string,
  { bg: string; col: string; ico: React.ReactNode }
> = {
  paiement_confirme: {
    bg: "#ECFDF5",
    col: "#059669",
    ico: <IconCheck size={12} />,
  },
  paiement_en_retard: {
    bg: "#FEF2F2",
    col: "#DC2626",
    ico: <IconAlertTriangle size={12} />,
  },
  nouveau_message: {
    bg: "#EFF6FF",
    col: "#2563EB",
    ico: <IconMessage size={12} />,
  },
  signalement_ouvert: {
    bg: "#FFFBEB",
    col: "#D97706",
    ico: <IconTool size={12} />,
  },
  signalement_resolu: {
    bg: "#ECFDF5",
    col: "#059669",
    ico: <IconCircleCheck size={12} />,
  },
  contrat_signe: {
    bg: "#F5F3FF",
    col: "#7C3AED",
    ico: <IconFileText size={12} />,
  },
};

interface Props {
  data: LocataireDashboardData | null;
  loading: boolean;
  contrat: Contrat | null;
  joursRestants: number;
}

export function LocatairePanneauDroit({
  data,
  loading,
  contrat,
  joursRestants,
}: Props) {
  return (
    <div
      className="hidden xl:flex w-72 flex-shrink-0 flex-col overflow-y-auto"
      style={{ background: "#fff", borderLeft: "1px solid #D1FAE5" }}
    >
      {/* Détail paiement */}
      <div
        className="p-5"
        style={{
          background: "linear-gradient(160deg,#064E3B,#059669)",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "rgba(255,255,255,.38)" }}
        >
          Détail du prochain paiement
        </div>
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="flex justify-between py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
                >
                  <LocataireSkeleton className="h-3 w-28" />
                  <LocataireSkeleton className="h-3 w-20" />
                </div>
              ))
          : [
              {
                lbl: "Loyer mensuel",
                val: contrat
                  ? `${contrat.loyer_mensuel.toLocaleString("fr-FR")} XAF`
                  : "—",
                ico: <IconHome2 size={12} />,
                bold: false,
              },
              {
                lbl: "Charges eau",
                val: "— XAF",
                ico: <IconDroplet size={12} />,
                bold: false,
              },
              {
                lbl: "Électricité",
                val: "— XAF",
                ico: <IconBolt size={12} />,
                bold: false,
              },
              {
                lbl: "Total",
                val: contrat
                  ? `${contrat.loyer_mensuel.toLocaleString("fr-FR")} XAF`
                  : "—",
                ico: null,
                bold: true,
              },
            ].map((r) => (
              <div
                key={r.lbl}
                className="flex items-center justify-between py-2.5"
                style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
              >
                <div className="flex items-center gap-1.5">
                  {r.ico && (
                    <span style={{ color: "rgba(255,255,255,.35)" }}>
                      {r.ico}
                    </span>
                  )}
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,.6)" }}
                  >
                    {r.lbl}
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: r.bold ? "#6EE7B7" : "#fff" }}
                >
                  {r.val}
                </span>
              </div>
            ))}
      </div>

      {/* Résumé année */}
      <div className="p-5" style={{ borderBottom: "1px solid #F0FDF4" }}>
        <div
          className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: "#94A3B8" }}
        >
          Résumé {new Date().getFullYear()}
        </div>
        <div className="space-y-3 mb-4">
          {[
            {
              lbl: "Paiements effectués",
              val: data?.paiementsEffectues ?? 0,
              max: 12,
              color: "#059669",
            },
            {
              lbl: "Mois sans retard",
              val: data?.moisSansRetard ?? 0,
              max: data?.paiementsEffectues || 1,
              color: "#2563EB",
            },
          ].map((s) => (
            <div key={s.lbl}>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: "#64748B" }}>{s.lbl}</span>
                <span className="font-bold" style={{ color: s.color }}>
                  {loading ? "—" : `${s.val}/${s.max}`}
                </span>
              </div>
              <ProgressBar
                pct={s.max > 0 ? (s.val / s.max) * 100 : 0}
                color={s.color}
              />
            </div>
          ))}
        </div>
        <div
          className="rounded-xl p-3.5"
          style={{ background: "#F0FDF4", border: "1px solid #D1FAE5" }}
        >
          <div className="text-xs mb-1" style={{ color: "#64748B" }}>
            Total payé ({new Date().getFullYear()})
          </div>
          <div className="text-xl font-bold" style={{ color: "#059669" }}>
            {loading ? (
              <LocataireSkeleton className="h-6 w-28" />
            ) : (
              <>
                <AnimatedNumber value={data?.totalPaye ?? 0} /> XAF
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex-1 p-5">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#94A3B8" }}
        >
          Activité récente
        </div>
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex gap-2.5 py-3"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <LocataireSkeleton className="w-7 h-7 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <LocataireSkeleton className="h-3 w-24" />
                  <LocataireSkeleton className="h-3 w-32" />
                </div>
              </div>
            ))
        ) : (data?.notifications ?? []).length === 0 ? (
          <div className="py-6 text-center">
            <IconBell
              size={24}
              style={{ color: "#A7F3D0", margin: "0 auto 6px" }}
            />
            <p className="text-xs" style={{ color: "#94A3B8" }}>
              Aucune activité récente
            </p>
          </div>
        ) : (
          (data?.notifications ?? []).map((n, i) => {
            const st = NOTIF_STYLES[n.type] ?? {
              bg: "#ECFDF5",
              col: "#059669",
              ico: <IconBell size={12} />,
            };
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-2.5 py-3 row-hover cursor-pointer -mx-5 px-5"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: st.bg }}
                >
                  <span style={{ color: st.col }}>{st.ico}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-xs font-semibold truncate"
                    style={{ color: "#0F172A" }}
                  >
                    {n.titre}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: "#94A3B8" }}
                  >
                    {n.message}
                  </div>
                </div>
                {!n.est_lue && (
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 pulse"
                    style={{ background: "#059669" }}
                  />
                )}
              </motion.div>
            );
          })
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "linear-gradient(135deg,#ECFDF5,#D1FAE5)",
            border: "1px solid #A7F3D0",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "#059669",
              boxShadow: "0 4px 10px rgba(5,150,105,.3)",
            }}
          >
            <IconBell size={18} color="white" />
          </div>
          <div>
            <div className="text-xs font-semibold" style={{ color: "#059669" }}>
              Prochain loyer dans
            </div>
            <div className="text-2xl font-bold" style={{ color: "#059669" }}>
              {joursRestants} jours
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
