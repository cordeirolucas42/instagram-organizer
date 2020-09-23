//NPM PACKAGES USED
// npm i express request method-override body-parser ejs mongoose nodemon
// APP INITIALIZATION
var express = require("express"); //import NPM express
var app = express(); //initialize app with express
var request = require("request"); //import NPM require
var methodOverride = require("method-override");
app.use(methodOverride("_method"));
var bodyParser = require("body-parser"); //import NPM body-parser
app.use(bodyParser.urlencoded({ extended: true })); //setting body-parser
app.set("view engine", "ejs"); //setting ejs as standard
app.use(express.static("public")); //connecting to css and js files
var theport = process.env.PORT || 5000;
var newPhoto = {};

//DATABASE INITIALIZATION
//REMEMBER TO START MONGOD IN ANOTHER TERMINAL
var mongoose = require("mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
var uri = process.env.DB_URI;
var options = {
	"server": {
		"socketOptions": {
			"keepAlive": 300000,
			"connectTimeoutMS": 30000
		}
	},
	"replset": {
		"socketOptions": {
			"keepAlive": 300000,
			"connectTimeoutMS": 30000
		}
	}
}
mongoose.connect(uri, options);
var photoSchema = new mongoose.Schema({ //creating Schema
	source: String,
	position: Number,
	description: String
});
var Photo = mongoose.model("Photo", photoSchema); //creating model and collection

//ROUTES=================================================================

//Photo.remove({},function(){});

//INDEX
app.get("/", (req, res) => {
	res.redirect("/photos");
});

app.get("/photos", async function (req, res) {
	var photos = [];
	//count elements in database	
	let count = await Photo.countDocuments({});
	// console.log(count);
	for (i = 0; i < count; i++) {
		let photo = await Photo.find({ position: i });
		// console.log(photo[0]);
		photos[i] = photo[0];
	}
	res.render("index", { photos: photos });
});

//MODIFY
app.post("/photos/modify", async function (req, res) {
	var seq = req.body.seq;
	for (i = 0; i < seq.length; i++) {
		seq[i] = Number(seq[i]);
	}
	console.log(seq);
	var swapped=[];
	for (i = 0; i < seq.length; i++) {
		console.log(i+" iteração, nova posição é "+seq.indexOf(i));
		if(swapped.includes(i)){
			console.log("********já foi");
		} else {
			await Photo.findOneAndUpdate({ position: i }, { position: seq.length });
			await Photo.findOneAndUpdate({ position: seq.indexOf(i) }, { position: i });
			await Photo.findOneAndUpdate({ position: seq.length }, { position: seq.indexOf(i) });
			swapped.push(seq.indexOf(i));
		}	
	}
	var photos = await Photo.find();
	for (i = 0; i < seq.length; i++) {
		console.log(i + " element of db has position of: " + photos[i].position);
	}
	//redirect
	res.redirect("/photos");
});

//NEW
app.get("/photos/new", (req, res) => {
	//render views page
	res.render("new");
});

//CREATE
app.post("/photos", (req, res) => {
	//get data from post request
	console.log("***Data we get from post: " + req.body.photo.description);
	newPhoto = req.body.photo;
	//count elements in database	
	Photo.countDocuments({}, (err, res) => {
		newPhoto.position = res;
		console.log("***new photo position: " + newPhoto.position);
		console.log("***countDocuments() return count as: " + res);
		//insert new Photo in the database
		Photo.create(newPhoto, (err, foto) => {
			if (!err) {
				console.log("***this is the new db entry:\n" + foto);
			}
		});
	});
	//redirect to get /photos
	res.redirect("/photos");
});

//SHOW
app.get("/photos/:id", (req, res) => {
	//get data from get request
	var id = req.params.id;
	//acces database to get specific Photoground
	Photo.findById(id, (err, photo) => {
		if (!err) {
			res.render("show", { photo: photo });
		}
	});
});

//EDIT
app.get("/photos/:id/edit", (req, res) => {
	//get data from get request
	var id = req.params.id;
	//acces database to get specific Photoground
	Photo.findById(id, (err, photo) => {
		if (!err) {
			res.render("edit", { photo: photo });
		}
	});
});

//UPDATE
app.put("/photos/:id", (req, res) => {
	Photo.findByIdAndUpdate(req.params.id, req.body.photo, (err, photo) => {
		if (!err) {
			//redirect to get /Photogrounds
			res.redirect("/photos/" + req.params.id);
		}
	});
});

//DESTROY - DELETES A Photo GROUND
app.delete("/photos/:id", (req, res) => {
	Photo.findByIdAndRemove(req.params.id, (err, photo) => {
		if (!err) {
			//redirect to get /Photogrounds
			res.redirect("/photos");
		}
	});
});


// START SERVER====================================================
app.listen(theport, (err) => {
	if (!err) {
		console.log("Listening on port " + theport)
	}
});