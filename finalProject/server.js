/*
Name: Alexander Balandin
ID: 132145194
DATA: 10/29/2020
Heroku url: https://glacial-eyrie-05995.herokuapp.com/
*/
const express = require("express");
const path = require("path");
const db = require(path.join(__dirname, 'JS/dbconnection.js'))
const app = express();
const fs = require("fs")
const exphbs = require('express-handlebars')
const clientSessions = require('client-sessions')
const bodyParser = require('body-parser')
const multer = require("multer")
require('dotenv').config();
const validation = require(path.join(__dirname, '/JS/validation.js'))
//directory of images
const PHOTODIRECTORY = path.join(__dirname, "images");

const PORT = process.env.PORT || 8080;
// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
  destination: PHOTODIRECTORY,
  filename: (req, file, cb) =>
  {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})

//make sure the images folder exists
if(!fs.existsSync(PHOTODIRECTORY))
{
  fs.mkdirSync(PHOTODIRECTORY)
}
const upload = multer({storage : storage})
//mongoDB connection string
const dbConnection = process.env.MONGODB_CONN_STR
function onHttpStart() {
  console.log("Express http server listening on: " + PORT);
}
//handle handlebars
app.engine('hbs', exphbs({extname: '.hbs'}))
app.set()
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'html'))
//allow the index.html using js script and css style
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/css")));
app.use(express.static(path.join(__dirname, "/JS")));
app.use(express.static(path.join(__dirname, "/images")));

//set client sessions
app.use(clientSessions({
  cookieName: "session",
  secret: "third_assignment_web322",
  duration: 2  * 1000 * 60,
  activeDuration: 1000 * 60
}))
//send home page
app.get("/", (req, res) => {
  res.render('home', {
    user: {'formData' : req.session.user},
    layout: false
    //TODO: set data**************************
  });
});
app.post("/",  (req, res)=>
{

  db.getRoomsInCity(req.body.where)
  .then((rooms)=>
  {
    
    res.render("roomListing", {data: rooms, layout: false})
  })
})
app.get("/addRoom", ensureAdmin, (req, res)=>
{
  res.render('addRoom', {layout : "main"})
})
app.post("/addRoom", upload.single("photo"), (req, res) =>
{

  const locals = {message: "The room was successfully uploaded",
                  layout: "main"}

  db.saveRoom(req)
  .then(room =>
    {console.log("post appRoom")
    res.render('addRoom', locals)
  })
  .catch(err=>
    {
      locals.message = "Error: " + err;
      res.render('addRoom', locals)
      console.log(err);
    })
    
})
//delete specified room
app.post("/removeRoom/:filename", (req, res) =>
{
  const filename = req.params.filename

  db.removeRoom(filename)
  .then(() =>
  {
    //remove file from the local storage
    fs.unlink("images/" + filename, err =>
      {
        if(err)
        {
          console.log(err)
        }
        else{
          console.log("Removed file : " + filename);
        }
      })
      res.redirect("/roomListing")
  })
  .catch(err => 
    {
      console.log(err);
      res.redirect("/roomListing");
    })
})
//book room
app.get("/bookRoom/:name", ensureLogin, (req, res) =>
{
  db.getRoom(req.params.name)
  .then((room)=>
  {
    console.log(room)
   
    res.render("bookRoom", {data: room,  layout: "main"})
  })
})

app.post("/bookedRoom/:days", ensureLogin, (req, res)=>
{
    res.render("bookedRoom", {nights: req.params.days, user: req.session.user.firstName})
})
app.post("/bookRoom/:filename", ensureLogin, (req, res)=>
{
  
  let total = 0.0;
  db.getRoom(req.params.filename)
  .then((room)=>
  {
    const date1 = new Date(req.body.checkout)
    const date2 = new Date(req.body.checkin)
    const diffTimes = Math.abs(date2-date1)
    const diffDays = Math.ceil(diffTimes / (1000 * 60 * 60 * 24))
    total = room.price * (diffDays)
    res.render("bookRoom", {data: room,  isTotal: true, total: total, days: diffDays,  layout: "main", isCalculated: true})
  })
})
//update room


