/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          void: '#09090E',
          DEFAULT: '#09090E',
          pure: '#000000',
          card: '#12131A',
          surface: '#181822',
          elevated: '#21212B',
          border: '#272733',
          subtle: '#1C1C24',
          muted: '#71717A',
          text: {
            primary: '#FFFFFF',
            secondary: '#E4E4E7',
            muted: '#A1A1AA',
          },
        },
        gold: {
          50: '#FFFDF5',
          100: '#FEF9E7',
          200: '#FDF0C5',
          300: '#FCE498',
          400: '#FBD261',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#EAE5DB',
          300: '#DCD5C7',
          400: '#A8A29E',
        },
        canvas: {
          light: '#09090E',
          DEFAULT: '#09090E',
          muted: '#181822',
          card: '#12131A',
          border: '#272733',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
          800: '#9F1239',
          900: '#881337',
        },
        red: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        plum: {
          50: '#FAF8F5',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D4D4D8',
          400: '#A1A1AA',
          500: '#71717A',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
        sage: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#22C55E',
          600: '#16A34A',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        }
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          'Outfit',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
        serif: [
          '"Playfair Display"',
          'Georgia',
          'serif'
        ]
      },
      boxShadow: {
        'obsidian': '0 4px 20px -2px rgba(0, 0, 0, 0.7)',
        'obsidian-lg': '0 12px 36px -4px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'gold-glow': '0 0 24px -2px rgba(245, 158, 11, 0.35)',
        'gold-glow-sm': '0 0 12px -2px rgba(245, 158, 11, 0.25)',
        'soft-float': '0 12px 30px -4px rgba(245, 158, 11, 0.28), 0 4px 10px -2px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
