const menuContainer = document.getElementById('menuSections');
const placeholderImage = '1.jpg';
let currentLanguage = 'ro';

const menuDataPaths = {
    ro: 'menu-data.json',
    ru: 'menu-data-ru.json'
};

const allergenTexts = {
    ro: '<strong>Alergeni alimentari (important):</strong> cereale cu gluten (grâu, orz, ovăz, secară), crustacee, ouă, pește, arahide, soia, lapte, fructe cu coajă lemnoasă (migdale, nuci, caju, etc.), țelină, muștar, semințe de susan, dioxid de sulf (peste 10mg/l), lupin și moluște',
    ru: '<strong>Пищевая аллергия (важно):</strong> Содержит или может содержать: глютен (пшеница, ячмень, овёс, рожь), ракообразные, яйца, рыбу, арахис, сою, молоко, орехи (миндаль, грецкие орехи, кешью и др.), сельдерей, горчицу, кунжут, диоксид серы (более 10 мг/л), люпин и моллюсков.'
};

function formatDescription(description, weight) {
    if (description && weight) {
        return `${description} (${weight})`;
    }
    if (description) {
        return description;
    }
    if (weight) {
        return `(${weight})`;
    }
    return currentLanguage === 'ru' ? 'Вкусно и элегантно' : 'Delicios și rafinat';
}

function createCard(item, index) {
    const description = formatDescription(item.description, item.weight);
    const timeMarkup = item.time ? `
          <span class="item-meta"><i class="fa-regular fa-clock"></i> ${item.time}</span>` : '';
    const imageSrc = item.id ? `photos/${item.id}_pixian_ai.png` : null;
    const reverseClass = index % 2 !== 0 ? ' reverse-card' : '';

    return `
    <article class="menu-card${reverseClass}">
      ${imageSrc ? `<div class="card-media">
        <img src="${imageSrc}" alt="${item.name}" loading="lazy" onerror="this.closest('.card-media').style.display='none';">
      </div>` : ''}
      <div class="card-body">
        <h3 class="item-name">${item.name}</h3>
        <p class="item-description">${description}</p>
        <div class="meta-row">
          ${timeMarkup}
          <div class="card-footer">
            <span class="item-price">${item.price}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function getSectionId(category) {
    return category
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
}

function createExtrasCard(items) {
    return `
    <article class="menu-card extras-card">
      <div class="card-body grouped-addons">
        ${items.map(item => `
          <div class="grouped-item">
            <span class="grouped-item-name">${item.name}</span>
            <span class="item-price">${item.price}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

function createBottomNav(categories) {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;

    bottomNav.innerHTML = categories.map(category => {
        const sectionId = getSectionId(category);
        return `<a href="#${sectionId}">${category}</a>`;
    }).join('');
}

function renderCategory(category, items) {
    const section = document.createElement('section');
    section.className = 'category-block';
    section.id = getSectionId(category);

    const header = document.createElement('div');
    header.className = 'category-header';

    const lineImage = document.createElement('img');
    lineImage.className = 'line-image';
    lineImage.src = 'line.png';
    lineImage.alt = '';
    lineImage.loading = 'lazy';
    lineImage.onerror = () => {
        lineImage.style.display = 'none';
    };
    header.appendChild(lineImage);

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = category;
    header.appendChild(title);

    section.appendChild(header);

    const extraNames = new Set(['PAINE TOAST', 'PITA', 'GRISINE', 'CREMA Ricotta/ brinza/ greceasca', 'MIX APERITIVO']);
    const normalItems = items.filter(item => !extraNames.has(item.name));
    const extraItems = items.filter(item => extraNames.has(item.name));

    const itemsWrapper = document.createElement('div');
    itemsWrapper.className = 'menu-items';
    const cards = normalItems.map((item, index) => createCard(item, index));

    if (extraItems.length) {
        cards.push(createExtrasCard(extraItems));
    }

    itemsWrapper.innerHTML = cards.join('');
    section.appendChild(itemsWrapper);
    return section;
}

function renderMenu(items) {
    const sortedItems = [...items].sort((a, b) => a.id - b.id);
    const groups = sortedItems.reduce((acc, item) => {
        const category = item.category || 'Altele';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    menuContainer.innerHTML = '';
    const categories = Object.keys(groups);

    categories.forEach(category => {
        const categorySection = renderCategory(category, groups[category]);
        menuContainer.appendChild(categorySection);
    });

    createBottomNav(categories);
    updateScrollSpy();
}

async function loadMenuData(language = 'ro') {
    currentLanguage = language;
    try {
        const response = await fetch(menuDataPaths[language] || menuDataPaths['ro']);
        if (!response.ok) {
            throw new Error(`Could not load menu data: ${response.status}`);
        }

        const items = await response.json();
        renderMenu(items);
    } catch (error) {
        console.error(error);
        const errorMsg = language === 'ru' ? 'Меню не может быть отображено в данный момент.' : 'Meniul nu poate fi afișat în acest moment.';
        menuContainer.innerHTML = `<p class="error-message">${errorMsg}</p>`;
    }
}

function updateAllergenFooter(language) {
    const allergenFootnote = document.getElementById('allergenFootnote');
    if (allergenFootnote && allergenTexts[language]) {
        allergenFootnote.querySelector('p').innerHTML = allergenTexts[language];
    }
}

window.onLanguageChanged = function (lang) {
    loadMenuData(lang);
    updateAllergenFooter(lang);
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'ro';
    loadMenuData(savedLanguage);
    updateAllergenFooter(savedLanguage);
});

