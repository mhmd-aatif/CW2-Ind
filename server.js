//Importing the required elements
const express = require("express");
const path = require("path");
const app = express();

//Function to log the current time
function logCurrentTime() {
  const time = new Date();
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  return time.toLocaleDateString("en-US", options);
}

//To handle requests with JSON payload
app.use(express.json());

app.set("path", 3000);

//Setting Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

//Setting up mongodb connection
const MongoClient = require("mongodb").MongoClient;
let db;
MongoClient.connect(
  "mongodb+srv://aatif:aatif123@cluster0.c2jqgfi.mongodb.net",
  (err, client) => {
    mg = client;
    db = client.db("webstore");
  }
);

// setting public directory as static content
app.use(express.static("public"));

//creating parameter for collection name
app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

// Setting up method to handle post requests
app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
    console.log(logCurrentTime() + " Order Added Successfully!");
  });
});

// Setting up method to handle get request to get a particular element from mongodb
const ObjectID = require("mongodb").ObjectId;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

// Setting up method to handle get request to get all lessons
app.get("/lessons", (req, res, next) => {
  const collection = mg.db("webstore").collection("lessons");
  collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
    console.log(logCurrentTime() + " Lessons Data Sent Successful!");
  });
});

// Setting up method to handle search requests
app.post("/search", (req, res, next) => {
  const data = req.body.search;
  const collection = mg.db("webstore").collection("lessons");
  collection
    .find({
      $or: [
        { title: { $regex: new RegExp("^" + data.toLowerCase(), "i") } },
        { price: parseInt(data) },
        { location: { $regex: new RegExp("^" + data.toLowerCase(), "i") } },
        { rating: parseInt(data) },
        { displaySpace: parseInt(data) },
      ],
    })
    .toArray((e, results) => {
      if (e) return next(e);
      res.send(results);
    });
});

// Setting up method to handle get request to get a lesson with the ID
app.get("/lessons/:id", (req, res) => {
  const pid = parseInt(req.params.id);
  const collection = mg.db("webstore").collection("lessons");
  collection.findOne({ id: pid }, (err, result) => {
    if (err || !result) {
      res.status(404).send({ message: "Lesson Not Found!" });
      console.log(logCurrentTime() + " Lesson Not Found!");
    } else {
      res.send(result);
      console.log(
        logCurrentTime() +
          " " +
          result.title +
          " Lesson Data Accessed Successfully!"
      );
    }
  });
});

// Setting up method to handle get request to get the image of a lesson with the ID
app.get("/images/:id", (req, res) => {
  const pid = parseInt(req.params.id);
  const collection = mg.db("webstore").collection("lessons");
  collection.findOne({ id: pid }, (err, result) => {
    if (err || !result) {
      res.status(404).send({ message: "File Not Found!" });
      console.log(logCurrentTime() + " File Not Found!");
    } else {
      res.sendFile(path.join(__dirname, "public\\" + result.image));
      console.log(
        logCurrentTime() + " " + result.title + " Image Accessed Successfully!"
      );
    }
  });
});

// Setting up method to handle put request to update the spaces
app.put("/lessons", (req, res, next) => {
  const data = req.body;
  const collection = mg.db("webstore").collection("lessons");
  data.forEach((update) => {
    collection.updateOne(
      { _id: new ObjectID(update._id) },
      {
        $set: { displaySpace: update.displaySpace, space: update.displaySpace },
      },
      { safe: true, multi: false },
      (e, result) => {
        if (e || !result) {
          console.log(logCurrentTime() + " Space Updated Error!");
        } else {
          console.log(logCurrentTime() + " Space Updated Successfully!");
        }
      }
    );
  });
});

// Setting up the port
app.listen(3000, () => {
  console.log(logCurrentTime() + " Listening on port 3000");
});
