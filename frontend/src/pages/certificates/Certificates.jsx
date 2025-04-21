import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";
import { FiAward, FiDownload, FiEye } from "react-icons/fi";
import { Helmet } from "react-helmet-async";
import Certificate from "../../components/Certificate";
import "./certificates.css";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data } = await axios.get(`${server}/api/certificates`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        
        setCertificates(data.certificates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        toast.error("Failed to load certificates");
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const viewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading Your Certificates</h2>
        <p>Please wait while we retrieve your achievements</p>
      </div>
    );
  }

  // Display certificate viewer when a certificate is selected
  if (selectedCertificate) {
    return (
      <Certificate 
        certificate={selectedCertificate} 
        onClose={() => setSelectedCertificate(null)} 
      />
    );
  }

  return (
    <div className="certificates-page">
      <Helmet>
        <title>Your Certificates | E-Learning Platform</title>
      </Helmet>
      
      <div className="certificates-header">
        <h1><FiAward /> Your Certificates</h1>
        <p>View and download your achievement certificates</p>
      </div>
      
      {certificates.length === 0 ? (
        <div className="no-certificates">
          <div className="no-cert-icon">
            <FiAward size={60} />
          </div>
          <h2>No Certificates Yet</h2>
          <p>Complete course tests with a passing score to earn certificates.</p>
        </div>
      ) : (
        <div className="certificates-grid">
          {certificates.map((cert) => (
            <div key={cert._id} className="certificate-card">
              <div className="certificate-card-header">
                <FiAward className="certificate-icon" />
                <h3>Certificate of Completion</h3>
              </div>
              
              <div className="certificate-card-content">
                <h4>{cert.course.title}</h4>
                <p className="lecture-name">Lecture: {cert.lecture.title}</p>
                <p className="issue-date">Issued: {formatDate(cert.issuedDate)}</p>
                <p className="certificate-id">ID: {cert.certificateId}</p>
              </div>
              
              <div className="certificate-card-actions">
                <button 
                  className="view-btn" 
                  onClick={() => viewCertificate(cert)}
                >
                  <FiEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Certificates; 