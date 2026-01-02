/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Custom font families
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      
      // Extended spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      
      // Extended max-width scale
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem',
      },
      
      // Extended min-height scale
      minHeight: {
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
      },
      
      // Border radius with CSS custom properties
      borderRadius: {
        'lg': 'var(--radius)',
        'md': 'calc(var(--radius) - 2px)',
        'sm': 'calc(var(--radius) - 4px)',
        'xs': 'calc(var(--radius) - 6px)',
        '2xl': 'calc(var(--radius) + 4px)',
        '3xl': 'calc(var(--radius) + 8px)',
        'full': '9999px',
      },
      
      // Color palette with CSS custom properties
      colors: {
        // Background colors
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Card colors
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        
        // Popover colors
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        
        // Primary colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))',
        },
        
        // Secondary colors
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: 'hsl(var(--secondary-50))',
          100: 'hsl(var(--secondary-100))',
          200: 'hsl(var(--secondary-200))',
          300: 'hsl(var(--secondary-300))',
          400: 'hsl(var(--secondary-400))',
          500: 'hsl(var(--secondary-500))',
          600: 'hsl(var(--secondary-600))',
          700: 'hsl(var(--secondary-700))',
          800: 'hsl(var(--secondary-800))',
          900: 'hsl(var(--secondary-900))',
          950: 'hsl(var(--secondary-950))',
        },
        
        // Muted colors
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
          50: 'hsl(var(--muted-50))',
          100: 'hsl(var(--muted-100))',
          200: 'hsl(var(--muted-200))',
          300: 'hsl(var(--muted-300))',
          400: 'hsl(var(--muted-400))',
          500: 'hsl(var(--muted-500))',
          600: 'hsl(var(--muted-600))',
          700: 'hsl(var(--muted-700))',
          800: 'hsl(var(--muted-800))',
          900: 'hsl(var(--muted-900))',
          950: 'hsl(var(--muted-950))',
        },
        
        // Accent colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: 'hsl(var(--accent-50))',
          100: 'hsl(var(--accent-100))',
          200: 'hsl(var(--accent-200))',
          300: 'hsl(var(--accent-300))',
          400: 'hsl(var(--accent-400))',
          500: 'hsl(var(--accent-500))',
          600: 'hsl(var(--accent-600))',
          700: 'hsl(var(--accent-700))',
          800: 'hsl(var(--accent-800))',
          900: 'hsl(var(--accent-900))',
          950: 'hsl(var(--accent-950))',
        },
        
        // Destructive colors
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          50: 'hsl(var(--destructive-50))',
          100: 'hsl(var(--destructive-100))',
          200: 'hsl(var(--destructive-200))',
          300: 'hsl(var(--destructive-300))',
          400: 'hsl(var(--destructive-400))',
          500: 'hsl(var(--destructive-500))',
          600: 'hsl(var(--destructive-600))',
          700: 'hsl(var(--destructive-700))',
          800: 'hsl(var(--destructive-800))',
          900: 'hsl(var(--destructive-900))',
          950: 'hsl(var(--destructive-950))',
        },
        
        // Success colors
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          50: 'hsl(var(--success-50))',
          100: 'hsl(var(--success-100))',
          200: 'hsl(var(--success-200))',
          300: 'hsl(var(--success-300))',
          400: 'hsl(var(--success-400))',
          500: 'hsl(var(--success-500))',
          600: 'hsl(var(--success-600))',
          700: 'hsl(var(--success-700))',
          800: 'hsl(var(--success-800))',
          900: 'hsl(var(--success-900))',
          950: 'hsl(var(--success-950))',
        },
        
        // Warning colors
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          50: 'hsl(var(--warning-50))',
          100: 'hsl(var(--warning-100))',
          200: 'hsl(var(--warning-200))',
          300: 'hsl(var(--warning-300))',
          400: 'hsl(var(--warning-400))',
          500: 'hsl(var(--warning-500))',
          600: 'hsl(var(--warning-600))',
          700: 'hsl(var(--warning-700))',
          800: 'hsl(var(--warning-800))',
          900: 'hsl(var(--warning-900))',
          950: 'hsl(var(--warning-950))',
        },
        
        // Info colors
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          50: 'hsl(var(--info-50))',
          100: 'hsl(var(--info-100))',
          200: 'hsl(var(--info-200))',
          300: 'hsl(var(--info-300))',
          400: 'hsl(var(--info-400))',
          500: 'hsl(var(--info-500))',
          600: 'hsl(var(--info-600))',
          700: 'hsl(var(--info-700))',
          800: 'hsl(var(--info-800))',
          900: 'hsl(var(--info-900))',
          950: 'hsl(var(--info-950))',
        },
        
        // Border, input, and ring colors
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Chart colors for data visualization
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
          6: 'hsl(var(--chart-6))',
        },
        
        // Additional semantic colors
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          border: 'hsl(var(--sidebar-border))',
        },
      },
      
      // Extended keyframes for animations
      keyframes: {
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-in-down': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-10px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        
        // Scale animations
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'scale-out': {
          '0%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(0.95)',
          },
        },
        
        // Slide animations
        'slide-in-from-top': {
          '0%': { 
            transform: 'translateY(-100%)',
          },
          '100%': { 
            transform: 'translateY(0)',
          },
        },
        'slide-in-from-bottom': {
          '0%': { 
            transform: 'translateY(100%)',
          },
          '100%': { 
            transform: 'translateY(0)',
          },
        },
        'slide-in-from-left': {
          '0%': { 
            transform: 'translateX(-100%)',
          },
          '100%': { 
            transform: 'translateX(0)',
          },
        },
        'slide-in-from-right': {
          '0%': { 
            transform: 'translateX(100%)',
          },
          '100%': { 
            transform: 'translateX(0)',
          },
        },
        
        // Accordion animations
        'accordion-down': {
          from: { 
            height: '0',
            opacity: '0',
          },
          to: { 
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
        },
        'accordion-up': {
          from: { 
            height: 'var(--radix-accordion-content-height)',
            opacity: '1',
          },
          to: { 
            height: '0',
            opacity: '0',
          },
        },
        
        // Collapsible animations
        'collapsible-down': {
          from: { 
            height: '0',
            opacity: '0',
          },
          to: { 
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
          },
        },
        'collapsible-up': {
          from: { 
            height: 'var(--radix-collapsible-content-height)',
            opacity: '1',
          },
          to: { 
            height: '0',
            opacity: '0',
          },
        },
        
        // Bounce animations
        'bounce-slow': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10%)',
          },
        },
        
        // Pulse animations
        'pulse-slow': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        
        // Spin animations
        'spin-slow': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        
        // Shimmer animation
        'shimmer': {
          '0%': {
            backgroundPosition: '-200px 0',
          },
          '100%': {
            backgroundPosition: 'calc(200px + 100%) 0',
          },
        },
        
        // Progress animation
        'progress': {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        
        // Caret blink animation
        'caret-blink': {
          '0%, 70%, 100%': {
            opacity: '1',
          },
          '20%, 50%': {
            opacity: '0',
          },
        },
        
        // Skeleton pulse
        'skeleton-pulse': {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.5',
          },
        },
        
        // Float animation
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      
      // Animation utilities
      animation: {
        // Basic animations
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        
        // Scale animations
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        
        // Slide animations
        'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
        'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
        'slide-in-from-left': 'slide-in-from-left 0.3s ease-out',
        'slide-in-from-right': 'slide-in-from-right 0.3s ease-out',
        
        // Accordion animations
        'accordion-down': 'accordion-down 0.3s ease-out',
        'accordion-up': 'accordion-up 0.3s ease-out',
        
        // Collapsible animations
        'collapsible-down': 'collapsible-down 0.3s ease-out',
        'collapsible-up': 'collapsible-up 0.3s ease-out',
        
        // Bounce animations
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite',
        
        // Pulse animations
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        
        // Spin animations
        'spin-slow': 'spin-slow 3s linear infinite',
        'spin-reverse': 'spin-slow 1s linear infinite reverse',
        
        // Shimmer animation
        'shimmer': 'shimmer 2s infinite',
        
        // Progress animation
        'progress': 'progress 1.5s ease-in-out infinite',
        
        // Caret blink
        'caret-blink': 'caret-blink 1s step-end infinite',
        
        // Skeleton animation
        'skeleton-pulse': 'skeleton-pulse 2s ease-in-out infinite',
        
        // Float animation
        'float': 'float 3s ease-in-out infinite',
        
        // Enter animations
        'enter': 'fade-in-up 0.4s ease-out',
        'enter-scale': 'scale-in 0.2s ease-out',
        
        // Exit animations
        'exit': 'fade-out 0.3s ease-out',
        'exit-scale': 'scale-out 0.2s ease-out',
      },
      
      // Background image patterns
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'stripes': 'repeating-linear-gradient(45deg, currentColor 25%, transparent 25%, transparent 50%, currentColor 50%, currentColor 75%, transparent 75%, transparent)',
        'grid': 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)',
      },
      
      // Backdrop blur utilities
      backdropBlur: {
        xs: '2px',
      },
      
      // Box shadow extensions
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        'none': 'none',
        
        // Custom shadows
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dialog': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 60px rgba(0, 0, 0, 0.3)',
      },
      
      // Transition timing functions
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      
      // Z-index scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
        'max': '9999',
      },
      
      // Line clamp utilities
      lineClamp: {
        1: '1',
        2: '2',
        3: '3',
        4: '4',
        5: '5',
        6: '6',
      },
    },
  },
  
  // Core plugins configuration
  corePlugins: {
    // Ensure essential plugins are enabled
    container: false, // We'll use custom container classes
    preflight: true,
  },
  
  // Custom variants
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['disabled'],
      borderColor: ['disabled', 'focus-visible'],
      opacity: ['disabled'],
      cursor: ['disabled'],
      scale: ['group-hover', 'hover', 'active'],
      translate: ['group-hover', 'hover'],
      animation: ['motion-reduce'],
    },
  },
  
  // Plugins
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    
    // Custom plugin for scrollbar styling
    function ({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'hsl(var(--muted)) transparent',
        },
        '.scrollbar-auto': {
          'scrollbar-width': 'auto',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-custom': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'hsl(var(--muted))',
            borderRadius: '4px',
            '&:hover': {
              background: 'hsl(var(--muted-foreground))',
            },
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
    
    // Custom plugin for container queries
    function ({ addComponents }) {
      addComponents({
        '.container': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@screen sm': {
            maxWidth: '640px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
          },
          '@screen xl': {
            maxWidth: '1280px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
          '@screen 2xl': {
            maxWidth: '1536px',
          },
        },
      });
    },
  ],
};
