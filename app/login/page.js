"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import styles from "@/app/styles/auth-flow.module.css";
import BrandLogo from "@/components/ui/BrandLogo";
import dynamic from "next/dynamic";

const AuthThemeBar = dynamic(() => import("@/components/auth/AuthThemeBar"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      if (!data.user?.onboardingCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
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
              Pick up where you
              <br />
              left off.
            </h1>
            <p className={styles.brandDesc}>
              Log in to manage your deadlines, track your hackathons, and ace
              those interviews.
            </p>
          </div>

          <div className={styles.quoteCard}>
            <div className={styles.quoteStars} aria-hidden>
              ★★★★★
            </div>
            <p className={styles.quoteText}>
              &quot;RemindKaro changed how I manage my hackathon deadlines. I
              haven&apos;t missed a single submission.&quot;
            </p>
            <p className={styles.quoteAuthor}>Rahul S., CS Student</p>
          </div>
        </div>

        <div className={styles.formPanel}>
          <div className={styles.formInner}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formDesc}>Enter your details to sign in.</p>

            {error && (
              <div className={styles.alertBox} role="alert">
                <span className={styles.alertDot} aria-hidden />
                {error}
              </div>
            )}

            <form className={styles.form} onSubmit={handleLogin}>
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="name@company.com"
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
              <div className={styles.forgotLink}>
                <Link href="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={styles.btnPrimary}
                style={{ marginTop: "var(--space-2)" }}
              >
                {loading ? (
                  <span className={styles.spinner} aria-label="Signing in" />
                ) : (
                  <>
                    Sign In <ArrowRight size={18} aria-hidden />
                  </>
                )}
              </button>
            </form>

            <div className={styles.formFooter}>
              <span className={styles.formFooterText}>
                Don&apos;t have an account?{" "}
              </span>
              <Link href="/signup" className={styles.formFooterLink}>
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
