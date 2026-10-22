(function () {
  // Content sourced from the supplied lab answer key
  // (Lab_5_Engine_Fire_Protection_ANS_v7.0.docx) and its two reference
  // images, used verbatim (not redrawn) — fire-panel-overview.jpg (the
  // 20VU fire panel + cockpit location + 115VU engine mode panel) and
  // fdu-dual-loop.jpg (the APU's Loop A / Loop B dual-loop detection
  // circuit) — with hover markers overlaid at percentage positions,
  // same image-plus-overlay pattern as Air System/APU System. No edit
  // mode: nothing here is user-editable content, same reasoning as the
  // Turbofan Engine's shaft-arrangement panel.
  var PANEL_MARKERS = {
    'eng1-fire-pb': {
      name: 'ENG 1 FIRE Pushbutton', xPct: 19.9, yPct: 16.1,
      desc: 'The guarded red pushbutton for engine 1. Pushing it arms the fire extinguishing system and automatically cuts off fuel, hydraulic, bleed air, and electrical supplies to that engine.',
    },
    'agent1-eng1': {
      name: 'ENG 1 — AGENT 1 (Squib/Disch)', xPct: 8.7, yPct: 13.6,
      desc: 'Fires the first extinguisher bottle into the engine 1 nacelle. Pressed after the ENG FIRE pushbutton, once the fire warning has had time to clear on its own.',
    },
    'agent2-eng1': {
      name: 'ENG 1 — AGENT 2 (Squib/Disch)', xPct: 30.7, yPct: 11.9,
      desc: 'Fires the second, backup extinguisher bottle into the engine 1 nacelle, if the fire warning persists after Agent 1 has been discharged.',
    },
    'test-eng1': {
      name: 'ENG 1 — TEST', xPct: 8.7, yPct: 19.5,
      desc: 'Checks the engine 1 fire detection and warning circuit without an actual fire present.',
    },
    'apu-fire-pb': {
      name: 'APU FIRE Pushbutton', xPct: 41.5, yPct: 12.4,
      desc: 'The guarded red pushbutton for the APU. Pushing it arms the APU fire extinguishing system and shuts down the APU’s fuel and electrical supplies.',
    },
    'apu-agent': {
      name: 'APU — AGENT (Squib/Disch)', xPct: 36.6, yPct: 23.4,
      desc: 'Fires the APU’s single extinguisher bottle. The APU only carries one bottle (unlike each main engine’s two), since it has no second engine nearby still needing thrust and is usually shut down entirely once a fire is confirmed.',
    },
    'apu-test': {
      name: 'APU — TEST', xPct: 47.2, yPct: 19.5,
      desc: 'Checks the APU fire detection and warning circuit without an actual fire present.',
    },
    'agent1-eng2': {
      name: 'ENG 2 — AGENT 1 (Squib/Disch)', xPct: 53.1, yPct: 13.6,
      desc: 'Fires the first extinguisher bottle into the engine 2 nacelle. Pressed after the ENG FIRE pushbutton, once the fire warning has had time to clear on its own.',
    },
    'eng2-fire-pb': {
      name: 'ENG 2 FIRE Pushbutton', xPct: 64.2, yPct: 16.1,
      desc: 'The guarded red pushbutton for engine 2. Pushing it arms the fire extinguishing system and automatically cuts off fuel, hydraulic, bleed air, and electrical supplies to that engine.',
    },
    'agent2-eng2': {
      name: 'ENG 2 — AGENT 2 (Squib/Disch)', xPct: 75.1, yPct: 13.6,
      desc: 'Fires the second, backup extinguisher bottle into the engine 2 nacelle, if the fire warning persists after Agent 1 has been discharged.',
    },
    'test-eng2': {
      name: 'ENG 2 — TEST', xPct: 75.1, yPct: 19.5,
      desc: 'Checks the engine 2 fire detection and warning circuit without an actual fire present.',
    },
    'overhead-location': {
      name: 'Fire Panel Location — Overhead Panel', xPct: 51.3, yPct: 34.8,
      desc: 'This whole fire panel (labelled 20VU) is physically mounted on the cockpit’s overhead panel, within easy reach of both pilots.',
    },
    'pedestal-location': {
      name: 'Engine Mode Panel Location — Pedestal', xPct: 51.1, yPct: 73.9,
      desc: 'The engine master switches and MODE selector (labelled 115VU) sit on the center pedestal between the two pilots, next to the thrust levers.',
    },
    'eng1-master': {
      name: 'ENG 1 Master Switch', xPct: 78.6, yPct: 71.7,
      desc: 'ON starts/keeps engine 1 running; OFF shuts off its fuel supply. Used in the shutdown step before pushing the ENG FIRE pushbutton.',
    },
    'eng2-master': {
      name: 'ENG 2 Master Switch', xPct: 90.8, yPct: 71.7,
      desc: 'ON starts/keeps engine 2 running; OFF shuts off its fuel supply. Used in the shutdown step before pushing the ENG FIRE pushbutton.',
    },
    'mode-selector': {
      name: 'MODE Selector (CRANK / NORM / IGN START)', xPct: 84.5, yPct: 82.9,
      desc: 'Selects the engine start mode — CRANK (dry-motor the engine with no fuel/ignition), NORM (normal automatic start), or IGN START (manual ignition override). Not part of the fire logic itself, but shares the same 115VU panel.',
    },
    'eng1-fire-fault': {
      name: 'ENG 1 FIRE/FAULT Light', xPct: 77.1, yPct: 87.3,
      desc: 'Illuminates red (FIRE) or amber (FAULT) to repeat the engine 1 fire/fault state on the pedestal panel, next to the master switch the pilot is about to use.',
    },
    'eng2-fire-fault': {
      name: 'ENG 2 FIRE/FAULT Light', xPct: 92.3, yPct: 87.3,
      desc: 'Illuminates red (FIRE) or amber (FAULT) to repeat the engine 2 fire/fault state on the pedestal panel, next to the master switch the pilot is about to use.',
    },
  };

  var LOOP_MARKERS = {
    'loop-a': {
      name: 'Loop A', xPct: 42, yPct: 62,
      desc: 'One of two identical fire-sensing loops routed around the nacelle. Loop A and Loop B are electrically independent and run in parallel, not in series — so damage to one loop’s wiring doesn’t take out fire detection entirely.',
    },
    'loop-b': {
      name: 'Loop B', xPct: 42, yPct: 69,
      desc: 'The second of the two identical, parallel fire-sensing loops. Having two independent loops means the FDU can cross-check them: agreement between both gives a confident fire signal, while a mismatch points to a fault in one loop rather than a real fire.',
    },
    'sensing-element': {
      name: 'Fire-Sensing Element', xPct: 36.6, yPct: 58.1,
      desc: 'A continuous heat-sensitive element running the length of each loop. Its electrical properties change when it detects an overheat/fire condition, which is what the FDU actually measures.',
    },
    'fdu-box': {
      name: 'Fire Detection Unit (FDU)', xPct: 77.6, yPct: 68.4,
      desc: 'Continuously monitors both loops’ signals. If both loops agree a fire condition is present, it raises a Fire signal; if a loop’s own reading looks abnormal (e.g. open/shorted wiring) rather than a genuine fire, it raises a Fault signal instead. One FDU per engine/APU, each wired to that engine’s own Loop A/Loop B.',
    },
  };

  var SIGNALS = {
    fire: {
      name: 'Fire Signal',
      desc: 'Raised when the FDU’s loops agree a genuine fire condition is present. Activates the fire warning lights and aural/master warning alarms in the cockpit, and is what the pilot’s extinguishing drill responds to.',
    },
    fault: {
      name: 'Fault Signal',
      desc: 'Raised when the detection system itself is malfunctioning — e.g. a damaged loop or wiring fault — rather than an actual fire. Alerts the maintenance crew that the detection system needs inspection or repair, rather than triggering the fire drill.',
    },
  };

  var COMPARISON = [
    { feature: 'Location of Bottle', engine: 'Engine nacelle / pylon area, close to the engine but shielded from its heat', apu: 'APU compartment' },
    { feature: 'Extinguishing Method', engine: 'Always manual — pilot discharges Agent 1, then Agent 2 if needed, both on the ground and in flight', apu: 'Automatic on the ground; manual in flight' },
    { feature: 'Warning Signal', engine: 'Engine fire warning light and alarm on the flight deck', apu: 'APU fire warning light, also repeated at the wheel-well area (for ground/rescue crew)' },
    { feature: 'Number of Bottles', engine: '2 bottles (Agent 1 + Agent 2)', apu: '1 bottle' },
  ];

  var STEPS = [
    {
      text: 'A <b>fire warning</b> appears — Master Warning, an ECAM "ENG FIRE" message, and the red FIRE light illuminate on the affected engine’s fire panel.',
      marker: 'eng1-fire-fault',
    },
    {
      text: '<b>Thrust lever</b> of the affected engine — retard to idle.',
      marker: 'eng1-master',
    },
    {
      text: '<b>Engine Master Switch</b> — OFF. This shuts down fuel and ignition to that engine.',
      marker: 'eng1-master',
    },
    {
      text: '<b>ENG FIRE pushbutton</b> — PUSH. This arms the fire extinguishing system and automatically cuts off fuel, hydraulic, bleed air, and electrical supplies to that engine.',
      marker: 'eng1-fire-pb',
    },
    {
      text: 'Wait briefly (around 10 seconds). If the fire warning persists, discharge <b>Agent 1</b> — push the first SQUIB/DISCH button to fire the first bottle into the nacelle.',
      marker: 'agent1-eng1',
    },
    {
      text: 'Wait again (around 30 seconds). If the fire warning still persists, discharge <b>Agent 2</b> — push the second SQUIB/DISCH button to fire the backup bottle.',
      marker: 'agent2-eng1',
    },
    {
      text: 'If the fire warning clears, continue monitoring and complete the rest of the ECAM procedure. If it does <b>not</b> clear, this becomes a more serious emergency — the crew follows further checklist items, which may include diverting to the nearest suitable airport.',
      marker: null,
    },
  ];

  // Interactive fire-panel buttons: same positions as the matching
  // PANEL_MARKERS entries above (so they sit exactly where the real
  // buttons are on the overhead panel), but rendered as clickable
  // <button> elements with state-driven feedback instead of hover-only
  // info markers — added by request ("I want students to press 'button'
  // and see what will happen").
  var BUTTONS = {
    'eng1-fire-pb': { type: 'fire', unit: 'eng1', xPct: 19.9, yPct: 16.1 },
    'eng2-fire-pb': { type: 'fire', unit: 'eng2', xPct: 64.2, yPct: 16.1 },
    'apu-fire-pb': { type: 'fire', unit: 'apu', xPct: 41.5, yPct: 12.4 },
    'test-eng1': { type: 'test', unit: 'eng1', xPct: 8.7, yPct: 19.5 },
    'test-eng2': { type: 'test', unit: 'eng2', xPct: 75.1, yPct: 19.5 },
    'apu-test': { type: 'test', unit: 'apu', xPct: 47.2, yPct: 19.5 },
    'agent1-eng1': { type: 'agent', unit: 'eng1', agent: 1, xPct: 8.7, yPct: 13.6 },
    'agent2-eng1': { type: 'agent', unit: 'eng1', agent: 2, xPct: 30.7, yPct: 11.9 },
    'agent1-eng2': { type: 'agent', unit: 'eng2', agent: 1, xPct: 53.1, yPct: 13.6 },
    'agent2-eng2': { type: 'agent', unit: 'eng2', agent: 2, xPct: 75.1, yPct: 13.6 },
    'apu-agent': { type: 'agent', unit: 'apu', agent: 1, xPct: 36.6, yPct: 23.4 },
  };
  var UNITS = ['eng1', 'eng2', 'apu'];
  var UNIT_LABEL = { eng1: 'ENG 1', eng2: 'ENG 2', apu: 'APU' };
  var UNIT_SUPPLIES = {
    eng1: 'fuel, hydraulic, bleed air, and electrical supplies to Engine 1',
    eng2: 'fuel, hydraulic, bleed air, and electrical supplies to Engine 2',
    apu: 'fuel and electrical supplies to the APU',
  };

  function buttonHtml() {
    return Object.keys(BUTTONS).map(function (id) {
      var b = BUTTONS[id];
      var info = PANEL_MARKERS[id];
      return '<button type="button" class="fs-btn fs-btn-' + b.type + '" data-btn="' + id +
        '" style="left:' + b.xPct + '%; top:' + b.yPct + '%;" aria-label="' +
        TM.escapeHtml(info ? info.name : id) + '"></button>';
    }).join('');
  }

  function unitBadgesHtml() {
    return UNITS.map(function (u) {
      var agents = u === 'apu' ? [1] : [1, 2];
      var badges = '<span class="fs-unit-badge" data-badge="' + u + '-armed">' + UNIT_LABEL[u] + ' ARMED</span>' +
        agents.map(function (n) {
          return '<span class="fs-unit-badge" data-badge="' + u + '-agent' + n + '">' + UNIT_LABEL[u] + ' AGENT ' + n + '</span>';
        }).join('');
      return '<div class="fs-unit-badge-group">' + badges + '</div>';
    }).join('');
  }

  function markerHtml(layerClass, markers) {
    return Object.keys(markers).map(function (id) {
      var m = markers[id];
      return '<span class="fs-marker" data-marker="' + id + '" style="left:' + m.xPct + '%; top:' + m.yPct + '%;"></span>';
    }).join('');
  }
  function listHtml(markers) {
    return Object.keys(markers).map(function (id) {
      var m = markers[id];
      return '<li class="fs-list-item" data-marker="' + id + '">' +
        '<span class="fs-list-name">' + TM.escapeHtml(m.name) + '</span>' +
        '<span class="fs-list-desc">' + TM.escapeHtml(m.desc) + '</span>' +
        '</li>';
    }).join('');
  }

  function mount(container) {
    container.innerHTML =
      '<div class="fs-diagram">' +
      '<p class="kicker">Official (Open)</p>' +
      '<h1>Engine Fire Protection System</h1>' +
      '<p class="fs-sub">Hover any marker for its function. Based on the supplied fire panel and dual-loop detection reference.</p>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Fire Panel &amp; Cockpit Location</h2>' +
      '<div class="fs-image-wrap">' +
      '<img class="fs-image" src="tools/fire-system/fire-panel-overview.jpg" alt="Engine and APU fire panel (20VU), its overhead-panel location, and the engine master/mode panel (115VU) on the pedestal.">' +
      '<div class="fs-markers">' + markerHtml('panel', PANEL_MARKERS) + '</div>' +
      '</div>' +
      '<ul class="fs-list">' + listHtml(PANEL_MARKERS) + '</ul>' +
      '</div>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Main Engine vs. APU Fire Protection</h2>' +
      '<p class="fs-note">Each engine and the APU have their own independent fire protection system, but they differ in a few key ways:</p>' +
      '<table class="fs-table"><thead><tr><th>Feature</th><th>Main Engine</th><th>APU</th></tr></thead><tbody>' +
      COMPARISON.map(function (row) {
        return '<tr><td>' + row.feature + '</td><td>' + row.engine + '</td><td>' + row.apu + '</td></tr>';
      }).join('') +
      '</tbody></table>' +
      '</div>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Dual-Loop Fire Detection (FDU)</h2>' +
      '<p class="fs-note">Shown here for the APU, but each main engine has the exact same arrangement — its own FDU wired to its own Loop A / Loop B around that engine’s nacelle.</p>' +
      '<div class="fs-image-wrap">' +
      '<img class="fs-image" src="tools/fire-system/fdu-dual-loop.jpg" alt="Dual-loop fire detection circuit: Loop A and Loop B routed around the nacelle, feeding the Fire Detection Unit (FDU).">' +
      '<div class="fs-markers">' + markerHtml('loop', LOOP_MARKERS) + '</div>' +
      '</div>' +
      '<ul class="fs-list">' + listHtml(LOOP_MARKERS) + '</ul>' +
      '<p class="fs-note">Each engine/APU has one <b>individual</b> fire detection system, not a system shared across engines. That system’s 2 identical loops (A and B) are wired in <b>parallel</b>, not series — so a single damaged loop degrades to a fault condition rather than silently disabling fire detection altogether.</p>' +
      '</div>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Fire Signal vs. Fault Signal</h2>' +
      '<div class="fs-signal-cards">' +
      '<div class="fs-signal-card fire"><h3>' + SIGNALS.fire.name + '</h3><p>' + SIGNALS.fire.desc + '</p></div>' +
      '<div class="fs-signal-card fault"><h3>' + SIGNALS.fault.name + '</h3><p>' + SIGNALS.fault.desc + '</p></div>' +
      '</div>' +
      '</div>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Try It: Operate the Fire Panel</h2>' +
      '<p class="fs-note">Press a button to see what it does. The <b>FIRE</b> switches, <b>TEST</b> buttons, and <b>AGENT</b> (extinguisher) buttons below sit at the same positions as on the real overhead fire panel.</p>' +
      '<div class="fs-stepbar"><button type="button" class="fs-nav fs-reset-all">⟲ Reset All</button></div>' +
      '<div class="fs-image-wrap fs-sim-image-wrap">' +
      '<img class="fs-image" src="tools/fire-system/fire-panel-overview.jpg" alt="Interactive fire panel — press the FIRE, TEST, and AGENT buttons.">' +
      '<div class="fs-markers fs-sim-markers">' + buttonHtml() + '</div>' +
      '</div>' +
      '<div class="fs-status-panel">' +
      '<p class="fs-status-msg" aria-live="polite">Press a button on the panel above to begin.</p>' +
      '<div class="fs-unit-badges">' + unitBadgesHtml() + '</div>' +
      '</div>' +
      '</div>' +

      '<div class="fs-panel">' +
      '<h2 class="fs-section-title">Recommended Real-World Order (Main Engine Fire)</h2>' +
      '<ol class="fs-order-list">' +
      STEPS.map(function (s) { return '<li>' + s.text + '</li>'; }).join('') +
      '</ol>' +
      '</div>' +

      '</div>';

    var root = container.querySelector('.fs-diagram');
    var tooltip = document.createElement('div');
    tooltip.className = 'fs-tooltip';
    tooltip.innerHTML = '<span class="t-title"></span><span class="t-desc"></span>';
    root.appendChild(tooltip);
    var tTitle = tooltip.querySelector('.t-title');
    var tDesc = tooltip.querySelector('.t-desc');

    function showTip(evt, m) {
      tTitle.textContent = m.name;
      tDesc.textContent = m.desc;
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
    }

    function wireMarkers(wrap, markers) {
      wrap.querySelectorAll('.fs-marker').forEach(function (el) {
        var id = el.getAttribute('data-marker');
        var m = markers[id];
        el.addEventListener('mouseenter', function (e) { showTip(e, m); setActive(id, true); });
        el.addEventListener('mousemove', positionTip);
        el.addEventListener('mouseleave', function () { hideTip(); setActive(id, false); });
      });
    }
    function wireList(markers) {
      root.querySelectorAll('.fs-list-item').forEach(function (li) {
        var id = li.getAttribute('data-marker');
        var m = markers[id];
        if (!m) return;
        li.addEventListener('mouseenter', function (e) { showTip(e, m); setActive(id, true); });
        li.addEventListener('mousemove', positionTip);
        li.addEventListener('mouseleave', function () { hideTip(); setActive(id, false); });
      });
    }
    root.querySelectorAll('.fs-markers').forEach(function (wrap, i) {
      if (wrap.classList.contains('fs-sim-markers')) return;
      wireMarkers(wrap, i === 0 ? PANEL_MARKERS : LOOP_MARKERS);
    });
    wireList(PANEL_MARKERS);
    wireList(LOOP_MARKERS);

    // --- interactive fire-panel buttons ---
    var state = {
      eng1: { pushed: false, agent1: false, agent2: false, testing: false },
      eng2: { pushed: false, agent1: false, agent2: false, testing: false },
      apu: { pushed: false, agent1: false, testing: false },
    };
    var statusMsg = root.querySelector('.fs-status-msg');

    function setStatus(html) { statusMsg.innerHTML = html; }

    function refreshBadges() {
      UNITS.forEach(function (u) {
        var armedBadge = root.querySelector('[data-badge="' + u + '-armed"]');
        if (armedBadge) armedBadge.classList.toggle('on', state[u].pushed);
        var agents = u === 'apu' ? [1] : [1, 2];
        agents.forEach(function (n) {
          var el = root.querySelector('[data-badge="' + u + '-agent' + n + '"]');
          if (el) el.classList.toggle('on', !!state[u]['agent' + n]);
        });
      });
    }

    function refreshButtons() {
      Object.keys(BUTTONS).forEach(function (id) {
        var b = BUTTONS[id];
        var btn = root.querySelector('[data-btn="' + id + '"]');
        if (!btn) return;
        if (b.type === 'fire') {
          btn.classList.toggle('is-pushed', state[b.unit].pushed);
        } else if (b.type === 'agent') {
          var discharged = !!state[b.unit]['agent' + b.agent];
          btn.classList.toggle('is-discharged', discharged);
          btn.classList.toggle('is-armed', state[b.unit].pushed && !discharged);
        } else if (b.type === 'test') {
          btn.classList.toggle('is-active', !!state[b.unit].testing);
        }
      });
      ['eng1', 'eng2'].forEach(function (u) {
        root.querySelectorAll('[data-marker="' + u + '-fire-fault"]').forEach(function (el) {
          el.classList.toggle('fs-step-active-marker', !!state[u].testing);
        });
      });
    }

    function handleFire(unit) {
      var s = state[unit];
      if (!s.pushed) {
        s.pushed = true;
        setStatus('<b>' + UNIT_LABEL[unit] + ' FIRE switch pushed.</b> This arms the extinguishing system and automatically cuts off ' + UNIT_SUPPLIES[unit] + '. The AGENT button(s) are now armed and ready to discharge.');
      } else {
        s.pushed = false;
        s.agent1 = false;
        if ('agent2' in s) s.agent2 = false;
        setStatus('<b>' + UNIT_LABEL[unit] + ' FIRE switch reset.</b> Supplies are restored to normal and the AGENT button(s) are disarmed again.');
      }
      refreshButtons();
      refreshBadges();
    }

    function handleAgent(unit, n) {
      var s = state[unit];
      var key = 'agent' + n;
      if (!s.pushed) {
        setStatus('Nothing happens yet — push the ' + UNIT_LABEL[unit] + ' FIRE switch first to arm the extinguishing system.');
        return;
      }
      if (s[key]) {
        setStatus(UNIT_LABEL[unit] + ' AGENT ' + n + ' has already been discharged. Use Reset All to try again.');
        return;
      }
      if (n === 2 && !s.agent1) {
        setStatus('<b>' + UNIT_LABEL[unit] + ' AGENT 2 discharged</b> (backup bottle fired into the ' + (unit === 'apu' ? 'APU compartment' : 'nacelle') + '). Note: normal procedure is to try Agent 1 first and wait to see if the fire clears before using the backup.');
      } else {
        setStatus('<b>' + UNIT_LABEL[unit] + ' AGENT ' + n + ' discharged.</b> The ' + (n === 1 ? 'first' : 'second, backup') + ' extinguisher bottle fires into the ' + (unit === 'apu' ? 'APU compartment' : 'nacelle') + '.');
      }
      s[key] = true;
      refreshButtons();
      refreshBadges();
    }

    function handleTest(unit) {
      var s = state[unit];
      s.testing = !s.testing;
      if (s.testing) {
        setStatus('<b>' + UNIT_LABEL[unit] + ' TEST active.</b> This simulates a fire condition to check the detection and warning circuit — the FIRE and FAULT lights illuminate without an actual fire.');
      } else {
        setStatus(UNIT_LABEL[unit] + ' TEST released — back to normal monitoring.');
      }
      refreshButtons();
    }

    root.querySelectorAll('.fs-btn').forEach(function (btn) {
      var id = btn.getAttribute('data-btn');
      var b = BUTTONS[id];
      btn.addEventListener('click', function () {
        if (b.type === 'fire') handleFire(b.unit);
        else if (b.type === 'agent') handleAgent(b.unit, b.agent);
        else if (b.type === 'test') handleTest(b.unit);
      });
      var info = PANEL_MARKERS[id];
      if (info) {
        btn.addEventListener('mouseenter', function (e) { showTip(e, info); });
        btn.addEventListener('mousemove', positionTip);
        btn.addEventListener('mouseleave', hideTip);
      }
    });

    root.querySelector('.fs-reset-all').addEventListener('click', function () {
      UNITS.forEach(function (u) {
        state[u].pushed = false;
        state[u].agent1 = false;
        if ('agent2' in state[u]) state[u].agent2 = false;
        state[u].testing = false;
      });
      setStatus('All switches reset.');
      refreshButtons();
      refreshBadges();
    });

    refreshButtons();
    refreshBadges();
  }

  window.TM.registerTool('fire-system', { mount: mount });
})();
