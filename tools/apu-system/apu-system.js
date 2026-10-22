(function () {
  // Content sourced from the supplied deck (Chapter_14_Auxiliary_Power_
  // Units_APU_v1.pptx). The diagram itself is the user's own supplied
  // reference image, used verbatim (not redrawn) — tools/apu-system/
  // apu-diagram.png, 1286x744 — with markers/regions/flow routes
  // overlaid at percentage positions, the same pattern Air System uses
  // for its engine-diagram.png.
  var COMPONENTS = {
    bleedvalve: {
      name: 'Non-modulating Bleed (Load) Valve', key: true, xPct: 16.9, yPct: 17.5,
      desc: 'Allows the pneumatic bleed from the APU to be interconnected or isolated from the aircraft pneumatic system (the air supply for ECS, Main Engine Start, and ATM). Usually a butterfly-type, spring-loaded, fail-safe-open valve, controlled by the ECB.',
    },
    surgevalve: {
      name: 'Surge Control Valve', key: true, xPct: 40.8, yPct: 16.1,
      desc: 'A modulating valve on the compressor supply duct. If the load compressor delivers more airflow through the IGV than the aircraft pneumatic systems need, compressor stall/surge can result — this valve spills the excess air into the exhaust to protect both the load compressor and the engine from over-pressure. Controlled by the FCU, which supplies servo fuel to open or close it.',
    },
    igv: {
      name: 'Inlet Guide Vane (IGV)', key: true, xPct: 24.3, yPct: 44,
      desc: 'A ring of vanes at the load compressor inlet (the small vertical oval next to the IGVA box). Positioning them controls how much air reaches the compressor, letting the APU satisfy varying aircraft pneumatic load demands without changing shaft RPM.',
    },
    igva: {
      name: 'IGV Actuator (IGVA)', key: false, xPct: 19.6, yPct: 52.4,
      desc: 'Regulates the IGV opening to vary the pneumatic load supply entering the load compressor to suit demand. Controlled by the Electronic Control Box (ECB) and operated by servo fuel from the Fuel Control Unit (FCU) — this is how the IGV can vary the load without changing shaft RPM.',
    },
    flowsensor: {
      name: 'Flow Sensor', key: false, xPct: 27.6, yPct: 26.9,
      desc: 'Measures airflow into the load compressor, feeding the control system that positions the IGV to match aircraft demand.',
    },
    loadcompressor: {
      name: 'Load Compressor', key: false, xPct: 9.2, yPct: 53.7,
      desc: 'Compresses air drawn through the inlet for the aircraft’s pneumatic systems. Mounted on the same shaft as the gas generator, so it spins whenever the APU runs — part of the Load Section.',
    },
    accygearbox: {
      name: 'Accessory / Reduction Gearbox', key: false, xPct: 15.5, yPct: 33.6,
      desc: 'Reduction gears drive the components needed to operate and control the gas turbine engine, and supply the mechanical power needed to drive the electrical generator.',
    },
    gen: {
      name: 'Generator (GEN)', key: false, xPct: 8.4, yPct: 31.6,
      desc: 'Driven mechanically off the accessory gearbox, supplying electrical power to the aircraft — one of the two things (electrical and pneumatic) the APU exists to provide.',
    },
    ecb: {
      name: 'Electronic Control Box (ECB)', key: false, xPct: 21, yPct: 80,
      desc: 'Receives the aircraft’s pneumatic/electrical demand signal and commands the IGV actuator and fuel metering accordingly, coordinating how much air and fuel the APU supplies.',
    },
    compressor: {
      name: 'Compressor', key: false, xPct: 42.4, yPct: 40.3,
      desc: 'Part of the gas-generator (Power Section): raises incoming air to high pressure before it enters the combustor, same shaft as the turbine.',
    },
    combustor: {
      name: 'Combustor', key: false, xPct: 56.8, yPct: 64.5,
      desc: 'Burns metered fuel in the compressed air to produce the high-energy gas that drives the turbine.',
    },
    turbine: {
      name: 'Turbine (3 Wheels)', key: false, xPct: 81.3, yPct: 39,
      desc: 'Extracts energy from the combustor’s hot gas to drive the compressor, the load compressor, the accessory gearbox, and the generator — the Power Section’s whole reason for existing: providing torque to drive the Load Section.',
    },
    metering: {
      name: 'Fuel Metering Valve', key: false, xPct: 54.4, yPct: 82,
      desc: 'Meters fuel into the combustor in the quantity commanded by the ECB/FCU for the current demand.',
    },
  };

  var SECTIONS = {
    power: {
      name: 'Power Section',
      desc: 'The gas turbine engine itself — compressor, combustor, and turbine — that burns fuel to produce torque. Its only job is to drive the Load Section (and, through it, the aircraft’s electrical and pneumatic systems).',
    },
    load: {
      name: 'Load Section',
      desc: 'The generator and load compressor, driven by the Power Section’s turbine through the accessory gearbox. This is what actually powers the aircraft — electrical power from the generator, pneumatic power (bleed air) from the load compressor.',
    },
  };

  // Simplified airflow routes from a shared inlet, split into the Power
  // Section (compressor → combustor → turbine → exhaust) and Load
  // Section (load compressor → accessory gearbox) paths named in the
  // request. Percentage coordinates over the image, like Air System's
  // flow routes. Edit-mode-only numbered yellow handles; the flow line
  // itself is always visible.
  var POWER_FLOW = [
    { xPct: 31, yPct: 47 },
    { xPct: 42, yPct: 40 },
    { xPct: 57, yPct: 55 },
    { xPct: 81, yPct: 39 },
    { xPct: 93, yPct: 31 },
  ];
  var LOAD_FLOW = [
    { xPct: 29, yPct: 47 },
    { xPct: 23, yPct: 45 },
    { xPct: 18, yPct: 40 },
    { xPct: 15, yPct: 34 },
  ];

  var EDIT_PASSWORD = 'APP';
  var STORAGE_KEY_POWER_FLOW = 'tm.apuSystem.powerFlow';
  var STORAGE_KEY_LOAD_FLOW = 'tm.apuSystem.loadFlow';

  function restoreArray(key, items) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) return;
      var saved = JSON.parse(raw);
      if (!Array.isArray(saved) || saved.length !== items.length) return;
      for (var i = 0; i < saved.length; i++) {
        if (!saved[i] || typeof saved[i].xPct !== 'number' || typeof saved[i].yPct !== 'number') return;
      }
      items.splice.apply(items, [0, items.length].concat(saved));
    } catch (e) { /* corrupt/blocked storage — keep defaults */ }
  }
  function persistArray(key, items) {
    try { window.localStorage.setItem(key, JSON.stringify(items)); } catch (e) { /* storage full/blocked */ }
  }
  restoreArray(STORAGE_KEY_POWER_FLOW, POWER_FLOW);
  restoreArray(STORAGE_KEY_LOAD_FLOW, LOAD_FLOW);

  function pathFromPoints(points) {
    if (points.length < 2) return '';
    var d = 'M' + points[0].xPct + ',' + points[0].yPct;
    for (var i = 1; i < points.length; i++) d += ' L' + points[i].xPct + ',' + points[i].yPct;
    return d;
  }

  function mount(container) {
    container.innerHTML =
      '<div class="apu-sys">' +
      '<div class="apu-sys-toolbar">' +
      '<div>' +
      '<p class="kicker">Official (Open)</p>' +
      '<h1>Auxiliary Power Unit (APU)</h1>' +
      '<p class="apu-sys-sub">Hover any component for its function. In edit mode, drag the numbered yellow boxes to reshape the airflow routes.</p>' +
      '</div>' +
      '<button type="button" class="apu-sys-edit-btn" title="Edit airflow routes">✎ Edit</button>' +
      '</div>' +

      '<div class="apu-sys-legend">' +
      '<span class="apu-sys-legend-item power"><i></i>Power Section</span>' +
      '<span class="apu-sys-legend-item load"><i></i>Load Section</span>' +
      '<span class="apu-sys-legend-item key"><i></i>Key component (see reference below)</span>' +
      '</div>' +

      '<div class="apu-sys-image-wrap">' +
      '<img class="apu-sys-image" src="tools/apu-system/apu-diagram.png" alt="APU block diagram: bleed valve, surge control valve, generator, accessory gearbox, load compressor, flow sensor, IGV/IGVA, ECB, compressor, combustor, turbine, fuel metering.">' +

      '<div class="apu-sys-region power"></div>' +
      '<div class="apu-sys-region load"></div>' +

      '<svg class="apu-sys-flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<defs>' +
      '<marker id="apu-sys-arrow-power" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-sys-arrowhead power"></path></marker>' +
      '<marker id="apu-sys-arrow-load" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-sys-arrowhead load"></path></marker>' +
      '</defs>' +
      '<path class="apu-sys-flow-path power" d="' + pathFromPoints(POWER_FLOW) + '" marker-end="url(#apu-sys-arrow-power)"></path>' +
      '<path class="apu-sys-flow-path load" d="' + pathFromPoints(LOAD_FLOW) + '" marker-end="url(#apu-sys-arrow-load)"></path>' +
      '</svg>' +

      '<div class="apu-sys-flow-boxes"></div>' +
      '<div class="apu-sys-markers"></div>' +
      '</div>' +

      '<div class="apu-sys-tooltip"><span class="t-title"></span><span class="t-desc"></span></div>' +

      '<div class="apu-sys-sections">' +
      '<div class="apu-sys-section-card power"><h3>' + SECTIONS.power.name + '</h3><p>' + SECTIONS.power.desc + '</p></div>' +
      '<div class="apu-sys-section-card load"><h3>' + SECTIONS.load.name + '</h3><p>' + SECTIONS.load.desc + '</p></div>' +
      '</div>' +

      '<div class="apu-sys-ref">' +
      '<h3 class="apu-sys-ref-title">Key components (circled in the reference diagram)</h3>' +
      '<ul class="apu-sys-list key-list"></ul>' +
      '<h3 class="apu-sys-ref-title">Every other component</h3>' +
      '<ul class="apu-sys-list other-list"></ul>' +
      '</div>' +

      '<div class="apu-sys-edit-panel" hidden>' +
      '<p>Drag the numbered yellow boxes to reshape the Power/Load airflow routes. When done:</p>' +
      '<button type="button" class="apu-sys-edit-copy">Copy changes</button>' +
      '<textarea readonly></textarea>' +
      '</div>' +

      '</div>';

    var root = container.querySelector('.apu-sys');
    var imageWrap = root.querySelector('.apu-sys-image-wrap');
    var markerLayer = root.querySelector('.apu-sys-markers');
    var flowSegRoot = root.querySelector('.apu-sys-flow-svg');
    var flowBoxLayer = root.querySelector('.apu-sys-flow-boxes');
    var powerFlowPath = root.querySelector('.apu-sys-flow-path.power');
    var loadFlowPath = root.querySelector('.apu-sys-flow-path.load');
    var tooltip = root.querySelector('.apu-sys-tooltip');
    var tTitle = tooltip.querySelector('.t-title');
    var tDesc = tooltip.querySelector('.t-desc');
    var editBtn = root.querySelector('.apu-sys-edit-btn');
    var editPanel = root.querySelector('.apu-sys-edit-panel');
    var editPanelText = editPanel.querySelector('textarea');
    var editCopyBtn = editPanel.querySelector('.apu-sys-edit-copy');
    var keyListEl = root.querySelector('.key-list');
    var otherListEl = root.querySelector('.other-list');

    var editUnlocked = false;

    function listItemHtml(id, c) {
      return '<li class="apu-sys-list-item" data-comp="' + id + '">' +
        '<span class="apu-sys-list-name">' + TM.escapeHtml(c.name) + '</span>' +
        '<span class="apu-sys-list-desc">' + TM.escapeHtml(c.desc) + '</span>' +
        '</li>';
    }
    keyListEl.innerHTML = Object.keys(COMPONENTS).filter(function (id) { return COMPONENTS[id].key; })
      .map(function (id) { return listItemHtml(id, COMPONENTS[id]); }).join('');
    otherListEl.innerHTML = Object.keys(COMPONENTS).filter(function (id) { return !COMPONENTS[id].key; })
      .map(function (id) { return listItemHtml(id, COMPONENTS[id]); }).join('');

    function showTip(evt, c) {
      tTitle.textContent = c.name;
      tDesc.textContent = c.desc;
      tooltip.style.display = 'block';
      positionTip(evt);
    }
    function positionTip(evt) {
      if (tooltip.style.display !== 'block') return;
      var rect = root.getBoundingClientRect();
      var x = evt.clientX - rect.left + 16;
      var y = evt.clientY - rect.top + 16;
      var maxX = rect.width - 300;
      if (x > maxX) x = evt.clientX - rect.left - 296;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
    function hideTip() {
      tooltip.style.display = 'none';
    }
    function setActive(id, active) {
      root.querySelectorAll('[data-comp="' + id + '"]').forEach(function (el) {
        el.classList.toggle('is-hovered', active);
      });
    }

    markerLayer.innerHTML = Object.keys(COMPONENTS).map(function (id) {
      var c = COMPONENTS[id];
      return '<span class="apu-sys-marker' + (c.key ? ' key' : '') + '" data-comp="' + id + '" style="left:' + c.xPct + '%; top:' + c.yPct + '%;"></span>';
    }).join('');
    markerLayer.querySelectorAll('.apu-sys-marker').forEach(function (el) {
      var id = el.getAttribute('data-comp');
      var c = COMPONENTS[id];
      el.addEventListener('mouseenter', function (e) { showTip(e, c); setActive(id, true); });
      el.addEventListener('mousemove', positionTip);
      el.addEventListener('mouseleave', function () { hideTip(); setActive(id, false); });
    });
    root.querySelectorAll('.apu-sys-list-item').forEach(function (li) {
      var id = li.getAttribute('data-comp');
      var c = COMPONENTS[id];
      li.addEventListener('mouseenter', function (e) { showTip(e, c); setActive(id, true); });
      li.addEventListener('mousemove', positionTip);
      li.addEventListener('mouseleave', function () { hideTip(); setActive(id, false); });
    });

    function rebuildFlowPaths() {
      powerFlowPath.setAttribute('d', pathFromPoints(POWER_FLOW));
      loadFlowPath.setAttribute('d', pathFromPoints(LOAD_FLOW));
    }

    function formatFlow(varName, points) {
      var lines = points.map(function (p) {
        return '    { xPct: ' + (Math.round(p.xPct * 10) / 10) + ', yPct: ' + (Math.round(p.yPct * 10) / 10) + ' },';
      });
      return '  var ' + varName + ' = [\n' + lines.join('\n') + '\n  ];';
    }
    function updateEditPanel() {
      if (!editUnlocked) return;
      editPanelText.value = formatFlow('POWER_FLOW', POWER_FLOW) + '\n\n' + formatFlow('LOAD_FLOW', LOAD_FLOW);
      persistArray(STORAGE_KEY_POWER_FLOW, POWER_FLOW);
      persistArray(STORAGE_KEY_LOAD_FLOW, LOAD_FLOW);
    }

    function makeDraggable(el, item) {
      el.addEventListener('pointerdown', function (evt) {
        if (!editUnlocked) return;
        evt.preventDefault();
        el.setPointerCapture(evt.pointerId);
        el.classList.add('dragging');
        function onMove(moveEvt) {
          var rect = imageWrap.getBoundingClientRect();
          var x = ((moveEvt.clientX - rect.left) / rect.width) * 100;
          var y = ((moveEvt.clientY - rect.top) / rect.height) * 100;
          x = Math.max(0, Math.min(100, x));
          y = Math.max(0, Math.min(100, y));
          item.xPct = x;
          item.yPct = y;
          el.style.left = x + '%';
          el.style.top = y + '%';
          rebuildFlowPaths();
          updateEditPanel();
        }
        function onUp(upEvt) {
          el.classList.remove('dragging');
          el.releasePointerCapture(upEvt.pointerId);
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerup', onUp);
        }
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
      });
    }

    function renderFlowBoxes() {
      var all = POWER_FLOW.map(function (p, i) { return { p: p, n: i + 1 }; })
        .concat(LOAD_FLOW.map(function (p, i) { return { p: p, n: i + 1 }; }));
      flowBoxLayer.innerHTML = all.map(function (item) {
        return '<span class="apu-sys-flow-box" style="left:' + item.p.xPct + '%; top:' + item.p.yPct + '%;">' + item.n + '</span>';
      }).join('');
      flowBoxLayer.querySelectorAll('.apu-sys-flow-box').forEach(function (el, idx) {
        var points = idx < POWER_FLOW.length ? POWER_FLOW : LOAD_FLOW;
        var i = idx < POWER_FLOW.length ? idx : idx - POWER_FLOW.length;
        makeDraggable(el, points[i]);
      });
    }
    renderFlowBoxes();

    editBtn.addEventListener('click', function () {
      if (editUnlocked) {
        editUnlocked = false;
        editBtn.textContent = '✎ Edit';
        editBtn.classList.remove('active');
        editPanel.hidden = true;
        root.classList.remove('apu-sys-edit');
        return;
      }
      var pw = window.prompt('Enter the edit password:');
      if (pw === null) return;
      if (pw === EDIT_PASSWORD) {
        editUnlocked = true;
        editBtn.textContent = '✓ Editing (click to stop)';
        editBtn.classList.add('active');
        editPanel.hidden = false;
        root.classList.add('apu-sys-edit');
        updateEditPanel();
      } else {
        window.alert('Incorrect password.');
      }
    });

    editCopyBtn.addEventListener('click', function () {
      editPanelText.focus();
      editPanelText.select();
      try { document.execCommand('copy'); } catch (e) { /* text stays selected for manual copy */ }
    });
  }

  window.TM.registerTool('apu-system', { mount: mount });
})();
