const menu = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(returnFocus = false) {
  mobileNav.hidden = true;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open navigation');
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true); });

const registration = document.querySelector('#registration-dialog');
document.querySelectorAll('.registration-trigger').forEach(button => button.addEventListener('click', () => registration.showModal()));
document.querySelector('#dialog-explore').addEventListener('click', () => registration.close());
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
});

const tracks = {
  hackathon: {
    label: 'BATTLE 01 · BUILDER’S CAMP', title: 'THE HACKATHON',
    description: 'Start with a real problem. Explore possibilities, build a working solution, and show what your idea can do.',
    prompts: ['Find a problem you care about.', 'Make your idea tangible with a prototype.', 'Prepare a clear demonstration of your solution.']
  },
  pitch: {
    label: 'BATTLE 02 · PITCH ARENA', title: 'THE BUSINESS PITCH',
    description: 'Turn an insight into a business worth believing in. Show the opportunity, explain your approach, and bring your vision to life.',
    prompts: ['Understand your audience and the problem.', 'Shape a business model around your solution.', 'Tell a focused, convincing story.']
  }
};
const trackDialog = document.querySelector('#track-dialog');
document.querySelectorAll('.track-trigger').forEach(button => button.addEventListener('click', () => {
  const track = tracks[button.dataset.track];
  document.querySelector('#track-eyebrow').textContent = track.label;
  document.querySelector('#track-title').textContent = track.title;
  document.querySelector('#track-description').textContent = track.description;
  document.querySelector('#track-checklist').replaceChildren(...track.prompts.map((text, index) => {
    const line = document.createElement('p');
    const number = document.createElement('span');
    number.textContent = `0${index + 1}`;
    line.append(number, document.createTextNode(text));
    return line;
  }));
  trackDialog.showModal();
}));
document.querySelector('#track-register').addEventListener('click', () => { trackDialog.close(); registration.showModal(); });
document.querySelector('#year').textContent = new Date().getFullYear();

const world = document.querySelector('.hero-world');
const hero = document.querySelector('.hero');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
hero.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const rect = world.getBoundingClientRect();
  world.style.setProperty('--mx', Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)));
  world.style.setProperty('--my', Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)));
});
hero.addEventListener('pointerleave', () => { world.style.setProperty('--mx', 0); world.style.setProperty('--my', 0); });
document.querySelectorAll('.battle-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType === 'touch') return;
    const rect = card.getBoundingClientRect();
    card.style.transform = `rotateX(${((event.clientY - rect.top) / rect.height - .5) * -2}deg) rotateY(${((event.clientX - rect.left) / rect.width - .5) * 2}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});
// Optional 3D enhancement; the complete page remains usable without WebGL.
import('./world.js').then(({ startWorld }) => startWorld(document.querySelector('#world-canvas'), world, reducedMotion)).catch(() => {});
