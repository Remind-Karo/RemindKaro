"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import {
  User,
  Mail,
  Shield,
  Phone,
  Globe,
  Calendar,
  Crown,
  Clock,
  ArrowRight,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";

const ROLES = ["Student", "Professional", "Developer", "Freelancer"];

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

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [timezone, setTimezone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setName(data.user.name || "");
          setRole(data.user.role || "");
          setTimezone(data.user.timezone || "Asia/Kolkata");
          setWhatsappNumber(data.user.whatsappNumber || "");
        } else {
          setError("Failed to fetch user data");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess("");
    setSaveError("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          timezone,
          whatsappNumber: whatsappNumber || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      setUser(data.user);
      setName(data.user.name || "");
      setRole(data.user.role || "");
      setTimezone(data.user.timezone || "Asia/Kolkata");
      setWhatsappNumber(data.user.whatsappNumber || "");
      setIsEditing(false);
      setSaveSuccess("Profile updated successfully!");
      setTimeout(() => setSaveSuccess(""), 4000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setRole(user.role || "");
      setTimezone(user.timezone || "Asia/Kolkata");
      setWhatsappNumber(user.whatsappNumber || "");
    }
    setIsEditing(false);
    setSaveError("");
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !user) {
    return (
      <div className={styles.container}>
        <p>Error: {error}</p>
      </div>
    );
  }

  const isPro = user.plan && user.plan !== "free";
  const planName = user.plan ? user.plan.replace("_", " ") : "free";

  return (
    <div className={styles.container}>
      <p className={styles.pageEyebrow}>Profile & Settings</p>
      <h1 className={styles.pageTitle}>Your Profile</h1>

      {/* Success Alert Banner */}
      {saveSuccess && (
        <div className={styles.toast} role="status">
          <CheckCircle2 size={20} style={{ color: "#10b981" }} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Error Alert Banner */}
      {saveError && (
        <div className={styles.errorToast} role="alert">
          <AlertCircle size={20} style={{ color: "#ef4444" }} />
          <span>{saveError}</span>
        </div>
      )}

      <div className={styles.planCard}>
        <div className={styles.planHeader}>
          <h2 className={styles.planName}>
            {isPro ? (
              <Crown size={28} className={styles.cardTitleIcon} />
            ) : (
              <User size={28} className={styles.cardTitleIcon} />
            )}
            {planName} Plan
          </h2>
          <span
            className={`${styles.planBadge} ${!isPro ? styles.planBadgeFree : ""}`}
          >
            {isPro ? "PRO" : "FREE"}
          </span>
        </div>

        <div className={styles.planDetails}>
          {isPro ? (
            <>
              <p>You are enjoying all the premium features of RemindKaro.</p>
              {user.planExpiresAt && (
                <p className={styles.planExpiry}>
                  <Clock size={16} />
                  Plan expires on:{" "}
                  {new Date(user.planExpiresAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </>
          ) : (
            <>
              <p>You are currently on the free plan with limited features.</p>
              <Link href="/pricing" className={styles.upgradeBtn}>
                Upgrade to Pro <ArrowRight size={18} />
              </Link>
            </>
          )}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Shield size={24} className={styles.cardTitleIcon} />
            Personal Information
          </h2>
          {isEditing ? (
            <div className={styles.actionsGroup}>
              <button
                onClick={handleCancel}
                className={styles.cancelBtn}
                disabled={isSaving}
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveBtn}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span
                    className={styles.spinner}
                    style={{
                      width: "16px",
                      height: "16px",
                      borderWidth: "2px",
                      marginRight: "4px",
                    }}
                  />
                ) : (
                  <Save size={16} />
                )}
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editProfileBtn}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <User size={14} /> Name
            </span>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.editInput}
                placeholder="Your display name"
                disabled={isSaving}
              />
            ) : (
              <span className={styles.infoValue}>{user.name || "—"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Mail size={14} /> Email
            </span>
            <span className={styles.infoValue}>{user.email}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Shield size={14} /> Role
            </span>
            {isEditing ? (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.editSelect}
                disabled={isSaving}
              >
                <option value="">Select Role</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>{user.role || "—"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Phone size={14} /> WhatsApp Number
            </span>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className={styles.editInput}
                  placeholder="e.g. 919876543210 (with country code)"
                  disabled={isSaving}
                />
                <div className={styles.helperText}>
                  Include country code (e.g., 91 for India, 1 for US) with no
                  plus (+), spaces, or dashes.
                </div>
              </div>
            ) : (
              <span className={styles.infoValue}>
                {user.whatsappNumber ? `+${user.whatsappNumber}` : "—"}
              </span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Globe size={14} /> Timezone
            </span>
            {isEditing ? (
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={styles.editSelect}
                disabled={isSaving}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className={styles.infoValue}>{user.timezone || "—"}</span>
            )}
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>
              <Calendar size={14} /> Joined
            </span>
            <span className={styles.infoValue}>
              {new Date(user.createdAt).toLocaleDateString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Shield size={24} className={styles.cardTitleIcon} />
            Security
          </h2>
        </div>
        <div className={styles.securitySection}>
          <p className={styles.securityText}>
            Found a security vulnerability? We take security seriously.
            Please report it responsibly.
          </p>
          <a
            href="mailto:security@remindkro.in"
            className={styles.securityLink}
          >
            Report Security Issue
          </a>
        </div>
      </div>
    </div>
  );
}
