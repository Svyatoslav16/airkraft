let passengersData = [];

let searching = false; // Осуществляется ли поиск в данный момент
let loadingSearchData = true; // Загрузка дополнительных результатов поиска
let windowScrolling = false; // Осуществляется ли скролл в данный момент

const searchInput = document.getElementsByClassName('search__input')[0];

const tbody = document.getElementsByClassName('passengers-table__body')[0];

// Заголовки для ячеек таблицы
const thNameArray = [
  {
    thLabel: 'class',
    passengerPropertyName: 'Класс'
  },
  {
    thLabel: 'survived',
    passengerPropertyName: 'Выживший'
  },
  {
    thLabel: 'name',
    passengerPropertyName: 'ФИО'
  },
  {
    thLabel: 'gender',
    passengerPropertyName: 'Пол'
  },
  {
    thLabel: 'age',
    passengerPropertyName: 'Возраст'
  },
  {
    thLabel: 'ticket',
    passengerPropertyName: 'Билет'
  },
  {
    thLabel: 'cabin',
    passengerPropertyName: 'Каюта'
  },
  {
    thLabel: 'boat',
    passengerPropertyName: 'Шлюпка'
  },
  {
    thLabel: 'home.dest',
    passengerPropertyName: 'Адрес'
  }
];

(async function() {
  // Начальные данные для таблицы
  const initialPassengers = await getPassengersData(0, 10) || [];

  renderPassengersData(initialPassengers, thNameArray, tbody, true);

  /* Если размер окна идентичен или больше тела сайта, то подгружаем ещё данных - это самый простой способ, можно также добавить кнопку, 
     но т.к. при скролле нет кнопки "Загрузить ещё", то, как по-мне, будет логичнее просто догрузить. Использована простая рекурсия */
  await loadingForLargeScreensRecursively();
})();

// Когда пользователь доскроллил до конца таблицы подгружаем ещё данные
window.addEventListener("scroll", async () => {
  if ( (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight &&
    windowScrolling === false &&
    searching === false) {
    windowScrolling = true;

    let passengersDataToAdd = await getPassengersData(tbody.children.length, 40);
    
    if(passengersDataToAdd.length > 0) {
      renderPassengersData(
        passengersDataToAdd,
        thNameArray, 
        tbody,
        true
      );

      windowScrolling = false;
    }
  } else if( (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight && 
    searching === true &&
    loadingSearchData === true) {
    loadingSearchData = false;
    let additionalData = await searchByValue(searchInput.value, 
                                            tbody.children[tbody.children.length - 1].dataset.id, 
                                            20);
    
    if(additionalData.length > 0) {
      renderPassengersData(
        additionalData,
        thNameArray, 
        tbody,
        false
      );

      loadingSearchData = true;
    }
  }
});

document.getElementsByClassName('search__icon')[0].addEventListener('click', function() {
  searchInput.value = '';
  tbody.innerHTML = '';
  renderPassengersData(passengersData, thNameArray, tbody);

  searching = false;
  loadingSearchData = true;
});

searchInput.addEventListener('input', function() {
  loadingSearchData = true;
  renderSearchResults(this.value);
});

/** Создание и заполнение записей о пассажирах и добавление их в таблицу
 * Параметры:
 * data - данные пассажиров в виде массива
 * thNameArray - заголовки для ячеек таблицы
 * parentElement - куда будут добавляться сформированные записи
 * addToPassengersArray - добавлять ли эти данные в массив с пассажирами
 */
function renderPassengersData(data = [], thNameArray, tbody, addToPassengersArray = false) {
  for (let i = 0; i < data.length; i++) {
    let tr = document.createElement('tr');
      tr.dataset.id = data[i].id;

    for (let j = 0; j < thNameArray.length; j++) {
      let td = document.createElement('td');
        td.innerText = data[i][thNameArray[j].thLabel];
        td.dataset.label = thNameArray[j].passengerPropertyName;
      tr.append(td);
    }

    if(addToPassengersArray === true) {
      passengersData.push(data[i]);
    }

    tbody.append(tr);
  }
}

/** Получение данных с сервера о пассажирах 
 * Параметры:
 * startPosition - позиция, с которой будет начинаться поиск в массиве данных
 * numberOfRecords - количество необходимых записей
*/
async function getPassengersData(startPosition = 0, numberOfRecords = 40) {
  let passengers = await fetch('/getPassengersData', {
    method: 'POST',
    body: JSON.stringify({
      startPosition,
      numberOfRecords
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if(!res.ok) {
      let messageWrap = document.createElement('div');
        messageWrap.className = 'message-wrap';
      let message = document.createElement('div');
        message.className = 'message';

      message.innerText = 'Произошла ошибка при получении данных';
      messageWrap.append(message);
      document.querySelector('body').append(messageWrap);

      setTimeout(() => {
        document.querySelector('.message-wrap').remove();
      }, 2000);

      return [];
    } else {
      return res.json();
    }
  });

  return passengers;
}

/** Рендер результатов поиска 
 * Параметры:
 * value - искомое значение
 */
async function renderSearchResults(value) {
  if( value.length > 0 ) {
    let arrayOfMatches = await searchByValue(value);

    tbody.innerHTML = '';

    searching = true;
    renderPassengersData(arrayOfMatches, thNameArray, tbody);
  } else {
    if( tbody.children.length < passengersData.length ) {
      tbody.innerHTML = '';
      renderPassengersData(passengersData, thNameArray, tbody);
    }

    searching = false;
  }
}

/** Поиск записей по значению
 * Параметры:
 * value - искомое значение
 * startPosition - позиция, с которой будет начинаться поиск в массиве данных
 * numberOfRecords - количество необходимых записей
 */
async function searchByValue(value, startPosition = 0, numberOfRecords = 30) {
  let searchResults = await fetch('/getPassengersData', {
    method: 'POST',
    body: JSON.stringify({
      value,
      isSearch: true,
      startPosition,
      numberOfRecords
    }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => {
    return res.json();
  });

  return searchResults;
}

/** Загрузка дополнительных данных для больших экранов */
async function loadingForLargeScreensRecursively() {
  if(window.innerHeight >= document.body.offsetHeight) {
    let passengersDataToAdd = await getPassengersData(tbody.children.length, 10);
      
    if(passengersDataToAdd.length > 0) {
      renderPassengersData(
        passengersDataToAdd,
        thNameArray, 
        tbody,
        true
      );
      
      loadingForLargeScreensRecursively();
    }
  }
}