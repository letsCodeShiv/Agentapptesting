import React from "react";

export default function NotFoundPage() {
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
    <div style={containerStyle}>
      <h1 className="display-1">400</h1>
      <h3 className="display-1">OAuth Not Found</h3>
      <p>
        The OAuth process is not completed yet, please ask your administrator to
        complete the process
      </p>
    </div>
  );
}
