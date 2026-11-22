const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");

function bindParallax(scene, stage) {
  let start = 0;
  let travel = 0;
  let frame = 0;
  let previous = -1;

  function update() {
    frame = 0;
    const distance = motionPreference.matches ? 0 : Math.min(travel, Math.max(0, window.scrollY - start));
    const progress = distance / travel;
    if (progress === previous) return;
    previous = progress;

    scene.style.setProperty("--type-y", (distance * 0.26).toFixed(2) + "px");
    scene.style.setProperty("--object-y", (-distance * 0.13).toFixed(2) + "px");
    scene.style.setProperty("--stage-opacity", (1 - progress * 0.16).toFixed(3));
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  function measure() {
    start = scene.getBoundingClientRect().top + window.scrollY;
    travel = Math.max(1, Math.min(stage.clientHeight * 0.8, innerWidth < 720 ? 220 : 430));
    previous = -1;
    schedule();
  }

  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", measure);
  motionPreference.addEventListener("change", schedule);
  new ResizeObserver(measure).observe(scene);
  measure();
}

const screenPaper = "#101211";
const screenWidth = 500;
const screenHeight = 320;

function ridgeHeight(x, z, phase) {
  // Offset peaks cast their own silhouettes as the survey sweeps across the range.
  const ridge = Math.abs(x + 0.38 - z * 0.95 + 0.10 * Math.sin(z * 9 + phase));
  const shoulder = Math.abs(x - 0.29 + z * 0.35 + 0.07 * Math.cos(z * 10));
  const peak = Math.max(0, 1 - ridge * 2.35) * Math.exp(-((z - 0.39) ** 2) * 16);
  const spur = Math.max(0, 1 - shoulder * 3.5) * Math.exp(-((z - 0.55) ** 2) * 18);
  const detail = 0.82 + 0.13 * Math.sin(22 * x + 9 * z + phase) +
    0.08 * Math.sin(39 * x - 8 * z) + 0.03 * Math.cos(65 * x + 19 * z);

  return Math.max(peak, spur * 0.78) * detail +
    Math.sin(x * 4 - z * 7 + phase) ** 2 * 0.055 * (1 - x * x);
}

function drawTerrain(context, phase) {
  const rows = 38;
  const samples = 100;

  // A filled slice occludes the one behind it, just as a plotting pen would
  // skip the hidden contours of nearer ground.
  for (let row = 0; row <= rows; row++) {
    const z = row / rows;
    const baseline = 150 + z * 132;
    const span = 161 + z * 57;
    const center = 264 - z * 26;
    const contour = new Path2D();
    for (let sample = 0; sample <= samples; sample++) {
      const x = sample / samples * 2 - 1;
      const pointX = center + x * span;
      const pointY = baseline + x * (12 - z * 7) - ridgeHeight(x, z, phase) * 140;
      if (sample === 0) contour.moveTo(pointX, pointY);
      else contour.lineTo(pointX, pointY);
    }

    const surface = new Path2D(contour);
    surface.lineTo(center + span, screenHeight);
    surface.lineTo(center - span, screenHeight);
    surface.closePath();
    context.fillStyle = screenPaper;
    context.fill(surface);
    const shade = Math.round(180 + z * 64);
    context.strokeStyle = 'rgb(' + shade + ' ' + shade + ' ' + shade + ')';
    context.lineWidth = 1.45;
    context.stroke(contour);
  }
}

function drawWaveform(context, phase) {
  // Phase-shifted oscilloscope traces make a single twisting ribbon.
  for (let trace = 0; trace < 32; trace++) {
    const offset = trace / 31;
    context.beginPath();
    for (let step = 0; step <= 230; step++) {
      const x = step / 230;
      const t = x * Math.PI * 2;
      const envelope = Math.sin(Math.PI * x) ** 1.3;
      const wave = Math.sin(t * 2.35 - phase + offset * 2.15) * 0.68 +
        Math.sin(t * 4.25 + phase * 0.7 - offset * 2) * 0.32;
      const y = 162 + (wave * 103 + offset * 39 - 20) * envelope;
      if (step === 0) context.moveTo(28, y);
      else context.lineTo(28 + x * 444, y);
    }
    context.lineWidth = trace % 4 === 0 ? 1.7 : 1.15;
    context.strokeStyle = 'rgba(240,241,237,' + (0.46 + offset * 0.48) + ')';
    context.stroke();
  }
}

function drawRegistration(context) {
  context.beginPath();
  for (const x of [27, 473]) {
    for (const y of [29, 292]) {
      context.moveTo(x - 4, y);
      context.lineTo(x + 4, y);
      context.moveTo(x, y - 4);
      context.lineTo(x, y + 4);
    }
  }
  context.lineWidth = 1;
  context.strokeStyle = "#757973";
  context.stroke();
}

function bindMonitor(canvas, button, caption) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastDraw = 0;
  let elapsed = 0;
  let visible = false;
  let waveform = false;

  function draw() {
    if (!width || !height) return;
    context.setTransform(canvas.width / screenWidth, 0, 0, canvas.height / screenHeight, 0, 0);
    context.fillStyle = screenPaper;
    context.fillRect(0, 0, screenWidth, screenHeight);
    const phase = elapsed * 0.00035;
    if (waveform) drawWaveform(context, phase);
    else drawTerrain(context, phase);
    drawRegistration(context);
  }

  function animate(time) {
    frame = 0;
    if (!lastDraw || time - lastDraw >= 1000 / 24) {
      if (lastDraw) elapsed += Math.min(time - lastDraw, 80);
      lastDraw = time;
      draw();
    }
    // Let the sweep settle into a static print. Changing signal replays it.
    if (elapsed < 4600) frame = requestAnimationFrame(animate);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
    if (!visible || document.hidden) return;
    draw();
    if (!motionPreference.matches && elapsed < 4600) frame = requestAnimationFrame(animate);
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    draw();
  }

  if (button) {
    button.hidden = false;
    button.addEventListener("click", () => {
      waveform = !waveform;
      button.setAttribute("aria-pressed", String(waveform));
      if (caption) caption.textContent = waveform ? "Waveform" : "Terrain";
      elapsed = 0;
      sync();
    });
  }
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);
  new ResizeObserver(resize).observe(canvas);
  motionPreference.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  resize();
}

export function setupMotion() {
  const scene = document.querySelector("[data-hero-scene]");
  const stage = scene?.querySelector("[data-hero-stage]");
  if (stage) bindParallax(scene, stage);

  const canvas = document.querySelector("[data-monitor-screen]");
  if (canvas) bindMonitor(canvas, document.querySelector("[data-signal]"), document.querySelector("[data-signal-name]"));
}
