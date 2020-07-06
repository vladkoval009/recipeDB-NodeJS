module.exports = function(app)
{

 const { check, validationResult } = require('express-validator'); //validation



 const redirectLogin = (req, res, next) => {

   if (!req.session.userId ) {
     res.redirect('./login')
   } else { next (); }
   }
//=================================================================================================


app.post('/loggedin', function (req, res) {

            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';

            MongoClient.connect(url, function (err, client) {
                if (err) throw err;
                var db = client.db('recipebankdatabase');

                const bcrypt = require('bcrypt');
                const plainPassword = req.body.password;
                console.log(req.body.username);                                                                      
                let users = db.collection('users');
                users.findOne({ "username": req.body.username}, function (err, result) {
                    if (err) throw err;
                   console.log(result);

                    if (result) {
                        var hashedPassword = result.password;
                        bcrypt.compare(plainPassword, hashedPassword, function (err, result) {
                            if (result == true) {

                                 req.session.userId = req.body.username;

                                res.send("Welcome. You are logged in username is " + req.body.username + "." + '<br />'+'<a href='+'./'+'>Home</a>' );
                                console.log(req.session.userId);

                            } else
                                {
                                res.send("Password is incrorrect!");                                 }
                        });
                    }
                        else
                        {
                        res.send("This username is not found.")
                        }
                    client.close();
                });
            });
        });

//=================================================================================================


// Logging out from the session

app.get('/logout', redirectLogin, (req,res) => {
     req.session.destroy(err => {
     if (err) {
       return res.redirect('./')
     }
     res.send('you are now logged out. <a href='+'./'+'>Home</a>');
     })
     })




//=================================================================================================

      app.post('/search-result', function(req, res) {
      var MongoClient = require('mongodb').MongoClient;
      var url = 'mongodb://localhost';
      MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      var db = client.db('recipebankdatabase');

      db.collection('recipes').find({ name: req.body.keyword }).toArray((findErr, results) => {                                                                                                                                        
      if (findErr) throw findErr;
      else
       res.render('results.ejs', {availablerecipes:results});


      client.close();                                                                                              
         });
      });
   });

//=====================================================================================

 app.post('/registered',[check('email').isEmail()], function (req,res) {
       // saving data in database
       //bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';

         const bcrypt = require('bcrypt');
         const saltRounds = 10;
         const plainPassword = req.sanitize(req.body.password);
         const errors = validationResult(req);

        if (!errors.isEmpty()) {

        res.redirect('./register');

        } else {

        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {

       // Store hashed password in your database.

       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebankdatabase');

        console.log(req.body);

        db.collection('users').insertOne({

       username: req.body.username,
       password: hashedPassword


        });
        client.close();
       // res.render('registered.ejs',{users:username});                                                                            
          res.send('You are now registered, Your user name is: '+ req.body.username + ' your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword + '<br />'+'<a href='+'./'+'>Home</a>');
           });
       });
        } // validation result closing!
    });

//=====================================================================================

app.post('/deletedrecipe',redirectLogin, function (req,res) {

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost';

MongoClient.connect(url, function(err, client) {
if (err) throw err;
var db = client.db ('recipebankdatabase');
db.collection('recipes').deleteOne({
name: req.body.name 
});
client.close(); 
res.send(' recipe deleted from the database, name: '+ req.body.name);
});
});


//=====================================================================================

app.post('/updatedrecipe',redirectLogin, function (req,res) {
              
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';
	
       MongoClient.connect(url, function(err, client) {
if (err) throw err;
var db = client.db ('recipebankdatabase');
var newvalue = { $set: {content: req.body.content } };

db.collection('recipes').updateOne({name: req.body.name}, newvalue );

client.close();
res.send(' recipe updated  from the database, name: '+ req.body.name);
});
});


//=====================================================================================

app.get('/list', function(req, res) {
      var MongoClient = require('mongodb').MongoClient;
      var url = 'mongodb://localhost';
      MongoClient.connect(url, function (err, client) {
      if (err) throw err;
      var db = client.db('recipebankdatabase');
      db.collection('recipes').find().toArray((findErr, results) => {
      if (findErr) throw findErr;
      else
         res.render('list.ejs', {availablerecipes:results});
      client.close();
  });
});
});	

//=====================================================================================

app.post('/recipeadded',redirectLogin, function (req,res) {
       // saving data in database
       var MongoClient = require('mongodb').MongoClient;
       var url = 'mongodb://localhost';
                                                                                                              
       MongoClient.connect(url, function(err, client) {
        if (err) throw err;
        var db = client.db ('recipebankdatabase');  
        db.collection('recipes').insertOne({
        name: req.body.name,
	content: req.body.content,
	author: req.body.author

        });
        client.close();
        res.send(' This recipe is added to the database, name: '+ req.body.name + ' This is the recipe '+ req.body.content + ' Create by ' + req.body.author);
        });
       });

//=====================================================================================

app.get('/api', function (req,res) {
     var MongoClient = require('mongodb').MongoClient;
     var url = 'mongodb://localhost';
     MongoClient.connect(url, function (err, client) {
     if (err) throw err                                                                     
     var db = client.db('recipebankdatabase');                                                                                                                                               
      db.collection('recipes').find().toArray((findErr, results) => {                                                                                                                    
      if (findErr) throw findErr;
      else

      res.json(results);                                                                 
      client.close();                                                                       
         });
       });
    });


//=====================================================================================

app.get('/', function(req,res){
        res.render('home.html')
      });

app.get('/register', function(req,res){
        res.render('register.html')
     });

app.get('/login',  function(req,res){
        res.render('login.html')
     });

app.get('/search', function(req,res){
        res.render('search.html')
     });

app.get('/addrecipe',redirectLogin, function (req,res) {
         res.render('addrecipe.html');
      });

app.get('/updaterecipe',redirectLogin, function (req,res) {
	res.render('updaterecipe.html');
      });

app.get('/deleterecipe',redirectLogin, function (req,res) {
	res.render('deleterecipe.html');
      });


};
