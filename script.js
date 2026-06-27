/**
 * MC Kevin Memorial Page — JS Interactions
 * Pure Vanilla JavaScript, organized and accessible.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================================================
  // 1. SELECTORS & STATE MANAGEMENT
  // ==========================================================================
  const navbar = document.getElementById("navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const revealItems = document.querySelectorAll(".reveal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let lastScrollY = window.scrollY;
  const MOBILE_BREAKPOINT = 768;

  // ==========================================================================
  // 2. NAVBAR SCROLL & STATE BEHAVIORS
  // ==========================================================================
  function handleNavbarState() {
    if (!navbar) return;

    const currentY = window.scrollY;

    // Shrink navbar after scrolling down slightly
    navbar.classList.toggle("scrolled", currentY > 50);

    // Dynamic show/hide navbar on scroll up/down
    if (currentY > lastScrollY + 10 && currentY > 150 && !navbar.classList.contains("open")) {
      navbar.classList.add("hide"); // Hide navbar scrolling down
    } else if (currentY < lastScrollY - 10 || currentY <= 50) {
      navbar.classList.remove("hide"); // Show navbar scrolling up
    }

    lastScrollY = currentY;
  }

  window.addEventListener("scroll", handleNavbarState, { passive: true });
  handleNavbarState(); // Initial check

  // ==========================================================================
  // 3. MOBILE MENU (HAMBURGER TOGGLE)
  // ==========================================================================
  if (menuToggle && navLinks && navbar) {
    function setMenuState(isOpen) {
      navbar.classList.toggle("open", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      
      // Prevent body scroll when menu is active on mobile
      if (isOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    function closeMenu() {
      setMenuState(false);
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = !navbar.classList.contains("open");
      setMenuState(isOpen);
    });

    // Close menu when clicking nav links
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (window.innerWidth > MOBILE_BREAKPOINT) return;
      if (!navbar.contains(event.target)) {
        closeMenu();
      }
    });

    // Keyboard ESC to close
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    // Auto-close on resize
    window.addEventListener("resize", () => {
      if (window.innerWidth > MOBILE_BREAKPOINT && navbar.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  // ==========================================================================
  // 4. ACCESSIBLE SMOOTH SCROLL FOR IN-PAGE LINKS
  // ==========================================================================
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      event.preventDefault();
      
      // Calculate offset for sticky navbar
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });

      // Manage focus for screen readers and keyboard users
      if (targetElement instanceof HTMLElement) {
        targetElement.setAttribute("tabindex", "-1");
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  // ==========================================================================
  // 5. INTERSECTION OBSERVER FOR REVEAL ANIMATIONS
  // ==========================================================================
  if (revealItems.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Trigger only once
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  }

  // ==========================================================================
  // 6. INTERACTIVE ALBUM OF MEMORIES (SPOTLIGHT FADE EFFECT)
  // ==========================================================================
  const spotlightImage = document.getElementById("spotlightImage");
  const spotlightTag = document.getElementById("spotlightTag");
  const spotlightCaption = document.getElementById("spotlightCaption");
  const thumbs = document.querySelectorAll(".album-thumb");

  if (spotlightImage && thumbs.length > 0) {
    let activeIndex = 0;
    let autoplayTimer = null;
    const autoplayInterval = 5000; // Autoplay every 5s

    function changeSpotlight(thumb, index) {
      if (thumb.classList.contains("active")) return;

      // Extract new content attributes
      const newSrc = thumb.dataset.img || thumb.getAttribute("data-img");
      const newTag = thumb.getAttribute("data-tag");
      const newCaption = thumb.getAttribute("data-caption");
      const newAlt = thumb.querySelector("img").getAttribute("alt");

      // Debug: log what's being applied for troubleshooting
      console.debug("changeSpotlight: index=", index, "newSrc=", newSrc, "newAlt=", newAlt);

      // 1. Remove active states
      thumbs.forEach((t) => t.classList.remove("active"));
      
      // 2. Add active to clicked thumb
      thumb.classList.add("active");
      activeIndex = index;

      // 3. Cinematic Fade transition (crossfade simulation)
      spotlightImage.classList.add("album-fade");

      setTimeout(() => {
        // Change content when image is invisible
        spotlightImage.src = newSrc;
        spotlightImage.alt = newAlt;
        console.debug("spotlightImage.src set to:", spotlightImage.src);
        
        if (spotlightTag) spotlightTag.textContent = newTag;
        if (spotlightCaption) spotlightCaption.textContent = newCaption;

        // Fade image back in
        spotlightImage.classList.remove("album-fade");
      }, 300); // Matches the 0.3s CSS transition
    }

    // Add click listeners to thumbs
    thumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        changeSpotlight(thumb, index);
        // User interaction: stop autoplay so chosen slide remains
        stopAutoplay();
      });

      // Keyboard space/enter accessibility
      thumb.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          changeSpotlight(thumb, index);
          // Stop autoplay after keyboard interaction as well
          stopAutoplay();
        }
      });
    });

    // Autoplay functionality
    function startAutoplay() {
      if (prefersReducedMotion) return;
      
      autoplayTimer = setInterval(() => {
        let nextIndex = (activeIndex + 1) % thumbs.length;
        changeSpotlight(thumbs[nextIndex], nextIndex);
      }, autoplayInterval);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Auto-pause loop when user is not viewing page to save CPU
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Start initial autoplay
    startAutoplay();
  }

  // ==========================================================================
  // 7. CUSTOM INTERACTIVE AUDIO PLAYER
  // ==========================================================================
  const tracks = [
    { title: "Cavalo de Troia", year: "2020", img: "img/cavalo.jpg", duration: "3:18", sec: 198, src: "sons/mc-kevin-cavalo-de-troia.mp3" },
    { title: "Pra Inveja e Tchau", year: "2020", img: "img/inveja.jpg", duration: "2:45", sec: 165, src: "sons/mc-kevin-e-mc-davi-pra-inveja-e-tchau.mp3" },
    { title: "Veracruz", year: "2019", img: "img/vera.jpg", duration: "3:04", sec: 184, src: "sons/MC Kevin - Veracruz (KondZilla)(MP3_160K).mp3" },
    { title: "O Menino Encantou a Quebrada", year: "2021", img: "img/quebrada.jpg", duration: "3:22", sec: 202, src: "sons/mc-kevin-o-menino-encantou-a-quebrada.mp3" }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let playSeconds = 0;
  let playTimer = null;

  // Web Audio Synth state
  let audioCtx = null;
  let osc = null;
  let gainNode = null;
  let lfo = null;
  let lfoGain = null;

  const playerDisc = document.getElementById("playerDisc");
  const playerVisualizer = document.getElementById("playerVisualizer");
  const playerCover = document.getElementById("playerCover");
  const playerTrackYear = document.getElementById("playerTrackYear");
  const playerTrackTitle = document.getElementById("playerTrackTitle");
  
  const playBtn = document.getElementById("playBtn");
  const playIcon = document.getElementById("playIcon");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const playerAudio = document.getElementById("playerAudio");
  const playerAudioNote = document.getElementById("playerAudioNote");
  
  const currentTimeEl = document.getElementById("currentTime");
  const durationTimeEl = document.getElementById("durationTime");
  const progressBarContainer = document.getElementById("progressBarContainer");
  const progressBarFill = document.getElementById("progressBarFill");
  const progressBarHandle = document.getElementById("progressBarHandle");
  
  const hitItems = document.querySelectorAll("#hitsGrid .hit-item");

  if (playerDisc && playBtn && hitItems.length > 0) {
    
    function loadTrack(index) {
      currentTrackIndex = index;
      const track = tracks[currentTrackIndex];
      
      // Update UI content
      if (playerCover) {
        playerCover.src = track.img;
        playerCover.alt = `Capa - ${track.title}`;
      }
      if (playerTrackYear) playerTrackYear.textContent = track.year;
      if (playerTrackTitle) playerTrackTitle.textContent = track.title;
      if (durationTimeEl) durationTimeEl.textContent = track.duration;
      
      // Load local audio source if available
      if (playerAudio) {
        const htmlSrc = hitItems[currentTrackIndex]?.dataset?.src || "";
        const audioSrc = track.src || htmlSrc;

        if (audioSrc) {
          playerAudio.src = audioSrc;
          playerAudio.load();
          if (playerAudioNote) {
            playerAudioNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> Pronto para tocar: ${track.title}`;
          }
        } else {
          playerAudio.removeAttribute("src");
          playerAudio.load();
          if (playerAudioNote) {
            playerAudioNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> MP3 local não encontrado para: ${track.title}`;
          }
        }
        playerAudio.currentTime = 0;
      }

      // Reset progress
      playSeconds = 0;
      updateProgressUI();
      
      // Update hits grid active classes
      hitItems.forEach((item, idx) => {
        item.classList.toggle("active", idx === currentTrackIndex);
        const btnIcon = item.querySelector(".hit-play-btn i");
        if (btnIcon) {
          if (idx === currentTrackIndex && isPlaying) {
            btnIcon.className = "fa-solid fa-pause";
          } else {
            btnIcon.className = "fa-solid fa-play";
          }
        }
      });
    }

    function updateProgressUI() {
      const track = tracks[currentTrackIndex];
      const currentTime = playerAudio && !isNaN(playerAudio.currentTime) ? playerAudio.currentTime : playSeconds;
      const duration = playerAudio && playerAudio.duration && !isNaN(playerAudio.duration) ? playerAudio.duration : track.sec;
      
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      if (currentTimeEl) {
        currentTimeEl.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }
      
      if (progressBarFill && progressBarHandle) {
        const pct = duration > 0 ? (currentTime / duration) * 100 : 0;
        progressBarFill.style.width = `${pct}%`;
        progressBarHandle.style.left = `${pct}%`;
      }
    }

    function startTimer() {
      if (playTimer) clearInterval(playTimer);
      
      playTimer = setInterval(() => {
        const track = tracks[currentTrackIndex];
        playSeconds++;
        
        if (playSeconds > track.sec) {
          nextTrack();
        } else {
          updateProgressUI();
        }
      }, 1000);
    }

    function stopTimer() {
      if (playTimer) {
        clearInterval(playTimer);
        playTimer = null;
      }
    }

    // Web Audio Synthesizer: creates a soft background lo-fi pad
    function startSynthSound() {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }

        const track = tracks[currentTrackIndex];

        // 1. Oscillator (Triangle wave for warm, clean sound)
        osc = audioCtx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(track.freq, audioCtx.currentTime);

        // 2. Gain Node (Low volume so it doesn't disturb)
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.035, audioCtx.currentTime);

        // 3. LFO (Low Frequency Osc for a trap-like pulsing feel)
        lfo = audioCtx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.setValueAtTime(1.8, audioCtx.currentTime); // 1.8Hz pulsation

        lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(0.012, audioCtx.currentTime);

        // Connect LFO to filter/amplitude to create movement
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);

        // Connect main synth line
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Start oscillators
        lfo.start();
        osc.start();
      } catch (e) {
        console.warn("Web Audio API blocked or not supported", e);
      }
    }

    function stopSynthSound() {
      try {
        if (osc) {
          osc.stop();
          osc.disconnect();
          osc = null;
        }
        if (lfo) {
          lfo.stop();
          lfo.disconnect();
          lfo = null;
        }
        if (gainNode) {
          gainNode.disconnect();
          gainNode = null;
        }
      } catch (e) {}
    }

    function playTrack() {
      const track = tracks[currentTrackIndex];
      const source = track.src || hitItems[currentTrackIndex]?.dataset?.src;
      if (!source || !playerAudio) return;

      isPlaying = true;
      if (playIcon) playIcon.className = "fa-solid fa-pause";
      if (playerDisc) playerDisc.classList.add("playing");
      if (playerVisualizer) playerVisualizer.classList.add("active");

      playerAudio.play().catch(() => {});
      
      const activeBtnIcon = hitItems[currentTrackIndex].querySelector(".hit-play-btn i");
      if (activeBtnIcon) activeBtnIcon.className = "fa-solid fa-pause";
    }
    function pauseTrack() {
      isPlaying = false;
      if (playIcon) playIcon.className = "fa-solid fa-play";
      if (playerDisc) playerDisc.classList.remove("playing");
      if (playerVisualizer) playerVisualizer.classList.remove("active");

      if (playerAudio) playerAudio.pause();
      stopTimer();
      
      const activeBtnIcon = hitItems[currentTrackIndex].querySelector(".hit-play-btn i");
      if (activeBtnIcon) activeBtnIcon.className = "fa-solid fa-play";
    }

    function nextTrack() {
      let nextIndex = (currentTrackIndex + 1) % tracks.length;
      loadTrack(nextIndex);
      if (isPlaying) {
        playTrack();
      }
    }

    function prevTrack() {
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) prevIndex = tracks.length - 1;
      loadTrack(prevIndex);
      if (isPlaying) {
        playTrack();
      }
    }

    // Event Listeners for Player Controls
    playBtn.addEventListener("click", () => {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack();
      }
    });

    if (nextBtn) nextBtn.addEventListener("click", nextTrack);
    if (prevBtn) prevBtn.addEventListener("click", prevTrack);

    // Click on progress bar to seek
    if (progressBarContainer) {
      progressBarContainer.addEventListener("click", (e) => {
        const rect = progressBarContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const pct = Math.max(0, Math.min(1, clickX / width));
        
        const track = tracks[currentTrackIndex];
        const duration = playerAudio && playerAudio.duration && !isNaN(playerAudio.duration) ? playerAudio.duration : track.sec;
        const seekTime = Math.floor(pct * duration);
        playSeconds = seekTime;
        if (playerAudio && track.src) {
          playerAudio.currentTime = seekTime;
        }
        updateProgressUI();
      });
    }

    if (playerAudio) {
      playerAudio.addEventListener("timeupdate", updateProgressUI);
      playerAudio.addEventListener("loadedmetadata", updateProgressUI);
      playerAudio.addEventListener("ended", () => {
        pauseTrack();
        if (playerAudioNote) {
          playerAudioNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> Faixa concluída: ${tracks[currentTrackIndex].title}`;
        }
      });
      playerAudio.addEventListener("error", () => {
        if (playerAudioNote) {
          playerAudioNote.innerHTML = `<i class="fa-solid fa-circle-info"></i> Erro carregando MP3 local. Verifique se o arquivo existe em sons/.`;
        }
      });
    }

    // Grid items click event
    hitItems.forEach((item, idx) => {
      const playBtn = item.querySelector(".hit-play-btn");
      const triggerElement = playBtn ? playBtn : item;
      
      triggerElement.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent duplicate triggers if clicking playBtn inside card
        if (currentTrackIndex === idx) {
          if (isPlaying) {
            pauseTrack();
          } else {
            playTrack();
          }
        } else {
          loadTrack(idx);
          playTrack();
        }
      });
    });

    // Initialize local audio track
    loadTrack(1);
  }
});
