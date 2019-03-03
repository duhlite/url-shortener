'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var shortid = require('shortid');
var validUrl = require('valid-url');
var bodyParser = require('body-parser');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect(process.env.MONGO_URI);
mongoose.Promise = global.Promise;
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: true}));

var urlSchema = new mongoose.Schema({
  url: String,
  tinyurl: String
});

var TinyUrl = mongoose.model("Url",urlSchema);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", (req, res) => {
  if(validUrl.isUri(req.body.url)) {
    var urlData = {
      url: req.body.url,
      tinyurl: shortid.generate()
    }
    new TinyUrl(urlData)
    .save();
    res.json(urlData);
} else {
    res.json({error:'Not a valid URL'});
}
});

app.get("/:code", (req, res) => {
  TinyUrl.findOne({tinyurl: req.params.code}, 
               {url:1,_id:0},
               ((err, docs) => {
    console.log(docs);
                  res.redirect(301,docs.url)}))
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});