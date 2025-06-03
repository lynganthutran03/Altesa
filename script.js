document.addEventListener('DOMContentLoaded', () => {
    heroSlider();
    videoPlayer();
    countUpStats();
    new ScrollDarken();
    handleSubscribe();
    const { modal, modalImg, closeBtn } = createModal();
    setupEventListeners(modal, modalImg, closeBtn);
    initFAQAccordion();
    initMobileMenu();
    setupSelectIconToggle('.custom-select-wrapper');
});

// Select Icon Rotate
function setupSelectIconToggle(wrapperSelector) {
    const wrapper = document.querySelector(wrapperSelector);
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.custom-select-trigger');
    const options = wrapper.querySelector('.custom-options');
    const icon = trigger.querySelector('i');
    const hiddenInput = wrapper.querySelector('input[type="hidden"]');
    const span = trigger.querySelector('span');

    let isOpen = false;

    trigger.addEventListener('click', () => {
        isOpen = !isOpen;
        options.classList.toggle('open');

        icon.classList.toggle('fa-sort-down', !isOpen);
        icon.classList.toggle('fa-sort-up', isOpen);
    });

    wrapper.querySelectorAll('.custom-option').forEach(option => {
        option.addEventListener('click', () => {
            span.textContent = option.textContent;
            hiddenInput.value = option.dataset.value;
            options.classList.remove('open');
            isOpen = false;

            icon.classList.add('fa-sort-down');
            icon.classList.remove('fa-sort-up');
        });
    });

    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            options.classList.remove('open');
            isOpen = false;
            icon.classList.add('fa-sort-down');
            icon.classList.remove('fa-sort-up');
        }
    })
}

// Hero Slider with Video Support
function heroSlider() {
    const slides = document.querySelectorAll('.hero-slider .slide');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 4000;

    function showSlide(index) {
        const currentVideo = slides[currentSlide].querySelector('video, iframe');
        if (currentVideo) {
            if (currentVideo.tagName === 'VIDEO') currentVideo.pause();
            else if (currentVideo.tagName === 'IFRAME') {
                currentVideo.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
        }

        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.style.opacity = i === index ? '1' : '0';
            slide.style.zIndex = i === index ? '2' : '1';
        });

        const nextVideo = slides[index].querySelector('video');
        if (nextVideo) {
            nextVideo.play().catch(e => console.log('Video autoplay prevented:', e));
        }

        currentSlide = index;
    }

    function nextSlide() {
        showSlide((currentSlide + 1) % slides.length);
    }

    function startSlider() {
        showSlide(0);
        slideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopSlider() {
        clearInterval(slideInterval);
    }

    startSlider();
    const sliderContainer = document.querySelector('.hero-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopSlider);
        sliderContainer.addEventListener('mouseleave', startSlider);
    }

    return { start: startSlider, stop: stopSlider, next: nextSlide };
}

// YouTube Video Modal
function videoPlayer() {
    const videoTriggers = document.querySelectorAll('[data-video-trigger]');
    const videoModal = document.getElementById('video-modal');
    const videoFrame = document.getElementById('video-frame');
    const closeModal = document.querySelector('.video-modal-close');

    if (!videoModal) return;

    function openVideo(videoId) {
        videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeVideo() {
        videoFrame.src = '';
        videoModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    videoTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const videoId = trigger.dataset.videoId || 'MLpWrANjFbI';
            openVideo(videoId);
        });
    });

    closeModal.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', e => {
        if (e.target === videoModal) closeVideo();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeVideo();
    });

    return { openVideo, closeVideo };
}

// Count-up Stats Animation
function countUpStats() {
    const stats = document.querySelectorAll('.stat-number');

    const formatNumber = (value, type) => {
        if (type === 'resorts') return value.toString(); // No "+" or "K+"
        if (value >= 1000) return (value / 1000).toFixed(0) + ' K+';
        return value + ' +';
    };

    const animate = (counter, target, type) => {
        let current = 0;
        const increment = target / 100; // Controls speed

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = formatNumber(Math.floor(current), type);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = formatNumber(target, type);
            }
        };

        updateCounter();
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.dataset.target;
                const type = counter.dataset.type;
                animate(counter, target, type);
                obs.unobserve(counter); // Animate once
            }
        });
    }, {
        threshold: 0.5
    });

    stats.forEach(counter => observer.observe(counter));
}

