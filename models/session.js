//import express session
const session = require('express-session');

//import connect mongodb session to save users sessions
const mongoDBSession = require('connect-mongodb-session')(session);


const newSession = (app, connectionPath) => {
    const store = new mongoDBSession({
        uri: connectionPath,
        collection: 'sessions'
    });

    app.use(
        session({
            secret: '2024 CS graduates',
            resave: false,
            saveUninitialized: false,
            store: store,
            cookie: {maxAge: 60000 * 15}
        })
  );
  return app;
};

// check authentication
const Authenticated = (req, res, next) => {
  if (req.session.Authenticated) {
    next();
  } 
  //if not authenticated return the user to the login page
  else {
    res.redirect('/login');
  }
};

//export so it can be used in other files
module.exports = {newSession, Authenticated};