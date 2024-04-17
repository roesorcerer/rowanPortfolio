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
function changeSlide(direction, totalSlides, containerId) {
  var container = document.getElementById(containerId);
  if (!container) {
    console.error("Container not found: #" + containerId);
    return;
  }

  var slides = container.querySelectorAll(".slide");
  var activeSlide = container.querySelector(".slide.active");
  var currentSlideIndex = Array.prototype.indexOf.call(slides, activeSlide);

  if (currentSlideIndex === -1) {
    console.error("No active slide found in container: #" + containerId);
    return; // Exit the function if no active slide
  }

  slides[currentSlideIndex].classList.remove("active");
  slides[currentSlideIndex].style.display = "none";

  currentSlideIndex += direction;

  // Ensure currentSlideIndex wraps around properly
  if (currentSlideIndex >= totalSlides) {
    currentSlideIndex = 0;
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = totalSlides - 1;
  }

  slides[currentSlideIndex].classList.add("active");
  slides[currentSlideIndex].style.display = "block";
}

// Initialization of the slider
document.addEventListener("DOMContentLoaded", function () {
  changeSlide(0, 3, "pagination-content"); // Initialize the first slider
  changeSlide(0, 3, "new-pagination-content"); // Initialize the second slider
  changeSlide(0, 3, "new-pagination-content-2"); // Initialize the third slider
});

/******************************************************************************************************************************
Accordion Style
*******************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", () => {
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      // This variable will check if the item is already open
      const isOpen = header.nextElementSibling.classList.contains("show");

      // Optionally close all open accordion items
      document
        .querySelectorAll(".accordion-content.show")
        .forEach((openItem) => {
          if (openItem !== header.nextElementSibling) {
            openItem.classList.remove("show");
            openItem.style.maxHeight = null;
          }
        });

      const contentPanel = header.nextElementSibling;
      if (isOpen) {
        contentPanel.classList.remove("show");
        contentPanel.style.maxHeight = null;
      } else {
        contentPanel.classList.add("show");
        contentPanel.style.maxHeight = contentPanel.scrollHeight + "px";
      }
    });
  });
});