// Dynamic Background Animation
class ScrollDarken {
    constructor() {
        this.banner = document.querySelector('.background-banner');
        this.overlay = document.querySelector('.background-overlay');
        this.lastScroll = 0;

        if (!this.banner || !this.overlay) return;

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    handleScroll() {
        const currentScroll = window.scrollY;
        const bannerHeight = this.banner.offsetHeight;

        const scrollPercent = Math.min(currentScroll / bannerHeight, 1);

        if (currentScroll > this.lastScroll) {
            this.overlay.style.opacity = 0.2 + (scrollPercent * 0.3);
        } else {
            this.overlay.style.opacity = 0.2 + (scrollPercent * 0);
        }

        this.lastScroll = currentScroll;
    }
}

// Testimonial Slider
let currentIndex = 0;
let isTransitioning = false;
const VISIBLE_CARDS = 4;
let cardWidth = 0;

function cloneCards(sliderTrack) {
    const cards = Array.from(sliderTrack.children);

    const firstClones = cards.slice(0, VISIBLE_CARDS).map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned');
        return clone;
    });
    firstClones.forEach(clone => sliderTrack.appendChild(clone));

    const lastClones = cards.slice(-VISIBLE_CARDS).map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned');
        return clone;
    });
    lastClones.reverse().forEach(clone => sliderTrack.insertBefore(clone, sliderTrack.firstChild));
}

function calculateCardWidth() {
    const sliderTrack = document.querySelector('.slider-track');
    const card = document.querySelector('.testimonial-card:not(.cloned)');
    if (!card) return false;

    const cardStyle = window.getComputedStyle(card);
    cardWidth = card.offsetWidth + parseInt(cardStyle.marginRight) + parseInt(cardStyle.marginLeft);
    return true;
}

function updateSliderPosition(track, index, animate = true) {
    track.style.transition = animate ? 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
    track.style.transform = `translateX(-${index * cardWidth}px)`;
}

function handleSliderNavigation(direction) {
    if (isTransitioning) return;

    const sliderTrack = document.querySelector('.slider-track');
    const allCards = sliderTrack.querySelectorAll('.testimonial-card');
    const totalCards = allCards.length;

    isTransitioning = true;

    if (direction === 'next' && currentIndex >= totalCards - (2 * VISIBLE_CARDS)) {
        currentIndex = VISIBLE_CARDS;
        updateSliderPosition(sliderTrack, currentIndex, false);
    }
    else if (direction === 'prev' && currentIndex <= VISIBLE_CARDS) {
        currentIndex = totalCards - (2 * VISIBLE_CARDS);
        updateSliderPosition(sliderTrack, currentIndex, false);
    }

    requestAnimationFrame(() => {
        currentIndex += (direction === 'next') ? 1 : -1;
        updateSliderPosition(sliderTrack, currentIndex, true);

        const handleTransitionEnd = () => {
            sliderTrack.removeEventListener('transitionend', handleTransitionEnd);
            isTransitioning = false;

            if (currentIndex >= totalCards - VISIBLE_CARDS) {
                currentIndex = VISIBLE_CARDS;
                updateSliderPosition(sliderTrack, currentIndex, false);
            }
            else if (currentIndex <= 0) {
                currentIndex = totalCards - (2 * VISIBLE_CARDS);
                updateSliderPosition(sliderTrack, currentIndex, false);
            }
        };

        sliderTrack.addEventListener('transitionend', handleTransitionEnd, { once: true });
    });
}

function testimonialSlider() {
    const sliderTrack = document.querySelector('.slider-track');
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');

    if (!sliderTrack || !prevButton || !nextButton) {
        console.error('Slider elements not found');
        return;
    }

    if (!calculateCardWidth()) return;

    cloneCards(sliderTrack);

    currentIndex = VISIBLE_CARDS;
    updateSliderPosition(sliderTrack, currentIndex, false);

    nextButton.addEventListener('click', () => handleSliderNavigation('next'));
    prevButton.addEventListener('click', () => handleSliderNavigation('prev'));

    window.addEventListener('resize', () => {
        calculateCardWidth();
        updateSliderPosition(sliderTrack, currentIndex, false);
    });
}

