// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        // MTN MoMo brand
        momoBlue: "#004F71",      // MoMo Blue
        mtnSunshine: "#FFCB05",   // MTN Sunshine (official name)
        mtnYellow: "#FFCB05",     // keep old name so existing classes keep working
        mtnDark: "#071426"        // existing deep navy background
        // white is already available as `white` / `text-white`
      }
    }
  },
  plugins: []
};


