import './sass/main.scss';

import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import getPictures from './getPicture';
import makeMarkup from './makeMarkup';

const refs = {
  form: document.querySelector('.search-form'),
  pictures: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
//////////////
// const { height: cardHeight } = document
//   .querySelector('.gallery')
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: 'smooth',
// });
////////////////
let currentPage = 1;
let searchQuery = '';

refs.form.addEventListener('submit', onSubscribe);
refs.loadMoreBtn.addEventListener('click', onClick);

function onSubscribe(evt) {
  evt.preventDefault();
  searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }
  refs.pictures.innerHTML = '';
  currentPage = 1;
  makeGallary(searchQuery)
    .then(totalHits => {
      Notify.success(`Hooray! We found ${totalHits} images.`);
      if (totalHits > 40) {
        refs.loadMoreBtn.classList.remove('visually-hidden');
      }
    })
    .catch(error => error);
}
function onClick(evt) {
  console.log(currentPage);
  makeGallary(searchQuery).then(totalHits => {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    if ((currentPage - 1) * 40 > totalHits) {
      console.log('perebor');
      refs.loadMoreBtn.classList.add('visually-hidden');
      Notify.failure("We're sorry, but you've reached the end of search results.");
    }
  });
}

async function makeGallary(searchQuery) {
  const pictures = await getPictures(searchQuery, currentPage);
  console.log('🚀 ~ pictures after', pictures);

  if (pictures.hits.length === 0) {
    throw Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
    );
  }
  renderPictures(pictures.hits);

  currentPage += 1;
  return pictures.totalHits;
}
function renderPictures(pictureArray) {
  const markup = makeMarkup(pictureArray);
  refs.pictures.insertAdjacentHTML('beforeend', markup);
  const lightbox = new SimpleLightbox('.gallery a ');
  lightbox.refresh();
}
