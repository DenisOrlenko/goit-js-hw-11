// ИМПОРТИРУЮ БИБЛИОТЕКИ (УВЕДОМЛЕНИЯ И ПЛАГИН ДЛЯ ПРОСМОТРА КАРТИНОК)
import { Notify } from 'notiflix';
// ===================================================
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// ИМПОРТИРУЮ Ф-ИИ:
// fetchImages - ЗАПРОС НА СЕРВЕР
// renderMarkup - ОТРИСОВКА ДИНАМИЧЕСКОЙ РАЗМЕТКИ С ВСТРОЕННЫМИ ДИНАМИЧЕСКИМИ ПАРАМЕТРАМИ ЗАПРОСА
import fetchImages from './js/fetch-api';
import renderMarkup from './js/render-markup';

Notify.init({
  width: '30%',
  fontSize: '20px',
});

// ДОБАВЛЯЮ ОБЬЕКТ НАСТРОЕК ДЛЯ simpleLightBox + ВЕШАЮ ПЛАГИН НА ССЫЛКУ В КОТОРУЮ ОБЕРНУТА КАРТИНКА
const simpleLightBox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
  captionPosition: 'bottom',
  captionSelector: 'img',
});

// 6- СОЗАЮ ПЕРЕМЕННЫЕ ПО УМОЛЧАНИЮ
// searchQuery = ПОИСКОВЫЙ ЗАПРОС, КОТОРЫЙ ВВЕЛ ПОЛЬЗОВАТЕЛЬ
// page - СТРАНИЦА С ДАННЫМИ, КОТОРЫЕ ПРИШЛИ С БЕКЕНДА
let searchQuery = '';
let page = 1;

// 1-Создаю ссылку на ИНПУТ => ДЛЯ НАЧАЛА РАБОТЫ ПОЛЬЗОВАТЕЛЯ ПРИ ПОИСКЕ КАРТИНОК (даже при попадании на форму)
const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

// 2-Вешаю слушатель на ФОРМУ: при событии САБМИТ на ФОРМЕ
// => передаю КОЛБЕК(ссылку на ф-ю), который будет давать ссылку на вызов ф-ии onInput
refs.searchForm.addEventListener('submit', onSearchFormSubmit);
// ВКШАЮ СЛУШАТЕЛЬ НА КНОПКУ "СМОТРЕТЬ БОЛЬШЕ"
refs.loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

// ЗАДАЮ ДИНАМИЧЕСКИЙ СТИЛЬ ДЛЯ КНОПКИ - СМОТРЕТЬ БОЛЬШЕ => ПО УМОЛЧАНИЮ "is-hidden" Т.Е. DISPLAY:NONE
refs.loadMoreBtn.classList.add('is-hidden');

// 3-СОЗДАЮ Ф-Ю fetchImages, КОТОРАЯ БУДЕТ ДЕЛАТЬ ЗАПРОС НА БЕКЕНД И ПОЛУЧАТЬ ДАННЫЕ

// 4- СОЗДАЮ Ф-Ю renderMarkup, КОТОРАЯ БУДЕТ рендерить динамическую разметку (если получили ПРОМИС)
// + динамическая интерполяция(подстановка) в разметку динамических параметров

