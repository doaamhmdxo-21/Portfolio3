/**
 * ============================================================================
 * DOAA MOHAMED SALAH — PERSONAL PORTFOLIO JAVASCRIPT
 * Senior Frontend Developer & UI/UX Standards
 * Vanilla JavaScript + GSAP & Lenis Smooth Scroll Integration
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     0. ACCESSIBILITY & PREFERENCES CHECK
     ========================================================================== */
  // Ensure html.js class is set for progressive enhancement CSS
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ==========================================================================
     1. LENIS SMOOTH SCROLL & GSAP SETUP
     ========================================================================== */
  let lenis = null;

  if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Lenis is stopped while preloader is visible
    lenis.stop();

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      // Connect Lenis to ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      // Connect GSAP ticker to Lenis requestAnimationFrame
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ==========================================================================
     2. REDESIGNED CLEAN LOGO PRELOADER (Logo Animation Only)
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  const preloaderContainer = document.getElementById('preloaderLogoContainer');

  let hasExitedPreloader = false;

  // Check if visitor has already seen the preloader in this session (sessionStorage wrapped in try/catch)
  let hasSeenPreloader = false;
  try {
    hasSeenPreloader = sessionStorage.getItem('dms_preloader_seen') === 'true';
  } catch (err) {
    hasSeenPreloader = false;
  }

  function unlockAndStartPage() {
    document.body.classList.add('page-loaded');
    if (lenis) {
      lenis.start();
    }
    // Safety: If GSAP is not available, force reveal all hidden elements immediately
    if (typeof gsap === 'undefined' && typeof ScrollTrigger === 'undefined') {
      document.querySelectorAll('[data-reveal], .hero-word').forEach(el => {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    }
    initPageAnimations();
  }

  function exitPreloader() {
    if (hasExitedPreloader) return;
    hasExitedPreloader = true;

    // Mark as seen in this session
    try {
      sessionStorage.setItem('dms_preloader_seen', 'true');
    } catch (err) {}

    // Clean up skip event listeners
    window.removeEventListener('keydown', handleKeySkip);
    if (preloader) {
      preloader.removeEventListener('click', exitPreloader);
    }

    if (!preloader) {
      unlockAndStartPage();
      return;
    }

    if (typeof gsap !== 'undefined') {
      const exitTl = gsap.timeline({
        onComplete: () => {
          if (preloader && preloader.parentNode) {
            preloader.remove(); // Remove from DOM after finish
          }
        }
      });

      // Logo short exit: slight scale-up and fade
      exitTl.to(preloaderContainer, {
        scale: 1.12,
        opacity: 0,
        duration: 0.35,
        ease: 'power2.in'
      });

      // Preloader lifts away with smooth curtain slide-up
      exitTl.to(preloader, {
        yPercent: -100,
        duration: 0.65,
        ease: 'power3.inOut',
        onStart: () => {
          // Hero animations start right after/as reveal lifts
          unlockAndStartPage();
        }
      }, '-=0.15');
    } else {
      // Fallback if GSAP is unavailable
      preloader.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease';
      preloader.style.opacity = '0';
      preloader.style.transform = 'translateY(-100%)';
      unlockAndStartPage();
      setTimeout(() => {
        if (preloader && preloader.parentNode) preloader.remove();
      }, 650);
    }
  }

  function handleKeySkip(e) {
    exitPreloader();
  }

  // Handle preloader display logic
  if (hasSeenPreloader) {
    // Show only once per session: remove instantly if already seen
    if (preloader && preloader.parentNode) {
      preloader.remove();
    }
    unlockAndStartPage();
  } else if (preloader) {
    // Allow visitor to skip with a click or key press
    preloader.addEventListener('click', exitPreloader);
    window.addEventListener('keydown', handleKeySkip);

    // Respect prefers-reduced-motion: simple short fade only, no drawing or pulse
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(preloaderContainer, 
          { opacity: 0 }, 
          { 
            opacity: 1, 
            duration: 0.45, 
            ease: 'power2.out', 
            onComplete: () => {
              setTimeout(exitPreloader, 750);
            }
          }
        );
      } else {
        setTimeout(exitPreloader, 850);
      }
    } else {
      // Full GSAP Logo Animation (1.5s - 2.2s sequence)
      const svgLogo = preloader.querySelector('svg');

      const tl = gsap.timeline({
        delay: 0.1,
        onComplete: exitPreloader
      });

      if (svgLogo) {
        // Dynamic path length calculation: works with ANY swappable SVG asset
        const strokeElements = svgLogo.querySelectorAll('.logo-stroke, path, rect, circle, polygon, polyline, line');
        strokeElements.forEach((el) => {
          let length = 320;
          try {
            if (typeof el.getTotalLength === 'function') {
              length = el.getTotalLength();
            }
          } catch (e) {}
          gsap.set(el, {
            strokeDasharray: length,
            strokeDashoffset: length
          });
        });

        const fillElements = svgLogo.querySelectorAll('.logo-frame, .logo-path-d');
        const accentElements = svgLogo.querySelectorAll('.logo-accent');

        // Initial states
        gsap.set(preloaderContainer, { opacity: 0, scale: 0.9 });
        if (fillElements.length) gsap.set(fillElements, { fillOpacity: 0 });
        if (accentElements.length) gsap.set(accentElements, { scale: 0, opacity: 0, transformOrigin: 'center center' });

        // 1. Fade & scale in container
        tl.to(preloaderContainer, {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: 'power2.out'
        });

        // 2. Draw SVG strokes with stroke-dashoffset
        tl.to(strokeElements, {
          strokeDashoffset: 0,
          duration: 1.15,
          ease: 'power2.inOut',
          stagger: 0.1
        }, '-=0.15');

        // 3. Fill in shape
        if (fillElements.length) {
          tl.to(fillElements, {
            fillOpacity: (index, target) => target.classList.contains('logo-frame') ? 0.05 : 0.12,
            duration: 0.4,
            ease: 'power1.out'
          }, '-=0.35');
        }

        // 4. Pop accent dot
        if (accentElements.length) {
          tl.to(accentElements, {
            scale: 1,
            opacity: 1,
            duration: 0.35,
            ease: 'back.out(2)'
          }, '-=0.25');
        }

        // 5. Subtle pulse / shine
        tl.to(preloaderContainer, {
          scale: 1.04,
          duration: 0.3,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        });

      } else {
        // Fallback for raster PNG/external image
        gsap.set(preloaderContainer, { opacity: 0, scale: 0.92 });
        tl.to(preloaderContainer, {
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out'
        });
        tl.to(preloaderContainer, {
          scale: 1.04,
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut'
        });
      }

      // Safety failsafe timer so preloader never hangs
      setTimeout(() => {
        if (!hasExitedPreloader) exitPreloader();
      }, 3500);
    }
  }

  /* ==========================================================================
     3. CONSTANTS & CONFIGURATION
     ========================================================================== */
  
  /**
   * Official WhatsApp Phone Number (configured with country code +20 for Egypt)
   * Local: 01115137318 -> International: 201115137318
   */
  const WHATSAPP_PHONE = "201115137318"; 
  const WHATSAPP_DEFAULT_MSG = "Hi Doaa, I saw your portfolio and would love to connect with you regarding an opportunity!";

  // Set the dynamic WhatsApp link immediately
  const whatsappBtn = document.getElementById('whatsappContactBtn');
  if (whatsappBtn) {
    const encodedMsg = encodeURIComponent(WHATSAPP_DEFAULT_MSG);
    whatsappBtn.href = `https://wa.me/${WHATSAPP_PHONE.replace(/[^0-9]/g, '')}?text=${encodedMsg}`;
  }

  // Dynamic Current Year for Footer Copyright
  const currentYearSpan = document.getElementById('currentYear');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     4. TYPING EFFECT (Hero Section)
     ========================================================================== */
  const typedPhrases = [
    "Web Developer",
    "Data Engineer",
    "Team Leader",
    "Problem Solver"
  ];

  const typedElement = document.getElementById('typedElement');
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeText() {
    if (!typedElement) return;

    const currentPhrase = typedPhrases[phraseIndex];

    if (isDeleting) {
      typedElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      typedElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 110;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of word
      isDeleting = true;
      typingSpeed = 1800;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % typedPhrases.length;
      typingSpeed = 450;
    }

    setTimeout(typeText, typingSpeed);
  }

  typeText();

  /* ==========================================================================
     5. NAVBAR SCROLL EFFECT & ACTIVE LINK HIGHLIGHTING
     ========================================================================== */
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  const sections = document.querySelectorAll('section[id], header[id]');

  function handleNavbarScroll() {
    const scrollPos = window.scrollY;

    // Sticky glass border and background depth change
    if (navbarWrapper) {
      if (scrollPos > 40) {
        navbarWrapper.classList.add('scrolled');
      } else {
        navbarWrapper.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
      if (scrollPos > 400) {
        backToTopBtn.style.opacity = '1';
        backToTopBtn.style.visibility = 'visible';
      } else {
        backToTopBtn.style.opacity = '0';
        backToTopBtn.style.visibility = 'hidden';
      }
    }

    // Determine current section for active navbar link
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Smooth Back to Top click
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  /* ==========================================================================
     6. MOBILE DRAWER NAVIGATION (Accessible Hamburger & Trap)
     ========================================================================== */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerCloseBtn = document.getElementById('drawerCloseBtn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    mobileDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    drawerBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Lock background scroll
    if (lenis) lenis.stop(); // Stop Lenis while drawer is open
  }

  function closeMobileMenu() {
    mobileDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    drawerBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start(); // Resume Lenis
  }

  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', openMobileMenu);
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMobileMenu);
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeMobileMenu);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      closeMobileMenu();
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -70 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // Handle desktop nav links with Lenis
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: -70 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  /* ==========================================================================
     7. ANIMATED STAT COUNTERS
     ========================================================================== */
  const statCounters = document.querySelectorAll('.stat-counter');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    statCounters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 1600;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic animation formula
        const easeOutProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeOutProgress * target);

        counter.textContent = currentValue;

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  /* ==========================================================================
     8. ACCESSIBLE SKILLS TABS
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.skill-tab-btn');
  const tabPanels = document.querySelectorAll('.skill-tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetPanelId = button.getAttribute('aria-controls');

      // Update button states
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Update panel visibility
      tabPanels.forEach(panel => {
        if (panel.id === targetPanelId) {
          panel.classList.add('active');
          panel.removeAttribute('hidden');

          // Smooth re-animation of active tab items with GSAP
          if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            const items = panel.querySelectorAll('.skill-card, .lang-detail-card');
            gsap.fromTo(items,
              { y: 16, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.03, ease: 'power2.out' }
            );
          }
        } else {
          panel.classList.remove('active');
          panel.setAttribute('hidden', '');
        }
      });
    });

    // Keyboard Arrow Navigation for Tabs
    button.addEventListener('keydown', (e) => {
      const tabsArray = Array.from(tabButtons);
      const currentIndex = tabsArray.indexOf(button);

      let nextIndex = null;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabsArray.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabsArray.length) % tabsArray.length;
      }

      if (nextIndex !== null) {
        tabsArray[nextIndex].focus();
        tabsArray[nextIndex].click();
      }
    });
  });

  /* ==========================================================================
     9. PROJECTS MODAL DATA & CONTROLLER (Challenge → Action → Result)
     ========================================================================== */
  const projectsData = {
    shifa: {
      category: "Graduation Project • Web App • Team Leader",
      title: "Shifa – Clinic Appointments & Nearby Pharmacies Web App",
      tags: ["C#", "ASP.NET Core MVC", "SQL Server", "ADO.NET", "HTML5", "CSS3", "JavaScript", "Figma", "Git & GitHub"],
      bannerIcon: "fa-solid fa-graduation-cap",
      bannerText: "Graduation Project Distinctions • Architectural Documentation & Presentation",
      challenge: "Patients in Egypt consistently encounter severe friction when scheduling healthcare consultations: lack of verified specialist schedules, opaque pricing, double-booked appointments, and the frustrating difficulty of finding open nearby pharmacies holding prescribed medications immediately after leaving the clinic.",
      action: "As Team Leader and Web Developer, I steered the entire team throughout the system lifecycle. I formulated comprehensive systems analysis documents including Use Case models, Activity workflows, and Entity-Relationship Diagrams (ERD). I architected a normalized relational database spanning patients, doctors, appointment slots, reviews, and pharmacy inventories with foreign-key constraints. Utilizing ASP.NET Core MVC, C#, and ADO.NET, I engineered the core scheduling engine, authentication, and responsive user interfaces coordinated with Figma designs.",
      result: "Delivered a unified, high-performing clinic and pharmacy web ecosystem that successfully automated patient appointment booking and geolocation-based pharmacy search. The project earned distinction during academic presentation for its exceptional relational database normalization, comprehensive architectural documentation, and seamless team collaboration.",
      github: "https://github.com/doaamhmdxo-21"
    },
    sales: {
      category: "NTI AI Ambassadors Final Project • Power BI",
      title: "Sales Performance Intelligence Dashboard",
      tags: ["Power BI", "DAX", "Power Query", "Data Modeling", "ETL", "Excel"],
      bannerIcon: "fa-solid fa-award",
      bannerText: "NTI AI Ambassadors Program Final Capstone • Verified High Distinction",
      challenge: "Retail business executives lacked clear visibility into regional sales velocities, fluctuating profitability margins, and inventory performance across six primary Egyptian governorates, relying on fragmented spreadsheets that delayed strategic decisions.",
      action: "Extracted, cleaned, and standardized disparate transaction records using Power Query. Designed an efficient star-schema data model linking sales facts with calendar, regional geography, and product dimension tables. Authored advanced DAX measures to calculate dynamic month-over-month variances, cumulative annual revenue, and profit contribution percentages.",
      result: "Constructed an executive interactive dashboard tracking Total Sales exceeding 95K+ EGP and Net Profit surpassing 36K+ EGP. Equipped business stakeholders with multi-dimensional slicers, automated KPI variance cards, and actionable forecasting views that cut operational reporting turnaround by over 60%.",
      github: "https://github.com/doaamhmdxo-21"
    },
    clinic: {
      category: "Desktop Application • Systems Architecture",
      title: "Clinic Management System (Java & SQL)",
      tags: ["Java (OOP)", "NetBeans IDE", "Oracle Database", "MySQL", "SQL", "Relational Modeling"],
      bannerIcon: "fa-solid fa-shield-halved",
      bannerText: "Relational Schema Integrity & Desktop Architecture Execution",
      challenge: "Private medical practices needed an offline-first, tamper-proof clinic workstation capable of registering patients, booking doctor consultations, and maintaining strict audit histories without risk of duplicate entries or record corruption.",
      action: "Implemented an Object-Oriented software architecture in Java using NetBeans. Designed fully normalized relational schemas across Oracle and MySQL with referential constraints, primary/foreign keys, and data validation triggers. Integrated a responsive desktop UI communicating with the database via JDBC connections.",
      result: "Successfully established a reliable, error-free clinic desktop software that eliminates booking overlaps, secures patient medical histories against unauthorized tampering, and provides instant lookup of doctor availability.",
      github: "https://github.com/doaamhmdxo-21"
    },
    gpa: {
      category: "Academic Web Utility • Dynamic Algorithms",
      title: "Student GPA & Honors Classification Calculator",
      tags: ["JavaScript (ES6+)", "Algorithms", "CSS3 Glassmorphism", "HTML5", "Responsive UI"],
      bannerIcon: "fa-solid fa-calculator",
      bannerText: "Weighted Academic Credit-Hour Algorithm Implementation",
      challenge: "University students in credit-hour systems struggled with calculating accurate cumulative GPAs, forecasting graduation honors standing, and evaluating how retaking specific courses would influence their overall academic ranking.",
      action: "Developed a clean, client-side web utility applying institutional credit-hour weighted math. Created an intuitive dynamic table allowing users to add, update, and remove courses in real-time, instantly recalculating cumulative grade points, semester indices, and honors criteria using pure JavaScript.",
      result: "Provided university peers with a fast, zero-latency calculation engine featuring an engaging glassmorphic UI, helping students accurately model academic projections and graduation honors standing.",
      github: "https://github.com/doaamhmdxo-21"
    },
    calculator: {
      category: "Desktop Application • Stand-alone Utility",
      title: "Calculator Desktop Application",
      tags: ["C#", ".NET Windows Forms", "Algorithms", "UI/UX", "Mathematical Logic"],
      bannerIcon: "fa-solid fa-calculator",
      bannerText: "Stand-alone Desktop Calculator Application with Arithmetic Engine",
      challenge: "Users require a clean, responsive desktop utility capable of instant evaluation of arithmetic operations, operator precedence, continuous expressions, and error trapping (such as division by zero) without system latency.",
      action: "Engineered a stand-alone desktop calculator featuring custom event-driven arithmetic evaluation, keyboard event binding, input stream sanitization, decimal precision preservation, and a modern branded user interface designed with Teal & Copper accents.",
      result: "Successfully delivered an intuitive, zero-dependency desktop utility that executes compound operations reliably with zero latency and high usability.",
      github: "https://github.com/doaamhmdxo-21"
    }
  };

  const projectModal = document.getElementById('projectModal');
  const projectModalBackdrop = document.getElementById('projectModalBackdrop');
  const closeProjectModalBtn = document.getElementById('closeProjectModalBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');

  const modalCategory = document.getElementById('modalProjectCategory');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalTags = document.getElementById('modalProjectTags');
  const modalBanner = document.getElementById('modalProjectBanner');
  const modalChallengeText = document.getElementById('modalChallengeText');
  const modalActionText = document.getElementById('modalActionText');
  const modalResultText = document.getElementById('modalResultText');
  const modalGithubLink = document.getElementById('modalGithubLink');

  function openProjectModal(projectKey) {
    const data = projectsData[projectKey];
    if (!data) return;

    modalCategory.textContent = data.category;
    modalTitle.textContent = data.title;
    
    // Tech tags
    modalTags.innerHTML = '';
    data.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tech-tag';
      span.textContent = tag;
      modalTags.appendChild(span);
    });

    // Banner
    modalBanner.innerHTML = `
      <div class="banner-visual-box">
        <i class="${data.bannerIcon}"></i>
        <span>${data.bannerText}</span>
      </div>
    `;

    // Narrative CAR texts
    modalChallengeText.textContent = data.challenge;
    modalActionText.textContent = data.action;
    modalResultText.textContent = data.result;

    if (modalGithubLink) {
      modalGithubLink.href = data.github;
    }

    projectModal.classList.add('active');
    projectModalBackdrop.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    projectModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (lenis) lenis.stop();

    // Smooth GSAP modal window pop
    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      const modalWindow = projectModal.querySelector('.modal-window');
      gsap.fromTo(modalWindow,
        { scale: 0.92, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }

    // Trap focus on close button
    if (closeProjectModalBtn) closeProjectModalBtn.focus();
  }

  function closeProjectModal() {
    if (typeof gsap !== 'undefined' && !prefersReducedMotion && projectModal.classList.contains('active')) {
      const modalWindow = projectModal.querySelector('.modal-window');
      gsap.to(modalWindow, {
        scale: 0.94,
        opacity: 0,
        y: 15,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          projectModal.classList.remove('active');
          projectModalBackdrop.classList.remove('active');
          projectModal.setAttribute('aria-hidden', 'true');
          projectModalBackdrop.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
        }
      });
    } else {
      projectModal.classList.remove('active');
      projectModalBackdrop.classList.remove('active');
      projectModal.setAttribute('aria-hidden', 'true');
      projectModalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  }

  // Attach event listeners to all "View Details" buttons
  const viewDetailsButtons = document.querySelectorAll('.btn-view-details');
  viewDetailsButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projectKey = btn.getAttribute('data-project');
      openProjectModal(projectKey);
    });
  });

  if (closeProjectModalBtn) closeProjectModalBtn.addEventListener('click', closeProjectModal);
  if (modalDismissBtn) modalDismissBtn.addEventListener('click', closeProjectModal);
  if (projectModalBackdrop) projectModalBackdrop.addEventListener('click', closeProjectModal);

  /* ==========================================================================
     10. PRICING PLAN MODAL CONTROLLER
     ========================================================================== */
  const openPricingBtn = document.getElementById('openPricingBtn');
  const pricingModal = document.getElementById('pricingModal');
  const pricingModalBackdrop = document.getElementById('pricingModalBackdrop');
  const closePricingModalBtn = document.getElementById('closePricingModalBtn');
  const selectPkgButtons = document.querySelectorAll('.select-pkg-btn');

  function openPricingModal() {
    pricingModal.classList.add('active');
    pricingModalBackdrop.classList.add('active');
    pricingModal.setAttribute('aria-hidden', 'false');
    pricingModalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();

    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      const modalWindow = pricingModal.querySelector('.modal-window');
      gsap.fromTo(modalWindow,
        { scale: 0.92, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
    }

    if (closePricingModalBtn) closePricingModalBtn.focus();
  }

  function closePricingModal() {
    if (typeof gsap !== 'undefined' && !prefersReducedMotion && pricingModal.classList.contains('active')) {
      const modalWindow = pricingModal.querySelector('.modal-window');
      gsap.to(modalWindow, {
        scale: 0.94,
        opacity: 0,
        y: 15,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          pricingModal.classList.remove('active');
          pricingModalBackdrop.classList.remove('active');
          pricingModal.setAttribute('aria-hidden', 'true');
          pricingModalBackdrop.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
        }
      });
    } else {
      pricingModal.classList.remove('active');
      pricingModalBackdrop.classList.remove('active');
      pricingModal.setAttribute('aria-hidden', 'true');
      pricingModalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  }

  if (openPricingBtn) openPricingBtn.addEventListener('click', openPricingModal);
  if (closePricingModalBtn) closePricingModalBtn.addEventListener('click', closePricingModal);
  if (pricingModalBackdrop) pricingModalBackdrop.addEventListener('click', closePricingModal);

  selectPkgButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closePricingModal();
      const pkgName = btn.getAttribute('data-pkg');
      const messageTextarea = document.getElementById('senderMessage');
      if (messageTextarea) {
        messageTextarea.value = `Hi Doaa, I would like to inquire about the ${pkgName} package for my project.`;
        messageTextarea.focus();
      }
    });
  });

  /* ==========================================================================
     11. CERTIFICATE LIGHTBOX MODAL CONTROLLER
     ========================================================================== */
  const certLightboxModal = document.getElementById('certLightboxModal');
  const certLightboxBackdrop = document.getElementById('certLightboxBackdrop');
  const closeCertLightboxBtn = document.getElementById('closeCertLightboxBtn');
  const certLightboxImage = document.getElementById('certLightboxImage');
  const certLightboxTitle = document.getElementById('certLightboxTitle');
  const certLightboxIssuer = document.getElementById('certLightboxIssuer');
  const certLightboxTriggers = document.querySelectorAll('.cert-lightbox-trigger');

  function openCertLightbox(imgSrc, title, issuer) {
    if (!certLightboxModal || !certLightboxImage) return;

    certLightboxImage.src = imgSrc;
    certLightboxImage.alt = title;
    if (certLightboxTitle) certLightboxTitle.textContent = title;
    if (certLightboxIssuer) certLightboxIssuer.textContent = issuer;

    certLightboxModal.classList.add('active');
    certLightboxBackdrop.classList.add('active');
    certLightboxModal.setAttribute('aria-hidden', 'false');
    certLightboxBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();

    if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
      const modalWindow = certLightboxModal.querySelector('.modal-window');
      gsap.fromTo(modalWindow,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }
      );
    }

    if (closeCertLightboxBtn) closeCertLightboxBtn.focus();
  }

  function closeCertLightbox() {
    if (!certLightboxModal) return;

    if (typeof gsap !== 'undefined' && !prefersReducedMotion && certLightboxModal.classList.contains('active')) {
      const modalWindow = certLightboxModal.querySelector('.modal-window');
      gsap.to(modalWindow, {
        scale: 0.92,
        opacity: 0,
        y: 15,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: () => {
          certLightboxModal.classList.remove('active');
          certLightboxBackdrop.classList.remove('active');
          certLightboxModal.setAttribute('aria-hidden', 'true');
          certLightboxBackdrop.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
          if (lenis) lenis.start();
        }
      });
    } else {
      certLightboxModal.classList.remove('active');
      certLightboxBackdrop.classList.remove('active');
      certLightboxModal.setAttribute('aria-hidden', 'true');
      certLightboxBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  }

  certLightboxTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = trigger.getAttribute('data-cert-img');
      const title = trigger.getAttribute('data-cert-title');
      const issuer = trigger.getAttribute('data-cert-issuer');
      if (imgSrc) {
        openCertLightbox(imgSrc, title, issuer);
      }
    });
  });

  if (closeCertLightboxBtn) closeCertLightboxBtn.addEventListener('click', closeCertLightbox);
  if (certLightboxBackdrop) certLightboxBackdrop.addEventListener('click', closeCertLightbox);

  /* ==========================================================================
     12. ESCAPE KEY MODAL DISMISSAL & ACCESSIBILITY
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (certLightboxModal && certLightboxModal.classList.contains('active')) {
        closeCertLightbox();
      }
      if (projectModal && projectModal.classList.contains('active')) {
        closeProjectModal();
      }
      if (pricingModal && pricingModal.classList.contains('active')) {
        closePricingModal();
      }
      if (mobileDrawer && mobileDrawer.classList.contains('active')) {
        closeMobileMenu();
      }
    }
  });

  /* ==========================================================================
     13. CONTACT FORM CLIENT-SIDE VALIDATION & FEEDBACK
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const senderName = document.getElementById('senderName');
  const senderEmail = document.getElementById('senderEmail');
  const senderMessage = document.getElementById('senderMessage');
  const formSuccessMessage = document.getElementById('formSuccessMessage');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  if (contactForm) {
    // Real-time input clearing
    [senderName, senderEmail, senderMessage].forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
        const errSpan = document.getElementById(`${input.name}Error`);
        if (errSpan) errSpan.classList.remove('active');
      });
    });

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate Name
      if (!senderName.value.trim() || senderName.value.trim().length < 2) {
        senderName.classList.add('is-invalid');
        nameError.classList.add('active');
        isValid = false;
      } else {
        senderName.classList.remove('is-invalid');
        nameError.classList.remove('active');
      }

      // Validate Email
      if (!validateEmail(senderEmail.value.trim())) {
        senderEmail.classList.add('is-invalid');
        emailError.classList.add('active');
        isValid = false;
      } else {
        senderEmail.classList.remove('is-invalid');
        emailError.classList.remove('active');
      }

      // Validate Message
      if (!senderMessage.value.trim() || senderMessage.value.trim().length < 10) {
        senderMessage.classList.add('is-invalid');
        messageError.classList.add('active');
        isValid = false;
      } else {
        senderMessage.classList.remove('is-invalid');
        messageError.classList.remove('active');
      }

      if (isValid) {
        const submitBtn = document.getElementById('formSubmitBtn');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>`;
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span class="btn-text">Send Message</span> <i class="fa-solid fa-paper-plane btn-icon"></i>`;
          }

          if (formSuccessMessage) {
            formSuccessMessage.classList.add('active');
          }

          contactForm.reset();

          // Automatically hide success notification after 7 seconds
          setTimeout(() => {
            if (formSuccessMessage) {
              formSuccessMessage.classList.remove('active');
            }
          }, 7000);
        }, 600);
      }
    });
  }

  /* ==========================================================================
     14. DESKTOP CUSTOM CURSOR
     ========================================================================== */
  const customCursor = document.getElementById('customCursor');
  const cursorFollower = document.getElementById('customCursorFollower');

  if (window.matchMedia('(pointer: fine)').matches && customCursor && cursorFollower) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      customCursor.style.opacity = '1';
      cursorFollower.style.opacity = '1';

      customCursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;

      cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Hover scale effect over interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .glass-card');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(1.6)`;
        cursorFollower.style.borderColor = 'rgba(236, 72, 153, 0.9)';
      });
      el.addEventListener('mouseleave', () => {
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%) scale(1)`;
        cursorFollower.style.borderColor = 'rgba(236, 72, 153, 0.6)';
      });
    });

    document.addEventListener('mouseleave', () => {
      customCursor.style.opacity = '0';
      cursorFollower.style.opacity = '0';
    });
  }

  /* ==========================================================================
     15. THEME TOGGLE (Light / Dark with localStorage)
     ========================================================================== */
  const themeToggle = document.getElementById('themeToggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved theme or system preference
  const savedTheme = localStorage.getItem('dms_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('dms_theme', newTheme);
    });
  }

  /* ==========================================================================
     16. EN / AR LANGUAGE TOGGLE WITH RTL SUPPORT
     ========================================================================== */
  const langToggle = document.getElementById('langToggle');
  const langLabel = document.getElementById('langLabel');

  const translations = {
    en: {
      langBtn: "AR",
      heroGreeting: "Available for Opportunities",
      heroHeadlinePrefix: "Passionate ",
      heroTagline: "\"Building data pipelines and modern web applications, from raw data to working products.\"",
      exploreWork: "Explore My Work",
      downloadCv: "Download CV",
      aboutTag: "My Journey",
      aboutTitle: "Behind the Code & Data",
      aboutSubtitle: "Bridging business intelligence, relational architecture, and modern web applications.",
      storyTitle: "From BIS Foundations to Impactful Solutions",
      storyP1: "I am a Web Developer, Data Engineer, and Business Information Systems (BIS) graduate from the Faculty of Commerce & Business Administration. My academic journey provided a comprehensive grounding in systems analysis & design (crafting use case diagrams, activity workflows, ERD, and normalized relational schemas), object-oriented programming in Java, relational database engineering, and business intelligence.",
      storyP2: "As a project leader, I spearheaded the end-to-end development of Shifa — a modern web application for booking clinic appointments and locating nearby pharmacies. Complementing this, I completed rigorous certifications including the Microsoft Data Engineer (MSDE) track through DEPI (200 hours) and the AI Ambassadors program through NTI (80 hours).",
      storyP3: "I thrive at the intersection where clean, maintainable web products meet high-performance data models and automated data pipelines. I am actively open to Web Developer, Data Engineering, or Data Analyst roles.",
      languagesTitle: "Language Proficiency",
      langAr: "Arabic",
      langArLevel: "Native",
      langEn: "English",
      langEnLevel: "Upper-Intermediate (B2)",
      coreCompetencies: "Core Competencies & Discipline",
      statProjects: "Featured Projects",
      statPrograms: "Training Programs",
      statDE: "Data Engineering Training",
      statAI: "AI Training (NTI)",
      eduTag: "Academic Foundation",
      eduTitle: "Education & Specialization",
      eduSubtitle: "Solid grounding combining business commerce strategy with advanced information technology.",
      graduated: "Graduated",
      degreeTitle: "Bachelor's Degree in Business Information Systems (BIS)",
      facultyName: "Faculty of Commerce & Business Administration",
      eduDesc: "A specialized dual-discipline curriculum marrying organizational operations, financial workflows, and business strategy with computer science, software engineering architectures, database management systems, and analytical intelligence.",
      coreFocusAreas: "Core Focus Areas & Applied Knowledge",
      certTag: "Credentials",
      certTitle: "Professional Certifications & Training",
      certSubtitle: "Intensive hands-on programs delivered by top governmental initiatives and industry leaders.",
      skillsTag: "Technical Arsenal",
      skillsTitle: "Skills & Competencies",
      skillsSubtitle: "Real brand logos, categorized into intuitive tabs to maintain visual clarity.",
      tabTechnical: "Technical Skills",
      tabTools: "Development Tools",
      tabSoft: "Soft Skills",
      tabLanguages: "Languages",
      projectsTag: "Crafted Work",
      projectsTitle: "Featured Projects",
      projectsSubtitle: "A curated selection of web applications, business intelligence dashboards, and software systems.",
    freelanceTag: "Hire Me Online",
    freelanceTitle: "Find Me on Freelance Platforms",
    freelanceSubtitle: "Connect with me on leading regional and global freelance networks for contracts, software development, and data consulting.",
      servicesTag: "What I Deliver",
      servicesTitle: "Services & Offerings",
      servicesSubtitle: "Tailored digital engineering and analytics solutions crafted to drive measurable value.",
      viewPricing: "View Pricing Plans & Packages",
      testTag: "Endorsements",
      testTitle: "Testimonials & Peer Feedback",
      testSubtitle: "Reflections from academic supervisors and project team colleagues.",
      contactTag: "Let's Connect",
      contactTitle: "Get In Touch",
      contactSubtitle: "Have a project, role opening, or collaboration in mind? Reach out directly.",
      directChannels: "Direct Communication",
      channelsDesc: "Choose the communication channel that works best for you. I respond promptly to all messages.",
      sendMessage: "Send a Message",
      sendDesc: "Fill in the form below and I will get back to you within 24 hours.",
      formName: "Your Full Name",
      formEmail: "Email Address",
      formMessage: "Your Message",
      btnSend: "Send Message",
      thankYou: "Thank you for your message!",
      msgSentNotice: "Your message has been received. I look forward to connecting with you shortly!",
      footerNav: "Quick Navigation",
      footerConnect: "Connect"
    },
    ar: {
      langBtn: "EN",
      heroGreeting: "متاحة لفرص العمل والمشاريع",
      heroHeadlinePrefix: "شغوفة بـ ",
      heroTagline: "\"بناء خطوط معالجة وتدفق البيانات وتطبيقات الويب الحديثة، من البيانات الأولية إلى منتجات رقمية متكاملة.\"",
      exploreWork: "استكشف أعمالي",
      downloadCv: "تحميل السيرة الذاتية",
      aboutTag: "مسيرتي المهنية",
      aboutTitle: "ما وراء الكود وهندسة البيانات",
      aboutSubtitle: "الربط بين ذكاء الأعمال وهندسة وتدفق البيانات العلائقية وتطبيقات الويب الحديثة.",
      storyTitle: "من أساسيات نظم المعلومات إلى حلول وهندسة برمجية وبيانية واقعية",
      storyP1: "مطورة ويب ومهندسة بيانات (Data Engineer) وخريجة نظم معلومات الأعمال (BIS) من كلية التجارة وإدارة الأعمال. منحتني دراستي أساساً راسخاً في تحليل وتصميم النظم، والبرمجة كائنية التوجه، وتصميم قواعد البيانات العلائقية، وخطوط معالجة وتدفق البيانات (ETL Pipelines)، وذكاء الأعمال.",
      storyP2: "قدت كقائدة للفريق مشروع 'شفاء' — منصة متكاملة لحجز مواعيد العيادات واستكشاف الصيدليات القريبة متصلة بقواعد بيانات SQL Server عبر ADO.NET. بالإضافة لذلك، أتممت مسار Microsoft Data Engineer (MSDE) عبر مبادرة رواد مصر الرقمية DEPI (200 ساعة) وسفراء الذكاء الاصطناعي عبر معهد NTI (80 ساعة).",
      storyP3: "أتميز في نقطة الالتقاء التي تجمع بين واجهات الويب النظيفة وسريعة الاستجابة وخطوط معالجة ونمذجة البيانات عالية الكفاءة. أبحث عن فرص في تطوير الويب، هندسة البيانات (Data Engineering)، أو تحليل البيانات.",
      languagesTitle: "اللغات المتقنة",
      langAr: "العربية",
      langArLevel: "اللغة الأم",
      langEn: "الإنجليزية",
      langEnLevel: "فوق المتوسط (B2)",
      coreCompetencies: "المهارات والركائز الأساسية",
      statProjects: "مشاريع متميزة",
      statPrograms: "برامج تدريبية",
      statDE: "تدريب هندسة البيانات",
      statAI: "تدريب الذكاء الاصطناعي (NTI)",
      eduTag: "المؤهل الأكاديمي",
      eduTitle: "التعليم والتخصص",
      eduSubtitle: "تكامل استراتيجي بين إدارة الأعمال والعلوم التجارية وأحدث تقنيات تكنولوجيا المعلومات.",
      graduated: "تم التخرج",
      degreeTitle: "بكالوريوس نظم معلومات الأعمال (BIS)",
      facultyName: "كلية التجارة وإدارة الأعمال",
      eduDesc: "مناهج متخصصة تجمع بين العمليات المؤسسية والاستراتيجيات التجارية وهندسة البرمجيات وأنظمة إدارة قواعد البيانات والتحليلات الذكية.",
      coreFocusAreas: "المجالات والتطبيقات الأساسية",
      certTag: "الشهادات والاعتمادات",
      certTitle: "الشهادات والبرامج التدريبية المعتمدة",
      certSubtitle: "برامج مكثفة معتمدة من أبرز المبادرات الوطنية والمعاهد المتخصصة.",
      skillsTag: "الترسانة التقنية",
      skillsTitle: "المهارات والكفاءات",
      skillsSubtitle: "شعارات العلامات التجارية الحقيقية، موزعة على تبويبات لتجربة بصرية مريحة.",
      tabTechnical: "المهارات التقنية",
      tabTools: "أدوات التطوير",
      tabSoft: "المهارات الشخصية",
      tabLanguages: "اللغات",
      projectsTag: "أعمالي",
      projectsTitle: "المشاريع المميزة",
      projectsSubtitle: "مجموعة مختارة من تطبيقات الويب، لوحات ذكاء الأعمال، والأنظمة البرمجية.",
    freelanceTag: "وظفني عبر الإنترنت",
    freelanceTitle: "تجدني على منصات العمل الحر",
    freelanceSubtitle: "تواصل معي عبر أبرز منصات العمل الحر الإقليمية والعالمية لعقود المشاريع وتطوير البرمجيات واستشارات البيانات.",
      servicesTag: "ما أقدمه",
      servicesTitle: "الخدمات والحلول",
      servicesSubtitle: "حلول رقمية وتحليلية مصممة خصيصاً لتحقيق نتائج ملموسة وقيمة مضافة.",
      viewPricing: "عرض خطط وباقات الأسعار",
      testTag: "التوصيات والآراء",
      testTitle: "شهادات المشرفين والزملاء",
      testSubtitle: "آراء موثقة من المشرفين الأكاديميين وزملاء فرق العمل الهندسية.",
      contactTag: "تواصل معي",
      contactTitle: "ابدأ محادثة",
      contactSubtitle: "هل لديك فكرة مشروع، شاغر وظيفي، أو فرصة تعاون؟ تواصل معي مباشرة.",
      directChannels: "قنوات التواصل المباشر",
      channelsDesc: "اختر القناة الأنسب لك. أرد بسرعة على كافة الرسائل والاستفسارات.",
      sendMessage: "أرسل رسالة",
      sendDesc: "املأ النموذج وسأتواصل معك في أقرب وقت خلال 24 ساعة.",
      formName: "الاسم بالكامل",
      formEmail: "البريد الإلكتروني",
      formMessage: "رسالتك",
      btnSend: "إرسال الرسالة",
      thankYou: "شكراً لرسالتك!",
      msgSentNotice: "تم استلام رسالتك بنجاح، وسأتواصل معك قريباً جداً!",
      footerNav: "روابط سريعة",
      footerConnect: "التواصل"
    }
  };

  let currentLang = localStorage.getItem('dms_lang') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('dms_lang', lang);

    const isRtl = lang === 'ar';
    htmlRoot.setAttribute('lang', lang);
    htmlRoot.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    if (langLabel) {
      langLabel.textContent = translations[lang].langBtn;
    }

    // Replace all data-i18n elements
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });

    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }

  // Initial language application
  applyLanguage(currentLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'ar' : 'en';
      applyLanguage(nextLang);
    });
  }

  /* ==========================================================================
     16.5. AMBIENT INTERACTIVE CANVAS BACKGROUND (#ambientCanvas)
     Physics-based floating constellation with cursor gravity & click pulse
     ========================================================================== */
  function initInteractiveBackground() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let animationFrameId = null;
    let isTabVisible = true;

    // Mouse coordinates
    const mouse = { x: -1000, y: -1000, radius: 160 };
    const clickPulses = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    }, { passive: true });

    window.addEventListener('click', (e) => {
      clickPulses.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 180,
        opacity: 0.75,
        speed: 4.5
      });
    }, { passive: true });

    // Node Count scaled by screen width
    const nodeCount = Math.min(Math.floor(width / 32), 48);
    const nodes = [];

    const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark';

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        baseRadius: Math.random() * 2.2 + 1.2,
        colorType: Math.random() > 0.35 ? 'primary' : 'accent',
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameId) {
        render();
      }
    });

    let time = 0;
    function render() {
      if (!isTabVisible) {
        animationFrameId = null;
        return;
      }

      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      const dark = isDarkMode();
      const primaryColor = dark ? 'rgba(79, 176, 198, ' : 'rgba(14, 94, 90, ';
      const accentColor = dark ? 'rgba(217, 154, 120, ' : 'rgba(200, 85, 61, ';

      // Update & render shockwave click pulses
      for (let p = clickPulses.length - 1; p >= 0; p--) {
        const pulse = clickPulses[p];
        pulse.radius += pulse.speed;
        pulse.opacity -= 0.018;

        if (pulse.opacity <= 0 || pulse.radius >= pulse.maxRadius) {
          clickPulses.splice(p, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = accentColor + (pulse.opacity * 0.55) + ')';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Drift motion
        n.x += n.vx;
        n.y += n.vy;

        // Wrap boundaries
        if (n.x < -10) n.x = width + 10;
        if (n.x > width + 10) n.x = -10;
        if (n.y < -10) n.y = height + 10;
        if (n.y > height + 10) n.y = -10;

        // Mouse interaction (gentle attraction / soft displacement)
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let currentRadius = n.baseRadius;
        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          n.x -= (dx / dist) * force * 1.2;
          n.y -= (dy / dist) * force * 1.2;
          currentRadius += force * 2;
        }

        // Click pulse displacement
        for (let p = 0; p < clickPulses.length; p++) {
          const pulse = clickPulses[p];
          const pdx = n.x - pulse.x;
          const pdy = n.y - pulse.y;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (Math.abs(pdist - pulse.radius) < 35) {
            n.x += (pdx / (pdist || 1)) * 2.5;
            n.y += (pdy / (pdist || 1)) * 2.5;
          }
        }

        // Draw particle node
        const nodeAlpha = (0.45 + Math.sin(time + n.pulseOffset) * 0.25);
        ctx.beginPath();
        ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = (n.colorType === 'primary' ? primaryColor : accentColor) + nodeAlpha + ')';
        ctx.fill();

        // Connect nearby nodes with delicate filaments
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const connDx = n.x - n2.x;
          const connDy = n.y - n2.y;
          const connDist = Math.sqrt(connDx * connDx + connDy * connDy);

          const maxDist = 125;
          if (connDist < maxDist) {
            const lineAlpha = (1 - connDist / maxDist) * (dark ? 0.22 : 0.14);
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = primaryColor + lineAlpha + ')';
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }

    render();
  }

  /* ==========================================================================
     16.6. HERO PROFILE 3D TILT & KINETIC MICRO-INTERACTIONS
     ========================================================================== */
  function initHeroInteractive() {
    const heroVisual = document.querySelector('.hero-visual');
    const profileCard = document.querySelector('.hero-profile-card');
    if (!heroVisual || !profileCard) return;

    let targetRotX = 0, targetRotY = 0;
    let currentRotX = 0, currentRotY = 0;

    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / (rect.width / 2)) * 12;
      targetRotX = -(y / (rect.height / 2)) * 12;
    });

    heroVisual.addEventListener('mouseleave', () => {
      targetRotX = 0;
      targetRotY = 0;
    });

    function updateTilt() {
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      profileCard.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg)`;
      requestAnimationFrame(updateTilt);
    }
    updateTilt();

    // Satellites click micro-pulse
    document.querySelectorAll('.orbit-satellite').forEach(sat => {
      sat.addEventListener('click', () => {
        sat.style.transform = 'scale(1.4)';
        setTimeout(() => {
          sat.style.transform = '';
        }, 300);
      });
    });
  }

  /* ==========================================================================
     16.7. INTERACTIVE 3D SKILL CARDS (Cursor Spotlight & Tactile Click)
     ========================================================================== */
  function initSkillCardsInteractive() {
    const skillCards = document.querySelectorAll('.skill-card');
    if (!skillCards.length) return;

    skillCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const tiltX = -((y - centerY) / centerY) * 7;
        const tiltY = ((x - centerX) / centerX) * 7;
        card.style.transform = `perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px) scale(1.05)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });

      card.addEventListener('click', () => {
        card.classList.add('skill-active');
        setTimeout(() => {
          card.classList.remove('skill-active');
        }, 650);
      });
    });
  }

  /* ==========================================================================
     16.8. INTERCONNECTING ENERGY CONDUITS SCROLL ANIMATIONS
     ========================================================================== */
  function initEnergyConduits() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('.section-energy-bridge').forEach(bridge => {
      gsap.fromTo(bridge, 
        { opacity: 0.3, scaleX: 0.85 },
        {
          opacity: 1,
          scaleX: 1,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bridge,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });
  }

  // Initialize Portfolio Animations Suite
  initInteractiveBackground();
  initHeroInteractive();
  initSkillCardsInteractive();
  initEnergyConduits();


  /* ==========================================================================
     16.9. INTERACTIVE 3D TILT FOR PROJECT & CERTIFICATION CARDS
     ========================================================================== */
  function initInteractiveCardTilts() {
    // 3D Tilt for Project Cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = -(y / (rect.height / 2)) * 6.5;
        const tiltY = (x / (rect.width / 2)) * 6.5;
        card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    // 3D Tilt for Certification Cards
    const certCards = document.querySelectorAll('.cert-card');
    certCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const tiltX = -(y / (rect.height / 2)) * 5.5;
        const tiltY = (x / (rect.width / 2)) * 5.5;
        card.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  initInteractiveCardTilts();


  /* ==========================================================================
     17. GSAP & SCROLLTRIGGER REVEAL SYSTEM (Executed after Preloader)
     ========================================================================== */
  function initPageAnimations() {
    // If user prefers reduced motion, ensure full visibility without transforms
    if (prefersReducedMotion) {
      document.querySelectorAll('[data-reveal], .hero-word').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      animateCounters();
      return;
    }

    // If GSAP is not available, fallback: force-reveal all elements immediately
    if (typeof gsap === 'undefined') {
      document.querySelectorAll('[data-reveal], .hero-word').forEach(el => {
        el.classList.add('revealed');
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.transition = 'none';
      });
      // Also reveal any elements that might be hidden by other means
      document.querySelectorAll('.hero-badge, .hero-headline, .hero-tagline, .hero-cta-group').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      animateCounters();
      return;
    }

    // 17.1. Hero Section Staggered Entrance Timeline
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    const heroWords = document.querySelectorAll('.hero-word');
    if (heroWords.length > 0) {
      heroTimeline.fromTo(heroWords,
        { y: 35, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.12 }
      );
    }

    heroTimeline.fromTo(['.hero-badge', '.hero-headline', '.hero-tagline', '.hero-cta-group'],
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.75, stagger: 0.1 },
      '-=0.45'
    );

    heroTimeline.fromTo('.hero-profile-card',
      { scale: 0.92, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 0.9, ease: 'back.out(1.2)' },
      '-=0.55'
    );

    heroTimeline.fromTo('.floating-badge',
      { scale: 0.8, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.65, stagger: 0.14, ease: 'back.out(1.4)' },
      '-=0.5'
    );

    // 17.2. Magnetic Buttons (Desktop only: pointer: fine)
    if (!isTouchDevice) {
      const ctaButtons = document.querySelectorAll('.hero-cta-group .btn');
      ctaButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.32, y: y * 0.32, duration: 0.25, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1.1, 0.4)' });
        });
      });
    }

    // 17.3. Parallax Floating Shapes & Blobs
    if (typeof ScrollTrigger !== 'undefined' && !isTouchDevice) {
      gsap.to('.badge-1', {
        y: -40,
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.badge-2', {
        y: -60,
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 }
      });
      gsap.to('.badge-3', {
        y: -35,
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      gsap.to('.blob-1', {
        y: 130,
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
      });
      gsap.to('.blob-2', {
        y: -110,
        scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 1.5 }
      });

      // Desktop visual canvas 3D tilt on mousemove
      const visualCanvas = document.querySelector('.visual-canvas');
      if (visualCanvas) {
        window.addEventListener('mousemove', (e) => {
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const deltaX = (e.clientX - centerX) / centerX;
          const deltaY = (e.clientY - centerY) / centerY;
          gsap.to(visualCanvas, {
            rotationY: deltaX * 7,
            rotationX: -deltaY * 7,
            transformPerspective: 1000,
            duration: 0.6,
            ease: 'power1.out'
          });
        });
      }
    }

    // 17.4. Scroll-Triggered Reveals for Section Headers
    if (typeof ScrollTrigger !== 'undefined') {
      document.querySelectorAll('.section-header').forEach(header => {
        gsap.fromTo(header.children,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 86%',
              once: true
            }
          }
        );
      });

      // 17.5. About Grid Reveal
      const aboutGrid = document.querySelector('.about-grid');
      if (aboutGrid) {
        gsap.fromTo('.about-story-card',
          { x: -35, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: { trigger: aboutGrid, start: 'top 82%', once: true }
          }
        );

        gsap.fromTo('.checklist-card',
          { x: 35, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: { trigger: aboutGrid, start: 'top 82%', once: true }
          }
        );
      }

      // 17.6. Stats Grid & Counter Animation via ScrollTrigger
      const statsGrid = document.querySelector('.stats-grid');
      if (statsGrid) {
        ScrollTrigger.create({
          trigger: statsGrid,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.fromTo('.stat-card',
              { y: 25, opacity: 0, scale: 0.94 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.65,
                stagger: 0.1,
                ease: 'back.out(1.3)',
                onComplete: () => {
                  animateCounters();
                }
              }
            );
          }
        });
      }

      // 17.7. Education Card
      const eduCard = document.querySelector('.education-card');
      if (eduCard) {
        gsap.fromTo(eduCard,
          { y: 40, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: eduCard, start: 'top 85%', once: true }
          }
        );
      }

      // 17.8. Certifications Grid Dynamic 3D Pop Entrance
      const certCards = document.querySelectorAll('.cert-grid .cert-card');
      if (certCards.length > 0) {
        gsap.fromTo(certCards,
          { y: 55, opacity: 0, rotateY: -8, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            rotateY: 0,
            scale: 1,
            duration: 0.85,
            stagger: 0.16,
            ease: 'back.out(1.3)',
            scrollTrigger: { trigger: '.cert-grid', start: 'top 85%', once: true }
          }
        );
      }

      // 17.9. Skills Matrix
      const activeSkillsMatrix = document.querySelector('.skill-tab-panel.active .skills-matrix');
      if (activeSkillsMatrix) {
        gsap.fromTo(activeSkillsMatrix.children,
          { y: 20, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: { each: 0.03, from: 'start' },
            ease: 'power2.out',
            scrollTrigger: { trigger: '.skills-tab-nav', start: 'top 85%', once: true }
          }
        );
      }

      // 17.10. Project Cards Dynamic 3D Stagger Entrance
      const projectCards = document.querySelectorAll('.projects-grid .project-card');
      if (projectCards.length > 0) {
        gsap.fromTo(projectCards,
          { y: 60, opacity: 0, rotateX: 12, scale: 0.94 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.14,
            ease: 'back.out(1.2)',
            scrollTrigger: { trigger: '.projects-grid', start: 'top 85%', once: true }
          }
        );
      }

      // 17.10b. Footer Freelance Platform Cards Scroll Entrance
      const freelanceCards = document.querySelectorAll('.footer-freelance-card');
      if (freelanceCards.length > 0) {
        gsap.fromTo(freelanceCards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.footer-freelance-grid', start: 'top 88%', once: true }
          }
        );
      }

      // 17.11. Services Grid
      const serviceCards = document.querySelectorAll('.services-grid .service-card');
      if (serviceCards.length > 0) {
        gsap.fromTo(serviceCards,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.services-grid', start: 'top 85%', once: true }
          }
        );
      }

      // 17.12. Testimonials Grid
      const testimonialCards = document.querySelectorAll('.testimonials-grid .testimonial-card');
      if (testimonialCards.length > 0) {
        gsap.fromTo(testimonialCards,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.testimonials-grid', start: 'top 85%', once: true }
          }
        );
      }

      // 17.13. Contact Grid
      const contactGrid = document.querySelector('.contact-grid');
      if (contactGrid) {
        gsap.fromTo('.contact-info-column',
          { x: -35, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: contactGrid, start: 'top 85%', once: true }
          }
        );
        gsap.fromTo('.contact-form-column',
          { x: 35, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: contactGrid, start: 'top 85%', once: true }
          }
        );
      }
    }
  }

});
