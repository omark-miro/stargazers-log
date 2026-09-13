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

// Schema validation helper
function validateRepository(repo) {
  const required = ['name', 'full_name', 'description', 'language', 'stars', 'url', 'starred_at'];
  
  // Check all required fields exist
  if (!required.every(field => field in repo)) {
    throw new Error(`Missing required field in repository object`);
  }
  
  // Validate field types
  if (typeof repo.full_name !== 'string' || typeof repo.description !== 'string' || 
      typeof repo.language !== 'string' || typeof repo.url !== 'string' || 
      typeof repo.starred_at !== 'string' || typeof repo.stars !== 'number') {
    throw new Error(`Invalid field type in repository object`);
  }
  
  // Validate URL is safe (basic check)
  try {
    new URL(repo.url);
  } catch {
    throw new Error(`Invalid URL in repository object`);
  }
  
  return true;
}

// Helper to safely create DOM elements instead of using innerHTML
function createRepositoryCard(repository, index) {
  const li = document.createElement('li');
  li.className = 'repo-card';
  
  const number = document.createElement('span');
  number.className = 'repo-number';
  number.textContent = String(index + 1).padStart(2, '0');
  
  const container = document.createElement('div');
  
  const heading = document.createElement('h2');
  heading.className = 'repo-name';
  
  const link = document.createElement('a');
  link.href = repository.url;
  link.target = '_blank';
  link.rel = 'noreferrer';
  link.textContent = repository.full_name;
  heading.appendChild(link);
  
  const description = document.createElement('p');
  description.className = 'repo-description';
  description.textContent = repository.description;
  
  const meta = document.createElement('div');
  meta.className = 'repo-meta';
  
  const language = document.createElement('span');
  language.textContent = repository.language;
  
  const starredDate = document.createElement('span');
  starredDate.textContent = `starred ${formatDate(repository.starred_at)}`;
  
  meta.appendChild(language);
  meta.appendChild(starredDate);
  
  container.appendChild(heading);
  container.appendChild(description);
  container.appendChild(meta);
  
  const stars = document.createElement('span');
  stars.className = 'repo-stars';
  stars.setAttribute('aria-label', `${repository.stars} stars`);
  stars.textContent = `★ ${formatStars(repository.stars)}`;
  
  li.appendChild(number);
  li.appendChild(container);
  li.appendChild(stars);
  
  return li;
}

function renderRepositories(repositories) {
  // Validate we have an array
  if (!Array.isArray(repositories)) {
    throw new Error('Expected an array of repositories');
  }
  
  // Handle empty array
  if (repositories.length === 0) {
    status.hidden = false;
    status.textContent = 'No starred repositories found.';
    return;
  }
  
  // Validate each repository
  repositories.forEach((repo, index) => {
    try {
      validateRepository(repo);
    } catch (error) {
      throw new Error(`Repository at index ${index} failed validation: ${error.message}`);
    }
  });
  
  // Only hide status after validation succeeds
  status.hidden = true;
  
  // Use DOM API instead of innerHTML
  repoList.innerHTML = '';
  repositories.forEach((repository, index) => {
    const card = createRepositoryCard(repository, index);
    repoList.appendChild(card);
  });
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
