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
import "./Admin.css";

const ADMIN_EMAIL = "arclub99@gmail.com";

const initialForm = {
  title: "",
  link: "",
  category: "Elementor",
  order: 0,
  thumb: "",
  hoverImg: "",
};

function Admin() {
  const [form, setForm] = useState(initialForm);
  const categoryOptions = ["Elementor", "WPBakery", "DIVI", "Custom"];
  const [projects, setProjects] = useState([]);
  const [thumbFile, setThumbFile] = useState(null);
  const [hoverFile, setHoverFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [draggedId, setDraggedId] = useState(null);
  const [currentPage, setCurrentPage] = useState("add");

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
      // Order অনুযায়ী sort করি
      data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setProjects(data);
      setMessage(`Loaded ${data.length} cards`);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setMessage(`Projects load করতে সমস্যা হয়েছে: ${error.message}`);
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
      setMessage(`Login করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessage("Signed out");
    } catch (error) {
      console.error("Logout error:", error);
      setMessage(`Logout করতে সমস্যা হয়েছে: ${error.message}`);
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
      setMessage("Saving শুরু হয়েছে...");

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
      setMessage(`Save করতে সমস্যা হয়েছে: ${error.message}`);
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
      setMessage(`Delete করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const handleMoveOrder = async (id, direction) => {
    if (!isAdmin) {
      setMessage("আপনি admin নন");
      return;
    }

    try {
      setMessage("Order update হচ্ছে...");
      const projectIndex = projects.findIndex((p) => p.id === id);

      if (projectIndex === -1) return;

      const currentOrder = projects[projectIndex].order || 0;
      const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

      await updateDoc(doc(db, "portfolio", id), {
        order: newOrder,
        updatedAt: serverTimestamp(),
      });

      setMessage(`Order updated successfully (New: ${newOrder})`);
      await fetchProjects();
    } catch (error) {
      console.error("Order update error:", error);
      setMessage(`Order update করতে সমস্যা হয়েছে: ${error.message}`);
    }
  };

  const handleDragStart = (e, projectId) => {
    setDraggedId(projectId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetId) => {
    e.preventDefault();

    if (!draggedId || draggedId === targetId || !isAdmin) {
      setDraggedId(null);
      return;
    }

    try {
      setMessage("Reordering cards...");
      const draggedIndex = projects.findIndex((p) => p.id === draggedId);
      const targetIndex = projects.findIndex((p) => p.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const draggedOrder = projects[draggedIndex].order || 0;
      const targetOrder = projects[targetIndex].order || 0;

      // আপডেট উভয় কার্ডের order
      await updateDoc(doc(db, "portfolio", draggedId), {
        order: targetOrder,
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "portfolio", targetId), {
        order: draggedOrder,
        updatedAt: serverTimestamp(),
      });

      setMessage("Order updated successfully");
      await fetchProjects();
    } catch (error) {
      console.error("Drag drop error:", error);
      setMessage(`Reorder করতে সমস্যা হয়েছে: ${error.message}`);
    } finally {
      setDraggedId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
  };

  const thumbPreview = thumbFile
    ? URL.createObjectURL(thumbFile)
    : form.thumb || "";

  const hoverPreview = hoverFile
    ? URL.createObjectURL(hoverFile)
    : form.hoverImg || "";

  if (authLoading) {
    return (
      <div className="login-box">
        <h1>Admin</h1>
        <p>Checking login...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-box">
        <div className="auth-card">
          <h1>Admin Login</h1>
          <p>
            Admin page use করতে হলে Google account দিয়ে login করুন।
          </p>

          <button
            onClick={handleLogin}
            className="btn btn-primary"
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
      <div className="login-box">
        <div className="auth-card">
          <h1>Not Authorized</h1>
          <p>
            এই account admin হিসেবে allowed না।
          </p>
          <p>
            Logged in as: <strong>{user.email}</strong>
          </p>

          <button
            onClick={handleLogout}
            className="btn btn-danger"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Portfolio</h2>
        </div>

        <ul className="admin-sidebar-menu">
          <li className="admin-menu-title">Portfolio Card</li>
          <li>
            <button
              className={`admin-menu-item ${currentPage === "add" ? "active" : ""}`}
              onClick={() => {
                setCurrentPage("add");
                resetForm();
              }}
            >
              + Add new card
            </button>
          </li>
          <li>
            <button
              className={`admin-menu-item ${currentPage === "all" ? "active" : ""}`}
              onClick={() => setCurrentPage("all")}
            >
              All cards
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-container">
          {/* Header */}
          <div className="admin-header">
            <div className="admin-header-content">
              <h1>
                {currentPage === "add"
                  ? editingId
                    ? "Update Portfolio Card"
                    : "Add New Portfolio Card"
                  : "All Portfolio Cards"}
              </h1>
              <p>
                Logged in as: {user.email}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              Sign out
            </button>
          </div>

          {message && (
            <p className="admin-message">{message}</p>
          )}

          {/* Add/Edit Form */}
          {currentPage === "add" && (
            <form
              onSubmit={handleSubmit}
              className="admin-form"
            >
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ki Keno Kivabe"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Project Link</label>
                <input
                  type="text"
                  name="link"
                  value={form.link}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Order</label>
                <input
                  type="number"
                  name="order"
                  value={form.order}
                  onChange={handleChange}
                  placeholder="0 থেকে শুরু করুন (ছোট নম্বর আগে)"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Thumbnail URL</label>
                <input
                  type="text"
                  name="thumb"
                  value={form.thumb}
                  onChange={handleChange}
                  placeholder="Thumbnail URL paste করুন, বা নিচে file upload করুন"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Thumbnail File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbFile(e.target.files[0] || null)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Hover Image URL</label>
                <input
                  type="text"
                  name="hoverImg"
                  value={form.hoverImg}
                  onChange={handleChange}
                  placeholder="Hover image URL paste করুন, বা নিচে file upload করুন"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Hover Image File Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setHoverFile(e.target.files[0] || null)}
                  className="form-input"
                />
              </div>

              {(thumbPreview || hoverPreview) && (
                <div className="preview-grid">
                  {thumbPreview && (
                    <div className="preview-item">
                      <p>Thumb Preview</p>
                      <img
                        src={thumbPreview}
                        alt="thumb preview"
                      />
                    </div>
                  )}

                  {hoverPreview && (
                    <div className="preview-item">
                      <p>Hover Preview</p>
                      <img
                        src={hoverPreview}
                        alt="hover preview"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="form-button-group">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? "Saving..." : editingId ? "Update Card" : "Add Card"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-secondary"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={fetchProjects}
                  className="btn btn-success"
                >
                  Reload Cards
                </button>
              </div>
            </form>
          )}

          {/* All Cards View */}
          {currentPage === "all" && (
            <div className="admin-projects">
              {loading ? (
                <p>Loading cards...</p>
              ) : projects.length === 0 ? (
                <p>No cards found.</p>
              ) : (
                <div className="cards-grid">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, project.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, project.id)}
                      onDragEnd={handleDragEnd}
                      className={`card ${draggedId === project.id ? "dragging" : ""}`}
                    >
                      {project.thumb && (
                        <img
                          src={project.thumb}
                          alt={project.title}
                          className="card-image"
                        />
                      )}

                      <div className="card-content">
                        <h3 className="card-title">{project.title}</h3>
                        <p className="card-meta">Drag to reorder • Order: {project.order ?? 0}</p>

                        <p className="card-category">
                          Category: {project.category}
                        </p>

                        <a
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="card-link"
                        >
                          {project.link}
                        </a>

                        <div className="card-button-group">
                          <button
                            onClick={() => {
                              handleEdit(project);
                              setCurrentPage("add");
                            }}
                            className="btn btn-warning btn-small"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(project.id)}
                            className="btn btn-danger btn-small"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="card-icon-group">
                        <button
                          onClick={() => handleMoveOrder(project.id, "up")}
                          className="icon-btn"
                          title="Move up"
                        >
                          ⬆
                        </button>
                        <button
                          onClick={() => handleMoveOrder(project.id, "down")}
                          className="icon-btn"
                          title="Move down"
                        >
                          ⬇
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Admin;
