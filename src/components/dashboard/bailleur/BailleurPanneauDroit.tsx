"use client";

import { useT } from "@/hooks/useT";
import { Skeleton } from "@/components/dashboard/shared/Skeleton";
import UploadFichier from "@/components/UploadFichier";
import { BailleurStats } from "@/types/bailleur";
import { Notification } from "@/types";
import {
  IconBell,
  IconCreditCard,
  IconAlertTriangle,
  IconMessage,
  IconTool,
  IconCheck,
  IconFileText,
  IconAlertCircle,
} from "@tabler/icons-react";

interface Props {
  stats: BailleurStats | null;
  notifs: Notification[];
  loading: boolean;
  cniStatut: string;
  onRefreshCNI: () => void;
}

const NOTIF_STYLES: Record<
  string,
  { ico: React.ReactNode; bg: string; col: string }
> = {
  paiement_confirme: {
    ico: <IconCreditCard size={13} />,
    bg: "#ECFDF5",
    col: "#059669",
  },
  paiement_en_retard: {
    ico: <IconAlertTriangle size={13} />,
    bg: "#FEF2F2",
    col: "#DC2626",
  },
  nouveau_message: {
    ico: <IconMessage size={13} />,
    bg: "#EFF6FF",
    col: "#2563EB",
  },
  signalement_ouvert: {
    ico: <IconTool size={13} />,
    bg: "#FFFBEB",
    col: "#D97706",
  },
  signalement_resolu: {
    ico: <IconCheck size={13} />,
    bg: "#ECFDF5",
    col: "#059669",
  },
  contrat_signe: {
    ico: <IconFileText size={13} />,
    bg: "#F5F3FF",
    col: "#7C3AED",
  },
};

export function BailleurPanneauDroit({
  stats,
  notifs,
  loading,
  cniStatut,
  onRefreshCNI,
}: Props) {
  const t = useT();

  return (
    <div
      className="hidden xl:flex w-72 flex-shrink-0 flex-col overflow-y-auto"
      style={{ background: "#fff", borderLeft: "1px solid #E2E8F0" }}
    >
      {/* Aperçu financier */}
      <div
        className="p-5"
        style={{
          background: "linear-gradient(160deg,#0C1F35,#1E3A5F)",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            {t("dashboard.apercu_financier")}
          </div>
          <div
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{
              background: "rgba(255,255,255,.08)",
              color: "rgba(255,255,255,.5)",
            }}
          >
            {t("dashboard.ce_mois")}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            {
              lbl: t("dashboard.encaisse"),
              val: stats?.revenus_encaisses ?? 0,
              col: "#34D399",
            },
            {
              lbl: t("dashboard.impayes"),
              val: stats?.montant_impayes ?? 0,
              col: "#FCD34D",
            },
          ].map((r) => (
            <div
              key={r.lbl}
              className="rounded-xl p-3"
              style={{ background: "rgba(255,255,255,.06)" }}
            >
              <div
                className="text-xs mb-1.5"
                style={{ color: "rgba(255,255,255,.35)" }}
              >
                {r.lbl}
              </div>
              {loading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <div className="font-bold text-sm" style={{ color: r.col }}>
                  {r.val.toLocaleString("fr-FR")}
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          className="rounded-xl p-3 mb-4"
          style={{ background: "rgba(255,255,255,.06)" }}
        >
          <div
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,.35)" }}
          >
            {t("dashboard.revenu_net")}
          </div>
          {loading ? (
            <Skeleton className="h-7 w-24" />
          ) : (
            <div className="font-bold text-white text-xl">
              {(stats?.revenus_mois ?? 0).toLocaleString("fr-FR")}
              <span className="text-xs font-normal ml-1 opacity-50">XAF</span>
            </div>
          )}
        </div>
        <div className="flex items-end gap-1" style={{ height: "40px" }}>
          {[35, 50, 42, 65, 52, 70, 55, 90].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t transition-all duration-500"
              style={{
                height: `${h}%`,
                background: i === 7 ? "#3B82F6" : "rgba(255,255,255,.12)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Activités récentes */}
      <div className="flex-1 p-4">
        <div
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#94A3B8" }}
        >
          {t("dashboard.activites_recentes")}
        </div>
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex gap-3 py-3"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
        ) : notifs.length === 0 ? (
          <div className="py-8 text-center">
            <IconBell
              size={28}
              style={{ color: "#CBD5E1", margin: "0 auto 8px" }}
            />
            <div className="text-xs" style={{ color: "#94A3B8" }}>
              {t("dashboard.aucune_activite")}
            </div>
          </div>
        ) : (
          notifs.map((n, i) => {
            const s = NOTIF_STYLES[n.type] ?? {
              ico: <IconBell size={13} />,
              bg: "#EFF6FF",
              col: "#2563EB",
            };
            return (
              <div
                key={n.id}
                className="flex gap-2.5 py-3 row-hover cursor-pointer -mx-4 px-4"
                style={{
                  borderBottom: "1px solid #F8FAFC",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg }}
                >
                  <span style={{ color: s.col }}>{s.ico}</span>
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
                  <div className="text-xs mt-0.5" style={{ color: "#CBD5E1" }}>
                    {new Date(n.date_creation).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                {!n.est_lue && (
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: "#3B82F6" }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* CNI */}
      {cniStatut !== "valide" && (
        <div className="p-4 mt-2" style={{ borderTop: "1px solid #F1F5F9" }}>
          <div
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#94A3B8" }}
          >
            {t("compte.cni_titre")}
          </div>
          {cniStatut === "en_attente" ? (
            <div
              className="flex items-center gap-2.5 p-3 rounded-xl"
              style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
            >
              <IconAlertCircle
                size={16}
                style={{ color: "#D97706", flexShrink: 0 }}
              />
              <div>
                <div className="text-xs font-bold" style={{ color: "#92400E" }}>
                  {t("dashboard.cni_en_attente")}
                </div>
                <div className="text-xs" style={{ color: "#B45309" }}>
                  {t("dashboard.cni_en_attente_desc")}
                </div>
              </div>
            </div>
          ) : (
            <UploadFichier
              typeDocument="cni"
              label="Photo CNI"
              description="JPG, PNG ou PDF · Max 5 MB"
              onSuccess={onRefreshCNI}
            />
          )}
        </div>
      )}
    </div>
  );
}
