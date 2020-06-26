const express = require('express'),
      path = require('path'),
      fs = require("fs");

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/html/index.html`);
});

app.post('/getPassengersData',  (req, res) => {
  if(req.body.startPosition !== undefined &&
    req.body.numberOfRecords) {
    fs.readFile('passengers.json', "utf-8", (err, passengers) => {
      if(err) {
        res.sendStatus(500);
        throw err;
      } else {
        // Затратно конечно каждый раз парсить, но это же тестовое
        passengers = JSON.parse(passengers);
        
        if(parseInt(req.body.startPosition) + parseInt(req.body.numberOfRecords) <= passengers.length)
          res.send(passengers
            .slice(req.body.startPosition, 
              parseInt(req.body.startPosition) + parseInt(req.body.numberOfRecords) 
            )
          );
        else
          res.send([]);
      }
    });
  } else {
    res.sendStatus(400);
  }
});

app.listen(3000);