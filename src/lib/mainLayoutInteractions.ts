// Main Layout Interactions - Deferred Module
// This module is loaded with defer to prevent blocking the critical rendering path

// Tiny rAF throttle to coalesce scroll work
const rafThrottle = <T extends (...args: any[]) => void>(fn: T): T => {
  let ticking = false;
  return ((...args: any[]) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  }) as T;
};

export function initializeMainLayoutInteractions() {
  // Navigation Sticky State
  const initNavSticky = () => {
    const nav = document.getElementById('site-nav');
    if (nav) {
      const toggle = () => {
        nav.dataset.stuck = window.scrollY > 60 ? 'true' : 'false';
      };
      const onScroll = rafThrottle(toggle);
      toggle();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  };

  // Mobile Sticky Controls (with scroll threshold optimization)
  const initMobileStickyControls = () => {
    const header = document.querySelector('header');
    const stickyControls = document.getElementById('mobile-sticky-controls');
    const headerHeight = header?.offsetHeight ?? 200;
    let controlsVisible = false;
    let lastScrollY = 0;

    const updateControls = () => {
      if (!stickyControls) return;
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) < 10) return; // 10px threshold
      lastScrollY = currentScrollY;
      const shouldShow = currentScrollY > headerHeight;
      if (shouldShow === controlsVisible) return;
      controlsVisible = shouldShow;
      stickyControls.classList.toggle('opacity-0', !shouldShow);
      stickyControls.classList.toggle('pointer-events-none', !shouldShow);
      stickyControls.classList.toggle('scale-90', !shouldShow);
      stickyControls.classList.toggle('scale-100', shouldShow);
      if (shouldShow) {
        stickyControls.classList.remove('pop-bounce');
        requestAnimationFrame(() => {
          stickyControls.classList.add('pop-bounce');
        });
      }
    };

    const onScroll = rafThrottle(updateControls);
    updateControls();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  // Mobile Menu Interactions
  const initMobileMenu = () => {
    const menuTriggers = document.querySelectorAll('[data-mobile-menu-trigger]');
    const closeButton = document.getElementById('mobile-menu-close');
    const menu = document.getElementById('mobile-menu');
    const menuPanel = menu?.querySelector('[data-mobile-menu-panel]');
    const body = document.body;

    if (menuTriggers.length && menu && menuPanel) {
      const openMenu = () => {
        if (menu.classList.contains('is-open')) return;
        menu.classList.remove('hidden');
        menu.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => {
          menu.classList.add('is-open');
          menuPanel.classList.add('is-open');
        });
        body.style.overflow = 'hidden';
      };

      const closeMenu = () => {
        if (!menu.classList.contains('is-open')) return;
        menu.classList.remove('is-open');
        menuPanel.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        const handleTransitionEnd = (event: TransitionEvent) => {
          if (event.target !== menu || event.propertyName !== 'opacity') return;
          if (menu.classList.contains('is-open')) return;
          menu.classList.add('hidden');
          menu.removeEventListener('transitionend', handleTransitionEnd as EventListener);
        };
        menu.addEventListener('transitionend', handleTransitionEnd as EventListener);
      };

      menuTriggers.forEach((btn) => btn.addEventListener('click', openMenu));
      closeButton?.addEventListener('click', closeMenu);
      menu.addEventListener('click', (event) => {
        if (event.target === menu) closeMenu();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      menu.querySelectorAll('a[href]').forEach((link) => link.addEventListener('click', closeMenu));

      // Touch swipe to close
      let touchStartX: number | null = null;
      let touchStartY: number | null = null;
      const SWIPE_DISTANCE = 80;
      const SWIPE_DRIFT = 60;

      const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      };

      const handleTouchEnd = (event: TouchEvent) => {
        if (touchStartX === null || touchStartY === null) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = Math.abs(touch.clientY - touchStartY);
        if (deltaX > SWIPE_DISTANCE && deltaY < SWIPE_DRIFT) {
          closeMenu();
        }
        touchStartX = null;
        touchStartY = null;
      };

      menu.addEventListener('touchstart', handleTouchStart as EventListener, { passive: true });
      menu.addEventListener('touchend', handleTouchEnd as EventListener);
    }
  };

  // Mobile Menu Submenu Toggles
  const initSubmenuToggles = () => {
    const submenuButtons = document.querySelectorAll('[data-mobile-menu-toggle]');
    submenuButtons.forEach((button) => {
      const submenuId = button.getAttribute('data-mobile-menu-toggle');
      if (!submenuId) return;
      const submenu = document.getElementById(submenuId);
      if (!submenu) return;
      const chevron = button.querySelector('svg');
      button.setAttribute('aria-controls', submenuId);
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        const nextState = !expanded;
        button.setAttribute('aria-expanded', String(nextState));
        submenu.classList.toggle('hidden', !nextState);
        if (nextState) {
          submenu.classList.add('pt-2');
        } else {
          submenu.classList.remove('pt-2');
        }
        chevron?.classList.toggle('rotate-180', nextState);
      });
    });
  };

  // Contact Form Hash Navigation
  const initContactFormHash = () => {
    if (window.location.hash === '#contact_form') {
      const form = document.getElementById('contact_form');
      if (form) {
        requestAnimationFrame(() => {
          form.scrollIntoView({ behavior: 'auto', block: 'start' });
          const offset = window.innerWidth < 768 ? 240 : 180;
          window.scrollBy({ top: -(offset), behavior: 'auto' });
        });
      }
    }
  };

  // Initialize all interactions
  initNavSticky();
  initMobileStickyControls();
  initMobileMenu();
  initSubmenuToggles();
  initContactFormHash();
}

// Auto-initialize when module loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMainLayoutInteractions);
} else {
  initializeMainLayoutInteractions();
}
