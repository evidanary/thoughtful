import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAllContacts } from "../api/contacts";

// Babylon is loaded from CDN at runtime so the backend/build stays untouched.
const SCRIPTS = [
  "https://cdn.babylonjs.com/babylon.js",
  "https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js",
  "https://cdn.babylonjs.com/gui/babylon.gui.min.js",
];

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const el = document.createElement("script");
    el.src = src;
    el.async = false;
    el.onload = () => {
      el.dataset.loaded = "true";
      resolve();
    };
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });

const loadBabylon = async () => {
  for (const src of SCRIPTS) {
    await loadScript(src); // order matters: core, then loaders, then GUI
  }
};

// Idempotent randomizer so a contact always lands in the same spot
const getPseudoRandom = (id, salt) => {
  const x = Math.sin(id * 13.73 + salt * 51.38) * 10000;
  return x - Math.floor(x);
};

const daysSince = (dateStr) => {
  if (!dateStr) return 365;
  const then = new Date(dateStr.replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return 365;
  return Math.max(0, (Date.now() - then) / 86400000);
};

const truncate = (text, max) =>
  text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;

// Tooltip body for a contact — name, company, email, tags, notes
const buildTooltip = (contact) => {
  const lines = [contact.name || "Unnamed contact"];
  if (contact.company) lines.push(contact.company);
  if (contact.email) lines.push(contact.email);
  if (contact.tags && contact.tags.length)
    lines.push("Tags: " + contact.tags.join(", "));
  const stale = Math.round(daysSince(contact.last_activity_date));
  lines.push(`Last activity: ${stale}d ago`);
  if (contact.note_content) {
    const note = contact.note_content.replace(/\s+/g, " ").trim();
    lines.push("Note: " + truncate(note, 160));
  } else {
    lines.push("Note: (none)");
  }
  return lines;
};

// Compact always-on label pinned above a character
const buildLabel = (contact) => {
  const lines = [truncate(contact.name || "Unnamed contact", 28)];
  if (contact.company) lines.push(truncate(contact.company, 28));
  lines.push(`${Math.round(daysSince(contact.last_activity_date))}d ago`);
  return lines;
};

// Wrap long lines so the GUI rectangle can be sized predictably
const wrapLines = (lines, width) => {
  const out = [];
  lines.forEach((line) => {
    let current = "";
    line.split(" ").forEach((word) => {
      if ((current + " " + word).trim().length > width) {
        if (current) out.push(current);
        current = word;
      } else {
        current = (current + " " + word).trim();
      }
    });
    out.push(current);
  });
  return out;
};

const assetConfigs = [
  {
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMan/glTF-Binary/",
    file: "CesiumMan.glb",
    baseScale: 2.5,
  },
  {
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Fox/glTF-Binary/",
    file: "Fox.glb",
    baseScale: 0.03, // Fox is natively huge, needs smaller base scale
  },
];

const loadAssetContainer = (BABYLON, config, scene) => {
  // Babylon 8 renamed this; keep the old path for older CDN builds
  if (typeof BABYLON.LoadAssetContainerAsync === "function") {
    return BABYLON.LoadAssetContainerAsync(config.url + config.file, scene);
  }
  return BABYLON.SceneLoader.LoadAssetContainerAsync(
    config.url,
    config.file,
    scene
  );
};

export const createScene = async function (
  engine,
  canvas,
  contacts,
  tooltipState = { enabled: true }
) {
  const BABYLON = window.BABYLON;
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    50,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 1.2;

  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 70, height: 70 },
    scene
  );
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new BABYLON.Color3(0.15, 0.2, 0.15);
  ground.material = groundMat;

  const highlightLayer = new BABYLON.HighlightLayer("hl1", scene);

  const centerNode = BABYLON.MeshBuilder.CreateCylinder(
    "center",
    { height: 3, diameter: 2 },
    scene
  );
  centerNode.position.y = 1.5;
  const centerMat = new BABYLON.StandardMaterial("centerMat", scene);
  centerMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  centerNode.material = centerMat;

  // UI Setup
  const advancedTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  const tooltip = new BABYLON.GUI.Rectangle("tooltip");
  tooltip.width = "300px";
  tooltip.height = "40px";
  tooltip.color = "#FFB6C1";
  tooltip.thickness = 2;
  tooltip.cornerRadius = 6;
  tooltip.background = "#1a1a1a";
  tooltip.alpha = 0.95;
  tooltip.isVisible = false;
  tooltip.isPointerBlocker = false;
  tooltip.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tooltip.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  advancedTexture.addControl(tooltip);

  const tooltipText = new BABYLON.GUI.TextBlock();
  tooltipText.text = "";
  tooltipText.color = "white";
  tooltipText.fontSize = 13;
  tooltipText.lineSpacing = 3;
  tooltipText.paddingLeft = "10px";
  tooltipText.paddingRight = "10px";
  tooltipText.paddingTop = "8px";
  tooltipText.paddingBottom = "8px";
  tooltipText.textHorizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  tooltipText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
  tooltip.addControl(tooltipText);

  // Always-on labels, one per contact, toggled by the checkbox / 'T'
  const persistentLabels = [];

  // Load all containers in parallel
  const containers = await Promise.all(
    assetConfigs.map((config) => loadAssetContainer(BABYLON, config, scene))
  );

  contacts.forEach((contact, i) => {
    const seed = contact.id || i + 1;

    // Distance from the center = how stale the relationship is
    const stale = daysSince(contact.last_activity_date);
    const staleness = Math.min(1, stale / 180);
    const distance = 5 + staleness * 25;
    const angle = getPseudoRandom(seed, 2) * Math.PI * 2;

    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    // Idempotent model selection
    const modelIndex = Math.floor(
      getPseudoRandom(seed, 8) * containers.length
    );
    const selectedContainer = containers[modelIndex];
    const baseScale = assetConfigs[modelIndex].baseScale;

    const instance = selectedContainer.instantiateModelsToScene(
      (name) => name,
      true
    );
    const rootMesh = instance.rootNodes[0];

    const scaleMultiplier = 0.8 + getPseudoRandom(seed, 3) * 0.4;
    const finalScale = baseScale * scaleMultiplier;

    rootMesh.scaling = new BABYLON.Vector3(finalScale, finalScale, finalScale);
    rootMesh.position = new BABYLON.Vector3(x, 0, z);
    rootMesh.lookAt(BABYLON.Vector3.Zero());

    const needsAttention = staleness > 0.7;

    if (instance.animationGroups && instance.animationGroups.length > 0) {
      instance.animationGroups[0].play(true);
    }

    const r = 0.3 + getPseudoRandom(seed, 5) * 0.7;
    const g = 0.3 + getPseudoRandom(seed, 6) * 0.7;
    const b = 0.3 + getPseudoRandom(seed, 7) * 0.7;
    const tintColor = new BABYLON.Color3(r, g, b);

    const tooltipLines = buildTooltip(contact);

    rootMesh.getChildMeshes().forEach((m) => {
      m.metadata = { contactId: contact.id, tooltipLines };

      if (m.material && m.material.albedoColor) {
        m.material.albedoColor = tintColor;
      } else if (m.material && m.material.diffuseColor) {
        m.material.diffuseColor = tintColor;
      }

      if (needsAttention) {
        highlightLayer.addMesh(m, BABYLON.Color3.Yellow());
      }
    });

    // Invisible anchor so the GUI label tracks the character on screen.
    // (linkWithMesh needs a mesh; the glTF root is a TransformNode.)
    const anchor = BABYLON.MeshBuilder.CreateBox(
      `anchor-${seed}`,
      { size: 0.01 },
      scene
    );
    anchor.position = new BABYLON.Vector3(x, 2.4, z);
    anchor.isVisible = false;
    anchor.isPickable = false;

    const label = new BABYLON.GUI.Rectangle(`label-${seed}`);
    label.adaptWidthToChildren = true;
    label.adaptHeightToChildren = true;
    label.cornerRadius = 4;
    label.thickness = 1;
    label.color = needsAttention ? "#FFD700" : "#FFB6C1";
    label.background = "#1a1a1a";
    label.alpha = 0.88;
    label.isPointerBlocker = false;
    label.isVisible = false;
    advancedTexture.addControl(label);
    label.linkWithMesh(anchor);
    label.linkOffsetY = -30;

    const labelText = new BABYLON.GUI.TextBlock();
    labelText.text = buildLabel(contact).join("\n");
    labelText.color = "white";
    labelText.fontSize = 12;
    labelText.lineSpacing = 2;
    labelText.resizeToFit = true;
    labelText.paddingLeft = "8px";
    labelText.paddingRight = "8px";
    labelText.paddingTop = "5px";
    labelText.paddingBottom = "5px";
    label.addControl(labelText);

    persistentLabels.push(label);
  });

  // Driven by the React checkbox / the 'T' shortcut: shows every label at
  // once instead of waiting for a hover.
  tooltipState.refresh = () => {
    persistentLabels.forEach((l) => {
      l.isVisible = tooltipState.enabled;
    });
  };
  tooltipState.refresh();

  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
      const pickResult = scene.pick(scene.pointerX, scene.pointerY);
      const meta =
        pickResult.hit && pickResult.pickedMesh && pickResult.pickedMesh.metadata;

      if (meta && meta.tooltipLines) {
        const wrapped = wrapLines(meta.tooltipLines, 42);
        tooltip.isVisible = true;
        tooltipText.text = wrapped.join("\n");
        tooltip.heightInPixels = wrapped.length * 16 + 20;

        // Flip the tooltip so it stays inside the canvas near the edges
        const width = 300;
        const left =
          scene.pointerX + 15 + width > engine.getRenderWidth()
            ? scene.pointerX - width - 15
            : scene.pointerX + 15;
        const top =
          scene.pointerY + 15 + tooltip.heightInPixels >
          engine.getRenderHeight()
            ? scene.pointerY - tooltip.heightInPixels - 15
            : scene.pointerY + 15;
        tooltip.leftInPixels = Math.max(0, left);
        tooltip.topInPixels = Math.max(0, top);
      } else {
        tooltip.isVisible = false;
      }
    }
  });

  return scene;
};

