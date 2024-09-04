import React from "react";

export default function AccessDenied() {
  return (
    <div className="access-denied-wrapper">
      <div className="lock"></div>
      <div className="message text-center">
        <h1>Access to this page is restricted</h1>
        <p>
          Please check with the site admin if you believe this is a mistake.
        </p>
      </div>
    </div>
  );
}
