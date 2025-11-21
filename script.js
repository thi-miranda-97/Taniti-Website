// TRIPS INFO SECTION TOGGLE (initialize only if elements exist)
const track = document.querySelector(".carousel-track");
const dotsNav = document.querySelector(".carousel-dots");

if (track && dotsNav) {
  const slides = Array.from(track.children);
  if (slides.length > 0) {
    let slideIndex = 0;
    const slideWidth = slides[0].getBoundingClientRect().width;

    // Set up dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      if (i === 0) dot.classList.add("active");
      dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    function moveToSlide(index) {
      track.style.transform =
        "translateX(-" +
        slides[0].getBoundingClientRect().width * index +
        "px)";
      dots.forEach((dot) => dot.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    }

    function nextSlide() {
      slideIndex++;
      if (slideIndex >= slides.length - 2) slideIndex = 0; // 3 columns view
      moveToSlide(slideIndex);
    }

    // Auto slide every 3 seconds
    let slideInterval = setInterval(nextSlide, 3000);

    // Click dots to navigate
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        slideIndex = index;
        moveToSlide(slideIndex);
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 3000);
      });
    });
  }
}

// ABOUT PAGE - HERO CAROUSEL (scoped to About page)
const trackHero = document.querySelector(".about-carousel-track");
if (trackHero) {
  const slidesHero = Array.from(trackHero.children);
  let heroIndex = 0;

  // ensure slides are positioned and the first slide is marked active
  slidesHero.forEach((s, i) => {
    s.classList.toggle("active", i === 0);
    s.style.minWidth = "100%";
  });

  function moveCarousel() {
    // remove active from current
    slidesHero[heroIndex].classList.remove("active");
    heroIndex++;
    if (heroIndex >= slidesHero.length) heroIndex = 0;
    // add active to new
    slidesHero[heroIndex].classList.add("active");
    const offset = -heroIndex * 100;
    trackHero.style.transform = `translateX(${offset}%)`;
  }

  // Auto slide every 4.5 seconds
  const heroInterval = setInterval(moveCarousel, 2000);

  // Optional: pause on hover
  trackHero.addEventListener("mouseenter", () => clearInterval(heroInterval));
}

