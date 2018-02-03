const express = require('express');
const app = express();

const index = require('./routes/index');


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

const PORT = process.env.PORT || 3001;

app.use('/', index);
//app.use('/ticker', ticker)


// catch wrong route error
app.use((req, res, next) => {
    const error = new Error('Wrong page. Not found');
    error.status = 404;
    next(error);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));