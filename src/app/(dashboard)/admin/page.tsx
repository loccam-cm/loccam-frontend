"use client";

import Link from 'next/link'
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Utilisateur, PaginatedResponse } from "@/types";
import {
  IconLayoutDashboard,
  IconUsers,
  IconHome2,
  IconShieldCheck,
  IconFileText,
  IconTool,
  IconChartBar,
  IconSettings,
  IconLogout,
  IconDownload,
  IconRefresh,
  IconBuilding,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconMenu2,
  IconBell,
  IconSearch,
  IconTrendingUp,
  IconTrendingDown,
  IconEye,
  IconBan,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconFilter,
} from "@tabler/icons-react";

// ── Types ────────────────────────────────────────────────────
interface PlatformStats {
  total_bailleurs: number;
  total_locataires: number;
  total_biens: number;
  biens_occupes: number;
  paiements_mois: number;
  transactions: number;
  signalements_urgents: number;
  cni_en_attente: number;
  taux_occupation: number;
  taux_paiements: number;
}

interface LogEntry {
  time: string;
  desc: string;
  tag: string;
  tagCol: string;
  tagBg: string;
}

interface CNICandidat {
  av: string;
  bg: string;
  col: string;
  name: string;
  sub: string;
  id?: number;
}

// ── Animations ───────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: 'easeOut' as const }
  }),
}



const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.35 },
  }),
};

// ── Squelette ────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{
        background:
          "linear-gradient(90deg,#E8EEF4 25%,#F1F5F9 50%,#E8EEF4 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

// ── Nombre animé ─────────────────────────────────────────────
function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const t0 = Date.now();
    const run = () => {
      const p = Math.min((Date.now() - t0) / 800, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) raf.current = requestAnimationFrame(run);
    };
    raf.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return (
    <>
      {display.toLocaleString("fr-FR")}
      {suffix}
    </>
  );
}

