import * as THREE from "three";

import { EffectComposer } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js";

import { RenderPass } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/RenderPass.js";

import { UnrealBloomPass } from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js";


// ============================================================
// LOST NOOK
// CURVA CÓSMICA
// ============================================================


// ============================================================
// PROJETOS
// ============================================================

const defaultProjects = [

    {
        name: "LUNA",
        description:
            "Minha inteligência artificial pessoal."
    },

    {
        name: "LOST NOOK",
        description:
            "Minha central pessoal para projetos e experimentos."
    },

    {
        name: "BLENDER",
        description:
            "Projetos de animação, 3D e renderização."
    },

    {
        name: "ROBLOX",
        description:
            "Projetos, experiências e automações."
    },

    {
        name: "MINECRAFT",
        description:
            "Experimentos envolvendo Minecraft, captura e 3D."
    },

    {
        name: "AUTOMAÇÕES",
        description:
            "Ferramentas criadas para automatizar tarefas."
    },

    {
        name: "IA",
        description:
            "Experimentos com inteligência artificial."
    },

    {
        name: "EXPERIMENTOS",
        description:
            "Ideias que ainda estão tomando forma."
    }

];

const projectSlug = (project) => String(project.slug || project.name || "projeto")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "projeto";

// A Central pode atualizar o catálogo compartilhado neste navegador.
let projects = defaultProjects;
try {
    let response = await fetch("/api/site-data", { cache: "no-store" });
    if (!response.ok) response = await fetch("public-data.json", { cache: "no-store" });
    if (response.ok) {
        const siteData = await response.json();
        if (Array.isArray(siteData.projects)) projects = siteData.projects;
    } else {
        const savedProjects = JSON.parse(localStorage.getItem("lostnook-projects") || "null");
        if (Array.isArray(savedProjects)) projects = savedProjects;
    }
} catch (error) {
    try {
        const savedProjects = JSON.parse(localStorage.getItem("lostnook-projects") || "null");
        if (Array.isArray(savedProjects)) projects = savedProjects;
    } catch (storageError) {
        console.warn("Lost Nook: catálogo inválido; usando projetos padrão.", storageError);
    }
}
projects = projects.filter((project) => project.isPublic !== false);
const curveEmpty = projects.length === 0;
if (curveEmpty) projects = [{ name: "UNIVERSO EM PAUSA", description: "Nenhum projeto público por enquanto." }];


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const CONFIG = {

    turns: 5.2,

    length: 110,

    innerRadius: 7,

    outerRadius: 44,

    cameraScrollSpeed: 0.055,

    scrollSensitivity: 0.8,

    universeLayers: 14,

    universesPerLayer: 360,

    nodeSize: 0.13,

    projectSize: 1.25,

    projectRadialOffset: 8.5,

    projectStart: 0,

    projectEnd: 0.68,

    cameraEndPadding: 0,

    filaments: 24,

    stars: 3000,

    cameraRadiusOffset: 25,

    cameraHeight: 10,

    cameraSideOffset: 2.5,

    cameraPositionSmooth: 0.075,

    cameraTargetSmooth: 0.035,

    lookAhead: 0.012,

    targetHeight: 1.5

};


// ============================================================
// ELEMENTOS HTML
// ============================================================

const container =
    document.getElementById("projects3d");

const projectsSection =
    document.getElementById("projetos");

const projectsInterface =
    document.querySelector(".projects-interface");

const projectNumber =
    document.getElementById("project-number");

const projectName =
    document.getElementById("project-name");

const projectDescription =
    document.getElementById("project-description");

const projectOpenLink = document.getElementById("project-open-link");

let projectButtons =
    document.querySelectorAll(".projects-menu button");

const projectMenu = document.querySelector(".projects-menu");
if (projectMenu) {
    const escapeMenuText = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
    projectMenu.innerHTML = curveEmpty
        ? `<span class="projects-empty-label">NENHUM PROJETO PÚBLICO</span>`
        : projects.map((project, index) =>
        `<button data-project="${index}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeMenuText(project.name)}</button>`
    ).join("");
    projectButtons = document.querySelectorAll(".projects-menu button");
}


// ============================================================
// SEGURANÇA
// ============================================================

if (
    !container ||
    !projectsSection ||
    !projectsInterface
) {

    console.error(
        "Lost Nook: elementos dos projetos não encontrados."
    );

    throw new Error(
        "Elementos dos projetos não encontrados."
    );

}


// ============================================================
// CENA
// ============================================================

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(0x070605);

scene.fog =
    new THREE.FogExp2(
        0x100c09,
        0.00135
    );


// ============================================================
// CÂMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(

        68,

        window.innerWidth /
        window.innerHeight,

        0.1,

        2000

    );


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        alpha: true

    });

renderer.setPixelRatio(

    Math.min(

        window.devicePixelRatio,

        2

    )

);

renderer.setSize(

    window.innerWidth,

    window.innerHeight

);

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure =
    1.0;

container.appendChild(
    renderer.domElement
);


// ============================================================
// BLOOM
// ============================================================

const composer =
    new EffectComposer(
        renderer
    );

const renderPass =
    new RenderPass(
        scene,
        camera
    );

composer.addPass(
    renderPass
);

const bloomPass =
    new UnrealBloomPass(

        new THREE.Vector2(

            window.innerWidth,

            window.innerHeight

        ),

        0.45,

        0.30,

        0.35

    );

composer.addPass(
    bloomPass
);


// ============================================================
// LUZ
// ============================================================

scene.add(

    new THREE.AmbientLight(

        0x9c7657,

        0.35

    )

);


// ============================================================
// GRUPO PRINCIPAL
// ============================================================

const curveGroup =
    new THREE.Group();

scene.add(
    curveGroup
);


// ============================================================
// CORES
// ============================================================

