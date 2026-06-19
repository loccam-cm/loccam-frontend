"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  IconArrowLeft,
  IconSettings,
  IconBell,
  IconCreditCard,
  IconWorld,
  IconLoader2,
  IconCheck,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";

interface Preferences {
  notif_email_paiement: boolean;
  notif_email_impayes: boolean;
  notif_email_signalements: boolean;
  notif_email_rappel_loyer: boolean;
  notif_inapp: boolean;
  moyen_paiement_prefere: string;
  langue: string;
  profil_visible: boolean;
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        color: value ? "#059669" : "#CBD5E1",
        background: "none",
        border: "none",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {value ? <IconToggleRight size={32} /> : <IconToggleLeft size={32} />}
    </button>
  );
}

function Section({
  titre,
  ico,
  children,
}: {
  titre: string;
  ico: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ border: "1px solid #E2E8F0" }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#ECFDF5", color: "#059669" }}
        >
          {ico}
        </div>
        <h2 className="text-sm font-bold" style={{ color: "#0F172A" }}>
          {titre}
        </h2>
      </div>
      <div className="px-5 py-2">{children}</div>
    </motion.div>
  );
}

function Row({
  lbl,
  desc,
  children,
}: {
  lbl: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex items-center justify-between py-3.5"
      style={{ borderBottom: "1px solid #F8FAFC" }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-semibold" style={{ color: "#0F172A" }}>
          {lbl}
        </div>
        {desc && (
          <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
            {desc}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function LocataireParametresPage() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    charger();
  }, []);

  const charger = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/preferences/");
      setPrefs(res.data);
    } catch {
      toast.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof Preferences, v: any) => {
    setPrefs((p) => (p ? { ...p, [k]: v } : p));
  };

  const sauvegarder = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await api.patch("/auth/preferences/", prefs);
      toast.success("Préférences sauvegardées !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div
        className="min-h-screen"
        style={{
          background: "#F0FDF4",
          fontFamily: "'DM Sans','Helvetica Neue',sans-serif",
        }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-14 sm:h-16 bg-white"
          style={{
            borderBottom: "1px solid #D1FAE5",
            boxShadow: "0 1px 4px rgba(5,150,105,.05)",
          }}
        >
          <Link
            href="/locataire"
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: "#64748B", textDecoration: "none" }}
          >
            <IconArrowLeft size={16} />
            <span className="hidden sm:inline">Retour</span>
          </Link>
          <div className="h-5 w-px" style={{ background: "#D1FAE5" }} />
          <div className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#059669,#047857)" }}
            >
              <IconSettings size={15} color="white" />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: "#0F172A" }}>
                Paramètres
              </h1>
              <p
                className="text-xs hidden sm:block"
                style={{ color: "#94A3B8" }}
              >
                Notifications et préférences
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={sauvegarder}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg,#059669,#047857)",
              boxShadow: "0 2px 8px rgba(5,150,105,.35)",
              opacity: saving || loading ? 0.6 : 1,
            }}
          >
            {saving ? (
              <>
                <IconLoader2
                  size={14}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Sauvegarde...
              </>
            ) : (
              <>
                <IconCheck size={14} />
                Sauvegarder
              </>
            )}
          </motion.button>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <IconLoader2
                size={32}
                style={{
                  color: "#059669",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          ) : (
            prefs && (
              <>
                {/* ── NOTIFICATIONS ─────────────────────────── */}
                <Section titre="Notifications" ico={<IconBell size={15} />}>
                  <Row
                    lbl="Confirmation de paiement"
                    desc="Email après chaque paiement réussi"
                  >
                    <Toggle
                      value={prefs.notif_email_paiement}
                      onChange={(v) => set("notif_email_paiement", v)}
                    />
                  </Row>
                  <Row
                    lbl="Rappel de loyer"
                    desc="Email 3 jours avant la date d'échéance"
                  >
                    <Toggle
                      value={prefs.notif_email_rappel_loyer}
                      onChange={(v) => set("notif_email_rappel_loyer", v)}
                    />
                  </Row>
                  <Row
                    lbl="Notifications in-app"
                    desc="Alertes dans votre espace locataire"
                  >
                    <Toggle
                      value={prefs.notif_inapp}
                      onChange={(v) => set("notif_inapp", v)}
                    />
                  </Row>
                </Section>

                {/* ── PAIEMENTS ─────────────────────────────── */}
                <Section titre="Paiements" ico={<IconCreditCard size={15} />}>
                  <Row
                    lbl="Moyen de paiement préféré"
                    desc="Sélectionné par défaut lors du paiement"
                  >
                    <select
                      value={prefs.moyen_paiement_prefere}
                      onChange={(e) =>
                        set("moyen_paiement_prefere", e.target.value)
                      }
                      style={{
                        height: "38px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        border: "1.5px solid #D1FAE5",
                        fontSize: "13px",
                        color: "#0F172A",
                        outline: "none",
                        background: "#fff",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <option value="orange_money">Orange Money</option>
                      <option value="mtn_money">MTN Money</option>
                      <option value="cash">Cash</option>
                      <option value="virement">Virement bancaire</option>
                    </select>
                  </Row>
                </Section>

                {/* ── AFFICHAGE ─────────────────────────────── */}
                <Section titre="Affichage" ico={<IconWorld size={15} />}>
                  <Row lbl="Langue de l'interface">
                    <select
                      value={prefs.langue}
                      onChange={(e) => set("langue", e.target.value)}
                      style={{
                        height: "38px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        border: "1.5px solid #D1FAE5",
                        fontSize: "13px",
                        color: "#0F172A",
                        outline: "none",
                        background: "#fff",
                        fontFamily: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                    </select>
                  </Row>
                </Section>

                {/* Bouton bas */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={sauvegarder}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold text-white mb-6"
                  style={{
                    background: "linear-gradient(135deg,#059669,#047857)",
                    boxShadow: "0 4px 14px rgba(5,150,105,.3)",
                  }}
                >
                  {saving ? (
                    <>
                      <IconLoader2
                        size={17}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <IconCheck size={17} />
                      Sauvegarder les paramètres
                    </>
                  )}
                </motion.button>
              </>
            )
          )}
        </div>
      </div>
    </>
  );
}
