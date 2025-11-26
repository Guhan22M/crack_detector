import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Card, Button, Modal, Row, Col } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const userInfoStr = localStorage.getItem("userInfo");

  const userInfo = JSON.parse(userInfoStr);

  useEffect(() => {
    const fetchHistory = async () => {
      try {

        if (!userInfo) {
          console.error("User info missing, please log in");
          return;
        }
        
        if (!userInfoStr) {
          console.error("No user info found in localStorage. Please log in again.");
          setHistory([]);
          return;
        }
        if (!userInfo._id) {
          console.error("User ID is missing in stored user info.");
          setHistory([]);
          return;
        }
  
        const res = await axios.get(`/api/cracks/my-cracks`,{
          headers:{
            Authorization: `Bearer ${userInfo.token}`,
          },
        });
        console.log("History API response", res.data);
        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err.response?.data || err.message);
        setHistory([]);
      }
    };
  
    fetchHistory();
  }, [userInfo, userInfoStr]);

  const deleteHistory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`/api/cracks/${id}`,{
        headers:{
          Authorization: `Bearer ${userInfo.token}`,
        }
      });
      setHistory(history.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error deleting history:", err);
    }
  };
  const getBase64ImageFromUrl = async (imageUrl) => {
    const res = await fetch(imageUrl, { mode: "cors" });
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };
  
  const downloadPDF = async (item) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text("Crack Detection Report", 14, 20);
  
    // Date
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  
    // Add Image if available
    try {
      if (item.imageUrl) {
        const base64Img = await getBase64ImageFromUrl(item.imageUrl);
        doc.addImage(base64Img, "JPEG", 14, 35, 60, 60);
      }
    } catch (error) {
      console.error("Image load failed:", error);
      doc.text("(Image could not be loaded)", 14, 40);
    }
  
    // Crack Details Table
    const details = [
      ["Length", item.crackDetails?.length || "N/A"],
      ["Width", item.crackDetails?.width || "N/A"],
      ["Severity", item.crackDetails?.severity || "N/A"],
      ["Solutions", item.solution || "N/A"],
      ["Prediction", item.prediction || "N/A"],
      ["Confidence", item.confidence || "N/A"],
    ];
  
    autoTable(doc, {
      startY: 100,
      head: [["Attribute", "Value"]],
      body: details,
    });
  
    // Save PDF
    doc.save(`Crack_Report_${item._id}.pdf`);
  };  

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Crack Detection History</h2>
      <Row>
        {history.length === 0 && <p>No history found.</p>}
        {history.map((item) => (
          <Col key={item._id} sm={12} md={6} lg={4} className="mb-4">
            <Card>
              <Card.Img
                variant="top"
                src={item.imageUrl}
                style={{ height: "200px", objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>Prediction: {item.prediction}</Card.Title>
                <Card.Text>
                  <strong>Confidence: {(item.confidence*100).toFixed(2)} %</strong> <br />
                  <strong>Severity: {item.crackDetails.severity} </strong>
                </Card.Text>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => {
                    setSelected(item);
                    setShowModal(true);
                  }}
                >
                  Details
                </Button>
                <Button
                  variant="danger"
                  onClick={() => deleteHistory(item._id)}
                >
                  Delete
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal for details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crack Details</Modal.Title>
        </Modal.Header>
        {selected && (
          <Modal.Body>
            <img
              src={selected.imageUrl}
              alt="Crack"
              className="img-fluid mb-3"
              style={{ maxHeight: "300px", objectFit: "contain" }}
            />
            <p><strong>Prediction:</strong> {selected.prediction}</p>
            <p><strong>Confidence:</strong> {(selected.confidence*100).toFixed(2)}<strong> %</strong></p>
            <p><strong>Length:</strong> {selected.crackDetails.length}<strong> mm</strong></p>
            <p><strong>Width:</strong> {selected.crackDetails.width}<strong> mm</strong></p>
            <p><strong>Severity:</strong> {selected.crackDetails.severity}</p>
            <p><strong>Solutions:</strong> {selected.solution}</p>
          </Modal.Body>
        )}
        <Modal.Footer>
          {selected && (
            <Button variant="success" onClick={() => downloadPDF(selected)}>
              Download PDF
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default History;
