const path = require('path');

require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const logger = require('morgan');
const passport = require('passport');
const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

const {
  deserializeUser,
  serializeUser,
  PassportLocalStrategy
} = require('./src/repositories/auth');

passport.use(PassportLocalStrategy);
passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

const app = express();
const redisClient = redis.createClient();

app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(flash());
app.use(helmet());
app.use(logger('dev'));
app.use(
  session({
    cookie: { maxAge: 1209600000 },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SECRET,
    store: new RedisStore({ client: redisClient })
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(require('./src/middlewares/base'));

// Routes
app.use(require('./src/routes/home'));
app.use(require('./src/routes/auth'));

// 404 Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    error: process.env.NODE_ENV === 'development' ? err : {},
    message: err.message
  });
});

module.exports = app;
