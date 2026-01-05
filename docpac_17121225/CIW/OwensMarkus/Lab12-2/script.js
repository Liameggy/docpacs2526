function slideSwitch() {
  const images = document.querySelectorAll('#slideshow img');
  const current = document.querySelector('#slideshow img.active');

  let next = current.nextElementSibling;
  if (!next || next.tagName.toLowerCase() !== 'img') {
    next = images[0];
  }

  current.classList.remove('active');
  next.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
  setInterval(slideSwitch, 2000); // Change slides every 2 seconds
});