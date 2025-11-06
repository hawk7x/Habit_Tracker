import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./Profile.css";

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
      else
        setProfile({
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!newName.trim()) return;
    const docRef = doc(db, "profiles", user.uid);
    await setDoc(docRef, { displayName: newName }, { merge: true });
    setProfile((prev) => ({ ...prev, displayName: newName }));
    setEditMode(false);
    setNewName("");
  };

  if (!profile) return <p className="profile-loading">Loading profile...</p>;

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <h1 className="profile-title">👤 Profile</h1>

        <div className="profile-avatar-section">
          <img
            src={profile.photoURL || "https://via.placeholder.com/120"}
            alt="avatar"
            className="profile-avatar"
          />
        </div>

        <div className="profile-info">
          <p className="profile-field">
            <strong>Email:</strong> {profile.email}
          </p>

          {editMode ? (
            <div className="profile-edit-section">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="profile-input"
              />
              <div className="profile-btn-group">
                <button className="btn-save" onClick={handleSave}>
                  💾 Save
                </button>
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  ✖ Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="profile-field">
                <strong>Name:</strong> {profile.displayName || "Not set"}
              </p>
              <button className="btn-edit" onClick={() => setEditMode(true)}>
                ✏️ Edit name
              </button>
            </>
          )}
        </div>

        <div className="profile-footer">
          <p className="profile-level">🏆 Level 3 Habit Builder</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