app.get('/editRoom/:filename', ensureAdmin, (req, res)=> 
{
   
  res.render('editRoom', {hotel: req.params.filename, toChange: true})
      
})

app.post('/editRoom/:filename', (req, res)=>
{
  let message = "Room was successfully updated";
    db.updateRoom(req.params.filename, req.body)
    .catch((err)=>
    {
      message = "Error: " + message
        console.log(err);
    })
    res.render('editRoom', {message: message})
})
//send roomListing page
app.get("/roomListing", (req, res) =>{
    let isAdmin;
    db.getRooms()
    .then(data =>
      {
        if(req.session.user)
        {
        if(req.session.user.isAdmin)
        {
         isAdmin = true
        }
        else
        {
          isAdmin = false
        }
      }
      else
      {
        isAdmin = false
      }
        console.log("isAdmin: " + isAdmin)
        res.render('roomListing', {data: data, isAdmin: isAdmin,  layout: false})
        
      })
      .catch(err=>
        {
          console.log("\n\n" + err + "\n\n");
        });
    
    
     
      //TODO: set data**************************
    
    
 
  
})
//send login page
app.get("/login", (req, res) =>{
  res.render('login', {
    data:{validation: false},
    layout: false
    })
  })
  app.post("/login", (req, res)=>{
    const errors = validation.getLoginErrors(req.body)
    if(errors.isValid){
      db.findExistingUser(req.body)
      .then(jsUser => {
        console.log("message in server.js' dataService.login(): ", jsUser);
        req.session.user = {
          firstName: jsUser.firstName,
          lastName: jsUser.lastName,
          email: jsUser.email,
          isAdmin: jsUser.isAdmin
        }
        res.render('dashboard', {
          
          data : {reqData: jsUser, isLogin: errors.isLogin, isAdmin: req.session.isAdmin},
          layout: 'main'
        })
      })
      .catch(err =>
        {

          res.render('login',
           {
           
            data : {errors: err, reqData: req.body},
            layout: false
          })
        })
      
     }
     else{
       
       res.render('login', {
         data : {errors: errors, reqData: req.body},
         layout: false
       })
     }
  })
//send registration page
app.get("/registration", (req, res) =>{
  
  res.render('registration', {
    data: {validation: false},
    layout: false
    })
})
app.post("/registration", (req, res)=>{
  //validate input
  const errors = validation.getErrors(req.body);
 if(errors.isValid){
   db.createNewUser(req.body)
   .then(()=>
   {
    res.render('dashboard', {
      data : {reqData: req.body, isLogin: false},
      layout: 'main'
    })
   })
   .catch(err => 
    {
      errors.email = err;
      res.render('registration', {
        data : {errors: errors, reqData: req.body},
        layout: false
      })
   })
  
 }
 else{
   res.render('registration', {
     data : {errors: errors, reqData: req.body},
     layout: false
   })
 }
})

app.get("/dashboard", ensureLogin, (req, res) =>
{
  res.render("dashboard", {
    data: {"reqData" : req.session.user, isLogin: true},
    layout: 'main'
  })
})
//destroy current session
app.get("/logout", (req, res) =>
{
  req.session.reset();
  res.redirect("/login");
})
function ensureLogin(req, res, next)
{
  if(!req.session.user)
  {
    res.redirect("/login");
  }
  else{
    next();
  }
}
function ensureAdmin(req, res, next)
{
  if(!req.session.user.isAdmin)
  {
    res.redirect("/login")
  }
  else
  {
    next()
  }
}
//error if the page does not exist
app.use(function (req, res) {
  res.status(404).send("Page Not Found");
});

//ensure the user logged in

//listen on port PORT
db.connectDB(dbConnection)
.then(()=>
{
  app.listen(PORT, onHttpStart);
})
.catch(err=>
  {
    console.log("Unable to start the server :" + err);
  })

