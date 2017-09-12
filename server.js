const routes = require('./api/routes/yt-reporting');
const compression = require('compression');
const helmet = require('helmet');
const express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
app.use(helmet());
app.use(compression());
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

 //importing route
routes(app); //register the route

app.listen(port);

console.log('BOLD youtube RESTish API server started on: ' + port);
