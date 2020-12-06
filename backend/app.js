const express = require('express');
const port = 3001;
var path = require('path');
var app = express();
const bodyParser = require('body-parser');
const Mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
// mongoUserdata
const user = "MongoDBWeb2023";
const password = "48397526";
// Connection URL
const url = `mongodb://${user}:${password}@172.20.0.54:27017/?authMechanism=DEFAULT&authSource=${user}`;
// Create a new MongoClient
const client = new MongoClient(url);
// Database
let db;

//connect
client.connect(function(err) {

  app.use(bodyParser.json()); // for parsing application/json
  app.use(bodyParser.urlencoded({ extended: true }));

// CORS fix
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //! * -> Laat alle routes toegang hebben tot API
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
  });

  db = client.db(user);
// post 
  app.post('/api/chartdatalist', function(req,res){
    const collection = db.collection('chartData');
    const data = req.body;
    collection.insertOne({
      "chartName": data.chartName,
        "name": data.name,
        "email": data.email,
        "stats": data.stats,
        "players": data.players 
    });
  });
    
    app.put('/api/chartdatalist/:id', function(req,res){
      const collection = db.collection('chartData');
      const data = req.body;
      const id = new Mongodb.ObjectID(req.params.id);

      collection.updateOne({"_id": id },{$set:{
        "chartName": data.chartName,
        "name": data.name,
        "email": data.email,
        "stats": data.stats,
        "players": data.players 
      }},function(err,r){
        console.log(err);
      });
    });
  // GET by ID
  app.get('/api/chartdatalist/:id', function(req,res) {
    const collection = db.collection('chartData');
    const id = new Mongodb.ObjectID(req.params.id);
    collection.find({"_id": id }).toArray(function(err,docs){
      res.send(docs);
    });
    
});
// GET all
  app.get('/api/chartdatalist', function(req,res) {
      const collection = db.collection('chartData');
      collection.find({}).toArray(function(err,docs){
        res.send(docs);
      });
  });
// delete
  app.delete('/api/chartdatalist/:id', function(req,res){
    const id = new Mongodb.ObjectID(req.params.id);
    const collection = db.collection('chartData');
    collection.deleteOne({"_id": id }, function(err,r){
      console.log(err);
    });
  });

  app.listen(port, () => console.log(`Example app listening on port ${port}!`));

});
 