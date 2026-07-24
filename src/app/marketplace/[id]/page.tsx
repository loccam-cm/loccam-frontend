"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";
import { Bien } from "@/types";
import {
  IconBuilding,
  IconMapPin,
  IconArrowLeft,
  IconCheck,
  IconRuler2,
  IconSnowflake,
  IconArrowsUpDown,
  IconSofa,
  IconLoader2,
  IconPhone,
  IconMail,
  IconMessage,
  IconEye,
} from "@tabler/icons-react";

const TYPE_LABELS: Record<string, string> = {
  chambre: "Chambre",
  studio: "Studio",
  f1: "F1",
  f2: "F2",
  f3: "F3",
  f4_plus: "F4 et plus",
  duplex: "Duplex",
  villa: "Villa",
  boutique: "Boutique",
  bureau: "Bureau",
  magasin: "Magasin",
  entrepot: "Entrepôt",
  autre: "Autre",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg,#E2E8F0 25%,#F1F5F9 50%,#E2E8F0 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

export default function BienPublicDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const [form, setForm] = useState({
    nom_visiteur: "",
    telephone_visiteur: "",
    email_visiteur: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get<Bien>(`/marketplace/biens/${id}/`);
        setBien(res.data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom_visiteur.trim() || !form.telephone_visiteur.trim()) {
      setFormError("Le nom et le téléphone sont requis.");
      return;
    }
    setFormError(null);
    setSending(true);
    try {
      await api.post(`/biens/${id}/demandes-contact/`, form);
      setSent(true);
      toast.success("Votre demande a été envoyée au bailleur.");
    } catch (err: unknown) {
      const e2 = err as { response?: { data?: Record<string, unknown> } };
      const apiError =
        (e2.response?.data?.bien as string[] | undefined)?.[0] ??
        "Impossible d'envoyer votre demande pour le moment.";
      setFormError(apiError);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 20px" }}>
          <Skeleton className="h-80 mb-6" />
          <Skeleton className="h-6 w-1/2 mb-3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (notFound || !bien) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#F8FAFC" }}
        className="flex flex-col items-center justify-center text-center px-6"
      >
        <IconBuilding size={40} style={{ color: "#CBD5E1" }} />
        <h1 className="text-lg font-bold mt-4 mb-2" style={{ color: "#0F172A" }}>
          Ce bien n&apos;est plus disponible
        </h1>
        <p className="text-sm mb-5" style={{ color: "#64748B" }}>
          Il a peut-être été loué ou retiré par le bailleur.
        </p>
        <Link
          href="/marketplace"
          className="text-sm font-semibold px-4 py-2.5 rounded-xl text-white"
          style={{ background: "#2563EB" }}
        >
          Retour à la recherche
        </Link>
      </div>
    );
  }

  const photos = bien.photos ?? [];

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
        <header style={{ borderBottom: "1px solid #E2E8F0", background: "#fff" }}>
          <div
            style={{ maxWidth: "1000px", margin: "0 auto", padding: "14px 20px" }}
          >
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#475569" }}
            >
              <IconArrowLeft size={15} /> Retour à la recherche
            </Link>
          </div>
        </header>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 20px 60px" }}>
          {/* ── Galerie ── */}
          <div className="mb-6">
            <div
              className="rounded-2xl overflow-hidden mb-2"
              style={{
                height: "380px",
                background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
              }}
            >
              {photos.length > 0 ? (
                <img
                  src={photos[activePhoto]?.url ?? photos[0].url}
                  alt={bien.titre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconBuilding size={48} style={{ color: "#93C5FD" }} />
                </div>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePhoto(i)}
                    className="flex-shrink-0 rounded-lg overflow-hidden"
                    style={{
                      width: "72px",
                      height: "56px",
                      border: i === activePhoto ? "2px solid #2563EB" : "2px solid transparent",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ── Détails ── */}
            <div className="md:col-span-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#EFF6FF", color: "#2563EB" }}
              >
                {TYPE_LABELS[bien.type_bien] ?? bien.type_bien}
              </span>
              <h1 className="text-xl font-extrabold mt-3 mb-1.5" style={{ color: "#0F172A" }}>
                {bien.titre}
              </h1>
              <div className="flex items-center gap-1.5 mb-5">
                <IconMapPin size={14} style={{ color: "#94A3B8" }} />
                <span className="text-sm" style={{ color: "#64748B" }}>
                  {bien.adresse}
                </span>
              </div>

              <div
                className="flex flex-wrap gap-4 py-4 mb-5"
                style={{ borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0" }}
              >
                {bien.surface && (
                  <div className="flex items-center gap-2">
                    <IconRuler2 size={16} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-medium" style={{ color: "#334155" }}>
                      {bien.surface} m²
                    </span>
                  </div>
                )}
                {bien.est_meuble && (
                  <div className="flex items-center gap-2">
                    <IconSofa size={16} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-medium" style={{ color: "#334155" }}>
                      Meublé
                    </span>
                  </div>
                )}
                {bien.est_climatise && (
                  <div className="flex items-center gap-2">
                    <IconSnowflake size={16} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-medium" style={{ color: "#334155" }}>
                      Climatisé
                    </span>
                  </div>
                )}
                {bien.a_ascenseur && (
                  <div className="flex items-center gap-2">
                    <IconArrowsUpDown size={16} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-medium" style={{ color: "#334155" }}>
                      Ascenseur
                    </span>
                  </div>
                )}
                {typeof bien.nb_vues === "number" && (
                  <div className="flex items-center gap-2">
                    <IconEye size={16} style={{ color: "#94A3B8" }} />
                    <span className="text-sm font-medium" style={{ color: "#334155" }}>
                      {bien.nb_vues} vues
                    </span>
                  </div>
                )}
              </div>

              {bien.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-bold mb-2" style={{ color: "#0F172A" }}>
                    Description
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                    {bien.description}
                  </p>
                </div>
              )}
            </div>

            {/* ── Carte contact ── */}
            <div className="md:col-span-1">
              <div
                className="rounded-2xl p-5 sticky"
                style={{ background: "#fff", border: "1px solid #E2E8F0", top: "20px" }}
              >
                <div className="text-xl font-extrabold mb-0.5" style={{ color: "#059669" }}>
                  {bien.prix.toLocaleString("fr-FR")} XAF
                  <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>
                    {" "}/mois
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#94A3B8" }}>
                  Charges (eau, électricité) non incluses
                </p>

                {sent ? (
                  <div
                    className="flex flex-col items-center text-center py-5 gap-2"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: "#ECFDF5" }}
                    >
                      <IconCheck size={20} style={{ color: "#059669" }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                      Demande envoyée
                    </p>
                    <p className="text-xs" style={{ color: "#64748B" }}>
                      Le bailleur vous contactera directement au numéro fourni.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <p className="text-xs font-semibold mb-1" style={{ color: "#475569" }}>
                      Intéressé ? Laissez vos coordonnées
                    </p>
                    <input
                      value={form.nom_visiteur}
                      onChange={(e) => setForm((f) => ({ ...f, nom_visiteur: e.target.value }))}
                      placeholder="Votre nom"
                      className="text-sm"
                      style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                    />
                    <div className="relative">
                      <IconPhone
                        size={14}
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        value={form.telephone_visiteur}
                        onChange={(e) => setForm((f) => ({ ...f, telephone_visiteur: e.target.value }))}
                        placeholder="Téléphone"
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                      />
                    </div>
                    <div className="relative">
                      <IconMail
                        size={14}
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                      />
                      <input
                        value={form.email_visiteur}
                        onChange={(e) => setForm((f) => ({ ...f, email_visiteur: e.target.value }))}
                        placeholder="Email (optionnel)"
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E8F0" }}
                      />
                    </div>
                    <div className="relative">
                      <IconMessage
                        size={14}
                        style={{ position: "absolute", left: 12, top: 12, color: "#94A3B8" }}
                      />
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Un message pour le bailleur (optionnel)"
                        rows={3}
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E8F0", resize: "vertical" }}
                      />
                    </div>
                    {formError && (
                      <p className="text-xs font-medium" style={{ color: "#DC2626" }}>
                        {formError}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-xl text-white mt-1"
                      style={{
                        background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        border: "none",
                        cursor: sending ? "wait" : "pointer",
                        opacity: sending ? 0.7 : 1,
                      }}
                    >
                      {sending && (
                        <IconLoader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                      )}
                      Je suis intéressé(e)
                    </button>
                    <p className="text-xs text-center" style={{ color: "#94A3B8" }}>
                      Aucun engagement — le bailleur reprendra contact avec vous.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
