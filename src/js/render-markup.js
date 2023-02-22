// 4- СОЗДАЮ Ф-Ю renderMarkup, КОТОРАЯ БУДЕТ рендерить динамическую разметку (если получили ПРОМИС)
// + динамическая интерполяция(подстановка) в разметку динамических параметров

const refs = {
  galleryContainer: document.querySelector('.gallery'),
};

async function renderMarkup(images) {
  // => images - МАССИВ ОБЬЕКТОВ(img) (ГАЛЕРЕЯ ИЗ КАРТИНОК) => МАССИВ images = [{img}, {img}, {img}]
  // => images.map() - ПЕРЕБИРАЮ МАССИВ МЕТОДОМ map() => МЕТОД map() ПЕРЕБИРАЕТ ПО ЭЛЕМЕНТАМ, В НАШЕМ СЛУЧАЕ ПО ОБЬЕКТАМ(img) => ЧЕРЕЗ ПАРАМЕТРЫ ОБЬЕКТА - ДЕСТРУКТУРИЗИРУЮ ОБЬЕКТ
  // => return - РЕЗУЛЬТАТОМ Ф-ИИ ЯВЛ-СЯ ДИНАМИЧЕСКАЯ РАЗМЕТКА С ПРИМЕНЕНИЕМ ИНТЕРПОЛЯЦИИ ДИНАМИЧЕСКИХ ПАРАМЕТРОВ
  // => refs.gallery.insertAdjacentHTML(MARKUP) - ВСТАВЛЯЮ РАЗМЕТКУ В ВЫБРАННЫЙ ЭЛ-Т БАЗОВОЙ РАЗМЕТКИ
  // const markup = images.map(img => {const {..} = img; return...}) - МЕТОД map - ВЫЗЫВАЕТ СТРЕЛОЧНУЮ Ф-Ю С ПАРАМЕТРОМ img(ОБЬЕКТ ИЗ МАССИВА),КОТОРАЯ ПЕРЕБИРАЕТ МАССИВ images
  const markup = images
    .map(img => {
      const {
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = img;
      return `
			<div class="photo-card">
					<a class="photo-link" href="${largeImageURL}">
						<img src="${webformatURL}" alt="${tags}" width="350" height="250" loading="lazy" />
					</a>
				<div class="info">
					<p class="info-item">
						<b>Likes ${likes}</b>
					</p>
					<p class="info-item">
						<b>Views ${views}</b>
					</p>
					<p class="info-item">
						<b>Comments ${comments}</b>
					</p>
					<p class="info-item">
						<b>Downloads ${downloads}</b>
					</p>
				</div>
			</div>
				`;
    })
    .join('');

  refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}

export default renderMarkup;

//
//

//

//

//
//
// hits -	МАССИВ ДАННЫХ, СОСТОЯЩИЙ ИЗ ОБЬЕКТОВ(ОТДЕЛЬНЫЕ КАРТИНКИ) СО СВОЙСТВАМИ
// hits.map({likes: 100, comments: 200, ...}) - МАССИВ hits, КОТОРЫЙ СОСТОИТ ИЗ ОБЬЕКТОВ => ПЕРЕБИРАЮ МЕТОДОМ map()
// => map({likes, views}) - ДЕСТРУКТУРИЗИРУЮ ОБЬЕКТ НА НУЖНЫЕ МНЕ СВОЙСТВА
// => return - РЕЗУЛЬТАТОМ Ф-ИИ ЯВЛ-СЯ ДИНАМИЧЕСКАЯ РАЗМЕТКА С ПРИМЕНЕНИЕМ ИНТЕРПОЛЯЦИИ ДИНАМИЧЕСКИХ ПАРАМЕТРОВ
// .join('') -

// function renderMarkup(hits) {
// 	return hits
// 		.map(
// 			({
// 				webformatURL,
// 				largeImageURL,
// 				likes,
// 				views,
// 				comments,
// 				tags,
// 				downloads,
// 			}) => {
// 				return `
// 				<div class='photo-card'></div>`;
// 			}
// 		)
// 		.join('');
