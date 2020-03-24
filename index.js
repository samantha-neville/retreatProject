const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg')
const connectionString = process.env.DATABASE_URL || "postgres://zbysucmtpsrwvw:0ff68dab033be013e3f2d3b2aaa6939b8bad8b63015892293d1176b827c32da8@ec2-3-224-165-85.compute-1.amazonaws.com:5432/d11jjk2h0d7bcm?ssl=true";
const pool = new Pool({connectionString: connectionString});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))




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
        res.render('displaySearch', params);
      });

}