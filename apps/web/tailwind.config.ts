import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#91C6BC',
                    DEFAULT: '#4B9DA9',
                    dark: '#3A7D87',
                },
                accent: {
                    light: '#F6F3C2',
                    DEFAULT: '#E37434',
                    dark: '#C25E1F',
                },
                background: '#FAFAFA',
                surface: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideIn: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            boxShadow: {
                'soft': '0 2px 15px rgba(75, 157, 169, 0.1)',
                'soft-lg': '0 10px 40px rgba(75, 157, 169, 0.15)',
            },
        },
    },
    plugins: [],
} satisfies Config;
