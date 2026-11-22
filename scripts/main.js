import { setupMotion } from "./motion.js";
import { setupInteractions } from "./interactions.js";
import { setupSurfaces } from "./surface-motion.js";

setupMotion();
setupInteractions();
setupSurfaces();

const clock = document.querySelector("[data-local-time]");
const localTime = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi", hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});
function showLocalTime() {
  clock.textContent = localTime.format(new Date());
}
showLocalTime();
setInterval(showLocalTime, 60000);

const shell = document.querySelector(".monitor-shell");
const allowTilt = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
shell.addEventListener("pointermove", event => {
  if (!allowTilt.matches) return;
  const rect = shell.getBoundingClientRect();
  shell.style.setProperty("--tilt-y", ((event.clientX - rect.left) / rect.width * 9 - 4.5) + "deg");
  shell.style.setProperty("--tilt-x", (3 - (event.clientY - rect.top) / rect.height * 6) + "deg");
});
function resetTilt() {
  shell.style.removeProperty("--tilt-x");
  shell.style.removeProperty("--tilt-y");
}
shell.addEventListener("pointerleave", resetTilt);
allowTilt.addEventListener("change", resetTilt);
