"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";
import { Bien, PaginatedResponse } from "@/types";
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
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconPhoto,
} from "@tabler/icons-react";

const TYPE_LABELS: Record<string, string> = {
  chambre: "Chambre", studio: "Studio", f1: "F1", f2: "F2", f3: "F3",
  f4_plus: "F4 et plus", duplex: "Duplex", villa: "Villa", boutique: "Boutique",
  bureau: "Bureau", magasin: "Magasin", entrepot: "Entrepôt", autre: "Autre",
};

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background: "linear-gradient(90deg,#EDEBE6 25%,#F5F4F0 50%,#EDEBE6 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}

function isLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("access_token");
}

export default function BienPublicDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [estFavori, setEstFavori] = useState(false);
  const [favoriPending, setFavoriPending] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [nearby, setNearby] = useState<Bien[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const [form, setForm] = useState({
    nom_visiteur: "", telephone_visiteur: "", email_visiteur: "", message: "",
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

  useEffect(() => {
    if (!isLoggedIn() || !id) return;
    api
      .get(`/favoris/`)
      .then((res) => {
        const list = res.data.results as { bien: { id: number } }[];
        setEstFavori(list.some((f) => String(f.bien.id) === String(id)));
      })
      .catch(() => {});
  }, [id]);

  // ── Biens dans les environs (par proximité GPS si dispo, sinon plus récents) ──
  useEffect(() => {
    if (!bien) return;
    setNearbyLoading(true);
    api
      .get<PaginatedResponse<Bien>>("/marketplace/biens/")
      .then((res) => {
        const autres = res.data.results.filter((b) => b.id !== bien.id);
        const toRad = (v: number) => (v * Math.PI) / 180;
        const distanceKm = (a: Bien, b2: Bien) => {
          if (!a.latitude || !a.longitude || !b2.latitude || !b2.longitude) return null;
          const R = 6371;
          const dLat = toRad(b2.latitude - a.latitude);
          const dLon = toRad(b2.longitude - a.longitude);
          const s =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.latitude)) * Math.cos(toRad(b2.latitude)) * Math.sin(dLon / 2) ** 2;
          return 2 * R * Math.asin(Math.sqrt(s));
        };
        const avecDistance = autres.map((b) => ({ b, d: distanceKm(bien, b) }));
        const trouvables = avecDistance.filter((x) => x.d !== null) as { b: Bien; d: number }[];
        const sansGps = avecDistance.filter((x) => x.d === null).map((x) => x.b);
        trouvables.sort((x, y) => x.d - y.d);
        const tries = [...trouvables.map((x) => x.b), ...sansGps];
        setNearby(tries.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => setNearbyLoading(false));
  }, [bien]);

  const toggleFavori = async () => {
    if (!isLoggedIn()) {
      toast("Connectez-vous pour enregistrer ce bien en favori.");
      return;
    }
    setFavoriPending(true);
    try {
      if (estFavori) {
        await api.delete(`/favoris/${id}/`);
        setEstFavori(false);
      } else {
        await api.post(`/favoris/${id}/`);
        setEstFavori(true);
      }
    } catch {
      toast.error("Impossible de mettre à jour vos favoris.");
    } finally {
      setFavoriPending(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: bien?.titre, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papiers.");
    }
  };

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
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 20px" }}>
          <Skeleton className="h-[420px] mb-6" />
          <Skeleton className="h-6 w-1/2 mb-3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (notFound || !bien) {
    return (
      <div
        style={{ minHeight: "100vh", background: "#fff" }}
        className="flex flex-col items-center justify-center text-center px-6"
      >
        <IconBuilding size={40} style={{ color: "#D6D3CE" }} />
        <h1 className="text-lg font-bold mt-4 mb-2" style={{ color: "#0F172A" }}>
          Ce bien n&apos;est plus disponible
        </h1>
        <p className="text-sm mb-5" style={{ color: "#78716C" }}>
          Il a peut-être été loué ou retiré par le bailleur.
        </p>
        <Link
          href="/marketplace"
          className="text-sm font-semibold px-5 py-2.5 rounded-full text-white"
          style={{ background: "#0F172A" }}
        >
          Retour à la recherche
        </Link>
      </div>
    );
  }

  const photos = bien.photos ?? [];
  const hasPhotos = photos.length > 0;

  return (
    <>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .gal-tile{transition:filter .2s ease}
        .gal-tile:hover{filter:brightness(0.88)}
        .mp-card{transition:transform .25s ease, box-shadow .25s ease}
        .mp-card:hover{transform:translateY(-4px);box-shadow:0 20px 40px rgba(15,23,42,.10)}
      `}</style>

      <div style={{ minHeight: "100vh", background: "#fff" }}>
        <header style={{ borderBottom: "1px solid #F5F4F0" }}>
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: "1100px", margin: "0 auto", padding: "16px 20px" }}
          >
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: "#44403C" }}
            >
              <IconArrowLeft size={15} /> Retour à la recherche
            </Link>
            <div className="flex items-center gap-1">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full"
                style={{ background: "none", border: "none", color: "#44403C", cursor: "pointer" }}
              >
                <IconShare size={14} /> Partager
              </button>
              <button
                onClick={toggleFavori}
                disabled={favoriPending}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full"
                style={{ background: "none", border: "none", color: "#44403C", cursor: "pointer" }}
              >
                {estFavori ? (
                  <IconHeartFilled size={14} style={{ color: "#E11D48" }} />
                ) : (
                  <IconHeart size={14} />
                )}
                {estFavori ? "Enregistré" : "Enregistrer"}
              </button>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 20px 60px" }}>
          <h1 className="text-xl font-extrabold tracking-tight mb-1.5" style={{ color: "#0F172A" }}>
            {bien.titre}
          </h1>
          <div className="flex items-center gap-1.5 mb-5">
            <IconMapPin size={14} style={{ color: "#A8A29E" }} />
            <span className="text-sm" style={{ color: "#57534E" }}>
              {bien.adresse}
            </span>
          </div>

          {/* ── Galerie collage ── */}
          <div
            className="rounded-2xl overflow-hidden mb-8"
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: hasPhotos && photos.length > 1 ? "1.4fr 1fr" : "1fr",
              gap: "4px",
              height: "420px",
            }}
          >
            <button
              onClick={() => hasPhotos && setLightboxOpen(true)}
              className="gal-tile"
              style={{
                border: "none",
                padding: 0,
                cursor: hasPhotos ? "pointer" : "default",
                background: "linear-gradient(135deg,#F5F4F0,#EDEBE6)",
                overflow: "hidden",
              }}
            >
              {hasPhotos ? (
                <img
                  src={photos[0].url}
                  alt={bien.titre}
                  className="w-full h-full object-cover"
                  style={{ display: "block" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IconBuilding size={48} style={{ color: "#D6D3CE" }} />
                </div>
              )}
            </button>

            {photos.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gridTemplateRows: "1fr 1fr",
                  gap: "4px",
                }}
              >
                {photos.slice(1, 5).map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActivePhoto(i + 1);
                      setLightboxOpen(true);
                    }}
                    className="gal-tile relative"
                    style={{ border: "none", padding: 0, cursor: "pointer", overflow: "hidden" }}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" style={{ display: "block" }} />
                    {i === 3 && photos.length > 5 && (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ background: "rgba(15,23,42,.5)" }}
                      >
                        <span className="text-white text-sm font-bold flex items-center gap-1.5">
                          <IconPhoto size={16} /> +{photos.length - 5}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
                {Array.from({ length: Math.max(0, 4 - (photos.length - 1)) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ background: "#F5F4F0" }} />
                ))}
              </div>
            )}

            {hasPhotos && (
              <button
                onClick={() => {
                  setActivePhoto(0);
                  setLightboxOpen(true);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  padding: "8px 14px",
                  borderRadius: "9px",
                  background: "#fff",
                  border: "1px solid #0F172A",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(15,23,42,.15)",
                }}
              >
                <IconPhoto size={14} /> Afficher toutes les photos
              </button>
            )}
          </div>

          {/* ── Lightbox ── */}
          {lightboxOpen && hasPhotos && (
            <div
              className="fixed inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(15,23,42,.96)", zIndex: 100 }}
              onClick={() => setLightboxOpen(false)}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-5 right-6 text-white text-sm font-semibold"
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                Fermer ✕
              </button>
              <img
                src={photos[activePhoto]?.url ?? photos[0].url}
                alt=""
                style={{ maxWidth: "90vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 8 }}
                onClick={(e) => e.stopPropagation()}
              />
              {photos.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto px-6" onClick={(e) => e.stopPropagation()}>
                  {photos.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => setActivePhoto(i)}
                      style={{
                        width: 56,
                        height: 42,
                        flexShrink: 0,
                        borderRadius: 6,
                        overflow: "hidden",
                        border: i === activePhoto ? "2px solid #fff" : "2px solid transparent",
                        opacity: i === activePhoto ? 1 : 0.55,
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* ── Détails ── */}
            <div className="md:col-span-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#F5F4F0", color: "#44403C" }}
              >
                {TYPE_LABELS[bien.type_bien] ?? bien.type_bien}
              </span>

              <div
                className="flex flex-wrap gap-5 py-5 my-5"
                style={{ borderTop: "1px solid #F5F4F0", borderBottom: "1px solid #F5F4F0" }}
              >
                {bien.surface && (
                  <span className="text-sm font-medium" style={{ color: "#292524" }}>
                    {bien.surface} m²
                  </span>
                )}
                {bien.surface && (typeof bien.nb_vues === "number") && (
                  <span style={{ color: "#D6D3CE" }}>·</span>
                )}
                {typeof bien.nb_vues === "number" && (
                  <span className="text-sm font-medium" style={{ color: "#292524" }}>
                    {bien.nb_vues} vue{bien.nb_vues > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {bien.description && (
                <div className="mb-7" style={{ borderBottom: "1px solid #F5F4F0", paddingBottom: "28px" }}>
                  <h2 className="text-base font-bold mb-3" style={{ color: "#0F172A" }}>
                    À propos de ce logement
                  </h2>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "#44403C",
                      display: "-webkit-box",
                      WebkitLineClamp: descExpanded ? "unset" : 4,
                      WebkitBoxOrient: "vertical",
                      overflow: descExpanded ? "visible" : "hidden",
                    }}
                  >
                    {bien.description}
                  </p>
                  {bien.description.length > 220 && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="text-sm font-bold mt-2 flex items-center gap-1"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#0F172A",
                        textDecoration: "underline",
                      }}
                    >
                      {descExpanded ? "Afficher moins" : "Afficher plus"}
                    </button>
                  )}
                </div>
              )}

              <div>
                <h2 className="text-base font-bold mb-4" style={{ color: "#0F172A" }}>
                  Ce que propose ce logement
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6">
                  {bien.surface && (
                    <div className="flex items-center gap-3">
                      <IconRuler2 size={19} style={{ color: "#44403C" }} stroke={1.5} />
                      <span className="text-sm" style={{ color: "#292524" }}>
                        {bien.surface} m² de surface
                      </span>
                    </div>
                  )}
                  {bien.est_meuble && (
                    <div className="flex items-center gap-3">
                      <IconSofa size={19} style={{ color: "#44403C" }} stroke={1.5} />
                      <span className="text-sm" style={{ color: "#292524" }}>Logement meublé</span>
                    </div>
                  )}
                  {bien.est_climatise && (
                    <div className="flex items-center gap-3">
                      <IconSnowflake size={19} style={{ color: "#44403C" }} stroke={1.5} />
                      <span className="text-sm" style={{ color: "#292524" }}>Climatisation</span>
                    </div>
                  )}
                  {bien.a_ascenseur && (
                    <div className="flex items-center gap-3">
                      <IconArrowsUpDown size={19} style={{ color: "#44403C" }} stroke={1.5} />
                      <span className="text-sm" style={{ color: "#292524" }}>Ascenseur dans l&apos;immeuble</span>
                    </div>
                  )}
                  {!bien.est_meuble && !bien.est_climatise && !bien.a_ascenseur && !bien.surface && (
                    <p className="text-sm" style={{ color: "#A8A29E" }}>
                      Aucun équipement renseigné par le bailleur pour ce bien.
                    </p>
                  )}
                </div>
              </div>

              {/* ── Localisation ── */}
              {bien.latitude && bien.longitude && (
                <div className="mt-7 pt-7" style={{ borderTop: "1px solid #F5F4F0" }}>
                  <h2 className="text-base font-bold mb-1" style={{ color: "#0F172A" }}>
                    Où se trouve ce logement
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "#78716C" }}>
                    {bien.adresse}
                  </p>
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ height: "320px", border: "1px solid #E2E0D9" }}
                  >
                    <iframe
                      title="Localisation du bien"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        bien.longitude - 0.008
                      }%2C${bien.latitude - 0.008}%2C${bien.longitude + 0.008}%2C${
                        bien.latitude + 0.008
                      }&layer=mapnik&marker=${bien.latitude}%2C${bien.longitude}`}
                      style={{ width: "100%", height: "100%", border: "none" }}
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${bien.latitude},${bien.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold mt-3"
                    style={{ color: "#2563EB", textDecoration: "none" }}
                  >
                    <IconMapPin size={15} /> Obtenir l&apos;itinéraire
                  </a>
                </div>
              )}
            </div>

            {/* ── Carte contact ── */}
            <div className="md:col-span-1">
              <div
                className="rounded-2xl p-5 sticky"
                style={{
                  background: "#fff",
                  border: "1px solid #E2E0D9",
                  boxShadow: "0 8px 28px rgba(15,23,42,.08)",
                  top: "20px",
                }}
              >
                <div className="text-xl font-extrabold mb-0.5" style={{ color: "#0F172A" }}>
                  {bien.prix.toLocaleString("fr-FR")} XAF
                  <span className="text-sm font-medium" style={{ color: "#78716C" }}> /mois</span>
                </div>
                <p className="text-xs mb-4" style={{ color: "#A8A29E" }}>
                  Charges (eau, électricité) non incluses
                </p>

                {sent ? (
                  <div className="flex flex-col items-center text-center py-5 gap-2">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: "#ECFDF5" }}
                    >
                      <IconCheck size={20} style={{ color: "#059669" }} />
                    </div>
                    <p className="text-sm font-semibold" style={{ color: "#0F172A" }}>
                      Demande envoyée
                    </p>
                    <p className="text-xs" style={{ color: "#78716C" }}>
                      Le bailleur vous contactera directement au numéro fourni.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
                    <p className="text-xs font-semibold mb-1" style={{ color: "#44403C" }}>
                      Intéressé ? Laissez vos coordonnées
                    </p>
                    <input
                      value={form.nom_visiteur}
                      onChange={(e) => setForm((f) => ({ ...f, nom_visiteur: e.target.value }))}
                      placeholder="Votre nom"
                      className="text-sm"
                      style={{ padding: "10px 12px", borderRadius: "10px", border: "1px solid #E2E0D9" }}
                    />
                    <div className="relative">
                      <IconPhone
                        size={14}
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A8A29E" }}
                      />
                      <input
                        value={form.telephone_visiteur}
                        onChange={(e) => setForm((f) => ({ ...f, telephone_visiteur: e.target.value }))}
                        placeholder="Téléphone"
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E0D9" }}
                      />
                    </div>
                    <div className="relative">
                      <IconMail
                        size={14}
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#A8A29E" }}
                      />
                      <input
                        value={form.email_visiteur}
                        onChange={(e) => setForm((f) => ({ ...f, email_visiteur: e.target.value }))}
                        placeholder="Email (optionnel)"
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E0D9" }}
                      />
                    </div>
                    <div className="relative">
                      <IconMessage size={14} style={{ position: "absolute", left: 12, top: 12, color: "#A8A29E" }} />
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Un message pour le bailleur (optionnel)"
                        rows={3}
                        className="text-sm w-full"
                        style={{ padding: "10px 12px 10px 34px", borderRadius: "10px", border: "1px solid #E2E0D9", resize: "vertical" }}
                      />
                    </div>
                    {formError && (
                      <p className="text-xs font-medium" style={{ color: "#DC2626" }}>{formError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={sending}
                      className="flex items-center justify-center gap-2 text-sm font-bold py-3 rounded-full text-white mt-1"
                      style={{
                        background: "linear-gradient(135deg,#2563EB,#1D4ED8)",
                        border: "none",
                        cursor: sending ? "wait" : "pointer",
                        opacity: sending ? 0.7 : 1,
                      }}
                    >
                      {sending && <IconLoader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />}
                      Je suis intéressé(e)
                    </button>
                    <p className="text-xs text-center" style={{ color: "#A8A29E" }}>
                      Aucun engagement — le bailleur reprendra contact avec vous.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* ── D'autres biens dans les environs ── */}
          {(nearbyLoading || nearby.length > 0) && (
            <div className="mt-14 pt-10" style={{ borderTop: "1px solid #F5F4F0" }}>
              <h2 className="text-lg font-extrabold tracking-tight mb-5" style={{ color: "#0F172A" }}>
                D&apos;autres biens dans les environs
              </h2>
              {nearbyLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-6">
                  {Array(4)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i}>
                        <div
                          className="aspect-square rounded-2xl mb-2.5"
                          style={{
                            background: "linear-gradient(90deg,#EDEBE6 25%,#F5F4F0 50%,#EDEBE6 75%)",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 1.5s infinite",
                          }}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-6">
                  {nearby.map((b) => (
                    <Link key={b.id} href={`/marketplace/${b.id}`}>
                      <div className="mp-card">
                        <div
                          className="relative rounded-2xl overflow-hidden mb-2.5"
                          style={{
                            aspectRatio: "1 / 1",
                            background: "linear-gradient(135deg,#F5F4F0,#EDEBE6)",
                          }}
                        >
                          {b.photos && b.photos.length > 0 ? (
                            <img
                              src={b.photos.find((p) => p.est_principale)?.url ?? b.photos[0].url}
                              alt={b.titre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IconBuilding size={28} style={{ color: "#D6D3CE" }} />
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold truncate" style={{ color: "#0F172A" }}>
                          {b.titre}
                        </h3>
                        <div className="flex items-center gap-1 mb-1">
                          <IconMapPin size={11} style={{ color: "#A8A29E", flexShrink: 0 }} />
                          <span className="text-xs truncate" style={{ color: "#78716C" }}>
                            {b.adresse}
                          </span>
                        </div>
                        <div className="text-sm" style={{ color: "#0F172A" }}>
                          <span className="font-bold">{b.prix.toLocaleString("fr-FR")} XAF</span>
                          <span style={{ color: "#78716C" }}> / mois</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
