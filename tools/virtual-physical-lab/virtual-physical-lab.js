(function () {
  var ICON = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"></path><path d="M10 3v5.5L5.5 17a2 2 0 0 0 1.8 2.9h9.4a2 2 0 0 0 1.8-2.9L14 8.5V3"></path><path d="M7.5 14.5h9"></path></svg>';

  function mount(container) {
    container.innerHTML =
      '<div class="placeholder-tool">' +
      '<div class="placeholder-icon">' + ICON + '</div>' +
      '<span class="placeholder-badge">Coming soon</span>' +
      '<h2>Virtual Physical Lab for Engine Run</h2>' +
      '<p>A hands-on virtual lab for running through engine start-up and operation procedures. Content is being built — check back soon.</p>' +
      '</div>';
  }

  window.TM.registerTool('virtual-physical-lab', { mount: mount });
})();
