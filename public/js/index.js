let passengersData = [];

let searching = false; // Осуществляется ли поиск в данный момент

const searchInput = document.getElementsByClassName('search__input')[0];

const tbody = document.getElementsByTagName('tbody')[0];

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
  const initialPassengers = await getPassengersData(0, 30) || [];

  renderPassengersData(initialPassengers, thNameArray, tbody, true);
})();

// Когда пользователь доскроллил до конца таблицы подгружаем ещё данные
window.addEventListener("scroll", async () => {
  let windowScrolling = false;

  if ( (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight &&
    windowScrolling === false &&
    searching === false) {
      
    windowScrolling = true;
    let passengersDataToAdd = await getPassengersData(document.getElementsByClassName('passengers-table__body')[0].children.length, 50)
    
    renderPassengersData(
      passengersDataToAdd,
      thNameArray, 
      tbody,
      true
    );

    windowScrolling = false;
  }
});

document.getElementsByClassName('search__icon')[0].addEventListener('click', function() {
  search(searchInput.value);
});

/** Создание и заполнение записей о пассажирах и добавление их в таблицу
 * Параметры:
 * data - данные пассажиров в виде массива
 * thNameArray - заголовки для ячеек таблицы
 * parentElement - куда будут добавляться сформированные записи
 * addToPassengersArray - добавлять ли эти данные в массив с пассажирами
 */
function renderPassengersData(data = [], thNameArray, tbody, addToPassengersArray) {
  for (let i = 0; i < data.length; i++) {
    let tr = document.createElement('tr');

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

/** Поиск записей из таблицы
 * Параметры:
 * value - искомое значение
 */
function search(value) {
  if( value.length > 0 ) {
    let arrayOfMatches = [];
    for (let i = 0; i < passengersData.length; i++) {
      Object.keys(passengersData[i]).map(key => {
        if(`${passengersData[i][key]}`.indexOf(value.trim()) > -1) {
          if(itemExists(arrayOfMatches, passengersData[i]) === false) {
            console.log(itemExists(arrayOfMatches, passengersData[i]));
            arrayOfMatches.push(passengersData[i]);
          }
        }
      });
    }

    tbody.innerHTML = '';

    searching = true;

    renderPassengersData(arrayOfMatches, thNameArray, tbody);

  } else {
    if( tbody.children.length < passengersData.length ) {
      tbody.innerHTML = '';
      renderPassengersData( passengersData, thNameArray, tbody, false, true );
    }

    searching = false;
  }
}

function itemExists(arrayOfMatches, duplicate) {
  for (let i = 0; i < arrayOfMatches.length; i++) {
    if( JSON.stringify(arrayOfMatches[i]) === JSON.stringify(duplicate) ) {
      return true;
    }
  }

  return false;
}