(function () {
  var STORAGE_KEY = 'dream_clothing_wishlist';

  function readWishlist() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  }

  function writeWishlist(ids) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch (error) {
      /* localStorage unavailable (private browsing, etc.) — fail silently */
    }
  }

  function syncButton(button, ids) {
    var isActive = ids.indexOf(button.dataset.productId) !== -1;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  }

  function syncAllButtons() {
    var ids = readWishlist();
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (button) {
      syncButton(button, ids);
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-wishlist-toggle]');
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    var productId = button.dataset.productId;
    var ids = readWishlist();
    var index = ids.indexOf(productId);

    if (index === -1) {
      ids.push(productId);
    } else {
      ids.splice(index, 1);
    }

    writeWishlist(ids);
    syncButton(button, ids);
  });

  document.addEventListener('DOMContentLoaded', syncAllButtons);
  document.addEventListener('shopify:section:load', syncAllButtons);
})();
