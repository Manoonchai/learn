import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // The app is fully client-side (no server routes) and a single route, so we
    // fully prerender to static HTML — the emitted index.html keeps its <head>
    // meta/OG tags for SEO. No SPA fallback needed.
    adapter: adapter({
      pages: "build",
      assets: "build",
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
