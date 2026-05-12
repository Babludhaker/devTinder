import axios from "axios";
import React, { useRef, useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";

const UserCard = ({ user, isEditable }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const { _id, firstName, lastName, age, gender, about, photoURL, skills } =
    user;

  const [hovering, setHovering] = useState(false);
  const [previewURL, setPreviewURL] = useState(photoURL);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSendRequest = async (status, userId) => {
    try {
      await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userId,
        {},
        { withCredentials: true },
      );
      dispatch(removeUserFromFeed(userId));
    } catch (error) {
      console.log(error);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setSaved(false);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewURL(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveImage = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("photo", selectedFile);
      await axios.post(BASE_URL + "/profile/edit", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSaved(true);
      setSelectedFile(null);
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .uc-card {
          --gold: #c9a84c;
          --gold-light: #e8c97a;
          --bg-card: rgba(14, 14, 20, 0.85);
          --bg-inner: rgba(255, 255, 255, 0.03);
          --border: rgba(201, 168, 76, 0.25);
          --text-primary: #f0ece0;
          --text-muted: #8a8275;
          font-family: 'DM Sans', sans-serif;
          width: 360px;
          border-radius: 24px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(201, 168, 76, 0.08),
            0 30px 60px rgba(0,0,0,0.5),
            0 8px 24px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.06);
          overflow: hidden;
          position: relative;
          animation: cardEnter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardEnter {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Top shimmer line */
        .uc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-light), transparent);
          opacity: 0.6;
        }

        /* ── Image section ── */
        .uc-image-wrap {
          position: relative;
          width: 100%;
          height: 240px;
          overflow: hidden;
          cursor: pointer;
        }

        .uc-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease, filter 0.4s ease;
        }

        .uc-image-wrap:hover img {
          transform: scale(1.04);
          filter: brightness(0.55);
        }

        /* Gradient fade at bottom of image */
        .uc-image-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 40%,
            rgba(14, 14, 20, 0.95) 100%
          );
          pointer-events: none;
        }

        /* Upload overlay (shown on hover) */
        .uc-upload-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .uc-image-wrap:hover .uc-upload-overlay {
          opacity: 1;
          pointer-events: all;
        }

        .uc-upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(201, 168, 76, 0.15);
          border: 1px solid var(--gold);
          color: var(--gold-light);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 20px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: background 0.2s, transform 0.2s;
        }

        .uc-upload-btn:hover {
          background: rgba(201, 168, 76, 0.28);
          transform: scale(1.04);
        }

        /* Save badge — top-right corner of image */
        .uc-save-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(14, 14, 20, 0.82);
          border: 1px solid var(--gold);
          color: var(--gold-light);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 7px 14px;
          border-radius: 100px;
          cursor: pointer;
          backdrop-filter: blur(12px);
          animation: badgeIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: background 0.2s, transform 0.15s;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }

        .uc-save-badge:hover:not(:disabled) {
          background: rgba(201, 168, 76, 0.2);
          transform: scale(1.05);
        }

        .uc-save-badge:disabled {
          opacity: 0.6;
          cursor: default;
        }

        @keyframes badgeIn {
          from { opacity: 0; transform: scale(0.7) translateY(-6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .uc-saved-badge {
          background: rgba(34, 197, 94, 0.15);
          border-color: #4ade80;
          color: #86efac;
        }

        /* ── Body ── */
        .uc-body {
          padding: 20px 24px 24px;
          position: relative;
        }

        .uc-name {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.01em;
          margin: 0 0 4px;
          line-height: 1.2;
        }

        .uc-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--gold);
          font-size: 12.5px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .uc-meta-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--gold);
          opacity: 0.5;
        }

        .uc-divider {
          width: 36px;
          height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: 14px;
          opacity: 0.6;
        }

        .uc-about {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.7;
          margin-bottom: 16px;
          font-weight: 300;
        }

        /* Skills */
        .uc-skills-label {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 600;
          margin-bottom: 8px;
        }

        .uc-skills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 22px;
        }

        .uc-skill-chip {
          font-size: 11.5px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 100px;
          background: rgba(201, 168, 76, 0.08);
          border: 1px solid rgba(201, 168, 76, 0.22);
          color: #c9a84c;
          letter-spacing: 0.04em;
          transition: background 0.2s, border-color 0.2s;
        }

        .uc-skill-chip:hover {
          background: rgba(201, 168, 76, 0.15);
          border-color: rgba(201, 168, 76, 0.45);
        }

        /* Action buttons */
        .uc-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .uc-btn {
          position: relative;
          overflow: hidden;
          border: none;
          border-radius: 14px;
          padding: 13px 0;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }

        .uc-btn:hover { transform: translateY(-2px); }
        .uc-btn:active { transform: translateY(0); }

        .uc-btn-ignore {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: #8a8275;
        }

        .uc-btn-ignore:hover {
          background: rgba(255,255,255,0.08);
          color: #c0b8a8;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        }

        .uc-btn-interest {
          background: linear-gradient(135deg, #c9a84c 0%, #e8c97a 60%, #c9a84c 100%);
          background-size: 200% 200%;
          color: #0e0e14;
          box-shadow: 0 4px 20px rgba(201, 168, 76, 0.3);
          animation: shimmer 3s ease infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .uc-btn-interest:hover {
          box-shadow: 0 6px 28px rgba(201, 168, 76, 0.5);
        }

        /* Spinner */
        .uc-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(201,168,76,0.3);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div className="uc-card">
        {/* ── Image ── */}
        <div
          className={`uc-image-wrap ${isEditable ? "cursor-pointer" : ""}`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={() => {
            if (isEditable) {
              handleImageClick();
            }
          }}
        >
          <img src={previewURL} alt={`${firstName} ${lastName}`} />

          {isEditable && (
            <div className="uc-upload-overlay">
              <button
                className="uc-upload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick();
                }}
              >
                {/* Camera icon */}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                Change Photo
              </button>
            </div>
          )}

          {/* Save badge — only when a new image is picked */}
          {isEditable && selectedFile && !saved && (
            <button
              className="uc-save-badge"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveImage();
              }}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="uc-spinner" /> Saving…
                </>
              ) : (
                <>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save
                </>
              )}
            </button>
          )}

          {saved && (
            <div className="uc-save-badge uc-saved-badge">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="uc-body">
          <h2 className="uc-name">
            {firstName} {lastName}
          </h2>

          {(age || gender) && (
            <div className="uc-meta">
              {age && <span>{age} yrs</span>}
              {age && gender && <span className="uc-meta-dot" />}
              {gender && <span>{gender}</span>}
            </div>
          )}

          <div className="uc-divider" />

          {about && <p className="uc-about">{about}</p>}

          {skills && skills.length > 0 && (
            <>
              <div className="uc-skills-label">Skills</div>
              <div className="uc-skills">
                {skills.map((skill, i) => (
                  <span key={i} className="uc-skill-chip">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="uc-actions">
            <button
              className="uc-btn uc-btn-ignore"
              onClick={() => handleSendRequest("ignored", _id)}
            >
              Ignore
            </button>
            <button
              className="uc-btn uc-btn-interest"
              onClick={() => handleSendRequest("intrested", _id)}
            >
              Interested
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserCard;
