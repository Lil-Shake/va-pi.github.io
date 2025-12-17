(() => {
  const disableDisabledLinks = () => {
    document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
      a.addEventListener('click', (e) => e.preventDefault());
    });
  };

  const setupCopyButtons = () => {
    const buttons = document.querySelectorAll('.copy-btn[data-copy-target]');
    buttons.forEach((btn) => {
      btn.addEventListener('click', async () => {
        const selector = btn.getAttribute('data-copy-target');
        if (!selector) return;
        const target = document.querySelector(selector);
        if (!target) return;

        const text = (target.textContent || '').trim();
        if (!text) return;

        const original = btn.textContent || 'Copy';
        const setTemporary = (label) => {
          btn.textContent = label;
          btn.disabled = true;
          window.setTimeout(() => {
            btn.textContent = original;
            btn.disabled = false;
          }, 1200);
        };

        try {
          await navigator.clipboard.writeText(text);
          setTemporary('Copied');
        } catch {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.setAttribute('readonly', 'true');
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          try {
            document.execCommand('copy');
            setTemporary('Copied');
          } catch {
            setTemporary('Copy failed');
          } finally {
            document.body.removeChild(textarea);
          }
        }
      });
    });
  };

  const setupActiveSectionNav = () => {
    const links = Array.from(document.querySelectorAll('.navlinks a[href^="#"]'));
    const sections = links
      .map((a) => {
        const id = a.getAttribute('href')?.slice(1);
        if (!id) return null;
        const el = document.getElementById(id);
        if (!el) return null;
        return { id, el };
      })
      .filter(Boolean);

    if (!links.length || !sections.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => {
      links.forEach((a) => {
        const isActive = a.getAttribute('href') === `#${id}`;
        a.classList.toggle('active', isActive);
        if (isActive) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (!visible.length) return;
        const id = visible[0].target.id;
        if (id) setActive(id);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sections.forEach(({ el }) => observer.observe(el));

    // Ensure initial state is sensible on load / refresh.
    const hashId = window.location.hash?.slice(1);
    if (hashId && document.getElementById(hashId)) setActive(hashId);
    else setActive(sections[0].el.id);
  };

  disableDisabledLinks();
  setupCopyButtons();
  setupActiveSectionNav();

  // Fit hero teaser height to left highlights (desktop only)
  const fitHeroTeaserHeight = () => {
    const method = document.getElementById('method');
    if (!method) return;

    const left = method.querySelector('.hero-method-left');
    const teaser = method.querySelector('.hero-method-teaser');
    if (!left || !teaser) return;

    // Mobile: let it flow naturally (grid becomes 1 column at <= 860px)
    if (window.innerWidth <= 860) {
      teaser.style.height = '';
      return;
    }

    const leftH = Math.ceil(left.getBoundingClientRect().height);
    if (leftH > 0) teaser.style.height = `${leftH}px`;
  };

  // Run after layout settles
  const scheduleFit = () => window.requestAnimationFrame(fitHeroTeaserHeight);
  window.addEventListener('load', scheduleFit, { passive: true });
  window.addEventListener('resize', scheduleFit, { passive: true });
  scheduleFit();
})();


