/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Operational Light Canvas & Panels
        surface: {
          50: '#F9FAFB',
          100: '#F4F5F7', // Warm/light neutral gray background (#F4F5F7)
          200: '#E5E7EB', // Subtle 1px borders
          300: '#D1D5DB', // Dividers / secondary borders
          400: '#9CA3AF',
          panel: '#FFFFFF', // Pure white panel background
        },
        // High-Contrast Professional Charcoal Typography
        charcoal: {
          900: '#111827', // Deep charcoal headings / primary text
          800: '#1F2937', // Section titles
          700: '#374151', // Body text
          600: '#4B5563', // Secondary descriptions
          500: '#6B7280', // Metadata & unit labels
          400: '#9CA3AF', // Muted placeholders
        },
        // Sovereign India Green & Maritime Emerald Brand Palette
        brand: {
          950: '#02210F',
          900: '#064E26', // Flagship Sovereign Green
          800: '#0D5204', // National India Green
          700: '#116B06',
          600: '#138808', // Indian Flag Green
          500: '#16A34A',
          200: '#BBF7D0',
          100: '#DCFCE7',
          50: '#F0FDF4', // Crisp White-Green Canvas tint
        },
        // Maritime Risk & Incident Colors (No neon)
        risk: {
          red: '#DC2626',      // Critical oil spill / high correlation
          redLight: '#FEE2E2', // Background tint
          amber: '#D97706',    // Moderate priority / warning
          amberLight: '#FEF3C7',
          green: '#16A34A',    // Normal / verified / safe
          greenLight: '#DCFCE7',
          cyan: '#0284C7',     // Hindcast trajectory / oceanic current
          cyanLight: '#E0F2FE',
        },
        // Backward-compatibility bridge mapped strictly to light operations styling
        bridge: {
          950: '#F4F5F7', // Canvas background
          900: '#FFFFFF', // Panel / card background
          850: '#F9FAFB', // Sub-panel / toolbar
          800: '#F3F4F6', // Row hover / light active
          700: '#E5E7EB', // 1px border
          600: '#9CA3AF', // Inactive icons
          500: '#6B7280', // Secondary labels
          400: '#4B5563', // Secondary text
          300: '#374151', // Dark text
          200: '#1F2937', // Primary headings
          100: '#111827', // Charcoal primary text
        },
        // Official Indian Government & Coast Guard Color System
        gov: {
          navy: {
            950: '#00122E', // Deepest Naval Command Blue
            900: '#0B2545', // Indian Coast Guard / MoD Flagship Navy
            850: '#0F315B', // Masthead sub-panel
            800: '#133E70', // Primary Administrative Brand
            700: '#1D4E89', // Interactive Navy Accent
            600: '#2563EB',
            200: '#BFDBFE',
            100: '#E8EFF8',
            50: '#F2F6FB',
          },
          saffron: {
            700: '#9A3412',
            600: '#C85A00', // Deep Indian Saffron
            500: '#E67300', // Official GoI Saffron Accent
            400: '#FF9933', // National Flag Saffron
            200: '#FED7AA',
            100: '#FFEDD5',
            50: '#FFF7ED',
          },
          green: {
            800: '#0D5204',
            700: '#116B06', // Official India Green Accent
            600: '#138808', // National Flag Green
            500: '#16A34A',
            100: '#DCFCE7',
            50: '#F0FDF4',
          },
          gold: {
            700: '#854D0E',
            600: '#B8860B', // Classical Ashoka Gold
            500: '#D4AF37', // Official Emblem Gold
            400: '#E5C158',
            100: '#FEF9C3',
            50: '#FEFCE8',
          },
          slate: {
            950: '#020617',
            900: '#0F172A', // Authoritative Slate Heading
            800: '#1E293B',
            700: '#334155',
            600: '#475569',
            500: '#64748B',
            400: '#94A3B8',
            300: '#CBD5E1',
            200: '#E2E8F0', // Administrative Crisp Border
            100: '#F1F5F9', // Subtle Form Fill
            50: '#F8FAFC',
          },
          parchment: '#FAF9F6', // Official Letterhead White
        },
        tactical: {
          red: '#DC2626',
          amber: '#D97706',
          cyan: '#0284C7',
          emerald: '#16A34A',
          purple: '#7C3AED',
        },
        // National Ministry of Petroleum & Hydrocarbon Authority Tokens
        petroleum: {
          obsidian: '#0D1117',
          charcoal: '#161B22',
          slate: '#1F2937',
          surface: '#111827',
          card: '#1A2230',
          border: '#30363D',
          gold: '#C5A059',
          goldLight: '#DFBE7A',
          goldMuted: 'rgba(197, 160, 89, 0.18)',
          bronze: '#9A7B38',
          parchment: '#F8F9FA',
          amber: '#F59E0B',
          emerald: '#10B981',
          crimson: '#EF4444',
        },
      },
      fontFamily: {
        classic: ['Cinzel', 'Lora', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', '"Noto Serif Devanagari"', 'Lora', 'Georgia', 'serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        cormorant: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Devanagari"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '3px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      }
    },
  },
  plugins: [],
}
