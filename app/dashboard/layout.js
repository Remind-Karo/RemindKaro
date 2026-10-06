"use client";
import { useState, useEffect } from "react";
import styles from "./layout.module.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/ui/BrandLogo";
import { useHoverSound } from "@/components/hooks/useHoverSound";

const ThemeToggle = dynamic(() => import("@/components/ui/ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div style={{ width: 44, height: 24 }} className="toggle-placeholder" />
  ),
});

const SoundToggle = dynamic(() => import("@/components/ui/SoundToggle"), {
  ssr: false,
  loading: () => (
    <div style={{ width: 44, height: 24 }} className="toggle-placeholder" />
  ),
});

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const playHoverSound = useHoverSound();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dashboard-nav-open", open);
    return () => document.body.classList.remove("dashboard-nav-open");
  }, [open]);

  // Close mobile nav on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <BrandLogo href="/dashboard" size="sm" className={styles.logo} />

        <div className={styles.actions}>
          <nav
            className={`${styles.nav} ${open ? styles.isOpen : ""}`}
            aria-label="Dashboard navigation"
          >
            <Link
              href="/dashboard"
              onMouseEnter={playHoverSound}
              className={`${styles.navLink} ${pathname === "/dashboard" ? styles.active : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.navLinkFull}>Dashboard</span>
              <span className={styles.navLinkShort} aria-hidden>
                Home
              </span>
            </Link>
            <Link
              href="/dashboard/profile"
              onMouseEnter={playHoverSound}
              className={`${styles.navLink} ${pathname === "/dashboard/profile" ? styles.active : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.navLinkFull}>Profile</span>
              <span className={styles.navLinkShort} aria-hidden>
                Me
              </span>
            </Link>
            <Link
              href="/dashboard/support"
              onMouseEnter={playHoverSound}
              className={`${styles.navLink} ${pathname.startsWith("/dashboard/support") ? styles.active : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.navLinkFull}>Support</span>
              <span className={styles.navLinkShort} aria-hidden>
                Help
              </span>
            </Link>
            <Link
              href="/pricing"
              onMouseEnter={playHoverSound}
              className={`${styles.navLink} ${pathname === "/pricing" ? styles.active : ""}`}
              onClick={() => setOpen(false)}
            >
              <span className={styles.navLinkFull}>Pricing</span>
              <span className={styles.navLinkShort} aria-hidden>
                Pro
              </span>
            </Link>
            <div className={styles.mobileToggles}>
              <ThemeToggle compact />
              <SoundToggle compact />
            </div>
            <div className={styles.navDivider} />
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Sign out
            </button>
          </nav>
          <div className={styles.desktopToggles}>
            <ThemeToggle compact />
            <SoundToggle compact />
          </div>
          <button
            type="button"
            className={styles.menuBtn}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
