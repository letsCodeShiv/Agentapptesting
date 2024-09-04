import React from "react";

export default function SolvedTicketError() {
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
      {/* <h1 className="display-1">Error</h1> */}
      <h3 className="display-1">This Ticket is Already Closed</h3>
      <p>The ticket you're trying to access has already been closed.</p>
    </div>
  );
}
