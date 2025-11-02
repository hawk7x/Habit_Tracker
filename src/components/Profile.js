// src/components/Profile.js
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const docRef = doc(db, "profiles", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
    };
    loadProfile();
  }, [user]);

  const handleSave = async () => {
    const docRef = doc(db, "profiles", user.uid);
    await setDoc(docRef, { displayName: newName }, { merge: true });
    setProfile((prev) => ({ ...prev, displayName: newName }));
    setEditMode(false);
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>👤 Profile</h2>
      <img
        src={profile.photoURL || "https://via.placeholder.com/100"}
        alt="avatar"
        style={{ borderRadius: "50%", width: 100, height: 100 }}
      />
      <p><strong>Email:</strong> {profile.email}</p>

      {editMode ? (
        <>
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter new name"
          />
          <button onClick={handleSave}>Save</button>
        </>
      ) : (
        <p><strong>Name:</strong> {profile.displayName || "Not set"}</p>
      )}

      <button onClick={() => setEditMode(!editMode)}>
        {editMode ? "Cancel" : "Edit name"}
      </button>
    </div>
  );
}

export default Profile;
