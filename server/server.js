// server.js
// where your node app starts

// init project
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var app = express();
app.use(cookieParser())
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
  if (err) {
    console.log('Error')
    console.error(err)
  }
  if (stats.errors) {
    stats.errors.forEach(e => console.error(e))
  }
});


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
  return fs.readFileSync(dbFile).toString('utf8').split('\n').map(line => JSON.parse(line));
}

const saveQuotes = quotes => {
  if (!quotes) {
    return false
  }
  fs.writeFileSync(dbFile,
    quotes.map(quote => JSON.stringify(quote)).join('\n')
  );
}

const checkAdmin = (req, res, next) => {
  if (req.get('Authentication') === 'Bearer ' + process.env.ADMIN) {
    next()
  } else {
    res.status(401).send('Invalid authentication');
  }
}


const attrs = 'id, year, date'.split(', ');

const checkQuote = quote => {
  if (!quote) {
    console.log('falsy')
    return false;
  }
  if(!quote.id) return false
  if (!quote.year || isNaN(quote.year)) return false
  if (quote.date && isNaN(+quote.date)) return false
  if (quote.description) {
    if (!quote.description.text) return false
    if (!Array.isArray(quote.description.subjects) || quote.description.subjects.some(s => typeof s !== 'string')) return false
    if (quote.quote) {
      console.log('quote and description')
      return false
    }
  } else if (quote.quote) {
    if(typeof quote.quote.context !== 'string') {
      return false
    }
    if (!Array.isArray(quote.quote.dialog) || quote.quote.dialog.length < 1 || quote.quote.dialog.some(item => {
      if (!item.text || typeof item.text !== 'string') return true
      if (!item.speaker || typeof item.speaker !== 'string') return true
    })) {
      return false
    }
  } else {
    console.log('neither')
    return false
  }
  return true
};

const checkAuth = (req, res, next) => {
  if (req.cookies.auth === process.env.SECRET) return next()
  if (req.get('Authentication') === 'Bearer ' + process.env.SECRET ||
     req.get('Authentication') === 'Bearer ' + process.env.ADMIN) {
    next()
  } else {
    res.status(401).send('Invalid authentication');
  }
}

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.get('/check', checkAuth, function(request, response) {
  response.cookie('auth', process.env.SECRET, { expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), httpOnly: true });
  response.status(204).send();
});

app.post('/quote/:id', checkAdmin, (req, res) => {
  let data = loadQuotes();
  if (!checkQuote(req.body)) {
    return res.status(400).send("invalid quote body");
  }
  if (req.body.id !== req.params.id) {
    return res.status(400).send("Ids dont match");
  }
  const index = data.findIndex(quote => quote.id === req.params.id)
  if (index === -1) {
    return res.status(400).send("unknown id");
  }
  data[index] = req.body
  res.status(204).send();
  maybeBackup();
  saveQuotes(data);
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

app.use(checkAuth, express.static('private'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
