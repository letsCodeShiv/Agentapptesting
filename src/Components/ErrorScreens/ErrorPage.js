import React from "react";
import "./Pages.css";
export default function ErrorPage() {
  const containerStyle = {
    minHeight: "100vh", // Ensure full viewport height
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    backgroundColor: "#f8f9fa", // A light background color from Bootstrap's palette
    color: "#495057", // Dark grey text color for contrast
    textAlign: "center",
  };

  return (
    <div className="access-denied-wrapper">
      <div className="lock"></div>
      <div className="message text-center" style={{ marginTop: "20px" }}>
        <h5>Access denied. Please contact the administrator for assistance.</h5>
      </div>
    </div>
  );
}
