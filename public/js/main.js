$(window).on("load", function () {
  $("#preloader").fadeOut("slow", function () {
    $(this).remove();
  });
});

/******************************************************************************************************************************
Learn More Page Scroll
*******************************************************************************************************************************/
$(function () {
  $("a.page-scroll").bind("click", function (event) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top,
        },
        1500,
        "easeInOutExpo"
      );
    event.preventDefault();
  });
});

/******************************************************************************************************************************
Menu
*******************************************************************************************************************************/
(function () {
  var bodyEl = document.body,
    //content = document.querySelector( '.content-wrap' ),
    openbtn = document.getElementById("open-button"),
    closebtn = document.getElementById("close-button"),
    isOpen = false;

  function init() {
    initEvents();
  }

  function initEvents() {
    openbtn.addEventListener("click", toggleMenu);
    if (closebtn) {
      closebtn.addEventListener("click", toggleMenu);
    }

    /* close the menu element if the target it´s not the menu element or one of its descendants..
		content.addEventListener( 'click', function(ev) {
			var target = ev.target;
			if( isOpen && target !== openbtn ) {
				toggleMenu();
			}
		} );
		*/
  }

  function toggleMenu() {
    if (isOpen) {
      classie.remove(bodyEl, "show-menu");
    } else {
      classie.add(bodyEl, "show-menu");
    }
    isOpen = !isOpen;
  }

  init();
})();

/******************************************************************************************************************************
Pagenation 
*******************************************************************************************************************************/
var currentSlide = 0;
function changeSlide(direction, totalSlides) {
  var slides = document.querySelectorAll(".pagination-content .slide");
  slides[currentSlide].style.display = "none"; // Hide current slide
  slides[currentSlide].classList.remove("active"); // Remove the active class

  currentSlide += direction; // Update the current slide based on direction (-1 for Prev, +1 for Next)

  // Wrap around the slides correctly
  if (currentSlide >= totalSlides) {
    currentSlide = 0; // Go to the first slide if next from last
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1; // Go to the last slide if prev from first
  }

  slides[currentSlide].style.display = "block"; // Show the new current slide
  slides[currentSlide].classList.add("active"); // Add the active class
}

// Initialization of the slider
document.addEventListener("DOMContentLoaded", function () {
  // Assume there are 3 slides; adjust the number as per your actual slide count
  changeSlide(0, 3);
});
