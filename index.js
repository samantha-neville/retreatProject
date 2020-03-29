const express  = require('express')
const path     = require('path')
const PORT     = process.env.PORT || 5000
var router     = express.Router();
var pg         = require('pg');
module.exports = router;

//database connection stuff
const { Pool } = require('pg')
const connectionString = process.env.DATABASE_URL || "postgres://zbysucmtpsrwvw:0ff68dab033be013e3f2d3b2aaa6939b8bad8b63015892293d1176b827c32da8@ec2-3-224-165-85.compute-1.amazonaws.com:5432/d11jjk2h0d7bcm?ssl=true";
const pool = new Pool({connectionString: connectionString});


express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  // .use(session({secret: 'chickienuggies', resave: true, saveUninitialized: true}))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/displaySearch', function(req, res) { displaySearchResults(res,req); })
  .get('/displayAll',    function(req, res) { displayAllRetreats(res,req);   })
  .get('/signIn',        function(req, res) { signIn(res,req);               })
  .get('/signUp',        function(req, res) { signUp(res,req);               })
  .post('/login',  handleLogin)
  .post('/signUp', handleSignup)


  .listen(PORT, () => console.log(`Listening on ${ PORT }`))



/****************************************************************
 * DISPLAY SEARCH RESULTS
 ****************************************************************/
function displaySearchResults(res, req) {
    var type       = req.query.type;
    var start_date = req.query.start_date;
    var end_date   = req.query.end_date;
    console.log(type, start_date, end_date);
    if (start_date == '' || end_date == '') {
        var sql = "SELECT * FROM retreats WHERE type=" + "'" + type + "'";
    }
    else {
        var sql = "SELECT * FROM retreats WHERE type="  + "'" + type + "'" +  "AND start_date >="  + "'" + start_date + "'" +  "AND start_date <="  + "'" + end_date + "'" +  "AND end_date >="  + "'" +  start_date  + "'" + "AND end_date <=" + "'" +  end_date + "'";
    }
    //a simple get query from the database
    pool.query(sql, function(err, result) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        }

        var jsonRetreats = JSON.stringify(result.rows);
        const params = {jsonRetreats: jsonRetreats};
        res.render('pages/displaySearch', params);
      });

}


/****************************************************************
 * DISPLAY ALL RETREATS
 ****************************************************************/
function displayAllRetreats(res, req) {

  var sql = "SELECT * FROM retreats";
  //a simple get query from the database
  pool.query(sql, function(err, result) {
      // If an error occurred...
      if (err) {
          console.log("Error in query: ")
          console.log(err);
      }

      // Log this to the console for debugging purposes.
      console.log("Back from DB with result:");
      console.log(result.rows);
      var jsonRetreats = JSON.stringify(result.rows);
      // Set up a JSON object of the values we want to pass along to the EJS result page
      const params = {jsonRetreats: jsonRetreats};
      res.render('pages/displayAll', params);


  }); 
}

/****************************************************************
 * SIGN UP
 ****************************************************************/
function signUp(res, req) {
  var first_name = req.query.first;
  var last_name  = req.query.last;
  var email      = req.query.email;
  var password   = req.query.password;
  console.log(first_name, last_name, email, password);
}

/****************************************************************
 * SIGN IN
 ****************************************************************/
function signIn(res, req) {
  var email    = req.query.email;
  var password = req.query.password;
  console.log(email, password);

  //query the database to see if this person exists in it
  var sql = "SELECT id, password FROM users WHERE email='"+email+"'";
  pool.query(sql, function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ")
        console.log(err);
    }

    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows);
    var jsonUser = JSON.stringify(result.rows);
    var user = JSON.parse(jsonUser);
    user.forEach(function(u) {
      console.log('password' + u.password);
      //pulled this idea from stack overflow. makes it so that my php 
      //encrypted passwords work here in node
      var hash    = u.password;
      var bcrypt  = require('bcrypt');
      var isValid = false;
      hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');
      bcrypt.compare(password, hash, function(err, result) {
          console.log(result);
          result == true ? isValid = true : isValid = false;
          console.log('final: ' + isValid);
          if (isValid == true) {
            console.log('logged in');
          }
          else 
            console.log('you are a fraud');
      });


    });
    // Set up a JSON object of the values we want to pass along to the EJS result page
    const params = {jsonUser: jsonUser};
    res.render('pages/index.ejs', params);
  }); 
}



/****************************************************************
 * login 
 ****************************************************************/
function handleLogin(request, response) {
  var email    = request.body.email;
  var password = request.body.password;
  console.log(email, password);

  //query the database to see if this person exists in it
  var sql = "SELECT id, password FROM users WHERE email='"+email+"'";
  pool.query(sql, function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ")
        console.log(err);
    }

    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows);
    var jsonUser = JSON.stringify(result.rows);
    var user = JSON.parse(jsonUser);
    if (result.rows) {
      var id = user[0].id;
      console.log('password',user[0].password);
      //pulled this idea from stack overflow. makes it so that my php 
      //encrypted passwords work here in node
      var hash    = user[0].password;
      var bcrypt  = require('bcrypt');
      var isValid = false;
      hash = hash.replace(/^\$2y(.+)$/i, '$2a$1');
      bcrypt.compare(password, hash, function(err, result) {
          console.log(result);
          result == true ? isValid = true : isValid = false;
          console.log('final: ' + isValid);
          if (isValid == true) {
            var result = {success: true, redirect:'account.html'};
            response.json(result);
            //TO DO: set the session variables
          }
          else {
            var result = {success: false, redirect:''};
            response.json(result);          
          }
      });
    }
    else {
      var result = {success: false, redirect:''};
      response.json(result);
    }
  }); 

}


/****************************************************************
 * sign up
 ****************************************************************/
function handleSignup(request, response) {
  var email    = request.body.email;
  var password = request.body.email;
  console.log(email, password);

  //query the database to see if this person exists in it
  var sql = "SELECT id, password FROM users WHERE email='"+email+"'";
  pool.query(sql, function(err, result) {
    // If an error occurred...
    if (err) {
        console.log("Error in query: ")
        console.log(err);
    }

    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows);
    var jsonUser = JSON.stringify(result.rows);
    var user = JSON.parse(jsonUser);
    if (typeof user[0] === 'undefined') {
      var result = {success: true, redirect: 'index.html'};
      //TO DO: actually put the new account info into the database

      response.json(result);

    }
    else {
      //then there is already someone with that email
      //fail signup and redirect them to the sign IN page so they can log into their acct
      var result = {success: false, redirect: 'signIn.html'};
      response.json(result);
    }
  }); 

}




function callback(bool) {
  console.log('hi');
  console.log(bool);
}