// 5- СОЗДАЮ АССИНХРОННУЮ Ф-Ю КОТОРАЯ ОБРАБАТЫВАЕТ ДАННЫЕ - ОТВЕТ С БЕКЕНДА
async function onSearchFormSubmit(e) {
  // ПРИ НАЖАТИИ НА КНОПКУ ПОИСК => ПРОИСХОДИТ СОБЫТИЕ SUBMIT - ПО УМОЛЧАНИЮ СРАБАТЫВАЕТ ПЕРЕЗАГРУЗКА СТРАНИЦЫ ПРИ ОТПРАВКЕ ФОРМЫ => preventDefault() - ОТМЕНА ПЕРЕЗАГРУЗКИ СТРАНИЦЫ ПРИ ОТПРАВКЕ ФОРМЫ
  e.preventDefault();
  // => trim() - САНАЦИЯ ВВЕДЕННОГО ПОЛЬЗОВАТЕЛЕМ ЗАПРОСА - Т.Е. ЕСЛИ ВНАЧАЛЕ БЫЛИ ПРОБЕЛЫ, А ПОТОМ УЖЕ ВВОДИЛСЯ ТЕКСТ ЗПРОСА, ТО ПРОБЕЛЫ НЕ БЕРУТСЯ В УЧЕТ
  searchQuery = e.currentTarget.searchQuery.value.trim();

  // ЕСЛИ ЗАПРОС ПУСТОЙ - ТО ОБРЫВАЮ Ф-Ю И ЗАПРОС НЕ ВЫПОЛНЯЕТСЯ
  if (searchQuery === '') {
    return;
  }

  refs.loadMoreBtn.classList.add('is-hidden');
  // ОЧИЩАЮ ИНТЕРФЕЙС ОТ БАЗОВОЙ РАЗМЕТКИ (form, input, button) ПРИ ПОЛУЧЕНИИ ДАННЫХ С БЕКЕНДА
  refs.galleryContainer.innerHTML = '';

  // ЗАПУСКАЮ Ф-Ю, КОТОРАЯ ОТОБРАЖАЕТ 1 СТРАНИЦУ ЗАПРОСА = resetPage() {page = 1}
  resetPage();

  // ПРИ НАЧАЛЕ РАБОТЫ З ДАННЫМИ, КОТОРЫЕ БУДУ ОБРАБАТЫВАТЬ => ПОМЕЩАЮ КОД В try...catch - ДЛЯ ТОГО, ЧТОБЫ СЛОВИТЬ ВОЗМОЖНУЮ ОШИБКУ, ЧТОБЫ НЕ УПАЛ КОД
  try {
    // => response - ПРИСВАИВАЮ ЗНАЧЕНИЕ ПЕРЕМЕННОЙ ТОЛЬКО ПОСЛЕ ПОЛУЧЕНИЯ ДАННЫХ С БЕКЕНДА (const response = await... => await - ЭТО ОЖИДАНИЕ ПОКА ВЫПОЛНИТСЯ КОД В ПРАВОЙ ЧАСТИ ВЫРАЖЕНИЯ => И ТОЛЬКО ПОСЛЕ ЭТОГО ВЫПОЛНЯЕТСЯ ЛЕВАЯ ЧАСТЬ, Т.Е. ПЕРЕМЕННОЙ ПРИСВОИТСЯ РЕЗ-Т ВЫПОЛНЕНИЯ КОДА ИЗ ПРАВОЙ ЧАСТИ) => Т.Е. ЕСЛИ ПРАВАЯ ЧАСТЬ ВЫРАЖЕНИЯ НЕ ВЫПОЛНИТСЯ, ТО ЛЕВАЯ ЧАСТЬ НЕ ВЫПОЛНИТСЯ, ОДНАКО НАШ КОД НЕ ЛЯЖЕТ, А ОШИБКУ СЛОВИТ catch()
    // => response - ЭТО ОБЬЕКТ СО СВОЙСТВАМИ
    const response = await fetchImages(searchQuery, page);
    // console.log('response:', response)

    // => response.data - ЗАБИРАЮ ИЗ ОБЬЕКТА - response СВОЙСТВО data СО СВОИМ ОБЬЕКТОВ НУЖНЫХ МНЕ СВОЙСТВ
    const data = response.data;

    // => totalHitlist - Количество изображений, доступных через API. По умолчанию API может возвращать не более 500 изображений на запрос.
    // ЕСЛИ НА МОЙ ЗАПРОС НЕ ПРИШЛИ ДАННЫЕ (НЕТ ТАКИХ КАРТИНОК С ТАКИМ ВВЕДЕННЫМ ЗАПРОСОМ) => ОТОБРАЖАЮ УВЕДОМЛЕНИЕ - "ПО ВАШЕМУ ЗАПРОСУ НИЧЕГО НЕ НАЙДЕНО"
    if (data.totalHitlist === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    // ЕСЛИ НА ЗАПРОС ПОЛЬЗОВАТЕЛЯ С БЕКЕНДА ПРИХОДИТ МЕНЕЕ 40 ОБЬЕКТОВ, ТО ОСТАВЛЯЮ КНОПКУ "СМОТРЕТЬ БОЛЬШЕ" СКРЫТОЙ
    // =>  Notify.success - ДИНАМИЧЕСКИ ПОДСТАВЛЯЮ totalHits - ОБЩЕЕ КОЛ-ВО ОБЬЕКТОВ(КАРТИНОК), КОТОРЫЕ ДОСТУПНЫ НА СЕРВЕРЕ
    else if (data.totalHits > 40) {
      Notify.success(`Hooray! We found ${data.totalHits} images.`);

      // ВЫЗЫВАЮ Ф-Ю renderMarkup() С ПАРАМЕТРОМ hits - МАССИВ ОБЬЕКТОВ (МАССИВ КАРТИНОК)
      renderMarkup(data.hits);

      // метод refresh() - будет вызыватся каждый раз после добавления новой группы карточек изображений, т.е. после каждой новой разметки renderMarkup(data.hits)
      simpleLightBox.refresh();

      // СНИМАЮ(remove) 'is-hidden' С КНОПКИ => КНОПКА ОТОБРАЖАЕТСЯ ПРИ УСЛОВИИ, ЧТО С СЕРВЕРА ПРИШЛО БОЛЕЕ 40 ОБЬЕКТОВ С КАРТИНКАМИ
      refs.loadMoreBtn.classList.remove('is-hidden');
    }

    // ЕСЛИ В ОТВЕТ НА ВВЕДЕННЫЙ ЗАПРОС С БЕКЕНДА ПРИШЛО МЕНЕЕ 40 ОБЬЕКТОВ, ТО ОТОБРАЖАТЬ КНОПКУ "СМОТРЕТЬ БОЛЬШЕ" - НЕ НАДО
    else if (data.totalHits < 40) {
      // Ф-Я СКРЫВАЕТ КНОПКУ "СМОТРЕТЬ БОЛЬШЕ" - ЕСЛИ НА СТРАНИЦЕ МЕНЬШЕ 40 ОБЬЕКТОВ С КАРТИНКАМИ
      onNotify();

      // РЕНДЕРИТСЯ НОВАЯ РАЗМЕТКА - НА КАЖДЫЙ МАССИВ ДАННЫХ, КОТОРЫЙ ПРИХОДИТ
      renderMarkup(data.hits);

      // ОБНОВЛЯЕТСЯ simpleLightBox
      simpleLightBox.refresh();
    }
  } catch (error) {
    console.log(error);
  }
}

// 6- СОЗДАЮ Ф-Ю, КОТОРАЯ БУДЕТ ВЫПОЛНЯТЬ КОД => ПОСЛЕ НАЖАТИЯ НА КНОПКУ "СМОТРЕТЬ БОЛЬШЕ" ПОСЛЕ ЕЕ НАЖАТИЯ
async function onLoadMoreBtnClick() {
  // СКРЫТИЕ КНОПКИ "СМОТРЕТЬ БОЛЬШЕ" ПОСЛЕ ЕЕ НАЖАТИЯ
  refs.loadMoreBtn.classList.add('is-hidden');

  // ВЫЗОВ Ф-ИИ => СЧИТАЕТ СТРАНИЦЫ - ДОБАВЛЯЕТ - ПРЕХОДИТ НА СЛЕДУЮЩУЮ => ПРИ ПЕРЕХОДЕ НА СЛЕД СТРАНИЦУ - ОТПРАВЛЯЕТСЯ ЗАПРОС НА СЕРВЕР
  increment();

  // ПРИМЕНЯЮ try...catch ДЛЯ ОБРАБОТКИ ОШИБКИ В catch() = ЧТОБЫ КОД НЕ УПАЛ
  try {
    const response = await fetchImages(searchQuery, page);
    const data = response.data;

    renderMarkup(data.hits);
    simpleLightBox.refresh();

    // Вызов ф-ии плавной прокрутки страницы после запроса и отрисовка каждой следующей группы изображений
    scrollGallery();

    // ЕСЛИ НА ЗАПРОС ПРИШЛО МЕНЕЕ 40 ОБЬЕКТОВ С КАРТИНКАМИ => пряч кнопку и выводи уведомление с текстом
    if (40 > data.totalHits) {
      onNotify();
    }

    // ЕСЛИ ЖЕ КАРТИНОК - БОЛЬШЕ 40 => ОТОБРАЖАТЬ КНОПКУ "СМОТРЕТЬ БОЛЬШЕ"
    else {
      refs.loadMoreBtn.classList.remove('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}

function resetPage() {
  page = 1;
}

// Ф-Я СЧИТАЕТ СТРАНИЦЫ - ДОБАВЛЯЕТ - ПРЕХОДИТ НА СЛЕДУЮЩУЮ => ПРИ ПЕРЕХОДЕ НА СЛЕД СТРАНИЦУ - ОТПРАВЛЯЕТСЯ ЗАПРОС НА СЕРВЕР
function increment() {
  page += 1;
}

// Ф-Я СКРЫВАЕТ КНОПКУ "СМОТРЕТЬ БОЛЬШЕ" - ЕСЛИ НА СТРАНИЦЕ МЕНЬШЕ 40 ОБЬЕКТОВ С КАРТИНКАМИ
function onNotify() {
  refs.loadMoreBtn.classList.add('is-hidden');
  Notify.failure("We're sorry, but you've reached the end of search results.");
}

// ф-я плавной прокрутки страницы после запроса и отрисовка каждой следующей группы изображений
async function scrollGallery() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