const COLOR_UNIVERSE =
    0xd6a477;

const COLOR_GLOW =
    0xf0c18d;

const COLOR_DARK =
    0x493a30;

const COLOR_PROJECT =
    0xffd9ad;


// ============================================================
// CURVA PRINCIPAL
// ============================================================

function getCurvePoint(

    progress,

    radialOffset = 0,

    verticalOffset = 0

) {

    progress =
        THREE.MathUtils.clamp(

            progress,

            0,

            1

        );


    const angle =
        progress *
        Math.PI *
        2 *
        CONFIG.turns;


    const radius =
        THREE.MathUtils.lerp(

            CONFIG.innerRadius,

            CONFIG.outerRadius,

            progress

        );


    const wave1 =
        Math.sin(

            angle *
            2.4

        ) * 1.4 + Math.sin(angle * 0.5) * 3.2;


    const wave2 =
        Math.sin(

            angle *
            5.7

        ) * 0.7 + Math.sin(angle * 1.7 + 0.6) * 1.1;


    const finalRadius =
        radius +
        wave1 +
        wave2 +
        radialOffset;


    const x =
        Math.cos(angle) *
        finalRadius;


    const z =
        Math.sin(angle) *
        finalRadius;


    const y =
        (
            progress -
            0.5
        ) *
        CONFIG.length + Math.sin(angle * 0.5) * 4.5;


    return new THREE.Vector3(

        x,

        y +
        verticalOffset,

        z

    );

}


// ============================================================
// POSIÇÃO DOS PROJETOS
// ============================================================

function generateProjectProgress() {

    const count =
        projects.length;


    if (count <= 1) {

        return [
            CONFIG.projectStart
        ];

    }


    const start =
        CONFIG.projectStart;

    const end =
        CONFIG.projectEnd;


    const spacing =
        (
            end -
            start
        ) /
        (
            count -
            1
        );


    const result = [];


    for (

        let i = 0;

        i < count;

        i++

    ) {

        result.push(

            start +
            spacing * i

        );

    }


    return result;

}


const projectProgress =
    curveEmpty ? [0, 1] : generateProjectProgress();


// ============================================================
// LIMITES
// ============================================================

const FIRST_PROJECT_PROGRESS =
    projectProgress[0];

const LAST_PROJECT_PROGRESS =
    projectProgress[
        projectProgress.length - 1
    ];


// ============================================================
// FINAL DA EXPLORAÇÃO
// ============================================================

function getProjectEnd() {

    return THREE.MathUtils.clamp(

        LAST_PROJECT_PROGRESS +
        CONFIG.cameraEndPadding,

        0,

        1

    );

}


// ============================================================
// NÚCLEO CENTRAL
// ============================================================

const core =
    new THREE.Mesh(

        new THREE.SphereGeometry(

            7,

            48,

            48

        ),

        new THREE.MeshBasicMaterial({

            color:
                0x010200

        })

    );

curveGroup.add(
    core
);


// ============================================================
// AURA DO NÚCLEO
// ============================================================

for (

    let i = 0;

    i < 6;

    i++

) {

    const aura =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                7 +
                i * 2.4,

                32,

                32

            ),

            new THREE.MeshBasicMaterial({

                color:
                    COLOR_GLOW,

                transparent:
                    true,

                opacity:
                    0.018 -
                    i * 0.002,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending

            })

        );


    curveGroup.add(
        aura
    );

}


// ============================================================
// POEIRA DE UNIVERSOS
// Um único point cloud substitui milhares de meshes separados.
// Mantém a densidade cósmica sem sacrificar a fluidez da câmera.
// ============================================================

const universeCount = CONFIG.universeLayers * CONFIG.universesPerLayer;
const universePositions = new Float32Array(universeCount * 3);
const universeColors = new Float32Array(universeCount * 3);
const universeColorPalette = [
    new THREE.Color(0xf4d5b2),
    new THREE.Color(0xd9a876),
    new THREE.Color(0x9e7180),
    new THREE.Color(0x8793a6)
];

