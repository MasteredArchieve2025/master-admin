import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { JOB_DETAILS_API, JOB_CATEGORY_API } from "../../api/api";

const JobDetails = () => {
  const { categoryId } = useParams();
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    jobCategoryId: categoryId || "",
    companyName: "",
    jobName: "",
    area: "",
    district: "",
    state: "",
    tags: [],
    salaryRange: "",
    jobDescription: "",
    requirements: "",
    experience: "",
    applicationDeadline: "",
    mapLink: "",
    applyLink: ""
  });

  const [tagInput, setTagInput] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const res = await axios.get(JOB_CATEGORY_API);
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      let url = JOB_DETAILS_API;
      if (selectedCategory) {
        url += `?jobCategoryId=${selectedCategory}`;
      }
      const res = await axios.get(url);
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setList(data);
    } catch (err) {
      console.error("Load failed", err);
      alert("Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !form.tags.includes(newTag)) {
        setForm({
          ...form,
          tags: [...form.tags, newTag]
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.jobCategoryId) {
      return alert("Please select a job category");
    }
    if (!form.companyName.trim()) {
      return alert("Company name is required");
    }
    if (!form.jobName.trim()) {
      return alert("Job name is required");
    }

    const submitForm = {
      ...form,
      applicationDeadline: form.applicationDeadline ? new Date(form.applicationDeadline).toISOString() : null
    };

    try {
      if (editingId) {
        await axios.put(`${JOB_DETAILS_API}/${editingId}`, submitForm);
        alert("Job details updated successfully!");
      } else {
        await axios.post(JOB_DETAILS_API, submitForm);
        alert("Job details added successfully!");
      }

      reset();
      loadData();
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

  const edit = (job) => {
    setEditingId(job.id);
    setForm({
      jobCategoryId: job.jobCategoryId,
      companyName: job.companyName || "",
      jobName: job.jobName || "",
      area: job.area || "",
      district: job.district || "",
      state: job.state || "",
      tags: job.tags || [],
      salaryRange: job.salaryRange || "",
      jobDescription: job.jobDescription || "",
      requirements: job.requirements || "",
      experience: job.experience || "",
      applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : "",
      mapLink: job.mapLink || "",
      applyLink: job.applyLink || ""
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this job posting?")) return;

    try {
      await axios.delete(`${JOB_DETAILS_API}/${id}`);
      loadData();
      alert("Deleted successfully!");
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const reset = () => {
    setForm({
      jobCategoryId: categoryId || "",
      companyName: "",
      jobName: "",
      area: "",
      district: "",
      state: "",
      tags: [],
      salaryRange: "",
      jobDescription: "",
      requirements: "",
      experience: "",
      applicationDeadline: "",
      mapLink: "",
      applyLink: ""
    });
    setEditingId(null);
    setTagInput("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || `Category ${categoryId}`;
  };

  return (
    <div className="container-fluid mt-4 px-4">
      {/* Header with Navigation */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">Job Details Management</h3>
          {categoryId && (
            <p className="text-muted mb-0">
              Showing jobs for: <strong>{getCategoryName(parseInt(categoryId))}</strong>
              <button 
                className="btn btn-link btn-sm p-0 ms-2" 
                onClick={() => {
                  setSelectedCategory("");
                  navigate("/job-details");
                }}
              >
                Clear filter
              </button>
            </p>
          )}
        </div>
        <button 
          className="btn btn-outline-primary" 
          onClick={() => navigate("/job-categories")}
        >
          <i className="fas fa-arrow-left me-2"></i>Back to Categories
        </button>
      </div>

      {/* Filter by Category */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label fw-bold">Filter by Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              if (e.target.value) {
                navigate(`/job-categories/${e.target.value}/details`);
              } else {
                navigate("/job-details");
              }
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0">
            <i className="fas fa-plus-circle me-2"></i>
            {editingId ? "Edit Job Details" : "Add New Job"}
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={submit}>
            <div className="row g-3">
              {/* Category Selection */}
              <div className="col-md-4">
                <label className="form-label fw-bold">Job Category *</label>
                <select
                  className="form-select"
                  value={form.jobCategoryId}
                  onChange={(e) => setForm({ ...form, jobCategoryId: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Company & Job Name */}
              <div className="col-md-4">
                <label className="form-label fw-bold">Company Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  required
                  placeholder="e.g., Infosys"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Job Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.jobName}
                  onChange={(e) => setForm({ ...form, jobName: e.target.value })}
                  required
                  placeholder="e.g., Frontend Developer"
                />
              </div>

              {/* Location Fields */}
              <div className="col-md-4">
                <label className="form-label fw-bold">Area</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  placeholder="e.g., T Nagar"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">District</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  placeholder="e.g., Chennai"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="e.g., Tamil Nadu"
                />
              </div>

              {/* Tags Input */}
              <div className="col-md-6">
                <label className="form-label fw-bold">Tags (Press Enter or Comma to add)</label>
                <input
                  type="text"
                  className="form-control"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g., Remote, Fulltime, Urgent"
                />
                <div className="mt-2">
                  {form.tags.map((tag, index) => (
                    <span key={index} className="badge bg-info me-2 p-2" style={{ fontSize: '14px' }}>
                      {tag}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: '10px', lineHeight: '1' }}
                        onClick={() => removeTag(tag)}
                        aria-label="Remove tag"
                      ></button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary & Experience */}
              <div className="col-md-3">
                <label className="form-label fw-bold">Salary Range</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.salaryRange}
                  onChange={(e) => setForm({ ...form, salaryRange: e.target.value })}
                  placeholder="e.g., 45k-65k"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label fw-bold">Experience</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="e.g., 2+ years"
                />
              </div>

              {/* Application Deadline */}
              <div className="col-md-3">
                <label className="form-label fw-bold">Application Deadline</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.applicationDeadline}
                  onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                />
              </div>

              {/* Links */}
              <div className="col-md-4">
                <label className="form-label fw-bold">Map Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.mapLink}
                  onChange={(e) => setForm({ ...form, mapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-bold">Apply Link</label>
                <input
                  type="url"
                  className="form-control"
                  value={form.applyLink}
                  onChange={(e) => setForm({ ...form, applyLink: e.target.value })}
                  placeholder="https://company.com/careers/..."
                />
              </div>

              {/* Description & Requirements */}
              <div className="col-md-6">
                <label className="form-label fw-bold">Job Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.jobDescription}
                  onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
                  placeholder="Enter job description..."
                ></textarea>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Requirements</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="Enter requirements (comma separated)"
                ></textarea>
              </div>

              {/* Form Buttons */}
              <div className="col-12 mt-4">
                <button type="submit" className="btn btn-primary px-4 py-2">
                  <i className="fas fa-save me-2"></i>
                  {editingId ? "Update Job" : "Add Job"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary ms-2 px-4 py-2" onClick={reset}>
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Job Listings Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light py-3">
          <h5 className="mb-0">
            <i className="fas fa-list me-2"></i>
            Job Listings ({list.length})
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered table-hover mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="text-center">Category</th>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Salary</th>
                  <th>Experience</th>
                  <th>Deadline</th>
                  <th>Tags</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-5">
                      <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                      No job details found. Add your first job above.
                    </td>
                  </tr>
                ) : (
                  list.map((job) => (
                    <tr key={job.id}>
                      <td className="text-center">
                        <span className="badge bg-info">{job.categoryName || getCategoryName(job.jobCategoryId)}</span>
                      </td>
                      <td><strong>{job.companyName}</strong></td>
                      <td>{job.jobName}</td>
                      <td>{[job.area, job.district, job.state].filter(Boolean).join(', ') || '-'}</td>
                      <td><span className="badge bg-success">{job.salaryRange || '-'}</span></td>
                      <td>{job.experience || '-'}</td>
                      <td><span className="badge bg-warning text-dark">{formatDate(job.applicationDeadline)}</span></td>
                      <td>
                        {job.tags?.map((tag, idx) => (
                          <span key={idx} className="badge bg-secondary me-1">{tag}</span>
                        ))}
                        {(!job.tags || job.tags.length === 0) && '-'}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => edit(job)}
                        >
                          <i className="fas fa-edit me-1"></i>Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm me-2"
                          onClick={() => remove(job.id)}
                        >
                          <i className="fas fa-trash me-1"></i>Delete
                        </button>
                        {job.applyLink && (
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-success btn-sm"
                          >
                            <i className="fas fa-external-link-alt me-1"></i>Apply
                          </a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;