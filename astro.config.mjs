import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Hostnames allowed to reach the dev server. Set PREVIEW_HOSTNAME when starting
// `astro dev` in a hosted preview so the preview origin is accepted exactly.
const previewHostname = process.env.PREVIEW_HOSTNAME;

export default defineConfig({
  site: "https://agie-nugroho.github.io",
  base: "/personal-website",
  output: "static",
  server: { host: true, port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    server: previewHostname ? { allowedHosts: [previewHostname] } : {},
  },
});
