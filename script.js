// Hero Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.hero-slider .slide');
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            slide.style.opacity = i === index ? '1' : '0';
            slide.style.zIndex = i === index ? '2' : '1';
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    showSlide(currentSlide);
    setInterval(nextSlide, 8000); // Change slide every 8 seconds
});

// Testimonial Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const sliderTrack = document.querySelector('.slider-track');
    const dots = document.querySelectorAll('.dot');
    let currentIndex = 0;
    const slideWidth = 330; // Width of each testimonial card including margin
    const slideCount = dots.length;

    function goToSlide(index) {
        currentIndex = index;
        sliderTrack.style.transform = `translateX(-${slideWidth * index}px)`;
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
    }

    setInterval(() => {
        const nextIndex = (currentIndex + 1) % slideCount;
        goToSlide(nextIndex);
    }, 5000); // Slide every 5 seconds
});
