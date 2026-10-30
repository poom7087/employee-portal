import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  LoaderCircle,
  Search,
} from "lucide-react";
import { api } from "./api";
import type { Change, Profile } from "./types";
import { Sidebar } from "./components/Sidebar";
import { ProfileHeader } from "./components/ProfileHeader";
import { ContactCard } from "./components/ContactCard";
import { SkillsCard } from "./components/SkillsCard";
import { HistoryCard } from "./components/HistoryCard";

function applyDemoIdentity(profile: Profile): Profile {
  if (
    profile.id !== "demo-employee" ||
    profile.firstName !== "Alex" ||
    profile.lastName !== "Morgan"
  ) {
    return profile;
  }

  return {
    ...profile,
    firstName: "Puripong",
    lastName: "Puhual",
    contact: {
      ...profile.contact,
      address:
        profile.contact.address === "Bangkok, Thailand"
          ? "Khon Kaen, Thailand"
          : profile.contact.address,
    },
  };
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [history, setHistory] = useState<Change[]>([]);
  const [retention, setRetention] = useState(7);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const refreshHistory = async () => {
    const h = await api.history();
    setHistory(h.items);
    setRetention(h.retentionDays);
  };
  useEffect(() => {
    Promise.all([api.profile(), api.skills(), api.history()])
      .then(([p, s, h]) => {
        setProfile(applyDemoIdentity(p));
        setSkills(s);
        setHistory(h.items);
        setRetention(h.retentionDays);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  };
  const save = async (contact: Profile["contact"]) => {
    if (!profile) return;
    setSaving(true);
    try {
      const next = await api.update({ contact, skills: profile.skills });
      setProfile(applyDemoIdentity(next));
      await refreshHistory();
      notify("Your contact details have been saved.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to save changes.");
      throw e;
    } finally {
      setSaving(false);
    }
  };
  const selectSkills = async (nextSkills: string[]) => {
    if (!profile) return;
    const previous = profile;
    setProfile({ ...profile, skills: nextSkills });
    try {
      const next = await api.update({
        contact: profile.contact,
        skills: nextSkills,
      });
      setProfile(applyDemoIdentity(next));
      await refreshHistory();
      notify("Your skills have been updated.");
    } catch (e) {
      setProfile(previous);
      notify(e instanceof Error ? e.message : "Unable to update skills.");
    }
  };
  const upload = async (file: File) => {
    if (!profile) return;
    if (!file.type.startsWith("image/")) {
      notify("Choose an image file to upload.");
      return;
    }
    try {
      const next = await api.photo(file);
      setProfile(applyDemoIdentity(next));
      await refreshHistory();
      notify("Your profile photo has been updated.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Unable to upload photo.");
    }
  };
  if (loading)
    return (
      <div className="loading-screen">
        <LoaderCircle className="spin" />
        <span>Loading your workspace…</span>
      </div>
    );
  if (error || !profile)
    return (
      <div className="error-screen">
        <div className="error-card">
          <div className="error-mark">!</div>
          <h2>We couldn’t load your profile</h2>
          <p>{error || "Please make sure the API and MongoDB are running."}</p>
          <button className="primary" onClick={() => window.location.reload()}>
            Try again
          </button>
          <small>
            Check that the Go API is available on port 8080 and MongoDB is
            running.
          </small>
        </div>
      </div>
    );
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <b>My profile</b>
          </div>
          <div className="top-actions">
            <button className="search-button">
              <Search size={16} />
              <span>Search</span>
              <kbd>⌘ K</kbd>
            </button>
            <button className="help-button" aria-label="Help">
              <CircleHelp size={18} />
            </button>
            <button className="notification-button" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <div className="top-avatar">PP</div>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR SPACE</div>
              <h1>My profile</h1>
              <p>
                Manage your personal details and let your work speak for itself.
              </p>
            </div>
            <div className="updated-label">
              <span className="live-dot" /> Profile up to date
            </div>
          </div>
          <ProfileHeader profile={profile} onPhoto={upload} />
          <div className="content-grid">
            <div className="left-column">
              <ContactCard
                contact={profile.contact}
                onSave={save}
                loading={saving}
              />
              <SkillsCard
                skills={skills}
                selected={profile.skills}
                onChange={selectSkills}
              />
            </div>
            <div className="right-column">
              <HistoryCard items={history} retentionDays={retention} />
              <div className="privacy-card">
                <div className="privacy-art">
                  <div className="privacy-ring ring-a" />
                  <div className="privacy-ring ring-b" />
                  <span>✦</span>
                </div>
                <div>
                  <b>Your profile, your choice.</b>
                  <p>Your personal details are only shared with your team.</p>
                </div>
                <ChevronRight size={17} />
              </div>
            </div>
          </div>
          <footer className="page-footer">
            <span>© 2025 Peopleflow</span>
            <span>
              Made for better work <i>✦</i>
            </span>
            <span>Privacy · Terms</span>
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      )}
    </div>
  );
}
