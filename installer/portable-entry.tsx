import React from "react";
import { createRoot } from "react-dom/client";
import AtlasApp from "../app/AtlasApp";

const root = document.getElementById("root");

if (!root) {
  throw new Error("RAP ATLAS root element is missing");
}

createRoot(root).render(<AtlasApp />);