// ========== BOOKING PAGE INTERACTIONS ==========
// ========== BOOKING PAGE INTERACTIONS (REFINED & VALIDATED) ==========
document.addEventListener("DOMContentLoaded", () => {
  // ELEMENTS
  const startBtn = $("#start-booking");
  const searchBtn = $("#search-lodging");
  const lodgingSection = $("#lodging-options");
  const transportSection = $("#transportation");
  const summarySection = $("#summary");
  const confirmationSection = $("#confirmation");

  const checkinEl = $("#checkin");
  const checkoutEl = $("#checkout");
  const guestsEl = $("#guests");

  const sumCheckin = $("#sum-checkin");
  const sumCheckout = $("#sum-checkout");
  const sumGuests = $("#sum-guests");
  const sumRoom = $("#sum-room");
  const sumTransport = $("#sum-transport");
  const sumSub = $("#sum-sub");
  const sumTax = $("#sum-tax");
  const sumTotal = $("#sum-total");

  const completeBtn = $("#complete-booking");
  const returnBtn = $("#return-home");

  // STATE
  let state = {
    checkIn: "",
    checkOut: "",
    guests: 1,
    selectedRoom: null,
    selectedTransport: [],
  };

  // ------- Utilities -------
  function $(id) {
    return document.getElementById(id.replace("#", ""));
  }

  function toggle(el, show) {
    if (!el) return;
    el.classList.toggle("hidden", !show);
  }

  function scrollTo(id) {
    setTimeout(() => $(id)?.scrollIntoView({ behavior: "smooth" }), 120);
  }

  function dateDiffDays(a, b) {
    if (!a || !b) return 0;
    const d1 = new Date(a);
    const d2 = new Date(b);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.round(diff) : 0;
  }

  const roomPriceMap = {
    oceanfront: 299,
    family: 149,
    hostel: 59,
  };

  function getTransportSum() {
    return state.selectedTransport.reduce((sum, key) => {
      const el = document.querySelector(`.transport[data-key="${key}"]`);
      return sum + Number(el?.dataset.price || 0);
    }, 0);
  }

  function formatMoney(n) {
    return "$" + (n || 0).toFixed(2);
  }

  // ------- VALIDATION -------
  function validateSearchFields() {
    if (!state.checkIn || !state.checkOut || !state.guests) {
      alert("Please select check-in, check-out, and guests.");
      return false;
    }
    if (dateDiffDays(state.checkIn, state.checkOut) <= 0) {
      alert("Check-out date must be after check-in date.");
      return false;
    }
    return true;
  }

  function validateBeforeComplete() {
    if (!state.selectedRoom) {
      alert("Please select a hotel room before continuing.");
      return false;
    }
    if (state.selectedTransport.length === 0) {
      alert("Please select at least one transportation option.");
      return false;
    }
    return true;
  }

  // ------- Summary Rendering -------
  function updateSummary() {
    sumCheckin.textContent = state.checkIn || "Not selected";
    sumCheckout.textContent = state.checkOut || "Not selected";
    sumGuests.textContent = `${state.guests} ${
      state.guests > 1 ? "Guests" : "Guest"
    }`;

    // room
    let name = "Not selected";
    if (state.selectedRoom) {
      name =
        state.selectedRoom === "oceanfront"
          ? "Oceanfront Resort"
          : state.selectedRoom === "family"
          ? "Family-Owned Hotel"
          : "Budget Hostel";
    }
    sumRoom.textContent = name;

    // transport
    sumTransport.textContent =
      state.selectedTransport.length > 0
        ? `${state.selectedTransport.length} selected`
        : "None";

    const nights = dateDiffDays(state.checkIn, state.checkOut) || 1;
    const roomCost = roomPriceMap[state.selectedRoom] * nights || 0;
    const transportCost = getTransportSum();

    const subtotal = roomCost + transportCost;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    sumSub.textContent = formatMoney(subtotal);
    sumTax.textContent = formatMoney(tax);
    sumTotal.textContent = formatMoney(total);
  }

  // ------- EVENT HANDLERS -------

  // Start booking → scroll
  startBtn?.addEventListener("click", () => scrollTo("booking-form"));

  // SEARCH LODGING
  searchBtn?.addEventListener("click", (e) => {
    e.preventDefault();

    state.checkIn = checkinEl.value;
    state.checkOut = checkoutEl.value;
    state.guests = Number(guestsEl.value);

    if (!validateSearchFields()) return;

    // Show next steps
    toggle(lodgingSection, true);
    toggle(transportSection, true);
    toggle(summarySection, true);

    updateSummary();
    scrollTo("lodging-options");
  });

  // SELECT ROOM
  document.querySelectorAll(".lodging-grid .card").forEach((card) => {
    const btn = card.querySelector(".book");
    const type = card.dataset.type;

    btn?.addEventListener("click", () => {
      state.selectedRoom = type;
      updateSummary();

      // Highlight summary
      const sumCard = document.querySelector("#summary .summary-card");
      sumCard?.classList.add("highlight");

      scrollTo("summary");
    });
  });

  // SELECT TRANSPORT
  document.querySelectorAll(".transport.card-option").forEach((item) => {
    item.addEventListener("click", () => {
      const key = item.dataset.key;
      const i = state.selectedTransport.indexOf(key);

      if (i >= 0) {
        state.selectedTransport.splice(i, 1);
        item.classList.remove("selected");
      } else {
        state.selectedTransport.push(key);
        item.classList.add("selected");
      }

      updateSummary();
    });
  });

  // COMPLETE BOOKING
  completeBtn?.addEventListener("click", () => {
    if (!validateBeforeComplete()) return;

    toggle(summarySection, false);
    toggle(confirmationSection, true);
    scrollTo("confirmation");
  });

  // Return Home → reload page
  returnBtn?.addEventListener("click", () => location.reload());

  // Reactive summary when inputs change
  [checkinEl, checkoutEl, guestsEl].forEach((el) =>
    el?.addEventListener("change", () => {
      state.checkIn = checkinEl.value;
      state.checkOut = checkoutEl.value;
      state.guests = guestsEl.value;
      updateSummary();
    })
  );
});

// ========== CONTACT FORM SUCCESS ALERT ==========
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent page reload

    // Collect values
    const name = contactForm.querySelector("input[name='name']").value.trim();
    const email = contactForm.querySelector("input[name='email']").value.trim();
    const message = contactForm
      .querySelector("textarea[name='message']")
      .value.trim();

    // Validate
    if (!name || !email || !message) {
      alert("⚠️ Please fill out all required fields before sending.");
      return;
    }

    // Success
    alert("✅ Your message has been sent successfully!");

    contactForm.reset(); // Clear form
  });
}
// ========== FAQ SECTION TOGGLE ==========

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const btn = item.querySelector(".faq-question");

  btn.addEventListener("click", () => {
    item.classList.toggle("active");
  });
});
