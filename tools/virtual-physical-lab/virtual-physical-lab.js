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

  // Airflow path traced over the static image to match the actual gas
  // route visible in it: straight in through the intake, up through the
  // centrifugal compressor to its diffuser exit, down through the short
  // elbow into the turbine inlet, then rearward through the annular
  // passage around the nozzle centerbody, converging back to the shaft
  // centerline at the centerbody's tip before the exhaust. The lower path
  // is the same route mirrored about the centerline (y=192), matching the
  // engine's own top/bottom symmetry in the cutaway.
  var FLOW_PATH_UPPER = 'M15,192 Q100,170 174,159 Q260,140 337,69 Q375,40 400,95 Q415,120 430,145 Q500,175 569,192 L780,192';
  var FLOW_PATH_LOWER = 'M15,192 Q100,214 174,225 Q260,244 337,315 Q375,344 400,289 Q415,264 430,239 Q500,209 569,192 L780,192';

  // Marker positions are percentages over the static engine-diagram.png,
  // matched by eye to the 5 yellow sensor dots already drawn on that
  // image (inlet / compressor exit / combustor / turbine / exhaust).
  var MARKERS = [
    { comp: 'inlet', xPct: 21.9, yPct: 41.4 },
    { comp: 'compressor', xPct: 42.4, yPct: 18.0 },
    { comp: 'combustor', xPct: 53.8, yPct: 23.2 },
    { comp: 'turbine', xPct: 52.5, yPct: 35.4 },
    { comp: 'exhaust', xPct: 71.7, yPct: 50.0 },
  ];

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

  function mount(container) {
    container.innerHTML =
      '<div class="vlab">' +
      '<div class="vlab-header">' +
      '<h1>Virtual Lab on Engine Practical</h1>' +
      '<p>Push the throttle to increase engine RPM, and watch pressure, temperature, fuel flow and thrust respond across the engine in real time.</p>' +
      '</div>' +

      '<div class="vlab-stage">' +
      '<div class="vlab-image-wrap">' +
      '<img class="vlab-image" src="tools/virtual-physical-lab/engine-diagram.png" alt="Cutaway diagram of a single-spool turbojet: intake, centrifugal compressor, combustor, turbine and exhaust, with five sensor points marked.">' +

      '<svg class="vlab-overlay" viewBox="0 0 794 384" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
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
      '</defs>' +

      '<g class="vlab-combustor-intensity" transform="translate(452,195)">' +
      '<g class="vlab-combustor-flicker">' +
      '<ellipse class="vlab-flame" cx="-16" cy="0" rx="70" ry="60"></ellipse>' +
      '<ellipse class="vlab-flame" cx="14" cy="-10" rx="52" ry="40"></ellipse>' +
      '<ellipse class="vlab-flame" cx="18" cy="14" rx="46" ry="36"></ellipse>' +
      '</g>' +
      '</g>' +

      '<path class="vlab-flow-path-upper" d="' + FLOW_PATH_UPPER + '" fill="none" stroke="none"></path>' +
      '<path class="vlab-flow-path-lower" d="' + FLOW_PATH_LOWER + '" fill="none" stroke="none"></path>' +
      '<g class="vlab-flow"></g>' +

      '<path class="vlab-jet" d="M770,165 L770,220 L870,192 Z"></path>' +
      '</svg>' +

      '<div class="vlab-hot-markers">' +
      MARKERS.map(function (m) {
        return '<span class="vlab-marker" data-comp="' + m.comp + '" style="left:' + m.xPct + '%; top:' + m.yPct + '%;"></span>';
      }).join('') +
      '</div>' +
      '</div>' +
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

    var combustorIntensity = root.querySelector('.vlab-combustor-intensity');
    var jet = root.querySelector('.vlab-jet');
    var flowGroup = root.querySelector('.vlab-flow');

    // Tooltip (same pattern as the Fuel/Oil/Air System diagram tools)
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

    // Airflow arrows, overlaid on the static image and travelling along the
    // actual gas route traced over it (FLOW_PATH_UPPER/LOWER above) — the
    // picture can't show literal blade rotation, so motion is carried by
    // these arrows plus the combustor glow / exhaust jet instead.
    var flowPathUpper = root.querySelector('.vlab-flow-path-upper');
    var flowPathLower = root.querySelector('.vlab-flow-path-lower');
    var pathLengthUpper = flowPathUpper.getTotalLength();
    var pathLengthLower = flowPathLower.getTotalLength();
    var TANGENT_EPS = 1.5;

    function pointAndAngle(pathEl, totalLength, dist) {
      var d = Math.max(0, Math.min(totalLength, dist));
      var p = pathEl.getPointAtLength(d);
      var d2 = Math.min(totalLength, d + TANGENT_EPS);
      var p2 = pathEl.getPointAtLength(d2);
      var angle = Math.atan2(p2.y - p.y, p2.x - p.x) * (180 / Math.PI);
      return { x: p.x, y: p.y, angle: angle };
    }

    var PARTICLE_COUNT = 10;
    var particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      var el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      el.setAttribute('class', 'vlab-particle');
      el.setAttribute('d', 'M -7,-4.5 L 6,0 L -7,4.5 L -3,0 Z');
      flowGroup.appendChild(el);
      var onUpper = i % 2 === 0;
      var pathEl = onUpper ? flowPathUpper : flowPathLower;
      var totalLength = onUpper ? pathLengthUpper : pathLengthLower;
      particles.push({
        el: el,
        pathEl: pathEl,
        totalLength: totalLength,
        dist: (i / PARTICLE_COUNT) * totalLength,
      });
    }

    var targetRpm = MIN_RPM;
    var currentRpm = MIN_RPM;
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

      // Combustor glow intensity scales with fuel flow
      var fuelFrac = Math.min(1, fuelFlow / 5);
      combustorIntensity.style.opacity = String(0.25 + fuelFrac * 0.65);
      combustorIntensity.setAttribute('transform', 'translate(452,195) scale(' + (0.7 + fuelFrac * 0.5) + ')');

      // Exhaust jet scales with thrust
      var thrustFrac = Math.min(1, thrust / 15);
      jet.style.opacity = String(0.15 + thrustFrac * 0.85);
      jet.style.transform = 'scaleX(' + (0.3 + thrustFrac * 1.3) + ')';

      // Airflow arrow speed scales with RPM; color shifts cool → hot →
      // exhaust by fraction travelled along the path (compressor exit
      // ~35%, turbine/annular passage ~55-100%).
      var speed = (1.5 + frac * 11) * dt;
      particles.forEach(function (p) {
        p.dist += speed;
        if (p.dist > p.totalLength) p.dist -= p.totalLength;
        var pt = pointAndAngle(p.pathEl, p.totalLength, p.dist);
        var travelFrac = p.dist / p.totalLength;
        var color = travelFrac < 0.35 ? '#6fb7e8' : (travelFrac < 0.72 ? '#ff8a4d' : '#ffb98a');
        p.el.setAttribute('fill', color);
        p.el.setAttribute('transform', 'translate(' + pt.x.toFixed(1) + ',' + pt.y.toFixed(1) + ') rotate(' + pt.angle.toFixed(1) + ')');
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
