// ИМПОРТИРУЮ БИБЛИОТЕКУ для HTTP-запросов
import axios from 'axios';

// ПЕРЕМЕННЫЕ
const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '33529022-8d294fa435ec1489821105408';
// ПЕРЕМЕННАЯ (per_page) ИСПОЛЬЗУЕТСЯ ПРИ ПАГИНАЦИИ - В ОТВЕТЕ С БЕКЕНДА ПРИХОДИТ 40 ЭЛ-В ПРОПИСАННЫХ В searchQuery
const per_page = 40;

// АСИНХРОННАЯ Ф-Я - async/await
async function fetchImages(searchQuery, page) {
  const filter = `?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`;

  const response = await axios.get(`${BASE_URL}${filter}`);
  return response;
}

export default fetchImages;
