// Presenter-styring (fx Logitech R400).
// En presenter opfører sig som et tastatur, så vi fanger dens taster globalt,
// så de virker uanset hvilket vindue der har fokus.

const { globalShortcut } = require("electron");

// Hvor længe (ms) samme tast ignoreres efter et tryk.
// Beskytter mod tastgentagelse når knappen holdes nede, og mod dobbelttryk.
const DEBOUNCE_MS = 400;

const VALID_ACTIONS = [
  "NEXT", "SKIP", "START_TOGGLE", "SPLIT",
  "LAST_500", "STOP_ALL", "NONE"
];

let registeredKeys = [];
const lastPress = {};

function unregisterPresenter() {
  registeredKeys.forEach((key) => {
    try { globalShortcut.unregister(key); } catch {}
  });
  registeredKeys = [];
}

// config: { enabled, navKeys, blankKey, blankAction }
// Frem- og tilbage-knappen gør det samme: går videre til næste punkt (NEXT).
// navKeys: "PAGE" (Page Down/Up) eller "ARROWS" (højre/venstre pil)
// onAction(action, key) kaldes ved hvert gyldigt tryk.
// Returnerer { enabled, registered: [...], failed: [...] }
function configurePresenter(config, onAction) {
  unregisterPresenter();

  const result = { enabled: !!config.enabled, registered: [], failed: [] };
  if (!config.enabled) return result;

  const arrows = config.navKeys === "ARROWS";
  const mapping = {
    [arrows ? "Right" : "PageDown"]: "NEXT",
    [arrows ? "Left" : "PageUp"]: "NEXT"
  };

  if (config.blankKey && config.blankKey !== "NONE") {
    mapping[config.blankKey] = config.blankAction;
  }

  Object.entries(mapping).forEach(([key, action]) => {
    if (!action || action === "NONE" || !VALID_ACTIONS.includes(action)) return;

    let ok = false;
    try {
      ok = globalShortcut.register(key, () => {
        const now = Date.now();
        if (lastPress[key] && now - lastPress[key] < DEBOUNCE_MS) return;
        lastPress[key] = now;
        onAction(action, key);
      });
    } catch (err) {
      console.warn("Presenter: kunne ikke registrere", key, err.message);
    }

    if (ok) {
      registeredKeys.push(key);
      result.registered.push(key);
    } else {
      result.failed.push(key);
    }
  });

  console.log("Presenter:", result);
  return result;
}

module.exports = { configurePresenter, unregisterPresenter };
