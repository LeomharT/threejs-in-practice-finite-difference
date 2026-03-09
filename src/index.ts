import { Colors } from "@blueprintjs/colors";
import {
  AxesHelper,
  Color,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderChunk,
  ShaderMaterial,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls, TrackballControls } from "three/examples/jsm/Addons.js";
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
camera.position.set(5, 5, 5);
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

/**
 * World
 */

const uniforms = {};

// Plane
const floorGeometry = new PlaneGeometry(10, 10, 32, 32);
const floorMaterial = new MeshStandardMaterial({});
const floor = new Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Wobble sphere
const sphereGeometry = new SphereGeometry(1, 32, 32);
const sphereMaterial = new ShaderMaterial({
  vertexShader: wobbleVertexShader,
  fragmentShader: wobbleFragmentShader,
  wireframe: true,
});
const wobbleSphere = new Mesh(sphereGeometry, sphereMaterial);
wobbleSphere.castShadow = true;
wobbleSphere.position.y = 2.5;
scene.add(wobbleSphere);

// Monkey

// Lights
const directionalLight = new DirectionalLight("#ffffff", 2.5);
directionalLight.position.set(3, 5, 0);
directionalLight.castShadow = true;
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

const f_sphere = pane.addFolder({ title: "🔵 Wobble Sphere" });

/**
 * Events
 */

function render() {
  // Update
  controls.update();
  controls2.update();
  // Render
  renderer.render(scene, camera);
  // Animation
  requestAnimationFrame(render);
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
