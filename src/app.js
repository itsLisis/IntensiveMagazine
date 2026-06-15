const contentElement = document.getElementById('content');
const menuListElement = document.querySelector('#menu ul');
const headerLinks = Array.from(document.querySelectorAll('#header a'));
let categories = [];
let activeCategory = null;

function setHeaderTargets() {
	headerLinks.forEach((link) => {
		const label = link.textContent.trim().toLowerCase();

		if (label === 'title') {
			link.href = '#title-section';
		}

		if (label === 'comic') {
			link.href = '#comic-section';
		}

		if (label === 'podcast') {
			link.href = '#podcast-section';
		}
	});
}

function renderMediaItem(mediaItem) {
	if (mediaItem.type === 'audio') {
		return `
			<div class="media-card">
				<audio controls src="${mediaItem.src}"></audio>
			</div>
		`;
	}

	if (mediaItem.type === 'video') {
		return `
			<div class="media-card">
				<video controls src="${mediaItem.src}"></video>
			</div>
		`;
	}

	return `
		<div class="media-card">
			<img src="${mediaItem.src}" alt="${mediaItem.alt || 'Category media'}">
		</div>
	`;
}

function renderMediaSection(mediaItems, fallbackAlt) {
	if (!Array.isArray(mediaItems) || mediaItems.length === 0) {
		return `
			<div class="media-placeholder">
				<img src="assets/images/maintenance_page.jpg" alt="${fallbackAlt}">
			</div>
		`;
	}

	return `<div class="media-grid">${mediaItems.map(renderMediaItem).join('')}</div>`;
}

function renderMenu() {
	if (!menuListElement) {
		return;
	}

	menuListElement.innerHTML = categories
		.map((category) => `
			<li>
				<img src="${category.image}" alt="${category.label} sign" data-category-key="${category.key}" role="button" tabindex="0">
			</li>
		`)
		.join('');
}

function getCategoryByKey(key) {
	return categories.find((category) => category.key === key) || null;
}

function renderCategory(category) {
	activeCategory = category;

	contentElement.innerHTML = `
		<article class="category-view" data-category="${category.key}">
			<section id="title-section" class="category-section">
				<h2>${category.label}</h2>
				<p>${category.title}</p>
			</section>
			<section id="comic-section" class="category-section">
				<h2>Comic</h2>
				<p>${category.comic}</p>
				${renderMediaSection(category.comicMedia, 'Maintenance page')}
			</section>
			<section id="podcast-section" class="category-section">
				<h2>Podcast</h2>
				<p>${category.podcast}</p>
				${renderMediaSection(category.podcastMedia, 'Maintenance page')}
			</section>
		</article>
	`;

	document.title = `${category.label} | DebunkTheJunk`;
}

function activateCategory(category) {
	renderCategory(category);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

headerLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		const targetId = link.getAttribute('href');
		const targetElement = targetId ? document.querySelector(targetId) : null;

		if (!targetElement) {
			return;
		}

		event.preventDefault();
		targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
});

if (menuListElement) {
	menuListElement.addEventListener('click', (event) => {
		const image = event.target.closest('img[data-category-key]');

		if (!image) {
			return;
		}

		const category = getCategoryByKey(image.dataset.categoryKey || '');

		if (category) {
			activateCategory(category);
		}
	});

	menuListElement.addEventListener('keydown', (event) => {
		const image = event.target.closest('img[data-category-key]');

		if (!image || (event.key !== 'Enter' && event.key !== ' ')) {
			return;
		}

		event.preventDefault();

		const category = getCategoryByKey(image.dataset.categoryKey || '');

		if (category) {
			activateCategory(category);
		}
	});
}

setHeaderTargets();

async function loadCategories() {
	try {
		const response = await fetch('assets/data/categories.json');

		if (!response.ok) {
			throw new Error(`Failed to load categories: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Could not load categories.json, falling back to embedded data.', error);
		return [
			{
				key: '3t_atlas',
				label: '3T Atlas',
				image: 'assets/images/3t_atlas_sign.png',
				title: 'A map of hidden patterns and networks that claim to explain how the world is controlled.',
				comic: 'The comic can show the idea as a visual conspiracy board, with clues linked by arrows and symbols.',
				comicMedia: [],
				podcast: 'The podcast can unpack how this narrative spreads, what people believe about it, and why it appeals.',
				podcastMedia: []
			}
		];
	}
}

async function initialize() {
	categories = await loadCategories();
	renderMenu();

	activeCategory = categories[0] || null;

	if (activeCategory) {
		renderCategory(activeCategory);
	}
}

initialize();
