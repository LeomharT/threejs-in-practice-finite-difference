import { Colors } from "@blueprintjs/colors";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import {
  AxesHelper,
  Color,
  DirectionalLight,
  IcosahedronGeometry,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  RGBADepthPacking,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  Timer,
  Uniform,
  Vector3,
  WebGLRenderer,
} from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Pane } from "tweakpane";
import simplex4DNoise from "./shader/includes/simplex4DNoise.glsl?raw";
import wobbleFragmentShader from "./shader/wobble/fragment.glsl?raw";
import wobbleVertexShader from "./shader/wobble/vertex.glsl?raw";

(ShaderChunk as any)["simplex4DNoise"] = simplex4DNoise;

/**
 * Variables
 */

const size = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: Math.min(2, window.devicePixelRatio),
};

const el = document.querySelector("#root");

const background = new Color(Colors.BLACK);

/**
 * Core
 */

const renderer = new WebGLRenderer({
  alpha: true,
  antialias: true,
});
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(size.pixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFShadowMap;
el?.append(renderer.domElement);

const scene = new Scene();
scene.background = background;

const camera = new PerspectiveCamera(75, size.width / size.height, 0.1, 1000);
camera.position.set(7, 7, 7);
camera.lookAt(scene.position);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableRotate = true;
controls.enablePan = false;
controls.enableZoom = false;

const controls2 = new TrackballControls(camera, renderer.domElement);
controls2.enabled = true;
controls2.noPan = true;
controls2.noRotate = true;
controls2.noZoom = false;

const timer = new Timer();

/**
 * World
 */

const uniforms = {
  uTime: new Uniform(0),

  uSunDirection: new Uniform(new Vector3()),

  uWobbleFrequency: new Uniform(0.5),
  uWobbleTimeScale: new Uniform(0.4),
  uWobbleIntensity: new Uniform(0.3),

  uWarpFrequency: new Uniform(0.38),
  uWarpTimeScale: new Uniform(0.12),
  uWarpIntensity: new Uniform(1.7),

  uColorA: new Uniform(new Color("#0000ff")),
  uColorB: new Uniform(new Color("#ff0000")),
};

// Plane
const floorGeometry = new PlaneGeometry(30, 30, 32, 32);
const floorMaterial = new MeshStandardMaterial({});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Wobble sphere
let sphereGeometry = new IcosahedronGeometry(2.5, 50);
sphereGeometry = mergeVertices(sphereGeometry) as typeof sphereGeometry;
sphereGeometry.computeTangents();
console.log(sphereGeometry);

const sphereDepthMaterial = new CustomShaderMaterial({
  baseMaterial: MeshDepthMaterial,
  vertexShader: wobbleVertexShader,
  fragmentShader: wobbleFragmentShader,
  uniforms,
  depthPacking: RGBADepthPacking,
});
sphereDepthMaterial.defines = {
  IS_DEPTH_MATERIAL: true,
};

const sphereMaterial = new ShaderMaterial({
  vertexShader: wobbleVertexShader,
  fragmentShader: wobbleFragmentShader,
  wireframe: false,
  uniforms,
});
const wobbleSphere = new Mesh(sphereGeometry, sphereMaterial);
wobbleSphere.castShadow = true;
wobbleSphere.position.y = 4.0;
wobbleSphere.customDepthMaterial = sphereDepthMaterial;
scene.add(wobbleSphere);

// Monkey

// Lights
const directionalLight = new DirectionalLight("#ffffff", 2.5);
directionalLight.position.set(3, 4, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(256, 256);
uniforms.uSunDirection.value.copy(
  directionalLight.position.clone().normalize(),
);
scene.add(directionalLight);

/**
 * Helper
 */

const axesHelper = new AxesHelper(3);
scene.add(axesHelper);

/**
 * Pane
 */

const pane = new Pane({ title: "Debug Params" });
pane.element!.parentElement!.style.width = "380px";
pane.registerPlugin(EssentialsPlugin);

// Add a FPS graph
const fpsGraph: any = pane.addBlade({
  view: "fpsgraph",
  label: undefined,
  rows: 3,
});

const f_sphere = pane.addFolder({ title: "🔵 Wobble Sphere" });
f_sphere.addBinding(uniforms.uWobbleFrequency, "value", {
  label: "WobbleFrequency",
  step: 0.001,
  min: 0,
  max: 1.0,
});
f_sphere.addBinding(uniforms.uWobbleTimeScale, "value", {
  label: "WobbleTimeScale",
  step: 0.001,
  min: 0,
  max: 1.0,
});
f_sphere.addBinding(uniforms.uWobbleIntensity, "value", {
  label: "WobbleIntensity",
  step: 0.001,
  min: 0,
  max: 1.0,
});
f_sphere.addBinding(uniforms.uWarpFrequency, "value", {
  label: "WarpFrequency",
  step: 0.001,
  min: 0,
  max: 1.0,
});
f_sphere.addBinding(uniforms.uWarpTimeScale, "value", {
  label: "WarpTimeScale",
  step: 0.001,
  min: 0,
  max: 1.0,
});
f_sphere.addBinding(uniforms.uWarpIntensity, "value", {
  label: "WarpIntensity",
  step: 0.001,
  min: 0,
  max: 1.0,
});

/**
 * Events
 */

function render() {
  fpsGraph.begin();
  // Time
  const elapsed = timer.getElapsed();
  // Update
  uniforms.uTime.value = elapsed;
  timer.update();
  controls.update();
  controls2.update();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
  fpsGraph.end();
}
render();

function resize() {
  size.width = window.innerWidth;
  size.height = window.innerHeight;

  renderer.setSize(size.width, size.height);

  camera.aspect = size.width / size.height;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
