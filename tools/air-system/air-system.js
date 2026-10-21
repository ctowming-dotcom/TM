(function () {
  var ICON = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11.5a2.5 2.5 0 1 0-2-4"></path><path d="M3 14h15.5a2.5 2.5 0 1 1-2 4"></path><path d="M3 11h8"></path></svg>';

  function mount(container) {
    container.innerHTML =
      '<div class="placeholder-tool">' +
      '<div class="placeholder-icon">' + ICON + '</div>' +
      '<span class="placeholder-badge">Coming soon</span>' +
      '<h2>Air System</h2>' +
      '<p>Interactive diagram of the engine’s bleed air and pressurization system. Content is being built — check back soon.</p>' +
      '</div>';
  }

  window.TM.registerTool('air-system', { mount: mount });
})();
