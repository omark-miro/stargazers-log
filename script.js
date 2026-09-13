const repoList = document.querySelector('#repo-list');
const status = document.querySelector('#status');

function formatStars(stars) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(stars);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00`));
}

function renderRepositories(repositories) {
  status.hidden = true;
  repoList.innerHTML = repositories.map((repository, index) => `
    <li class="repo-card">
      <span class="repo-number">${String(index + 1).padStart(2, '0')}</span>
      <div>
        <h2 class="repo-name">
          <a href="${repository.url}" target="_blank" rel="noreferrer">${repository.full_name}</a>
        </h2>
        <p class="repo-description">${repository.description}</p>
        <div class="repo-meta">
          <span>${repository.language}</span>
          <span>starred ${formatDate(repository.starred_at)}</span>
        </div>
      </div>
      <span class="repo-stars" aria-label="${repository.stars} stars">★ ${formatStars(repository.stars)}</span>
    </li>
  `).join('');
}

async function loadRepositories() {
  try {
    const response = await fetch('events.json');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    renderRepositories(repositories);
  } catch (error) {
    status.hidden = false;
    status.textContent = 'The starred repositories could not be loaded. Please try again later.';
    console.error(error);
  }
}

loadRepositories();
