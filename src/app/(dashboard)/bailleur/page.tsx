"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Bien, Paiement, Notification, PaginatedResponse } from "@/types";
import UploadFichier from "@/components/UploadFichier";
import NotificationBell from '@/components/NotificationBell'
import {
  IconLayoutDashboard,
  IconBuilding,
  IconHome2,
  IconUsers,
  IconCreditCard,
  IconFileText,
  IconDroplet,
  IconMessage,
  IconTool,
  IconSettings,
  IconLogout,
  IconBell,
  IconDownload,
  IconPlus,
  IconCalendar,
  IconArrowRight,
  IconCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconTrendingUp,
  IconChevronRight,
  IconRefresh,
  IconX,
  IconMenu2,
  IconChartBar,
  IconClock,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";

interface Stats {
  total_biens: number;
  biens_libres: number;
  biens_occupes: number;
  taux_occupation: number;
  revenus_mois: number;
  revenus_encaisses: number;
  impayes: number;
  montant_impayes: number;
  loyers_confirmes: number;
  signalements: number;
  baux_renouveler: number;
}

function AnimatedNumber({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * value));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString("fr-FR")}</>;
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #E6EDF4 25%, #F1F5F9 50%, #E6EDF4 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export default function BailleurDashboard() {
  const { user, deconnexion } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [notifications, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [notifOpen, setNotifOpen] = useState(false);
  const today = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (user) chargerDonnees();
  }, [user]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [biensRes, paiRes, notifsRes] = await Promise.all([
        api.get<PaginatedResponse<Bien>>("/biens/"),
        api.get<PaginatedResponse<Paiement>>("/paiements/"),
        api.get<PaginatedResponse<Notification>>("/notifications/"),
      ]);
      const bs = biensRes.data.results;
      const ps = paiRes.data.results;
      const occupes = bs.filter((b) => b.statut === "occupe").length;
      const libres = bs.filter((b) => b.statut === "libre").length;
      const total = bs.length;
      const confirmes = ps.filter((p) => p.statut === "confirme");
      const impayes = ps.filter(
        (p) =>
          p.statut === "echoue" ||
          (p.statut === "en_attente" && p.est_en_retard),
      );
      const revenus = confirmes.reduce((s, p) => s + p.montant_total, 0);
      const montantImpayes = impayes.reduce((s, p) => s + p.montant_total, 0);
      setStats({
        total_biens: total,
        biens_libres: libres,
        biens_occupes: occupes,
        taux_occupation: total > 0 ? Math.round((occupes / total) * 100) : 0,
        revenus_mois: revenus,
        revenus_encaisses: revenus,
        impayes: impayes.length,
        montant_impayes: montantImpayes,
        loyers_confirmes: confirmes.length,
        signalements: 0,
        baux_renouveler: 0,
      });
      setPaiements(ps.slice(0, 5));
      setNotifs(notifsRes.data.results.slice(0, 8));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const initiales = `${user.prenom[0]}${user.nom[0]}`;

  const navGroups = [
    {
      label: "Principal",
      items: [
        { icon: <IconLayoutDashboard size={16} />, label: "Dashboard" },
        {
          icon: <IconBuilding size={16} />,
          label: "Structures",
          href: "/bailleur/structures",
        },
        {
          icon: <IconHome2 size={15} />,
          label: "Mes biens",
          href: "/bailleur/biens",
        },
        {
          icon: <IconUsers size={16} />,
          label: "Locataires",
          href: "/bailleur/locataires",
        },
      ],
    },
    {
      label: "Finances",
      items: [
        {
          icon: <IconCreditCard size={16} />,
          label: "Paiements",
          href: "/bailleur/paiements",
        },
        {
          icon: <IconFileText size={16} />,
          label: "Contrats",
          href: "/bailleur/contrats",
        },
        { icon: <IconDroplet size={16} />, label: "Eau / Électricité" },
        { label: 'Relevés eau & élec', href: '/bailleur/releves', icon: <IconDroplet size={16}/> },
      ],
    },
    {
      label: "Communication",
      items: [
        {
          icon: <IconMessage size={16} />,
          label: "Messagerie",
          badge: 3,
          badgeColor: "#3B82F6",
        },
        {
          icon: <IconTool size={16} />,
          label: "Signalements",
          badge: 2,
          badgeColor: "#EF4444",
        },
      ],
    },
    {
  label: "Compte",
  items: [
    { icon: <IconSettings size={16} />, label: "Paramètres" },
    { icon: <IconUser size={16} />,     label: 'Mon compte', href: '/bailleur/compte' },
  ],
},
  ];

  const kpis = [
    {
      label: "Total biens",
      value: stats?.total_biens ?? 0,
      sub: `${stats?.biens_libres ?? 0} libres · ${stats?.biens_occupes ?? 0} occupés`,
      icon: <IconHome2 size={20} />,
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      progress: null,
    },
    {
      label: "Taux d'occupation",
      value: stats?.taux_occupation ?? 0,
      suffix: "%",
      sub: `${stats?.biens_occupes ?? 0} / ${stats?.total_biens ?? 0} logements`,
      icon: <IconChartBar size={20} />,
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      progress: stats?.taux_occupation ?? 0,
    },
    {
      label: "Revenus du mois",
      value: stats?.revenus_mois ?? 0,
      suffix: " XAF",
      sub: "Paiements confirmés",
      icon: <IconCreditCard size={20} />,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      progress: null,
    },
    {
      label: "Impayés en cours",
      value: stats?.impayes ?? 0,
      sub: stats?.montant_impayes
        ? `${stats.montant_impayes.toLocaleString("fr-FR")} XAF`
        : "Aucun retard",
      icon: <IconAlertCircle size={20} />,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      progress: null,
      alert: true,
    },
  ];

  const suiviParc = [
    {
      label: "Loyers confirmés",
      value: stats?.loyers_confirmes ?? 0,
      sub: "Ce mois",
      icon: <IconCheck size={16} />,
      color: "#059669",
      bg: "#ECFDF5",
    },
    {
      label: "Impayés",
      value: stats?.impayes ?? 0,
      sub: "Relances actives",
      icon: <IconAlertCircle size={16} />,
      color: "#DC2626",
      bg: "#FEF2F2",
    },
    {
      label: "Signalements",
      value: stats?.signalements ?? 0,
      sub: "En traitement",
      icon: <IconTool size={16} />,
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      label: "Baux à renouveler",
      value: stats?.baux_renouveler ?? 0,
      sub: "Dans 30 jours",
      icon: <IconFileText size={16} />,
      color: "#7C3AED",
      bg: "#F5F3FF",
    },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .fade-up { animation: fadeUp .4s ease both }
        .fade-up-1 { animation: fadeUp .4s .05s ease both }
        .fade-up-2 { animation: fadeUp .4s .1s ease both }
        .fade-up-3 { animation: fadeUp .4s .15s ease both }
        .fade-up-4 { animation: fadeUp .4s .2s ease both }
        .fade-up-5 { animation: fadeUp .4s .25s ease both }
        .fade-up-6 { animation: fadeUp .4s .3s ease both }
        .slide-in { animation: slideIn .3s ease both }
        .nav-item:hover { background: rgba(255,255,255,0.06); }
        .nav-item { transition: background .15s, color .15s; }
        .kpi-card { transition: transform .2s, box-shadow .2s; }
        .kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
        .row-hover:hover { background: #F8FAFD; }
        .row-hover { transition: background .15s; }
        .btn-primary { transition: opacity .15s, transform .15s; }
        .btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .notif-dot { animation: pulse 2s infinite; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E6EDF4; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        * { scrollbar-width: thin; scrollbar-color: #E6EDF4 transparent; }
        @media (max-width: 1024px) {
          .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 40; }
          .sidebar-mobile { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); transition: transform .3s; }
          .sidebar-mobile.open { transform: translateX(0); }
        }
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        }}
      >
        {/* ── SIDEBAR ── */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside
          className={`sidebar-mobile lg:relative lg:translate-x-0 w-60 flex-shrink-0 flex flex-col h-full ${sidebarOpen ? "open" : ""}`}
          style={{
            background: "linear-gradient(180deg, #0C1F35 0%, #0F2438 100%)",
            boxShadow: "4px 0 24px rgba(0,0,0,.18)",
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center gap-3 px-5 py-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                boxShadow: "0 4px 12px rgba(37,99,235,.4)",
              }}
            >
              <IconBuilding size={18} color="white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-none tracking-tight">
                LocCam
              </div>
              <div
                className="text-xs mt-0.5 font-medium"
                style={{ color: "rgba(255,255,255,.35)" }}
              >
                Espace bailleur
              </div>
            </div>
            <button
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
              style={{ color: "rgba(255,255,255,.4)" }}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <div
                  className="text-xs font-bold uppercase tracking-widest px-2 mb-1.5"
                  style={{
                    color: "rgba(255,255,255,.22)",
                    letterSpacing: ".1em",
                  }}
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const isActive = activeNav === item.label;
                  const content = (
                    <>
                      <span
                        style={{
                          color: isActive ? "#60A5FA" : "rgba(255,255,255,.4)",
                        }}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{
                            background: item.badgeColor,
                            fontSize: "10px",
                            minWidth: "18px",
                            textAlign: "center",
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  const cls = `nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm text-left`;
                  const style = isActive
                    ? {
                        background: "rgba(37,99,235,.25)",
                        color: "#93C5FD",
                        fontWeight: 600,
                      }
                    : { color: "rgba(255,255,255,.5)" };

                  return "href" in item && item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActiveNav(item.label)}
                      className={cls}
                      style={{ ...style, textDecoration: "none" }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={item.label}
                      onClick={() => {
                        setActiveNav(item.label);
                        setSidebarOpen(false);
                      }}
                      className={cls}
                      style={style}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-3 pb-4">
            <div
              className="flex items-center gap-3 px-3 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                }}
              >
                {initiales}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">
                  {user.nom_complet}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full notif-dot"
                    style={{ background: "#10B981" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,.35)" }}
                  >
                    En ligne
                  </span>
                </div>
              </div>
              <button
                onClick={deconnexion}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "rgba(255,255,255,.3)" }}
                title="Déconnexion"
              >
                <IconLogout size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <header
            className="flex items-center gap-3 px-5 h-14 flex-shrink-0"
            style={{
              background: "#fff",
              borderBottom: "1px solid #E6EDF4",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
            <button
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "#F1F5F9" }}
              onClick={() => setSidebarOpen(true)}
            >
              <IconMenu2 size={18} style={{ color: "#64748B" }} />
            </button>
            <div className="flex-1">
              <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Tableau de bord
              </h1>
              <div className="text-xs" style={{ color: "#94A3B8" }}>
                {today}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                onClick={chargerDonnees}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
                title="Actualiser"
              >
                <IconRefresh
                  size={15}
                  style={{
                    color: "#64748B",
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
              </button>

              {/* Notifs */}
              <NotificationBell color="#64748B" bgColor="#F1F5F9" borderColor="#E2E8F0" />

              {/* Export */}
              <button
                className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-medium"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  color: "#475569",
                }}
              >
                <IconDownload size={13} />
                Exporter
              </button>

              {/* CTA */}
              <button
                className="btn-primary flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-white"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  boxShadow: "0 2px 8px rgba(37,99,235,.35)",
                }}
              >
                <IconPlus size={14} />
                <span className="hidden sm:inline">Ajouter un bien</span>
              </button>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #7C3AED)",
                }}
              >
                {initiales}
              </div>
            </div>
          </header>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              {/* ── Centre ── */}
              <div className="flex-1 p-5 min-w-0 overflow-y-auto">
                {/* Hero */}
                <div
                  className="fade-up rounded-2xl p-5 mb-5 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #0C1F35 0%, #1E3A5F 50%, #2563EB 100%)",
                    minHeight: "120px",
                  }}
                >
                  {/* Cercles décoratifs */}
                  <div
                    className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-10"
                    style={{
                      background:
                        "radial-gradient(circle, #60A5FA, transparent)",
                    }}
                  />
                  <div
                    className="absolute right-20 bottom-0 w-24 h-24 rounded-full opacity-5"
                    style={{
                      background:
                        "radial-gradient(circle, #A78BFA, transparent)",
                    }}
                  />

                  <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div
                        className="text-xs font-semibold uppercase tracking-widest mb-1"
                        style={{ color: "rgba(255,255,255,.45)" }}
                      >
                        Bienvenue
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="flex items-center gap-2">
                        <IconShieldCheck
                          size={13}
                          style={{ color: "#34D399" }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,.5)" }}
                        >
                          CNI validée · Bailleur certifié
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {loading
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="rounded-xl px-4 py-3 w-24"
                                style={{ background: "rgba(255,255,255,.08)" }}
                              >
                                <Skeleton className="h-6 mb-1" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                            ))
                        : [
                            {
                              val: stats?.total_biens ?? 0,
                              lbl: "Logements",
                              suf: "",
                              alert: false,
                            },
                            {
                              val: stats?.taux_occupation ?? 0,
                              lbl: "Occupation",
                              suf: "%",
                              alert: false,
                            },
                            {
                              val: stats?.impayes ?? 0,
                              lbl: "Impayés",
                              suf: "",
                              alert: true,
                            },
                          ].map((s) => (
                            <div
                              key={s.lbl}
                              className="rounded-xl px-4 py-3 text-center"
                              style={{
                                background:
                                  s.alert && s.val > 0
                                    ? "rgba(220,38,38,.2)"
                                    : "rgba(255,255,255,.1)",
                                border: `1px solid ${s.alert && s.val > 0 ? "rgba(220,38,38,.4)" : "rgba(255,255,255,.12)"}`,
                              }}
                            >
                              <div className="text-xl font-bold text-white">
                                <AnimatedNumber value={s.val} />
                                {s.suf}
                              </div>
                              <div
                                className="text-xs mt-0.5"
                                style={{ color: "rgba(255,255,255,.5)" }}
                              >
                                {s.lbl}
                              </div>
                              {s.alert && s.val > 0 && (
                                <div className="flex items-center justify-center gap-1 mt-0.5">
                                  <IconAlertTriangle
                                    size={10}
                                    style={{ color: "#FCA5A5" }}
                                  />
                                  <span
                                    className="text-xs"
                                    style={{ color: "#FCA5A5" }}
                                  >
                                    Action requise
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                    </div>
                  </div>
                </div>

                {/* KPIs */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3 fade-up-1"
                  style={{ color: "#94A3B8" }}
                >
                  Indicateurs clés
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {kpis.map((k, i) => (
                    <div
                      key={k.label}
                      className={`kpi-card bg-white rounded-2xl p-4 fade-up-${i + 2}`}
                      style={{
                        border: `1px solid ${k.border}`,
                        boxShadow: `0 1px 3px rgba(0,0,0,.04)`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#94A3B8" }}
                        >
                          {k.label}
                        </div>
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: k.bg }}
                        >
                          <span style={{ color: k.color }}>{k.icon}</span>
                        </div>
                      </div>
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{
                          color:
                            k.alert && (stats?.impayes ?? 0) > 0
                              ? k.color
                              : "#0F172A",
                        }}
                      >
                        {loading ? (
                          <Skeleton className="h-8 w-16" />
                        ) : (
                          <>
                            {k.suffix === " XAF" ? (
                              <>
                                {(stats?.revenus_mois ?? 0).toLocaleString(
                                  "fr-FR",
                                )}
                                <span
                                  className="text-sm font-medium ml-1"
                                  style={{ color: "#94A3B8" }}
                                >
                                  XAF
                                </span>
                              </>
                            ) : k.suffix === "%" ? (
                              <>
                                <AnimatedNumber value={k.value} />
                                <span className="text-lg">%</span>
                              </>
                            ) : (
                              <AnimatedNumber value={k.value} />
                            )}
                          </>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: k.color }}>
                        <IconTrendingUp size={11} className="inline mr-1" />
                        {k.sub}
                      </div>
                      {k.progress !== null && k.progress !== undefined && (
                        <div
                          className="mt-3 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "#E2E8F0" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${k.progress}%`,
                              background: k.color,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Suivi du parc */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-3 fade-up-3"
                  style={{ color: "#94A3B8" }}
                >
                  Suivi du parc
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 fade-up-4">
                  {suiviParc.map((s) => (
                    <div
                      key={s.label}
                      className="kpi-card bg-white rounded-2xl p-4"
                      style={{ border: "1px solid #E2E8F0" }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#94A3B8" }}
                        >
                          {s.label}
                        </div>
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: s.bg }}
                        >
                          <span style={{ color: s.color }}>{s.icon}</span>
                        </div>
                      </div>
                      {loading ? (
                        <Skeleton className="h-8 w-12 mb-1" />
                      ) : (
                        <div
                          className="text-2xl font-bold"
                          style={{ color: s.color }}
                        >
                          <AnimatedNumber value={s.value} />
                        </div>
                      )}
                      <div
                        className="text-xs mt-1"
                        style={{ color: "#94A3B8" }}
                      >
                        {s.sub}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paiements récents */}
                <div className="flex items-center justify-between mb-3 fade-up-5">
                  <div
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#94A3B8" }}
                  >
                    Paiements récents
                  </div>
                  <Link
                    href="#"
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#2563EB" }}
                  >
                    Voir l&apos;historique <IconChevronRight size={12} />
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
                    style={{
                      background: "#F8FAFC",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    {["Locataire", "Période", "Moyen", "Montant", "Statut"].map(
                      (h) => (
                        <div
                          key={h}
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#94A3B8" }}
                        >
                          {h}
                        </div>
                      ),
                    )}
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
                      <div
                        className="text-sm font-medium"
                        style={{ color: "#64748B" }}
                      >
                        Aucun paiement
                      </div>
                      <div
                        className="text-xs mt-1"
                        style={{ color: "#94A3B8" }}
                      >
                        Les paiements apparaîtront ici une fois les contrats
                        créés
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
                      const statut = isConfirme
                        ? "Confirmé"
                        : isRetard
                          ? "En retard"
                          : "En attente";
                      return (
                        <div
                          key={p.id}
                          className="row-hover grid grid-cols-5 px-5 py-3.5 items-center cursor-pointer"
                          style={{ borderBottom: "1px solid #F8FAFC" }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, #2563EB, #7C3AED)",
                              }}
                            >
                              {av}
                            </div>
                            <div className="hidden sm:block">
                              <div
                                className="text-sm font-semibold"
                                style={{ color: "#0F172A" }}
                              >
                                {loc?.nom_complet ?? "Locataire"}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "#94A3B8" }}
                              >
                                {p.contrat?.bien?.titre ?? "Bien"}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm" style={{ color: "#64748B" }}>
                            {String(p.mois).padStart(2, "0")}/{p.annee}
                          </div>
                          <div>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                background: "#FFFBEB",
                                color: "#D97706",
                              }}
                            >
                              {p.moyen_display ?? p.moyen_paiement}
                            </span>
                          </div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: col }}
                          >
                            {p.montant_total.toLocaleString("fr-FR")} XAF
                          </div>
                          <div>
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                              style={{ background: bg, color: col }}
                            >
                              {isConfirme && <IconCheck size={10} />}
                              {isRetard && <IconAlertTriangle size={10} />}
                              {!isConfirme && !isRetard && (
                                <IconClock size={10} />
                              )}
                              {statut}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* ── Panneau droit ── */}
              <div
                className="hidden xl:flex w-72 flex-shrink-0 flex-col overflow-y-auto"
                style={{ background: "#fff", borderLeft: "1px solid #E2E8F0" }}
              >
                {/* Aperçu financier */}
                <div
                  className="p-5"
                  style={{
                    background: "linear-gradient(160deg, #0C1F35, #1E3A5F)",
                    borderBottom: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "rgba(255,255,255,.35)" }}
                    >
                      Aperçu financier
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-lg font-medium"
                      style={{
                        background: "rgba(255,255,255,.08)",
                        color: "rgba(255,255,255,.5)",
                      }}
                    >
                      Ce mois
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {[
                      {
                        lbl: "Encaissé",
                        val: stats?.revenus_encaisses ?? 0,
                        col: "#34D399",
                      },
                      {
                        lbl: "Impayés",
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
                          <div
                            className="font-bold text-sm"
                            style={{ color: r.col }}
                          >
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
                      Revenu net mensuel
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-24" />
                    ) : (
                      <div className="font-bold text-white text-xl">
                        {(stats?.revenus_mois ?? 0).toLocaleString("fr-FR")}
                        <span className="text-xs font-normal ml-1 opacity-50">
                          XAF
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Mini chart */}
                  <div
                    className="flex items-end gap-1"
                    style={{ height: "40px" }}
                  >
                    {[35, 50, 42, 65, 52, 70, 55, 90].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all duration-500"
                        style={{
                          height: `${h}%`,
                          background:
                            i === 7 ? "#3B82F6" : "rgba(255,255,255,.12)",
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
                    Activités récentes
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
                  ) : notifications.length === 0 ? (
                    <div className="py-8 text-center">
                      <IconBell
                        size={28}
                        style={{ color: "#CBD5E1", margin: "0 auto 8px" }}
                      />
                      <div className="text-xs" style={{ color: "#94A3B8" }}>
                        Aucune activité récente
                      </div>
                    </div>
                  ) : (
                    notifications.map((n, i) => {
                      const icons: Record<
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
                      };
                      const style = icons[n.type] ?? {
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
                            style={{ background: style.bg }}
                          >
                            <span style={{ color: style.col }}>
                              {style.ico}
                            </span>
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
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: "#CBD5E1" }}
                            >
                              {new Date(n.date_creation).toLocaleDateString(
                                "fr-FR",
                                { day: "numeric", month: "short" },
                              )}
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

                {/* Upload CNI */}
                {user.cni_statut !== "valide" && (
                  <div
                    className="p-4 mt-2"
                    style={{ borderTop: "1px solid #F1F5F9" }}
                  >
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-3"
                      style={{ color: "#94A3B8" }}
                    >
                      Vérification CNI
                    </div>

                    {user.cni_statut === "en_attente" ? (
                      <div
                        className="flex items-center gap-2.5 p-3 rounded-xl"
                        style={{
                          background: "#FFFBEB",
                          border: "1px solid #FDE68A",
                        }}
                      >
                        <IconAlertCircle
                          size={16}
                          style={{ color: "#D97706", flexShrink: 0 }}
                        />
                        <div>
                          <div
                            className="text-xs font-bold"
                            style={{ color: "#92400E" }}
                          >
                            CNI en cours de vérification
                          </div>
                          <div className="text-xs" style={{ color: "#B45309" }}>
                            L&apos;admin validera votre CNI sous 24h
                          </div>
                        </div>
                      </div>
                    ) : (
                      <UploadFichier
                        typeDocument="cni"
                        label="Photo CNI"
                        description="JPG, PNG ou PDF · Max 5 MB"
                        onSuccess={() => {
                          // Mettre à jour le statut CNI
                          chargerDonnees();
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