// Trigger The Something Went Wrong Troll
function handleSubscribe() {
    const emailInput = document.getElementById("subscribeEmail");
    const alertBox = document.getElementById("subscribeAlert");
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    alertBox.classList.remove("show");

    if (!emailPattern.test(email)) {
        return;
    }

    const somethingWentWrong = true;

    if (somethingWentWrong) {
        alertBox.classList.add("show");
    }
}

// Gallery Photo Full
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';

    const modalImg = document.createElement('img');
    modalImg.className = 'modal-image';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';

    modal.appendChild(modalImg);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);

    addModalStyles();

    return { modal, modalImg, closeBtn };
}

function addModalStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .gallery-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .gallery-modal.active {
            opacity: 1;
            display: flex;
        }
        .modal-image {
            max-height: 90vh;
            max-width: 90vw;
            object-fit: contain;
            transform: scale(0.9);
            transition: transform 0.8s ease;
        }
        .gallery-modal.active .modal-image {
            transform: scale(1);
        }
        .modal-close {
            position: absolute;
            top: 30px;
            right: 30px;
            color: white;
            font-size: 40px;
            cursor: pointer;
            z-index: 1001;
        }
        .view-btn.clicked {
            transform: scale(1);
        }
    `;
    document.head.appendChild(style);
}

function setupEventListeners(modal, modalImg, closeBtn) {
    document.querySelectorAll('.view-btn').forEach(button => {
        button.addEventListener('click', () => handleViewButtonClick(button, modal, modalImg));
    });

    closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal(modal);
    });
}

function handleViewButtonClick(button, modal, modalImg) {
    const imgSrc = button.closest('.img-container').querySelector('img').src;

    modalImg.src = imgSrc;

    modalImg.style.transform = 'scale(0.9)';
    setTimeout(() => {
        openModal(modal);
        modalImg.style.transform = 'scale(1)';
    }, 100);

    button.classList.add('clicked');
    setTimeout(() => {
        button.classList.remove('clicked');
    }, 1000);
}

function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modal.style.display = 'flex';

    setTimeout(() => {
        modal.classList.add('active');
    }, 50);

    void modal.offsetWidth;
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('clicked');
    });

    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            modal.style.display = 'none';
        }
    }, 300);
}

// FAQ Section
function initFAQAccordion() {
    const columns = document.querySelectorAll('.col-md-6');

    columns.forEach(column => {
        const faqItems = column.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const button = item.querySelector('.faq-question');

            button.addEventListener('click', () => {
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    return;
                }

                faqItems.forEach(i => i.classList.remove('active'));

                item.classList.add('active');
            });
        });
    });
}

// Initializes the mobile menu functionality
function initMobileMenu() {
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");

    const hamburger = createHamburgerIcon();
    header.appendChild(hamburger);

    const mobileNav = createMobileNav(nav);
    document.body.appendChild(mobileNav);

    setupMobileMenuToggle(hamburger, mobileNav);
    setupDropdownToggles(mobileNav);
}

// Create the hamburger icon
function createHamburgerIcon() {
    const button = document.createElement("button");
    button.className = "menu-toggle";
    button.innerHTML = '<i class="fas fa-bars"></i>';
    return button;
}

function createMobileNav(originalNav) {
    const mobileNav = document.createElement("div");
    mobileNav.className = "mobile-nav";

    const mobileLogo = document.createElement("div");
    mobileLogo.className = "mobile-logo";
    mobileLogo.innerHTML = `
        <img src="./images/Logo-Dark.png" alt="Altesa Logo">
        <button class="close-menu"><i class="fas fa-times"></i></button>
    `;

    const navClone = originalNav.querySelector("ul").cloneNode(true);
    mobileNav.appendChild(mobileLogo);
    mobileNav.appendChild(navClone);

    const closeBtn = mobileLogo.querySelector(".close-menu");
    closeBtn.addEventListener("click", () => {
        mobileNav.classList.remove("open");
        document.body.classList.remove("menu-open");
    });

    return mobileNav;
}

function setupMobileMenuToggle(hamburger, mobileNav) {
    hamburger.addEventListener("click", () => {
        mobileNav.classList.add("open");
        document.body.classList.add("menu-open");
    });
}

function setupDropdownToggles(mobileNav) {
    const dropdownLinks = mobileNav.querySelectorAll(".dropdown > a");

    dropdownLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            this.parentElement.classList.toggle("open");
        });
    });
}

// Utility function
function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}