for (let i = 0; i < universeCount; i++) {
    const layer = Math.floor(i / CONFIG.universesPerLayer);
    const step = i % CONFIG.universesPerLayer;
    const progress = step / (CONFIG.universesPerLayer - 1);
    const layerOffset = (layer - (CONFIG.universeLayers - 1) / 2) * 0.72;
    const point = getCurvePoint(
        progress,
        layerOffset + (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 3.4
    );
    point.x += (Math.random() - 0.5) * 1.6;
    point.z += (Math.random() - 0.5) * 1.6;
    universePositions[i * 3] = point.x;
    universePositions[i * 3 + 1] = point.y;
    universePositions[i * 3 + 2] = point.z;

    const tint = universeColorPalette[Math.floor(Math.random() * universeColorPalette.length)];
    const brightness = 0.28 + Math.random() * 0.92;
    universeColors[i * 3] = tint.r * brightness;
    universeColors[i * 3 + 1] = tint.g * brightness;
    universeColors[i * 3 + 2] = tint.b * brightness;
}

const universeGeometry = new THREE.BufferGeometry();
universeGeometry.setAttribute("position", new THREE.BufferAttribute(universePositions, 3));
universeGeometry.setAttribute("color", new THREE.BufferAttribute(universeColors, 3));

const glowCanvas = document.createElement("canvas");
glowCanvas.width = glowCanvas.height = 64;
const glowContext = glowCanvas.getContext("2d");
const glowGradient = glowContext.createRadialGradient(32, 32, 1, 32, 32, 32);
glowGradient.addColorStop(0, "rgba(255,255,255,1)");
glowGradient.addColorStop(0.14, "rgba(255,255,255,.82)");
glowGradient.addColorStop(0.45, "rgba(255,255,255,.2)");
glowGradient.addColorStop(1, "rgba(255,255,255,0)");
glowContext.fillStyle = glowGradient;
glowContext.fillRect(0, 0, 64, 64);

const universeCloud = new THREE.Points(
    universeGeometry,
    new THREE.PointsMaterial({
        size: 0.26,
        map: new THREE.CanvasTexture(glowCanvas),
        vertexColors: true,
        transparent: true,
        opacity: 0.86,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    })
);
curveGroup.add(universeCloud);


// ============================================================
// FILAMENTOS
// ============================================================

const filamentMaterial =
    new THREE.LineBasicMaterial({

        color:
            COLOR_GLOW,

        transparent:
            true,

        opacity:
            0.055,

        blending:
            THREE.AdditiveBlending

    });


for (

    let f = 0;

    f < CONFIG.filaments;

    f++

) {

    const points = [];


    const offset =

        (
            f -
            CONFIG.filaments / 2
        ) * 1.1;


    for (

        let i = 0;

        i <= 220;

        i++

    ) {

        const progress =
            i / 220;


        const point =
            getCurvePoint(

                progress,

                offset,

                Math.sin(

                    progress *
                    Math.PI *
                    8 +
                    f

                ) * 2

            );


        points.push(
            point
        );

    }


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(
                points
            );


    curveGroup.add(

        new THREE.Line(

            geometry,

            filamentMaterial

        )

    );

}


// ============================================================
// GRANDES ANÉIS
// ============================================================

const rings = [];


for (

    let i = 0;

    i < 18;

    i++

) {

    const progress =
        i / 17;


    const center =
        getCurvePoint(

            progress,

            CONFIG.projectRadialOffset

        );


    const radius =
        THREE.MathUtils.lerp(

            8,

            48,

            progress

        );


    const ring =
        new THREE.Mesh(

            new THREE.TorusGeometry(

                radius,

                0.045,

                8,

                128

            ),

            new THREE.MeshBasicMaterial({

                color:
                    COLOR_GLOW,

                transparent:
                    true,

                opacity:
                    0.026,

                blending:
                    THREE.AdditiveBlending

            })

        );


    ring.position.copy(
        center
    );


    ring.rotation.x =
        Math.PI / 2;


    ring.rotation.z =
        Math.sin(
            i * 1.4
        ) * 0.35;


    curveGroup.add(
        ring
    );


    rings.push(
        ring
    );

}


// ============================================================
// PROJETOS
// ============================================================

const projectObjects = [];
const projectPalette = [0xf0c18d, 0xc2a4d5, 0x93b9b2, 0xd8987c, 0xb7c78f];


const projectGeometry =
    new THREE.SphereGeometry(

        CONFIG.projectSize,

        32,

        32

    );


for (

    let i = 0;

    i < projects.length;

    i++

) {

    if (curveEmpty) continue;

    const projectTint = projectPalette[i % projectPalette.length];

    const progress =
        projectProgress[i];


    const center =
        getCurvePoint(
            progress
        );


    const project =
        new THREE.Mesh(

            projectGeometry,

            new THREE.MeshStandardMaterial({

                color:
                    projectTint,

                emissive:
                    projectTint,

                emissiveIntensity:
                    1.8,

                roughness:
                    0.2,

                metalness:
                    0.1

            })

        );


    project.position.copy(
        center
    );


    project.userData.projectIndex =
        i;


    project.userData.progress =
        progress;


    curveGroup.add(
        project
    );


    const aura =
        new THREE.Mesh(

            new THREE.SphereGeometry(

                3,

                32,

                32

            ),

            new THREE.MeshBasicMaterial({

                color:
                    projectTint,

                transparent:
                    true,

                opacity:
                    0.07,

                depthWrite:
                    false,

                blending:
                    THREE.AdditiveBlending

            })

        );


    project.add(
        aura
    );


    const projectRings = [];


    for (

        let r = 0;

        r < 3;

        r++

    ) {

        const ring =
            new THREE.Mesh(

                new THREE.TorusGeometry(

                    2 +
                    r * 0.6,

                    0.045,

                    8,

                    64

                ),

                new THREE.MeshBasicMaterial({

                    color:
                        projectTint,

                    transparent:
                        true,

                    opacity:
                        0.55 -
                        r * 0.14

                })

            );


        ring.rotation.x =
            Math.PI / 2;


        ring.rotation.z =
            r * 0.7;


        project.add(
            ring
        );


        projectRings.push(
            ring
        );

    }


    const localNodes = [];


    for (

        let n = 0;

        n < 36;

        n++

    ) {

        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            3.2 +
            Math.random() * 4.5;


        const node =
            new THREE.Mesh(

                new THREE.SphereGeometry(

                    0.10 +
                    Math.random() * 0.16,

                    8,

                    8

                ),

                new THREE.MeshStandardMaterial({

                    color:
                        COLOR_UNIVERSE,

                    emissive:
                        COLOR_GLOW,

                    emissiveIntensity:
                        0.7

                })

            );


        node.position.set(

            Math.cos(angle) *
                distance,

            (
                Math.random() -
                0.5
            ) * 5,

            Math.sin(angle) *
                distance

        );


        project.add(
            node
        );


        localNodes.push(
            node
        );

    }


    projectObjects.push({

        mesh:
            project,

        aura:
            aura,

        rings:
            projectRings,

        nodes:
            localNodes,

        index:
            i,

        progress:
            progress,

        curvePosition:
            center.clone()

    });

}


// ============================================================
// PARTÍCULAS
// ============================================================

const particleCount =
    4500;


const particlePositions =
    new Float32Array(

        particleCount * 3

    );


for (

    let i = 0;

    i <
    particleCount * 3;

    i += 3

) {

    const radius =
        20 +
        Math.random() * 90;


    const angle =
        Math.random() *
        Math.PI *
        2;


    particlePositions[i] =
        Math.cos(angle) *
        radius;


    particlePositions[i + 1] =
        (
            Math.random() - 0.5
        ) * 160;


    particlePositions[i + 2] =
        Math.sin(angle) *
        radius;

}


const particleGeometry =
    new THREE.BufferGeometry();


particleGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(

        particlePositions,

        3

    )

);


