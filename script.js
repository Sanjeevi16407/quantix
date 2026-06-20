// Ensure GSAP plugins are registered
gsap.registerPlugin(ScrollTrigger);

/* ==========================================================================
   1. BACKGROUND MUSIC CONTROLLER
   ========================================================================== */
const bgm = document.getElementById('bgm');
const bgmToggle = document.getElementById('bgm-toggle');
const bgmText = bgmToggle.querySelector('.music-text');

bgmToggle.addEventListener('click', () => {
    if (bgm.paused) {
        bgm.play().then(() => {
            bgmToggle.classList.add('playing');
            bgmText.textContent = 'PLAYING BGM';
        }).catch(err => {
            console.error("Audio playback blocked or failed:", err);
        });
    } else {
        bgm.pause();
        bgmToggle.classList.remove('playing');
        bgmText.textContent = 'PLAY MUSIC';
    }
});

/* ==========================================================================
   2. GSAP SCROLL ANIMATIONS
   ========================================================================== */

// -- Scene 1 (Hero) Animations --
gsap.fromTo('.title-line-1', 
    { opacity: 0, x: -40 }, 
    { opacity: 1, x: 0, duration: 1.2, delay: 0.4, ease: 'power4.out' }
);
gsap.fromTo('.title-line-2', 
    { opacity: 0, x: -40 }, 
    { opacity: 1, x: 0, duration: 1.2, delay: 0.7, ease: 'power4.out' }
);
gsap.fromTo('.star-divider-left', 
    { opacity: 0, scale: 0 }, 
    { opacity: 1, scale: 1, duration: 1, delay: 1.2, ease: 'back.out(1.7)' }
);
gsap.fromTo('.scroll-indicator-left', 
    { opacity: 0 }, 
    { opacity: 0.8, duration: 1.2, delay: 1.6 }
);

// Parallax scrolling on Hero background
gsap.to('.hero-bg', {
    yPercent: 15,
    scale: 1.12,
    ease: 'none',
    scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// -- Scene 2 (Journey) Animations --
gsap.to('.transition-bg', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
        trigger: '#scene2',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    }
});

gsap.fromTo('#scene2 .poetic-line', 
    { opacity: 0, y: 30 },
    { 
        opacity: 1, 
        y: 0, 
        duration: 1.2, 
        stagger: 0.4, 
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#scene2',
            start: 'top 55%',
            toggleActions: 'play none none reverse'
        }
    }
);

// -- Scene 3 (Poster Reveal) Animations --
ScrollTrigger.create({
    trigger: '#scene3',
    start: 'top 60%',
    onEnter: () => document.querySelector('.poster-container').classList.add('visible'),
    onLeaveBack: () => document.querySelector('.poster-container').classList.remove('visible')
});

const poster = document.querySelector('.original-poster-wrapper');
if (poster) {
    document.addEventListener('mousemove', (e) => {
        const rect = poster.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        if (rect.top < window.innerHeight && rect.bottom > 0 && window.innerWidth > 768) {
            const rotX = -(y / rect.height) * 8;
            const rotY = (x / rect.width) * 8;
            gsap.to(poster, { rotationX: rotX, rotationY: rotY, duration: 0.5, ease: 'power2.out' });
        }
    });

    poster.addEventListener('mouseleave', () => {
        gsap.to(poster, { rotationX: 0, rotationY: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
}

// -- Scene 4 (About) Animations --
gsap.to('.about-bg', {
    yPercent: 10,
    ease: 'none',
    scrollTrigger: {
        trigger: '#about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    }
});

ScrollTrigger.create({
    trigger: '#about',
    start: 'top 65%',
    onEnter: () => document.querySelector('.about-container').classList.add('visible'),
    onLeaveBack: () => document.querySelector('.about-container').classList.remove('visible')
});


/* ==========================================================================
   3. FLOATING DUST PARTICLE CANVAS SYSTEM
   ========================================================================== */
const canvas = document.getElementById('dust-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
const particleCount = 45;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.reset(true);
    }
    
    reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = -(Math.random() * 0.5 + 0.2);
        this.opacity = 0;
        this.maxOpacity = Math.random() * 0.5 + 0.1;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.fadingIn = true;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.fadingIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= this.maxOpacity) {
                this.opacity = this.maxOpacity;
                this.fadingIn = false;
            }
        }
        
        if (this.y < 100 && !this.fadingIn) {
            this.opacity -= this.fadeSpeed * 2;
        }
        
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10 || (this.opacity <= 0 && !this.fadingIn)) {
            this.reset(false);
        }
    }
    
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();
    }
}

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
    
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    requestAnimationFrame(animateParticles);
}
animateParticles();


/* ==========================================================================
   4. NAVIGATION ACTIVE HIGHLIGHT & HEADER SHRINK
   ========================================================================== */
const sections = document.querySelectorAll('.scene');
const navLinks = document.querySelectorAll('header nav a');
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.style.padding = '12px 50px';
        header.style.background = 'rgba(11, 12, 16, 0.95)';
        header.style.borderBottom = '1px solid rgba(212, 175, 55, 0.1)';
    } else {
        header.style.padding = '20px 50px';
        header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.9) 20%, transparent)';
        header.style.borderBottom = 'none';
    }

    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= (sectionTop - sectionHeight / 3)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});