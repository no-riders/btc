const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const DATA_FILEPATH = path.join(__dirname, '../data/data.json');
const url = 'https://www.bitstamp.net/api/ticker/';
const url2 = 'https://www.bitstamp.net/api/v2/ticker/ethusd';

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

function getItemByTime(collection, time) {
    let correctedTime = time - 300;
    return collection.find((item) => {
        return item.timestamp >= correctedTime && item.timestamp <= time
    });
}


app.get('/',(req, res) => {
    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const response2 = await axios.get(url2);

            const data = response.data;
            const data2 = response2.data;

            let obj = {};
            if (!data) {
                return null;
              }
              obj.bitcoin = {
                  current_rate: data.last,
                  timestamp: data.timestamp
              }
            obj.ethereum = {
                current_rate: data2.last,
                timestamp: data2.timestamp
            }
              const collection = [...getData()];
              collection.push(obj)
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
            const response2 = await axios.get(url2);
            const data = response.data;
            const data2 = response2.data;
            res.json({
                bitcoin: {
                    current_rate: data.last
                },
                ethereum: {
                    current_rate: data2.last
                }
            })
            res.end()
        } catch(error) {
            console.log(error);
        }
    }
    getRate(url);
})

app.get('/ticker5min', (req, res) => {
    let dateNow = Date.now().toString().slice(0, -3);
    const collection = [...getData()];
    const last5mins = getItemByTime(collection, dateNow);

    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            let objToRender = {};
            objToRender.current_rate = data.last;
            objToRender.rate_5min = last5mins.current_rate;
            res.json(objToRender)
            res.end()
        } catch(error) {
            console.log(error);
        }
    }
    getRate(url)
})



module.exports = app;
