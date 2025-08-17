
```html
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Valifi - AI-Powered Financial Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              border: 'rgb(var(--border) / <alpha-value>)',
              input: 'rgb(var(--input) / <alpha-value>)',
              ring: 'rgb(var(--ring) / <alpha-value>)',
              background: 'rgb(var(--background) / <alpha-value>)',
              foreground: 'rgb(var(--foreground) / <alpha-value>)',
              primary: {
                DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
                foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
              },
              secondary: {
                DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
                foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
              },
              destructive: {
                DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
                foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
              },
              success: {
                DEFAULT: 'rgb(var(--success) / <alpha-value>)',
                foreground: 'rgb(var(--success-foreground) / <alpha-value>)',
              },
              muted: {
                DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
                foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
              },
              accent: {
                DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
                foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
              },
              popover: {
                DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
                foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
              },
              card: {
                DEFAULT: 'rgb(var(--card) / <alpha-value>)',
                foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
              },
            },
            borderRadius: {
              lg: `0.75rem`,
              md: `0.5rem`,
              sm: `0.25rem`,
            },
            keyframes: {
              'slide-in-fade': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              'slide-up-fade': {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              'slide-in-from-right': {
                from: { transform: 'translateX(100%)' },
                to: { transform: 'translateX(0)' },
              },
              'slide-out-to-right': {
                  from: { transform: 'translateX(0)' },
                  to: { transform: 'translateX(100%)' },
              },
              'fade-in': {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
              },
              'fade-out': {
                  from: { opacity: 1 },
                  to: { opacity: 0 },
              },
              'marquee': {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-50%)' },
              },
            },
            animation: {
              'slide-in-fade': 'slide-in-fade 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
              'slide-up-fade': 'slide-up-fade 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
              'slide-in-from-right': 'slide-in-from-right 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
              'slide-out-to-right': 'slide-out-to-right 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards',
              'fade-in': 'fade-in 0.2s ease-in-out forwards',
              'fade-out': 'fade-out 0.2s ease-in-out forwards',
              'marquee': 'marquee 60s linear infinite',
            }
          }
        }
      }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      /* Light Theme (default) */
      :root {
        --background: 248 250 252; /* slate-50 */
        --foreground: 15 23 42;    /* slate-900 */
        
        --card: 255 255 255;       /* white */
        --card-foreground: 15 23 42;

        --popover: 255 255 255;
        --popover-foreground: 15 23 42;

        --primary: 79 70 229;      /* indigo-600 */
        --primary-foreground: 255 255 255;
        
        --secondary: 241 245 249;   /* slate-100 */
        --secondary-foreground: 15 23 42;

        --muted: 241 245 249;
        --muted-foreground: 100 116 139; /* slate-500 */

        --accent: 241 245 249;
        --accent-foreground: 15 23 42;

        --destructive: 220 38 38; /* red-600 */
        --destructive-foreground: 255 255 255;
        
        --success: 22 163 74; /* green-600 */
        --success-foreground: 255 255 255;
        
        --warning: 245 158 11; /* amber-500 */
        --warning-foreground: 255 255 255;

        --border: 226 232 240; /* slate-200 */
        --input: 226 232 240;
        --ring: 79 70 229;
      }

      /* Dark Theme */
      [data-theme='dark'] {
        --background: 2 6 23;      /* slate-950 */
        --foreground: 226 232 240; /* slate-200 */

        --card: 15 23 42;         /* slate-900 */
        --card-foreground: 226 232 240;

        --popover: 2 6 23;
        --popover-foreground: 226 232 240;

        --primary: 99 102 241;     /* indigo-500 */
        --primary-foreground: 15 23 42;

        --secondary: 30 41 59;    /* slate-800 */
        --secondary-foreground: 248 250 252; /* slate-50 */

        --muted: 30 41 59;
        --muted-foreground: 148 163 184; /* slate-400 */

        --accent: 30 41 59;
        --accent-foreground: 248 250 252;

        --destructive: 127 29 29; /* red-900 */
        --destructive-foreground: 248 250 252;
        
        --success: 21 128 61; /* green-700 */
        --success-foreground: 248 250 252;
        
        --warning: 217 119 6; /* amber-600 */
        --warning-foreground: 255 255 255;

        --border: 30 41 59;
        --input: 30 41 59;
        --ring: 99 102 241;
      }
      
      /* Midnight (AMOLED) Theme */
      [data-theme='midnight'] {
        --background: 0 0 0;
        --foreground: 226 232 240;
        --card: 15 23 42;
        --card-foreground: 226 232 240;
        --popover: 5 11 28;
        --popover-foreground: 226 232 240;
        --primary: 129 140 248; /* indigo-400 */
        --primary-foreground: 255 255 255;
        --secondary: 23 37 64; /* slate-800 adjusted */
        --secondary-foreground: 248 250 252;
        --muted: 23 37 64;
        --muted-foreground: 148 163 184;
        --accent: 23 37 64;
        --accent-foreground: 248 250 252;
        --border: 30 41 59;
        --input: 23 37 64;
        --ring: 129 140 248;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        background-color: rgb(var(--background));
        color: rgb(var(--foreground));
      }

      [data-theme='dark'] body,
      [data-theme='midnight'] body {
         background-image:
          radial-gradient(circle at 15% 20%, hsla(220, 89%, 61%, 0.1) 0px, transparent 40%),
          radial-gradient(circle at 85% 80%, hsla(245, 89%, 61%, 0.1) 0px, transparent 40%);
        background-size: 150% 150%;
      }

      /* Custom Scrollbars */
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      [data-theme='dark'] ::-webkit-scrollbar-track,
      [data-theme='midnight'] ::-webkit-scrollbar-track { background: transparent; }
      [data-theme='dark'] ::-webkit-scrollbar-thumb,
      [data-theme='midnight'] ::-webkit-scrollbar-thumb { background: rgb(var(--accent)); border-radius: 4px; }
      [data-theme='dark'] ::-webkit-scrollbar-thumb:hover,
      [data-theme='midnight'] ::-webkit-scrollbar-thumb:hover { background: rgb(var(--muted-foreground)); }
      [data-theme='light'] ::-webkit-scrollbar-track { background: rgb(var(--border)); }
      [data-theme='light'] ::-webkit-scrollbar-thumb { background: rgb(var(--muted-foreground)); border-radius: 4px; }
      [data-theme='light'] ::-webkit-scrollbar-thumb:hover { background: rgb(var(--foreground) / 0.5); }

      /* General Transitions */
      *, *::before, *::after {
        transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      }
      
      .view-container {
        animation: slide-in-fade 0.5s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
      }
      
      /* Balance Privacy Mode */
      .balance-privacy .blur-balance { filter: blur(8px); transition: filter 0.2s ease-in-out; }
      .balance-privacy .blur-balance:hover,
      .balance-privacy .blur-balance:focus-within { filter: none; }
      
      .text-emerald-400 { color: rgb(var(--success)); }
      [data-theme='light'] .text-emerald-400 { color: rgb(22 163 74); } /* green-600 */
      
      .text-red-400 { color: rgb(var(--destructive)); }
      [data-theme='light'] .text-red-400 { color: rgb(220 38 38); } /* red-600 */

      .text-amber-400 { color: rgb(var(--warning)); }
      [data-theme='light'] .text-amber-400 { color: rgb(245 158 11); } /* amber-500 */
      
      /* ProseMirror/Markdown rendering from AI */
      .prose { color: rgb(var(--card-foreground)); }
      .prose strong { color: rgb(var(--card-foreground)); font-weight: 600; }
      
      /* Sidebar Tooltip */
      .group:hover .group-hover-tooltip {
          opacity: 1;
          transform: translateX(0);
          transition-delay: 0.5s;
      }
      
      /* Accordion Animation */
      .accordion-content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.3s ease-in-out;
      }
      .accordion-content[data-state="open"] {
          grid-template-rows: 1fr;
      }
      .accordion-content > div {
          overflow: hidden;
      }

      /* Sidebar Glass Effect */
      .sidebar-glass {
        background-color: rgb(var(--card) / 0.6);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      [data-theme='dark'] .sidebar-glass, [data-theme='midnight'] .sidebar-glass {
          background-color: rgb(var(--card) / 0.75);
          border-right-color: rgb(255 255 255 / 0.1);
      }
      [data-theme='light'] .sidebar-glass {
          background-color: rgb(255 255 255 / 0.6);
          border-right-color: rgb(0 0 0 / 0.07);
      }

      /* Mobile Bottom Nav */
      .bottom-nav-glass {
          background-color: rgb(var(--background) / 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top-color: rgb(var(--border) / 0.7);
      }

      /* Mobile Menu Sheet */
      .mobile-menu-sheet-overlay {
          background-color: rgb(0 0 0 / 0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
      }
      .mobile-menu-sheet {
          background-color: rgb(var(--background));
          box-shadow: -10px 0 30px rgb(0 0 0 / 0.2);
      }

      /* Testimonial Marquee */
      .testimonial-slider-wrapper {
        position: relative;
        width: 100%;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      }
      .testimonial-slider {
          display: flex;
          width: fit-content;
      }
      .testimonial-slider:hover {
          animation-play-state: paused;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.1.1",
    "react-dom/": "https://esm.sh/react-dom@^19.1.1/",
    "react/": "https://esm.sh/react@^19.1.1/",
    "@google/genai": "https://esm.sh/@google/genai",
    "otpauth": "https://esm.sh/otpauth@^9.2.2",
    "qrcode": "https://esm.sh/qrcode@^1.5.3",
    "i18next": "https://esm.sh/i18next@23.11.5",
    "react-i18next": "https://esm.sh/react-i18next@14.1.2",
    "i18next-browser-languagedetector": "https://esm.sh/i18next-browser-languagedetector@8.0.0",
    "dotenv": "https://esm.sh/dotenv@^17.2.1",
    "crypto": "https://esm.sh/crypto@^1.0.1",
    "@libsql/client": "https://esm.sh/@libsql/client@^0.15.11",
    "dotenv/": "https://esm.sh/dotenv@^17.2.1/",
    "fs/": "https://esm.sh/fs@^0.0.1-security/",
    "path": "https://esm.sh/path@^0.12.7",
    "url": "https://esm.sh/url@^0.11.4",
    "express": "https://esm.sh/express@^5.1.0",
    "cors": "https://esm.sh/cors@^2.8.5"
  }
}
</script>
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
```
