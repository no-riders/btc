const fs = require("fs"),
    path = require("path"),
    bcrypt = require('bcryptjs'),
    flash = require('connect-flash');

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

const getRate = async (url, url2, param3) => {
  try {
    const result = await Promise.all([axios.get(url), axios.get(url2)]);

    const data = result[0].data,
        data2 = result[1].data;

if (param3 === 'loop') {
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
      const collection = [...helper.getData(helper.DATA_FILEPATH)];
      collection.push(obj)
      helper.saveData(helper.DATA_FILEPATH, collection)
}

    return {
        data,
        data2
    }
} catch(error) {
    throw new Error
  }
}

function bcryptPass (newUser, req, res) {
  return bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
        if(err) {
            console.log(err)
        }
        newUser.password = hash;
        const collection = [...helper.getData(helper.USERS_FILEPATH)]
        collection.push(newUser)
        helper.saveData(helper.USERS_FILEPATH, collection)
        req.flash('success', 'Successfully registered, please log in')
        res.redirect('/login');
    })
})
}



module.exports = {
  saveData,
  getData,
  getItemByTime,
  getRate,
  bcryptPass,
  USERS_FILEPATH,
  DATA_FILEPATH,
  url,
  url2
};
