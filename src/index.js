import { fetchColectImg } from './getimage';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix, { Notify } from 'notiflix';
const elements = {
  formEl: document.querySelector('.search-form'),
  containerEl: document.querySelector('.gallery'),
  btnLoadEl: document.querySelector('.load-more'),
  guardEl: document.querySelector('.js-guard'),
};
const { formEl, containerEl, btnLoadEl } = elements;
const imgPerPage = 40;
let currentPage;
let totalImg;
let showMarkap;
let gallerySimL;
formEl.addEventListener('submit', handlerSubmit);
btnLoadEl.addEventListener('click', handlerLoadNextPage);
function handlerLoadNextPage() {
  getNextPage();
}
let handlerInfiniteScroll = function (entries, observer) {
  getNextPage();
};
let observer = new IntersectionObserver(handlerInfiniteScroll, {
  rootMargin: '200px',
});
function handlerSubmit(e) {
  e.preventDefault();
  currentPage = 0;
  showMarkap = true;
  getNextPage();
  if (currentPage * imgPerPage < totalImg) {
    observer.observe(elements.guardEl);
  }
}
function getNextPage() {
  currentPage += 1;
  fetchColectImg(formEl.searchQuery.value, currentPage, imgPerPage)
    .then(response => {
      const data = response.data;
      totalImg = data.total;
      if (!totalImg) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      if (currentPage === 1) {
        Notify.info(`Hooray! We found ${data.total} images.`, {
          timeout: 10000,
          showOnlyTheLastOne: true,
        });
      }
      if (showMarkap) {
        markupResults(data.hits);
        showOrHideBtnLoad();
        showElm(btnLoadEl, true);
        initSimpleLightbox();
        observer.observe(elements.guardEl);
      }
    })
    .catch(error => {
      Notify.failure(error.message, { showOnlyTheLastOne: true });
      containerEl.innerHTML = '';
      showElm(btnLoadEl, false);
    });
}
function showElm(elem, show) {
  if (show && elem.classList.contains('js-load-more')) {
    elem.classList.remove('js-load-more');
  } else if (!show && !elem.classList.contains('js-load-more')) {
    elem.classList.add('js-load-more');
  }
}
function markupResults(arr) {
  const valueDefault = {
    urlImg:
      'https://t3.ftcdn.net/jpg/04/60/01/36/240_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg',
  };
  const markapCard = arr
    .map(
      ({
        largeImageURL,
        webformatURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return ` <div class="photo-card">
          <a href="${
            largeImageURL || valueDefault.urlImg
          }" class="gallery__link">
            <img
              width="300"
              class="gallery__image"
              src="${webformatURL || valueDefault.urlImg}"
              alt="${tags}"
              loading="lazy"
            />
          </a>
          <div class="info">
            <p class="info-item">
              <b>Likes</b>
              ${likes}
            </p>
            <p class="info-item">
              <b>Views</b>
              ${views}
            </p>
            <p class="info-item">
              <b>Comments</b>
              ${comments}
            </p>
            <p class="info-item">
              <b>Downloads</b>
              ${downloads}
            </p>
          </div>
        </div>`;
      }
    )
    .join('');
  if (currentPage === 1) {
    containerEl.innerHTML = markapCard;
  } else {
    containerEl.insertAdjacentHTML('beforeend', markapCard);
  }
}
function showOrHideBtnLoad() {
  if (currentPage * imgPerPage >= totalImg) {
    showMarkap = false;
    showElm(btnLoadEl, false);
    Notify.info("We're sorry, but you've reached the end of search results.", {
      showOnlyTheLastOne: true,
    });
  }
}
function initSimpleLightbox() {
  if (gallerySimL) {
    gallerySimL.destroy();
  }
  gallerySimL = new SimpleLightbox('.photo-card a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}