const particleMaterial =
    new THREE.PointsMaterial({

        color:
            COLOR_GLOW,

        size:
        0.14,

        transparent:
            true,

        opacity:
            0.25,

        blending:
            THREE.AdditiveBlending,

        depthWrite:
            false

    });


const particles =
    new THREE.Points(

        particleGeometry,

        particleMaterial

    );


scene.add(
    particles
);


// ============================================================
// ESTRELAS
// ============================================================

const starPositions =
    new Float32Array(

        CONFIG.stars * 3

    );


for (

    let i = 0;

    i < CONFIG.stars * 3;

    i += 3

) {

    starPositions[i] =

        (
            Math.random() - 0.5
        ) * 700;


    starPositions[i + 1] =

        (
            Math.random() - 0.5
        ) * 600;


    starPositions[i + 2] =

        (
            Math.random() - 0.5
        ) * 700;

}


const starGeometry =
    new THREE.BufferGeometry();


starGeometry.setAttribute(

    "position",

    new THREE.BufferAttribute(

        starPositions,

        3

    )

);


const starMaterial =
    new THREE.PointsMaterial({

        color:
            0xffe4c8,

        size:
            0.45,

        transparent:
            true,

        opacity:
            0.4

    });


const stars =
    new THREE.Points(

        starGeometry,

        starMaterial

    );


scene.add(
    stars
);


// ============================================================
// ESTADO DA CÂMERA
// ============================================================

let scrollProgress =
    FIRST_PROJECT_PROGRESS;

let cameraProgress =
    FIRST_PROJECT_PROGRESS;

let targetCameraProgress =
    FIRST_PROJECT_PROGRESS;

let currentProjectIndex =
    0;

let activeProject =
    0;

let selectedProject =
    0;

let scrollDirection =
    1;

let cameraTravelling =
    false;

let userHasScrolled =
    false;


// ============================================================
// BLOQUEIO DA BORDA
// ============================================================
//
//  0  = normal
//  1  = bloqueando no último projeto
// -1  = bloqueando no primeiro projeto
//
// IMPORTANTE:
//
// NÃO existe mais boundaryReady.
//
// O próximo scroll na mesma direção
// libera a página imediatamente.
// ============================================================

let boundaryLock =
    0;


// ============================================================
// RELÓGIO
// ============================================================

const cameraClock =
    new THREE.Clock();


// ============================================================
// VETORES DA CÂMERA
// ============================================================

const smoothCameraPosition =
    new THREE.Vector3();

const smoothCameraTarget =
    new THREE.Vector3();

const desiredCameraPosition =
    new THREE.Vector3();

const desiredCameraTarget =
    new THREE.Vector3();


// ============================================================
// PROJETO MAIS PRÓXIMO
// ============================================================

function findClosestProject(
    progress
) {

    let closestIndex =
        0;

    let closestDistance =
        Infinity;


    for (

        let i = 0;

        i < projectProgress.length;

        i++

    ) {

        const distance =
            Math.abs(

                progress -
                projectProgress[i]

            );


        if (
            distance <
            closestDistance
        ) {

            closestDistance =
                distance;

            closestIndex =
                i;

        }

    }


    return closestIndex;

}


// ============================================================
// POSIÇÃO CONTÍNUA
// ============================================================

function getContinuousCurvePosition(
    progress
) {

    return getCurvePoint(

        THREE.MathUtils.clamp(

            progress,

            0,

            getProjectEnd()

        )

    );

}


// ============================================================
// TANGENTE
// ============================================================

function getCurveTangent(
    progress
) {

    const sample =
        0.001;


    const p1 =
        getCurvePoint(

            THREE.MathUtils.clamp(

                progress -
                sample,

                0,

                1

            )

        );


    const p2 =
        getCurvePoint(

            THREE.MathUtils.clamp(

                progress +
                sample,

                0,

                1

            )

        );


    return p2
        .sub(p1)
        .normalize();

}


// ============================================================
// TRILHO DA CÂMERA
// ============================================================

