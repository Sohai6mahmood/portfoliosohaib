document.addEventListener('DOMContentLoaded', () => {
    // Navigation scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(11, 15, 25, 0.9)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'var(--glass-bg)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                // Optional: stop observing once animation has triggered
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Elements to animate
    const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up');
    animatedElements.forEach(el => observer.observe(el));

    // Initially trigger appear for elements already in viewport (hero section)
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero .fade-in, .hero .fade-in-up');
        heroElements.forEach(el => el.classList.add('appear'));
    }, 100);
});

// --------------------------------------------------------
// Three.js & GSAP 3D Background Engine
// --------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.querySelector('#webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    
    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50; // Pull camera back to see the particles

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimization

    // 4. Create 3D Particle Field (Geometry)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 3000;
    
    const posArray = new Float32Array(particlesCount * 3);
    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles across a wide 3D space (-150 to 150)
        posArray[i] = (Math.random() - 0.5) * 300;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Particle Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.5,
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    // Particle Mesh
    const particleMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleMesh);

    // 5. Idle Animation Loop
    const clock = new THREE.Clock();
    
    function tick() {
        const elapsedTime = clock.getElapsedTime();
        
        // Gentle continuous rotation
        particleMesh.rotation.y = elapsedTime * 0.05;
        particleMesh.rotation.x = elapsedTime * 0.02;
        
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
    tick();

    // 6. Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 7. GSAP ScrollTrigger Integration (The "Lusion" feel)
    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Create a timeline that spans the entire scroll height of the page
    gsap.to(particleMesh.rotation, {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1 // Smooth scrubbing effect
        },
        y: Math.PI * 2, // Rotate a full 360 degrees as user scrolls down
        x: Math.PI * 1,
        z: Math.PI * 0.5,
        ease: "none"
    });
    
    // Move the camera slightly into the particle field as we scroll down
    gsap.to(camera.position, {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 2
        },
        z: 10,
        ease: "power1.inOut"
    });
});
