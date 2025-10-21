import React, { useState, useRef } from "react";
import uploadToCloudinary from "../utils/uploadToCloud"; 
import { Modal, Button } from "react-bootstrap";
import "../styles/home.css";

const CrackUploadPage = () => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  const storedUser = localStorage.getItem("userInfo");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setAnalysisResult(null);

    if (!file) {
      setMessage("Please select an image.");
      return;
    }

    if (!user || !user.token) {
      setMessage("❌ User not authenticated. Please log in.");
      return;
    }

    try {
      setLoading(true);

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // Send to backend
      const res = await fetch("http://localhost:5000/api/cracks/analyse", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          imageUrl,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send data to backend");
      }

      const data = await res.json();
      setAnalysisResult({
        length: data.crackDetails.length,
        width: data.crackDetails.width,
        severity: data.crackDetails.severity,
        solution: data.solution,
        imageUrl: data.imageUrl,
      });

      setMessage("✅ Crack uploaded and analyzed successfully!");
      setShowModal(true); // <-- open modal after success
      setFile(null);
      setPreview("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <h2 className="mb-3">Upload Crack Image</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-3 d-flex flex-column gap-2">
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={handleFileChange}
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            id="cameraInput"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <label htmlFor="cameraInput" className="btn btn-outline-primary w-100">
            📷 Take Photo
          </label>
        </div>

        {preview && (
          <div className="mb-3">
            <img
              src={preview}
              alt="Preview"
              style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
            />
          </div>
        )}

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the crack..."
          ></textarea>
        </div>

        <button
          type="submit"
          className="btn btn-success"
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>

      {message && (
        <div className="alert mt-3 alert-info">
          {message}
        </div>
      )}

      {/* --- Modal for analysis result --- */}
      {analysisResult && (
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Crack Analysis Result</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <img 
              src={analysisResult.imageUrl} 
              alt="Crack" 
              className="img-fluid mb-3" 
              style={{ maxHeight: "300px", objectFit: "contain" }}
            />
            <p><strong>Length:</strong> {analysisResult.length}</p>
            <p><strong>Width:</strong> {analysisResult.width}</p>
            <p><strong>Severity:</strong> {analysisResult.severity}</p>
            <p><strong>Solutions:</strong> {analysisResult.solution}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CrackUploadPage;
