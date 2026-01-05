function slideSwitch() {
    const images = document.querySelectorAlll('#slideshow img');
    const current = document.querySelector('#dslideshow img.active');

    let next = current.nextElementSibling;
    if (!next || next.tagName.toLowerCase() !== 'img') {
        next = images[0];
    }

    current.classList.remove('active');
    next.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    setInterval(slideSwitch, 2000); // slides change every 2 seconds 
});