import { fetchColectImg } from './getimage';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';

const elements = {
  formEl: document.querySelector('.search-form'),
  //const boddy = document.querySelector('body');
  containerEl: document.querySelector('.gallery'),
  btnLoadEl: document.querySelector('.load-more'),
  guardEl: document.querySelector('.js-guard'),
};

const { formEl, containerEl, btnLoadEl } = elements;
const imgPerPage = 12;
let currentPage;
let totalImg;
formEl.searchQuery.value = 'Филин';
formEl.addEventListener('submit', handlerSubmit);
btnLoadEl.addEventListener('click', handlerLoadNextPage);
function handlerLoadNextPage() {
  getNextPage();
}
let options = {
  //  root: null,
  rootMargin: '200px',
  // threshold: 0.1,
};
let callback = function (entries, observer) {
  console.log('afdfsdgfsdfgdfgs');
  /* Content excerpted, show below */
  getNextPage();
};
let observer = new IntersectionObserver(callback, options);
function handlerSubmit(e) {
  e.preventDefault();
  currentPage = 0;

  getNextPage();
  console.log('befor observe');
  console.log('currentPage * imgPerPage ', currentPage * imgPerPage);
  console.log('totalImg', totalImg);

  if (currentPage * imgPerPage < totalImg) {
    console.log('On observe');
    observer.observe(elements.guardEl);
  }
}

function getNextPage() {
  currentPage += 1;
  fetchColectImg(formEl.searchQuery.value, currentPage, imgPerPage)
    .then(response => {
      const data = response.data;
      console.log('11111resp', response);

      totalImg = data.total;
      console.log('totalImg', totalImg);
      if (!totalImg) {
        throw new Error(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }

      showElm(btnLoadEl, true);
      markupResults(data.hits);
    })
    .catch(error => {
      console.log('Помилка: ', error);
      showError(error);
    });
}

function showElm(elem, show) {
  if (show || elem.classList.contains('js-load-more')) {
    elem.classList.remove('js-load-more');
  } else if (!show || !elem.classList.contains('js-load-more'))
    elem.classList.add('js-load-more');
}
function markupResults(arr) {
  // webformatURL - посилання на маленьке зображення для списку карток.
  // largeImageURL - посилання на велике зображення.
  // tags - рядок з описом зображення. Підійде для атрибуту alt.
  // likes - кількість лайків.
  // views - кількість переглядів.
  // comments - кількість коментарів.
  // downloads - кількість завантажень.
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
  // console.log(currentPage);
  // console.log(imgPerPage);
  // console.log('output ', currentPage * imgPerPage);
  // console.log('total ', totalImg);
  if (currentPage === 1) {
    containerEl.innerHTML = markapCard;
  } else {
    containerEl.insertAdjacentHTML('beforeend', markapCard);
  }
  showOrHideBtnLoad();
  const galery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
}
function showOrHideBtnLoad() {
  if (currentPage * imgPerPage >= totalImg) {
    showElm(btnLoadEl, false);
  }
}
function showError(msg) {
  Notiflix.Notify.init({
    width: '280px',
    position: 'left-top', // 'right-top' - 'right-bottom' - 'left-top' - 'left-bottom' - 'center-top' - 'center-bottom' - 'center-center'
    distance: '50px',
    timeout: 5000,
    info: {
      background: '#e02525',
    },
  });

  Notiflix.Report.warning(
    'Sorry, there are no images matching your search query. Please try again.',
    msg,
    'Ok'
  );
  showOrHideBtnLoad();
}
