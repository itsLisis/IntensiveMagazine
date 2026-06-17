const contentElement = document.getElementById('content');
const menuListElement = document.querySelector('#menu ul');
const menuViewportElement = document.querySelector('#menu .menu-viewport');
const menuPrevButton = document.getElementById('menu-prev');
const menuNextButton = document.getElementById('menu-next');
const headerLinks = Array.from(document.querySelectorAll('#header a'));
let categories = [];
let activeCategory = null;
let isNormalizingMenuScroll = false;
let menuLoopResetTimer = null;

function setHeaderTargets() {
	headerLinks.forEach((link) => {
		const label = link.textContent.trim().toLowerCase();

		if (label === 'title') {
			link.href = '#title-section';
		}

		if (label === 'media') {
			link.href = '#media-section';
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
		return '';
	}

	return `<div class="media-grid">${mediaItems.map(renderMediaItem).join('')}</div>`;
}

function getRenderableText(text) {
	if (typeof text !== 'string') {
		return '';
	}

	const trimmedText = text.trim();

	if (!trimmedText || trimmedText.toLowerCase().startsWith('page in construction')) {
		return '';
	}

	return trimmedText;
}

function renderMenu() {
	if (!menuListElement) {
		return;
	}

	const menuItemsMarkup = categories
		.map((category) => `
			<li>
				<img src="${category.image}" alt="${category.label} sign" data-category-key="${category.key}" role="button" tabindex="0">
			</li>
		`)
		.join('');

	menuListElement.innerHTML = [menuItemsMarkup, menuItemsMarkup, menuItemsMarkup].join('');
}

function updateMenuArrowState() {
	if (!menuPrevButton || !menuNextButton) {
		return;
	}

	menuPrevButton.disabled = false;
	menuNextButton.disabled = false;
}

function scrollMenu(direction) {
	if (!menuViewportElement) {
		return;
	}

	const scrollAmount = Math.max(220, menuViewportElement.clientWidth * 0.7);
	menuViewportElement.scrollBy({
		left: direction * scrollAmount,
		behavior: 'smooth'
	});
}

function getMenuLoopWidth() {
	if (!menuListElement || categories.length === 0) {
		return 0;
	}

	return menuListElement.scrollWidth / 3;
}

function normalizeMenuScrollPosition() {
	if (!menuViewportElement || !menuListElement || isNormalizingMenuScroll) {
		return;
	}

	const loopWidth = getMenuLoopWidth();

	if (!loopWidth) {
		return;
	}

	const { scrollLeft } = menuViewportElement;

	if (scrollLeft < loopWidth * 0.5) {
		isNormalizingMenuScroll = true;
		menuViewportElement.scrollLeft = scrollLeft + loopWidth;
		isNormalizingMenuScroll = false;
	} else if (scrollLeft > loopWidth * 1.5) {
		isNormalizingMenuScroll = true;
		menuViewportElement.scrollLeft = scrollLeft - loopWidth;
		isNormalizingMenuScroll = false;
	}
}

function getCategoryByKey(key) {
	return categories.find((category) => category.key === key) || null;
}

function renderCategory(category) {
	activeCategory = category;
	const mediaText = getRenderableText(category.comic);
	const hasMediaItems = Array.isArray(category.comicMedia) && category.comicMedia.length > 0;
	const mediaSection = mediaText || hasMediaItems
		? `
			<section id="media-section" class="category-section">
				<h2>Media</h2>
				${mediaText ? `<p>${mediaText}</p>` : ''}
				${hasMediaItems ? renderMediaSection(category.comicMedia, 'Maintenance page') : ''}
			</section>
		`
		: '';
	const podcastText = getRenderableText(category.podcast);
	const hasPodcastItems = Array.isArray(category.podcastMedia) && category.podcastMedia.length > 0;
	const podcastSection = podcastText || hasPodcastItems
		? `
			<section id="podcast-section" class="category-section">
				<h2>Podcast</h2>
				${podcastText ? `<p>${podcastText}</p>` : ''}
				${hasPodcastItems ? renderMediaSection(category.podcastMedia, 'Maintenance page') : ''}
			</section>
		`
		: '';

	contentElement.innerHTML = `
		<article class="category-view" data-category="${category.key}">
			<section id="title-section" class="category-section">
				<h2>${category.label}</h2>
				<p>${category.title}</p>
			</section>
			${mediaSection}
			${podcastSection}
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

if (menuPrevButton) {
	menuPrevButton.addEventListener('click', () => {
		scrollMenu(-1);
	});
}

if (menuNextButton) {
	menuNextButton.addEventListener('click', () => {
		scrollMenu(1);
	});
}

if (menuViewportElement) {
	menuViewportElement.addEventListener('scroll', () => {
		updateMenuArrowState();
	});
	menuViewportElement.addEventListener('scrollend', () => {
		normalizeMenuScrollPosition();
		updateMenuArrowState();
	});
	window.addEventListener('resize', updateMenuArrowState);
}

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
				comic: '',
				comicMedia: [],
				podcast: '',
				podcastMedia: []
			}
		];
	}
}

async function initialize() {
	categories = await loadCategories();
	renderMenu();
	if (menuViewportElement) {
		window.requestAnimationFrame(() => {
			const loopWidth = getMenuLoopWidth();

			if (loopWidth) {
				menuViewportElement.scrollLeft = loopWidth;
			}

			updateMenuArrowState();
		});
	}

	activeCategory = categories[0] || null;

	if (activeCategory) {
		renderCategory(activeCategory);
	}
}

initialize();
