/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Spider-Man Red — vivid, iconic, elegant
        red: {
          50:  '#fff2f2',
          100: '#ffe0e0',
          200: '#ffc0c0',
          300: '#ff8080',
          400: '#ff4848',   // bright text red — readable on black
          500: '#ff2d2d',   // vivid Spider-Man red
          600: '#e01515',   // primary suit red (buttons, active states)
          700: '#c01010',   // darker accent
          800: '#900c0c',   // deep shadow red
          900: '#5c0808',
          950: '#380404',
        },
        rose: {
          50:  '#fff1f2',
          100: '#ffe0e1',
          200: '#ffc8c9',
          300: '#ff9495',
          400: '#ff5a5b',   // rose highlight
          500: '#ff3333',   // bright accent
          600: '#e01515',   // same base as red-600
          700: '#c01010',
          800: '#8c0c0c',
          900: '#580808',
          950: '#360404',
        },
        // Backgrounds — pure black (Spider-Man's domain)
        void:    '#000000',
        'void-2':'#050505',
        'void-3':'#0a0a0a',
        // Named spider tokens
        'spider-red':    '#e01515',
        'spider-bright': '#ff3b3b',
        'spider-dark':   '#8c0a0a',
        'spider-glow':   '#ff4848',
        // Semantic (keep green/amber for success/warning)
        success: '#10b981',
        warning: '#f59e0b',
        error:   '#e01515',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'spider-gradient': 'linear-gradient(135deg, #000000 0%, #0a0000 100%)',
        'glow-red':   'radial-gradient(ellipse at center, rgba(224,21,21,0.18) 0%, transparent 70%)',
        'card-gradient': 'linear-gradient(135deg, rgba(224,21,21,0.06) 0%, rgba(255,59,59,0.03) 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(224,21,21,0.5)',
        'glow':    '0 0 24px rgba(224,21,21,0.6)',
        'glow-lg': '0 0 48px rgba(224,21,21,0.65)',
        'glow-bright': '0 0 20px rgba(255,59,59,0.5)',
        'glass':   '0 8px 32px rgba(0,0,0,0.7)',
        'card':    '0 4px 24px rgba(0,0,0,0.6)',
      },
      animation: {
        'spin-slow':     'spin 8s linear infinite',
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'glow-pulse':    'glowPulse 2s ease-in-out infinite',
        'web-draw':      'webDraw 3s ease-in-out forwards',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up':   'slideInUp 0.3s ease-out',
        'fade-in':       'fadeIn 0.3s ease-out',
        'scale-in':      'scaleIn 0.2s ease-out',
        'shimmer':       'shimmer 2s linear infinite',
      },
      keyframes: {
        float:       { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        glowPulse:   { '0%,100%': { boxShadow: '0 0 12px rgba(224,21,21,0.4)' }, '50%': { boxShadow: '0 0 36px rgba(224,21,21,0.8)' } },
        webDraw:     { '0%': { strokeDashoffset: '1000', opacity: '0' }, '100%': { strokeDashoffset: '0', opacity: '1' } },
        slideInLeft: { '0%': { transform: 'translateX(-100%)', opacity: '0' }, '100%': { transform: 'translateX(0)', opacity: '1' } },
        slideInUp:   { '0%': { transform: 'translateY(30px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:      { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleIn:     { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        shimmer:     { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
