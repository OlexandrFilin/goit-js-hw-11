import { fetchColectImg } from './getimage';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix, { Notify } from 'notiflix';

// const galery = new SimpleLightbox('.gallery a', {
//   captionsData: 'alt',
//   captionDelay: 250,
// });
// const anchors = document.querySelectorAll('a[href ="#"]')
const anchors = document.querySelectorAll('a');
console.log(anchors);
// for (let anchor of anchors) {
//   anchor.addEventListener('click', function (e) {
//     e.preventDefault()

//     const blockID = anchor.getAttribute('href').substr(1)

//     document.getElementById(blockID).scrollIntoView({
//       behavior: 'smooth',
//       block: 'start'
//     })
//   })

const elements = {
  formEl: document.querySelector('.search-form'),
  //const boddy = document.querySelector('body');
  containerEl: document.querySelector('.gallery'),
  btnLoadEl: document.querySelector('.load-more'),
  guardEl: document.querySelector('.js-guard'),
};

const { formEl, containerEl, btnLoadEl } = elements;
const imgPerPage = 40;
let currentPage;
let totalImg;
formEl.searchQuery.value = 'Филин';
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
      if (currentPage === 1) {
        Notify.info(`Hooray! We found ${data.total}images.`, {
          timeout: 7000,
          showOnlyTheLastOne: true,
          //position: 'center-top',
        });
      }

      markupResults(data.hits);
      showElm(btnLoadEl, true);
      showOrHideBtnLoad();
      //  showMessage(data.hits);
      //galery.refresh();
      observer.observe(elements.guardEl);
    })
    .catch(error => {
      console.log('errpr ', error);
      Notify.failure(error.message);
    });
}

function showElm(elem, show) {
  if (show || elem.classList.contains('js-load-more')) {
    elem.classList.remove('js-load-more');
  } else if (!show || !elem.classList.contains('js-load-more'))
    elem.classList.add('js-load-more');
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
  // console.log(currentPage);
  // console.log(imgPerPage);
  // console.log('output ', currentPage * imgPerPage);
  // console.log('total ', totalImg);
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

// const { height: cardHeight } = document
//   .querySelector('.gallery')
//   .firstElementChild.getBoundingClientRect();

// window.scrollBy({
//   top: cardHeight * 2,
//   behavior: 'smooth',
// });
