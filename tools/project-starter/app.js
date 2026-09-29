const form = document.querySelector('#starter-form');
const result = document.querySelector('#result');
const trackInputs = [...document.querySelectorAll('input[name="track"]')];

const refreshTrackChecklist = () => {
  const track = document.querySelector('input[name="track"]:checked')?.value;
  document.querySelectorAll('.conditional').forEach((section) => {
    const active = section.dataset.track === track;
    section.hidden = !active;
    section.querySelectorAll('input').forEach((input) => { input.required = active; });
  });
};

trackInputs.forEach((input) => input.addEventListener('change', refreshTrackChecklist));
refreshTrackChecklist();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const payload = {
    projectName: data.get('projectName'),
    projectSlug: data.get('projectSlug'),
    track: data.get('track'),
    inputs: Object.fromEntries([...data.entries()].filter(([key, value]) => !['projectName', 'projectSlug', 'track', 'heroVariant', 'sections'].includes(key) && value === 'on').map(([key]) => [key, true])),
    selectedVariants: { hero: data.get('heroVariant'), sections: data.getAll('sections') },
  };
  result.textContent = 'Saving intake…';
  try {
    const response = await fetch('/api/intake', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const responseBody = await response.json();
    if (!response.ok) throw new Error(responseBody.error || 'Unable to save the intake.');
    result.innerHTML = `Saved <code>${responseBody.outputPath}</code>. Next: complete the lifecycle pre-development gate.`;
  } catch (error) {
    result.textContent = error.message;
  }
});
