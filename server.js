const { Console } = require("console");
const express = require("express");
const path = require("path");
const app = express();
// const cors = require("cors");

app.use(express.json());

app.set("path", 3000);
// app.use(cors()); // using cors

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});
const MongoClient = require("mongodb").MongoClient;

let db;
MongoClient.connect(
  "mongodb+srv://aatif:aatif123@cluster0.c2jqgfi.mongodb.net",
  (err, client) => {
    mg = client;
    db = client.db("webstore");
  }
);

app.use(express.static("public")); // setting public directory as static content

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});
app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
    console.log("Lessons Data Sent Successful!");
  });
});

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
    console.log("Order Added Successfully!");
  });
});

const ObjectID = require("mongodb").ObjectId;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

app.get("/lessons", (req, res, next) => {
  const collection = mg.db("webstore").collection("lessons");
  collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
    console.log("Lessons Data Sent Successful!");
  });
});

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
      // console.log(results);
      // console.log("Search Data Sent Successful!");
    });
});

app.get("/lessons/:id", (req, res) => {
  const pid = parseInt(req.params.id);
  const collection = mg.db("webstore").collection("lessons");
  collection.findOne({ id: pid }, (err, result) => {
    if (err || !result) {
      res.status(404).send({ message: "Lesson Not Found!" });
      console.log("Lesson Not Found!");
    } else {
      res.send(result);
      console.log(result.title + " Lesson Data Accessed Successfully!");
    }
  });
});

app.get("/images/:id", (req, res) => {
  const pid = parseInt(req.params.id);
  const collection = mg.db("webstore").collection("lessons");
  collection.findOne({ id: pid }, (err, result) => {
    if (err || !result) {
      res.status(404).send({ message: "File Not Found!" });
      console.log("File Not Found!");
    } else {
      res.sendFile(path.join(__dirname, "public\\" + result.image));
      console.log(result.title + " Image Accessed Successfully!");
    }
  });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result ? { msg: "success" } : { msg: "error" });
    }
  );
});

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
          console.log("Space Updated Error!");
        } else {
          console.log("Space Updated Successfully!");
        }
      }
    );
  });
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.deleteOne(
    { _id: new ObjectID(req.params.id) },
    (e, result) => {
      if (e) return next(e);
      res.send(result ? { msg: "success" } : { msg: "error" });
    }
  );
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
