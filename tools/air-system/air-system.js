(function () {
  // Content sourced from the supplied deck: Chapter_11_Air_System_v1_2hr.pptx.
  // Both modes share one engine diagram (supplied by the user); marker
  // positions are percentages of that image's width/height so they scale
  // with it responsively regardless of displayed size.
  var INTERNAL_ITEMS = [
    { id: 'thrust-bearing', xPct: 49, yPct: 44, name: 'Thrust Bearing Load Relief', desc: 'Air pressure is used to offset part of the axial load on the main thrust bearing, reducing the load it must carry.' },
    { id: 'labyrinth-seal', xPct: 46, yPct: 51, name: 'Sealing of Main Bearing Compartments (Labyrinth Seal)', desc: 'Labyrinth seals use a pressurized air barrier to keep oil inside the bearing compartments and hot gas or debris out.' },
    { id: 'combustor-liner', xPct: 62, yPct: 24, name: 'Cooling of Combustion Chamber (Combustion Liner)', desc: 'Air passes through and around the combustor liner to keep its walls within temperature limits while the fuel-air mixture burns inside.' },
    { id: 'ngv-cooling', xPct: 72, yPct: 25, name: 'Cooling of Nozzle Guide Vanes', desc: 'NGVs direct combustion gas onto the turbine rotor and sit directly in the hottest gas path, so they are cooled with air bled from the compressor.' },
    { id: 'turbine-blade', xPct: 77, yPct: 26, name: 'Cooling of Turbine Blades', desc: 'Cooling air is fed through the turbine blades to keep metal temperatures within limits despite the extremely hot combustion gases flowing over them.' },
    { id: 'turbine-disc', xPct: 71, yPct: 46, name: 'Cooling of Turbine Discs', desc: 'Cooling air is directed onto the turbine disc faces to limit disc temperature and the thermal stresses that would otherwise shorten its fatigue life.' },
  ];

  var EXTERNAL_ITEMS = [
    { id: 'anti-icing', xPct: 10, yPct: 44, name: 'Engine Anti-Icing System (Hot Air)', desc: 'Hot air from the compressor is delivered to the inlet guide vanes and intake strut to prevent ice forming and disrupting airflow into the intake.' },
    { id: 'eec-cooling', xPct: 20, yPct: 12, name: 'EEC Cooling', desc: 'The Electronic Engine Control is mounted in the fan case; on some engines it is cooled by ram air.' },
    { id: 'customer-bleed', xPct: 38, yPct: 12, name: 'Customer Bleed', desc: 'Pressurized air taken from the compressor for airframe use — air-conditioning and cabin/reservoir pressurization. It is bled as early as possible in the compressor to minimize the effect on engine performance; during descent, with the engine at idle, HP bleed is needed to meet pressurization demand. A precooler regulates its temperature before it reaches the aircraft systems.' },
    { id: 'generator-cooling', xPct: 22, yPct: 88, name: 'Electrical Generator Cooling', desc: 'The integrated drive generators, driven by the external gearbox off the HP shaft, are cooled with fan air.' },
    { id: 'igniter-cooling', xPct: 58, yPct: 88, name: 'Igniter Lead & Igniter Box Cooling', desc: 'The exciter (igniter) box steps low voltage up to around 22 kV; fan air cools both the box and the high-tension leads carrying that voltage.' },
    { id: 'tcc-acc', xPct: 68, yPct: 12, name: 'Turbine Case Cooling / Active Clearance Control', desc: 'A dual-channel, EEC-controlled system plays fan air onto the HP and LP turbine cases to shrink them, tightening blade-tip clearance for better efficiency and longer service life. The EEC positions the actuator (using fuel muscle pressure) as a function of altitude and N2 speed.' },
    { id: 'nacelle-vent', xPct: 85, yPct: 88, name: 'Nacelle Ventilation and Cooling', desc: 'The space between the engine cowling and casing (the nacelle) is ventilated with fan air to prevent fluid vapor from accumulating and self-igniting.' },
  ];

  function mount(container) {
    container.innerHTML =
      '<div class="air-sys">' +
      '<div class="air-sys-header">' +
      '<h1>Air System</h1>' +
      '<p>The engine air system covers every airflow that doesn’t directly produce thrust. Switch between its two halves and hover a marker — or a list item — for what it does.</p>' +
      '</div>' +

      '<div class="air-sys-toggle">' +
      '<button type="button" class="air-sys-mode-btn active" data-mode="internal">Internal Air System</button>' +
      '<button type="button" class="air-sys-mode-btn" data-mode="external">External Air System</button>' +
      '</div>' +

      '<div class="air-sys-body">' +
      '<div class="air-sys-stage">' +
      '<div class="air-sys-image-wrap">' +
      '<img class="air-sys-image" src="tools/air-system/engine-diagram.png" alt="Generic turbojet cutaway diagram: intake, compression, combustion and exhaust sections, cold section and hot section labeled.">' +
      '<div class="air-sys-image-markers"></div>' +
      '</div>' +
      '</div>' +
      '<ul class="air-sys-list"></ul>' +
      '</div>' +

      '<div class="air-sys-tooltip"><span class="t-title"></span><span class="t-desc"></span></div>' +
      '</div>';

    var root = container.querySelector('.air-sys');
    var markerLayer = root.querySelector('.air-sys-image-markers');
    var listEl = root.querySelector('.air-sys-list');
    var modeButtons = root.querySelectorAll('.air-sys-mode-btn');

    var tooltip = root.querySelector('.air-sys-tooltip');
    var tTitle = tooltip.querySelector('.t-title');
    var tDesc = tooltip.querySelector('.t-desc');

    function showTip(evt, item) {
      tTitle.textContent = item.name;
      tDesc.textContent = item.desc;
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
      root.querySelectorAll('[data-marker="' + id + '"]').forEach(function (el) {
        el.classList.toggle('is-hovered', active);
      });
      var li = root.querySelector('[data-list="' + id + '"]');
      if (li) li.classList.toggle('is-hovered', active);
    }

    function render(mode) {
      root.className = 'air-sys air-sys-mode-' + mode;
      var items = mode === 'internal' ? INTERNAL_ITEMS : EXTERNAL_ITEMS;

      markerLayer.innerHTML = items.map(function (item) {
        return '<span class="air-sys-img-marker" data-marker="' + item.id + '" style="left:' + item.xPct + '%; top:' + item.yPct + '%;"></span>';
      }).join('');

      markerLayer.querySelectorAll('.air-sys-img-marker').forEach(function (el, i) {
        var item = items[i];
        el.addEventListener('mouseenter', function (e) { showTip(e, item); setActive(item.id, true); });
        el.addEventListener('mousemove', positionTip);
        el.addEventListener('mouseleave', function () { hideTip(); setActive(item.id, false); });
      });

      listEl.innerHTML = items.map(function (item) {
        return '<li class="air-sys-list-item" data-list="' + item.id + '">' +
          '<span class="air-sys-list-name">' + item.name + '</span>' +
          '<span class="air-sys-list-desc">' + item.desc + '</span>' +
          '</li>';
      }).join('');

      listEl.querySelectorAll('.air-sys-list-item').forEach(function (li, i) {
        var item = items[i];
        li.addEventListener('mouseenter', function () { setActive(item.id, true); });
        li.addEventListener('mouseleave', function () { setActive(item.id, false); });
      });
    }

    modeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        modeButtons.forEach(function (b) { b.classList.toggle('active', b === btn); });
        render(btn.getAttribute('data-mode'));
      });
    });

    render('internal');
  }

  window.TM.registerTool('air-system', { mount: mount });
})();
