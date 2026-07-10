"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/hooks/useT";
import { Skeleton } from "@/components/dashboard/shared/Skeleton";
import { Paiement } from "@/types";
import api from "@/lib/api";
import {
  IconCreditCard,
  IconCheck,
  IconAlertTriangle,
  IconClock,
  IconChevronRight,
  IconHome2,
  IconCircleCheck,
} from "@tabler/icons-react";

interface Props {
  paiements: Paiement[];
  loading: boolean;
}

// ── Type impayé (format retourné par /paiements/impayes/) ──────
interface Impaye {
  contrat_id: number;
  locataire: { id: number; nom_complet: string; email: string; telephone: string };
  bien: { id: number; titre: string; adresse: string };
  loyer_mensuel: number;
  mois: number;
  annee: number;
  jours_retard: number;
  paiement_id: number | null;
  statut: "non_initie" | "en_attente" | "echoue";
}

const MOIS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function BailleurPaiementsRecents({ paiements, loading }: Props) {
  const t = useT();

  // ── État impayés ─────────────────────────────────────────────
  const [impayes, setImpayes] = useState<Impaye[]>([]);
  const [loadingImp, setLoadingImp] = useState(true);

  useEffect(() => {
    let annule = false;
    (async () => {
      setLoadingImp(true);
      try {
        const res = await api.get("/paiements/impayes/");
        const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
        if (!annule) setImpayes(data);
      } catch {
        if (!annule) setImpayes([]);
      } finally {
        if (!annule) setLoadingImp(false);
      }
    })();
    return () => { annule = true; };
  }, []);

  return (
    <>
      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION IMPAYÉS                                          */}
      {/* ══════════════════════════════════════════════════════ */}
      {!loadingImp && impayes.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3 fade-up-4">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "#FEF2F2" }}
              >
                <IconAlertTriangle size={15} style={{ color: "#DC2626" }} />
              </div>
              <div
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#DC2626" }}
              >
                Impayés en cours ({impayes.length})
              </div>
            </div>
            <Link
              href="/bailleur/impayes"
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: "#DC2626", textDecoration: "none" }}
            >
              {t("common.voir_tout")} <IconChevronRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-2 mb-5 fade-up-4">
            {impayes.map((imp) => {
              const av = imp.locataire.nom_complet
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("");
              const statutBg = imp.statut === "en_attente" ? "#FFFBEB" : "#FEF2F2";
              const statutCol = imp.statut === "en_attente" ? "#D97706" : "#DC2626";
              const statutLbl =
                imp.statut === "en_attente"
                  ? t("dashboard.en_attente")
                  : imp.statut === "echoue"
                    ? t("dashboard.en_retard")
                    : "Non initié";

              return (
                <div
                  key={imp.contrat_id}
                  className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3"
                  style={{
                    border: "1px solid #FECACA",
                    boxShadow: "0 1px 3px rgba(220,38,38,.05)",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#DC2626,#B91C1C)" }}
                  >
                    {av}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span
                        className="text-sm font-semibold truncate"
                        style={{ color: "#0F172A" }}
                      >
                        {imp.locataire.nom_complet}
                      </span>
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: statutBg, color: statutCol }}
                      >
                        {statutLbl}
                      </span>
                      {imp.jours_retard > 0 && (
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                          style={{ background: "#FEF2F2", color: "#DC2626" }}
                        >
                          <IconClock size={10} />
                          {imp.jours_retard}j
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "#64748B" }}
                      >
                        <IconHome2 size={11} />
                        {imp.bien.titre}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "#64748B" }}
                      >
                        <IconClock size={11} />
                        {MOIS[imp.mois - 1]} {imp.annee}
                      </span>
                    </div>
                  </div>

                  {/* Montant + relance */}
                  <div className="text-right flex-shrink-0">
                    <div
                      className="text-sm font-bold mb-0.5"
                      style={{ color: "#DC2626" }}
                    >
                      {imp.loyer_mensuel.toLocaleString("fr-FR")} XAF
                    </div>
                    <Link
                      href={`/bailleur/impayes?contrat=${imp.contrat_id}`}
                      className="text-xs font-semibold flex items-center gap-0.5 justify-end"
                      style={{ color: "#DC2626", textDecoration: "none" }}
                    >
                      Relancer <IconChevronRight size={11} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Bandeau vert si aucun impayé */}
      {!loadingImp && impayes.length === 0 && (
        <div
          className="rounded-xl px-4 py-3 flex items-center gap-3 mb-5 fade-up-4"
          style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}
        >
          <IconCircleCheck size={18} style={{ color: "#059669", flexShrink: 0 }} />
          <div className="text-sm font-medium" style={{ color: "#065F46" }}>
            Aucun impayé en cours — tous vos locataires sont à jour
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* SECTION PAIEMENTS RÉCENTS (inchangée)                    */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between mb-3 fade-up-5">
        <div
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "#94A3B8" }}
        >
          {t("dashboard.paiements_recents")}
        </div>
        <Link
          href="/bailleur/paiements"
          className="flex items-center gap-1 text-xs font-semibold"
          style={{ color: "#2563EB", textDecoration: "none" }}
        >
          {t("common.voir_tout")} <IconChevronRight size={12} />
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl overflow-hidden mb-5 fade-up-6"
        style={{
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        }}
      >
        <div
          className="hidden sm:grid grid-cols-5 px-5 py-3"
          style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}
        >
          {[
            t("dashboard.locataire_col"),
            t("dashboard.periode_col"),
            t("dashboard.moyen_col"),
            t("dashboard.montant_col"),
            t("dashboard.statut_col"),
          ].map((h) => (
            <div
              key={h}
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#94A3B8" }}
            >
              {h}
            </div>
          ))}
        </div>

        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="flex gap-4 px-5 py-4"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
        ) : paiements.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <IconCreditCard
              size={32}
              style={{ color: "#CBD5E1", margin: "0 auto 8px" }}
            />
            <div className="text-sm font-medium" style={{ color: "#64748B" }}>
              {t("dashboard.aucun_paiement")}
            </div>
            <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>
              {t("dashboard.aucun_paiement_desc")}
            </div>
          </div>
        ) : (
          paiements.map((p) => {
            const loc = p.contrat?.locataire;
            const av =
              loc?.prenom?.[0] && loc?.nom?.[0]
                ? `${loc.prenom[0]}${loc.nom[0]}`
                : "?";
            const isConfirme = p.statut === "confirme";
            const isRetard = p.statut === "echoue" || p.est_en_retard;
            const col = isConfirme
              ? "#059669"
              : isRetard
                ? "#DC2626"
                : "#D97706";
            const bg = isConfirme
              ? "#ECFDF5"
              : isRetard
                ? "#FEF2F2"
                : "#FFFBEB";
            const lbl = isConfirme
              ? t("dashboard.confirme")
              : isRetard
                ? t("dashboard.en_retard")
                : t("dashboard.en_attente");
            return (
              <div
                key={p.id}
                className="row-hover grid grid-cols-5 px-4 sm:px-5 py-3 sm:py-3.5 items-center cursor-pointer"
                style={{ borderBottom: "1px solid #F8FAFC" }}
              >
                <div className="flex items-center gap-2 sm:gap-3 col-span-2 sm:col-span-1">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                    }}
                  >
                    {av}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <div
                      className="text-sm font-semibold truncate"
                      style={{ color: "#0F172A" }}
                    >
                      {loc?.nom_complet ?? "Locataire"}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: "#94A3B8" }}
                    >
                      {p.contrat?.bien?.titre ?? "Bien"}
                    </div>
                  </div>
                </div>
                <div
                  className="text-xs sm:text-sm"
                  style={{ color: "#64748B" }}
                >
                  {String(p.mois).padStart(2, "0")}/{p.annee}
                </div>
                <div className="hidden sm:block">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#FFFBEB", color: "#D97706" }}
                  >
                    {p.moyen_display ?? p.moyen_paiement}
                  </span>
                </div>
                <div
                  className="text-xs sm:text-sm font-bold"
                  style={{ color: col }}
                >
                  {p.montant_total.toLocaleString("fr-FR")} XAF
                </div>
                <div>
                  <span
                    className="text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                    style={{ background: bg, color: col }}
                  >
                    {isConfirme && <IconCheck size={10} />}
                    {isRetard && <IconAlertTriangle size={10} />}
                    {!isConfirme && !isRetard && <IconClock size={10} />}
                    <span className="hidden sm:inline">{lbl}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}