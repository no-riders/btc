const fs = require("fs"),
    path = require("path");

const USERS_FILEPATH = path.join(__dirname, "../data/users.json"),
    DATA_FILEPATH = path.join(__dirname, "../data/data.json"),
    url = "https://www.bitstamp.net/api/ticker/",
    url2 = "https://www.bitstamp.net/api/v2/ticker/ethusd";



function getData(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getItemByTime(collection, time) {
  let correctedTime = time - 500;
  return collection.find(item => {
    return item["bitcoin"].timestamp >= correctedTime && item.timestamp <= time;
  });
}

module.exports = {
  saveData,
  getData,
  getItemByTime,
  USERS_FILEPATH,
  DATA_FILEPATH,
  url,
  url2
};
