(function () {
  var ICON = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"></path></svg>';

  function mount(container) {
    container.innerHTML =
      '<div class="placeholder-tool">' +
      '<div class="placeholder-icon">' + ICON + '</div>' +
      '<span class="placeholder-badge">Coming soon</span>' +
      '<h2>APU System</h2>' +
      '<p>Interactive diagram of the Auxiliary Power Unit and its systems. Content is being built — check back soon.</p>' +
      '</div>';
  }

  window.TM.registerTool('apu-system', { mount: mount });
})();
