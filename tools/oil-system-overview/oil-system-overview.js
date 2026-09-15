(function () {
  var DESC = {
    oilTank: ['Oil Tank', 'Stores the reserve of oil for the system. Usually mounted on the engine, it must allow full draining and replenishing, and carries a sight glass or dipstick so the oil level can be checked manually.'],
    supplyPump: ['Supply (Pressure) Pump', 'Draws oil from the tank and pressurizes it for delivery to the bearings and gearbox. Usually a gear-type pump built into the same assembly as the scavenge pump, sized for the flow needed at maximum engine speed. Its drive shaft has no shear neck, so it keeps supplying oil even if damaged.'],
    scavengePump: ['Scavenge Pump', 'Draws used oil back out of the bearing chambers and gearbox and returns it toward the tank. Scavenge capacity is larger than supply capacity, since the returning oil has expanded with heat and entrained air.'],
    reliefValve: ['Oil Pressure Relief Valve', 'A spring-loaded valve that limits feed-line pressure to a set design value. When pressure exceeds that value, it opens and routes the excess oil back to the tank or to the pump inlet, keeping delivery pressure consistent across engine speeds.'],
    mainFilter: ['Main Oil Filter', 'A fine pressure filter fitted at the pump outlet. It catches particles before they can block the oil feed jets, and often carries a pop-up indicator that gives a visual warning if it starts to block.'],
    fohe: ['FOHE — Fuel/Oil Heat Exchanger', 'Routes hot oil across a matrix of tubes carrying fuel. Heat passes from the oil into the fuel, which cools the oil and pre-warms the fuel before it reaches the combustor.'],
    lastChance: ['Last-Chance Filter', 'A fine thread-type strainer fitted immediately upstream of the oil jets — the final safeguard against any particle reaching a bearing or gear mesh.'],
    mcd: ['Magnetic Chip Detector', 'A permanent magnet sitting in the scavenge flow that collects ferrous wear debris from the chamber it serves. Inspecting it can reveal an impending bearing or spline failure without pulling a filter.'],
    electricMcd: ['Electric Magnetic Chip Detector', 'Continuously monitors the combined scavenge flow for ferrous debris and can trigger a cockpit warning immediately, rather than waiting for a manual inspection between flights.'],
    oilTempProbe: ['Oil Temperature Probe', 'Measures the temperature of oil returning to the tank. A high oil temperature reading is treated as a cause for engine shutdown, so this sensor feeds the cockpit warning system.'],
    breather: ['Centrifugal Breather (Deoiler)', 'Spins the air drawn from the bearing chambers and gearbox to fling out the entrained oil mist. Recovered oil rejoins the system while the cleaned air is vented overboard.'],
    gearbox: ['Gear Box', 'Accessory / reduction gearbox. Its gears and splines run under high torque and need continuous lubrication and cooling.'],
  };
  function bearingDesc(name, note) {
    return [name, 'Supports ' + note + '. Oil is jetted onto the bearing to lubricate and cool it under high rotational speed and load, then drains to the scavenge system.'];
  }

  var SPOOLS = {
    single: { label: 'Single Spool', columns: [
      { id: 'gearbox', label: 'Gear\nBox', desc: DESC.gearbox },
      { id: 'compb', label: 'Comp\nBearing', desc: bearingDesc('Compressor Bearing', 'the single compressor shaft') },
      { id: 'turbb', label: 'Turb\nBearing', desc: bearingDesc('Turbine Bearing', 'the single turbine shaft, the hottest bearing location in the engine') },
    ] },
    twin: { label: 'Twin Spool', columns: [
      { id: 'gearbox', label: 'Gear\nBox', desc: DESC.gearbox },
      { id: 'lpc', label: 'LPC\nBearing', desc: bearingDesc('LPC Bearing', 'the Low Pressure Compressor shaft') },
      { id: 'hpc', label: 'HPC\nBearing', desc: bearingDesc('HPC Bearing', 'the High Pressure Compressor shaft') },
      { id: 'hpt', label: 'HPT\nBearing', desc: bearingDesc('HPT Bearing', 'the High Pressure Turbine shaft, running close to the hot section') },
      { id: 'lpt', label: 'LPT\nBearing', desc: bearingDesc('LPT Bearing', 'the Low Pressure Turbine shaft') },
    ] },
    triple: { label: 'Triple Spool', columns: [
      { id: 'gearbox', label: 'Gear\nBox', desc: DESC.gearbox },
      { id: 'lpc', label: 'LPC\nBearing', desc: bearingDesc('LPC Bearing', 'the Low Pressure Compressor shaft') },
      { id: 'ipc', label: 'IPC\nBearing', desc: bearingDesc('IPC Bearing', 'the Intermediate Pressure Compressor shaft') },
      { id: 'hpc', label: 'HPC\nBearing', desc: bearingDesc('HPC Bearing', 'the High Pressure Compressor shaft') },
      { id: 'hpt', label: 'HPT\nBearing', desc: bearingDesc('HPT Bearing', 'the High Pressure Turbine shaft, the hottest bearing location in the engine') },
      { id: 'ipt', label: 'IPT\nBearing', desc: bearingDesc('IPT Bearing', 'the Intermediate Pressure Turbine shaft') },
      { id: 'lpt', label: 'LPT\nBearing', desc: bearingDesc('LPT Bearing', 'the Low Pressure Turbine shaft') },
    ] },
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function multiline(label, cx, cyMid, cls) {
    var lines = label.split('\n');
    var lh = 14;
    var startY = cyMid - ((lines.length - 1) * lh) / 2 + 4;
    return lines.map(function (ln, i) {
      return '<text class="' + cls + '" x="' + cx + '" y="' + (startY + i * lh) + '">' + esc(ln) + '</text>';
    }).join('');
  }
  function box(id, x, y, w, h, label, desc, opts) {
    opts = opts || {};
    var cx = x + w / 2, cy = y + h / 2;
    var cls = 'comp-box' + (opts.filter ? ' filter' : '');
    var lblCls = 'comp-label' + (opts.small ? ' small' : '');
    return '<g class="comp" data-title="' + esc(desc[0]) + '" data-desc="' + esc(desc[1]) + '">' +
      '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (opts.rx != null ? opts.rx : 4) + '"></rect>' +
      multiline(label, cx, cy, lblCls) +
      '</g>';
  }
  function line(cls, extra, d) {
    return '<path class="flow-line ' + cls + ' flow-anim" d="' + d + '" stroke-width="' + (extra.w || 3) + '" marker-end="url(#oil-arrow-' + cls + ')"></path>';
  }

  function buildDiagram(spoolKey) {
    var spool = SPOOLS[spoolKey];
    var cols = spool.columns;
    var N = cols.length;

    var spineX = 245;
    var leftX = spineX, rightX = 1500;
    var gap = N > 1 ? (rightX - leftX) / (N - 1) : 0;
    var colX = cols.map(function (c, i) { return N > 1 ? leftX + i * gap : (leftX + rightX) / 2; });

    var out = '';

    var tankW = 180, tankX = spineX - tankW / 2, tankY = 28, tankH = 62;
    out += box('oilTank', tankX, tankY, tankW, tankH, 'OIL TANK', DESC.oilTank);

    var otpX = tankX + tankW + 20, otpY = 28, otpW = 140, otpH = 62;
    out += box('otp', otpX, otpY, otpW, otpH, 'OIL TEMP\nPROBE', DESC.oilTempProbe, { small: true });

    var emcdX = otpX + otpW + 20, emcdY = 28, emcdW = 150, emcdH = 62;
    out += box('emcd', emcdX, emcdY, emcdW, emcdH, 'ELECTRIC\nMCD', DESC.electricMcd, { small: true });

    var rowMidY = tankY + tankH / 2;
    out += line('scavenge', { w: 2.6 }, 'M ' + emcdX + ' ' + rowMidY + ' L ' + (otpX + otpW) + ' ' + rowMidY);
    out += line('scavenge', { w: 2.6 }, 'M ' + otpX + ' ' + rowMidY + ' L ' + (tankX + tankW + 4) + ' ' + rowMidY);

    var pumpY = 150, pumpH = 66;
    var supplyPumpX = spineX - 90, supplyPumpW = 180;
    var scavPumpX = supplyPumpX + supplyPumpW, scavPumpW = 190;
    out += box('pumpS', supplyPumpX, pumpY, supplyPumpW, pumpH, 'SUPPLY\nPUMP', DESC.supplyPump, { small: true });
    out += box('pumpV', scavPumpX, pumpY, scavPumpW, pumpH, 'SCAVENGE\nPUMP', DESC.scavengePump, { small: true });

    var relief_x = spineX - 75;
    out += box('relief', relief_x, 258, 150, 54, 'OIL PRESSURE\nRELIEF VALVE', DESC.reliefValve, { small: true });
    out += box('mfilter', relief_x, 344, 150, 46, 'MAIN OIL\nFILTER', DESC.mainFilter, { small: true, filter: true });
    out += box('fohe', relief_x, 422, 150, 46, 'FOHE', DESC.fohe);

    out += line('supply', { w: 3 }, 'M ' + spineX + ' ' + (tankY + tankH + 4) + ' L ' + spineX + ' ' + pumpY);
    out += line('supply', { w: 3 }, 'M ' + spineX + ' ' + (pumpY + pumpH) + ' L ' + spineX + ' 258');
    out += line('supply', { w: 3 }, 'M ' + spineX + ' 312 L ' + spineX + ' 344');
    out += line('supply', { w: 3 }, 'M ' + spineX + ' 390 L ' + spineX + ' 422');

    out += line('supply', { w: 2 }, 'M ' + relief_x + ' 285 L ' + (relief_x - 75) + ' 285 L ' + (relief_x - 75) + ' 183 L ' + (supplyPumpX - 4) + ' 183');

    var scavPumpCX = scavPumpX + scavPumpW / 2;
    var emcdCX = emcdX + emcdW / 2;
    var jogY = emcdY + emcdH + 20;
    out += line('scavenge', { w: 3 }, 'M ' + scavPumpCX + ' ' + (pumpY - 4) + ' L ' + scavPumpCX + ' ' + jogY + ' L ' + emcdCX + ' ' + jogY + ' L ' + emcdCX + ' ' + (emcdY + emcdH + 4));

    var branchY = 490;
    out += '<path class="flow-line supply flow-anim" d="M ' + spineX + ' 468 L ' + spineX + ' ' + branchY + ' L ' + colX[N - 1] + ' ' + branchY + '" stroke-width="3" fill="none" marker-end="url(#oil-arrow-supply)"></path>';

    var lcfY = 512, lcfH = 26, lcfW = 78;
    var brY = 552, brH = 92, brW = 112;
    var mcdY = 660, mcdH = 34, mcdW = 76;

    cols.forEach(function (col, i) {
      var cx = colX[i];
      out += line('supply', { w: 2.4 }, 'M ' + cx + ' ' + branchY + ' L ' + cx + ' ' + lcfY);
      out += box('lcf' + i, cx - lcfW / 2, lcfY, lcfW, lcfH, 'Last\nChance', DESC.lastChance, { small: true, filter: true, rx: 2 });
      out += line('supply', { w: 2.4 }, 'M ' + cx + ' ' + (lcfY + lcfH) + ' L ' + cx + ' ' + brY);
      out += box('br' + i, cx - brW / 2, brY, brW, brH, col.label, col.desc, { small: true });
      out += line('scavenge', { w: 2.4 }, 'M ' + cx + ' ' + (brY + brH) + ' L ' + cx + ' ' + mcdY);
      out += box('mcd' + i, cx - mcdW / 2, mcdY, mcdW, mcdH, 'MCD', DESC.mcd, { small: true });
    });

    var scavTrunkY = 726, retTrunkY = 742;
    cols.forEach(function (col, i) {
      var cx = colX[i];
      out += line('scavenge', { w: 2 }, 'M ' + cx + ' ' + (mcdY + mcdH) + ' L ' + cx + ' ' + scavTrunkY);
      out += line('return', { w: 2 }, 'M ' + cx + ' ' + (mcdY + mcdH + 6) + ' L ' + cx + ' ' + retTrunkY);
    });
    out += '<path class="flow-line scavenge flow-anim" d="M ' + colX[0] + ' ' + scavTrunkY + ' L ' + colX[N - 1] + ' ' + scavTrunkY + '" stroke-width="2.4" fill="none"></path>';
    out += '<path class="flow-line return flow-anim" d="M ' + colX[0] + ' ' + retTrunkY + ' L ' + colX[N - 1] + ' ' + retTrunkY + '" stroke-width="2.4" fill="none"></path>';

    var avgX = (colX[0] + colX[N - 1]) / 2;

    var scavRiserX = rightX + 100;
    out += line('scavenge', { w: 3 }, 'M ' + colX[N - 1] + ' ' + scavTrunkY + ' L ' + scavRiserX + ' ' + scavTrunkY + ' L ' + scavRiserX + ' 183 L ' + (scavPumpX + scavPumpW + 4) + ' 183');

    var breatherW = 170, breatherH = 58, breatherX = avgX - breatherW / 2, breatherY = 800;
    out += line('return', { w: 3 }, 'M ' + avgX + ' ' + retTrunkY + ' L ' + avgX + ' ' + breatherY);
    out += box('breather', breatherX, breatherY, breatherW, breatherH, 'CENTRIFUGAL\nBREATHER', DESC.breather, { small: true });

    var retRiserX = rightX + 170;
    out += line('return', { w: 3 }, 'M ' + (breatherX + breatherW) + ' ' + (breatherY + breatherH / 2) + ' L ' + retRiserX + ' ' + (breatherY + breatherH / 2) + ' L ' + retRiserX + ' 8 L ' + (spineX + 45) + ' 8 L ' + (spineX + 45) + ' ' + (tankY - 4));

    var airLineY = breatherY + breatherH / 2 - 16;
    var airLabelY = breatherY + breatherH / 2 + 6;
    out += '<path class="static-line" d="M ' + breatherX + ' ' + airLineY + ' L ' + (breatherX - 100) + ' ' + airLineY + '" marker-end="url(#oil-arrow-air)"></path>';
    out += '<text class="static-label" x="' + (breatherX - 190) + '" y="' + airLabelY + '">AIR (vent overboard)</text>';

    out += '<text class="group-title" x="' + (relief_x + 150 + 30) + '" y="445">BEARING / GEARBOX COMPARTMENTS — ' + spool.label.toUpperCase() + '</text>';

    return out;
  }

  function mount(container) {
    container.innerHTML =
      '<div class="oil-diagram">' +
      '<header>' +
      '<div>' +
      '<span class="tag">REF: THE JET ENGINE — ROLLS ROYCE</span>' +
      '<h1>Turbofan Engine Oil System — Full Flow Dry Sump</h1>' +
      '<p>Toggle spool configuration and oil circuits. Hover any component for its function.</p>' +
      '</div>' +
      '</header>' +

      '<div class="controls">' +
      '<div class="control-group">' +
      '<span class="glabel">SPOOL CONFIG</span>' +
      '<button type="button" class="spool-btn active" data-spool="single">Single Spool</button>' +
      '<button type="button" class="spool-btn" data-spool="twin">Twin Spool</button>' +
      '<button type="button" class="spool-btn" data-spool="triple">Triple Spool</button>' +
      '</div>' +
      '<div class="control-group">' +
      '<span class="glabel">OIL CIRCUITS</span>' +
      '<label class="line-toggle legend-supply" data-line="supply">' +
      '<input type="checkbox" checked><span class="swatch"></span>Supply</label>' +
      '<label class="line-toggle legend-scavenge" data-line="scavenge">' +
      '<input type="checkbox" checked><span class="swatch"></span>Scavenge</label>' +
      '<label class="line-toggle legend-return" data-line="return">' +
      '<input type="checkbox" checked><span class="swatch"></span>Return (Deoiler)</label>' +
      '</div>' +
      '</div>' +

      '<div class="stage-wrap">' +
      '<svg class="oil-svg" viewBox="0 0 1780 1000" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<pattern id="oil-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<rect width="6" height="6" fill="#173350"></rect>' +
      '<line x1="0" y1="0" x2="0" y2="6" stroke="#5aa9d6" stroke-width="1.4"></line>' +
      '</pattern>' +
      '<marker id="oil-arrow-supply" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="var(--supply)"></path></marker>' +
      '<marker id="oil-arrow-scavenge" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="var(--scavenge)"></path></marker>' +
      '<marker id="oil-arrow-return" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="var(--return)"></path></marker>' +
      '<marker id="oil-arrow-air" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">' +
      '<path d="M0,0 L6,3 L0,6 Z" fill="var(--air)"></path></marker>' +
      '</defs>' +
      '<g class="diagram-root"></g>' +
      '</svg>' +
      '</div>' +
      '<footer>Diagram generated from lubrication system training notes. Educational schematic, not to scale.</footer>' +
      '<div class="tooltip"><span class="t-title"></span><span class="t-desc"></span></div>' +
      '</div>';

    var wrap = container.querySelector('.oil-diagram');
    var diagramRoot = wrap.querySelector('.diagram-root');
    var svgEl = wrap.querySelector('.oil-svg');
    var tooltip = wrap.querySelector('.tooltip');
    var tTitle = tooltip.querySelector('.t-title');
    var tDesc = tooltip.querySelector('.t-desc');

    var currentSpool = 'single';
    var lineState = { supply: true, scavenge: true, return: true };

    function render() {
      diagramRoot.innerHTML = buildDiagram(currentSpool);
      applyLineVisibility();
    }
    function applyLineVisibility() {
      Object.keys(lineState).forEach(function (k) {
        wrap.querySelectorAll('.flow-line.' + k).forEach(function (el) {
          el.classList.toggle('hidden', !lineState[k]);
        });
      });
    }

    wrap.querySelectorAll('.spool-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        wrap.querySelectorAll('.spool-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        currentSpool = btn.dataset.spool;
        render();
      });
    });

    wrap.querySelectorAll('.line-toggle').forEach(function (label) {
      var input = label.querySelector('input');
      input.addEventListener('change', function () {
        var key = label.dataset.line;
        lineState[key] = input.checked;
        label.classList.toggle('dimmed', !input.checked);
        applyLineVisibility();
      });
    });

    svgEl.addEventListener('mouseover', function (e) {
      var g = e.target.closest('.comp');
      if (!g) return;
      tTitle.textContent = g.dataset.title;
      tDesc.textContent = g.dataset.desc;
      tooltip.style.display = 'block';
    });
    svgEl.addEventListener('mousemove', function (e) {
      if (tooltip.style.display !== 'block') return;
      var x = e.clientX + 16, y = e.clientY + 16;
      var vw = window.innerWidth, vh = window.innerHeight;
      if (x + 290 > vw) x = e.clientX - 296;
      if (y + 120 > vh) y = e.clientY - 130;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    });
    svgEl.addEventListener('mouseout', function (e) {
      var g = e.target.closest('.comp');
      if (!g) return;
      tooltip.style.display = 'none';
    });

    render();
  }

  window.TM.registerTool('oil-system-overview', { mount: mount });
})();
