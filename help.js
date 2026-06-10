const searchInput = document.getElementById("help-search");
const resultsContainer = document.getElementById("help-results");
const emptyState = document.getElementById("help-empty");
const countText = document.getElementById("help-count");
const tagButtons = document.querySelectorAll("[data-search]");

const normalizeText = (text) => text.toLowerCase().trim();

const topicMatchesSearch = (topic, searchTerm) => {
  if (!searchTerm) return true;

  const searchableText = normalizeText(
    [
      topic.title,
      topic.category,
      topic.answer,
      ...(topic.keywords || [])
    ].join(" ")
  );

  return searchableText.includes(searchTerm);
};

const createTopicCard = (topic) => {
  const card = document.createElement("article");
  card.className = "help-card";

  card.innerHTML = `
    <span>${topic.category}</span>
    <h2>${topic.title}</h2>
    <p>${topic.answer}</p>
  `;

  return card;
};

const renderTopics = () => {
  const searchTerm = normalizeText(searchInput.value);

  const filteredTopics = helpTopics.filter((topic) =>
    topicMatchesSearch(topic, searchTerm)
  );

  resultsContainer.innerHTML = "";

  filteredTopics.forEach((topic) => {
    resultsContainer.appendChild(createTopicCard(topic));
  });

  const hasResults = filteredTopics.length > 0;

  emptyState.hidden = hasResults;
  resultsContainer.hidden = !hasResults;

  countText.textContent = searchTerm
    ? `${filteredTopics.length} result${filteredTopics.length === 1 ? "" : "s"} found`
    : "Showing all topics";
};

searchInput.addEventListener("input", renderTopics);

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.search;
    renderTopics();
    searchInput.focus();
  });
});

renderTopics();