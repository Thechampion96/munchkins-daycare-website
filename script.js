const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const enquiryForm = document.querySelector("#enquiry-form");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
  }
});

enquiryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(enquiryForm);
  const message = [
    "Hi Munchkins Daycare, I would like to enquire about enrolling my child.",
    "",
    `Parent name: ${data.get("parentName")}`,
    `Child's name: ${data.get("childName")}`,
    `Child's date of birth: ${data.get("childDob")}`,
    `Phone number: ${data.get("phone")}`,
    `Heard about us: ${data.get("heardAbout")}`,
    "",
    `Message: ${data.get("message")}`,
  ].join("\n");

  window.location.href = `https://wa.me/27653811958?text=${encodeURIComponent(message)}`;
});

const renderStars = (rating) => {
  const rounded = Math.round(Number(rating) || 0);
  return "★".repeat(rounded).padEnd(5, "☆");
};

const updateReviewSection = async () => {
  const panel = document.querySelector(".reviews-panel");
  if (!panel) return;

  const endpoints =
    window.location.protocol === "file:"
      ? [
          "http://127.0.0.1:4193/api/reviews",
          "http://127.0.0.1:4192/api/reviews",
          "http://127.0.0.1:4173/api/reviews",
          "http://localhost:4193/api/reviews",
          "http://localhost:4192/api/reviews",
          "http://localhost:4173/api/reviews",
        ]
      : ["/api/reviews"];

  try {
    let response;

    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint);
        if (response.ok) break;
      } catch (error) {
        response = null;
      }
    }

    if (!response?.ok) throw new Error("Could not load Google reviews.");

    const data = await response.json();
    const rating = document.getElementById("google-rating");
    const reviewCount = document.getElementById("google-review-count");
    const reviewList = document.getElementById("google-review-list");
    const reviewsLink = document.getElementById("google-reviews-link");
    const writeReviewLink = document.getElementById("google-write-review-link");
    const reviewsCopy = document.getElementById("reviews-copy");

    rating.textContent = data.rating?.toFixed ? data.rating.toFixed(1) : data.rating;
    reviewCount.textContent = `${data.reviewCount} Google reviews`;
    reviewsLink.href = data.url;
    writeReviewLink.href = data.url;
    reviewsCopy.textContent = "Live from Google, refreshed every few hours.";
    panel.setAttribute(
      "aria-label",
      `${data.rating} out of 5 stars from ${data.reviewCount} Google reviews`
    );

    reviewList.innerHTML = "";
    data.reviews.slice(0, 3).forEach((review) => {
      const item = document.createElement("article");
      const header = document.createElement("div");
      const author = document.createElement("strong");
      const stars = document.createElement("span");
      const text = document.createElement("p");
      const time = document.createElement("small");

      item.className = "review-card";
      author.textContent = review.author;
      stars.textContent = renderStars(review.rating);
      stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
      text.textContent = review.text;
      time.textContent = review.time || "Google review";

      header.append(author, stars);
      item.append(header, text, time);
      reviewList.appendChild(item);
    });
  } catch (error) {
    panel.classList.add("reviews-fallback");
  }
};

updateReviewSection();
