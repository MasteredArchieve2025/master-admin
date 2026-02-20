import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  COURSE_PROVIDER_API,
  COURSE_ITEM_API,
  UPLOAD_API,
} from "../../api/api";

const CourseProviders = () => {
  // Get all params to see what's available
  const params = useParams();
  console.log("All params received:", params);
  
  // Try different possible parameter names
  const courseItemId = params.courseItemId || params.id || params.itemId;
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [courseItemName, setCourseItemName] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: "",
    shortDescription: "",
    about: "",
    location: "",
    area: "",
    district: "",
    state: "",
    mapLink: "",
    rating: "",
    teachingMode: "",
    coursesOffered: "",
    benefits: "",
    mobileNumber: "",
    whatsappNumber: "",
    websiteUrl: "",
    gallery: [],
  });

  /* ================= LOAD DATA ================= */
  const loadData = useCallback(async () => {
    if (!courseItemId) {
      console.error("No courseItemId available");
      alert("Invalid course item ID");
      return;
    }

    setLoading(true);
    try {
      console.log("Loading data for courseItemId:", courseItemId);
      
      // Fetch course item name
      try {
        const itemRes = await axios.get(`${COURSE_ITEM_API}/${courseItemId}`);
        console.log("Course item response:", itemRes.data);
        
        // Handle response with success wrapper
        if (itemRes.data?.success && itemRes.data?.data) {
          setCourseItemName(itemRes.data.data.name);
        } else if (itemRes.data?.name) {
          setCourseItemName(itemRes.data.name);
        } else if (itemRes.data?.data?.name) {
          setCourseItemName(itemRes.data.data.name);
        } else {
          setCourseItemName("Course Item");
        }
      } catch (itemErr) {
        console.error("Failed to load course item name:", itemErr);
        setCourseItemName("Course Item");
      }

      // Fetch providers list
      const url = `${COURSE_PROVIDER_API}/by-course-item/${courseItemId}`;
      console.log("Fetching providers from:", url);
      
      const res = await axios.get(url);
      console.log("Providers response:", res.data);

      // Handle different response structures
      let providersData = [];
      if (Array.isArray(res.data)) {
        providersData = res.data;
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        providersData = res.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        providersData = res.data.data;
      } else if (res.data?.data && !Array.isArray(res.data.data)) {
        // Single object wrapped in data
        providersData = [res.data.data];
      }

      console.log("Processed providers data:", providersData);
      setList(providersData);
    } catch (err) {
      console.error("Load failed", err);
      alert(
        "Failed to load providers: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  }, [courseItemId]);

  useEffect(() => {
    console.log("CourseProviders mounted with params:", params);
    console.log("Extracted courseItemId:", courseItemId);
    
    if (courseItemId) {
      loadData();
    } else {
      console.error("No courseItemId found in params:", params);
      alert("Invalid URL: Course Item ID not found");
    }
  }, [courseItemId, loadData, params]);

  /* ================= IMAGE UPLOAD ================= */
  const uploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (field === "gallery") {
        setUploadingGallery(true);
      } else {
        setUploading(true);
      }

      const fd = new FormData();
      fd.append("file", file);

      const res = await axios.post(UPLOAD_API, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", res.data);

      // Handle upload response with success wrapper
      let url = null;
      if (res.data?.success && res.data?.data?.url) {
        url = res.data.data.url;
      } else if (res.data?.url) {
        url = res.data.url;
      } else if (res.data?.data?.url) {
        url = res.data.data.url;
      } else if (res.data?.file?.url) {
        url = res.data.file.url;
      }

      if (!url) throw new Error("No image URL in response");

      if (field === "gallery") {
        setForm((prev) => ({ ...prev, gallery: [...prev.gallery, url] }));
        alert("Gallery image added!");
      } else {
        setForm((prev) => ({ ...prev, [field]: url }));
        alert("Image uploaded!");
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      if (field === "gallery") {
        setUploadingGallery(false);
      } else {
        setUploading(false);
      }
    }
  };

  /* ================= REMOVE GALLERY IMAGE ================= */
  const removeGalleryImage = (index) => {
    const newGallery = [...form.gallery];
    newGallery.splice(index, 1);
    setForm({ ...form, gallery: newGallery });
  };

  /* ================= SAVE ================= */
  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      return alert("Provider name is required");
    }

    if (!courseItemId) {
      return alert("Course Item ID is missing");
    }

    setLoading(true);

    try {
      // Prepare teachingMode and coursesOffered as arrays
      const teachingModeArray = form.teachingMode
        ? form.teachingMode
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];

      const coursesOfferedArray = form.coursesOffered
        ? form.coursesOffered
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s)
        : [];

      const payload = {
        courseItemId: Number(courseItemId),
        name: form.name.trim(),
        image: form.image || null,
        shortDescription: form.shortDescription || null,
        about: form.about || null,
        location: form.location || null,
        area: form.area || null,
        district: form.district || null,
        state: form.state || null,
        mapLink: form.mapLink || null,
        rating: form.rating ? Number(form.rating) : null,
        teachingMode: teachingModeArray,
        coursesOffered: coursesOfferedArray,
        benefits: form.benefits || null,
        mobileNumber: form.mobileNumber || null,
        whatsappNumber: form.whatsappNumber || null,
        websiteUrl: form.websiteUrl || null,
        gallery: form.gallery || [],
      };

      console.log("Saving payload:", payload);

      if (editingId) {
        await axios.put(
          `${COURSE_PROVIDER_API}/${editingId}`,
          payload,
        );
        alert("Provider updated successfully!");
      } else {
        await axios.post(COURSE_PROVIDER_API, payload);
        alert("Provider added successfully!");
      }

      reset();
      await loadData();

      // Scroll to table
      document
        .querySelector(".card:last-child")
        ?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const edit = (item) => {
    console.log("Editing item:", item);

    setEditingId(item.id);
    setForm({
      name: item.name || "",
      image: item.image || "",
      shortDescription: item.shortDescription || "",
      about: item.about || "",
      location: item.location || "",
      area: item.area || "",
      district: item.district || "",
      state: item.state || "",
      mapLink: item.mapLink || "",
      rating: item.rating || "",
      teachingMode: Array.isArray(item.teachingMode)
        ? item.teachingMode.join(", ")
        : item.teachingMode || "",
      coursesOffered: Array.isArray(item.coursesOffered)
        ? item.coursesOffered.join(", ")
        : item.coursesOffered || "",
      benefits: item.benefits || "",
      mobileNumber: item.mobileNumber || "",
      whatsappNumber: item.whatsappNumber || "",
      websiteUrl: item.websiteUrl || "",
      gallery: Array.isArray(item.gallery) ? item.gallery : [],
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE ================= */
  const remove = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this provider?")) return;

    setLoading(true);

    try {
      console.log("Deleting provider:", id);
      await axios.delete(`${COURSE_PROVIDER_API}/${id}`);
      await loadData();
      alert("Provider deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  /* ================= RESET ================= */
  const reset = () => {
    setForm({
      name: "",
      image: "",
      shortDescription: "",
      about: "",
      location: "",
      area: "",
      district: "",
      state: "",
      mapLink: "",
      rating: "",
      teachingMode: "",
      coursesOffered: "",
      benefits: "",
      mobileNumber: "",
      whatsappNumber: "",
      websiteUrl: "",
      gallery: [],
    });
    setEditingId(null);
  };

  // If no courseItemId, show error
  if (!courseItemId) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          <h4>Error: Invalid URL</h4>
          <p>Course Item ID not found in the URL.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/course-categories')}
          >
            Go to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-0">Course Providers</h3>
          <p className="text-muted mb-0">
            Course: <strong>{courseItemName || "Loading..."}</strong>
          </p>
          <p className="text-muted small">
            Item ID: {courseItemId}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => navigate(`/course-categories/${courseItemId}/items`)}
          disabled={loading}
        >
          ← Back to Course Items
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Please wait...</p>
        </div>
      )}

      {/* ================= FORM ================= */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">
            {editingId ? "Edit Provider" : "Add New Provider"}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              {/* Basic Information */}
              <div className="col-md-12">
                <h6 className="border-bottom pb-2">Basic Information</h6>
              </div>

              <div className="col-md-6">
                <label className="form-label">Institute Name *</label>
                <input
                  className="form-control"
                  placeholder="Enter institute name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Short Description</label>
                <input
                  className="form-control"
                  placeholder="Brief description"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({ ...form, shortDescription: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">About the Institute</label>
                <textarea
                  className="form-control"
                  placeholder="Detailed about the institute"
                  rows="3"
                  value={form.about}
                  onChange={(e) => setForm({ ...form, about: e.target.value })}
                  disabled={loading}
                />
              </div>

              {/* Contact Information */}
              <div className="col-md-12">
                <h6 className="border-bottom pb-2 mt-3">Contact Information</h6>
              </div>

              <div className="col-md-4">
                <label className="form-label">Mobile Number</label>
                <input
                  className="form-control"
                  placeholder="Mobile number"
                  value={form.mobileNumber}
                  onChange={(e) =>
                    setForm({ ...form, mobileNumber: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">WhatsApp Number</label>
                <input
                  className="form-control"
                  placeholder="WhatsApp number"
                  value={form.whatsappNumber}
                  onChange={(e) =>
                    setForm({ ...form, whatsappNumber: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Website URL</label>
                <input
                  className="form-control"
                  placeholder="https://example.com"
                  value={form.websiteUrl}
                  onChange={(e) =>
                    setForm({ ...form, websiteUrl: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              {/* Location Information */}
              <div className="col-md-12">
                <h6 className="border-bottom pb-2 mt-3">
                  Location Information
                </h6>
              </div>

              <div className="col-md-3">
                <label className="form-label">Location</label>
                <input
                  className="form-control"
                  placeholder="Location name"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Area</label>
                <input
                  className="form-control"
                  placeholder="Area/Locality"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">District</label>
                <input
                  className="form-control"
                  placeholder="District"
                  value={form.district}
                  onChange={(e) =>
                    setForm({ ...form, district: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">State</label>
                <input
                  className="form-control"
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-12">
                <label className="form-label">Map Link</label>
                <input
                  className="form-control"
                  placeholder="Google Maps URL"
                  value={form.mapLink}
                  onChange={(e) =>
                    setForm({ ...form, mapLink: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              {/* Course Details */}
              <div className="col-md-12">
                <h6 className="border-bottom pb-2 mt-3">Course Details</h6>
              </div>

              <div className="col-md-4">
                <label className="form-label">Rating (0-5)</label>
                <input
                  className="form-control"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Benefits</label>
                <input
                  className="form-control"
                  placeholder="Key benefits"
                  value={form.benefits}
                  onChange={(e) =>
                    setForm({ ...form, benefits: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label">Teaching Mode</label>
                <input
                  className="form-control"
                  placeholder="Online, Offline, Hybrid"
                  value={form.teachingMode}
                  onChange={(e) =>
                    setForm({ ...form, teachingMode: e.target.value })
                  }
                  disabled={loading}
                />
                <small className="text-muted">Comma separated values</small>
              </div>

              <div className="col-md-12">
                <label className="form-label">Courses Offered</label>
                <input
                  className="form-control"
                  placeholder="Web Development, Data Science, AI"
                  value={form.coursesOffered}
                  onChange={(e) =>
                    setForm({ ...form, coursesOffered: e.target.value })
                  }
                  disabled={loading}
                />
                <small className="text-muted">Comma separated values</small>
              </div>

              {/* Images */}
              <div className="col-md-12">
                <h6 className="border-bottom pb-2 mt-3">Images</h6>
              </div>

              {/* Main Image */}
              <div className="col-md-12">
                <label className="form-label">Main Image</label>
                <div className="row">
                  <div className="col-md-8">
                    <input
                      className="form-control"
                      placeholder="Image URL"
                      value={form.image}
                      onChange={(e) =>
                        setForm({ ...form, image: e.target.value })
                      }
                      disabled={loading || uploading}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => uploadImage(e, "image")}
                      disabled={loading || uploading}
                      accept="image/*"
                    />
                  </div>
                </div>
                {uploading && (
                  <div className="mt-2">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </div>
                )}
                {form.image && (
                  <div className="mt-2">
                    <img
                      src={form.image}
                      alt="main"
                      width="100"
                      height="100"
                      className="img-thumbnail"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div className="col-md-12">
                <label className="form-label">Gallery Images</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={(e) => uploadImage(e, "gallery")}
                  disabled={loading || uploadingGallery}
                  accept="image/*"
                />
                {uploadingGallery && (
                  <div className="mt-2">
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Uploading...
                  </div>
                )}

                {form.gallery.length > 0 && (
                  <div className="mt-3">
                    <p className="small text-muted">
                      Gallery Images ({form.gallery.length})
                    </p>
                    <div className="row g-2">
                      {form.gallery.map((url, index) => (
                        <div key={index} className="col-3 col-md-2">
                          <div className="position-relative border rounded p-1">
                            <img
                              src={url}
                              alt={`gallery-${index}`}
                              className="img-fluid rounded"
                              style={{
                                height: "80px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btn-sm position-absolute top-0 end-0"
                              onClick={() => removeGalleryImage(index)}
                              style={{
                                transform: "translate(30%, -30%)",
                                padding: "2px 6px",
                              }}
                              disabled={loading}
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

              {/* Form Buttons */}
              <div className="col-md-12 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || uploading || uploadingGallery}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : editingId ? (
                    "Update Provider"
                  ) : (
                    "Add Provider"
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={reset}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="card">
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Providers List</h5>
          {list.length > 0 && (
            <span className="badge bg-info">{list.length} records</span>
          )}
        </div>
        <div className="card-body">
          {list.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                No providers found. Add your first provider above.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th width="60">Image</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Location</th>
                    <th>Courses</th>
                    <th>Rating</th>
                    <th>Gallery</th>
                    <th width="150">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.image ? (
                          <img
                            src={p.image}
                            width="40"
                            height="40"
                            alt={p.name}
                            className="img-thumbnail"
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <span className="text-muted">📷</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                        {p.shortDescription && (
                          <div className="small text-muted">
                            {p.shortDescription}
                          </div>
                        )}
                      </td>
                      <td>
                        {p.mobileNumber && (
                          <div>
                            <small>📞 {p.mobileNumber}</small>
                          </div>
                        )}
                        {p.whatsappNumber && (
                          <div>
                            <small>💬 {p.whatsappNumber}</small>
                          </div>
                        )}
                      </td>
                      <td>
                        {p.district && p.state ? (
                          <span>
                            {p.area && `${p.area}, `}
                            {p.district}, {p.state}
                          </span>
                        ) : p.location ? (
                          p.location
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {p.coursesOffered && p.coursesOffered.length > 0 ? (
                          <span className="badge bg-info">
                            {p.coursesOffered.length} courses
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {p.rating ? (
                          <span className="badge bg-warning text-dark">
                            {p.rating} ★
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {p.gallery && p.gallery.length > 0 ? (
                          <span className="badge bg-success">
                            {p.gallery.length} images
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => edit(p)}
                          disabled={loading}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => remove(p.id, e)}
                          disabled={loading}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseProviders;