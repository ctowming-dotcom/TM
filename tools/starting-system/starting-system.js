(function () {
  var ICON = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v7"></path><path d="M7 5.5a8 8 0 1 0 10 0"></path></svg>';

  function mount(container) {
    container.innerHTML =
      '<div class="placeholder-tool">' +
      '<div class="placeholder-icon">' + ICON + '</div>' +
      '<span class="placeholder-badge">Coming soon</span>' +
      '<h2>Starting System</h2>' +
      '<p>Interactive diagram of the engine starting sequence and components. Content is being built — check back soon.</p>' +
      '</div>';
  }

  window.TM.registerTool('starting-system', { mount: mount });
})();
