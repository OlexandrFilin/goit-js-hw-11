import axios from 'axios';
const APIKEY_PIXABAY = '39086403-fd0308a4d4ae8aa4a8015255b';
const BASE_URL_PIXABAY = 'https://pixabay.com/api/';

async function fetchColectImg(strSearch, pageNumber, perPage) {
  console.log(pageNumber);
  const param = new URLSearchParams({
    key: APIKEY_PIXABAY,
    q: strSearch,
    safesearch: true,
    image_type: 'photo',
    orientation: 'horizontal',
    page: pageNumber,
    per_page: perPage,
  });
  const response = await axios.get(`${BASE_URL_PIXABAY}?${param.toString()}`);
  console.log(response);
  if (!response.data) {
    throw new Error(response.status);
  }
  return response;
}

export { fetchColectImg };
