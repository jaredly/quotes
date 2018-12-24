// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const webpack = require("webpack");

const compiler = webpack(require('./webpack.config.js'));

const watching = compiler.watch({
  // Example watchOptions
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  // Print watch/build result here...
  // console.log(stats);
  console.log('Rebuild')
  if (stats.errors) {
    stats.errors.forEach(e => console.error(e))
  }
});


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// init sqlite db
var fs = require('fs');
var dbFile = './.data/quotes.json';

const lastWeek = () => {
  const date = new Date()
  const startOfWeek = date.getTime() - (date.getDay() * 24 * 60 * 60 * 1000);
  date.setTime(startOfWeek);
  return date;
}

const maybeBackup = () => {
  if (!fs.existsSync(dbFile)) return;
  const date = lastWeek();
  const backupFilename = `.data/${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.json`
  if (!fs.existsSync(backupFilename)) {
    fs.writeFileSync(backupFilename, fs.readFileSync(dbFile))
  }
}

const loadQuotes = () => {
  if (!fs.existsSync(dbFile)) {
    return []
  }
  return JSON.parse(fs.readFileSync(dbFile).toString('utf8'));
}

const saveQuotes = quotes => {
  if (!quotes) {
    return false
  }
  fs.writeFileSync(dbFile, JSON.stringify(quotes));
}

const checkAdmin = (req, res, next) => {
  if (req.get('Authentication') === 'Bearer ' + process.env.ADMIN) {
    next()
  } else {
    res.status(401).send('Invalid authentication');
  }
}


const attrs = 'id, speaker, context, quote, secondSpeaker, response, year, date'.split(', ');

const checkQuote = quote => {
  if (!quote) {
    console.log('falsy')
    return false;
  }
  return attrs.every(attr => {
    if (attr === 'year' || attr === 'date') {
      if (quote[attr] && isNaN(+quote[attr])) {
        console.log('Not a number', attr, quote[attr])
        return false
      }
      return true
    }
    if( typeof quote[attr] === 'string') {
      return true;
    }
    console.log('Not a string', attr, quote[attr])
    return false
  });
};

const checkAuth = (req, res, next) => {
  if (req.get('Authentication') === 'Bearer ' + process.env.SECRET ||
     req.get('Authentication') === 'Bearer ' + process.env.ADMIN) {
    next()
  } else {
    res.status(401).send('Invalid authentication');
  }
}

app.get('/check', checkAuth, function(request, response) {
  response.status(204).send();
});

app.post('/quotes/bulk', checkAdmin, (req, res) => {
  let data = loadQuotes();
  if (!Array.isArray(req.body) || !req.body.every(checkQuote)) {
    return res.status(400).send("invalid quote bodies");
  }
  data = data.concat(req.body);
  res.status(204).send();
  maybeBackup();
  saveQuotes(data);
});

app.get('/quotes', checkAuth, function(request, response) {
  const data = loadQuotes()
  
  response.send(JSON.stringify(data));
});

app.put('/quotes', checkAuth, function(req, res) {
  const quote = req.body;
  if (!checkQuote(quote)) {
    return res.status(400).send("invalid quote body");
  }
  const quotes = loadQuotes();
  quotes.push(quote);
  res.status(204).send();
  maybeBackup();
  saveQuotes(quotes);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