function getCameraRail(
    progress
) {

    progress =
        THREE.MathUtils.clamp(

            progress,

            FIRST_PROJECT_PROGRESS,

            LAST_PROJECT_PROGRESS

        );


    const curvePoint =
        getContinuousCurvePosition(
            progress
        );


    const tangent =
        getCurveTangent(
            progress
        );


    const radial =
        new THREE.Vector3(

            curvePoint.x,

            0,

            curvePoint.z

        );


    if (
        radial.lengthSq() <
        0.0001
    ) {

        radial.set(
            1,
            0,
            0
        );

    }


    radial.normalize();


    const side =
        new THREE.Vector3(

            -tangent.z,

            0,

            tangent.x

        );


    if (
        side.lengthSq() <
        0.0001
    ) {

        side.set(
            0,
            0,
            1
        );

    }


    side.normalize();


    const position =
        curvePoint.clone();


    position.addScaledVector(

        radial,

        CONFIG.cameraRadiusOffset

    );


    position.addScaledVector(

        side,

        CONFIG.cameraSideOffset

    );


    position.y +=
        CONFIG.cameraHeight;

    if (curveEmpty) {
        const lookAheadProgress = THREE.MathUtils.clamp(progress + CONFIG.lookAhead, FIRST_PROJECT_PROGRESS, LAST_PROJECT_PROGRESS);
        const emptyTarget = getContinuousCurvePosition(lookAheadProgress);
        emptyTarget.y += CONFIG.targetHeight;
        return { position, target: emptyTarget };
    }


    const projectIndex =
        THREE.MathUtils.clamp(

            currentProjectIndex,

            0,

            projectObjects.length - 1

        );


    const project =
        projectObjects[
            projectIndex
        ];


    const projectPosition =
        project.mesh.position.clone();


    const lookProgress =
        THREE.MathUtils.clamp(

            progress +
            (
                scrollDirection *
                CONFIG.lookAhead
            ),

            FIRST_PROJECT_PROGRESS,

            LAST_PROJECT_PROGRESS

        );


    const curveAhead =
        getContinuousCurvePosition(

            lookProgress

        );


    const distanceToProject =
        Math.abs(

            progress -
            projectProgress[
                projectIndex
            ]

        );


    const focusDistance =
        0.12;


    const projectFocus =
        THREE.MathUtils.clamp(

            1 -
            (
                distanceToProject /
                focusDistance
            ),

            0,

            1

        );


    const focus =
        projectFocus *
        projectFocus;


    const target =
        new THREE.Vector3();


    target.lerpVectors(

        curveAhead,

        projectPosition,

        focus

    );


    if (cameraTravelling) {

        const travelFocus =
            THREE.MathUtils.clamp(

                0.45 +
                focus * 0.55,

                0,

                1

            );


        target.lerp(

            projectPosition,

            travelFocus

        );

    }
    else {

        target.lerp(

            projectPosition,

            0.85

        );

    }


    target.y +=
        CONFIG.targetHeight;


    return {

        position,

        target

    };

}


// ============================================================
// INFORMAÇÕES DO PROJETO
// ============================================================

function updateProjectInfo(
    index
) {

    if (
        !projects[index]
    ) {

        return;

    }


    const project =
        projects[index];

    if (curveEmpty) {
        projectNumber.textContent = "UNIVERSO EM PAUSA";
        projectName.textContent = "CURVA LIVRE";
        projectDescription.textContent = "Quando publicar um projeto pela Central, ele vai aparecer por aqui.";
        if (projectOpenLink) projectOpenLink.hidden = true;
        return;
    }


    projectNumber.textContent =
        `PROJETO ${String(

            index + 1

        ).padStart(

            2,

            "0"

        )}`;


    projectName.textContent =
        project.name;


    projectDescription.textContent =
        project.tagline || project.description || "Um projeto em construção no meu cantinho.";

    if (projectOpenLink) {
        projectOpenLink.href = `projetos/${encodeURIComponent(projectSlug(project))}/`;
        projectOpenLink.hidden = false;
        projectOpenLink.setAttribute("aria-label", `Abrir projeto ${project.name}`);
    }


    projectButtons.forEach(

        (
            button,
            buttonIndex
        ) => {

            button.classList.toggle(

                "active",

                buttonIndex === index

            );

        }

    );

}


// ============================================================
// DEFINIR PROJETO ATIVO
// ============================================================

function setActiveProject(
    index
) {

    index =
        THREE.MathUtils.clamp(

            index,

            0,

            projects.length - 1

        );


    currentProjectIndex =
        index;

    activeProject =
        index;

    selectedProject =
        index;


    updateProjectInfo(
        index
    );

}


// ============================================================
// SCROLL REAL
// ============================================================

window.addEventListener(

    "wheel",

    (event) => {

        if (
            event.deltaY === 0
        ) {

            return;

        }


        userHasScrolled = true;


        const direction =
            event.deltaY > 0
                ? 1
                : -1;


        const rect =
            projectsSection.getBoundingClientRect();


        const sectionVisible =
            rect.bottom > 0 &&
            rect.top < window.innerHeight;


        if (
            !sectionVisible
        ) {

            return;

        }


        // ====================================================
        // JÁ ESTÁ TRAVADO NO ÚLTIMO
        // ====================================================

        if (
            boundaryLock === 1
        ) {

            // Scroll para baixo:
            // libera a página neste próximo scroll.

            if (
                direction === 1
            ) {

                boundaryLock = 0;

                return;

            }


            // Scroll para cima:
            // libera imediatamente e volta para a curva.

            boundaryLock = 0;

            return;

        }


        // ====================================================
        // DETECTA SE ESTE SCROLL VAI PASSAR DO FINAL
        // ====================================================

        if (
            direction === 1
        ) {

            const scrollable =
                Math.max(

                    projectsSection.offsetHeight -
                    window.innerHeight,

                    0

                );


            if (
                scrollable > 0
            ) {

                // Posição que a seção teria
                // DEPOIS deste wheel.

                const predictedTop =
                    rect.top -
                    event.deltaY;


                // Se o próximo scroll ultrapassaria
                // o final da seção, trava ANTES
                // do navegador mover a página.

                if (
                    predictedTop <=
                    -scrollable
                ) {

                    event.preventDefault();


                    boundaryLock = 1;


                    scrollProgress =
                        LAST_PROJECT_PROGRESS;


                    targetCameraProgress =
                        LAST_PROJECT_PROGRESS;


                    currentProjectIndex =
                        projects.length - 1;


                    setActiveProject(
                        projects.length - 1
                    );


                    scrollDirection =
                        1;


                    return;

                }

            }

        }

    },

    {
        passive: false
    }

);


// ============================================================
// TOUCH
// ============================================================

let lastTouchY =
    0;


window.addEventListener(

    "touchstart",

    (event) => {

        if (
            event.touches.length
        ) {

            lastTouchY =
                event.touches[0].clientY;

        }

    },

    {
        passive: true
    }

);


