const express = require('express'),
      path = require('path'),
      fs = require("fs");

const app = express();

let passengersData = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

(async function () {
  fs.readFile('passengers.json', "utf-8", (err, passengers) => {
    if(err) {
      throw err;
    } else {
      passengersData = JSON.parse(passengers);
    }
  });
})(); 

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/html/index.html`);
});

app.post('/getPassengersData',  (req, res) => {
  if(req.body.startPosition !== undefined &&
    req.body.numberOfRecords) {
    if(+req.body.startPosition + +req.body.numberOfRecords <= passengersData.length) {
      if(!req.body.isSearch) {
        res.send(passengersData
          .slice(req.body.startPosition, 
            +req.body.startPosition + +req.body.numberOfRecords
          )
        );
      } else if(req.body.isSearch) {
        if(req.body.value) {
          let arrayOfMatches = [];

          // Срез данных пассажиров, начиная с заданой позиции
          let passengersDataSlice = passengersData.slice(+req.body.startPosition);

          for (let i = 0; i < passengersDataSlice.length; i++) {
            if(arrayOfMatches.length < +req.body.numberOfRecords)
              Object.keys(passengersDataSlice[i]).map(key => {
                if(`${passengersDataSlice[i][key]}`.indexOf(req.body.value.trim()) > -1) {
                  if(itemExists(arrayOfMatches, passengersDataSlice[i]) === false) {
                    arrayOfMatches.push(passengersDataSlice[i]);
                  }
                }
              });
          }
          res.send(arrayOfMatches);
        } else {
          res.send([]);
        }
      }
    } else
      res.send([]);
  } else {
    res.sendStatus(400);
  }
});

function itemExists(arrayOfMatches, duplicate) {
  for (let i = 0; i < arrayOfMatches.length; i++) {
    if( JSON.stringify(arrayOfMatches[i]) === JSON.stringify(duplicate) ) {
      return true;
    }
  }

  return false;
}

app.listen(3000);