const express = require('express');
const chalk = require('chalk');
const initDatabase = require('./db-init')

const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

process.env.API_URL = process.env.API_URL || 'http://localhost:4000/';
process.env.MONGO_ATLAS_PW = '7MZ5oRy4e0YWG4v0';
process.env.JWT_KEY = 'secret';
process.env.DELAY = 0; // miliseconds
process.env.TIMEOUT = 15000; // miliseconds
process.env.LAST_UPDATE_TIMER = 0; // seconds
process.env.DEV = 'production';

console.log('iot-api up at: ', process.env.API_URL)

// Routes
const displaysRoutes = require('./api/routes/displays');
const imagesRoutes = require('./api/routes/images');
const groupsRoutes = require('./api/routes/groups');
const screensRoutes = require('./api/routes/screens');
const locationsRoutes = require('./api/routes/locations');
const usersRoutes = require('./api/routes/users');
const gatewaysRoutes = require('./api/routes/gateways');
const devicesRoutes = require('./api/routes/devices');
const updateRoutes = require('./api/routes/update');
const userGroupsRoutes = require('./api/routes/userGroup');
const EventRoutes = require('./api/routes/event');
const FactRoutes = require('./api/routes/fact');

// Services
const EngineService = require('./api/services/engine.service');
const EventService = require('./api/services/event.service');
const SensorService = require('./api/services/sensor.service');
const ScreenService = require('./api/services/screen.service');

// Sensors
const SensorCO2 = require('./api/sensors/sensor-co2');
const SensorPeople = require('./api/sensors/sensor-people');

// Database setup
const MONGO_ENV = process.env.MONGO_ENV || null;
const MONGO_USER = process.env.MONGO_USER || 'administrador';
const MONGO_PW = process.env.MONGO_PW || '7MZ5oRy4e0YWG4v0';
const MONGO_HOST = process.env.MONGO_HOST || 'iot-api-prod-shard-00-00-kjtyd.mongodb.net:27017,iot-api-prod-shard-00-01-kjtyd.mongodb.net:27017,iot-api-prod-shard-00-02-kjtyd.mongodb.net:27017/test?ssl=true&replicaSet=iot-api-prod-shard-0&authSource=admin&retryWrites=true';

mongoose.set('useCreateIndex', true);
mongoose.set('findAndModify', false);

const connect = setInterval(() => {
  if (MONGO_ENV === 'atlas') {
    mongoose.connect(`mongodb://${MONGO_USER}:${MONGO_PW}@${MONGO_HOST}`, {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
    }).then(() => {
      console.log('Connected to cloud database on mongoDB atlas');
      initDatabase();
      clearInterval(connect);
    }).catch(() => {
      console.log('Attempting to connect...');
    });
  } else {
    mongoose.connect('mongodb://iot-db:27017/application', {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      reconnectInterval: 500, // Reconnect every 500ms
    }).then(() => {
      console.log('Conected to local database on iot-db container');
      initDatabase();
      clearInterval(connect);
    }).catch(() => {
      console.log('Attempting to connect...');
    });
  }
}, 2000);

app.use(morgan('dev')); // logger
app.use('/img', express.static('img'));
app.use(bodyParser.urlencoded({ extended: true })); // body parser
app.use(bodyParser.json());
// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200)
      .json({});
  }
  return next();
});
// Init Events Processors
// var initProcessors = new initRuleProcessors();

// Initialize sensors
const sensorC02 = new SensorCO2(10000);
const sensorPeople = new SensorPeople(10000);
// Initialize services
const engineService = new EngineService();
const eventService = new EventService(engineService);
const sensorService = new SensorService(engineService, [sensorC02, sensorPeople]);
const screenService = new ScreenService(eventService, [sensorC02, sensorPeople]);

console.log('Services running...');
// Routes which should handle requests
app.use('/displays', displaysRoutes);
app.use('/images', imagesRoutes);
app.use('/groups', groupsRoutes);
app.use('/screens', screensRoutes);
app.use('/locations', locationsRoutes);
app.use('/users', usersRoutes);
app.use('/gateways', gatewaysRoutes);
app.use('/devices', devicesRoutes);
app.use('/userGroups', userGroupsRoutes);
app.use('/update', updateRoutes);
app.use('/events', new EventRoutes(eventService).routes);
app.use('/facts', new FactRoutes([sensorC02, sensorPeople]).routes);

console.log('Routes running...');

// Error handling
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});
// setTimeout(function(){
//   initProcessors.initTimeProcessor();
// },4000)

module.exports = app;
