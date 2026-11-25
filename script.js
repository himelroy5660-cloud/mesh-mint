
import * as THREE from "three";

import { GLTFExporter } from
"https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/exporters/GLTFExporter.js";

import { OrbitControls } from
"https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js";

// HTML Elements
const preview = document.getElementById("preview");
const codeEditor = document.getElementById("code");
const runBtn = document.getElementById("runBtn");
const exportBtn = document.getElementById("exportBtn");
const exportGltfBtn = document.getElementById("exportGltfBtn");
const status = document.getElementById("status");

// Create Scene
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x090b10);

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    preview.clientWidth / preview.clientHeight,
    0.1,
    1000
);

camera.position.set(4, 3, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    preview.clientWidth,
    preview.clientHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

preview.appendChild(renderer.domElement);

// Interactive 3D Controls
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;

controls.target.set(0, 0, 0);
controls.update();

// Default Test Code
codeEditor.value = `// Create a cube

const geometry = new THREE.BoxGeometry(2, 2, 2);

const material = new THREE.MeshStandardMaterial({
    color: 0x00aaff,
    roughness: 0.5
});

const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

// Lighting

const light = new THREE.DirectionalLight(0xffffff, 3);

light.position.set(5, 5, 5);

scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambient);`;

// Run JavaScript Code
function runCode() {

    scene = new THREE.Scene();

    scene.background = new THREE.Color(0x090b10);

    try {

        const execute = new Function(
            "THREE",
            "scene",
            "camera",
            "renderer",
            codeEditor.value
        );

        execute(
            THREE,
            scene,
            camera,
            renderer
        );

        status.textContent = "Model generated successfully!";

        console.log("Model generated!");

    } catch (error) {

        console.error(error);

        status.textContent = "Error: " + error.message;

        alert("JavaScript Error: " + error.message);

    }

}

// Run Button
runBtn.addEventListener("click", runCode);

// Export GLB / GLTF
function exportModel(binary) {

    if (scene.children.length === 0) {

        alert("Please generate a model first!");

        return;

    }

    status.textContent = "Exporting model...";

    const exporter = new GLTFExporter();

    exporter.parse(

        scene,

        function(result) {

            let blob;
            let filename;

            if (binary) {

                blob = new Blob(
                    [result],
                    {
                        type: "model/gltf-binary"
                    }
                );

                filename = "my-model.glb";

            } else {

                const json = JSON.stringify(
                    result,
                    null,
                    2
                );

                blob = new Blob(
                    [json],
                    {
                        type: "model/gltf+json"
                    }
                );

                filename = "my-model.gltf";

            }

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = filename;

            document.body.appendChild(link);

            link.click();

            link.remove();

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 2000);

            status.textContent = "Export successful!";

        },

        function(error) {

            console.error(error);

            status.textContent = "Export failed!";

            alert("Export failed: " + error.message);

        },

        {
            binary: binary
        }

    );

}

// GLB Export
exportBtn.addEventListener("click", function() {
    exportModel(true);
});

// GLTF Export
exportGltfBtn.addEventListener("click", function() {
    exportModel(false);
});

// Resize Preview
window.addEventListener("resize", function() {

    const width = preview.clientWidth;
    const height = preview.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

});

// Animation
function animate() {

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene, camera);

}

animate();

// Generate Initial Model
runCode();
