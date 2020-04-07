const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');

const apiRouter = require('./api/api');

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', apiRouter);
app.use(morgan('dev'));
app.use(errorhandler());

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;