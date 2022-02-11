export default function makeMarkup(picturesArray) {
  const picturesMarkup = picturesArray
    .map(
      picture => `<div class="photo-card">
       <a href="${picture.largeImageURL}">
    <img src="${picture.webformatURL}" alt="${picture.tags}" loading="lazy" /></a>
    <div class="info">
      <p class="info-item">
        <b>Likes</b> <br>
         ${picture.likes}
      </p>
      <p class="info-item">
        <b>Views</b> <br>
         ${picture.views}
      </p>
      <p class="info-item">
        <b>Comments</b> <br>
         ${picture.comments}
      </p>
      <p class="info-item">
        <b>Downloads</b> <br>
        ${picture.downloads}
      </p>
    </div>
  </div>`,
    )
    .join('');
  return picturesMarkup;
}
