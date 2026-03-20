import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, db, storage } from "../firebase";

const ADMIN_EMAIL = "arclub99@gmail.com";

const initialForm = {
  title: "",
  link: "",
  category: "Elementor",
  order: 0,
  thumb: "",
  hoverImg: "",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "10px",
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  outline: "none",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
};

const buttonStyle = {
  padding: "12px 16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: "700",
};

function Admin() {
  const [form, setForm] = useState(initialForm);
  const categoryOptions = ["Elementor", "WP Bakery", "DIVI", "Custom"];
  const [projects, setProjects] = useState([]);
  const [thumbFile, setThumbFile] = useState(null);
  const [hoverFile, setHoverFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const provider = useMemo(() => new GoogleAuthProvider(), []);

  const isAdmin =
    user?.email &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (
        currentUser?.email &&
        currentUser.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
      ) {
        await fetchProjects();
      } else {
        setProjects([]);
      }
    });

    return () => unsub();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setMessage("Loading cards...");

      const snapshot = await getDocs(collection(db, "portfolio"));
      const data = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setProjects(data);
      setMessage(`Loaded ${data.length} cards`);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setMessage(`Projects load করতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setMessage("Signing in...");
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
      setMessage(`Login করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("Signed out");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage(`Logout করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const uploadImage = async (file, folderName) => {
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const storageRef = ref(storage, `portfolio/${folderName}/${safeName}`);

    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  };

  const resetForm = () => {
    setForm(initialForm);
    setThumbFile(null);
    setHoverFile(null);
    setEditingId(null);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      setMessage("আপনি admin নন");
      return;
    }

    if (!form.title || !form.link || !form.category) {
      setMessage("Title, link, category fill করুন");
      return;
    }

    try {
      setSaving(true);
      setMessage("Saving শুরু হয়েছে...");

      let thumbUrl = form.thumb;
      let hoverUrl = form.hoverImg;

      if (thumbFile) {
        setMessage("Thumbnail upload হচ্ছে...");
        thumbUrl = await uploadImage(thumbFile, "thumbs");
      }

      if (hoverFile) {
        setMessage("Hover image upload হচ্ছে...");
        hoverUrl = await uploadImage(hoverFile, "mockups");
      }

      const payload = {
        title: form.title.trim(),
        link: form.link.trim(),
        category: form.category,
        order: Number(form.order) || 0,
        thumb: thumbUrl || "",
        hoverImg: hoverUrl || "",
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "portfolio", editingId), payload);
        setMessage("Card updated successfully");
      } else {
        await addDoc(collection(db, "portfolio"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setMessage("New card added successfully");
      }

      resetForm();
      await fetchProjects();
    } catch (error) {
      console.error("Save error:", error);
      setMessage(`Save করতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
    title: project.title || "",
    link: project.link || "",
    category: project.category || "Elementor",
    order: project.order ?? 0,
    thumb: project.thumb || "",
    hoverImg: project.hoverImg || "",
  });
    setThumbFile(null);
    setHoverFile(null);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      setMessage("আপনি admin নন");
      return;
    }

    const ok = window.confirm("এই card delete করতে চান?");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "portfolio", id));
      setMessage("Card deleted");
      await fetchProjects();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(`Delete করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const thumbPreview = thumbFile
    ? URL.createObjectURL(thumbFile)
    : form.thumb || "";

  const hoverPreview = hoverFile
    ? URL.createObjectURL(hoverFile)
    : form.hoverImg || "";

  if (authLoading) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", color: "#fff" }}>
        <h1>Admin</h1>
        <p>Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", color: "#fff" }}>
        <div
          style={{
            background: "#0d0d0d",
            border: "1px solid #222",
            borderRadius: "16px",
            padding: "30px",
          }}
        >
          <h1 style={{ marginBottom: "10px" }}>Admin Login</h1>
          <p style={{ marginBottom: "20px", color: "#bbb" }}>
            Admin page use করতে হলে Google account দিয়ে login করুন।
          </p>

          <button
            onClick={handleLogin}
            style={{
              ...buttonStyle,
              background: "#2563eb",
              color: "#fff",
            }}
          >
            Sign in with Google
          </button>

          {message && (
            <p style={{ marginTop: "16px", color: "#facc15" }}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px", color: "#fff" }}>
        <div
          style={{
            background: "#0d0d0d",
            border: "1px solid #222",
            borderRadius: "16px",
            padding: "30px",
          }}
        >
          <h1 style={{ marginBottom: "10px" }}>Not Authorized</h1>
          <p style={{ marginBottom: "12px", color: "#bbb" }}>
            এই account admin হিসেবে allowed না।
          </p>
          <p style={{ marginBottom: "20px", color: "#bbb" }}>
            Logged in as: <strong>{user.email}</strong>
          </p>

          <button
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              background: "#dc2626",
              color: "#fff",
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px", color: "#fff" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "8px" }}>
            {editingId ? "Update Portfolio Card" : "Add New Portfolio Card"}
          </h1>
          <p style={{ color: "#bbb", marginBottom: "6px" }}>
            Logged in as: {user.email}
          </p>
          <p style={{ color: "#bbb" }}>
            এখান থেকে title, link, category, thumbnail, hover image add/update করতে পারবেন।
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            ...buttonStyle,
            background: "#dc2626",
            color: "#fff",
          }}
        >
          Sign out
        </button>
      </div>

      {message && (
        <p style={{ marginBottom: "16px", color: "#facc15" }}>{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          background: "#0d0d0d",
          border: "1px solid #222",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <label style={labelStyle}>Project Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ki Keno Kivabe"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Project Link</label>
          <input
            type="text"
            name="link"
            value={form.link}
            onChange={handleChange}
            placeholder="https://example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Elementor / DIVI / Custom"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Thumbnail URL</label>
          <input
            type="text"
            name="thumb"
            value={form.thumb}
            onChange={handleChange}
            placeholder="Thumbnail URL paste করুন, বা নিচে file upload করুন"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Thumbnail File Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files[0] || null)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Hover Image URL</label>
          <input
            type="text"
            name="hoverImg"
            value={form.hoverImg}
            onChange={handleChange}
            placeholder="Hover image URL paste করুন, বা নিচে file upload করুন"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Hover Image File Upload</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setHoverFile(e.target.files[0] || null)}
            style={inputStyle}
          />
        </div>

        {(thumbPreview || hoverPreview) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {thumbPreview && (
              <div>
                <p style={{ marginBottom: "8px", color: "#bbb" }}>Thumb Preview</p>
                <img
                  src={thumbPreview}
                  alt="thumb preview"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #333",
                  }}
                />
              </div>
            )}

            {hoverPreview && (
              <div>
                <p style={{ marginBottom: "8px", color: "#bbb" }}>Hover Preview</p>
                <img
                  src={hoverPreview}
                  alt="hover preview"
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "1px solid #333",
                  }}
                />
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              ...buttonStyle,
              background: "#2563eb",
              color: "#fff",
            }}
          >
            {saving ? "Saving..." : editingId ? "Update Card" : "Add Card"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={{
              ...buttonStyle,
              background: "#333",
              color: "#fff",
            }}
          >
            Reset
          </button>

          <button
            type="button"
            onClick={fetchProjects}
            style={{
              ...buttonStyle,
              background: "#0f766e",
              color: "#fff",
            }}
          >
            Reload Cards
          </button>
        </div>
      </form>

      <div>
        <h2 style={{ marginBottom: "18px" }}>Existing Portfolio Cards</h2>

        {loading ? (
          <p>Loading cards...</p>
        ) : projects.length === 0 ? (
          <p>No cards found.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "18px",
            }}
          >
            {projects.map((project) => (
              <div
                key={project.id}
                style={{
                  background: "#0d0d0d",
                  border: "1px solid #222",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {project.thumb && (
                  <img
                    src={project.thumb}
                    alt={project.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div style={{ padding: "16px" }}>
                  <h3 style={{ marginBottom: "8px" }}>{project.title}</h3>
                  <p style={{ marginBottom: "8px", color: "#bbb" }}>
                    Category: {project.category}
                  </p>

                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "#60a5fa",
                      textDecoration: "none",
                      wordBreak: "break-all",
                    }}
                  >
                    {project.link}
                  </a>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        ...buttonStyle,
                        background: "#f59e0b",
                        color: "#111",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(project.id)}
                      style={{
                        ...buttonStyle,
                        background: "#dc2626",
                        color: "#fff",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;