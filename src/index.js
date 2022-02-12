import './sass/main.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { getPictures, makeUrl } from './getPicture';
import { makeMarkup, getItemHTML } from './makeMarkup';
import InfiniteScroll from 'infinite-scroll';

const refs = {
  form: document.querySelector('.search-form'),
  pictures: document.querySelector('.gallery'),
  photoCard: document.querySelector('.photo-card'),
  loadMoreBtn: document.querySelector('.load-more'),
  checkbox: document.querySelector('checkbox'),
};
const lightbox = new SimpleLightbox('.gallery a ');
let currentPage = 1;
let searchQuery = '';

refs.form.addEventListener('submit', onSubscribe);
refs.loadMoreBtn.addEventListener('click', onClick);

function onSubscribe(evt) {
  evt.preventDefault();
  const useInfiniteScroll = refs.form.elements.infiniteScroll.checked;
  searchQuery = evt.currentTarget.elements.searchQuery.value.trim();
  if (!searchQuery) {
    return;
  }
  refs.pictures.innerHTML = '';
  currentPage = 1;
  if (useInfiniteScroll) {
    infiniteScroll();
    refs.loadMoreBtn.classList.add('visually-hidden');
  } else {
    makeGallary(searchQuery)
      .then(totalHits => {
        Notify.success(`Hooray! We found ${totalHits} images.`);
        if (totalHits > 40) {
          refs.loadMoreBtn.classList.remove('visually-hidden');
        } else {
          refs.loadMoreBtn.classList.add('visually-hidden');
        }
      })
      .catch(error => error);
  }
}
function onClick(evt) {
  makeGallary(searchQuery).then(totalHits => {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    if ((currentPage - 1) * 40 > totalHits) {
      refs.loadMoreBtn.classList.add('visually-hidden');
      Notify.failure("We're sorry, but you've reached the end of search results.");
    }
  });
}

async function makeGallary(searchQuery) {
  const pictures = await getPictures(searchQuery, currentPage);

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

  lightbox.refresh();
}

////////////// InfiniteScroll

function infiniteScroll() {
  refs.form.elements.infiniteScroll.addEventListener('change', onCheckbox);

  function onCheckbox(evt) {
    if (!evt.currentTarget.checked) {
      infScroll.destroy();
      refs.loadMoreBtn.classList.remove('visually-hidden');
    }
  }

  let infScroll = new InfiniteScroll(refs.pictures, {
    path: function () {
      currentPage = this.pageIndex;
      return makeUrl(searchQuery, this.pageIndex);
    },

    responseBody: 'json',
    status: '.scroll-status',
    history: false,
    checkLastPage: true,
  });

  // use element to turn HTML string into elements
  let proxyElem = document.createElement('div');

  infScroll.loadNextPage();

  infScroll.once('load', function (body) {
    if (body.totalHits > 0) {
      Notify.success(`Hooray! We found ${body.totalHits} images.`);
    }
  });

  infScroll.on('load', function (body) {
    // compile body data into HTML
    if (body.hits.length === 0) {
      Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }
    if ((currentPage - 1) * 40 > body.totalHits) {
      infScroll.destroy();
      Notify.failure("We're sorry, but you've reached the end of search results.");
      return;
    }
    var itemsHTML = body.hits.map(getItemHTML).join('');
    // convert HTML string into elements
    proxyElem.innerHTML = itemsHTML;
    // append item elements
    refs.pictures.append(...proxyElem.children);
    lightbox.refresh();
  });
}
