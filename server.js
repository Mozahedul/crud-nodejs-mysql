// Loading require modules
const express = require("express"),
  mysql = require("mysql2"),
  bodyParser = require("body-parser"),
  dateFormat = require("dateformat"),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  flash = require("connect-flash");
const { start } = require("repl");

// Create an express app
const app = express();

// Define cookie parser
app.use(cookieParser());
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 60000 },
  })
);
app.use(flash());

// Parse the form
app.use(bodyParser.urlencoded({ extended: false }));

// format date
var now = new Date();

// Define template engine
app.set("view engine", "ejs");

// Configure public Directory
const publicDirectroy = path.join(__dirname, "/public");
app.use(express.static(publicDirectroy));

// Create a mysql connection
const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12657125",
  password: "ukhE93N3M8",
  database: "sql12657125",
});

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "abuRAYHAN@1987",
//   database: "event-db",
// });

// Establish a mysql connection
// db.connect();

// Query from database
// Create an express server for view tha data from a database
app.get("/", (req, res) => {
  db.query("select * from e_event order by start_date desc", (err, results) => {
    res.render("pages/index", {
      title: "Home Page",
      items: results,
      serverSuccess: req.flash("server-success"),
    });
  });
});

// Create a new event
// Only load the form
app.get("/event/add", (req, res) => {
  res.render("pages/add-event", {
    title: "Add Event Page",
    items: "",
    serverError: req.flash("server-error"),
  });
});

// Send or insert the data into Database
app.post("/event/add", (req, res) => {
  const { id, name, start_date, end_date, e_desc, e_location } = req.body;
  console.log("EVENT ID ==> ", id);
  const obj = {
    id: id.substring(id.length - 5),
    name: name,
    start_date: dateFormat(start_date, "yyyy-mm-dd"),
    end_date: dateFormat(end_date, "yyyy-mm-dd"),
    e_desc: e_desc,
    e_location: e_location,
  };
  db.query("insert into e_event set ?", obj, (err, results) => {
    if (err) {
      req.flash("server-error", err.message);
      res.redirect("/event/add");
    } else {
      req.flash("server-success", "Inserted successfully");
      res.redirect("/");
    }
  });
});

// Edit event ## View data inside the form
app.get("/event/edit/:id", (req, res) => {
  let id = req.params.id;
  // Query the data form database
  db.query("select * from e_event where id = ?", `${id}`, (err, results) => {
    var string = JSON.stringify(results);
    var qResults = JSON.parse(string);

    qResults[0].start_date = dateFormat(qResults[0].start_date, "yyyy-mm-dd");
    qResults[0].end_date = dateFormat(qResults[0].end_date, "yyyy-mm-dd");

    res.render("pages/edit-event", {
      title: "Edit event page",
      items: qResults,
    });
  });
});

// Update event ## Update database
app.post("/event/update/:id", (req, res) => {
  var { name, start_date, end_date, e_desc, e_location } = req.body;
  var id = req.params.id;
  var sql = `UPDATE e_event SET 
    name = "${name}", 
    start_date = "${start_date}",
    end_date = "${end_date}",
    e_desc = "${e_desc}",
    e_location = "${e_location}"
    WHERE id = ${id}`;
  db.query(sql, (err, results) => {
    // console.log(results);
    if (!err) {
      req.flash("server-success", `ID number: ${id}! Updated Successfully`);
      res.redirect("/");
    } else {
      req.flash("server-error", err.message);
      res.redirect("/event/edit");
    }
  });
});

// Delete a row from a database
app.get("/event/delete/:id", (req, res) => {
  var id = req.params.id;
  var sql = `DELETE FROM e_event WHERE id = ${id}`;
  db.query(sql, (err, results) => {
    if (!err) {
      req.flash("server-success", `ID Number: ${id}! Deleted successfully`);
      res.redirect("/");
    } else {
      req.flash("server-error", err.message);
      res.redirect("/");
    }
  });
});

// Handle 404 page
app.use(function (req, res, next) {
  res.status(404).render("pages/404", {
    title: "404 Error!",
  });
});

app.listen(3232, err => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server connected");
  }
});
