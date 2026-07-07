"use client";

import Link from "next/link";
import { useT } from "@/hooks/useT";
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
  IconX,
  IconChartBar,
  IconAlertCircle,
  IconUser,
  IconCrown,
} from "@tabler/icons-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeNav: string;
  onNavChange: (label: string) => void;
  initiales: string;
  nomComplet: string;
  onDeconnexion: () => void;
}

export function BailleurSidebar({
  isOpen,
  onClose,
  activeNav,
  onNavChange,
  initiales,
  nomComplet,
  onDeconnexion,
}: Props) {
  const t = useT();

  const navGroups = [
    {
      label: t("nav.principal"),
      items: [
        { icon: <IconLayoutDashboard size={16} />, label: t("nav.dashboard") },
        {
          icon: <IconBuilding size={16} />,
          label: t("nav.structures"),
          href: "/bailleur/structures",
        },
        {
          icon: <IconHome2 size={15} />,
          label: t("nav.biens"),
          href: "/bailleur/biens",
        },
        {
          icon: <IconUsers size={16} />,
          label: t("nav.locataires"),
          href: "/bailleur/locataires",
        },
      ],
    },
    {
      label: "Finances",
      items: [
        {
          icon: <IconCreditCard size={16} />,
          label: t("nav.paiements"),
          href: "/bailleur/paiements",
        },
        {
          icon: <IconFileText size={16} />,
          label: t("nav.contrats"),
          href: "/bailleur/contrats",
        },
        {
          icon: <IconAlertCircle size={16} />,
          label: t("nav.impayes"),
          href: "/bailleur/impayes",
        },
        {
          icon: <IconChartBar size={16} />,
          label: t("nav.analytique"),
          href: "/bailleur/analytique",
        },
        {
          icon: <IconDroplet size={16} />,
          label: t("nav.releves"),
          href: "/bailleur/releves",
        },
      ],
    },
    {
      label: t("nav.communication"),
      items: [
        {
          icon: <IconMessage size={16} />,
          label: t("nav.messages"),
          href: "/bailleur/messages",
          badge: 0,
          badgeColor: "#3B82F6",
        },
        {
          icon: <IconTool size={16} />,
          label: t("nav.signalements"),
          href: "/bailleur/signalements",
          badge: 0,
          badgeColor: "#EF4444",
        },
      ],
    },
    {
      label: t("compte.titre"),
      items: [
        {
          icon: <IconCrown size={16} />,
          label: t("nav.abonnement"),
          href: "/bailleur/abonnement",
        },
        {
          icon: <IconSettings size={16} />,
          label: t("nav.parametres"),
          href: "/bailleur/parametres",
        },
        {
          icon: <IconUser size={16} />,
          label: t("nav.compte"),
          href: "/bailleur/compte",
        },
      ],
    },
  ];

  return (
    <aside
      className={`sidebar-mobile lg:relative lg:translate-x-0 w-60 flex-shrink-0 flex flex-col h-full ${isOpen ? "open" : ""}`}
      style={{
        background: "linear-gradient(180deg,#0C1F35 0%,#0F2438 100%)",
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
            {t("dashboard.espace_bailleur")}
          </div>
        </div>
        <button
          className="ml-auto lg:hidden"
          onClick={onClose}
          style={{
            color: "rgba(255,255,255,.4)",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
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
              style={{ color: "rgba(255,255,255,.22)", letterSpacing: ".1em" }}
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
                  <span className="flex-1 text-sm">{item.label}</span>
                  {"badge" in item &&
                    typeof item.badge === "number" &&
                    item.badge > 0 && (
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
              const cls =
                "nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left";
              const st = isActive
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
                  onClick={() => onNavChange(item.label)}
                  className={cls}
                  style={{ ...st, textDecoration: "none" }}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => {
                    onNavChange(item.label);
                    onClose();
                  }}
                  className={cls}
                  style={st}
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
            style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}
          >
            {initiales}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-semibold truncate">
              {nomComplet}
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
                {t("common.en_ligne")}
              </span>
            </div>
          </div>
          <button
            onClick={onDeconnexion}
            title={t("compte.deconnexion")}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              color: "rgba(255,255,255,.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <IconLogout size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
