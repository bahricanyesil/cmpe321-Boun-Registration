import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import routes from './../api/routes/index.js';
import { prefix, secretSessionKey } from './../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (app) => {
  process.on('uncaughtException', async (error) => {
    console.log(error);
  });

  process.on('unhandledRejection', async (ex) => {
    console.log(ex);
  });

  app.enable('trust proxy');
  app.use(cors());
  app.use(session({
    secret: secretSessionKey,
    resave: false,
    saveUninitialized: true
  }));
  app.set('port', process.env.PORT || 3000);
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '../views'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(morgan('dev'));
  app.use(helmet());
  app.use(compression());
  app.use(express.static(path.join(__dirname, '../static')));
  app.disable('x-powered-by');
  app.disable('etag');


  app.use(function (req, res, next) {
    res.locals.students = req.session.students;
    next();
  });

  app.use(prefix, routes);

  app.get('/', (_req, res) => {
    // res.render('pages/db-manager/student_home', { type: "student" });
    res.render('pages/login/login', { type: "student" });
  });

  app.get('/student/login', (_req, res) => {
    res.render('pages/login/login', { type: "student" });
  });

  app.get('/instructor/login', (_req, res) => {
    res.render('pages/login/login', { type: "instructor", username: _req.username });
  });

  app.get('/dbManager/login', (_req, res) => {
    res.render('pages/login/login', { type: "dbManager" });
  });

  app.get('/dbManager/update-instructor', (_req, res) => {
    res.render('pages/db-manager/update_instructor', { username: _req.query.username });
  });

  app.get('/dbManager/student/add', (_req, res) => {
    res.render('pages/db-manager/add_student', { username: _req.query.username });
  });

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Content-Security-Policy-Report-Only', 'default-src: https:');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT POST PATCH DELETE GET');
      return res.status(200).json({});
    }
    next();
  });

  app.use((_req, _res, next) => {
    const error = new Error('Endpoint could not find!');
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, _next) => {
    res.status(error.status || 500);
    let level = 'External Error';
    if (error.status === 500) {
      level = 'Server Error';
    } else if (error.status === 404) {
      level = 'Client Error';
    }
    return res.json({
      resultMessage: error.message,
    });
  });
}