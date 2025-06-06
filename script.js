document.addEventListener('DOMContentLoaded', () => {
    heroSlider();
    videoPlayer();
    countUpStats();
    testimonialSlider();
    new ScrollDarken();
    handleSubscribe();
    const { modal, modalImg, closeBtn } = createModal();
    setupEventListeners(modal, modalImg, closeBtn);
    initFAQAccordion();
    initMobileMenu();
    setupSelectIconToggle('.custom-select-wrapper');
    initGoToTopButton();
    renderVillas(villas);
    renderAmenities(amenities);
    renderBlogPosts(blogPosts);
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
    let timeout;

    const displayTime = 2500;
    const transitionTime = 2000;

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
            slide.style.transition = `opacity ${transitionTime}ms ease-in-out`;
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
        timeout = setTimeout(nextSlide, displayTime + transitionTime);
    }

    function startSlider() {
        showSlide(0);
        timeout = setTimeout(nextSlide, displayTime + transitionTime);
    }

    function stopSlider() {
        clearInterval(timeout);
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
const VISIBLE_CARDS = 4;
const sliderTrack = document.querySelector('.slider-track');
const cards = Array.from(sliderTrack.children);
let currentIndex = VISIBLE_CARDS;
let cardWidth = 0;
let isTransitioning = false;

function cloneCards() {
    const firstClones = cards.slice(0, VISIBLE_CARDS).map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned');
        return clone;
    });

    const lastClones = cards.slice(-VISIBLE_CARDS).map(card => {
        const clone = card.cloneNode(true);
        clone.classList.add('cloned');
        return clone;
    });

    lastClones.reverse().forEach(clone => sliderTrack.insertBefore(clone, sliderTrack.firstChild));
    firstClones.forEach(clone => sliderTrack.appendChild(clone));
}

function calculateCardWidth() {
    const card = sliderTrack.querySelector('.testimonial-card');
    const style = window.getComputedStyle(card);
    cardWidth = card.offsetWidth + parseInt(style.marginRight) + parseInt(style.marginLeft);
}

function updateSliderPosition(index, animate = true) {
    if (animate) {
        sliderTrack.style.transition = 'transform 0.5s ease';
    } else {
        sliderTrack.style.transition = 'none';
    }
    sliderTrack.style.transform = `translateX(-${index * cardWidth}px)`;
}

function handleSliderNavigation(direction) {
    if (isTransitioning) return;
    isTransitioning = true;

    currentIndex += (direction === 'next') ? 1 : -1;
    updateSliderPosition(currentIndex);

    sliderTrack.addEventListener('transitionend', () => {
        const totalOriginalCards = cards.length;

        if (currentIndex >= totalOriginalCards + VISIBLE_CARDS) {
            currentIndex = VISIBLE_CARDS;
            updateSliderPosition(currentIndex, false);
        } else if (currentIndex <= 0) {
            currentIndex = totalOriginalCards;
            updateSliderPosition(currentIndex, false);
        }
        isTransitioning = false;
    }, { once: true });
}

function testimonialSlider() {
    cloneCards();
    calculateCardWidth();
    updateSliderPosition(currentIndex, false);

    document.querySelector('.next-btn').addEventListener('click', () => handleSliderNavigation('next'));
    document.querySelector('.prev-btn').addEventListener('click', () => handleSliderNavigation('prev'));

    window.addEventListener('resize', () => {
        calculateCardWidth();
        updateSliderPosition(currentIndex, false);
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
            const currentDropdown = this.parentElement;

            mobileNav.querySelectorAll(".dropdown.open").forEach(dropdown => {
                if (dropdown !== currentDropdown) {
                    dropdown.classList.remove("open");
                }
            });

            currentDropdown.classList.toggle("open");
        });
    });
}

// Go to top button
function initGoToTopButton() {
    const btn = document.createElement('button');
    btn.id = 'goToTopBtn';
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: '1000',
        display: 'none',
        padding: '12px 16px',
        width: '50px',
        height: '50px',
        backgroundColor: '#f5c7a1',
        color: '#3d3d3d',
        border: 'none',
        borderRadius: '50%',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transition: 'opacity 0.3s',
    });

    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const showAfter = header.offsetHeight + 50;

        if (window.scrollY > showAfter) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Render Villas
const villas = [
    {
        location: "Denpasar",
        image: "./images/Our Villas - 1.jpg",
        name: "Whispering Pines Villa",
        beds: 4,
        baths: 3,
        guests: 12,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar",
        price: "$150.00",
        rating: 4.5 // use 5 for full stars, 4.5 for half, etc.
    },
    {
        location: "Bandung",
        image: "./images/Our Villas - 2.jpg",
        name: "Mountain Serenity Villa",
        beds: 6,
        baths: 4,
        guests: 14,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar",
        price: "$165.00",
        rating: 4.5
    },
    {
        location: "Tangerang",
        image: "./images/Our Villas - 3.jpg",
        name: "Modern Bliss Villa",
        beds: 7,
        baths: 5,
        guests: 15,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar",
        price: "$170.00",
        rating: 5
    }
];

