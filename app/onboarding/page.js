"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  Code2,
  Globe,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Phone,
} from "lucide-react";
import styles from "@/app/styles/auth-flow.module.css";
import AuthThemeBar from "@/components/auth/AuthThemeBar";

const ROLES = [
  {
    id: "student",
    label: "Student",
    desc: "Managing assignments, exams & hackathons",
    icon: GraduationCap,
  },
  {
    id: "professional",
    label: "Professional",
    desc: "Work tasks, meetings & client deadlines",
    icon: Briefcase,
  },
  {
    id: "developer",
    label: "Developer",
    desc: "Side projects, sprints & coding contests",
    icon: Code2,
  },
];

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST, UTC+5:30)" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)" },
  { value: "America/New_York", label: "Eastern Time (ET, UTC-5)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT, UTC-8)" },
  { value: "America/Chicago", label: "Central Time (CT, UTC-6)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT, UTC+0)" },
  { value: "Europe/Paris", label: "Central European Time (CET, UTC+1)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST, UTC+9)" },
  {
    value: "Australia/Sydney",
    label: "Australian Eastern Time (AEST, UTC+10)",
  },
];

const stepVariants = {
  enter: { opacity: 0, x: 24 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedTimezone, setSelectedTimezone] = useState("Asia/Kolkata");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFinish = async () => {
    if (!selectedRole || !selectedTimezone) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          role: selectedRole,
          timezone: selectedTimezone,
          whatsappNumber: whatsappNumber ? whatsappNumber : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save preferences");
      setStep(3);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <AuthThemeBar />
      <div className={styles.pageInner}>
        <div className={styles.progressWrap}>
          <div className={styles.progressMeta}>
            <span className={styles.eyebrow}>
              {step < 3 ? `Step ${step} of 2` : "Complete"}
            </span>
            <span className={styles.progressLabel}>
              {step === 1
                ? "Your role"
                : step === 2
                  ? "Your timezone"
                  : "All set"}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: step === 1 ? "50%" : "100%" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
        </div>

        <div className={styles.card}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={styles.cardStep}
              >
                <h1 className={styles.stepTitle}>What best describes you?</h1>
                <p className={styles.stepDesc}>
                  This helps us personalise your RemindKaro experience.
                </p>

                <div className={styles.roleList}>
                  {ROLES.map(({ id, label, desc, icon: Icon }) => {
                    const selected = selectedRole === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedRole(id)}
                        className={[
                          styles.roleOption,
                          selected ? styles.roleOptionSelected : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <div className={styles.roleIconWrap}>
                          <Icon size={20} aria-hidden />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className={styles.roleLabel}>{label}</div>
                          <div className={styles.roleDesc}>{desc}</div>
                        </div>
                        {selected && (
                          <CheckCircle2
                            size={20}
                            className={styles.roleCheck}
                            aria-hidden
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedRole}
                  className={styles.btnPrimary}
                >
                  Continue <ArrowRight size={18} aria-hidden />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={styles.cardStep}
              >
                <h1 className={styles.stepTitle}>Your timezone</h1>
                <p className={styles.stepDesc}>
                  We use this to send deadline alerts at the right time.
                </p>

                <div className={styles.selectWrap}>
                  <Globe size={16} className={styles.selectIcon} aria-hidden />
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className={styles.select}
                    aria-label="Select your timezone"
                  >
                    {TIMEZONES.map((tz) => (
                      <option
                        key={tz.value}
                        value={tz.value}
                        style={{
                          background: "var(--linear-surface-1)",
                          color: "var(--linear-ink)",
                        }}
                      >
                        {tz.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className={styles.selectChevron}
                    aria-hidden
                  />
                </div>

                <div className={styles.hintBox}>
                  <Clock
                    size={16}
                    style={{ color: "var(--linear-primary)", flexShrink: 0 }}
                    aria-hidden
                  />
                  <span>
                    Your current selection:{" "}
                    <strong>{selectedTimezone.replace("_", " ")}</strong>
                  </span>
                </div>

                {/* Optional WhatsApp Number field */}
                <div style={{ marginTop: "24px" }}>
                  <label
                    className={styles.progressLabel}
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      textAlign: "left",
                      color: "var(--linear-ink-muted)",
                      fontSize: "13px",
                    }}
                  >
                    WhatsApp Number (Optional)
                  </label>
                  <div className={styles.selectWrap}>
                    <Phone
                      size={16}
                      className={styles.selectIcon}
                      style={{ color: "var(--linear-primary)" }}
                      aria-hidden
                    />
                    <input
                      type="text"
                      placeholder="e.g. 919876543210 (with country code)"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className={styles.select}
                      style={{
                        cursor: "text",
                        paddingLeft: "44px",
                        paddingRight: "16px",
                      }}
                      aria-label="Enter WhatsApp Number"
                    />
                  </div>
                  <p
                    className={styles.stepDesc}
                    style={{
                      fontSize: "12px",
                      marginTop: "8px",
                      marginBottom: 0,
                    }}
                  >
                    Provide country code (e.g., 91 for India, 1 for US) with no
                    plus (+), spaces, or dashes.
                  </p>
                </div>

                {error && (
                  <div className={styles.errorBox} role="alert">
                    {error}
                  </div>
                )}

                <div className={styles.actionsRow}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={styles.btnSecondary}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    disabled={loading}
                    className={[styles.btnPrimary, styles.btnPrimaryFlex2]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {loading ? (
                      <span className={styles.spinner} aria-label="Saving" />
                    ) : (
                      <>
                        Finish Setup <ArrowRight size={18} aria-hidden />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "backOut" }}
                className={styles.successStep}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.1,
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className={styles.successIcon}
                >
                  <CheckCircle2 size={36} aria-hidden />
                </motion.div>
                <h2 className={styles.successTitle}>You&apos;re all set!</h2>
                <p className={styles.successDesc}>
                  Taking you to your dashboard…
                </p>
                <div className={styles.successBar}>
                  <motion.div
                    className={styles.successBarFill}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
