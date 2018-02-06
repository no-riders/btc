const express = require('express');
const app = express();
const morgan = require('morgan');



const index = require('./routes/index');

const PORT = process.env.PORT || 3001;

//logger
app.use(morgan('tiny'));

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

app.set('view engine', 'ejs')

app.use('/', index);
//app.use('/ticker', ticker)


// catch wrong route error
app.use((req, res, next) => {
    const error = new Error('Wrong page. Not found');
    error.status = 404;
    next(error);
})

app.listen(PORT, () => console.log(`Listening on ${PORT}`));