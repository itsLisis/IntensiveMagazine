const contentElement = document.getElementById('content');
const menuListElement = document.querySelector('#menu ul');
const menuContainer = document.getElementById('menu');
const menuViewportElement = document.querySelector('#menu .menu-viewport');
const menuPrevButton = document.getElementById('menu-prev');
const menuNextButton = document.getElementById('menu-next');
const sectionNavList = document.querySelector('#section-nav ul');
const btnHoroscope = document.getElementById('btn-horoscope');
const btnClasswork = document.getElementById('btn-classwork');
let headerLinks = Array.from(document.querySelectorAll('#section-nav a'));
let categories = [];
let activeCategory = null;
let isNormalizingMenuScroll = false;
let menuLoopResetTimer = null;
let currentMode = 'horoscope';

function setHeaderTargets() {
	headerLinks.forEach((link) => {
		const label = link.textContent.trim().toLowerCase();

		if (label === 'title' || label === 'description') {
			link.href = '#title-section';
		} else if (label === 'media') {
			link.href = '#media-section';
		} else if (label === 'podcast') {
			link.href = '#podcast-section';
		} else if (label === 'summary') {
			link.href = '#summary-section';
		} else if (label === 'review') {
			link.href = '#review-section';
		}
	});

	// Re-attach listeners to new links
	headerLinks.forEach((link) => {
		link.addEventListener('click', handleNavClick);
	});
}

function handleNavClick(event) {
	const targetId = event.currentTarget.getAttribute('href');
	const targetElement = targetId ? document.querySelector(targetId) : null;

	if (!targetElement) {
		return;
	}

	event.preventDefault();
	targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

function renderClasswork() {
	sectionNavList.innerHTML = `
		<li><a href="#summary-section">Summary</a></li>
		<li><a href="#review-section">Review</a></li>
	`;
	
	headerLinks = Array.from(document.querySelectorAll('#section-nav a'));
	setHeaderTargets();

	const summaryMedia = [
		{ type: 'image', src: 'assets/classwork/summary_1.png', alt: 'Summary image 1' },
		{ type: 'image', src: 'assets/classwork/summary_2.png', alt: 'Summary image 2' },
	];

	const reviewMedia = [
		{ type: 'image', src: 'assets/classwork/review.png', alt: 'Review image' }
	];

	const summarySection = `
		<section id="summary-section" class="category-section">
			<h2>Summary</h2>
			${renderMediaSection(summaryMedia, 'Summary images')}
		</section>
	`;

	const reviewSection = `
		<section id="review-section" class="category-section">
			<h2>Review</h2>
			${renderMediaSection(reviewMedia, 'Review image')}
		</section>
	`;

	contentElement.innerHTML = `
		<article class="category-view" data-category="classwork">
			${summarySection}
			${reviewSection}
		</article>
	`;
	document.title = `Our Classwork | DebunkTheJunk`;
}

function updateModeView() {
	if (currentMode === 'horoscope') {
		menuContainer.style.display = 'flex';
		btnHoroscope.classList.add('active');
		btnClasswork.classList.remove('active');
		
		sectionNavList.innerHTML = `
			<li><a href="#title-section">Description</a></li>
			<li><a href="#media-section">Media</a></li>
			<li><a href="#podcast-section">Podcast</a></li>
		`;
		headerLinks = Array.from(document.querySelectorAll('#section-nav a'));
		setHeaderTargets();

		if (activeCategory) {
			renderCategory(activeCategory);
		}
	} else if (currentMode === 'classwork') {
		menuContainer.style.display = 'none';
		btnClasswork.classList.add('active');
		btnHoroscope.classList.remove('active');
		
		renderClasswork();
	}
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

if (btnHoroscope) {
	btnHoroscope.addEventListener('click', () => {
		currentMode = 'horoscope';
		updateModeView();
	});
}

if (btnClasswork) {
	btnClasswork.addEventListener('click', () => {
		currentMode = 'classwork';
		updateModeView();
	});
}

function activateCategory(category) {
	if (currentMode !== 'horoscope') return;
	renderCategory(category);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

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
