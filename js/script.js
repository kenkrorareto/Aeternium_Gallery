document.addEventListener("DOMContentLoaded", function () {
  const gallery = document.getElementById("gallery");
  const searchInput = document.getElementById("search");
  const sortSelect = document.getElementById("sort");
  const filtersEl = document.getElementById("filters");
  const countEl = document.getElementById("result-count");
  const emptyEl = document.getElementById("no-results");

  let cards = [];
  let activeLetter = "all";

  fetchImages().then((images) => {
    cards = images.map((imageName) => {
      const name = getImageNameWithoutExtension(imageName);
      const key = normalize(name);
      const el = createThumbnailContainer(name, imageName);
      gallery.appendChild(el);
      return { name, key, letter: key.charAt(0).toUpperCase(), el };
    });

    buildLetterFilters();
    render();
  });

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);

  async function fetchImages() {
    const response = await fetch("./images.json");
    const data = await response.json();
    return data.images;
  }

  function createThumbnailContainer(name, imageName) {
    const container = document.createElement("div");
    container.classList.add("thumbnail-container", "appear");
    container.addEventListener(
      "animationend",
      () => container.classList.remove("appear"),
      { once: true }
    );

    const heading = document.createElement("h2");
    heading.textContent = name;

    const thumbnail = createThumbnail(name, imageName);

    container.appendChild(heading);
    container.appendChild(thumbnail);

    return container;
  }

  function createThumbnail(name, imageName) {
    const thumbnail = document.createElement("img");
    thumbnail.src = `./images/${imageName.split("/").pop()}`;
    thumbnail.alt = `Retrato de ${name}`;
    thumbnail.loading = "lazy";
    thumbnail.classList.add("img");
    return thumbnail;
  }

  function getImageNameWithoutExtension(imageName) {
    imageName = imageName.replace(/\.[^/.]+$/, "");
    const fileName = imageName.split("/").pop();
    return fileName.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  // lowercase, drop accents (NFD splits them off) and punctuation/spaces
  // so "thell", "Kalhor", "cedholmen" all match forgivingly
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^a-z0-9]/g, "");
  }

  function buildLetterFilters() {
    const letters = [...new Set(cards.map((c) => c.letter))].sort();

    const makeChip = (label, value) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = label;
      chip.dataset.letter = value;
      chip.setAttribute("aria-pressed", value === activeLetter);
      chip.addEventListener("click", () => {
        activeLetter = value;
        filtersEl.querySelectorAll(".chip").forEach((c) => {
          const on = c.dataset.letter === activeLetter;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on);
        });
        render();
      });
      return chip;
    };

    filtersEl.innerHTML = "";
    const all = makeChip("Todos", "all");
    all.classList.add("is-active");
    filtersEl.appendChild(all);
    letters.forEach((letter) => filtersEl.appendChild(makeChip(letter, letter)));
  }

  function render() {
    const query = normalize(searchInput.value);
    const direction = sortSelect.value === "desc" ? -1 : 1;

    const ordered = [...cards].sort(
      (a, b) => a.name.localeCompare(b.name, "es") * direction
    );

    let visible = 0;
    ordered.forEach((card) => {
      const matchesText = card.key.includes(query);
      const matchesLetter =
        activeLetter === "all" || card.letter === activeLetter;
      const show = matchesText && matchesLetter;

      card.el.style.display = show ? "" : "none";
      if (show) {
        gallery.appendChild(card.el);
        visible++;
      }
    });

    countEl.textContent =
      visible === 1 ? "1 personaje" : `${visible} personajes`;
    emptyEl.hidden = visible !== 0;
  }
});
