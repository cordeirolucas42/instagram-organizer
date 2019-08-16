//NPM PACKAGES USED
// npm i express request method-override body-parser ejs mongoose nodemon
// APP INITIALIZATION
var express = require("express"); //import NPM express
var app = express(); //initialize app with express
var request = require("request"); //import NPM require
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
var bodyParser = require("body-parser"); //import NPM body-parser
app.use(bodyParser.urlencoded({extended: true})); //setting body-parser
app.set("view engine", "ejs"); //setting ejs as standard
app.use(express.static("public")); //connecting to css and js files
var theport = process.env.PORT || 5000;

//DATABASE INITIALIZATION
//REMEMBER TO START MONGOD IN ANOTHER TERMINAL
var mongoose = require("mongoose");
var uristring = 
process.env.MONGOLAB_URI||
process.env.MONGOHQ_URL ||
"mongodb://localhost/Insta?authSource=admin";

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
//mongoose.connect("mongodb://localhost/Insta",{ useNewUrlParser: true });
mongoose.connect("mongodb://localhost/Insta?authSource=admin", (err,res)=>{
	if(err){
		console.log("ERROR connecting to: " + uristring + ". " + err);
	} else {
		console.log("Succeed connected to: " + uristring);
	}
});
var photoSchema = new mongoose.Schema({ //creating Schema
   source: String,
   position: {x: Number, y: Number},
   description: String});
var Photo = mongoose.model("Photo", photoSchema); //creating model and collection

//ROUTES=================================================================

//INDEX
app.get("/", (req,res)=>{
	res.redirect("/photos");
});

app.get("/photos", (req,res)=>{
	//access database and use it to render views page
	Photo.find({},(err,photos)=>{
		if(!err){
			//render views page
			res.render("index",{photos:photos});
		}
	});	
});

//NEW
app.get("/photos/new", (req,res)=>{
	//render views page
	res.render("new");
});

//CREATE
app.post("/photos", (req,res)=>{
	//get data from post request
	var newPhoto = req.body.photo;
	//insert new Photoground in the database
	Photo.create(newPhoto,(err,foto)=>{
		if(!err){
			//redirect to get /campgrounds
			res.redirect("/photos");
		}
	});	
});

//SHOW
app.get("/photos/:id", (req,res)=>{
	//get data from get request
	var id = req.params.id;
	//acces database to get specific Photoground
	Photo.findById(id,(err,photo)=>{
		if(!err){
			res.render("show",{photo:photo});
		}
	});
});

//EDIT
app.get("/photos/:id/edit", (req,res)=>{
	//get data from get request
	var id = req.params.id;
	//acces database to get specific Photoground
	Photo.findById(id,(err,photo)=>{
		if(!err){
			res.render("edit",{photo:photo});
		}
	});
});

//UPDATE
app.put("/photos/:id",(req,res)=>{
	Photo.findByIdAndUpdate(req.params.id,req.body.photo, (err,photo)=>{
		if(!err){
			//redirect to get /Photogrounds
			res.redirect("/photos/" + req.params.id);
		}
	});
});

//DESTROY - DELETES A Photo GROUND
app.delete("/photos/:id",(req,res)=>{
	Photo.findByIdAndRemove(req.params.id,(err,photo)=>{
		if(!err){
			//redirect to get /Photogrounds
			res.redirect("/photos");
		}
	});
});


// START SERVER====================================================
app.listen(theport, (err)=>{
	if(!err){
		console.log("Listening on port " + theport)
	}
});