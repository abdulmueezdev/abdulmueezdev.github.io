function setupProjectReel(reel) {
  const tablist = reel.querySelector('[role="tablist"]');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

  function select(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[position].hidden = !selected;
    });
  }

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const destinations = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!(event.key in destinations)) return;
      event.preventDefault();
      const next = destinations[event.key];
      select(next);
      tabs[next].focus();
    });
  });
  select(0);
  tablist.hidden = false;
}

function setupArtwork(plates) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let frame = 0;

  function paint() {
    frame = 0;
    for (const plate of visible) {
      const rect = plate.getBoundingClientRect();
      const fraction = (innerHeight - rect.top) / (innerHeight + rect.height) - .5;
      const offset = reduced.matches ? 0 : Math.max(-1, Math.min(1, fraction * 2)) * Math.min(16, rect.width * .022);
      plate.style.setProperty('--art-y', offset.toFixed(2) + 'px');
    }
  }
  function schedule() {
    if (!frame && visible.size) frame = requestAnimationFrame(paint);
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    }
    schedule();
  });
  plates.forEach(plate => observer.observe(plate));
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  reduced.addEventListener('change', () => {
    if (reduced.matches) plates.forEach(plate => plate.style.removeProperty('--art-y'));
    schedule();
  });
}

export function setupInteractions() {
  document.querySelectorAll('[data-project-reel]').forEach(setupProjectReel);
  const toggle = document.querySelector('[data-book-toggle]');
  if (toggle) {
    const plate = toggle.closest('.project-plate');
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      const open = plate.classList.toggle('book-open');
      const action = open ? 'Close' : 'Open';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', action + ' the Alucard book');
      toggle.querySelector('[data-book-label]').textContent = action + ' book';
      toggle.firstElementChild.textContent = open ? '−' : '+';
    });
  }

  const copy = document.querySelector('[data-copy-address]');
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const address = document.querySelector('[data-address]').textContent.trim();
      const status = document.querySelector('.address-status');
      try {
        await navigator.clipboard.writeText(address);
        status.textContent = 'Email copied.';
      } catch {
        status.textContent = 'Select the address to copy it.';
      }
    });
  }

  if ('IntersectionObserver' in window) setupArtwork([...document.querySelectorAll('.project-plate')]);
}
