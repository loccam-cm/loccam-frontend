"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  IconBuilding,
  IconUser,
  IconLock,
  IconPhone,
  IconCheck,
  IconLoader2,
  IconAlertCircle,
  IconHome2,
  IconMapPin,
  IconCurrencyDollar,
  IconMail,
  IconShieldCheck,
  IconClock,
} from "@tabler/icons-react";

interface InvitationInfo {
  email: string;
  nom_invite: string;
  bailleur: string;
  bien_titre: string | null;
  bien_adresse: string | null;
  loyer: number | null;
  expire_le: string;
}

type Etape = "chargement" | "formulaire" | "succes" | "erreur" | "expire";

export default function InvitationPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [etape, setEtape] = useState<Etape>("chargement");
  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [erreur, setErreur] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    password: "",
    confirm: "",
  });
  const [focuses, setFocuses] = useState<Record<string, boolean>>({});
  const [showPass, setShowPass] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const focus = (k: string, v: boolean) =>
    setFocuses((f) => ({ ...f, [k]: v }));

  const passStrength =
    form.password.length === 0
      ? 0
      : form.password.length < 6
        ? 1
        : form.password.length < 10
          ? 2
          : 3;

  // ── Charger l'invitation ──────────────────────────────────
  useEffect(() => {
    const charger = async () => {
      try {
        const res = await api.get(`/invitations/accepter/${token}/`);
        setInfo(res.data);
        setForm((f) => ({
          ...f,
          prenom: res.data.nom_invite?.split(" ")[0] ?? "",
          nom: res.data.nom_invite?.split(" ").slice(1).join(" ") ?? "",
        }));
        setEtape("formulaire");
      } catch (err: unknown) {
        const e = err as {
          response?: { status?: number; data?: { error?: string } };
        };
        if (e.response?.status === 410) {
          setEtape("expire");
        } else {
          setErreur(
            e.response?.data?.error ?? "Invitation invalide ou introuvable.",
          );
          setEtape("erreur");
        }
      }
    };
    charger();
  }, [token]);

  // ── Soumettre ─────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setErreur("");
    setSaving(true);
    try {
      const res = await api.post(`/invitations/accepter/${token}/`, {
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        password: form.password,
      });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setEtape("succes");
      setTimeout(() => router.push("/locataire"), 2500);
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: Record<string, string[]> | { error?: string } };
      };
      const data = e.response?.data;
      if (data && "error" in data) {
        setErreur(String(data.error ?? "Erreur lors de la création du compte."));
      } else if (data) {
        setErreur(Object.values(data).flat()[0] as string);
      } else {
        setErreur("Erreur lors de la création du compte.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Chargement ────────────────────────────────────────────
  if (etape === "chargement")
    return (
      <div className="inv-root">
        <div className="inv-center">
          <div className="inv-spinner" />
          <p style={{ color: "#64748B", fontSize: "14px", marginTop: "16px" }}>
            Vérification de l&apos;invitation...
          </p>
        </div>
        <InvStyles />
      </div>
    );

  // ── Erreur ────────────────────────────────────────────────
  if (etape === "erreur")
    return (
      <div className="inv-root">
        <div className="inv-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inv-card inv-card-error"
          >
            <div className="inv-icon-wrap" style={{ background: "#FEF2F2" }}>
              <IconAlertCircle size={32} style={{ color: "#EF4444" }} />
            </div>
            <h1 className="inv-title" style={{ color: "#0F172A" }}>
              Invitation invalide
            </h1>
            <p className="inv-sub">{erreur}</p>
            <Link href="/login" className="inv-btn inv-btn-ghost">
              Aller à la connexion
            </Link>
          </motion.div>
        </div>
        <InvStyles />
      </div>
    );

  // ── Expirée ───────────────────────────────────────────────
  if (etape === "expire")
    return (
      <div className="inv-root">
        <div className="inv-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inv-card"
          >
            <div className="inv-icon-wrap" style={{ background: "#FFFBEB" }}>
              <IconClock size={32} style={{ color: "#D97706" }} />
            </div>
            <h1 className="inv-title">Invitation expirée</h1>
            <p className="inv-sub">
              Ce lien d&apos;invitation n&apos;est plus valide. Demandez à votre
              bailleur de vous envoyer une nouvelle invitation.
            </p>
            <Link href="/landing" className="inv-btn inv-btn-ghost">
              Retour à l&apos;accueil
            </Link>
          </motion.div>
        </div>
        <InvStyles />
      </div>
    );

  // ── Succès ────────────────────────────────────────────────
  if (etape === "succes")
    return (
      <div className="inv-root">
        <div className="inv-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inv-card"
          >
            <motion.div
              className="inv-icon-wrap"
              style={{ background: "#ECFDF5" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              <IconCheck size={32} style={{ color: "#059669" }} />
            </motion.div>
            <h1 className="inv-title" style={{ color: "#059669" }}>
              Bienvenue sur LocCam !
            </h1>
            <p className="inv-sub">
              Votre compte locataire a été créé. Redirection vers votre
              espace...
            </p>
            <div
              className="inv-spinner"
              style={{ borderTopColor: "#059669" }}
            />
          </motion.div>
        </div>
        <InvStyles />
      </div>
    );

  // ── Formulaire ────────────────────────────────────────────
  return (
    <div className="inv-root">
      <div className="inv-page">
        {/* ── Panneau gauche — info invitation ── */}
        <div className="inv-left">
          <div className="inv-left-bg" />
          <div className="inv-left-inner">
            {/* Logo */}
            <Link href="/landing" className="inv-logo">
              <div className="inv-logo-icon">
                <IconBuilding size={17} color="white" />
              </div>
              <span className="inv-logo-name">LocCam</span>
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <div className="inv-badge">
                <IconShieldCheck size={13} />
                Invitation sécurisée
              </div>
              <h2 className="inv-left-title">
                {info?.bailleur} vous invite à<br />
                rejoindre LocCam
              </h2>
              <p className="inv-left-sub">
                Créez votre compte locataire gratuit et gérez votre location
                simplement.
              </p>
            </motion.div>

            {/* Carte bien */}
            {info?.bien_titre && (
              <motion.div
                className="inv-bien-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                <div className="inv-bien-label">Votre logement</div>
                <div className="inv-bien-titre">{info.bien_titre}</div>
                {info.bien_adresse && (
                  <div className="inv-bien-row">
                    <IconMapPin
                      size={13}
                      style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }}
                    />
                    <span>{info.bien_adresse}</span>
                  </div>
                )}
                {info.loyer && (
                  <div className="inv-bien-loyer">
                    <IconCurrencyDollar size={15} />
                    {info.loyer.toLocaleString("fr-FR")} XAF / mois
                  </div>
                )}
              </motion.div>
            )}

            {/* Avantages */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="inv-avantages-label">
                Avec LocCam vous pourrez :
              </div>
              {[
                {
                  ico: <IconCurrencyDollar size={14} />,
                  txt: "Payer votre loyer via Orange Money ou MTN",
                },
                {
                  ico: <IconHome2 size={14} />,
                  txt: "Télécharger vos quittances PDF",
                },
                {
                  ico: <IconMail size={14} />,
                  txt: "Communiquer avec votre bailleur",
                },
              ].map((a) => (
                <div key={a.txt} className="inv-avantage">
                  <div className="inv-avantage-ico">{a.ico}</div>
                  <span>{a.txt}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Panneau droit — formulaire ── */}
        <motion.div
          className="inv-right"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inv-right-inner">
            {/* Header */}
            <div className="inv-right-header">
              <Link href="/landing" className="inv-logo inv-logo-dark">
                <div className="inv-logo-icon inv-logo-icon-dark">
                  <IconBuilding size={15} color="white" />
                </div>
                <div>
                  <div className="inv-logo-name inv-logo-name-dark">LocCam</div>
                  <div className="inv-logo-sub-dark">
                    Gestion locative camerounaise
                  </div>
                </div>
              </Link>
            </div>

            <h1 className="inv-form-title">Créer mon compte locataire</h1>
            <p className="inv-form-sub">
              Invitation de <strong>{info?.bailleur}</strong> · Email :{" "}
              <strong>{info?.email}</strong>
            </p>

            <form onSubmit={handleSubmit} className="inv-form">
              {/* Prénom + Nom */}
              <div className="inv-row-2">
                {["prenom", "nom"].map((k) => (
                  <div key={k} className="inv-field">
                    <label className="inv-label">
                      {k === "prenom" ? "Prénom" : "Nom"}{" "}
                      <span className="inv-req">*</span>
                    </label>
                    <div
                      className="inv-input-wrap"
                      style={{
                        borderColor: focuses[k] ? "#2563EB" : "#E2E8F0",
                      }}
                    >
                      <IconUser
                        size={13}
                        className="inv-input-icon"
                        style={{ color: focuses[k] ? "#2563EB" : "#94A3B8" }}
                      />
                      <input
                        type="text"
                        required
                        value={form[k as keyof typeof form]}
                        onChange={(e) => set(k, e.target.value)}
                        onFocus={() => focus(k, true)}
                        onBlur={() => focus(k, false)}
                        placeholder={k === "prenom" ? "Jean" : "Dupont"}
                        className="inv-input"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Téléphone */}
              <div className="inv-field">
                <label className="inv-label">Téléphone</label>
                <div
                  className="inv-input-wrap"
                  style={{
                    borderColor: focuses["tel"] ? "#2563EB" : "#E2E8F0",
                  }}
                >
                  <IconPhone
                    size={13}
                    className="inv-input-icon"
                    style={{ color: focuses["tel"] ? "#2563EB" : "#94A3B8" }}
                  />
                  <input
                    type="tel"
                    value={form.telephone}
                    onChange={(e) => set("telephone", e.target.value)}
                    onFocus={() => focus("tel", true)}
                    onBlur={() => focus("tel", false)}
                    placeholder="+237 6XX XXX XXX"
                    className="inv-input"
                  />
                </div>
                <span className="inv-hint">Orange Money ou MTN Money</span>
              </div>

              {/* Mot de passe */}
              <div className="inv-field">
                <label className="inv-label">
                  Mot de passe <span className="inv-req">*</span>
                </label>
                <div
                  className="inv-input-wrap"
                  style={{
                    borderColor: focuses["pass"] ? "#2563EB" : "#E2E8F0",
                  }}
                >
                  <IconLock
                    size={13}
                    className="inv-input-icon"
                    style={{ color: focuses["pass"] ? "#2563EB" : "#94A3B8" }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    onFocus={() => focus("pass", true)}
                    onBlur={() => focus("pass", false)}
                    placeholder="Min. 8 caractères"
                    className="inv-input"
                  />
                </div>
                <AnimatePresence>
                  {form.password.length > 0 && (
                    <motion.div
                      className="inv-strength"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="inv-strength-bars">
                        {[1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="inv-strength-bar"
                            animate={{
                              background:
                                i <= passStrength
                                  ? passStrength === 1
                                    ? "#EF4444"
                                    : passStrength === 2
                                      ? "#F59E0B"
                                      : "#10B981"
                                  : "#E2E8F0",
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color:
                            passStrength <= 1
                              ? "#EF4444"
                              : passStrength === 2
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      >
                        {passStrength <= 1
                          ? "Faible"
                          : passStrength === 2
                            ? "Moyen"
                            : "Fort"}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirmer */}
              <div className="inv-field">
                <label className="inv-label">
                  Confirmer le mot de passe <span className="inv-req">*</span>
                </label>
                <div
                  className="inv-input-wrap"
                  style={{
                    borderColor: focuses["confirm"]
                      ? "#2563EB"
                      : form.confirm && form.password !== form.confirm
                        ? "#EF4444"
                        : "#E2E8F0",
                  }}
                >
                  <IconLock
                    size={13}
                    className="inv-input-icon"
                    style={{
                      color: focuses["confirm"] ? "#2563EB" : "#94A3B8",
                    }}
                  />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    onFocus={() => focus("confirm", true)}
                    onBlur={() => focus("confirm", false)}
                    placeholder="Répétez le mot de passe"
                    className="inv-input"
                  />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "#EF4444",
                      marginTop: "4px",
                    }}
                  >
                    Les mots de passe ne correspondent pas
                  </p>
                )}
              </div>

              {/* Erreur globale */}
              <AnimatePresence>
                {erreur && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="inv-error-box"
                  >
                    <IconAlertCircle size={14} style={{ flexShrink: 0 }} />
                    {erreur}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={saving}
                className="inv-submit"
                whileHover={saving ? {} : { scale: 1.01 }}
                whileTap={saving ? {} : { scale: 0.99 }}
              >
                <AnimatePresence mode="wait">
                  {saving ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inv-submit-inner"
                    >
                      <div className="inv-spinner-sm" /> Création du compte...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="inv-submit-inner"
                    >
                      <IconCheck size={16} /> Créer mon compte
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <p className="inv-mention">
                En créant votre compte, vous acceptez les{" "}
                <a href="#" className="inv-link">
                  CGU
                </a>{" "}
                et la{" "}
                <a href="#" className="inv-link">
                  politique de confidentialité
                </a>{" "}
                de LocCam.
              </p>
            </form>
          </div>
        </motion.div>
      </div>

      <InvStyles />
    </div>
  );
}

function InvStyles() {
  return (
    <style>{`
      @keyframes spin { to { transform: rotate(360deg) } }

      .inv-root { min-height: 100vh; font-family: 'DM Sans','Helvetica Neue',sans-serif; }
      .inv-center { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #F1F5F9; }

      .inv-card { background: white; border-radius: 24px; padding: 40px; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,.1); }
      .inv-card-error { border-top: 3px solid #EF4444; }
      .inv-icon-wrap { width: 72px; height: 72px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
      .inv-title { font-size: 1.2rem; font-weight: 800; color: #0F172A; margin-bottom: 10px; }
      .inv-sub { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 24px; }
      .inv-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; text-decoration: none; }
      .inv-btn-ghost { background: #F1F5F9; color: #64748B; }
      .inv-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #E2E8F0; border-top-color: #2563EB; animation: spin 0.7s linear infinite; margin: 16px auto 0; }
      .inv-spinner-sm { width: 15px; height: 15px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: white; animation: spin 0.7s linear infinite; }

      /* Layout page */
      .inv-page { display: flex; min-height: 100vh; }

      /* Panneau gauche */
      .inv-left { flex: 1; position: relative; overflow: hidden; }
      .inv-left-bg { position: absolute; inset: 0; background: linear-gradient(160deg,#0A1628,#0F2438 40%,#0D1F38 70%,#091422 100%); }
      .inv-left-inner { position: relative; z-index: 1; padding: 40px 48px; height: 100%; display: flex; flex-direction: column; gap: 28px; overflow-y: auto; }

      .inv-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
      .inv-logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#2563EB,#1D4ED8); display: flex; align-items: center; justify-content: center; }
      .inv-logo-name { font-weight: 800; font-size: 18px; color: white; }

      .inv-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 100px; background: rgba(37,99,235,0.2); border: 1px solid rgba(37,99,235,0.35); font-size: 12px; font-weight: 700; color: #60A5FA; margin-bottom: 16px; }
      .inv-left-title { font-weight: 800; font-size: clamp(1.4rem,2.2vw,1.8rem); color: white; line-height: 1.2; margin-bottom: 10px; }
      .inv-left-sub { font-size: 14px; color: rgba(255,255,255,.5); line-height: 1.7; }

      .inv-bien-card { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 16px; padding: 20px; }
      .inv-bien-label { font-size: 10px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 8px; }
      .inv-bien-titre { font-size: 16px; font-weight: 700; color: white; margin-bottom: 8px; }
      .inv-bien-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,.45); margin-bottom: 12px; }
      .inv-bien-loyer { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 100px; background: rgba(5,150,105,.2); border: 1px solid rgba(5,150,105,.3); font-size: 14px; font-weight: 700; color: #34D399; }

      .inv-avantages-label { font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.28); margin-bottom: 12px; }
      .inv-avantage { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 13px; color: rgba(255,255,255,.6); }
      .inv-avantage-ico { width: 30px; height: 30px; border-radius: 8px; background: rgba(255,255,255,.08); display: flex; align-items: center; justify-content: center; color: #60A5FA; flex-shrink: 0; }

      /* Panneau droit */
      .inv-right { width: 42%; flex-shrink: 0; background: white; display: flex; flex-direction: column; overflow-y: auto; box-shadow: -8px 0 40px rgba(0,0,0,.15); }
      .inv-right-inner { padding: 32px 36px; flex: 1; }
      .inv-right-header { margin-bottom: 28px; }

      .inv-logo-dark { text-decoration: none; display: inline-flex; }
      .inv-logo-icon-dark { background: linear-gradient(135deg,#1A3C5E,#2563EB); }
      .inv-logo-name-dark { font-weight: 800; font-size: 14px; color: #0F172A; }
      .inv-logo-sub-dark { font-size: 10px; color: #94A3B8; }

      .inv-form-title { font-weight: 800; font-size: 1.15rem; color: #0F172A; margin-bottom: 6px; }
      .inv-form-sub { font-size: 12px; color: #64748B; margin-bottom: 24px; line-height: 1.5; }

      .inv-form { display: flex; flex-direction: column; gap: 14px; }
      .inv-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .inv-field { display: flex; flex-direction: column; gap: 5px; }
      .inv-label { font-size: 12px; font-weight: 700; color: #0F172A; }
      .inv-req { color: #EF4444; }
      .inv-hint { font-size: 11px; color: #94A3B8; }

      .inv-input-wrap { position: relative; display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 10px; background: white; transition: border-color .15s; overflow: hidden; }
      .inv-input-icon { position: absolute; left: 10px; flex-shrink: 0; }
      .inv-input { width: 100%; height: 40px; padding: 0 10px 0 30px; border: none; outline: none; background: transparent; font-size: 13px; color: #0F172A; font-family: inherit; }
      .inv-input::placeholder { color: #CBD5E1; }

      .inv-strength { display: flex; align-items: center; gap: 8px; margin-top: 4px; overflow: hidden; }
      .inv-strength-bars { display: flex; gap: 4px; flex: 1; }
      .inv-strength-bar { flex: 1; height: 3px; border-radius: 2px; }

      .inv-error-box { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 10px; background: #FEF2F2; border: 1px solid #FECACA; font-size: 12px; color: #DC2626; }
      .inv-submit { height: 46px; border-radius: 12px; background: linear-gradient(135deg,#2563EB,#1D4ED8); color: white; border: none; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 700; box-shadow: 0 4px 16px rgba(37,99,235,.4); }
      .inv-submit:disabled { opacity: .65; cursor: not-allowed; }
      .inv-submit-inner { display: flex; align-items: center; justify-content: center; gap: 8px; }

      .inv-mention { font-size: 11px; color: #94A3B8; text-align: center; line-height: 1.6; }
      .inv-link { color: #2563EB; text-decoration: none; }
      .inv-link:hover { text-decoration: underline; }

      /* Responsive */
      @media (max-width: 900px) {
        .inv-left { display: none; }
        .inv-right { width: 100%; box-shadow: none; }
        .inv-right-inner { padding: 28px 20px; }
        .inv-center { padding: 16px; }
      }
      @media (max-width: 480px) {
        .inv-row-2 { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}
