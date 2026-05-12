import React, { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

/* ─────────────────────────────────────────────
   Inline styles — no Tailwind / DaisyUI needed
   (existing classes can coexist harmlessly)
───────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Syne:wght@400;500;600;700&display=swap');

  :root {
    --ink:       #0d0d12;
    --surface:   #13131a;
    --panel:     #18181f;
    --border:    rgba(255,255,255,0.07);
    --accent:    #7c6ef7;
    --accent2:   #a78bfa;
    --gold:      #e2b96f;
    --muted:     #5a5870;
    --soft:      #9d9bb8;
    --white:     #f0effe;
    --success:   #4ade80;
    --error:     #f87171;
  }

  .ep-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ink);
    padding: 40px 20px;
    font-family: 'Syne', sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Ambient background orbs */
  .ep-root::before, .ep-root::after {
    content: '';
    position: fixed;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    z-index: 0;
  }
  .ep-root::before {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(124,110,247,0.12) 0%, transparent 70%);
    top: -200px; left: -150px;
  }
  .ep-root::after {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(226,185,111,0.08) 0%, transparent 70%);
    bottom: -150px; right: -100px;
  }

  /* ── Wrapper ── */
  .ep-wrapper {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: 480px 360px;
    gap: 28px;
    align-items: start;
    animation: epIn 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes epIn {
    from { opacity:0; transform: translateY(32px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── Form Panel ── */
  .ep-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(124,110,247,0.06),
      0 40px 80px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.05);
  }

  /* Panel header */
  .ep-header {
    padding: 32px 36px 24px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .ep-header::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 36px; right: 36px;
    height: 1px;
    background: linear-gradient(90deg, var(--accent), transparent);
    opacity: 0.4;
  }
  .ep-eyebrow {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent2);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .ep-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 32px;
    font-weight: 700;
    color: var(--white);
    line-height: 1.1;
    margin: 0;
  }
  .ep-subtitle {
    font-size: 13px;
    color: var(--muted);
    margin-top: 6px;
    font-weight: 400;
  }

  /* Form body */
  .ep-body {
    padding: 28px 36px 36px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Field row */
  .ep-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .ep-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .ep-field.full { grid-column: 1 / -1; }

  .ep-label {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--soft);
  }

  .ep-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 11px 16px;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    color: var(--white);
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    width: 100%;
    box-sizing: border-box;
  }
  .ep-input:focus {
    border-color: var(--accent);
    background: rgba(124,110,247,0.07);
    box-shadow: 0 0 0 3px rgba(124,110,247,0.12);
  }
  .ep-input::placeholder { color: var(--muted); }

  textarea.ep-input {
    resize: vertical;
    min-height: 80px;
    line-height: 1.6;
  }

  /* Gender selector */
  .ep-gender-group {
    display: flex;
    gap: 8px;
  }
  .ep-gender-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.18s;
  }
  .ep-gender-btn.active {
    background: rgba(124,110,247,0.15);
    border-color: var(--accent);
    color: var(--accent2);
    box-shadow: 0 0 0 2px rgba(124,110,247,0.12);
  }
  .ep-gender-btn:hover:not(.active) {
    background: rgba(255,255,255,0.06);
    color: var(--soft);
  }

  /* Skills tags input */
  .ep-skills-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 10px 14px;
    min-height: 48px;
    align-items: center;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ep-skills-wrap:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,110,247,0.12);
  }
  .ep-skill-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(124,110,247,0.15);
    border: 1px solid rgba(124,110,247,0.3);
    color: var(--accent2);
    font-size: 12px;
    font-weight: 600;
    padding: 3px 10px 3px 12px;
    border-radius: 100px;
    white-space: nowrap;
  }
  .ep-skill-remove {
    background: none; border: none; cursor: pointer;
    color: var(--accent2); opacity: 0.6;
    padding: 0; line-height: 1; font-size: 14px;
    transition: opacity 0.15s;
  }
  .ep-skill-remove:hover { opacity: 1; }
  .ep-skill-input {
    border: none; outline: none;
    background: transparent;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    color: var(--white);
    min-width: 100px;
    flex: 1;
  }
  .ep-skill-input::placeholder { color: var(--muted); }

  /* Photo URL row */
  .ep-photo-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
  }
  .ep-photo-row .ep-input { flex: 1; }
  .ep-photo-preview {
    width: 46px; height: 46px;
    border-radius: 10px;
    object-fit: cover;
    border: 1px solid var(--border);
    flex-shrink: 0;
    background: var(--surface);
  }

  /* Error */
  .ep-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(248,113,113,0.1);
    border: 1px solid rgba(248,113,113,0.25);
    border-radius: 10px;
    padding: 11px 16px;
    font-size: 13px;
    color: var(--error);
  }

  /* Section divider */
  .ep-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 6px 0;
  }
  .ep-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .ep-divider-text {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* Save button */
  .ep-save-btn {
    margin-top: 8px;
    width: 100%;
    padding: 15px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(135deg, #7c6ef7 0%, #a78bfa 50%, #7c6ef7 100%);
    background-size: 200% 200%;
    color: #fff;
    font-family: 'Syne', sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: transform 0.18s, box-shadow 0.18s;
    box-shadow: 0 6px 28px rgba(124,110,247,0.35);
    animation: btnShimmer 4s ease infinite;
  }
  @keyframes btnShimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .ep-save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(124,110,247,0.5); }
  .ep-save-btn:active:not(:disabled) { transform: translateY(0); }
  .ep-save-btn:disabled { opacity: 0.5; cursor: default; }

  /* ── Preview Card ── */
  .ep-preview-card {
    background: rgba(18,18,26,0.8);
    border: 1px solid var(--border);
    border-radius: 24px;
    overflow: hidden;
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(124,110,247,0.06),
      0 30px 60px rgba(0,0,0,0.5),
      inset 0 1px 0 rgba(255,255,255,0.04);
    animation: epIn 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both;
    position: sticky;
    top: 40px;
  }

  .ep-preview-label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 22px;
    border-bottom: 1px solid var(--border);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .ep-preview-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
    animation: pulse 2s ease infinite;
  }
  @keyframes pulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.6; transform:scale(0.85); }
  }

  .ep-preview-img-wrap {
    position: relative;
    height: 200px;
    overflow: hidden;
  }
  .ep-preview-img-wrap img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }
  .ep-preview-img-wrap::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(to bottom, transparent 45%, rgba(18,18,26,0.98) 100%);
    pointer-events: none;
  }

  .ep-preview-body { padding: 18px 22px 24px; }

  .ep-preview-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 24px;
    font-weight: 700;
    color: var(--white);
    margin: 0 0 4px;
    line-height: 1.15;
  }
  .ep-preview-meta {
    font-size: 11.5px;
    color: var(--accent2);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex; gap: 6px; align-items: center;
  }
  .ep-preview-meta-dot {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--accent2);
    opacity: 0.45;
  }
  .ep-preview-about {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 16px;
    font-weight: 400;
  }
  .ep-preview-skills-label {
    font-size: 9.5px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--soft);
    margin-bottom: 8px;
  }
  .ep-preview-chips {
    display: flex; flex-wrap: wrap; gap: 6px;
    margin-bottom: 20px;
  }
  .ep-preview-chip {
    font-size: 11px; font-weight: 600;
    padding: 4px 12px;
    border-radius: 100px;
    background: rgba(124,110,247,0.1);
    border: 1px solid rgba(124,110,247,0.22);
    color: var(--accent2);
    letter-spacing: 0.04em;
  }
  .ep-preview-actions {
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  }
  .ep-preview-action-btn {
    padding: 12px 0;
    border-radius: 12px;
    border: none;
    font-family: 'Syne', sans-serif;
    font-size: 12px; font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: default;
  }
  .ep-preview-action-btn.ignore {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    color: var(--muted);
  }
  .ep-preview-action-btn.interest {
    background: linear-gradient(135deg, #7c6ef7, #a78bfa);
    color: #fff;
    box-shadow: 0 4px 16px rgba(124,110,247,0.3);
  }

  /* Toast */
  .ep-toast {
    position: fixed;
    top: 28px; left: 50%; transform: translateX(-50%);
    z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    background: rgba(15,15,22,0.9);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(74,222,128,0.3);
    border-radius: 100px;
    padding: 12px 24px;
    font-family: 'Syne', sans-serif;
    font-size: 13px; font-weight: 600;
    color: var(--success);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(74,222,128,0.12);
    animation: toastIn 0.4s cubic-bezier(0.22,1,0.36,1);
  }
  @keyframes toastIn {
    from { opacity:0; transform: translateX(-50%) translateY(-16px) scale(0.95); }
    to   { opacity:1; transform: translateX(-50%) translateY(0) scale(1); }
  }

  /* Spinner */
  .ep-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.2);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* Responsive */
  @media (max-width: 900px) {
    .ep-wrapper {
      grid-template-columns: 1fr;
      max-width: 480px;
    }
    .ep-preview-card { position: static; }
  }