const StaminaViz = () => {
  const canvasRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Loading 3D engine…");
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  const [tooltipsEnabled, setTooltipsEnabled] = useState(true);
  const tooltipStateRef = useRef({ enabled: true });

  // Contacts handed over from the list (respects its filters), else fetch all
  const passedContacts = location.state && location.state.contacts;

  useEffect(() => {
    let engine = null;
    let disposed = false;
    let onResize = null;

    const boot = async () => {
      try {
        await loadBabylon();
        if (disposed) return;

        setStatus("Loading contacts…");
        const contacts = passedContacts || (await getAllContacts());
        if (disposed) return;
        setCount(contacts.length);

        setStatus("Building scene…");
        engine = new window.BABYLON.Engine(canvasRef.current, true);
        const scene = await createScene(
          engine,
          canvasRef.current,
          contacts,
          tooltipStateRef.current
        );
        if (disposed) {
          engine.dispose();
          return;
        }

        engine.runRenderLoop(() => scene.render());
        onResize = () => engine.resize();
        window.addEventListener("resize", onResize);
        setStatus(null);
      } catch (err) {
        console.error("StaminaViz failed:", err);
        if (!disposed) setError(err.message || "Failed to build the 3D scene");
      }
    };

    boot();

    return () => {
      disposed = true;
      if (onResize) window.removeEventListener("resize", onResize);
      if (engine) engine.dispose();
    };
  }, [passedContacts]);

  useEffect(() => {
    tooltipStateRef.current.enabled = tooltipsEnabled;
    if (tooltipStateRef.current.refresh) tooltipStateRef.current.refresh();
  }, [tooltipsEnabled]);

  // 't' toggles all tooltips on/off
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // the checkbox keeps focus after a click — don't let that eat the shortcut
      const tag = e.target.tagName;
      if (tag === "TEXTAREA" || (tag === "INPUT" && e.target.type !== "checkbox"))
        return;
      if (e.key.toLowerCase() === "t") {
        e.preventDefault();
        setTooltipsEnabled((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div style={{ position: "relative", height: "calc(100vh - 60px)" }}>
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 2,
          background: "rgba(255,255,255,0.92)",
          border: "1px solid #ddd",
          borderRadius: 6,
          padding: "12px 16px",
          maxWidth: 300,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#4B0082",
            marginBottom: 6,
          }}
        >
          Stamina Viz
        </div>
        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>
          {count} contact{count === 1 ? "" : "s"} in 3D space. Distance from the
          center is days since last activity — a{" "}
          <span style={{ color: "#b58900", fontWeight: 600 }}>yellow glow</span>{" "}
          means the relationship has gone stale. Hover a character for name,
          company, email, tags and notes — or tick the box below to pin a
          label on every contact at once.
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            fontSize: 12,
            color: "#333",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={tooltipsEnabled}
            onChange={(e) => setTooltipsEnabled(e.target.checked)}
            style={{ cursor: "pointer", accentColor: "#4B0082" }}
          />
          Show all labels
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              color: "#888",
              border: "1px solid #ddd",
              borderRadius: 3,
              padding: "1px 5px",
              background: "#f5f5f5",
            }}
          >
            T
          </span>
        </label>

        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: 10,
            padding: "6px 10px",
            fontSize: 12,
            border: "1px solid #4B0082",
            background: "#fff",
            color: "#4B0082",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          ← Back to contacts
        </button>
      </div>

      {(status || error) && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            color: error ? "#c00" : "#4B0082",
            background: "rgba(255,255,255,0.9)",
            padding: "10px 18px",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          {error || status}
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
          touchAction: "none",
        }}
      />
    </div>
  );
};

export default StaminaViz;
