import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { server } from "../main";
import toast from "react-hot-toast";
import { FiDownload, FiX } from "react-icons/fi";

const Certificate = ({ certificate, onClose }) => {
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchCertificateData = async () => {
      try {
        const { data } = await axios.get(
          `${server}/api/certificate/${certificate.certificateId}`
        );
        setCertData(data.certificate);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificate:", error);
        toast.error("Failed to load certificate details");
        setLoading(false);
      }
    };

    fetchCertificateData();
  }, [certificate.certificateId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  
  // Calculate score percentage
  const calculateScorePercentage = () => {
    if (!certData) return "";
    
    // Check if we have test.questions data
    if (certData.test && certData.test.questions && certData.test.questions.length) {
      return `${Math.round((certData.score / certData.test.questions.length) * 100)}%`;
    }
    
    // Fallback to a simple percentage assuming 4 questions
    return `${Math.round((certData.score / 4) * 100)}%`;
  };

  const downloadAsPDF = () => {
    if (!certificateRef.current) return;

    toast.loading("Generating PDF...");

    const certificateElement = certificateRef.current;
    
    window.html2canvas(certificateElement, {
      scale: 2,
      useCORS: true,
      logging: false,
    }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new window.jspdf.jsPDF("landscape", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificate-${certData.certificateId}.pdf`);
      
      toast.dismiss();
      toast.success("Certificate downloaded successfully");
    }).catch(err => {
      console.error("Error downloading certificate:", err);
      toast.dismiss();
      toast.error("Failed to download certificate");
    });
  };

  if (loading) {
    return (
      <div className="certificate-loading">
        <div className="loading-spinner"></div>
        <h2>Loading Certificate...</h2>
      </div>
    );
  }

  return (
    <div className="certificate-container">
      <div className="certificate-actions">
        <button className="close-btn" onClick={onClose}>
          <FiX />
        </button>
        <button className="download-btn" onClick={downloadAsPDF}>
          <FiDownload /> Download Certificate
        </button>
      </div>
      
      <div className="certificate-wrapper" ref={certificateRef}>
        <div className="certificate">
          <div className="certificate-header">
            <h1>Certificate of Completion</h1>
          </div>
          
          <div className="certificate-content">
            <p className="presented-to">This is to certify that</p>
            <h2 className="student-name">{certData.user.name}</h2>
            <p className="completion-text">has successfully completed</p>
            <h3 className="course-name">{certData.course.title}</h3>
            <p className="lecture-detail">Lecture: {certData.lecture.title}</p>
            <p className="completion-date">
              Issued on {formatDate(certData.issuedDate)}
            </p>
            
            <div className="certificate-score">
              Score: {calculateScorePercentage()}
            </div>
            
            <div className="certificate-id">
              Certificate ID: {certData.certificateId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate; 