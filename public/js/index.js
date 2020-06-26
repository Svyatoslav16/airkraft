(async function() {
  const body = document.getElementsByTagName('body')[0];

  // Динамическое формирование таблицы. 
  const table = document.createElement('table');
    table.className = 'passengers-table';

  const caption = document.createElement('caption');
    caption.className = 'passengers-table__caption';
    caption.innerText = 'Пассажиры Титаника'

  const thead = document.createElement('thead');
    thead.className = 'passengers-table__head';

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
      thLabel: 'sibsp',
      passengerPropertyName: 'Sibsp'
    },
    {
      thLabel: 'parch',
      passengerPropertyName: 'Parch'
    },
    {
      thLabel: 'ticket',
      passengerPropertyName: 'Билет'
    },
    {
      thLabel: 'fare',
      passengerPropertyName: 'Плата за проезд'
    },
    {
      thLabel: 'cabin',
      passengerPropertyName: 'Каюта'
    },
    {
      thLabel: 'embarked',
      passengerPropertyName: 'Embarked'
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

  const theadTr = document.createElement('tr');

  for(let i = 0; i < thNameArray.length; i++) {
    let th = document.createElement('th');
      th.dataset.label = thNameArray[i].thLabel;
      th.innerText = thNameArray[i].passengerPropertyName;

    theadTr.append(th);
  }

  thead.append(theadTr);

  const tbody = document.createElement('tbody');
    tbody.className = 'passengers-table__body';

  // Начальные данные для таблицы
  const initialPassengers = await getPassengersData(0, 100) || [];

  // console.log(initialPassengers);

  renderPassengersData(initialPassengers, thNameArray, tbody);

  table.append(caption);
  table.append(thead);
  table.append(tbody);

  body.append(table);

  let windowScrolling = false;

  // Когда пользователь доскроллил до конца таблицы подгружаем ещё данные
  window.addEventListener("scroll", () => {
    setTimeout(async () => {
      if ( (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight &&
        windowScrolling === false) {
          
        windowScrolling = true;
        let passengersData = await getPassengersData(document.getElementsByClassName('passengers-table__body')[0].children.length, 200);
        renderPassengersData(
          passengersData,
          thNameArray, 
          tbody
        );

        windowScrolling = false;
      }
    }, 1000);
  });
})();

/** Создание и заполнение записей о пассажирах и добавление их в таблицу
 * Параметры:
 * data - данные пассажиров в виде массива
 * thNameArray - заголовки для ячеек таблицы
 * parentElement - куда будут добавляться сформированные записи
 */
function renderPassengersData(data = [], thNameArray, tbody) {
  for (let i = 0; i < data.length; i++) {
    let tr = document.createElement('tr');

    for (let j = 0; j < thNameArray.length; j++) {
      let td = document.createElement('td');
        td.innerText = data[i][thNameArray[j].thLabel];
      tr.append(td);
    }

    tbody.append(tr);
  }
}

/** Получение данных с сервера о пассажирах 
 * Параметры:
 * startPosition - позиция, с которой будет начинаться поиск в массиве данных
 * numberOfRecords - количество необходимых записей
*/
async function getPassengersData(startPosition = 0, numberOfRecords = 10) {
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