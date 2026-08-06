"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { User, Mail, Lock, ArrowRight, Shield, Cpu, Bell } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/app/styles/auth-flow.module.css";
import BrandLogo from "@/components/ui/BrandLogo";
import dynamic from "next/dynamic";

const AuthThemeBar = dynamic(() => import("@/components/auth/AuthThemeBar"), {
  ssr: false,
});

const PERKS = [
  { icon: Bell, label: "Smart urgency escalation" },
  { icon: Cpu, label: "Voice-powered task entry" },
  { icon: Shield, label: "End-to-end encrypted" },
];

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (loginRes.ok) {
        router.push("/onboarding");
        router.refresh();
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <AuthThemeBar />
      <motion.div
        className={`${styles.authShell} ${styles.pageInnerWide}`}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className={`${styles.brandPanel} ${styles.brandPanelCompact}`}>
          <div>
            <BrandLogo href="/" size="sm" className={styles.logoLink} />
            <h1 className={styles.brandTitle}>
              Join the most
              <br />
              organized students.
            </h1>
            <p className={styles.brandDesc}>
              Create an account for free and never miss another coding test or
              assignment.
            </p>

            <div className={styles.perkList}>
              {PERKS.map(({ icon: Icon, label }) => (
                <div key={label} className={styles.perkItem}>
                  <span className={styles.perkIcon}>
                    <Icon size={18} aria-hidden />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formInner}>
            <h2 className={styles.formTitle}>Create an account</h2>
            <p className={styles.formDesc}>
              Start tracking your deadlines intelligently.
            </p>

            {error && (
              <div className={styles.alertBox} role="alert">
                <span className={styles.alertDot} aria-hidden />
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleSignup}>
              <Input
                id="name"
                label="Full Name"
                type="text"
                placeholder="e.g., Alex Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                icon={<User size={16} />}
                theme="dark"
              />
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={16} />}
                theme="dark"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock size={16} />}
                theme="dark"
              />

              <button
                type="submit"
                disabled={loading}
                className={styles.btnPrimary}
                style={{ marginTop: "var(--space-2)" }}
              >
                {loading ? (
                  <span
                    className={styles.spinner}
                    aria-label="Creating account"
                  />
                ) : (
                  <>
                    Create Account <ArrowRight size={18} aria-hidden />
                  </>
                )}
              </button>
            </form>

            <div className={styles.formFooter}>
              <span className={styles.formFooterText}>
                Already have an account?{" "}
              </span>
              <Link href="/login" className={styles.formFooterLink}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