window.addEventListener(

    "touchmove",

    (event) => {

        if (
            !event.touches.length
        ) {

            return;

        }


        const currentY =
            event.touches[0].clientY;


        const deltaY =
            lastTouchY -
            currentY;


        const direction =
            deltaY > 0
                ? 1
                : -1;


        lastTouchY =
            currentY;


        userHasScrolled =
            true;


        const rect =
            projectsSection.getBoundingClientRect();


        const sectionVisible =
            rect.bottom > 0 &&
            rect.top < window.innerHeight;


        if (
            !sectionVisible
        ) {

            return;

        }


        // ====================================================
        // ÚLTIMO
        // ====================================================

        if (
            boundaryLock === 1
        ) {

            if (
                direction === 1
            ) {

                boundaryLock =
                    0;

                return;

            }


            if (
                direction === -1
            ) {

                boundaryLock =
                    0;

            }

        }


        // ====================================================
        // PRIMEIRO
        // ====================================================

        if (
            boundaryLock === -1
        ) {

            if (
                direction === -1
            ) {

                boundaryLock =
                    0;

                return;

            }


            if (
                direction === 1
            ) {

                boundaryLock =
                    0;

            }

        }


        // ====================================================
        // PRIMEIRO
        // ====================================================

        if (

            direction === -1 &&

            scrollProgress <=
            FIRST_PROJECT_PROGRESS +
            0.0005

        ) {

            boundaryLock =
                -1;

            scrollProgress =
                FIRST_PROJECT_PROGRESS;

            targetCameraProgress =
                FIRST_PROJECT_PROGRESS;

            currentProjectIndex =
                0;

            setActiveProject(
                0
            );

            scrollDirection =
                -1;

            event.preventDefault();

            return;

        }


        // ====================================================
        // ÚLTIMO
        // ====================================================

        if (

            direction === 1 &&

            scrollProgress >=
            LAST_PROJECT_PROGRESS -
            0.0005

        ) {

            boundaryLock =
                1;

            scrollProgress =
                LAST_PROJECT_PROGRESS;

            targetCameraProgress =
                LAST_PROJECT_PROGRESS;

            currentProjectIndex =
                projects.length - 1;

            setActiveProject(
                projects.length - 1
            );

            scrollDirection =
                1;

            event.preventDefault();

            return;

        }

    },

    {
        passive: false
    }

);


// ============================================================
// ATUALIZAR SCROLL
// ============================================================

function updateScroll() {

    const rect =
        projectsSection.getBoundingClientRect();


    const scrollable =
        Math.max(

            projectsSection.offsetHeight -
            window.innerHeight,

            0

        );


    // ========================================================
    // SEÇÃO PEQUENA DEMAIS
    // ========================================================

    if (
        scrollable <= 0
    ) {

        scrollProgress =
            FIRST_PROJECT_PROGRESS;


        if (
            boundaryLock === 0
        ) {

            targetCameraProgress =
                FIRST_PROJECT_PROGRESS;

        }

        return;

    }


    // ========================================================
    // ANTES DA SEÇÃO
    // ========================================================

    if (
        rect.top > 0
    ) {

        scrollProgress =
            FIRST_PROJECT_PROGRESS;


        if (
            boundaryLock === 0
        ) {

            targetCameraProgress =
                FIRST_PROJECT_PROGRESS;

            currentProjectIndex =
                0;


            if (
                activeProject !==
                0
            ) {

                setActiveProject(
                    0
                );

            }

        }


        return;

    }


// ========================================================
// BLOQUEIO NO ÚLTIMO PROJETO
// ========================================================

if (
    boundaryLock === 1
) {

    scrollProgress =
        LAST_PROJECT_PROGRESS;


    targetCameraProgress =
        LAST_PROJECT_PROGRESS;


    currentProjectIndex =
        projects.length - 1;


    if (
        activeProject !==
        projects.length - 1
    ) {

        setActiveProject(
            projects.length - 1
        );

    }


    return;

}


    // ========================================================
    // PROGRESSO DA SEÇÃO
    // ========================================================

    const sectionProgress =
        THREE.MathUtils.clamp(

            -rect.top /
            scrollable,

            0,

            1

        );


    const curvedProgress =
        Math.pow(

            sectionProgress,

            CONFIG.scrollSensitivity

        );


    const newProgress =
        THREE.MathUtils.lerp(

            FIRST_PROJECT_PROGRESS,

            LAST_PROJECT_PROGRESS,

            curvedProgress

        );


    // ========================================================
    // DIREÇÃO
    // ========================================================

    if (
        newProgress >
        scrollProgress +
        0.0001
    ) {

        scrollDirection =
            1;

    }


    if (
        newProgress <
        scrollProgress -
        0.0001
    ) {

        scrollDirection =
            -1;

    }


    // ========================================================
    // PROGRESSO NORMAL
    // ========================================================

    scrollProgress =
        THREE.MathUtils.clamp(

            newProgress,

            FIRST_PROJECT_PROGRESS,

            LAST_PROJECT_PROGRESS

        );


    // ========================================================
    // VIAGEM PELO BOTÃO
    // ========================================================

    if (
        cameraTravelling
    ) {

        return;

    }


    // ========================================================
    // PROJETO MAIS PRÓXIMO
    // ========================================================

    const closestProject =
        findClosestProject(
            scrollProgress
        );


    currentProjectIndex =
        closestProject;


    targetCameraProgress =
        scrollProgress;


    if (
        activeProject !==
        closestProject
    ) {

        setActiveProject(
            closestProject
        );

    }


    // ========================================================
    // PRIMEIRO
    // ========================================================

    if (
        scrollProgress <=
        FIRST_PROJECT_PROGRESS
    ) {

        scrollProgress =
            FIRST_PROJECT_PROGRESS;

        targetCameraProgress =
            FIRST_PROJECT_PROGRESS;

    }


    // ========================================================
    // ÚLTIMO
    // ========================================================

    if (
        scrollProgress >=
        LAST_PROJECT_PROGRESS
    ) {

        scrollProgress =
            LAST_PROJECT_PROGRESS;

        targetCameraProgress =
            LAST_PROJECT_PROGRESS;

        currentProjectIndex =
            projects.length - 1;


        if (
            activeProject !==
            projects.length - 1
        ) {

            setActiveProject(

                projects.length - 1

            );

        }

    }

}


