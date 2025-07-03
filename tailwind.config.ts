import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  // 大部分配置已移至 CSS 中的 @theme 指令
  // 这样可以获得更好的性能和开发体验
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
