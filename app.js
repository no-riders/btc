const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');


app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


//handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, PUT, DELETE');
        return res.status(200).json({});
    }
    next();
});

const PORT = process.env.PORT || 3000;

app.get('/',(req, res) => {
    const url = 'https://www.bitstamp.net/api/ticker/';
    const getRate = async url => {
        try {
            const response = await axios.get(url);
            const data = response.data;
            res.send(data)
        } catch(error) {
            console.log(error);
        }
    }
getRate(url)

    //res.send('Hello Express!')
}) 


// catch wrong route error
app.use((req, res, next) => {
    const error = new Error('Wrong page. Not found');
    error.status = 404;
    next(error);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));