// ============================================================
// IR PARA PROJETO
// ============================================================

function goToProject(
    index
) {

    index =
        THREE.MathUtils.clamp(

            index,

            0,

            projects.length - 1

        );


    currentProjectIndex =
        index;

    selectedProject =
        index;

    activeProject =
        index;


    targetCameraProgress =
        projectProgress[index];


    cameraTravelling =
        true;


    userHasScrolled =
        true;


    boundaryLock =
        0;


    updateProjectInfo(
        index
    );


    const sectionTop =
        projectsSection.offsetTop;


    const scrollable =
        Math.max(

            projectsSection.offsetHeight -
            window.innerHeight,

            0

        );


    const sensitivity =
        CONFIG.scrollSensitivity;


    const totalProjectRange =
        LAST_PROJECT_PROGRESS -
        FIRST_PROJECT_PROGRESS;


    let normalizedProgress =
        0;


    if (
        totalProjectRange > 0
    ) {

        normalizedProgress =

            THREE.MathUtils.clamp(

                (
                    projectProgress[index] -
                    FIRST_PROJECT_PROGRESS
                ) /
                totalProjectRange,

                0,

                1

            );

    }


    const rawProgress =
        Math.pow(

            normalizedProgress,

            1 / sensitivity

        );


    const destination =
        sectionTop +
        scrollable *
        rawProgress;


    window.scrollTo({

        top:
            destination,

        behavior:
            "smooth"

    });

}


// ============================================================
// BOTÕES
// ============================================================

projectButtons.forEach(

    (button) => {

        const buttonIndex =
            Array.from(
                projectButtons
            ).indexOf(
                button
            );


        if (
            buttonIndex < 0 ||
            buttonIndex >= projects.length
        ) {

            return;

        }


        button.addEventListener(

            "click",

            (event) => {

                event.preventDefault();

                event.stopPropagation();


                goToProject(
                    buttonIndex
                );

            }

        );

    }

);


// ============================================================
// RAYCAST
// ============================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


function updateMouse(
    event
) {

    mouse.x =
        (
            event.clientX /
            window.innerWidth
        ) * 2 - 1;


    mouse.y =
        -(
            event.clientY /
            window.innerHeight
        ) * 2 + 1;

}


// ============================================================
// VISIBILIDADE
// ============================================================

let projectsVisible =
    false;


// ============================================================
// HOVER
// ============================================================

renderer.domElement.addEventListener(

    "pointermove",

    (event) => {

        if (
            !projectsVisible
        ) {

            renderer.domElement.style.cursor =
                "default";

            return;

        }


        updateMouse(
            event
        );


        raycaster.setFromCamera(

            mouse,

            camera

        );


        const hits =
            raycaster.intersectObjects(

                projectObjects.map(

                    project =>
                        project.mesh

                ),

                false

            );


        renderer.domElement.style.cursor =

            hits.length
                ? "pointer"
                : "default";

    }

);


// ============================================================
// CLIQUE NAS BOLINHAS
// ============================================================

renderer.domElement.addEventListener(

    "click",

    (event) => {

        if (
            !projectsVisible
        ) {

            return;

        }


        updateMouse(
            event
        );


        raycaster.setFromCamera(

            mouse,

            camera

        );


        const hits =
            raycaster.intersectObjects(

                projectObjects.map(

                    project =>
                        project.mesh

                ),

                false

            );


        if (
            !hits.length
        ) {

            return;

        }


        const projectIndex =
            hits[0]
                .object
                .userData
                .projectIndex;


        if (
            typeof projectIndex !==
            "number"
        ) {

            return;

        }


        goToProject(
            projectIndex
        );

    }

);


// ============================================================
// ANIMAÇÃO DOS OBJETOS
// ============================================================

function animateObjects() {

    const time =
        performance.now() *
        0.001;


    universeCloud.rotation.y = Math.sin(time * 0.12) * 0.025;
    universeCloud.rotation.x = Math.cos(time * 0.08) * 0.009;


    projectObjects.forEach(

        (
            project,
            index
        ) => {

            const distance =
                Math.abs(

                    cameraProgress -
                    projectProgress[index]

                );


            const focus =
                THREE.MathUtils.clamp(

                    1 -
                    distance /
                    0.07,

                    0,

                    1

                );


            const targetScale =
                1 +
                focus * 0.5;


            const currentScale =
                project.mesh.scale.x;


            const newScale =
                THREE.MathUtils.lerp(

                    currentScale,

                    targetScale,

                    0.08

                );


            project.mesh.scale.setScalar(
                newScale
            );


            project.aura.material.opacity =

                0.04 +
                focus * 0.12;


            project.rings.forEach(

                (
                    ring,
                    ringIndex
                ) => {

                    ring.rotation.x +=

                        0.006 *
                        (
                            ringIndex + 1
                        );


                    ring.rotation.y +=

                        0.009 *
                        (
                            ringIndex + 1
                        );

                }

            );

        }

    );


    rings.forEach(

        (
            ring,
            index
        ) => {

            ring.rotation.z +=

                (
                    index % 2 === 0

                        ? 0.0007

                        : -0.0007

                );

        }

    );


    particles.rotation.y +=
        0.00015;

    particles.rotation.x +=
        0.00002;


    stars.rotation.y +=
        0.00005;

}


// ============================================================
// CÂMERA
// ============================================================