function renderVillas(villas) {
    const container = document.querySelector("#render-villa-card");
    if (!container) return;

    container.innerHTML = '';

    villas.forEach(villa => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        const card = document.createElement("div");
        card.className = "villa-card";

        const locationDiv = document.createElement("div");
        locationDiv.className = "card-location";
        locationDiv.textContent = villa.location;
        card.appendChild(locationDiv);

        const img = document.createElement("img");
        img.src = villa.image;
        img.alt = villa.name;
        card.appendChild(img);

        const content = document.createElement("div");
        content.className = "card-content";

        const ratingDiv = document.createElement("div");
        ratingDiv.className = "card-rating";

        const fullStars = Math.floor(villa.rating);
        const hasHalfStar = villa.rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement("i");
            star.className = "fa-solid fa-star";
            ratingDiv.appendChild(star);
        }

        if (hasHalfStar) {
            const halfStar = document.createElement("i");
            halfStar.className = "fa-solid fa-star-half-stroke";
            ratingDiv.appendChild(halfStar);
        }

        content.appendChild(ratingDiv);

        const name = document.createElement("h3");
        name.textContent = villa.name;
        content.appendChild(name);

        const features = document.createElement("ul");
        features.className = "card-features";

        const bedLi = document.createElement("li");
        bedLi.innerHTML = `<i class="fa-solid fa-bed"></i> ${villa.beds} Beds`;
        features.appendChild(bedLi);

        const bathLi = document.createElement("li");
        bathLi.innerHTML = `<i class="fa-solid fa-bath"></i> ${villa.baths} Baths`;
        features.appendChild(bathLi);

        const guestLi = document.createElement("li");
        guestLi.innerHTML = `<i class="fa-solid fa-person"></i> ${villa.guests} Guests`;
        features.appendChild(guestLi);

        content.appendChild(features);

        const description = document.createElement("p");
        description.className = "card-description";
        description.textContent = villa.description;
        content.appendChild(description);

        const footer = document.createElement("div");
        footer.className = "card-footer";

        const priceP = document.createElement("p");
        priceP.innerHTML = `<span class="card-price">${villa.price}</span>/Night`;
        footer.appendChild(priceP);

        const link = document.createElement("a");
        link.href = "#";

        const button = document.createElement("button");
        button.className = "card-button";
        button.textContent = "More Details";
        link.appendChild(button);

        footer.appendChild(link);
        content.appendChild(footer);

        card.appendChild(content);
        col.appendChild(card);
        container.appendChild(col);
    });
}

// Render Amenities
const amenities = [
    {
        icon: "fa-solid fa-water-ladder",
        text: "Private Pools",
        active: true
    },
    {
        icon: "fa-solid fa-spa",
        text: "Spa Services"
    },
    {
        icon: "fa-solid fa-golf-ball-tee",
        text: "Golf Courses"
    },
    {
        icon: "fa-solid fa-dumpster",
        text: "Housekeeping"
    },
    {
        icon: "fa-solid fa-martini-glass-citrus",
        text: "Restaurants & Mini Bar"
    },
    {
        icon: "fa-solid fa-dumbbell",
        text: "Quality Gym"
    }
];

function renderAmenities(amenities) {
    const container = document.querySelector("#render-amenities");
    if (!container) return;

    container.innerHTML = '';

    // First col-md-6 (label + title)
    const headingCol = document.createElement("div");
    headingCol.className = "col-md-6";

    const label = document.createElement("p");
    label.className = "section-label";
    label.textContent = "Amenities";

    const title = document.createElement("h2");
    title.innerHTML = 'We Offer Luxurious <span class="amenities-styling">Amenities</span> Just For You!';

    headingCol.appendChild(label);
    headingCol.appendChild(title);
    container.appendChild(headingCol);

    // Render each amenity in col-md-3
    amenities.forEach(amenity => {
        const col = document.createElement("div");
        col.className = "col-md-3";

        const amenityDiv = document.createElement("div");
        amenityDiv.className = "amenity";
        if (amenity.active) {
            amenityDiv.classList.add("active");
        }

        const iconCircle = document.createElement("div");
        iconCircle.className = "icon-circle";

        const icon = document.createElement("i");
        icon.className = amenity.icon;

        iconCircle.appendChild(icon);
        amenityDiv.appendChild(iconCircle);

        const text = document.createElement("p");
        text.textContent = amenity.text;
        amenityDiv.appendChild(text);

        col.appendChild(amenityDiv);
        container.appendChild(col);
    });
}

// Render Blog Posts
const blogPosts = [
    {
        image: "./images/Blog 1.jpg",
        alt: "Blog Post 1",
        title: "10 Ways Villas Can Make Your Holiday Enjoyable",
        date: "Dec 20, 2024"
    },
    {
        image: "./images/Blog 2.jpg",
        alt: "Blog Post 2",
        title: "Top 8 Destinations & Villas You Must Visit in 2024",
        date: "Jun 10, 2024"
    },
    {
        image: "./images/Blog 3.jpg",
        alt: "Blog Post 3",
        title: "Plan Your Days & Weeks Allocate Time For Family",
        date: "Mar 15, 2024"
    }
];

function renderBlogPosts(blogPosts) {
    const container = document.querySelector("#render-blog-posts");
    if (!container) return;

    container.innerHTML = '';

    blogPosts.forEach(post => {
        const col = document.createElement("div");
        col.className = "col-md-4";

        const anchor = document.createElement("a");
        anchor.href = "#";

        const blogPost = document.createElement("div");
        blogPost.className = "blog-post";

        const img = document.createElement("img");
        img.src = post.image;
        img.alt = post.alt;

        const content = document.createElement("div");
        content.className = "post-content";

        const title = document.createElement("h3");
        title.textContent = post.title;

        const date = document.createElement("p");
        const clockIcon = document.createElement("i");
        clockIcon.className = "fa-solid fa-clock clock-icon";

        date.appendChild(clockIcon);
        date.append(` ${post.date}`);

        content.appendChild(title);
        content.appendChild(date);
        blogPost.appendChild(img);
        blogPost.appendChild(content);
        anchor.appendChild(blogPost);
        col.appendChild(anchor);
        container.appendChild(col);
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