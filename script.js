// --------------------------------------------------------
// Ultra-Premium WebGL & Physics Engine (Active Theory Inspired)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Lenis Smooth Scrolling (Inertia Scroll)
    // ==========================================
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing for premium feel
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // ==========================================
    // 2. Custom Physics Cursor
    // ==========================================
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let cursorObj = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        
        // Dot follows exactly
        cursorDot.style.left = `${mouse.x}px`;
        cursorDot.style.top = `${mouse.y}px`;
    });

    // Lerp (Linear Interpolation) loop for the trailing outline
    function cursorTicker() {
        // Lerp factor (lower = slower/heavier drag)
        cursorObj.x += (mouse.x - cursorObj.x) * 0.15;
        cursorObj.y += (mouse.y - cursorObj.y) * 0.15;
        
        cursorOutline.style.left = `${cursorObj.x}px`;
        cursorOutline.style.top = `${cursorObj.y}px`;
        
        requestAnimationFrame(cursorTicker);
    }
    cursorTicker();

    // Hover Magnetism on Links
    const links = document.querySelectorAll('a, .btn');
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-hover');
        });
        link.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-hover');
        });
    });

    // ==========================================
    // 3. Three.js Interactive Geometry
    // ==========================================
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create an interconnected wireframe sphere (Icosahedron)
    const geometry = new THREE.IcosahedronGeometry(15, 2);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0x38bdf8, 
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const shapeMesh = new THREE.Mesh(geometry, material);
    scene.add(shapeMesh);

    // Create a secondary particle system orbiting the shape
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(500 * 3);
    for(let i = 0; i < 500 * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.2, color: 0x3b82f6, transparent: true, opacity: 0.6 });
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // Render Loop & Mouse Reactivity
    const clock = new THREE.Clock();
    
    function tick() {
        const elapsedTime = clock.getElapsedTime();
        
        // Idle rotation
        shapeMesh.rotation.y = elapsedTime * 0.1;
        shapeMesh.rotation.x = elapsedTime * 0.05;
        particleMesh.rotation.y = elapsedTime * -0.05;

        // React to mouse coordinates (normalized -1 to 1)
        const normalizedMouseX = (mouse.x / window.innerWidth) * 2 - 1;
        const normalizedMouseY = -(mouse.y / window.innerHeight) * 2 + 1;
        
        // Skew the shape slightly towards the mouse
        shapeMesh.rotation.x += normalizedMouseY * 0.05;
        shapeMesh.rotation.y += normalizedMouseX * 0.05;
        
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ==========================================
    // 4. Advanced GSAP Parallax & Reveals
    // ==========================================
    gsap.registerPlugin(ScrollTrigger);

    // Make the 3D shape react dramatically to scroll depth
    gsap.to(shapeMesh.rotation, {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1
        },
        y: Math.PI * 4,
        z: Math.PI * 1,
        ease: "none"
    });
    
    // Zoom camera slightly in and out based on sections
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 2
        },
        z: 15,
        ease: "power2.inOut"
    });

    // Parallax Artifact Cards
    // Cards move at slightly different Y speeds as you scroll past them
    gsap.utils.toArray('.artifact-card').forEach((card, i) => {
        // Simple odd/even stagger
        const speed = i % 2 === 0 ? 50 : -50; 
        
        gsap.fromTo(card, 
            { y: speed, opacity: 0 }, 
            {
                y: 0,
                opacity: 1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    end: "top 40%",
                    scrub: 1
                }
            }
        );
    });

    // Section Title Text Reveals
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.fromTo(title,
            { y: 40, opacity: 0, scale: 0.9 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%"
                }
            }
        );
    });
});
