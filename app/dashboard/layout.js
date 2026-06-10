"use client";
import styles from "./layout.module.css";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import BrandLogo from "@/components/ui/BrandLogo";
import packageJson from "@/package.json";

const ThemeToggle = dynamic(() => import("@/components/ui/ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div style={{ width: 44, height: 24 }} className="toggle-placeholder" />
  ),
});

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
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

        <nav className={styles.nav}>
          <Link
            href="/dashboard"
            className={`${styles.navLink} ${pathname === "/dashboard" ? styles.active : ""}`}
          >
            <span className={styles.navLinkFull}>Dashboard</span>
            <span className={styles.navLinkShort} aria-hidden>
              Home
            </span>
          </Link>
          <Link
            href="/dashboard/profile"
            className={`${styles.navLink} ${pathname === "/dashboard/profile" ? styles.active : ""}`}
          >
            <span className={styles.navLinkFull}>Profile</span>
            <span className={styles.navLinkShort} aria-hidden>
              Me
            </span>
          </Link>
          <Link
            href="/dashboard/support"
            className={`${styles.navLink} ${pathname.startsWith("/dashboard/support") ? styles.active : ""}`}
          >
            <span className={styles.navLinkFull}>Support</span>
            <span className={styles.navLinkShort} aria-hidden>
              Help
            </span>
          </Link>
          <Link
            href="/pricing"
            className={`${styles.navLink} ${pathname === "/pricing" ? styles.active : ""}`}
          >
            <span className={styles.navLinkFull}>Pricing</span>
            <span className={styles.navLinkShort} aria-hidden>
              Pro
            </span>
          </Link>
          <ThemeToggle compact />
          <div className={styles.navDivider} />
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sign out
          </button>
        </nav>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <span className={styles.version}>
          v{packageJson.version}
        </span>
      </footer>
    </div>
  );
}
