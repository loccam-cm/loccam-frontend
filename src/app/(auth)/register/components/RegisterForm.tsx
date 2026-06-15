"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { AuthResponse } from "@/types";
import UploadFichier from "@/components/UploadFichier";
import {
  IconBuilding,
  IconUser,
  IconMail,
  IconLock,
  IconPhone,
  IconMapPin,
  IconRocket,
  IconCalendar,
  IconUsers,
  IconArrowRight,
  IconIdBadge,
  IconShieldCheck,
} from "@tabler/icons-react";

const VILLES = [
  "Douala",
  "Yaoundé",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Ngaoundéré",
  "Bertoua",
  "Ebolowa",
  "Buea",
  "Autre",
];

export default function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    password: "",
  });
  const [focuses, setFocuses] = useState<Record<string, boolean>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/inscription/", {
        ...form,
        role: "bailleur",
        langue: "fr",
        password2: form.password,
      });
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Bienvenue sur LocCam !");
      router.push("/bailleur");
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, string[]> } };
      const msg = error.response?.data
        ? Object.values(error.response.data).flat()[0]
        : "Erreur lors de l'inscription.";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="rg-right"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Header ───────────────────────────────────────── */}
      <div className="rg-form-header">
        <Link href="/landing" className="rg-logo">
          <div className="rg-logo-icon">
            <IconBuilding size={15} color="white" />
          </div>
          <div>
            <div className="rg-logo-name">LocCam</div>
            <div className="rg-logo-sub">Gestion locative camerounaise</div>
          </div>
        </Link>
        <div className="rg-header-actions">
          <a href="tel:+237699000000" className="rg-header-btn">
            <IconPhone size={12} />
            <span>+237 699 000 000</span>
          </a>
          <a href="#" className="rg-header-btn">
            <IconCalendar size={12} />
            <span>Démo</span>
          </a>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="rg-form-body">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.55 }}
        >
          <h1 className="rg-title">Créer mon compte bailleur</h1>
          <p className="rg-subtitle">
            Déjà inscrit ?{" "}
            <Link href="/login" className="rg-link">
              Se connecter
            </Link>
          </p>
        </motion.div>

        {/* CTA locataire */}
        <motion.button
          type="button"
          onClick={() => router.push("/je-suis-locataire")}
          className="rg-locataire-cta"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.5 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="rg-locataire-left">
            <div className="rg-locataire-icon">
              <IconUsers size={15} style={{ color: "#64748B" }} />
            </div>
            <div>
              <div className="rg-locataire-title">Vous êtes locataire ?</div>
              <div className="rg-locataire-sub">
                Cliquez ici pour en savoir plus
              </div>
            </div>
          </div>
          <IconArrowRight size={15} style={{ color: "#94A3B8" }} />
        </motion.button>

        {/* ── Formulaire ────────────────────────────────── */}
        <motion.form
          onSubmit={handleSubmit}
          className="rg-form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46, duration: 0.55 }}
        >
          {/* Prénom + Nom */}
          <div className="rg-row-2">
            {["prenom", "nom"].map((k) => (
              <div key={k} className="rg-field">
                <label className="rg-label">
                  {k === "prenom" ? "Prénom" : "Nom"}{" "}
                  <span className="rg-req">*</span>
                </label>
                <div
                  className="rg-input-wrap"
                  style={{ borderColor: focuses[k] ? "#1A3C5E" : "#E2E8F0" }}
                >
                  <IconUser
                    size={13}
                    className="rg-input-icon"
                    style={{ color: focuses[k] ? "#1A3C5E" : "#94A3B8" }}
                  />
                  <input
                    type="text"
                    required
                    value={form[k as keyof typeof form]}
                    onChange={(e) => set(k, e.target.value)}
                    onFocus={() => focus(k, true)}
                    onBlur={() => focus(k, false)}
                    placeholder={k === "prenom" ? "Vicens" : "Kenmatio"}
                    className="rg-input"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="rg-field">
            <label className="rg-label">
              Email <span className="rg-req">*</span>
            </label>
            <div
              className="rg-input-wrap"
              style={{ borderColor: focuses["email"] ? "#1A3C5E" : "#E2E8F0" }}
            >
              <IconMail
                size={13}
                className="rg-input-icon"
                style={{ color: focuses["email"] ? "#1A3C5E" : "#94A3B8" }}
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onFocus={() => focus("email", true)}
                onBlur={() => focus("email", false)}
                placeholder="votre@email.cm"
                className="rg-input"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="rg-field">
            <label className="rg-label">
              Téléphone <span className="rg-req">*</span>
            </label>
            <div className="rg-phone-row">
              <div className="rg-phone-prefix">
                <IconMapPin size={12} style={{ color: "#64748B" }} />
                +237
              </div>
              <div
                className="rg-input-wrap"
                style={{
                  flex: 1,
                  borderColor: focuses["tel"] ? "#1A3C5E" : "#E2E8F0",
                }}
              >
                <IconPhone
                  size={13}
                  className="rg-input-icon"
                  style={{ color: focuses["tel"] ? "#1A3C5E" : "#94A3B8" }}
                />
                <input
                  type="tel"
                  required
                  value={form.telephone}
                  onChange={(e) => set("telephone", e.target.value)}
                  onFocus={() => focus("tel", true)}
                  onBlur={() => focus("tel", false)}
                  placeholder="6XX XXX XXX"
                  className="rg-input"
                />
              </div>
            </div>
            <span className="rg-hint">Numéro Orange Money ou MTN Money</span>
          </div>

          {/* Ville */}
          <div className="rg-field">
            <label className="rg-label">
              Ville <span className="rg-req">*</span>
            </label>
            <div
              className="rg-input-wrap"
              style={{ borderColor: focuses["ville"] ? "#1A3C5E" : "#E2E8F0" }}
            >
              <IconMapPin
                size={13}
                className="rg-input-icon"
                style={{ color: focuses["ville"] ? "#1A3C5E" : "#94A3B8" }}
              />
              <select
                required
                value={form.ville}
                onChange={(e) => set("ville", e.target.value)}
                onFocus={() => focus("ville", true)}
                onBlur={() => focus("ville", false)}
                className="rg-input rg-select"
                style={{ color: form.ville ? "#0F172A" : "#94A3B8" }}
              >
                <option value="" disabled>
                  Sélectionnez votre ville…
                </option>
                {VILLES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="rg-field">
            <label className="rg-label">
              Mot de passe <span className="rg-req">*</span>
            </label>
            <div
              className="rg-input-wrap"
              style={{ borderColor: focuses["pass"] ? "#1A3C5E" : "#E2E8F0" }}
            >
              <IconLock
                size={13}
                className="rg-input-icon"
                style={{ color: focuses["pass"] ? "#1A3C5E" : "#94A3B8" }}
              />
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                onFocus={() => focus("pass", true)}
                onBlur={() => focus("pass", false)}
                placeholder="Min. 8 caractères"
                className="rg-input"
              />
            </div>
            <AnimatePresence>
              {form.password.length > 0 && (
                <motion.div
                  className="rg-strength"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="rg-strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        className="rg-strength-bar"
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
                    className="rg-strength-label"
                    style={{
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

          {/* CNI */}
          <div className="rg-field">
            <label className="rg-label">
              Carte Nationale d&apos;Identité
              <span className="rg-optional"> (pour publier des biens)</span>
            </label>

            <div
              style={{
                border: "2px solid #E2E8F0",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#FAFAFA",
              }}
            >
              {/* Header CNI */}
              <div
                style={{
                  background: "linear-gradient(135deg,#1A3C5E,#2563EB)",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconIdBadge size={24} color="white" />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "white",
                      marginBottom: "2px",
                    }}
                  >
                    Carte Nationale d&apos;Identité camerounaise
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.65)",
                    }}
                  >
                    Document officiel requis pour publier vos biens
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "100px",
                    background: "rgba(255,255,255,0.15)",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  <IconShieldCheck size={11} />
                  Sécurisé
                </div>
              </div>

              {/* Mockup CNI */}
              <div style={{ padding: "14px 16px 0" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#94A3B8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Exemple de document accepté
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  {["Recto", "Verso"].map((side) => (
                    <div
                      key={side}
                      style={{
                        background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)",
                        border: "1.5px dashed #93C5FD",
                        borderRadius: "10px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <IconIdBadge size={20} style={{ color: "#2563EB" }} />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#1D4ED8",
                        }}
                      >
                        {side}
                      </span>
                      <span style={{ fontSize: "10px", color: "#60A5FA" }}>
                        Face {side === "Recto" ? "avant" : "arrière"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Zone upload */}
              <div style={{ padding: "0 16px 16px" }}>
                <UploadFichier
                  typeDocument="cni"
                  description="Recto + Verso · JPG, PNG, PDF · Max 5 Mo"
                  onSuccess={() => toast.success("CNI uploadée avec succès !")}
                  onError={(err) => toast.error(err)}
                />
              </div>

              {/* Footer info */}
              <div
                style={{
                  borderTop: "1px solid #E2E8F0",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  background: "#F8FAFC",
                }}
              >
                <IconLock
                  size={12}
                  style={{ color: "#7C3AED", flexShrink: 0, marginTop: "1px" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#7C3AED",
                      marginBottom: "1px",
                    }}
                  >
                    Fichier privé et sécurisé
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94A3B8",
                      lineHeight: 1.5,
                    }}
                  >
                    Vérification par notre équipe sous 24h. Vous pouvez
                    compléter cela après l&apos;inscription.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CGU */}
          <label className="rg-cgu">
            <input type="checkbox" required className="rg-checkbox" />
            <span>
              Je valide les{" "}
              <a href="#" className="rg-link">
                CGU
              </a>{" "}
              et les{" "}
              <a href="#" className="rg-link">
                CGV
              </a>{" "}
              de LocCam.
            </span>
          </label>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="rg-submit"
            whileHover={loading ? {} : { scale: 1.01 }}
            whileTap={loading ? {} : { scale: 0.99 }}
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rg-submit-content"
                >
                  <div className="rg-spinner" />
                  Création en cours...
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rg-submit-content"
                >
                  <IconRocket size={15} />
                  Créer mon compte bailleur
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.form>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="rg-form-footer">
        {["Se connecter", "Voir nos offres", "Aide"].map((l) => (
          <a key={l} href="#" className="rg-footer-link">
            {l}
          </a>
        ))}
      </div>
    </motion.div>
  );
}
