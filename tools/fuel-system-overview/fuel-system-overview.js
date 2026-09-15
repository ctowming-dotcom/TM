(function () {
  var titles = {
    lpsov: 'LP SOV (LP shutoff valve)',
    lppump: 'LP pump',
    fohe: 'FOHE (Fuel Oil Heat Exchanger)',
    lpfilter: 'LP filter',
    hppump: 'HP pump',
    meteringvalve: 'Metering valve (in HMU)',
    hpsov: 'HP SOV (in HMU)',
    vsv: 'VSV (Variable Stator Vane actuator)',
    drainvv: 'Drain V/V',
    draincollector: 'Drain collector',
    drainmast: 'Drain mast',
    fftransmitter: 'FF transmitter',
    fuelmanifold: 'Fuel manifold',
    fuelnozzles: 'Fuel nozzles',
  };

  var descriptions = {
    lpsov: 'Sits at the boundary between the aircraft and engine fuel systems, isolating the two. Normally controlled by the engine fire switch or master switch — closing it stops fuel reaching the engine in an emergency such as fire or major failure.',
    lppump: 'The pump’s boost stage, a centrifugal pump, that raises tank fuel to a regulated pressure and pushes it on to the FOHE, preventing cavitation further downstream.',
    fohe: 'Uses the cooler fuel to remove heat from the hot engine oil — the oil is cooled while the fuel is warmed in return. A fuel smell in the oil tank during servicing can indicate a leaking FOHE.',
    lpfilter: 'Sits in the low-pressure circuit, upstream of the fuel control unit, and filters impurities out of the fuel. A differential pressure switch flags a clogged filter, and a bypass valve lets fuel around it if it does clog.',
    hppump: 'The pump’s main stage — a gear-type positive-displacement pump — that raises fuel to high pressure for metering, and also supplies servo fuel (Pf) to the bypass valve and other fuel-pressure-operated actuators.',
    meteringvalve: 'Computes the correct fuel quantity from thrust lever position, inlet pressure and temperature, shaft speeds (N1/N2/N3) and EGT, then meters exactly that flow onward to the nozzles.',
    hpsov: 'Cuts off fuel from the HMU to the fuel nozzles and combustion chamber. Unlike the LP valve, it doesn’t isolate the aircraft supply — it’s the valve that actually starts or stops combustion.',
    vsv: 'Uses HMU-metered servo fuel pressure as hydraulic muscle to torque-motor the variable stator vanes, controlling compressor airflow across the engine’s operating range.',
    drainvv: 'Stays closed while the engine runs so metered fuel isn’t lost. Opens after shutdown to bleed fuel trapped in the manifold to the drain mast, preventing it from coking (baking into carbon deposits) in the hot lines.',
    draincollector: 'Gathers the fuel bled off by the drain valve before it’s routed overboard, keeping residual fuel from pooling in the engine bay.',
    drainmast: 'Vents the collected drain fuel safely overboard, away from hot engine surfaces.',
    fftransmitter: 'Sends an electrical signal to the cockpit fuel flow gauge. During start it confirms the HP shutoff valve has opened; in flight it helps the crew catch excessive fuel flow before EGT gets too high.',
    fuelmanifold: 'Distributes metered fuel around the engine case to each fuel nozzle, keeping flow balanced across all of them.',
    fuelnozzles: 'Injects and atomizes fuel into the combustion chamber. Simplex or duplex types keep fuel evenly distributed and centred, avoiding hot spots that could damage the combustion liner.',
  };

  function mount(container) {
    container.innerHTML =
      '<div class="fuel-diagram">' +
      '<p class="kicker">Official (Open)</p>' +
      '<h1>Generic Fuel System Block Diagram</h1>' +
      '<div class="subhead-row">' +
      '<h2 class="fd-process-title">Fuel system flow – Start process</h2>' +
      '<div class="toggle">' +
      '<button type="button" class="fd-btn-start active">Start process</button>' +
      '<button type="button" class="fd-btn-shutdown">Shutdown process</button>' +
      '</div>' +
      '</div>' +

      '<svg viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">' +

      '<path id="p1" class="pipe" d="M145,248 L172,248"></path>' +
      '<path id="p2" class="pipe" d="M305,248 L322,248"></path>' +
      '<path id="p3" class="pipe" d="M442,248 L458,248"></path>' +
      '<path id="p4" class="pipe" d="M595,248 L612,248"></path>' +
      '<path id="p5" class="pipe" d="M724,275 L724,337"></path>' +
      '<path id="p6" class="pipe" d="M724,390 L724,412"></path>' +
      '<path id="p7" class="pipe thin" d="M836,363 L872,363"></path>' +
      '<path id="p8" class="pipe" d="M724,465 L724,502"></path>' +
      '<path id="p9" class="pipe" d="M724,555 L724,570"></path>' +
      '<path id="p10" class="pipe" d="M724,623 L724,638"></path>' +

      '<path id="d1" class="pipe drain" d="M612,438 L548,438"></path>' +
      '<path id="d2" class="pipe drain" d="M476,465 L476,502"></path>' +
      '<path id="d3" class="pipe drain" d="M476,555 L476,570"></path>' +

      '<g class="box" id="lpsov" data-comp="lpsov">' +
      '<circle cx="100" cy="248" r="45"></circle>' +
      '<text x="100" y="243" text-anchor="middle" class="title-t">LP SOV</text>' +
      '<text class="valve-state" x="100" y="260" text-anchor="middle">OPEN</text>' +
      '</g>' +

      '<g class="box" data-comp="lppump"><rect x="172" y="222" width="133" height="53" rx="6"></rect>' +
      '<text x="238" y="253" text-anchor="middle" class="title-t">LP pump</text></g>' +

      '<g class="box" data-comp="fohe"><rect x="322" y="222" width="120" height="53" rx="6"></rect>' +
      '<text x="382" y="253" text-anchor="middle" class="title-t">FOHE</text></g>' +

      '<g class="box" data-comp="lpfilter"><rect x="458" y="222" width="137" height="53" rx="6"></rect>' +
      '<text x="526" y="253" text-anchor="middle" class="title-t">LP filter</text></g>' +

      '<g class="box" data-comp="hppump"><rect x="612" y="222" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="253" text-anchor="middle" class="title-t">HP pump</text></g>' +

      '<rect class="dashed-container" x="598" y="305" width="258" height="178" rx="6"></rect>' +
      '<text class="hmu-label" x="608" y="322">HMU</text>' +

      '<g class="box" data-comp="meteringvalve"><rect x="612" y="337" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="359" text-anchor="middle" class="title-t">Metering valve</text>' +
      '<text x="724" y="375" text-anchor="middle" class="plain-t">meters fuel flow</text></g>' +

      '<g class="box" id="hpsov" data-comp="hpsov"><rect x="612" y="412" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="434" text-anchor="middle" class="title-t">HP SOV</text>' +
      '<text class="valve-state" x="724" y="452" text-anchor="middle">OPEN</text></g>' +

      '<g class="box" data-comp="vsv"><rect x="872" y="337" width="100" height="53" rx="6"></rect>' +
      '<text x="922" y="368" text-anchor="middle" class="title-t">VSV</text></g>' +

      '<g class="box" id="drainvv" data-comp="drainvv"><rect x="405" y="412" width="143" height="53" rx="6"></rect>' +
      '<text x="476" y="434" text-anchor="middle" class="title-t">Drain V/V</text>' +
      '<text class="valve-state" x="476" y="452" text-anchor="middle">CLOSED</text></g>' +

      '<g class="box" data-comp="draincollector"><rect x="405" y="502" width="143" height="53" rx="6"></rect>' +
      '<text x="476" y="533" text-anchor="middle" class="title-t">Drain collector</text></g>' +

      '<g class="box" data-comp="drainmast"><rect x="405" y="570" width="143" height="53" rx="6"></rect>' +
      '<text x="476" y="601" text-anchor="middle" class="title-t">Drain mast</text></g>' +

      '<g class="box" data-comp="fftransmitter"><rect x="612" y="502" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="533" text-anchor="middle" class="title-t">FF transmitter</text></g>' +

      '<g class="box" data-comp="fuelmanifold"><rect x="612" y="570" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="601" text-anchor="middle" class="title-t">Fuel manifold</text></g>' +

      '<g class="box" data-comp="fuelnozzles"><rect x="612" y="638" width="224" height="53" rx="6"></rect>' +
      '<text x="724" y="669" text-anchor="middle" class="title-t">Fuel nozzles</text></g>' +

      '</svg>' +

      '<p class="caption fd-caption"></p>' +
      '<div class="tooltip fd-tooltip"></div>' +
      '</div>';

    var root = container.querySelector('.fuel-diagram');
    var btnStart = root.querySelector('.fd-btn-start');
    var btnShutdown = root.querySelector('.fd-btn-shutdown');
    var processTitle = root.querySelector('.fd-process-title');
    var captionText = root.querySelector('.fd-caption');
    var tooltip = root.querySelector('.fd-tooltip');

    var lpsov = root.querySelector('#lpsov');
    var hpsov = root.querySelector('#hpsov');
    var drainvv = root.querySelector('#drainvv');
    var lpsovLabel = lpsov.querySelector('.valve-state');
    var hpsovLabel = hpsov.querySelector('.valve-state');
    var drainvvLabel = drainvv.querySelector('.valve-state');

    var mainPipeIds = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
    var drainPipeIds = ['d1', 'd2', 'd3'];

    function showTip(evt, key) {
      tooltip.innerHTML = '<strong>' + titles[key] + '</strong>' + descriptions[key];
      tooltip.style.display = 'block';
      positionTip(evt);
    }
    function positionTip(evt) {
      var rect = root.getBoundingClientRect();
      var x = evt.clientX - rect.left + 18;
      var y = evt.clientY - rect.top + 18;
      var maxX = rect.width - 280;
      if (x > maxX) x = evt.clientX - rect.left - 278;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    }
    function hideTip() {
      tooltip.style.display = 'none';
    }

    root.querySelectorAll('.box').forEach(function (box) {
      var key = box.getAttribute('data-comp');
      box.addEventListener('mouseenter', function (evt) { showTip(evt, key); });
      box.addEventListener('mousemove', positionTip);
      box.addEventListener('mouseleave', hideTip);
    });

    function setBoxColor(el, color) {
      var shape = el.querySelector('rect, circle');
      shape.setAttribute('stroke', color);
      shape.setAttribute('stroke-width', 2);
    }

    function setState(state) {
      var green = '#4c9a2a';
      var red = '#c0392b';
      var gray = '#b9b8b2';

      if (state === 'start') {
        btnStart.classList.add('active');
        btnShutdown.classList.remove('active');
        processTitle.textContent = 'Fuel system flow – Start process';

        setBoxColor(lpsov, green);
        lpsovLabel.textContent = 'OPEN';
        lpsovLabel.setAttribute('fill', green);
        setBoxColor(hpsov, green);
        hpsovLabel.textContent = 'OPEN';
        hpsovLabel.setAttribute('fill', green);
        setBoxColor(drainvv, red);
        drainvvLabel.textContent = 'CLOSED';
        drainvvLabel.setAttribute('fill', red);

        mainPipeIds.forEach(function (id) {
          var p = root.querySelector('#' + id);
          p.setAttribute('stroke', green);
          p.style.opacity = 1;
          p.classList.add('flowing');
        });
        drainPipeIds.forEach(function (id) {
          var p = root.querySelector('#' + id);
          p.setAttribute('stroke', gray);
          p.style.opacity = 0.3;
          p.classList.remove('flowing');
        });

        captionText.textContent = 'LP and HP shutoff valves open. Fuel flows from the tank through the LP pump, FOHE, LP filter and HP pump into the HMU, then through the metering valve, HP SOV, FF transmitter and manifold to the nozzles. The drain valve stays closed.';
      } else {
        btnStart.classList.remove('active');
        btnShutdown.classList.add('active');
        processTitle.textContent = 'Fuel system flow – Shutdown process';

        setBoxColor(lpsov, red);
        lpsovLabel.textContent = 'CLOSED';
        lpsovLabel.setAttribute('fill', red);
        setBoxColor(hpsov, red);
        hpsovLabel.textContent = 'CLOSED';
        hpsovLabel.setAttribute('fill', red);
        setBoxColor(drainvv, green);
        drainvvLabel.textContent = 'OPEN';
        drainvvLabel.setAttribute('fill', green);

        mainPipeIds.forEach(function (id) {
          var p = root.querySelector('#' + id);
          p.setAttribute('stroke', gray);
          p.style.opacity = 0.3;
          p.classList.remove('flowing');
        });
        drainPipeIds.forEach(function (id) {
          var p = root.querySelector('#' + id);
          p.setAttribute('stroke', red);
          p.style.opacity = 1;
          p.classList.add('flowing');
        });

        captionText.textContent = 'LP and HP shutoff valves close, cutting fuel supply to the nozzles. The drain valve opens so trapped fuel in the manifold bleeds off through the drain collector to the drain mast instead of coking in the lines.';
      }
    }

    btnStart.addEventListener('click', function () { setState('start'); });
    btnShutdown.addEventListener('click', function () { setState('shutdown'); });

    setState('start');
  }

  window.TM.registerTool('fuel-system-overview', { mount: mount });
})();
