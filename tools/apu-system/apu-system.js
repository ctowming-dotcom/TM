(function () {
  // Content sourced from the supplied deck (Chapter_14_Auxiliary_Power_
  // Units_APU_v1.pptx) and its reference block diagram. The diagram is
  // redrawn in SVG (viewBox 0 0 1200 640) rather than embedding the
  // photo, following the Fuel/Oil/Starting-System pattern.
  var COMPONENTS = {
    bleedvalve: {
      name: 'Non-modulating Bleed (Load) Valve', key: true,
      desc: 'Allows the pneumatic bleed from the APU to be interconnected or isolated from the aircraft pneumatic system (the air supply for ECS, Main Engine Start, and ATM). Usually a butterfly-type, spring-loaded, fail-safe-open valve, controlled by the ECB.',
    },
    surgevalve: {
      name: 'Surge Control Valve', key: true,
      desc: 'A modulating valve on the compressor supply duct. If the load compressor delivers more airflow through the IGV than the aircraft pneumatic systems need, compressor stall/surge can result — this valve spills the excess air into the exhaust to protect both the load compressor and the engine from over-pressure. Controlled by the FCU, which supplies servo fuel to open or close it.',
    },
    igv: {
      name: 'Inlet Guide Vane (IGV)', key: true,
      desc: 'A ring of vanes at the load compressor inlet. Positioning them controls how much air reaches the compressor, letting the APU satisfy varying aircraft pneumatic load demands without changing shaft RPM.',
    },
    igva: {
      name: 'IGV Actuator (IGVA)', key: false,
      desc: 'Regulates the IGV opening to vary the pneumatic load supply entering the load compressor to suit demand. Controlled by the Electronic Control Box (ECB) and operated by servo fuel from the Fuel Control Unit (FCU) — this is how the IGV can vary the load without changing shaft RPM.',
    },
    flowsensor: {
      name: 'Flow Sensor', key: false,
      desc: 'Measures airflow into the load compressor, feeding the control system that positions the IGV to match aircraft demand.',
    },
    loadcompressor: {
      name: 'Load Compressor', key: false,
      desc: 'Compresses air drawn through the inlet for the aircraft’s pneumatic systems. Mounted on the same shaft as the gas generator, so it spins whenever the APU runs — part of the Load Section.',
    },
    accygearbox: {
      name: 'Accessory / Reduction Gearbox', key: false,
      desc: 'Reduction gears drive the components needed to operate and control the gas turbine engine, and supply the mechanical power needed to drive the electrical generator.',
    },
    gen: {
      name: 'Generator (GEN)', key: false,
      desc: 'Driven mechanically off the accessory gearbox, supplying electrical power to the aircraft — one of the two things (electrical and pneumatic) the APU exists to provide.',
    },
    ecb: {
      name: 'Electronic Control Box (ECB)', key: false,
      desc: 'Receives the aircraft’s pneumatic/electrical demand signal and commands the IGV actuator and fuel metering accordingly, coordinating how much air and fuel the APU supplies.',
    },
    compressor: {
      name: 'Compressor', key: false,
      desc: 'Part of the gas-generator (Power Section): raises incoming air to high pressure before it enters the combustor, same shaft as the turbine.',
    },
    combustor: {
      name: 'Combustor', key: false,
      desc: 'Burns metered fuel in the compressed air to produce the high-energy gas that drives the turbine.',
    },
    turbine: {
      name: 'Turbine (3 Wheels)', key: false,
      desc: 'Extracts energy from the combustor’s hot gas to drive the compressor, the load compressor, the accessory gearbox, and the generator — the Power Section’s whole reason for existing: providing torque to drive the Load Section.',
    },
    metering: {
      name: 'Fuel Metering Valve', key: false,
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
  // request. Independent of COMPONENTS (a path, not a lookup); numbered
  // yellow handles are edit-mode only, the flow line itself always shows.
  var POWER_FLOW = [
    { x: 345, y: 270 },
    { x: 460, y: 290 },
    { x: 650, y: 340 },
    { x: 800, y: 270 },
    { x: 1030, y: 270 },
  ];
  var LOAD_FLOW = [
    { x: 335, y: 270 },
    { x: 260, y: 255 },
    { x: 170, y: 230 },
    { x: 105, y: 210 },
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
        if (!saved[i] || typeof saved[i].x !== 'number' || typeof saved[i].y !== 'number') return;
      }
      items.splice.apply(items, [0, items.length].concat(saved));
    } catch (e) { /* corrupt/blocked storage — keep defaults */ }
  }
  function persistArray(key, items) {
    try { window.localStorage.setItem(key, JSON.stringify(items)); } catch (e) { /* storage full/blocked */ }
  }
  restoreArray(STORAGE_KEY_POWER_FLOW, POWER_FLOW);
  restoreArray(STORAGE_KEY_LOAD_FLOW, LOAD_FLOW);

  function box(id, x, y, w, h, label, opts) {
    opts = opts || {};
    var cx = x + w / 2, cy = y + h / 2;
    var lines = label.split('\n');
    var lh = 16;
    var startY = cy - ((lines.length - 1) * lh) / 2 + 5 - (opts.sub ? 8 : 0);
    var text = lines.map(function (ln, i) {
      return '<text class="apu-box-label" x="' + cx + '" y="' + (startY + i * lh) + '">' + ln + '</text>';
    }).join('');
    var sub = opts.sub ? '<text class="apu-box-sub" x="' + cx + '" y="' + (startY + lines.length * lh + 4) + '">' + opts.sub + '</text>' : '';
    var ring = opts.key ? '<rect class="apu-key-ring" x="' + (x - 8) + '" y="' + (y - 8) + '" width="' + (w + 16) + '" height="' + (h + 16) + '" rx="' + (h / 2 + 8) + '"></rect>' : '';
    return '<g class="apu-box" data-comp="' + id + '">' + ring +
      '<rect class="apu-box-rect" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"></rect>' +
      text + sub +
      '</g>';
  }

  function ellipse(id, cx, cy, rx, ry, opts) {
    opts = opts || {};
    var ring = opts.key ? '<ellipse class="apu-key-ring" cx="' + cx + '" cy="' + cy + '" rx="' + (rx + 9) + '" ry="' + (ry + 9) + '"></ellipse>' : '';
    return '<g class="apu-box" data-comp="' + id + '">' + ring +
      '<ellipse class="apu-box-rect" cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '"></ellipse>' +
      '</g>';
  }

  function pathFromPoints(points) {
    if (points.length < 2) return '';
    var d = 'M' + points[0].x + ',' + points[0].y;
    for (var i = 1; i < points.length; i++) d += ' L' + points[i].x + ',' + points[i].y;
    return d;
  }

  function mount(container) {
    container.innerHTML =
      '<div class="apu-diagram">' +
      '<div class="apu-toolbar">' +
      '<div>' +
      '<p class="kicker">Official (Open)</p>' +
      '<h1>Auxiliary Power Unit (APU)</h1>' +
      '<p class="apu-sub">Hover any component for its function. In edit mode, drag the numbered yellow boxes to reshape the airflow routes.</p>' +
      '</div>' +
      '<button type="button" class="apu-edit-btn" title="Edit airflow routes">✎ Edit</button>' +
      '</div>' +

      '<div class="apu-legend">' +
      '<span class="apu-legend-item power"><i></i>Power Section</span>' +
      '<span class="apu-legend-item load"><i></i>Load Section</span>' +
      '<span class="apu-legend-item key"><i></i>Key component (see reference below)</span>' +
      '</div>' +

      '<svg class="apu-svg" viewBox="0 0 1200 640" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<marker id="apu-arrow-power" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-arrowhead power"></path></marker>' +
      '<marker id="apu-arrow-load" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-arrowhead load"></path></marker>' +
      '<marker id="apu-arrow-ctrl" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-arrowhead ctrl"></path></marker>' +
      '<marker id="apu-arrow-fuel" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" class="apu-arrowhead fuel"></path></marker>' +
      '</defs>' +

      // --- section background regions ---
      '<g class="apu-region-group" data-section="load">' +
      '<rect class="apu-region load" x="10" y="15" width="340" height="460" rx="12"></rect>' +
      '<text class="apu-region-label load" x="30" y="12">LOAD SECTION</text>' +
      '</g>' +
      '<g class="apu-region-group" data-section="power">' +
      '<rect class="apu-region power" x="370" y="15" width="810" height="460" rx="12"></rect>' +
      '<text class="apu-region-label power" x="390" y="12">POWER SECTION</text>' +
      '</g>' +

      // --- mechanical shaft (static) ---
      '<path class="apu-shaft" d="M105,210 L170,245 L200,255"></path>' +
      '<path class="apu-shaft" d="M105,190 L105,210"></path>' +

      // --- control signal lines (static dashed) ---
      '<path class="apu-ctrl" d="M20,457 L165,457" marker-end="url(#apu-arrow-ctrl)"></path>' +
      '<text class="apu-small-label" x="22" y="448">DEMAND</text>' +
      '<path class="apu-ctrl" d="M225,430 L235,395" marker-end="url(#apu-arrow-ctrl)"></path>' +
      '<path class="apu-ctrl" d="M285,457 L655,457 L655,440" marker-end="url(#apu-arrow-ctrl)"></path>' +

      // --- bypass / surge duct (static, animated power-colored) ---
      '<path class="apu-pipe power" d="M460,230 L460,72" marker-end="url(#apu-arrow-power)"></path>' +
      '<path class="apu-pipe power" d="M460,72 L1000,72" marker-end="url(#apu-arrow-power)"></path>' +
      '<path class="apu-pipe power" d="M1000,72 L1000,270 L1030,270" marker-end="url(#apu-arrow-power)"></path>' +

      // --- load compressor to bleed valve, and bleed-out ---
      '<path class="apu-pipe load" d="M260,225 L260,100 L200,100" marker-end="url(#apu-arrow-load)"></path>' +
      '<path class="apu-pipe load" d="M60,70 L15,70" marker-end="url(#apu-arrow-load)"></path>' +
      '<text class="apu-small-label" x="15" y="58">TO A/C PNEUMATIC SYS.</text>' +

      // --- fuel supply ---
      '<path class="apu-pipe fuel" d="M655,520 L655,485" marker-end="url(#apu-arrow-fuel)"></path>' +
      '<text class="apu-small-label" x="630" y="535">FUEL</text>' +
      '<path class="apu-pipe fuel" d="M655,440 L655,410" marker-end="url(#apu-arrow-fuel)"></path>' +

      // --- exhaust exit ---
      '<path class="apu-pipe power" d="M1030,290 L1160,290" marker-end="url(#apu-arrow-power)"></path>' +
      '<text class="apu-small-label" x="1065" y="280">EXHAUST</text>' +

      // --- air intake label ---
      '<text class="apu-small-label" x="265" y="300">AIR INTAKE</text>' +

      // --- main flow routes (editable waypoints) ---
      '<path class="apu-flow-path power" d="' + pathFromPoints(POWER_FLOW) + '" marker-end="url(#apu-arrow-power)"></path>' +
      '<path class="apu-flow-path load" d="' + pathFromPoints(LOAD_FLOW) + '" marker-end="url(#apu-arrow-load)"></path>' +

      // --- components ---
      box('bleedvalve', 60, 40, 140, 60, 'BLEED VALVE', { key: true }) +
      box('gen', 60, 140, 90, 50, 'GEN') +
      box('accygearbox', 60, 210, 130, 70, 'ACCY\nGEARBOX') +
      box('flowsensor', 200, 140, 120, 50, 'FLOW SENSOR') +
      box('loadcompressor', 200, 225, 120, 60, 'LOAD\nCOMPRESSOR') +
      box('igva', 190, 345, 90, 50, 'IGVA') +
      box('ecb', 165, 430, 120, 55, 'ECB') +
      box('surgevalve', 420, 30, 170, 70, 'SURGE CONTROL\nVALVE', { key: true }) +
      box('compressor', 400, 230, 120, 120, 'COMPRESSOR') +
      box('combustor', 560, 250, 190, 160, 'COMBUSTOR') +
      box('turbine', 800, 230, 190, 120, 'TURBINE\n(3 WHEELS)') +
      box('metering', 600, 440, 110, 45, 'METERING') +

      // IGV oval last so it paints over the shaft/pipe lines cleanly
      ellipse('igv', 230, 310, 14, 26, { key: true }) +

      '<g class="apu-flow-handles"></g>' +

      '</svg>' +

      '<div class="apu-explain"><span class="e-title">Hover a component</span><span class="e-desc">Hover any box in the diagram above to see what it does, here.</span></div>' +

      '<div class="apu-sections">' +
      '<div class="apu-section-card power"><h3>' + SECTIONS.power.name + '</h3><p>' + SECTIONS.power.desc + '</p></div>' +
      '<div class="apu-section-card load"><h3>' + SECTIONS.load.name + '</h3><p>' + SECTIONS.load.desc + '</p></div>' +
      '</div>' +

      '<div class="apu-ref">' +
      '<h3 class="apu-ref-title">Key components (circled in the reference diagram)</h3>' +
      '<ul class="apu-list key-list"></ul>' +
      '<h3 class="apu-ref-title">Every other component</h3>' +
      '<ul class="apu-list other-list"></ul>' +
      '</div>' +

      '<div class="apu-edit-panel" hidden>' +
      '<p>Drag the numbered yellow boxes to reshape the Power/Load airflow routes. When done:</p>' +
      '<button type="button" class="apu-edit-copy">Copy changes</button>' +
      '<textarea readonly></textarea>' +
      '</div>' +

      '</div>';

    var root = container.querySelector('.apu-diagram');
    var svg = root.querySelector('.apu-svg');
    var explain = root.querySelector('.apu-explain');
    var eTitle = explain.querySelector('.e-title');
    var eDesc = explain.querySelector('.e-desc');
    var editBtn = root.querySelector('.apu-edit-btn');
    var editPanel = root.querySelector('.apu-edit-panel');
    var editPanelText = editPanel.querySelector('textarea');
    var editCopyBtn = editPanel.querySelector('.apu-edit-copy');
    var flowHandleLayer = root.querySelector('.apu-flow-handles');
    var powerFlowPath = root.querySelector('.apu-flow-path.power');
    var loadFlowPath = root.querySelector('.apu-flow-path.load');
    var keyListEl = root.querySelector('.key-list');
    var otherListEl = root.querySelector('.other-list');

    var editUnlocked = false;

    function keyFor(id) { return COMPONENTS[id] ? id : null; }

    function listItemHtml(id, c) {
      return '<li class="apu-list-item" data-comp="' + id + '">' +
        '<span class="apu-list-name">' + TM.escapeHtml(c.name) + '</span>' +
        '<span class="apu-list-desc">' + TM.escapeHtml(c.desc) + '</span>' +
        '</li>';
    }
    keyListEl.innerHTML = Object.keys(COMPONENTS).filter(function (id) { return COMPONENTS[id].key; })
      .map(function (id) { return listItemHtml(id, COMPONENTS[id]); }).join('');
    otherListEl.innerHTML = Object.keys(COMPONENTS).filter(function (id) { return !COMPONENTS[id].key; })
      .map(function (id) { return listItemHtml(id, COMPONENTS[id]); }).join('');

    function showExplain(c) {
      eTitle.textContent = c.name;
      eDesc.textContent = c.desc;
      explain.classList.add('has-value');
    }
    function hideExplain() {
      eTitle.textContent = 'Hover a component';
      eDesc.textContent = 'Hover any box in the diagram above to see what it does, here.';
      explain.classList.remove('has-value');
    }
    function setActive(id, active) {
      root.querySelectorAll('[data-comp="' + id + '"]').forEach(function (el) {
        el.classList.toggle('is-hovered', active);
      });
    }

    root.querySelectorAll('.apu-box').forEach(function (g) {
      var id = g.getAttribute('data-comp');
      var c = COMPONENTS[id];
      if (!c) return;
      g.addEventListener('mouseenter', function () { showExplain(c); setActive(id, true); });
      g.addEventListener('mouseleave', function () { hideExplain(); setActive(id, false); });
    });
    root.querySelectorAll('.apu-list-item').forEach(function (li) {
      var id = li.getAttribute('data-comp');
      var c = COMPONENTS[id];
      li.addEventListener('mouseenter', function () { showExplain(c); setActive(id, true); });
      li.addEventListener('mouseleave', function () { hideExplain(); setActive(id, false); });
    });

    // --- SVG coordinate conversion (for dragging flow waypoints) ---
    function svgPoint(evt) {
      var pt = svg.createSVGPoint();
      pt.x = evt.clientX; pt.y = evt.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function rebuildFlowPaths() {
      powerFlowPath.setAttribute('d', pathFromPoints(POWER_FLOW));
      loadFlowPath.setAttribute('d', pathFromPoints(LOAD_FLOW));
    }

    function formatFlow(varName, points) {
      var lines = points.map(function (p) {
        return '    { x: ' + Math.round(p.x) + ', y: ' + Math.round(p.y) + ' },';
      });
      return '  var ' + varName + ' = [\n' + lines.join('\n') + '\n  ];';
    }
    function updateEditPanel() {
      if (!editUnlocked) return;
      editPanelText.value = formatFlow('POWER_FLOW', POWER_FLOW) + '\n\n' + formatFlow('LOAD_FLOW', LOAD_FLOW);
      persistArray(STORAGE_KEY_POWER_FLOW, POWER_FLOW);
      persistArray(STORAGE_KEY_LOAD_FLOW, LOAD_FLOW);
    }

    function renderFlowHandles() {
      var all = POWER_FLOW.map(function (p, i) { return { p: p, n: i + 1, cls: 'power' }; })
        .concat(LOAD_FLOW.map(function (p, i) { return { p: p, n: i + 1, cls: 'load' }; }));
      flowHandleLayer.innerHTML = all.map(function (item, idx) {
        var p = item.p;
        return '<rect class="apu-flow-handle" data-idx="' + idx + '" x="' + (p.x - 9) + '" y="' + (p.y - 9) + '" width="18" height="18"></rect>' +
          '<text class="apu-flow-handle-label" data-idx="' + idx + '" x="' + p.x + '" y="' + p.y + '">' + item.n + '</text>';
      }).join('');
      flowHandleLayer.querySelectorAll('.apu-flow-handle').forEach(function (el) {
        var idx = Number(el.getAttribute('data-idx'));
        var points = idx < POWER_FLOW.length ? POWER_FLOW : LOAD_FLOW;
        var i = idx < POWER_FLOW.length ? idx : idx - POWER_FLOW.length;
        var label = flowHandleLayer.querySelector('.apu-flow-handle-label[data-idx="' + idx + '"]');
        el.addEventListener('pointerdown', function (evt) {
          if (!editUnlocked) return;
          evt.preventDefault();
          el.setPointerCapture(evt.pointerId);
          el.classList.add('dragging');
          function onMove(moveEvt) {
            var pt = svgPoint(moveEvt);
            var x = Math.round(pt.x), y = Math.round(pt.y);
            points[i] = { x: x, y: y };
            // Update this handle's own attributes in place rather than
            // re-rendering the handle layer mid-drag — re-rendering would
            // replace the <rect> the pointer is captured on, silently
            // ending the drag after one move (same bug the Virtual Lab's
            // waypoint handles had before it was fixed).
            el.setAttribute('x', x - 9);
            el.setAttribute('y', y - 9);
            label.setAttribute('x', x);
            label.setAttribute('y', y);
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
      });
    }
    renderFlowHandles();

    editBtn.addEventListener('click', function () {
      if (editUnlocked) {
        editUnlocked = false;
        editBtn.textContent = '✎ Edit';
        editBtn.classList.remove('active');
        editPanel.hidden = true;
        root.classList.remove('apu-edit');
        return;
      }
      var pw = window.prompt('Enter the edit password:');
      if (pw === null) return;
      if (pw === EDIT_PASSWORD) {
        editUnlocked = true;
        editBtn.textContent = '✓ Editing (click to stop)';
        editBtn.classList.add('active');
        editPanel.hidden = false;
        root.classList.add('apu-edit');
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
