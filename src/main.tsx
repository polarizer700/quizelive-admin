import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource/space-mono";
import "@fontsource/space-mono/700.css";
import "@fontsource-variable/outfit";
import "@app/styles/index.css";

import { Bootstrap } from "@app/bootstrap";

const root = document.getElementById("root");
if (!root) throw new Error("root element is missing");

createRoot(root).render(
  <StrictMode>
    <Bootstrap />
  </StrictMode>,
);
