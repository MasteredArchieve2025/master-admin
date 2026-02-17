import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { SKILL_INSTITUTION_API, SKILL_TYPE_API, UPLOAD_API } from "../../api/api";

const SkillInstitutions = () => {
  const { typeId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [skillTypeName, setSkillTypeName] = useState("");

  const [form, setForm] = useState({
    name: "",
    shortDescription: [],
    area: "",
    district: "",
    state: "",
    about: "",
    weOffer: [],
    websiteUrl: "",
    gallery: [],
    aboutOurTrainers: "",
    image: ""
  });

  const loadData = async () => {
    try {
      // Load skill type name
      const typeRes = await axios.get(`${SKILL_TYPE_API}/${typeId}`);
      setSkillTypeName(typeRes.data.name);

      // Load institutions
      const res = await axios.get(`${SKILL_INSTITUTION_API}/type/${typeId}`);
      setList(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load institutions");
    }
  };

  useEffect(() => {
    if (typeId) {
      loadData();
    }
  }, [typeId]);

  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url = res.data?.url || res.data?.imageUrl || res.data?.data?.url || res.data?.files?.[0]?.url;
      if (!url) throw new Error("No image URL");

      if (field === 'gallery') {
        setForm({ ...form, gallery: [...form.gallery, url] });
        alert("Gallery image added!");
      } else {
        setForm({ ...form, [field]: url });
        alert("Image uploaded!");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Institution name required");
    }

    try {
      const payload = {
        typeId: Number(typeId),
        name: form.name,
        shortDescription: form.shortDescription.split(",").map(s => s.trim()).filter(s => s),
        area: form.area,
        district: form.district,
        state: form.state,
        about: form.about,
        weOffer: form.weOffer.split(",").map(w => w.trim()).filter(w => w),
        websiteUrl: form.websiteUrl,
        gallery: form.gallery,
        aboutOurTrainers: form.aboutOurTrainers,
        image: form.image
      };

      if (editingId) {
        await axios.put(`${SKILL_INSTITUTION_API}/${editingId}`, payload);
      } else {
        await axios.post(SKILL_INSTITUTION_API, payload);
      }

      reset();
      loadData();
      alert(editingId ? "Institution updated!" : "Institution added!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (i) => {
    setEditingId(i.id);
    setForm({
      name: i.name || "",
      shortDescription: Array.isArray(i.shortDescription) ? i.shortDescription.join(", ") : "",
      area: i.area || "",
      district: i.district || "",
      state: i.state || "",
      about: i.about || "",
      weOffer: Array.isArray(i.weOffer) ? i.weOffer.join(", ") : "",
      websiteUrl: i.websiteUrl || "",
      gallery: Array.isArray(i.gallery) ? i.gallery : [],
      aboutOurTrainers: i.aboutOurTrainers || "",
      image: i.image || ""
    });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this institution?")) return;

    try {
      await axios.delete(`${SKILL_INSTITUTION_API}/${id}`);
      loadData();
      alert("Deleted!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = [...form.gallery];
    newGallery.splice(index, 1);
    setForm({ ...form, gallery: newGallery });
  };

  const reset = () => {
    setForm({
      name: "",
      shortDescription: [],
      area: "",
      district: "",
      state: "",
      about: "",
      weOffer: [],
      websiteUrl: "",
      gallery: [],
      aboutOurTrainers: "",
      image: ""
    });
    setEditingId(null);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Skill Institutions</h3>
          <p className="text-muted mb-0">Skill Type: <strong>{skillTypeName}</strong></p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate(`/skill-categories`)}
        >
          ← Back to Categories
        </button>
      </div>

      <form onSubmit={submit} className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Institution Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Website URL"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Area / Locality"
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="District"
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
          />
        </div>

        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="State"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <input
            className="form-control"
            placeholder="Short Description (comma separated) e.g., Dance, Zumba, Fitness"
            value={form.shortDescription}
            onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <input
            className="form-control"
            placeholder="We Offer (comma separated) e.g., Western Dance, Zumba, HipHop"
            value={form.weOffer}
            onChange={(e) => setForm({ ...form, weOffer: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <textarea
            className="form-control"
            placeholder="About the Institution"
            rows="3"
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <textarea
            className="form-control"
            placeholder="About Our Trainers"
            rows="2"
            value={form.aboutOurTrainers}
            onChange={(e) => setForm({ ...form, aboutOurTrainers: e.target.value })}
          />
        </div>

        <div className="col-md-12">
          <div className="row">
            <div className="col-md-8">
              <input
                className="form-control"
                placeholder="Main Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <input 
                type="file" 
                className="form-control" 
                onChange={(e) => uploadImage(e, 'image')}
                disabled={uploading}
              />
            </div>
          </div>
          {form.image && (
            <img src={form.image} alt="main" width="80" className="mt-2 img-thumbnail" />
          )}
        </div>

        <div className="col-md-12">
          <div className="mb-2">
            <label className="form-label fw-bold">Gallery Images</label>
            <input 
              type="file" 
              className="form-control" 
              onChange={(e) => uploadImage(e, 'gallery')}
              disabled={uploading}
              multiple
            />
            {uploading && (
              <div className="mt-2">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Uploading...
              </div>
            )}
          </div>
          
          {form.gallery.length > 0 && (
            <div className="mb-3">
              <p className="small text-muted">Gallery Images ({form.gallery.length})</p>
              <div className="row g-2">
                {form.gallery.map((url, index) => (
                  <div key={index} className="col-3 col-md-2">
                    <div className="position-relative border rounded p-1">
                      <img 
                        src={url} 
                        alt={`gallery-${index}`} 
                        className="img-fluid rounded"
                        style={{ height: "80px", width: "100%", objectFit: "cover" }}
                      />
                      <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0"
                        onClick={() => removeGalleryImage(index)}
                        style={{ transform: "translate(30%, -30%)", padding: "2px 6px" }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-md-12">
          <button className="btn btn-primary" disabled={uploading}>
            {editingId ? "Update Institution" : "Add Institution"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={reset}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th width="80">Image</th>
            <th>Name</th>
            <th>Location</th>
            <th>We Offer</th>
            <th>Gallery</th>
            <th width="150">Action</th>
          </tr>
        </thead>

        <tbody>
          {list.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No institutions found. Add your first institution above.
              </td>
            </tr>
          )}

          {list.map((i) => (
            <tr key={i.id}>
              <td>
                {i.image ? (
                  <img src={i.image} width="40" alt={i.name} className="img-thumbnail" />
                ) : (
                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                    <i className="fas fa-building text-muted"></i>
                  </div>
                )}
              </td>
              <td>
                <div>
                  <strong>{i.name}</strong>
                  {i.area && (
                    <div className="small text-muted">{i.area}, {i.district}</div>
                  )}
                </div>
              </td>
              <td>
                {i.district && i.state ? (
                  <span>{i.district}, {i.state}</span>
                ) : "-"}
              </td>
              <td>
                {i.weOffer && i.weOffer.length > 0 ? (
                  <span className="badge bg-info">{i.weOffer.length} courses</span>
                ) : "-"}
              </td>
              <td>
                {i.gallery && i.gallery.length > 0 ? (
                  <span className="badge bg-success">{i.gallery.length} images</span>
                ) : "-"}
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => edit(i)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(i.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillInstitutions;