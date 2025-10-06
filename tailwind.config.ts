import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Consolas', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient': 'gradientShift 15s ease infinite',
        'liquid': 'liquidShift 8s ease-in-out infinite',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite',
      },
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(17, 24, 39, 0.7)',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 12px 40px 0 rgba(31, 38, 135, 0.45)',
        'glow': '0 0 20px rgba(102, 126, 234, 0.4)',
      },
    },
  },
};
export default config;