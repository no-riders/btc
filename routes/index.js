const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DATA_FILEPATH = path.join(__dirname, '../data/data.json');
const url = 'https://www.bitstamp.net/api/ticker/';

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILEPATH, "utf-8"));
  }
  
  function saveData(data) {
    fs.writeFileSync(DATA_FILEPATH, JSON.stringify(data, null, 2));
  }


app.get('/',(req, res) => {
    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            if (!data) {
                return null;
              }
              const collection = [...getData()];
              collection.push(data)
              saveData(collection)
        } catch(error) {
            console.log(error);
        }
    }
setInterval(getRate.bind(null, url), 10*1000);
getRate(url)
})

app.get('/ticker', (req, res) => {
    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            res.json({
                currentBTCtoUSD: data
            })
        } catch(error) {
            console.log(error);
        }
    }
    getRate(url);
})

app.get('/ticker5min', (req, res) => {

})



module.exports = app;
