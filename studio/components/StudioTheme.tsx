import { useEffect } from 'react';

export function StudioTheme() {
  useEffect(() => {
    // Set favicon for Sanity Studio (Heat Tech PNG)
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.setAttribute('href', '/favicon.png');
      favicon.setAttribute('type', 'image/png');
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = '/favicon.png';
      document.head.appendChild(link);
    }

    // Set apple touch icon
    const appleFavicon = document.querySelector('link[rel="apple-touch-icon"]');
    if (appleFavicon) {
      appleFavicon.setAttribute('href', '/favicon.png');
    } else {
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = '/favicon.png';
      document.head.appendChild(appleLink);
    }

    // Inject custom CSS for enhanced group tabs
    const style = document.createElement('style');
    style.innerHTML = `
      /* Enhanced group tabs styling */
      .sanity-tabs {
        gap: 1.5rem;
      }

      .sanity-tabs__tab {
        padding: 1rem 1.5rem !important;
        font-size: 1.1rem !important;
        font-weight: 500;
        color: #666;
        transition: all 0.25s ease;
        border-bottom: 3px solid transparent;
        position: relative;
      }

      .sanity-tabs__tab:hover {
        color: #000;
        background-color: #f8f8f8;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .sanity-tabs__tab[aria-selected="true"] {
        color: #2563eb;
        font-weight: 600;
        border-bottom-color: #2563eb;
        background-color: transparent;
      }

      .sanity-tabs__tab[aria-selected="true"]:hover {
        background-color: #f0f7ff;
      }

      /* Ensure tab content has proper spacing */
      .sanity-tabs__content {
        padding-top: 1.5rem;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
}