// ── Mini bar chart ────────────────────────────────────────────
function MiniBarChart({
  data,
  activeColor,
}: {
  data: { h: number; lbl: string; active?: boolean }[];
  activeColor: string;
}) {
  return (
    <div className="flex items-end gap-1" style={{ height: "56px" }}>
      {data.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            className="w-full rounded-t"
            initial={{ height: 0 }}
            animate={{ height: `${b.h}%` }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
            style={{
              background: b.active ? activeColor : "#E2E8F0",
              minHeight: 2,
            }}
          />
          <div
            className="text-center"
            style={{
              color: b.active ? activeColor : "#94A3B8",
              fontSize: "9px",
              fontWeight: b.active ? 700 : 400,
            }}
          >
            {b.lbl}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Barre de progression ─────────────────────────────────────
function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "#E2E8F0" }}
    >
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        style={{ background: color }}
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DASHBOARD ADMIN
// ════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user, deconnexion } = useAuth();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebar] = useState(false);
  const [activeNav, setActiveNav] = useState("Vue d'ensemble");
  const [searchOpen, setSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [notifOpen, setNotif] = useState(false);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (user) load();
  }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const usersRes = await api.get<PaginatedResponse<Utilisateur>>("/users/");
      const allUsers = usersRes.data.results ?? [];
      setUsers(allUsers);

      const bailleurs = allUsers.filter((u) => u.role === "bailleur").length;
      const locataires = allUsers.filter((u) => u.role === "locataire").length;
      const cniPending = allUsers.filter(
        (u) => u.cni_statut === "en_attente",
      ).length;

      setStats({
        total_bailleurs: bailleurs,
        total_locataires: locataires,
        total_biens: 0,
        biens_occupes: 0,
        paiements_mois: 0,
        transactions: 0,
        signalements_urgents: 0,
        cni_en_attente: cniPending,
        taux_occupation: 0,
        taux_paiements: 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  const ini = `${user.prenom?.[0] ?? ""}${user.nom?.[0] ?? ""}`;

  // Données statiques enrichies (à connecter en phase E)
  const kpis = [
    {
      label: "Utilisateurs",
      val: stats ? stats.total_bailleurs + stats.total_locataires : 0,
      sub: `${stats?.total_bailleurs ?? 0} bailleurs · ${stats?.total_locataires ?? 0} locataires`,
      icon: <IconUsers size={20} />,
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      trend: +5,
      trendLabel: "ce mois",
    },
    {
      label: "Biens actifs",
      val: 4,
      sub: "3 occupés · 1 libre",
      icon: <IconHome2 size={20} />,
      color: "#059669",
      bg: "#ECFDF5",
      border: "#A7F3D0",
      trend: +2,
      trendLabel: "nouveaux",
    },
    {
      label: "Paiements du mois",
      val: 212925,
      sub: "XAF · 3 transactions",
      icon: <IconChartBar size={20} />,
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#FDE68A",
      trend: +8.2,
      trendLabel: "vs mois dernier",
      suffix: " XAF",
    },
    {
      label: "Signalements",
      val: 0,
      sub: "Aucun urgent",
      icon: <IconAlertCircle size={20} />,
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#FECACA",
      trend: 0,
      trendLabel: "en cours",
    },
  ];

  const recentUsers: CNICandidat[] = users.slice(0, 5).map(
    (u) =>
      ({
        av: `${u.prenom?.[0] ?? "?"}${u.nom?.[0] ?? ""}`,
        bg: u.role === "bailleur" ? "#EFF6FF" : "#ECFDF5",
        col: u.role === "bailleur" ? "#2563EB" : "#059669",
        name: u.nom_complet,
        sub: u.email,
        role: u.role,
        cni: u.cni_statut,
        actif: u.est_actif,
        id: u.id,
      }) as CNICandidat & { role: string; cni: string; actif: boolean },
  );

  const cniCandidats: CNICandidat[] = users
    .filter((u) => u.cni_statut === "en_attente")
    .slice(0, 4)
    .map((u) => ({
      av: `${u.prenom?.[0] ?? "?"}${u.nom?.[0] ?? ""}`,
      bg: "#FFFBEB",
      col: "#D97706",
      name: u.nom_complet,
      sub: `Soumise · ${u.role}`,
      id: u.id,
    }));

  const logs: LogEntry[] = [
    {
      time: "10:42",
      desc: "Paiement confirmé — 92 925 XAF · Jean Mbida · TXN-001",
      tag: "PAY",
      tagCol: "#059669",
      tagBg: "#ECFDF5",
    },
    {
      time: "10:15",
      desc: "CNI validée — Kenmatio V. · Admin",
      tag: "AUTH",
      tagCol: "#2563EB",
      tagBg: "#EFF6FF",
    },
    {
      time: "09:33",
      desc: "Contrat signé — Studio 101 · Bailleur + Locataire",
      tag: "DOC",
      tagCol: "#7C3AED",
      tagBg: "#F5F3FF",
    },
    {
      time: "09:08",
      desc: "Bien modéré — Annonce retirée · Admin",
      tag: "MOD",
      tagCol: "#D97706",
      tagBg: "#FFFBEB",
    },
    {
      time: "08:47",
      desc: "Compte suspendu — Utilisateur #23 · 30 jours",
      tag: "SEC",
      tagCol: "#DC2626",
      tagBg: "#FEF2F2",
    },
    {
      time: "08:22",
      desc: "Paiement cash — Ngo S. · 120 000 XAF",
      tag: "PAY",
      tagCol: "#059669",
      tagBg: "#ECFDF5",
    },
    {
      time: "07:55",
      desc: "Signalement ouvert — Studio 101 · Panne électrique",
      tag: "TECH",
      tagCol: "#64748B",
      tagBg: "#F1F5F9",
    },
  ];

  const signalements = [
    {
      ico: <IconAlertTriangle size={15} />,
      icoBg: "#FEF2F2",
      icoCol: "#DC2626",
      title: "Annonce frauduleuse signalée",
      sub: "Bien #284 · 2 utilisateurs · Il y a 1h",
      urgent: true,
    },
    {
      ico: <IconAlertCircle size={15} />,
      icoBg: "#FFFBEB",
      icoCol: "#D97706",
      title: "Compte bailleur suspect",
      sub: "Utilisateur #17 · Activité inhabituelle · Il y a 3h",
      urgent: false,
    },
    {
      ico: <IconFileText size={15} />,
      icoBg: "#F1F5F9",
      icoCol: "#64748B",
      title: "Message inapproprié signalé",
      sub: "Conversation bien #112 · Il y a 6h",
      urgent: false,
    },
  ];

  const chartData = [
    { h: 35, lbl: "Sep" },
    { h: 50, lbl: "Oct" },
    { h: 45, lbl: "Nov" },
    { h: 62, lbl: "Déc" },
    { h: 90, lbl: "Jan", active: true },
  ];

  const navGroups = [
    {
      label: "Supervision",
      items: [
        { icon: <IconLayoutDashboard size={15} />, label: "Vue d'ensemble" },
      ],
    },
    {
      label: "Utilisateurs",
      items: [
        { icon: <IconUsers size={15} />, label: "Bailleurs" },
        { icon: <IconUsers size={15} />, label: "Locataires" },
        {
          icon: <IconShieldCheck size={15} />,
          label: "Validation CNI",
          href: "/admin/validation-cni",
          badge: stats?.cni_en_attente ?? 0,
          badgeColor: "#D97706",
        },
      ],
    },
    {
      label: "Contenu",
      items: [
        { icon: <IconHome2 size={15} />, label: "Biens publiés" },
        {
          icon: <IconTool size={15} />,
          label: "Signalements",
          href: "/admin/signalements",
          badge: signalements.filter((s) => s.urgent).length,
          badgeColor: "#DC2626",
        },
      ],
    },
    {
      label: "Système",
      items: [
        { icon: <IconChartBar size={15} />, label: "KPIs & Revenus" },
        { icon: <IconFileText size={15} />, label: "Logs système" },
        { icon: <IconSettings size={15} />, label: "Paramètres" },
      ],
    },
  ];

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .pulse{animation:pulse 2.5s ease-in-out infinite}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px}
        *{scrollbar-width:thin;scrollbar-color:#CBD5E1 transparent}
        .nav-item{transition:all .15s ease}
        .nav-item:hover{background:rgba(37,99,235,.06)}
        .row-hover{transition:background .12s}
        .row-hover:hover{background:#F8FAFC}
        .kpi-card{transition:transform .2s ease,box-shadow .2s ease}
        .kpi-card:hover{transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.08)}
        .action-btn{transition:all .15s ease}
        .action-btn:hover{transform:translateY(-1px)}
        @media(max-width:1024px){
          .sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:40}
          .sidebar-mobile{position:fixed;left:0;top:0;bottom:0;z-index:50;transform:translateX(-100%);transition:transform .3s ease}
          .sidebar-mobile.open{transform:translateX(0)}
        }
      `}</style>

      <div
        className="flex h-screen overflow-hidden"
        style={{
          background: "#F1F5F9",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setSidebar(false)}
          />
        )}

        {/* ══ SIDEBAR ══════════════════════════════════════════ */}
        <aside
          className={`sidebar-mobile lg:relative lg:translate-x-0 w-60 flex-shrink-0 flex flex-col h-full ${sidebarOpen ? "open" : ""}`}
          style={{
            background: "linear-gradient(180deg,#0F172A 0%,#1E293B 100%)",
            boxShadow: "4px 0 24px rgba(0,0,0,.2)",
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
                background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
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
                Administration
              </div>
            </div>
            <button
              className="ml-auto lg:hidden"
              onClick={() => setSidebar(false)}
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
                    color: "rgba(255,255,255,.2)",
                    letterSpacing: ".1em",
                  }}
                >
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const active = activeNav === item.label;
                  const cls = `nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm text-left`;
                  const style = active
                    ? {
                        background: "rgba(37,99,235,.25)",
                        color: "#93C5FD",
                        fontWeight: 600,
                      }
                    : { color: "rgba(255,255,255,.5)" };

                  const content = (
                    <>
                      <span
                        style={{
                          color: active ? "#60A5FA" : "rgba(255,255,255,.35)",
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

                  return "href" in item && item.href ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => {
                        setActiveNav(item.label);
                        setSidebar(false);
                      }}
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
                        setSidebar(false);
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
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.07)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                }}
              >
                {ini}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-semibold truncate">
                  {user.nom_complet}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full pulse"
                    style={{ background: "#10B981" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,.35)" }}
                  >
                    Administrateur
                  </span>
                </div>
              </div>
              <button
                onClick={deconnexion}
                style={{ color: "rgba(255,255,255,.3)" }}
                title="Déconnexion"
              >
                <IconLogout size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* ══ MAIN ═════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Topbar */}
          <header
            className="flex items-center gap-3 px-5 h-14 flex-shrink-0"
            style={{
              background: "#fff",
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 3px rgba(0,0,0,.04)",
            }}
          >
            <button
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "#F1F5F9" }}
              onClick={() => setSidebar(true)}
            >
              <IconMenu2 size={17} style={{ color: "#64748B" }} />
            </button>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Vue d&apos;ensemble
              </h1>
              <p
                className="text-xs capitalize hidden sm:block truncate"
                style={{ color: "#94A3B8" }}
              >
                {today}
              </p>
            </div>

            {/* Barre de recherche */}
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    autoFocus
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full h-9 px-3 rounded-lg text-xs outline-none"
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #E2E8F0",
                      color: "#0F172A",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSearch(!searchOpen);
                  setSearchVal("");
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: searchOpen ? "#EFF6FF" : "#F1F5F9",
                  border: "1px solid #E2E8F0",
                }}
              >
                <IconSearch
                  size={15}
                  style={{ color: searchOpen ? "#2563EB" : "#64748B" }}
                />
              </button>

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

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotif(!notifOpen)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center relative"
                  style={{
                    background: notifOpen ? "#EFF6FF" : "#F1F5F9",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <IconBell
                    size={15}
                    style={{ color: notifOpen ? "#2563EB" : "#64748B" }}
                  />
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white flex items-center justify-center font-bold pulse"
                    style={{ background: "#EF4444", fontSize: "9px" }}
                  >
                    3
                  </span>
                </button>
                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-11 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      style={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: "1px solid #F8FAFC" }}
                      >
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#0F172A" }}
                        >
                          Alertes admin
                        </span>
                        <button onClick={() => setNotif(false)}>
                          <IconX size={13} style={{ color: "#94A3B8" }} />
                        </button>
                      </div>
                      {[
                        {
                          ico: <IconShieldCheck size={13} />,
                          bg: "#FFFBEB",
                          col: "#D97706",
                          t: `${stats?.cni_en_attente ?? 0} CNI en attente de validation`,
                        },
                        {
                          ico: <IconAlertTriangle size={13} />,
                          bg: "#FEF2F2",
                          col: "#DC2626",
                          t: "Annonce frauduleuse signalée",
                        },
                        {
                          ico: <IconUsers size={13} />,
                          bg: "#EFF6FF",
                          col: "#2563EB",
                          t: "Nouveaux utilisateurs inscrits",
                        },
                      ].map((n, i) => (
                        <div
                          key={i}
                          className="flex gap-3 px-4 py-3 row-hover cursor-pointer"
                          style={{ borderBottom: "1px solid #F8FAFC" }}
                        >
                          <div
                            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: n.bg }}
                          >
                            <span style={{ color: n.col }}>{n.ico}</span>
                          </div>
                          <div className="text-xs" style={{ color: "#0F172A" }}>
                            {n.t}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-medium"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid #E2E8F0",
                  color: "#475569",
                }}
              >
                <IconDownload size={13} />
                Exporter CSV
              </button>

              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                }}
              >
                {ini}
              </div>
            </div>
          </header>

          {/* Contenu */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex h-full">
              {/* ── Colonne centrale ── */}
              <div className="flex-1 p-4 sm:p-5 overflow-y-auto min-w-0">
                {/* Salutation */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  className="mb-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#2563EB,#7C3AED)",
                        boxShadow: "0 4px 12px rgba(37,99,235,.3)",
                      }}
                    >
                      <IconShieldCheck size={20} color="white" />
                    </div>
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        Bonjour, {user.prenom}
                      </h2>
                      <p className="text-xs" style={{ color: "#64748B" }}>
                        Supervision de la plateforme LocCam
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {kpis.map((k, i) => (
                    <motion.div
                      key={k.label}
                      variants={scaleIn}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      className="kpi-card bg-white rounded-2xl p-4 relative overflow-hidden"
                      style={{
                        border: `1px solid ${k.border}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
                      }}
                    >
                      {/* Barre couleur top */}
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                        style={{ background: k.color }}
                      />
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
                        style={{ color: "#0F172A" }}
                      >
                        {loading ? (
                          <Skeleton className="h-7 w-16" />
                        ) : k.suffix === " XAF" ? (
                          <>
                            <AnimatedNumber value={k.val} />
                            <span
                              className="text-sm font-medium ml-1"
                              style={{ color: "#94A3B8" }}
                            >
                              XAF
                            </span>
                          </>
                        ) : (
                          <AnimatedNumber value={k.val} />
                        )}
                      </div>
                      <div
                        className="text-xs mb-2"
                        style={{ color: "#94A3B8" }}
                      >
                        {k.sub}
                      </div>
                      <div className="flex items-center gap-1">
                        {k.trend > 0 ? (
                          <IconTrendingUp
                            size={11}
                            style={{ color: "#059669" }}
                          />
                        ) : k.trend < 0 ? (
                          <IconTrendingDown
                            size={11}
                            style={{ color: "#DC2626" }}
                          />
                        ) : null}
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              k.trend > 0
                                ? "#059669"
                                : k.trend < 0
                                  ? "#DC2626"
                                  : "#94A3B8",
                          }}
                        >
                          {k.trend > 0 ? `+${k.trend}` : k.trend} {k.trendLabel}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Gestion utilisateurs */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="flex items-center justify-between mb-3"
                >
                  <div
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "#94A3B8" }}
                  >
                    Gestion des utilisateurs
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#2563EB" }}
                  >
                    Voir tout <IconEye size={12} />
                  </button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
                  {/* Utilisateurs récents */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex items-center justify-between px-5 py-3.5"
                      style={{
                        borderBottom: "1px solid #F1F5F9",
                        background: "#FAFAFA",
                      }}
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        Utilisateurs récents
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                      >
                        {loading
                          ? "—"
                          : `${(stats?.total_bailleurs ?? 0) + (stats?.total_locataires ?? 0)} total`}
                      </span>
                    </div>

                    {/* Table header — visible md+ */}
                    <div
                      className="hidden md:grid px-5 py-2.5"
                      style={{
                        gridTemplateColumns: "2fr 1fr 1fr 1fr",
                        background: "#F8FAFC",
                        borderBottom: "1px solid #F1F5F9",
                      }}
                    >
                      {["Utilisateur", "Rôle", "CNI", "Statut"].map((h) => (
                        <div
                          key={h}
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color: "#94A3B8" }}
                        >
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    {loading ? (
                      Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 px-5 py-3.5"
                            style={{ borderBottom: "1px solid #F8FAFC" }}
                          >
                            <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                        ))
                    ) : recentUsers.length === 0 ? (
                      <div className="py-10 text-center">
                        <IconUsers
                          size={28}
                          style={{ color: "#CBD5E1", margin: "0 auto 8px" }}
                        />
                        <p className="text-sm" style={{ color: "#64748B" }}>
                          Aucun utilisateur
                        </p>
                      </div>
                    ) : (
                      recentUsers.map(
                        (
                          u: CNICandidat & {
                            role?: string;
                            cni?: string;
                            actif?: boolean;
                          },
                          i,
                        ) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="row-hover cursor-pointer px-5 py-3.5"
                            style={{ borderBottom: "1px solid #F8FAFC" }}
                          >
                            {/* Mobile — layout vertical */}
                            <div className="flex items-center justify-between md:hidden">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                  style={{ background: u.bg, color: u.col }}
                                >
                                  {u.av}
                                </div>
                                <div>
                                  <div
                                    className="text-sm font-semibold"
                                    style={{ color: "#0F172A" }}
                                  >
                                    {u.name}
                                  </div>
                                  <div
                                    className="text-xs"
                                    style={{ color: "#94A3B8" }}
                                  >
                                    {u.sub}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                  style={{
                                    background:
                                      u.role === "bailleur"
                                        ? "#EFF6FF"
                                        : "#ECFDF5",
                                    color:
                                      u.role === "bailleur"
                                        ? "#2563EB"
                                        : "#059669",
                                  }}
                                >
                                  {u.role === "bailleur"
                                    ? "Bailleur"
                                    : "Locataire"}
                                </span>
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    background: u.actif ? "#10B981" : "#DC2626",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Desktop — grille 4 colonnes */}
                            <div
                              className="hidden md:grid items-center gap-4"
                              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr" }}
                            >
                              {/* Colonne 1 — Avatar + nom */}
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                                  style={{ background: u.bg, color: u.col }}
                                >
                                  {u.av}
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className="text-sm font-semibold truncate"
                                    style={{ color: "#0F172A" }}
                                  >
                                    {u.name}
                                  </div>
                                  <div
                                    className="text-xs truncate"
                                    style={{ color: "#94A3B8" }}
                                  >
                                    {u.sub}
                                  </div>
                                </div>
                              </div>

                              {/* Colonne 2 — Rôle */}
                              <div>
                                <span
                                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                  style={{
                                    background:
                                      u.role === "bailleur"
                                        ? "#EFF6FF"
                                        : "#ECFDF5",
                                    color:
                                      u.role === "bailleur"
                                        ? "#2563EB"
                                        : "#059669",
                                  }}
                                >
                                  {u.role === "bailleur"
                                    ? "Bailleur"
                                    : "Locataire"}
                                </span>
                              </div>

                              {/* Colonne 3 — CNI */}
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{
                                    background:
                                      u.cni === "valide"
                                        ? "#10B981"
                                        : u.cni === "rejete"
                                          ? "#DC2626"
                                          : "#F59E0B",
                                  }}
                                />
                                <span
                                  className="text-xs font-medium"
                                  style={{
                                    color:
                                      u.cni === "valide"
                                        ? "#059669"
                                        : u.cni === "rejete"
                                          ? "#DC2626"
                                          : "#D97706",
                                  }}
                                >
                                  {u.cni === "valide"
                                    ? "Validée"
                                    : u.cni === "rejete"
                                      ? "Rejetée"
                                      : "En attente"}
                                </span>
                              </div>

                              {/* Colonne 4 — Statut */}
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                  style={{
                                    background: u.actif ? "#10B981" : "#DC2626",
                                  }}
                                />
                                <span
                                  className="text-xs font-medium"
                                  style={{
                                    color: u.actif ? "#059669" : "#DC2626",
                                  }}
                                >
                                  {u.actif ? "Actif" : "Inactif"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ),
                      )
                    )}
                  </motion.div>

                  {/* Validation CNI */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={4}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        background: "#FAFAFA",
                      }}
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        CNI en attente
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#FFFBEB", color: "#D97706" }}
                      >
                        {loading
                          ? "—"
                          : `${stats?.cni_en_attente ?? 0} en attente`}
                      </span>
                    </div>
                    {loading ? (
                      Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="flex gap-3 px-4 py-3"
                            style={{ borderBottom: "1px solid #F8FAFC" }}
                          >
                            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-1.5">
                              <Skeleton className="h-3 w-28" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="w-16 h-7 rounded-lg flex-shrink-0" />
                          </div>
                        ))
                    ) : cniCandidats.length === 0 ? (
                      <div className="py-8 text-center">
                        <IconCircleCheck
                          size={28}
                          style={{ color: "#A7F3D0", margin: "0 auto 8px" }}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#64748B" }}
                        >
                          Tout est validé
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#94A3B8" }}
                        >
                          Aucune CNI en attente
                        </p>
                      </div>
                    ) : (
                      cniCandidats.map((u, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-center gap-3 px-4 py-3 row-hover"
                          style={{ borderBottom: "1px solid #F8FAFC" }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                            style={{ background: u.bg, color: u.col }}
                          >
                            {u.av}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {u.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "#94A3B8" }}
                            >
                              {u.sub}
                            </div>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold"
                              style={{
                                background: "#ECFDF5",
                                color: "#059669",
                              }}
                            >
                              <IconCheck size={11} />
                              Valider
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                              style={{
                                background: "#FEF2F2",
                                color: "#DC2626",
                              }}
                            >
                              <IconX size={11} />
                              Rejeter
                            </motion.button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                </div>

                {/* Modération & Logs */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94A3B8" }}
                >
                  Modération & Logs
                </motion.div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Signalements */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={6}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        background: "#FAFAFA",
                      }}
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        Signalements à traiter
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: "#FFFBEB", color: "#D97706" }}
                      >
                        {signalements.length} ouverts
                      </span>
                    </div>
                    {signalements.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.07 }}
                        className="flex items-start gap-3 px-4 py-3.5"
                        style={{ borderBottom: "1px solid #F8FAFC" }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: s.icoBg }}
                        >
                          <span style={{ color: s.icoCol }}>{s.ico}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div
                              className="text-sm font-semibold"
                              style={{ color: "#0F172A" }}
                            >
                              {s.title}
                            </div>
                            {s.urgent && (
                              <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "#FEF2F2",
                                  color: "#DC2626",
                                  fontSize: "9px",
                                }}
                              >
                                URGENT
                              </span>
                            )}
                          </div>
                          <div className="text-xs" style={{ color: "#94A3B8" }}>
                            {s.sub}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg,#1E3A5F,#2563EB)",
                            }}
                          >
                            Traiter
                          </motion.button>
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={{ background: "#F1F5F9", color: "#64748B" }}
                          >
                            Ignorer
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Logs système */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    custom={7}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid #E2E8F0",
                      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                    }}
                  >
                    <div
                      className="flex items-center justify-between px-4 py-3"
                      style={{
                        borderBottom: "1px solid #F8FAFC",
                        background: "#FAFAFA",
                      }}
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ color: "#0F172A" }}
                      >
                        Logs — Actions sensibles
                      </div>
                      <button
                        className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: "#2563EB" }}
                      >
                        Voir tout <IconFilter size={11} />
                      </button>
                    </div>
                    {logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 px-4 py-2.5 row-hover cursor-pointer"
                        style={{ borderBottom: "1px solid #F8FAFC" }}
                      >
                        <div
                          className="text-xs font-mono flex-shrink-0 font-medium"
                          style={{ color: "#94A3B8", minWidth: "36px" }}
                        >
                          {log.time}
                        </div>
                        <div
                          className="flex-1 text-xs truncate"
                          style={{ color: "#0F172A" }}
                        >
                          {log.desc}
                        </div>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{
                            background: log.tagBg,
                            color: log.tagCol,
                            fontSize: "10px",
                          }}
                        >
                          {log.tag}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* ── Panneau droit ── */}
              <div
                className="hidden xl:flex w-72 flex-shrink-0 flex-col overflow-y-auto"
                style={{ background: "#fff", borderLeft: "1px solid #E2E8F0" }}
              >
                {/* KPIs plateforme */}
                <div
                  className="p-5"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "#94A3B8" }}
                    >
                      KPIs plateforme
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#F1F5F9", color: "#64748B" }}
                    >
                      {new Date().toLocaleDateString("fr-FR", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        lbl: "Bailleurs",
                        val: stats?.total_bailleurs ?? 0,
                        sub: "actifs",
                        col: "#2563EB",
                        bg: "#EFF6FF",
                      },
                      {
                        lbl: "Locataires",
                        val: stats?.total_locataires ?? 0,
                        sub: "actifs",
                        col: "#059669",
                        bg: "#ECFDF5",
                      },
                      {
                        lbl: "Biens actifs",
                        val: 4,
                        sub: "taux 75%",
                        col: "#D97706",
                        bg: "#FFFBEB",
                      },
                      {
                        lbl: "Transactions",
                        val: 3,
                        sub: "ce mois",
                        col: "#7C3AED",
                        bg: "#F5F3FF",
                      },
                    ].map((k) => (
                      <motion.div
                        key={k.lbl}
                        whileHover={{ scale: 1.02 }}
                        className="rounded-xl p-3 cursor-pointer"
                        style={{ background: k.bg }}
                      >
                        <div
                          className="text-xs font-bold uppercase mb-1"
                          style={{
                            color: k.col,
                            fontSize: "9px",
                            opacity: 0.7,
                          }}
                        >
                          {k.lbl}
                        </div>
                        <div
                          className="text-xl font-bold"
                          style={{ color: k.col }}
                        >
                          {loading ? (
                            <Skeleton className="h-5 w-8" />
                          ) : (
                            <AnimatedNumber value={k.val} />
                          )}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: k.col, opacity: 0.6 }}
                        >
                          {k.sub}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Revenus */}
                <div
                  className="p-5"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-4"
                    style={{ color: "#94A3B8" }}
                  >
                    Revenus mensuels
                  </div>
                  <MiniBarChart data={chartData} activeColor="#2563EB" />
                  <div className="mt-3">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "#0F172A" }}
                    >
                      {loading ? (
                        <Skeleton className="h-6 w-32" />
                      ) : (
                        <>
                          <AnimatedNumber value={212925} />{" "}
                          <span
                            className="text-sm font-normal"
                            style={{ color: "#94A3B8" }}
                          >
                            XAF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <IconTrendingUp size={13} style={{ color: "#059669" }} />
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "#059669" }}
                      >
                        +8.2% vs mois dernier
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats rapides */}
                <div
                  className="p-5"
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                >
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "#94A3B8" }}
                  >
                    Stats rapides
                  </div>
                  {[
                    { lbl: "Taux d'occupation", pct: 75, col: "#059669" },
                    { lbl: "Paiements confirmés", pct: 67, col: "#2563EB" },
                    {
                      lbl: "CNI validées",
                      pct:
                        stats && stats.total_bailleurs > 0
                          ? Math.max(
                              0,
                              Math.round(
                                ((stats.total_bailleurs -
                                  stats.cni_en_attente) /
                                  stats.total_bailleurs) *
                                  100,
                              ),
                            )
                          : 0,
                      col: "#D97706",
                    },
                  ].map((s) => (
                    <div key={s.lbl} className="mb-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: "#64748B" }}>{s.lbl}</span>
                        <span className="font-bold" style={{ color: s.col }}>
                          {s.pct}%
                        </span>
                      </div>
                      <ProgressBar pct={s.pct} color={s.col} />
                    </div>
                  ))}
                  <div
                    className="mt-1 pt-3"
                    style={{ borderTop: "1px solid #F1F5F9" }}
                  >
                    {[
                      {
                        lbl: "CNI en attente",
                        val: stats?.cni_en_attente ?? 0,
                        col: "#D97706",
                      },
                      { lbl: "Signalements urgents", val: 1, col: "#DC2626" },
                    ].map((s) => (
                      <div
                        key={s.lbl}
                        className="flex items-center justify-between py-2"
                        style={{ borderBottom: "1px solid #F8FAFC" }}
                      >
                        <span className="text-xs" style={{ color: "#64748B" }}>
                          {s.lbl}
                        </span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: s.col }}
                        >
                          {loading ? "—" : s.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="p-5">
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-3"
                    style={{ color: "#94A3B8" }}
                  >
                    Actions rapides
                  </div>
                  {[
                    {
                      lbl: "Valider les CNI",
                      badge: stats?.cni_en_attente ?? 0,
                      ico: <IconShieldCheck size={14} />,
                      primary: true,
                    },
                    {
                      lbl: "Traiter signalements",
                      badge: signalements.length,
                      ico: <IconTool size={14} />,
                      primary: false,
                    },
                    {
                      lbl: "Exporter rapport PDF",
                      badge: 0,
                      ico: <IconDownload size={14} />,
                      primary: false,
                    },
                    {
                      lbl: "Suspendre un compte",
                      badge: 0,
                      ico: <IconBan size={14} />,
                      primary: false,
                    },
                  ].map((a) => (
                    <motion.button
                      key={a.lbl}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      className="action-btn w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-2 text-xs font-semibold text-left"
                      style={
                        a.primary
                          ? {
                              background:
                                "linear-gradient(135deg,#1E3A5F,#2563EB)",
                              color: "#fff",
                              boxShadow: "0 2px 8px rgba(37,99,235,.25)",
                            }
                          : {
                              background: "#F8FAFC",
                              color: "#475569",
                              border: "1px solid #E2E8F0",
                            }
                      }
                    >
                      <span
                        style={{
                          color: a.primary ? "rgba(255,255,255,.8)" : "#94A3B8",
                        }}
                      >
                        {a.ico}
                      </span>
                      <span className="flex-1">{a.lbl}</span>
                      {a.badge > 0 && (
                        <span
                          className="font-bold px-1.5 py-0.5 rounded-full text-white"
                          style={{
                            background: a.primary
                              ? "rgba(255,255,255,.2)"
                              : "#EF4444",
                            fontSize: "10px",
                          }}
                        >
                          {loading ? "…" : a.badge}
                        </span>
                      )}
                      <IconClock
                        size={11}
                        style={{
                          color: a.primary ? "rgba(255,255,255,.4)" : "#CBD5E1",
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
