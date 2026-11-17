import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider, hydrate } from "@tanstack/react-query";
import App from "./App";
import { createQueryClient } from "./queryClient";
import { beginHydration } from "./lib/hydration";
import "./index.css";

// The id of the JSON block scripts/prerender.mjs writes into each page; the
// script spells the same string.
const PRERENDER_STATE_ID = "prerender-state";

const queryClient = createQueryClient();
const root = document.getElementById("root") as HTMLElement;

// A prerendered page (the landing page, the resume, each permalink, the 404)
// arrives with its HTML already in #root and the query cache it was built
// from in a JSON block. Hydrating against that same cache makes the first
// browser render identical to the HTML, so React adopts it instead of
// replacing it. The admin and the game are served as an empty shell
// (app.html) and render from scratch as before.
//
// The block is type="application/json", so the browser never executes it,
// which keeps it outside a script-src content security policy.
const stateBlock = document.getElementById(PRERENDER_STATE_ID);

const app = (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

if (stateBlock && root.hasChildNodes()) {
  try {
    hydrate(queryClient, JSON.parse(stateBlock.textContent ?? "null"));
  } catch {
    // A corrupt block costs only the head start: the queries fetch, and
    // hydration falls back to a client render where the markup differs.
  }
  beginHydration();
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
