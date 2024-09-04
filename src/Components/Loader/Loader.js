import React from "react";
import logo from "./logo.png";
import "./Loader.css";

export default function Loader() {
  return (
    <div className="spinner">
      <img src={logo} alt="Loading..." className="spinner-logo" />
    </div>
  );
}