function updateCamera() {

    const delta =
        Math.min(

            cameraClock.getDelta(),

            0.05

        );


    // ========================================================
    // DISTÂNCIA
    // ========================================================

    const distance =
        targetCameraProgress -
        cameraProgress;


    // ========================================================
    // MOVIMENTO DA PROGRESSÃO
    // ========================================================

    if (
        Math.abs(distance) >
        0.00001
    ) {

        const alpha =

            1 -

            Math.pow(

                1 -
                CONFIG.cameraScrollSpeed,

                delta * 60

            );


        cameraProgress =
            THREE.MathUtils.lerp(

                cameraProgress,

                targetCameraProgress,

                alpha

            );

    }


    // ========================================================
    // CHEGOU AO PROGRESSO
    // ========================================================

    if (

        Math.abs(

            targetCameraProgress -
            cameraProgress

        ) < 0.00001

    ) {

        cameraProgress =
            targetCameraProgress;


        if (
            cameraTravelling
        ) {

            cameraTravelling =
                false;


            setActiveProject(
                currentProjectIndex
            );

        }

    }


    // ========================================================
    // LIMITES
    // ========================================================

    if (
        cameraProgress <=
        FIRST_PROJECT_PROGRESS +
        0.00001
    ) {

        cameraProgress =
            FIRST_PROJECT_PROGRESS;

    }


    if (
        cameraProgress >=
        LAST_PROJECT_PROGRESS -
        0.00001
    ) {

        cameraProgress =
            LAST_PROJECT_PROGRESS;

    }


    // ========================================================
    // TRILHO
    // ========================================================

    const rail =
        getCameraRail(

            cameraProgress

        );


    desiredCameraPosition.copy(
        rail.position
    );


    desiredCameraTarget.copy(
        rail.target
    );


    // ========================================================
    // SUAVIZAÇÃO DA POSIÇÃO
    // ========================================================

    const positionAlpha =

        1 -

        Math.pow(

            1 -
            CONFIG.cameraPositionSmooth,

            delta * 60

        );


    // ========================================================
    // SUAVIZAÇÃO DO ALVO
    // ========================================================

    const targetAlpha =

        1 -

        Math.pow(

            1 -
            CONFIG.cameraTargetSmooth,

            delta * 60

        );


    smoothCameraPosition.lerp(

        desiredCameraPosition,

        positionAlpha

    );


    smoothCameraTarget.lerp(

        desiredCameraTarget,

        targetAlpha

    );


    // ========================================================
    // CÂMERA REAL
    // ========================================================

    camera.position.copy(
        smoothCameraPosition
    );


    camera.lookAt(
        smoothCameraTarget
    );

}


// ============================================================
// VISIBILIDADE
// ============================================================

function setProjectsVisibility(
    visible
) {

    if (
        visible ===
        projectsVisible
    ) {

        return;

    }


    projectsVisible =
        visible;


    if (visible) {

        container.style.display =
            "block";


        container.style.visibility =
            "visible";


        container.style.pointerEvents =
            "auto";


        requestAnimationFrame(

            () => {

                container.style.opacity =
                    "1";

            }

        );

    }
    else {

        container.style.opacity =
            "0";


        container.style.visibility =
            "hidden";


        container.style.pointerEvents =
            "none";


        container.style.display =
            "none";


        renderer.domElement.style.cursor =
            "default";

    }

}


// ============================================================
// DETECTOR DA SEÇÃO
// ============================================================

function checkProjectsVisibility() {

    const rect =
        projectsSection.getBoundingClientRect();


    const viewportHeight =
        window.innerHeight;


    if (
        rect.bottom <= 0 ||
        rect.top >= viewportHeight
    ) {

        setProjectsVisibility(
            false
        );

        return;

    }


    const sectionVisible =

        rect.bottom > 0 &&
        rect.top < viewportHeight;


    setProjectsVisibility(

        sectionVisible

    );

}


window.addEventListener(

    "scroll",

    checkProjectsVisibility,

    {
        passive: true
    }

);


window.addEventListener(

    "resize",

    checkProjectsVisibility

);


// ============================================================
// INICIALIZAÇÃO
// ============================================================

currentProjectIndex =
    0;

activeProject =
    0;

selectedProject =
    0;

cameraTravelling =
    false;

boundaryLock =
    0;

scrollProgress =
    FIRST_PROJECT_PROGRESS;

targetCameraProgress =
    FIRST_PROJECT_PROGRESS;

cameraProgress =
    FIRST_PROJECT_PROGRESS;


// ============================================================
// COMEÇA ESCONDIDO
// ============================================================

container.style.display =
    "none";

container.style.opacity =
    "0";

container.style.visibility =
    "hidden";

container.style.pointerEvents =
    "none";



// ============================================================
// POSIÇÃO INICIAL
// ============================================================

const initialRail =
    getCameraRail(

        cameraProgress

    );


camera.position.copy(
    initialRail.position
);


smoothCameraPosition.copy(
    initialRail.position
);


desiredCameraPosition.copy(
    initialRail.position
);


smoothCameraTarget.copy(
    initialRail.target
);


desiredCameraTarget.copy(
    initialRail.target
);


camera.lookAt(
    smoothCameraTarget
);


// ============================================================
// PRIMEIRO PROJETO
// ============================================================

updateProjectInfo(
    0
);


// ============================================================
// PRIMEIRA VERIFICAÇÃO
// ============================================================

checkProjectsVisibility();


// ============================================================
// LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    updateScroll();


    if (
        projectsVisible
    ) {

        animateObjects();

        updateCamera();

        composer.render();

    }

}


animate();


// ============================================================
// REDIMENSIONAMENTO
// ============================================================

window.addEventListener(

    "resize",

    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(

            window.innerWidth,

            window.innerHeight

        );


        composer.setSize(

            window.innerWidth,

            window.innerHeight

        );

    }

);
