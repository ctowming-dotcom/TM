(function () {
  // Real run data (ascending throttle sweep), extracted from the supplied
  // Engine_Run_Sample_Result.xlsx. Column mapping verified against the
  // supplied lab answer key's worked peak-RPM figures:
  //   P1/T1 = Comp Inlet Press/Temp, P2/T2 = Comp Exit Press/Temp,
  //   P3/T3 = Turb Inlet Press/Temp, P4 = Nozzle Exit Press, T4 = EGT.
  // Units as logged: pressure PSIG, temperature degC, fuel flow Gal/hr,
  // thrust lbf (clamped to 0 at idle — small negative tare noise in the
  // source log). RPM is the independent variable the throttle drives.
  var ANCHORS = [
    { rpm: 6815, fuelFlow: 0.02, thrust: 0, p1: 0.0033, p2: 0.239, p3: 0.471, p4: 0.097, t1: 27.5, t2: 27.0, t3: 29.9, t4: 29.5 },
    { rpm: 9523, fuelFlow: 1.05, thrust: 0, p1: 0.0054, p2: 0.325, p3: 0.566, p4: 0.106, t1: 27.4, t2: 26.5, t3: 29.4, t4: 29.2 },
    { rpm: 12188, fuelFlow: 4.37, thrust: 0, p1: 0.0097, p2: 0.624, p3: 0.871, p4: 0.131, t1: 27.4, t2: 25.8, t3: 148.8, t4: 38.4 },
    { rpm: 18424, fuelFlow: 2.43, thrust: 0, p1: 0.0275, p2: 1.287, p3: 1.549, p4: 0.197, t1: 27.5, t2: 24.1, t3: 467.1, t4: 74.9 },
    { rpm: 28044, fuelFlow: 2.23, thrust: 0, p1: 0.0667, p2: 2.920, p3: 3.240, p4: 0.367, t1: 27.8, t2: 22.6, t3: 649.0, t4: 158.4 },
    { rpm: 39797, fuelFlow: 2.24, thrust: 0, p1: 0.0689, p2: 5.230, p3: 5.534, p4: 0.408, t1: 27.4, t2: 65.6, t3: 606.5, t4: 376.3 },
    { rpm: 41683, fuelFlow: 2.24, thrust: 0.39, p1: 0.0777, p2: 5.772, p3: 6.093, p4: 0.440, t1: 27.4, t2: 76.7, t3: 606.5, t4: 407.0 },
    { rpm: 42675, fuelFlow: 2.37, thrust: 0.83, p1: 0.0807, p2: 6.125, p3: 6.465, p4: 0.457, t1: 27.3, t2: 79.6, t3: 602.7, t4: 413.6 },
    { rpm: 45256, fuelFlow: 2.61, thrust: 1.08, p1: 0.0915, p2: 7.008, p3: 7.387, p4: 0.509, t1: 27.3, t2: 82.5, t3: 606.6, t4: 419.9 },
    { rpm: 47855, fuelFlow: 2.74, thrust: 1.96, p1: 0.1060, p2: 8.028, p3: 8.449, p4: 0.574, t1: 27.3, t2: 85.7, t3: 608.9, t4: 425.5 },
    { rpm: 50943, fuelFlow: 2.91, thrust: 2.66, p1: 0.1213, p2: 9.225, p3: 9.655, p4: 0.651, t1: 27.3, t2: 89.3, t3: 604.2, t4: 429.5 },
    { rpm: 53579, fuelFlow: 3.10, thrust: 3.22, p1: 0.1391, p2: 10.429, p3: 10.846, p4: 0.715, t1: 27.3, t2: 97.0, t3: 582.3, t4: 431.9 },
    { rpm: 55571, fuelFlow: 3.22, thrust: 3.79, p1: 0.1546, p2: 11.265, p3: 11.709, p4: 0.766, t1: 27.4, t2: 104.0, t3: 573.9, t4: 431.2 },
    { rpm: 57199, fuelFlow: 3.39, thrust: 4.54, p1: 0.1657, p2: 12.116, p3: 12.589, p4: 0.822, t1: 27.6, t2: 110.9, t3: 573.1, t4: 429.6 },
    { rpm: 59308, fuelFlow: 3.58, thrust: 5.35, p1: 0.1759, p2: 13.281, p3: 13.799, p4: 0.892, t1: 27.8, t2: 117.5, t3: 574.4, t4: 429.2 },
    { rpm: 60929, fuelFlow: 3.70, thrust: 5.73, p1: 0.1897, p2: 14.167, p3: 14.750, p4: 0.956, t1: 27.9, t2: 123.9, t3: 576.9, t4: 429.2 },
    { rpm: 62149, fuelFlow: 3.84, thrust: 6.35, p1: 0.2023, p2: 14.990, p3: 15.597, p4: 1.015, t1: 27.8, t2: 127.2, t3: 581.8, t4: 429.4 },
    { rpm: 65923, fuelFlow: 4.10, thrust: 7.80, p1: 0.2347, p2: 17.392, p3: 18.059, p4: 1.189, t1: 27.7, t2: 134.9, t3: 590.1, t4: 430.5 },
    { rpm: 66610, fuelFlow: 4.25, thrust: 8.38, p1: 0.2421, p2: 17.991, p3: 18.712, p4: 1.248, t1: 27.6, t2: 138.9, t3: 591.7, t4: 430.2 },
    { rpm: 70827, fuelFlow: 4.64, thrust: 10.76, p1: 0.2825, p2: 21.233, p3: 22.138, p4: 1.498, t1: 27.6, t2: 143.7, t3: 607.6, t4: 431.5 },
    { rpm: 74376, fuelFlow: 4.85, thrust: 12.90, p1: 0.3268, p2: 24.174, p3: 25.152, p4: 1.714, t1: 27.6, t2: 150.3, t3: 628.0, t4: 433.8 },
    { rpm: 77178, fuelFlow: 4.93, thrust: 14.04, p1: 0.3612, p2: 26.467, p3: 27.445, p4: 1.813, t1: 27.8, t2: 166.3, t3: 654.3, t4: 438.9 },
  ];
  var MIN_RPM = ANCHORS[0].rpm;
  var MAX_RPM = ANCHORS[ANCHORS.length - 1].rpm;

  // Mode 1 = as logged (PSIG, degC, Gal/hr, lbf). Mode 2 = SI (Pa, K, L/hr, N & kgf).
  var PSI_TO_PA = 6894.757293168;
  var GAL_TO_L = 3.785411784;
  var LBF_TO_N = 4.4482216153;
  var N_TO_KGF = 1 / 9.80665;

  function fmtPressure(psig, mode) {
    return mode === 2 ? Math.round(psig * PSI_TO_PA).toLocaleString() + ' Pa' : psig.toFixed(3) + ' PSIG';
  }
  function fmtTemp(degC, mode) {
    return mode === 2 ? (degC + 273.15).toFixed(1) + ' K' : degC.toFixed(1) + ' °C';
  }
  function fmtFuel(galHr, mode) {
    return mode === 2 ? (galHr * GAL_TO_L).toFixed(2) + ' L/hr' : galHr.toFixed(2) + ' Gal/hr';
  }
  function fmtThrust(lbf, mode) {
    if (mode === 2) {
      var n = lbf * LBF_TO_N;
      return n.toFixed(1) + ' N · ' + (n * N_TO_KGF).toFixed(2) + ' kgf';
    }
    return lbf.toFixed(1) + ' lbf';
  }

  var DESC = {
    inlet: ['Air Intake (Inlet Section)', 'To capture and smoothly deliver air to the compressor with minimum energy loss.'],
    compressor: ['Compressor Section', 'To increase the pressure of the incoming air before it enters the combustion chamber.'],
    combustor: ['Combustion Chamber (Combustor)', 'To burn the fuel–air mixture efficiently and release high-temperature, high-energy gas.'],
    turbine: ['Turbine Section', 'To extract energy from the high-temperature, high-pressure gases leaving the combustor.'],
    exhaust: ['Exhaust (Nozzle Section)', 'To convert the remaining gas energy into high-speed jet thrust.'],
    cpr: ['Compressor Pressure Ratio (CPR)', 'CPR = P2 ÷ P1, the ratio of compressor outlet pressure to inlet pressure. A higher CPR improves combustion efficiency, increases thrust output, reduces fuel consumption, and is a useful indicator of compressor health — keeping it in range also helps avoid compressor surge or stall.'],
  };

  function interp(rpm, key) {
    if (rpm <= ANCHORS[0].rpm) return ANCHORS[0][key];
    var last = ANCHORS[ANCHORS.length - 1];
    if (rpm >= last.rpm) return last[key];
    for (var i = 0; i < ANCHORS.length - 1; i++) {
      var a = ANCHORS[i], b = ANCHORS[i + 1];
      if (rpm >= a.rpm && rpm <= b.rpm) {
        var t = (rpm - a.rpm) / (b.rpm - a.rpm);
        return a[key] + (b[key] - a[key]) * t;
      }
    }
    return last[key];
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // Compressor wall converges from the inlet (y=120) to the combustor (y=155);
  // turbine wall holds roughly level between the combustor and nozzle necks.
  function compressorWallY(x) { return lerp(120, 155, (x - 220) / (430 - 220)); }
  var TURBINE_WALL_Y = 158;
  var SHAFT_TOP = 196, SHAFT_BOTTOM = 224;

  // One blade cross-section, top half + its mirror below the shaft. Rotor
  // blades (attached to the shaft) get the animated diagonal-stripe fill
  // that reads as spin in a side profile; stator vanes (attached to the
  // casing) are fixed, plain gray.
  function bladeRow(x, wallTopY, isRotor, hot) {
    var cls = isRotor ? ('vlab-blade-rotor ' + (hot ? 'vlab-blade-rotor-hot' : 'vlab-blade-rotor-cool')) : 'vlab-blade-stator';
    var topOuter = wallTopY + 4, botOuter = 420 - wallTopY - 4;
    var top = '<path class="' + cls + '" d="M' + x + ',' + topOuter + ' L' + (x + 16) + ',' + topOuter + ' L' + (x + 9) + ',' + SHAFT_TOP + ' L' + (x - 3) + ',' + SHAFT_TOP + ' Z"></path>';
    var bot = '<path class="' + cls + '" d="M' + x + ',' + botOuter + ' L' + (x + 16) + ',' + botOuter + ' L' + (x + 9) + ',' + SHAFT_BOTTOM + ' L' + (x - 3) + ',' + SHAFT_BOTTOM + ' Z"></path>';
    return top + bot;
  }

  function buildCompressorRows() {
    var xs = [250, 290, 330, 370, 410];
    var out = '';
    xs.forEach(function (x, i) { out += bladeRow(x, compressorWallY(x), i % 2 === 0, false); });
    return out;
  }
  function buildTurbineRows() {
    var xs = [700, 760, 820];
    var out = '';
    xs.forEach(function (x, i) { out += bladeRow(x, TURBINE_WALL_Y, i % 2 === 1, true); });
    return out;
  }

  function mount(container) {
    container.innerHTML =
      '<div class="vlab">' +
      '<div class="vlab-header">' +
      '<h1>Virtual Lab on Engine Practical</h1>' +
      '<p>Push the throttle to increase engine RPM, and watch pressure, temperature, fuel flow and thrust respond across the engine in real time.</p>' +
      '</div>' +

      '<div class="vlab-stage">' +
      '<svg class="vlab-engine" viewBox="0 0 1260 420" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="vlab-jet-grad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0%" stop-color="#ff7a3d" stop-opacity="0.95"></stop>' +
      '<stop offset="100%" stop-color="#ff7a3d" stop-opacity="0"></stop>' +
      '</linearGradient>' +
      '<radialGradient id="vlab-flame-grad" cx="35%" cy="50%" r="65%">' +
      '<stop offset="0%" stop-color="#fff3b0"></stop>' +
      '<stop offset="45%" stop-color="#ff9a3d"></stop>' +
      '<stop offset="100%" stop-color="#d1392b"></stop>' +
      '</radialGradient>' +
      '<pattern id="vlab-spin-cool" class="vlab-spin-pattern-cool" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="14" height="14" fill="#5a8fc2"></rect>' +
      '<rect width="7" height="14" fill="#3d6690"></rect>' +
      '</pattern>' +
      '<pattern id="vlab-spin-hot" class="vlab-spin-pattern-hot" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
      '<rect width="14" height="14" fill="#e0725a"></rect>' +
      '<rect width="7" height="14" fill="#b5473b"></rect>' +
      '</pattern>' +
      '</defs>' +

      '<path class="vlab-casing" d="M20,130 L60,120 L220,120 L430,155 L460,112 L650,112 L685,158 L860,158 L1000,175 L1150,185 L1150,235 L1000,245 L860,262 L685,262 L650,308 L460,308 L430,265 L220,300 L60,300 L20,290 Z"></path>' +
      '<line class="vlab-divider" x1="220" y1="95" x2="220" y2="325"></line>' +
      '<line class="vlab-divider" x1="430" y1="95" x2="430" y2="325"></line>' +
      '<line class="vlab-divider" x1="650" y1="95" x2="650" y2="325"></line>' +
      '<line class="vlab-divider" x1="860" y1="95" x2="860" y2="325"></line>' +

      '<g class="vlab-flow"></g>' +

      '<rect class="vlab-shaft vlab-spin-shaft" x="235" y="' + SHAFT_TOP + '" width="615" height="' + (SHAFT_BOTTOM - SHAFT_TOP) + '"></rect>' +
      '<path class="vlab-spinner vlab-spin-shaft" d="M215,196 L240,210 L215,224 Z"></path>' +

      buildCompressorRows() +

      '<rect class="vlab-combustor-liner" x="445" y="128" width="190" height="164" rx="24"></rect>' +
      '<g class="vlab-combustor-intensity" transform="translate(540,210)">' +
      '<g class="vlab-combustor-flicker">' +
      '<ellipse class="vlab-flame" cx="-18" cy="0" rx="46" ry="30"></ellipse>' +
      '<ellipse class="vlab-flame" cx="10" cy="-8" rx="34" ry="20"></ellipse>' +
      '<ellipse class="vlab-flame" cx="14" cy="10" rx="30" ry="18"></ellipse>' +
      '</g>' +
      '</g>' +

      buildTurbineRows() +

      '<path class="vlab-jet" d="M1150,185 L1150,235 L1240,210 Z"></path>' +

      '<rect class="vlab-zone-hit" data-comp="inlet" x="20" y="95" width="200" height="230"></rect>' +
      '<rect class="vlab-zone-hit" data-comp="compressor" x="220" y="95" width="210" height="230"></rect>' +
      '<rect class="vlab-zone-hit" data-comp="combustor" x="430" y="95" width="220" height="230"></rect>' +
      '<rect class="vlab-zone-hit" data-comp="turbine" x="650" y="95" width="210" height="230"></rect>' +
      '<rect class="vlab-zone-hit" data-comp="exhaust" x="860" y="95" width="300" height="230"></rect>' +

      '<text class="vlab-zone-label" x="120" y="350">Inlet</text>' +
      '<text class="vlab-zone-label" x="325" y="350">Compressor</text>' +
      '<text class="vlab-zone-label" x="540" y="350">Combustor</text>' +
      '<text class="vlab-zone-label" x="755" y="350">Turbine</text>' +
      '<text class="vlab-zone-label" x="1010" y="350">Exhaust</text>' +
      '</svg>' +
      '</div>' +

      '<div class="vlab-controls">' +
      '<label for="vlab-throttle">Throttle</label>' +
      '<input type="range" id="vlab-throttle" min="0" max="100" value="0" step="1">' +
      '<span class="vlab-throttle-pct">0%</span>' +
      '<div class="vlab-mode-toggle">' +
      '<button type="button" class="vlab-mode-btn active" data-mode="1">Mode 1 · PSIG / °C / lbf / Gal-hr</button>' +
      '<button type="button" class="vlab-mode-btn" data-mode="2">Mode 2 · Pa / K / N+kgf / L-hr</button>' +
      '</div>' +
      '</div>' +

      '<div class="vlab-panel">' +
      '<div class="vlab-gauge"><span class="vlab-gauge-label">RPM</span><span class="vlab-gauge-value vlab-val-rpm">0</span></div>' +
      '<div class="vlab-gauge"><span class="vlab-gauge-label">Thrust</span><span class="vlab-gauge-value vlab-val-thrust">0.0 lbf</span></div>' +

      '<div class="vlab-tile vlab-tile-1" data-comp="inlet"><span class="vlab-tile-label">T1 / P1 · Inlet</span><span class="vlab-tile-val vlab-val-tp1"></span></div>' +
      '<div class="vlab-tile vlab-tile-2" data-comp="compressor"><span class="vlab-tile-label">T2 / P2 · Compressor</span><span class="vlab-tile-val vlab-val-tp2"></span></div>' +
      '<div class="vlab-tile vlab-tile-3" data-comp="combustor"><span class="vlab-tile-label">T3 / P3 · Combustor</span><span class="vlab-tile-val vlab-val-tp3"></span></div>' +
      '<div class="vlab-tile vlab-tile-4" data-comp="exhaust"><span class="vlab-tile-label">T4 / P4 · Exhaust (EGT)</span><span class="vlab-tile-val vlab-val-tp4"></span></div>' +

      '<div class="vlab-tile"><span class="vlab-tile-label">Fuel Flow</span><span class="vlab-tile-val vlab-val-fuel"></span></div>' +
      '<div class="vlab-tile vlab-tile-cpr" data-comp="cpr"><span class="vlab-tile-label">Compressor Pressure Ratio</span><span class="vlab-tile-val">P2/P1 = <b class="vlab-val-cpr">0.0</b></span></div>' +
      '</div>' +

      '<div class="vlab-tooltip"><span class="t-title"></span><span class="t-desc"></span></div>' +
      '</div>';

    var root = container.querySelector('.vlab');
    var throttleInput = root.querySelector('#vlab-throttle');
    var throttlePctEl = root.querySelector('.vlab-throttle-pct');

    var valRpm = root.querySelector('.vlab-val-rpm');
    var valThrust = root.querySelector('.vlab-val-thrust');
    var valTp1 = root.querySelector('.vlab-val-tp1');
    var valTp2 = root.querySelector('.vlab-val-tp2');
    var valTp3 = root.querySelector('.vlab-val-tp3');
    var valTp4 = root.querySelector('.vlab-val-tp4');
    var valFuel = root.querySelector('.vlab-val-fuel');
    var valCpr = root.querySelector('.vlab-val-cpr');

    var spinPatternCool = root.querySelector('.vlab-spin-pattern-cool');
    var spinPatternHot = root.querySelector('.vlab-spin-pattern-hot');
    var combustorIntensity = root.querySelector('.vlab-combustor-intensity');
    var jet = root.querySelector('.vlab-jet');
    var flowGroup = root.querySelector('.vlab-flow');

    // Tooltip (same pattern as the Fuel/Oil diagram tools)
    var tooltip = root.querySelector('.vlab-tooltip');
    var tTitle = tooltip.querySelector('.t-title');
    var tDesc = tooltip.querySelector('.t-desc');
    function showTip(evt, key) {
      var d = DESC[key];
      if (!d) return;
      tTitle.textContent = d[0];
      tDesc.textContent = d[1];
      tooltip.style.display = 'block';
      positionTip(evt);
    }
    function positionTip(evt) {
      if (tooltip.style.display !== 'block') return;
      var rect = root.getBoundingClientRect();
      var x = evt.clientX - rect.left + 16;
      var y = evt.clientY - rect.top + 16;
      var maxX = rect.width - 280;
      if (x > maxX) x = evt.clientX - rect.left - 276;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
    function hideTip() {
      tooltip.style.display = 'none';
    }
    root.querySelectorAll('[data-comp]').forEach(function (el) {
      var key = el.getAttribute('data-comp');
      el.addEventListener('mouseenter', function (e) { showTip(e, key); });
      el.addEventListener('mousemove', positionTip);
      el.addEventListener('mouseleave', hideTip);
    });

    // Airflow particles
    var PARTICLE_COUNT = 10;
    var PATH_START = 40, PATH_END = 1150;
    var particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      el.setAttribute('class', 'vlab-particle');
      el.setAttribute('r', '5');
      el.setAttribute('cy', '210');
      flowGroup.appendChild(el);
      particles.push({ el: el, x: PATH_START + (i / PARTICLE_COUNT) * (PATH_END - PATH_START) });
    }

    var targetRpm = MIN_RPM;
    var currentRpm = MIN_RPM;
    var compSpinOffset = 0, turbSpinOffset = 0;
    var rafId = null;
    var lastTime = null;
    var unitMode = 1;

    function updateThrottle() {
      var pct = Number(throttleInput.value);
      throttlePctEl.textContent = pct + '%';
      targetRpm = MIN_RPM + (MAX_RPM - MIN_RPM) * (pct / 100);
    }
    throttleInput.addEventListener('input', updateThrottle);

    var modeButtons = root.querySelectorAll('.vlab-mode-btn');
    modeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        unitMode = Number(btn.getAttribute('data-mode'));
        modeButtons.forEach(function (b) { b.classList.toggle('active', b === btn); });
      });
    });

    function frame(now) {
      if (lastTime == null) lastTime = now;
      var dt = Math.min(64, now - lastTime) / 16.67; // normalized to ~60fps steps
      lastTime = now;

      currentRpm += (targetRpm - currentRpm) * Math.min(1, 0.08 * dt);
      if (Math.abs(targetRpm - currentRpm) < 1) currentRpm = targetRpm;

      var frac = (currentRpm - MIN_RPM) / (MAX_RPM - MIN_RPM);

      var fuelFlow = interp(currentRpm, 'fuelFlow');
      var thrust = interp(currentRpm, 'thrust');
      var p1 = interp(currentRpm, 'p1');
      var p2 = interp(currentRpm, 'p2');
      var p3 = interp(currentRpm, 'p3');
      var p4 = interp(currentRpm, 'p4');
      var t1 = interp(currentRpm, 't1');
      var t2 = interp(currentRpm, 't2');
      var t3 = interp(currentRpm, 't3');
      var t4 = interp(currentRpm, 't4');
      var cpr = p1 > 0.0001 ? p2 / p1 : 0;

      valRpm.textContent = Math.round(currentRpm).toLocaleString();
      valThrust.textContent = fmtThrust(thrust, unitMode);
      valTp1.innerHTML = '<b>' + fmtTemp(t1, unitMode) + '</b> &nbsp;·&nbsp; <b>' + fmtPressure(p1, unitMode) + '</b>';
      valTp2.innerHTML = '<b>' + fmtTemp(t2, unitMode) + '</b> &nbsp;·&nbsp; <b>' + fmtPressure(p2, unitMode) + '</b>';
      valTp3.innerHTML = '<b>' + fmtTemp(t3, unitMode) + '</b> &nbsp;·&nbsp; <b>' + fmtPressure(p3, unitMode) + '</b>';
      valTp4.innerHTML = '<b>' + fmtTemp(t4, unitMode) + '</b> &nbsp;·&nbsp; <b>' + fmtPressure(p4, unitMode) + '</b>';
      valFuel.innerHTML = '<b>' + fmtFuel(fuelFlow, unitMode) + '</b>';
      valCpr.textContent = cpr.toFixed(1);

      // Shaft/rotor "spin": scroll the diagonal stripe pattern — the
      // standard technical-drawing convention for depicting rotation in a
      // side profile that can't literally show blades turning.
      var spinSpeed = (1.2 + frac * 14) * dt;
      compSpinOffset = (compSpinOffset + spinSpeed) % 1000;
      turbSpinOffset = (turbSpinOffset + spinSpeed * 1.15) % 1000;
      spinPatternCool.setAttribute('patternTransform', 'translate(' + compSpinOffset + ',0) rotate(45)');
      spinPatternHot.setAttribute('patternTransform', 'translate(' + turbSpinOffset + ',0) rotate(45)');

      // Combustor glow intensity scales with fuel flow
      var fuelFrac = Math.min(1, fuelFlow / 5);
      combustorIntensity.style.opacity = String(0.35 + fuelFrac * 0.65);
      combustorIntensity.setAttribute('transform', 'translate(540,210) scale(' + (0.75 + fuelFrac * 0.45) + ')');

      // Exhaust jet scales with thrust
      var thrustFrac = Math.min(1, thrust / 15);
      jet.style.opacity = String(0.15 + thrustFrac * 0.85);
      jet.style.transform = 'scaleX(' + (0.3 + thrustFrac * 1.3) + ')';

      // Airflow particle speed scales with RPM
      var speed = (2 + frac * 14) * dt;
      particles.forEach(function (p) {
        p.x += speed;
        if (p.x > PATH_END) p.x = PATH_START + (p.x - PATH_END);
        p.el.setAttribute('cx', p.x.toFixed(1));
        var color = p.x < 430 ? '#6fb7e8' : (p.x < 860 ? '#ff8a4d' : '#ffb98a');
        p.el.setAttribute('fill', color);
      });

      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    window.TM.toolModules['virtual-physical-lab'].unmount = function () {
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }

  window.TM.registerTool('virtual-physical-lab', { mount: mount });
})();
