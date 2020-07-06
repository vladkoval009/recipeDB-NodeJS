var express = require('express')
var bodyParser = require('body-parser')
var session = require ('express-session')
var validator = require('express-validator')
const expressSanitizer = require('express-sanitizer');
const app = express()
const port = 8000


var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost/recipebankdatabase";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});

///added for session management
app.use(session({
    secret: 'somerandomstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


app.use(expressSanitizer());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
// new code added to your Express web server
require('./routes/main')(app);
app.set('views',__dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
//////////////
app.listen(port, () => console.log(`Example app listening on port ${port}!`))


