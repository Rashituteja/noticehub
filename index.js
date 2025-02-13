const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const Notice = require('./models/notice'); // Assuming you have a Notice model
const passport =require("passport");
const LocalStrategy =  require("passport-local");
const User = require("./models/user.js");
const app = express();
const {noticeSchema} = require("./schema");
const session  = require("express-session");
const flash = require("connect-flash");

// Middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
const engine = require('ejs-mate');
app.engine('ejs', engine);


async function main(){
    await  mongoose.connect('mongodb://127.0.0.1:27017/notice');
  }

 main()
 .then((res)=>{
     console.log("work");
 }).catch((err)=>{
     console.log(err);
 });
 
// Define wrapAsync function
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
}

//ExpressError
class ExpressError extends Error{
    constructor( statusCode, message){
    super();
    this.statusCode = statusCode;
    this.message = message;
    }
    }

const validateNotice = (req,res,next)=>{
  let {error} = noticeSchema.validate(req.body);
  if(error){
    throw new ExpressError (400, error);
  }else{
    next()
  }
}

// session  configuration
const sessionOptions = {
  secret:"mysuperkay",
   resave: false,
 saveUninitialized:true,
   Cookie:{
    expires:new Date (Date.now()+ 7 * 24* 60 * 60 * 1000),
    maxAge:7*24*60*60*1000,
    httpOnly: true
   }
};

app.use(session(sessionOptions));
// use flash before routes
app.use(flash());
// intialize passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  next();
})

app.get("/demouser" , async(req,res)=>{
  let fakeuser = new User({
    email:"student@gmai.com",
    username:"delta-student"
  });
const newUser=await  User.register(fakeuser,"hellowold");
res.send(newUser);
})
// Routes


// routes for users
// signup

app.get("/signup", (req,res)=>{
  res.render("./layouts/ejsfile/signup.ejs");
})

app.post("/signup", async(req,res)=>{
  try{
    let {username, email, password} = req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser,password);
    req.flash("success", "welcome to NoticeHub");
    res.redirect("/notice");
  } catch(e){
  req.flash("error", e.message);
  res.redirect("/notice");
  }
 
})



//Login 
app.get("/login", (req,res)=>{
  res.render("./layouts/ejsfile/login.ejs");
});
app.post("/login", passport.authenticate("local", {
  successRedirect:"/notice",
  failureRedirect: "/login",
  failureFlash: true,
}));

// login post


app.get('/notice', wrapAsync(async (req, res) => {
    const notices = await Notice.find({});
    res.render('./layouts/ejsfile/index.ejs', { notices });
}));
// new
app.get("/notice/new",wrapAsync( (req,res)=>{
  if(!req.isAuthenticated()){
  req.flash("success", "you must be logged in!")
    res.redirect("/login");
  }
  res.render("./layouts/ejsfile/new.ejs" );
}))
//app.get
app.get('/notice/:id',validateNotice, wrapAsync(async (req, res) => {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
        return res.status(404).send('Notice not found');
    }
    res.render('./layouts/ejsfile/show', { notice });
}));
// create route
app.post('/notice', validateNotice,wrapAsync(async (req, res) => {

      const newNotice = new Notice(req.body.notice);
      await newNotice.save();
      req.flash("success","New notice created");
      res.redirect('/notice');
 
      console.error(e);
      res.status(400).send('Validation Error: ' + e.message);
    }
  ));

// Edit routes
app.get('/notice/:id/edit', wrapAsync(async (req, res) => {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
        return res.status(404).send('Notice not found');
    }
    res.render('./layouts/ejsfile/edit', { notice });
}));

//updating route
app.put("/notice/:id", wrapAsync(async(req,res)=>{ 
let {id}= req.params;
let notice = await Notice.findById(id);
res.redirect(`/notice/ ${id}`);
await Notice.findByIdAndUpdate(id,{...req.body.notice});
res.redirect("/notice");
}
));


// Delete route
app.get('/notice/:id/delete', wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Notice.findByIdAndDelete(id);
    req.flash("success","notice deleted");
    res.redirect('/notice');
}));



app.all("*", (req,res,next)=>{
    next(new ExpressError (404, "page not found"));
})
// Error handling middleware
app.use((err, req, res, next) => {
let{statusCode= 500,message="something went wrong"} = err;
res.render("layouts/ejsfile/error.ejs",{message}); 
});

// Start server
app.listen(5000, () => {
    console.log('Server is listening on port 5000');
});
 