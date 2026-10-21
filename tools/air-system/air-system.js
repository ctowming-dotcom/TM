(function () {
  // Content sourced from the supplied deck: Chapter_11_Air_System_v1_2hr.pptx
  var FUNCTIONS = {
    internal: [
      { id: 'thrust-bearing', x: 280, y: 230, name: 'Thrust Bearing Load Relief', desc: 'Air pressure is used to offset part of the axial load on the main thrust bearing, reducing the load it must carry.' },
      { id: 'labyrinth-seal', x: 430, y: 230, name: 'Sealing of Main Bearing Compartments (Labyrinth Seal)', desc: 'Labyrinth seals use a pressurized air barrier to keep oil inside the bearing compartments and hot gas or debris out.' },
      { id: 'combustor-liner', x: 540, y: 130, name: 'Cooling of Combustion Chamber (Combustion Liner)', desc: 'Air passes through and around the combustor liner to keep its walls within temperature limits while the fuel-air mixture burns inside.' },
      { id: 'ngv-cooling', x: 680, y: 150, name: 'Cooling of Nozzle Guide Vanes', desc: 'NGVs direct combustion gas onto the turbine rotor and sit directly in the hottest gas path, so they are cooled with air bled from the compressor.' },
      { id: 'turbine-blade', x: 740, y: 150, name: 'Cooling of Turbine Blades', desc: 'Cooling air is fed through the turbine blades to keep metal temperatures within limits despite the extremely hot combustion gases flowing over them.' },
      { id: 'turbine-disc', x: 800, y: 210, name: 'Cooling of Turbine Discs', desc: 'Cooling air is directed onto the turbine disc faces to limit disc temperature and the thermal stresses that would otherwise shorten its fatigue life.' },
    ],
    external: [
      { id: 'anti-icing', x: 70, y: 160, name: 'Engine Anti-Icing System (Hot Air)', desc: 'Hot air from the compressor is delivered to the inlet guide vanes and intake strut to prevent ice forming and disrupting airflow into the intake.' },
      { id: 'eec-cooling', x: 150, y: 105, name: 'EEC Cooling', desc: 'The Electronic Engine Control is mounted in the fan case; on some engines it is cooled by ram air.' },
      { id: 'customer-bleed', x: 350, y: 105, name: 'Customer Bleed', desc: 'Pressurized air taken from the compressor for airframe use — air-conditioning and cabin/reservoir pressurization. It is bled as early as possible in the compressor to minimize the effect on engine performance; during descent, with the engine at idle, HP bleed is needed to meet pressurization demand. A precooler regulates its temperature before it reaches the aircraft systems.' },
      { id: 'generator-cooling', x: 280, y: 305, name: 'Electrical Generator Cooling', desc: 'The integrated drive generators, driven by the external gearbox off the HP shaft, are cooled with fan air.' },
      { id: 'igniter-cooling', x: 560, y: 300, name: 'Igniter Lead & Igniter Box Cooling', desc: 'The exciter (igniter) box steps low voltage up to around 22 kV; fan air cools both the box and the high-tension leads carrying that voltage.' },
      { id: 'tcc-acc', x: 790, y: 105, name: 'Turbine Case Cooling / Active Clearance Control', desc: 'A dual-channel, EEC-controlled system plays fan air onto the HP and LP turbine cases to shrink them, tightening blade-tip clearance for better efficiency and longer service life. The EEC positions the actuator (using fuel muscle pressure) as a function of altitude and N2 speed.' },
      { id: 'nacelle-vent', x: 980, y: 300, name: 'Nacelle Ventilation and Cooling', desc: 'The space between the engine cowling and casing (the nacelle) is ventilated with fan air to prevent fluid vapor from accumulating and self-igniting.' },
    ],
  };

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
      '<svg class="air-sys-engine" viewBox="0 0 1260 420" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="air-metal-grad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" class="air-metal-1"></stop>' +
      '<stop offset="18%" class="air-metal-2"></stop>' +
      '<stop offset="50%" class="air-metal-3"></stop>' +
      '<stop offset="82%" class="air-metal-2"></stop>' +
      '<stop offset="100%" class="air-metal-1"></stop>' +
      '</linearGradient>' +
      '<linearGradient id="air-can-grad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" class="air-can-1"></stop>' +
      '<stop offset="50%" class="air-can-2"></stop>' +
      '<stop offset="100%" class="air-can-1"></stop>' +
      '</linearGradient>' +
      '</defs>' +

      '<path class="air-sys-casing" d="M20,130 L60,120 L220,120 Q430,120 430,155 Q460,155 460,112 L650,112 Q685,112 685,158 L860,158 Q1000,158 1000,175 Q1150,175 1150,185 L1150,235 Q1000,235 1000,245 Q860,245 860,262 L685,262 Q650,262 650,308 L460,308 Q430,308 430,265 Q220,265 220,300 L60,300 L20,290 Z"></path>' +
      '<line class="air-sys-divider" x1="220" y1="95" x2="220" y2="325"></line>' +
      '<line class="air-sys-divider" x1="430" y1="95" x2="430" y2="325"></line>' +
      '<line class="air-sys-divider" x1="650" y1="95" x2="650" y2="325"></line>' +
      '<line class="air-sys-divider" x1="860" y1="95" x2="860" y2="325"></line>' +

      '<rect class="air-sys-shaft" x="235" y="196" width="615" height="28"></rect>' +
      '<rect class="air-sys-combustor" x="445" y="128" width="190" height="164" rx="24"></rect>' +

      '<text class="air-sys-zone-label" x="120" y="350">Inlet</text>' +
      '<text class="air-sys-zone-label" x="325" y="350">Compressor</text>' +
      '<text class="air-sys-zone-label" x="540" y="350">Combustor</text>' +
      '<text class="air-sys-zone-label" x="755" y="350">Turbine</text>' +
      '<text class="air-sys-zone-label" x="1010" y="350">Exhaust</text>' +

      '<g class="air-sys-markers"></g>' +
      '</svg>' +
      '</div>' +

      '<ul class="air-sys-list"></ul>' +
      '</div>' +

      '<div class="air-sys-tooltip"><span class="t-title"></span><span class="t-desc"></span></div>' +
      '</div>';

    var root = container.querySelector('.air-sys');
    var markerGroup = root.querySelector('.air-sys-markers');
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
      var items = FUNCTIONS[mode];

      markerGroup.innerHTML = items.map(function (item) {
        return '<g class="air-sys-marker" data-marker="' + item.id + '">' +
          '<circle class="air-sys-marker-ring" cx="' + item.x + '" cy="' + item.y + '" r="13"></circle>' +
          '<circle class="air-sys-marker-dot" cx="' + item.x + '" cy="' + item.y + '" r="6"></circle>' +
          '</g>';
      }).join('');

      markerGroup.querySelectorAll('.air-sys-marker').forEach(function (el, i) {
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

      root.className = 'air-sys air-sys-mode-' + mode;
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
