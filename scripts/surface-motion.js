const surfaceMotionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const portraitPointer = matchMedia("(hover: hover) and (pointer: fine)");

function setupPointPrint(figure) {
  const image = figure.querySelector("img");
  if (!image) return;
  const mount = image.parentElement;
  const canvas = document.createElement("canvas");
  const base = document.createElement("canvas");
  const sample = document.createElement("canvas");
  const ink = canvas.getContext("2d");
  const plate = base.getContext("2d");
  const sampler = sample.getContext("2d", { willReadFrequently: true });
  if (!ink || !plate || !sampler) return;

  canvas.className = "point-print";
  canvas.id = "profile-point-print";
  canvas.setAttribute("aria-hidden", "true");
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "point-switch";
  toggle.textContent = "Point print";
  toggle.setAttribute("aria-pressed", "false");
  toggle.setAttribute("aria-controls", canvas.id);
  toggle.hidden = true;
  mount.classList.add("point-frame");
  mount.append(canvas, toggle);

  let enabled = false;
  let visible = false;
  let width = 0;
  let height = 0;
  let columns = 0;
  let rows = 0;
  let pitchX = 0;
  let pitchY = 0;
  let dots;
  let pointer = null;
  let frame = 0;
  const paper = "#171717";
  const pigment = "#f6f4ec";

  function prepare() {
    if (!visible || !image.naturalWidth) return;
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    if (!w || !h || (width === w && height === h && dots)) return;
    width = w;
    height = h;
    const pitch = Math.max(2.8, width / 158);
    columns = Math.max(1, Math.round(width / pitch));
    rows = Math.max(1, Math.round(height / pitch));
    pitchX = width / columns;
    pitchY = height / rows;
    sample.width = columns;
    sample.height = rows;

    // Crop the source using the same object-fit and object-position as the photo.
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const fitWidth = image.naturalWidth * cover;
    const fitHeight = image.naturalHeight * cover;
    const position = getComputedStyle(image).objectPosition.split(" ").map(parseFloat);
    const offsetX = (width - fitWidth) * (position[0] / 100);
    const offsetY = (height - fitHeight) * (position[1] / 100);
    sampler.drawImage(image, offsetX / pitchX, offsetY / pitchY, fitWidth / pitchX, fitHeight / pitchY);
    let pixels;
    try {
      pixels = sampler.getImageData(0, 0, columns, rows).data;
    } catch {
      toggle.hidden = true;
      return;
    }

    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = base.width = Math.round(width * ratio);
    canvas.height = base.height = Math.round(height * ratio);
    plate.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    ink.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    plate.fillStyle = paper;
    plate.fillRect(0, 0, width, height);
    plate.fillStyle = pigment;
    dots = new Float32Array(columns * rows);
    for (let i = 0; i < dots.length; i++) {
      const p = i * 4;
      const light = (pixels[p] * .2126 + pixels[p + 1] * .7152 + pixels[p + 2] * .0722) / 255;
      const size = pitch * Math.sqrt(Math.max(0, (light - .04) * 1.15));
      dots[i] = size;
      if (size < .48) continue;
      const col = i % columns;
      const row = Math.floor(i / columns);
      plate.fillRect((col + .5) * pitchX - size / 2, (row + .5) * pitchY - size / 2, size, size);
    }
    toggle.hidden = false;
    if (enabled) renderPrint();
  }

  function renderPrint() {
    frame = 0;
    if (!enabled || !visible || !dots || document.hidden) return;
    ink.drawImage(base, 0, 0, width, height);
    if (!pointer || surfaceMotionPreference.matches || !portraitPointer.matches) return;

    // Only redraw the small patch beneath the pointer. The rest remains a cached print.
    const radius = Math.min(width * .17, 75);
    const left = Math.max(0, Math.floor((pointer.x - radius) / pitchX));
    const right = Math.min(columns, Math.ceil((pointer.x + radius) / pitchX));
    const top = Math.max(0, Math.floor((pointer.y - radius) / pitchY));
    const bottom = Math.min(rows, Math.ceil((pointer.y + radius) / pitchY));
    ink.fillStyle = paper;
    ink.fillRect(left * pitchX, top * pitchY, (right - left) * pitchX, (bottom - top) * pitchY);
    ink.fillStyle = pigment;
    for (let row = top; row < bottom; row++) {
      for (let col = left; col < right; col++) {
        const size = dots[row * columns + col];
        if (size < .48) continue;
        const x = (col + .5) * pitchX;
        const y = (row + .5) * pitchY;
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.hypot(dx, dy);
        const push = Math.max(0, 1 - distance / radius) ** 2 * radius * .23 / Math.max(1, distance);
        ink.fillRect(x + dx * push - size / 2, y + dy * push - size / 2, size, size);
      }
    }
  }

  function schedulePrint() {
    if (!frame && enabled && visible && !document.hidden) frame = requestAnimationFrame(renderPrint);
  }

  toggle.addEventListener("click", () => {
    enabled = !enabled;
    pointer = null;
    toggle.setAttribute("aria-pressed", String(enabled));
    mount.classList.toggle("printing-points", enabled);
    if (enabled) renderPrint();
  });
  mount.addEventListener("pointermove", event => {
    if (!enabled || surfaceMotionPreference.matches || !portraitPointer.matches) return;
    const bounds = mount.getBoundingClientRect();
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    schedulePrint();
  });
  mount.addEventListener("pointerleave", () => {
    pointer = null;
    schedulePrint();
  });
  surfaceMotionPreference.addEventListener("change", () => {
    pointer = null;
    schedulePrint();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    pointer = null;
    if (visible) {
      prepare();
      schedulePrint();
    } else {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }).observe(mount);
  new ResizeObserver(prepare).observe(mount);
  image.addEventListener("load", prepare, { once: true });
}

export function setupSurfaces() {
  const portrait = document.querySelector(".profile-photo");
  if (portrait) setupPointPrint(portrait);
}
