const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
   secret : "ourlittlesecret",
   resave:false,
   saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

//mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true});
mongoose.connect("mongodb+srv://ketaki:test123@cluster0-xrczy.mongodb.net/usersdb",{useNewUrlParser:true});
mongoose.set("useCreateIndex",true);
const itemsSchema = new mongoose.Schema({
  name: String,
  due_date : Date,
  status : String,
  label : String,
});


const usersSchema = new mongoose.Schema({
  username: String,
  password : String,
  todos : [itemsSchema]
});


usersSchema.plugin(passportLocalMongoose);

const Item = mongoose.model("Item",itemsSchema);
const User = mongoose.model("User",usersSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res)
{
	console.log("reached /")
	 res.render("login");
});



app.get("/index",function(req,res)
{
	if(!req.user){
		res.render("error");
	} else {
	   User.findById(req.user.id,function(err,foundUser) {
	       if(err) {
	       	console.log(err);
	       }
	       else {
	           if(foundUser)
	           {
	             console.log("User found");
	             let newlist = [];
	             let prolist = [];
	             let complist = [];
	             for(var i=0;i<foundUser.todos.length;i++)
	             {
	             	if(foundUser.todos[i].status==="New")
	             	{
	             		newlist.push(foundUser.todos[i]);
	             	}
	             	else if(foundUser.todos[i].status==="Completed")
	             	{
	             		complist.push(foundUser.todos[i]);
	             	}
	             	else
	             	{
	             		prolist.push(foundUser.todos[i]);
	             	}
	             }
	           // console.log(newlist);
	            res.render("index",{newListItems:newlist , oldListItems:complist , proListItems:prolist});
	       	}
	       }
	   });
}

  
});

 app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
var user_curr = req.user;

var task = user_curr.todos.id(req.body.checkbox).remove();
user_curr.save(function(err)
	{
		if(!err)
		{
			console.log("Deleted Successfully");
		}
	});
res.redirect("/index");
});

 app.post("/updateComplete",function(req,res)
{
var user_curr = req.user;

var task = user_curr.todos.id(req.body.checkbox2);
task.status = 'Completed';
user_curr.save(function(err)
	{
		if(!err)
		{
			console.log("Updated Successfully");
		}
	});
res.redirect("/index");
});


app.post("/updateProgress",function(req,res)
{
  var user_curr = req.user;

var task = user_curr.todos.id(req.body.checkbox3);
task.status = 'In Progress';
user_curr.save(function(err)
	{
		if(!err)
		{
			console.log("Updated Successfully");
		}
	});
res.redirect("/index");
});

app.get("/register",function(req,res)
{
  res.render("register");
});

app.post("/register",function(req,res)
{
   User.register({username:req.body.uname},req.body.pass,function(err,user){
     if(err)
     {
     	console.log(err);
     	res.render("alreadyexists");
     }
     else
     {
     	res.redirect("/success");
          passport.authenticate("local")(req,res,function()
          {
          	console.log("register here");
          	res.redirect("/index");
          });
     }
   });
});

app.get("/success",function(req,res)
{
     res.render("success");
});


app.post("/login",function(req,res)
{
    const user = new User({
   	  username : req.body.uname,
   	  password : req.body.pass
   });

   req.login(user,function(err) {
      if(err) {
      	console.log(err);
      	res.send("Not Successfull");
      	alert("Error aa gaya");
      }
      else {
	  	res.redirect("/index");
	  	passport.authenticate("local")(req,res,function() {
	  		res.redirect("/index");
	  	});
      }
   });
});


app.get("/logout",function(req,res)
{
	req.logout();
	res.redirect("/");
})

app.post("/index",function(req,res)
{
  var item = req.body.newItem;
   var date = req.body.dueDate;
   var item_label = req.body.label;
   const task = new Item({
   	name : item,
   	due_date:date, 
    status : "New",
    label : item_label
   });
   task.save();

   User.findById(req.user.id,function(err,foundUser)
   {
       if(err)
       {
       	console.log(err);
       }
       else
       {
           if(foundUser)
           {
           	foundUser.todos.push(task);
           	foundUser.save();
           }
       }
   });
  res.redirect("/index");
});

app.listen(process.env.PORT || 3000,function()
{
  console.log("Server 3000");
});