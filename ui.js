// UI enhancements for AMAZESKIN redesign
// High-contrast toggle and layout preview toggle

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;

  // High-contrast toggle button (added in nav with id="contrast-toggle")
  const contrastBtn = document.getElementById('contrast-toggle');
  contrastBtn?.addEventListener('click', () => {
    html.classList.toggle('high-contrast');
  });

  // Layout preview toggle (desktop / mobile)
  const layoutToggle = document.createElement('button');
  layoutToggle.id = 'layout-toggle';
  layoutToggle.type = 'button';
  layoutToggle.className = 'p-2 ml-2 bg-pastel-teal text-white rounded';
  layoutToggle.textContent = 'Desktop View';
  layoutToggle.addEventListener('click', () => {
    const isDesktop = html.classList.toggle('preview-desktop');
    layoutToggle.textContent = isDesktop ? 'Mobile View' : 'Desktop View';
  });
  // Insert after theme toggle (assumes nav .flex container exists)
  const navFlex = document.querySelector('nav .flex');
  if (navFlex) {
    navFlex.appendChild(layoutToggle);
  }
});
