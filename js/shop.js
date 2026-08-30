/**
 * Luméra Skin — Shop Filters JavaScript
 * Product filtering, sorting, pagination, active state management
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initShopFilters();
  initIngredientSearch();
});

// ============================================================
// SHOP FILTERS
// ============================================================
function initShopFilters() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.product-card[data-category]'));
  const activeFilters = { category: [], skintype: [], concern: [] };
  let sortOrder = 'default';

  // Filter checkboxes
  document.querySelectorAll('.filter-checkbox[data-filter]').forEach(cb => {
    cb.addEventListener('change', () => {
      const { filter, value } = cb.dataset;
      if (!activeFilters[filter]) activeFilters[filter] = [];
      if (cb.checked) {
        if (!activeFilters[filter].includes(value)) activeFilters[filter].push(value);
      } else {
        activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
      }
      applyFilters();
    });
  });

  // Filter tags (chips)
  document.querySelectorAll('.filter-tag[data-filter]').forEach(tag => {
    tag.addEventListener('click', () => {
      const { filter, value } = tag.dataset;
      tag.classList.toggle('active');
      if (!activeFilters[filter]) activeFilters[filter] = [];
      if (tag.classList.contains('active')) {
        if (!activeFilters[filter].includes(value)) activeFilters[filter].push(value);
      } else {
        activeFilters[filter] = activeFilters[filter].filter(v => v !== value);
      }
      applyFilters();
    });
  });

  // Sort
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) {
    sortSel.addEventListener('change', () => {
      sortOrder = sortSel.value;
      applyFilters();
    });
  }

  // Clear all
  document.querySelectorAll('.clear-all-filters').forEach(btn => {
    btn.addEventListener('click', () => {
      Object.keys(activeFilters).forEach(k => activeFilters[k] = []);
      document.querySelectorAll('.filter-checkbox[data-filter]').forEach(cb => cb.checked = false);
      document.querySelectorAll('.filter-tag[data-filter]').forEach(tag => tag.classList.remove('active'));
      applyFilters();
    });
  });

  // Offcanvas Side Popup Drawer Filter Toggle
  const openFilterDrawerBtn = document.getElementById('openFilterDrawerBtn') || document.getElementById('mobileFilterBtn');
  const closeFilterDrawerBtn = document.getElementById('closeFilterDrawerBtn');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const filterDrawerBackdrop = document.getElementById('filterDrawerBackdrop');
  const filterSidebarCol = document.getElementById('filterSidebarCol');

  function openDrawer() {
    if (filterSidebarCol) filterSidebarCol.classList.add('open');
    if (filterDrawerBackdrop) filterDrawerBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (filterSidebarCol) filterSidebarCol.classList.remove('open');
    if (filterDrawerBackdrop) filterDrawerBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (openFilterDrawerBtn) openFilterDrawerBtn.addEventListener('click', openDrawer);
  if (closeFilterDrawerBtn) closeFilterDrawerBtn.addEventListener('click', closeDrawer);
  if (filterDrawerBackdrop) filterDrawerBackdrop.addEventListener('click', closeDrawer);
  if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', closeDrawer);

  function applyFilters() {
    let visible = cards.filter(card => {
      const cat  = card.dataset.category || '';
      const skin = card.dataset.skintype || '';
      const con  = card.dataset.concern  || '';

      const catMatch  = activeFilters.category.length === 0 || activeFilters.category.some(f => cat.includes(f));
      const skinMatch = activeFilters.skintype.length === 0  || activeFilters.skintype.some(f => skin.includes(f));
      const conMatch  = activeFilters.concern.length === 0   || activeFilters.concern.some(f => con.includes(f));

      const show = catMatch && skinMatch && conMatch;
      card.style.display = show ? '' : 'none';
      return show;
    });

    // Sort
    if (sortOrder !== 'default' && visible.length > 0) {
      visible.sort((a, b) => {
        const pa = parseFloat(a.dataset.price || '0');
        const pb = parseFloat(b.dataset.price || '0');
        const ra = parseFloat(a.dataset.rating || '0');
        const rb = parseFloat(b.dataset.rating || '0');
        if (sortOrder === 'price-low')  return pa - pb;
        if (sortOrder === 'price-high') return pb - pa;
        if (sortOrder === 'rating')     return rb - ra;
        return 0;
      });
      visible.forEach(card => grid.appendChild(card));
    }

    // Update count
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${visible.length}</strong> of <strong>${cards.length}</strong> products`;
    }

    // Update active chips bar
    updateActiveChipsBar(activeFilters);

    // No-results state
    let noResults = document.getElementById('noResultsMsg');
    if (visible.length === 0) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'noResultsMsg';
        noResults.className = 'text-center py-5 w-100';
        noResults.innerHTML = `
          <i class="bi bi-search text-muted-brand" style="font-size:2rem;"></i>
          <p class="mt-2 text-muted-brand">No products match the selected filters.</p>
          <button class="btn-outline-brand mt-2 clear-all-filters" onclick="document.querySelector('.clear-all-filters').click()">Clear Filters</button>
        `;
        grid.after(noResults);
      }
      noResults.style.display = '';
    } else if (noResults) {
      noResults.style.display = 'none';
    }
  }

  function updateActiveChipsBar(filters) {
    const bar = document.getElementById('activeFiltersBar');
    const totalActiveCount = Object.values(filters).reduce((acc, arr) => acc + arr.length, 0);
    const badge = document.getElementById('activeFilterBadge');
    if (badge) {
      badge.textContent = totalActiveCount;
      badge.style.display = totalActiveCount > 0 ? 'inline-flex' : 'none';
    }
    if (!bar) return;
    const chips = [];
    Object.entries(filters).forEach(([key, vals]) => {
      vals.forEach(v => {
        chips.push(`
          <span class="active-filter-chip">
            ${v}
            <button type="button" aria-label="Remove ${v} filter" data-remove-filter="${key}" data-remove-value="${v}">
              <i class="bi bi-x"></i>
            </button>
          </span>
        `);
      });
    });
    bar.innerHTML = chips.length
      ? chips.join('') + `<button class="clear-all-filters" type="button">Clear all</button>`
      : '';

    // Rebind remove chip buttons
    bar.querySelectorAll('[data-remove-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const { removeFilter, removeValue } = btn.dataset;
        activeFilters[removeFilter] = activeFilters[removeFilter].filter(v => v !== removeValue);
        const cb = document.querySelector(`.filter-checkbox[data-filter="${removeFilter}"][data-value="${removeValue}"]`);
        if (cb) cb.checked = false;
        const tag = document.querySelector(`.filter-tag[data-filter="${removeFilter}"][data-value="${removeValue}"]`);
        if (tag) tag.classList.remove('active');
        applyFilters();
      });
    });
    bar.querySelectorAll('.clear-all-filters').forEach(btn => {
      btn.addEventListener('click', () => {
        Object.keys(activeFilters).forEach(k => activeFilters[k] = []);
        document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);
        document.querySelectorAll('.filter-tag').forEach(tag => tag.classList.remove('active'));
        applyFilters();
      });
    });
  }
}

// ============================================================
// INGREDIENT SEARCH / FILTER
// ============================================================
function initIngredientSearch() {
  const searchInput = document.getElementById('ingredientSearch');
  const filterBtns  = document.querySelectorAll('.ingredient-filter-btn');
  const cards       = document.querySelectorAll('.ingredient-card[data-category]');
  if (!searchInput && filterBtns.length === 0) return;

  let activeCategory = 'all';

  if (searchInput) {
    searchInput.addEventListener('input', applyIngredientFilter);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category || 'all';
      applyIngredientFilter();
    });
  });

  function applyIngredientFilter() {
    const query = (searchInput?.value || '').toLowerCase().trim();
    cards.forEach(card => {
      const name  = (card.dataset.name || '').toLowerCase();
      const categ = card.dataset.category || '';
      const matchesSearch = !query || name.includes(query) ||
        card.textContent.toLowerCase().includes(query);
      const matchesCat    = activeCategory === 'all' || categ === activeCategory;
      card.style.display  = matchesSearch && matchesCat ? '' : 'none';
    });
  }
}
