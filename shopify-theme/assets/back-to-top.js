(function () {
  var button = document.getElementById('BackToTop');
  if (!button) return;

  var visibleThreshold = window.innerHeight;
  var ticking = false;

  function updateVisibility() {
    button.classList.toggle('is-visible', window.scrollY > visibleThreshold);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );

  button.addEventListener('click', function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();
