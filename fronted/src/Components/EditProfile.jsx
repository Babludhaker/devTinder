import React, { useRef, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import UserCard from "./UserCard";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Syne:wght@400;500;600;700&display=swap');

  :root {
    --ink: #0d0d12;
    --panel: #18181f;
    --border: rgba(255,255,255,0.07);
    --accent: #7c6ef7;
    --accent2: #a78bfa;
    --white: #f0effe;
    --muted: #5a5870;
    --soft: #9d9bb8;
    --success: #4ade80;
    --error: #f87171;
  }

  .ep-root {
    min-height: 100vh;
    background: var(--ink);
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    font-family: 'Syne', sans-serif;
  }

  .ep-wrapper {
    width: 100%;
    max-width: 1200px;
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 32px;
    align-items: start;
  }

  .ep-panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 28px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(124,110,247,0.06),
      0 40px 80px rgba(0,0,0,0.5);
  }

  .ep-header {
    padding: 32px;
    border-bottom: 1px solid var(--border);
  }

  .ep-eyebrow {
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--accent2);
    margin-bottom: 8px;
  }

  .ep-title {
    font-size: 38px;
    color: var(--white);
    margin: 0;
    font-family: 'Cormorant Garamond', serif;
  }

  .ep-subtitle {
    color: var(--muted);
    margin-top: 8px;
    font-size: 14px;
  }

  .ep-body {
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .ep-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .ep-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ep-label {
    color: var(--soft);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .ep-input {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px 16px;
    color: white;
    outline: none;
    font-size: 14px;
  }

  .ep-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(124,110,247,0.12);
  }

  textarea.ep-input {
    resize: vertical;
    min-height: 100px;
  }

  .ep-gender-group {
    display: flex;
    gap: 10px;
  }

  .ep-gender-btn {
    flex: 1;
    padding: 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.03);
    color: var(--soft);
    cursor: pointer;
    font-weight: 600;
  }

  .ep-gender-btn.active {
    background: rgba(124,110,247,0.15);
    border-color: var(--accent);
    color: var(--accent2);
  }

  .ep-skills-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 12px;
  }

  .ep-skill-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 999px;
    background: rgba(124,110,247,0.14);
    color: var(--accent2);
    font-size: 13px;
  }

  .ep-skill-remove {
    background: transparent;
    border: none;
    color: var(--accent2);
    cursor: pointer;
  }

  .ep-skill-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: white;
    min-width: 120px;
  }

  .ep-save-btn {
    margin-top: 12px;
    padding: 16px;
    border: none;
    border-radius: 16px;
    background: linear-gradient(135deg,#7c6ef7,#a78bfa);
    color: white;
    font-weight: 700;
    letter-spacing: 0.08em;
    cursor: pointer;
    font-size: 14px;
  }

  .ep-save-btn:hover {
    transform: translateY(-2px);
  }

  .ep-error {
    padding: 14px;
    border-radius: 12px;
    background: rgba(248,113,113,0.12);
    color: var(--error);
    border: 1px solid rgba(248,113,113,0.25);
  }

  .ep-preview {
    position: sticky;
    top: 30px;
    display: flex;
    justify-content: center;
  }

  @media (max-width: 950px) {
    .ep-wrapper {
      grid-template-columns: 1fr;
    }

    .ep-preview {
      position: static;
    }

    .ep-row {
      grid-template-columns: 1fr;
    }
  }
`;

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();
  const skillInput = useRef(null);

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [photoURL, setPhotoURL] = useState(user.photoURL || "");
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [skills, setSkills] = useState(user.skills || []);
  const [skillDraft, setSkillDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");

      const res = await axios.post(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoURL,
          age,
          gender,
          about,
          skills,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(addUser(res.data.data));
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>

      <div className="ep-root">
        <div className="ep-wrapper">
          {/* LEFT FORM */}
          <div className="ep-panel">
            <div className="ep-header">
              <p className="ep-eyebrow">Profile Settings</p>
              <h1 className="ep-title">Edit Profile</h1>
              <p className="ep-subtitle">
                Update your personal information and preview changes live.
              </p>
            </div>

            <div className="ep-body">
              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label">First Name</label>
                  <input
                    className="ep-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="ep-field">
                  <label className="ep-label">Last Name</label>
                  <input
                    className="ep-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="ep-row">
                <div className="ep-field">
                  <label className="ep-label">Age</label>
                  <input
                    type="number"
                    className="ep-input"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="ep-field">
                  <label className="ep-label">Gender</label>

                  <div className="ep-gender-group">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`ep-gender-btn ${
                          gender === g ? "active" : ""
                        }`}
                        onClick={() => setGender(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* <div className="ep-field">
                <label className="ep-label">Photo URL</label>

                <input
                  className="ep-input"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
              </div> */}

              <div className="ep-field">
                <label className="ep-label">About</label>

                <textarea
                  className="ep-input"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
              </div>

              <div className="ep-field">
                <label className="ep-label">Skills</label>

                <div
                  className="ep-skills-wrap"
                  onClick={() => skillInput.current.focus()}
                >
                  {skills.map((skill, i) => (
                    <div className="ep-skill-tag" key={i}>
                      {skill}

                      <button
                        className="ep-skill-remove"
                        onClick={() => removeSkill(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <input
                    ref={skillInput}
                    className="ep-skill-input"
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="React, Node, MongoDB..."
                  />
                </div>
              </div>

              {error && <div className="ep-error">{error}</div>}

              <button
                className="ep-save-btn"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* RIGHT SIDE USER CARD */}
          <div className="ep-preview">
            <UserCard
              user={{
                firstName,
                lastName,
                photoURL,
                age,
                gender,
                about,
                skills,
              }}
              isEditable={true}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditProfile;
