const contentElement = document.getElementById('content');
const menuImages = Array.from(document.querySelectorAll('#menu img'));
const headerLinks = Array.from(document.querySelectorAll('#header a'));
const categoryByImage = new Map();
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
				<div class="media-placeholder">
					<img src="assets/images/maintenance_page.jpg" alt="Maintenance page">
				</div>
			</section>
			<section id="podcast-section" class="category-section">
				<h2>Podcast</h2>
				<p>${category.podcast}</p>
				<div class="media-placeholder">
					<img src="assets/images/maintenance_page.jpg" alt="Maintenance page">
				</div>
			</section>
		</article>
	`;

	document.title = `${category.label} | DebunkTheJunk`;
}

function activateCategory(category) {
	renderCategory(category);
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCategoryFromImage(src) {
	const imageFile = src.split('/').pop();
	return categoryByImage.get(imageFile);
}

menuImages.forEach((image) => {
	const category = getCategoryFromImage(image.getAttribute('src') || '');

	if (!category) {
		return;
	}

	image.style.cursor = 'pointer';
	image.setAttribute('role', 'button');
	image.setAttribute('tabindex', '0');

	image.addEventListener('click', () => activateCategory(category));
	image.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			activateCategory(category);
		}
	});
});

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

setHeaderTargets();

async function loadCategories() {
	try {
		const response = await fetch('../assets/data/categories.json');

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
				image: '3t_atlas_sign.png',
				title: 'A map of hidden patterns and networks that claim to explain how the world is controlled.',
				comic: 'The comic can show the idea as a visual conspiracy board, with clues linked by arrows and symbols.',
				podcast: 'The podcast can unpack how this narrative spreads, what people believe about it, and why it appeals.'
			}
		];
	}
}

async function initialize() {
	categories = await loadCategories();
	categoryByImage.clear();
	categories.forEach((category) => {
		categoryByImage.set(category.image, category);
	});

	activeCategory = categories[0] || null;

	menuImages.forEach((image) => {
		const category = getCategoryFromImage(image.getAttribute('src') || '');

		if (!category) {
			return;
		}

		image.style.cursor = 'pointer';
		image.setAttribute('role', 'button');
		image.setAttribute('tabindex', '0');

		image.addEventListener('click', () => activateCategory(category));
		image.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				activateCategory(category);
			}
		});
	});

	if (activeCategory) {
		renderCategory(activeCategory);
	}
}

initialize();
