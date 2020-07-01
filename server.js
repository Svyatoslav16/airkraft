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
    if(parseInt(req.body.startPosition) + parseInt(req.body.numberOfRecords) <= passengersData.length)
      res.send(passengersData
        .slice(req.body.startPosition, 
          parseInt(req.body.startPosition) + parseInt(req.body.numberOfRecords) 
        )
      );
    else
      res.send([]);
  } else {
    res.sendStatus(400);
  }
});

app.post('/passengersByMatch', (req, res) => {
  if(req.body.value) {
    let arrayOfMatches = [];
    for (let i = 0; i < passengersData.length; i++) {
      Object.keys(passengersData[i]).map(key => {
        if(`${passengersData[i][key]}`.indexOf(req.body.value.trim()) > -1) {
          if(itemExists(arrayOfMatches, passengersData[i]) === false) {
            arrayOfMatches.push(passengersData[i]);
          }
        }
      });
    }

    res.send(arrayOfMatches);
  } else {
    res.send([]);
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