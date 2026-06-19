"use client";

import Link from "next/link";
import { useT } from "@/hooks/useT";
import NotificationBell from "@/components/NotificationBell";
import {
  IconMenu2,
  IconRefresh,
  IconDownload,
  IconPlus,
} from "@tabler/icons-react";

interface Props {
  onMenuOpen: () => void;
  loading: boolean;
  onRefresh: () => void;
  initiales: string;
}

export function BailleurTopbar({
  onMenuOpen,
  loading,
  onRefresh,
  initiales,
}: Props) {
  const t = useT();
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header
      className="flex items-center gap-3 px-4 sm:px-5 h-14 flex-shrink-0"
      style={{
        background: "#fff",
        borderBottom: "1px solid #E6EDF4",
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
      }}
    >
      <button
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: "#F1F5F9" }}
        onClick={onMenuOpen}
      >
        <IconMenu2 size={18} style={{ color: "#64748B" }} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold truncate" style={{ color: "#0F172A" }}>
          {t("dashboard.tableau_de_bord")}
        </h1>
        <div
          className="text-xs hidden sm:block capitalize"
          style={{ color: "#94A3B8" }}
        >
          {today}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
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

        <NotificationBell
          color="#64748B"
          bgColor="#F1F5F9"
          borderColor="#E2E8F0"
        />

        <button
          className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-medium"
          style={{
            background: "#F1F5F9",
            border: "1px solid #E2E8F0",
            color: "#475569",
          }}
        >
          <IconDownload size={13} />
          {t("common.telecharger")}
        </button>

        <Link
          href="/bailleur/biens"
          className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-bold text-white"
          style={{
            background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
            boxShadow: "0 2px 8px rgba(37,99,235,.35)",
            textDecoration: "none",
          }}
        >
          <IconPlus size={14} />
          <span className="hidden sm:inline">
            {t("dashboard.ajouter_bien")}
          </span>
        </Link>

        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#2563EB,#7C3AED)" }}
        >
          {initiales}
        </div>
      </div>
    </header>
  );
}
