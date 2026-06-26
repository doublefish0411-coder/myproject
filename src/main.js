import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Setup

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

// Torus

//const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
//const material = new THREE.MeshStandardMaterial({ color: 0xff6347 });
//const torus = new THREE.Mesh(geometry, material);

//scene.add(torus);

// Lights

const pointLight = new THREE.PointLight(0xffffff,500);
pointLight.position.set(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

// Helpers

// const lightHelper = new THREE.PointLightHelper(pointLight)
// const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper)
const particleCount = 3000;
const innerRadius = 8;
const outerRadius = 14;
const thickness = 0.8;

const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

// 【新增】用来存储每个粒子的私有属性（角度、半径、速度、随机相位）
const particleData = []; 

for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
    
    // 给每个粒子一个独立的公转速度（越靠近内圈转得越快）
    const speed = (Math.random() * 0.002 + 0.001) * (15 / radius); 

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * thickness;

    // 把这个粒子的“基因”存起来
    particleData.push({
        angle: angle,
        radius: radius,
        speed: speed,
        yOffset: positions[i * 3 + 1],
        // 赋予三个轴向上的随机时间种子（让它们的随机漂浮不一致）
        randomPhaseX: Math.random() * Math.PI * 2,
        randomPhaseY: Math.random() * Math.PI * 2,
        randomPhaseZ: Math.random() * Math.PI * 2,
    });
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    color: 0xff1133,
    size: 0.15,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});

const randomGlowingRing = new THREE.Points(geometry, material);
randomGlowingRing.rotation.x = Math.PI / 2.5; 
scene.add(randomGlowingRing);
// const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
    const geometry = new THREE.SphereGeometry(0.25, 24, 24); // 你的星星几何体可能和这个略有不同，保留你原来的即可

    // 【修改这里】换成不受光照影响的基础材质，并加上发光混合模式
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, // 纯白色
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending // 增加高光感
    });

    const star = new THREE.Mesh(geometry, material);

    // 随机散布坐标（保留你原有的坐标生成逻辑即可）
    const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
    star.position.set(x, y, z);
    
    scene.add(star);
}

// 批量生成星星的代码通常在下面，类似这样：
// Array(200).fill().forEach(addStar);

Array(200).fill().forEach(addStar);

// Background

const spaceTexture = new THREE.TextureLoader().load('space.jpg');
scene.background = spaceTexture;

// Avatar

const jeffTexture = new THREE.TextureLoader().load('jeff.png');

const jeff = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: jeffTexture }));

scene.add(jeff);

// Moon

const moonTexture = new THREE.TextureLoader().load('moon.jpg');
const normalTexture = new THREE.TextureLoader().load('normal.jpg');

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture,
    // 【新增这两行】让月球自带微弱的白光
        emissive: 0xffffff,        // 发射纯白光
        emissiveIntensity: 0.5
    // 强度调到 0.1 到 0.3 之间最好，太高会把坑洼细节“闪瞎”覆盖掉
  })
);

scene.add(moon);

moon.position.z = 30;
moon.position.setX(-10);

jeff.position.z = -5;
jeff.position.x = 2;

// Scroll Animation

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.05;
  moon.rotation.y += 0.075;
  moon.rotation.z += 0.05;

  jeff.rotation.y += 0.01;
  jeff.rotation.z += 0.01;

  camera.position.z = t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Animation Loop

function animate() {
  requestAnimationFrame(animate);

  randomGlowingRing.rotation.x += 0.01;
  randomGlowingRing.rotation.y += 0.005;
  randomGlowingRing.rotation.z += 0.01;

  moon.rotation.x += 0.005;

  // controls.update();
// 【修改这块代码：强制向全局索要 isWarping 状态】
    if (window.isWarping === true) {
        if (camera.fov < 170) {
            camera.fov += 2; 
            camera.updateProjectionMatrix(); 
        }
        camera.position.z -= 2; 
    }
  renderer.render(scene, camera);
}

animate();




// ==========================================
// 全局事件委托：曲率跃迁与跳转逻辑 (Warp Drive Navigation)
// ==========================================

// 初始化全局状态
window.isWarping = false;

// 使用事件委托，监听整个 body 的点击行为
document.body.addEventListener('click', function(e) {
    // 检查点击的目标是否为导航栏里的 <a> 标签
    const targetLink = e.target.closest('.retro-nav a');
    
    // 如果不是，直接跳过
    if (!targetLink) return;

    // 拦截默认行为
    e.preventDefault();
    const targetUrl = targetLink.getAttribute('href');

    // 防止重复点击
    if (window.isWarping) return;
    window.isWarping = true;
// 【关键新增】在跃迁前，记录当前滚动位置
    sessionStorage.setItem('scrollPosition', window.scrollY)
    // 视觉封锁
    document.body.style.overflow = 'hidden';
    document.body.style.pointerEvents = 'none';

    // 创建闪白图层
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'fixed';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100vw';
    flashOverlay.style.height = '100vh';
    flashOverlay.style.backgroundColor = '#000000';
    flashOverlay.style.opacity = '0';
    flashOverlay.style.zIndex = '999999';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.transition = 'opacity 0.2s ease-in';
    document.body.appendChild(flashOverlay);

    // 触发跃迁动画（渐变闪白）
    setTimeout(() => {
        flashOverlay.style.opacity = '1';
    }, 150); // 你可以根据需要调整这个触发时间

    // 执行跳转
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 400);
});


// 在 main.js 的最下方添加这段逻辑
window.addEventListener('load', () => {
    // 检查是否有存储的滚动位置
    const savedPosition = sessionStorage.getItem('scrollPosition');
    
    if (savedPosition !== null) {
        // 使用 setTimeout 确保页面完全渲染后再进行跳转，避免被浏览器默认行为覆盖
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedPosition));
            // 恢复后清空缓存，防止刷新页面时也跳到上次位置
            sessionStorage.removeItem('scrollPosition');
        }, 100);
    }
});