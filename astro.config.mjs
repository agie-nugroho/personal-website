import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const previewHostname = process.env.PREVIEW_HOSTNAME;

const base = "/personal-website";
const isBuild = process.argv.includes("build");

export default defineConfig({
  site: "https://agie-nugroho.github.io",
  base: isBuild ? base : "/",
  output: "static",

  server: {
    host: true,
    port: 3000,
  },

  vite: {
    plugins: [tailwindcss()],

    optimizeDeps: {
      include: ["gsap", "gsap/ScrollTrigger", "lenis"],
    },

    server: previewHostname ? { allowedHosts: [previewHostname] } : {},
  },
});
