/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";
import { THEMES } from "./src/constants"; // Import the themes from your file

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: THEMES,
  },
};
