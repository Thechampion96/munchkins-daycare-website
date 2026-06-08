const params = new URLSearchParams(window.location.search);
const albumKey = params.get("album");

const album = galleryAlbums[albumKey] || galleryAlbums.classroom;

const albumTitle = document.getElementById("album-title");
const albumDescription = document.getElementById("album-description");
const albumGrid = document.getElementById("album-grid");

albumTitle.textContent = album.title;
albumDescription.textContent = album.description;

album.images.forEach((imageName) => {
  const card = document.createElement("article");
  card.className = "gallery-card";

  const img = document.createElement("img");
  img.src = album.folder + imageName;
  img.alt = `${album.title} photo at Munchkins Daycare`;
  img.loading = "lazy";

  card.appendChild(img);
  albumGrid.appendChild(card);
});