`;

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();
  const fileRef = useRef(null);
  const skillInput = useRef(null);

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [skillDraft, setSkillDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  /* ── Skills helpers ── */
  const addSkill = () => {
    const trimmed = skillDraft.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillDraft("");
  };

  const removeSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && skillDraft === "" && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  /* ── Save ── */
  const saveProfile = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await axios.post(
        BASE_URL + "/profile/edit",
        { firstName, lastName, photoURL, age, gender, about, skills },
        { withCredentials: true },
      );
      dispatch(addUser(res.data.data));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err) {
      setError(err?.response?.data || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Derived preview values ── */
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || "Your Name";
  const metaParts = [age && `${age} yrs`, gender].filter(Boolean);

  return (
    <>
      <style>{CSS}</style>

      <div className="ep-root">
        <div className="ep-wrapper">
          {/* ══ LEFT: FORM PANEL ══ */}
          <div className="ep-panel">
            <div className="ep-header">
              <p className="ep-eyebrow">Account</p>
              <h1 className="ep-title">Edit Profile</h1>
              <p className="ep-subtitle">
                Changes reflect instantly on your preview →
              </p>
            </div>

            <div className="ep-body">
              {/* Name row */}
              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label">First Name</label>
                  <input
                    className="ep-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Last Name</label>
                  <input
                    className="ep-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              {/* Age & Gender */}
              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label">Age</label>
                  <input
                    className="ep-input"
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="24"
                  />
                </div>
                <div className="ep-field">
                  <label className="ep-label">Gender</label>
                  <div className="ep-gender-group">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        className={`ep-gender-btn${gender === g ? " active" : ""}`}
                        onClick={() => setGender(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ep-divider">
                <div className="ep-divider-line" />
                <span className="ep-divider-text">Photo</span>
                <div className="ep-divider-line" />
              </div>

              {/* Photo URL */}
              <div className="ep-field full">
                <label className="ep-label">Photo URL</label>
                <div className="ep-photo-row">
                  <input
                    className="ep-input"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                  />
                  {photoURL && (
                    <img
                      className="ep-photo-preview"
                      src={photoURL}
                      alt="preview"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                      onLoad={(e) => {
                        e.target.style.display = "block";
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="ep-divider">
                <div className="ep-divider-line" />
                <span className="ep-divider-text">About</span>
                <div className="ep-divider-line" />
              </div>

              {/* About */}
              <div className="ep-field full">
                <label className="ep-label">Bio</label>
                <textarea
                  className="ep-input"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Write a short bio about yourself…"
                  rows={3}
                />
              </div>

              {/* Skills */}
              <div className="ep-field full">
                <label className="ep-label">
                  Skills — press Enter or comma to add
                </label>
                <div
                  className="ep-skills-wrap"
                  onClick={() => skillInput.current?.focus()}
                >
                  {skills.map((s, i) => (
                    <span key={i} className="ep-skill-tag">
                      {s}
                      <button
                        className="ep-skill-remove"
                        onClick={() => removeSkill(i)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    ref={skillInput}
                    className="ep-skill-input"
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    onBlur={addSkill}
                    placeholder={
                      skills.length === 0 ? "React, Node, Python…" : ""
                    }
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="ep-error">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Save */}
              <button
                className="ep-save-btn"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="ep-spinner"
                      style={{ verticalAlign: "middle", marginRight: 8 }}
                    />
                    Saving…
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>

          {/* ══ RIGHT: LIVE PREVIEW ══ */}
          <div className="ep-preview-card">
            <div className="ep-preview-label">
              <span className="ep-preview-dot" />
              Live Preview
            </div>

            <div className="ep-preview-img-wrap">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/360x200?text=Photo";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg,#1a1a28,#13131a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>

            <div className="ep-preview-body">
              <h2 className="ep-preview-name">{displayName}</h2>

              {metaParts.length > 0 && (
                <div className="ep-preview-meta">
                  {metaParts.map((p, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="ep-preview-meta-dot" />}
                      <span>{p}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}

              {about && <p className="ep-preview-about">{about}</p>}

              {skills.length > 0 && (
                <>
                  <div className="ep-preview-skills-label">Skills</div>
                  <div className="ep-preview-chips">
                    {skills.map((s, i) => (
                      <span key={i} className="ep-preview-chip">
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="ep-preview-actions">
                <button className="ep-preview-action-btn ignore">Ignore</button>
                <button className="ep-preview-action-btn interest">
                  Interested
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="ep-toast">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile saved successfully
        </div>
      )}
    </>
  );
};

export default EditProfile;
