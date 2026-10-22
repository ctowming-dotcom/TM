(function () {
  var ICON = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"></circle><path d="M12 9.5c0-3 1-5.5 3.5-6.5"></path><path d="M14.3 10.3c2.4-1.7 5-2.2 7-1.2"></path><path d="M14.3 13.7c2.4 1.7 3.7 4 3.7 6.2"></path><path d="M9.7 13.7c-2.4 1.7-5 2.2-7 1.2"></path><path d="M9.7 10.3C7.3 8.6 6 6.3 6 4.1"></path></svg>';

  function mount(container) {
    container.innerHTML =
      '<div class="placeholder-tool">' +
      '<div class="placeholder-icon">' + ICON + '</div>' +
      '<span class="placeholder-badge">Coming soon</span>' +
      '<h2>Turbofan Engine</h2>' +
      '<p>Interactive overview of a turbofan engine’s layout and operation. Content is being built — check back soon.</p>' +
      '</div>';
  }

  window.TM.registerTool('turbofan-engine', { mount: mount });
})();
