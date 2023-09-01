import { fetchColectImg } from './getimage';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix, { Notify } from 'notiflix';
//import Notiflix from 'notiflix';

const galLerySimL = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

const elements = {
  formEl: document.querySelector('.search-form'),
  //const boddy = document.querySelector('body');
  containerEl: document.querySelector('.gallery'),
  btnLoadEl: document.querySelector('.load-more'),
  guardEl: document.querySelector('.js-guard'),
  btnScrollUp: document.querySelector('.scroll-up'),
};

const { formEl, containerEl, btnLoadEl, btnScrollUp } = elements;
const imgPerPage = 40;
let currentPage;
let totalImg;
formEl.searchQuery.value = 'kosmos';
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

  getNextPage();
  if (currentPage * imgPerPage < totalImg) {
    // console.log('On observe');
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
        Notify.info(`Hooray! We found ${data.total}images.`, {
          timeout: 10000,
          showOnlyTheLastOne: true,
          //position: 'center-top',
        });
      }

      markupResults(data.hits);
      showElm(btnLoadEl, true);
      showOrHideBtnLoad();
      //  showMessage(data.hits);
      galLerySimL.refresh();
      observer.observe(elements.guardEl);
    })
    .catch(error => {
      //console.log('errpr ', error);
      Notify.failure(error.message, { showOnlyTheLastOne: true });
      // Notiflix.failure(error.message, { showOnlyTheLastOne: true });
      containerEl.innerHTML = '';
      showElm(btnLoadEl, false);
    });
}

function showElm(elem, show) {
  if (show && elem.classList.contains('js-load-more')) {
    // console.log('show');
    elem.classList.remove('js-load-more');
  } else if (!show && !elem.classList.contains('js-load-more')) {
    elem.classList.add('js-load-more');
    //  console.log('hidden');
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

   <a href="${largeImageURL || valueDefault.urlImg}  " class ="gallery__link">
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
        </div>

  `;
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
    showElm(btnLoadEl, false);
  }
}
//window.addEventListener('scroll', onClickScroll);

function onClickScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  console.log(cardHeight);

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
