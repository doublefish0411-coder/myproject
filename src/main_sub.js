import * as THREE from 'three';

// 1. 设置一个开关：如果你想在某个子页面关闭背景，只需要改这一行
const SHOW_STAR_BACKGROUND = false; // 改为 false 即隐藏所有星星和渲染

const canvas = document.querySelector('#bg');

// 如果 Canvas 不存在（比如你在某些页面把它删了），或者开关关闭，则直接退出
if (!canvas || !SHOW_STAR_BACKGROUND) {
    if (canvas) canvas.style.display = 'none'; // 隐藏画布
} else {
    // 只有在开启时才执行后续的初始化逻辑
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas });

    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(30);

    function addStar() {
        const geometry = new THREE.SphereGeometry(0.15, 24, 24);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
        star.position.set(x, y, z);
        scene.add(star);
    }
    Array(200).fill().forEach(addStar);

    function animate() {
        requestAnimationFrame(animate);
        scene.children.forEach(star => {
            if(star instanceof THREE.Mesh && star.geometry.type === 'SphereGeometry') {
                star.material.opacity = 0.5 + Math.sin(Date.now() * 0.005 + star.position.x) * 0.5;
                star.material.transparent = true;
            }
        });
        renderer.render(scene, camera);
    }
    animate();
}