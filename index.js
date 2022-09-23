require('dotenv').config();

const mongoose = require("mongoose");
const express = require('express');
const autoIncrement = require('mongoose-auto-increment')
const cors = require('cors');
const app = express();
app.use(express.json())
app.use(express.urlencoded({
  extended:true
}))
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/url_test", {
   useNewUrlParser: true,
   useUnifiedTopology: true
});

// const urlSchema = {
//   url : String
// }
const urlSchema = new mongoose.Schema({
  url: {
    type : String,
    required : true,
  }
})

//autoIncrement

autoIncrement.initialize(mongoose)
urlSchema.plugin(autoIncrement.plugin,{
  model: "post",
  field: "_id",
  startAt: 1,
  incrementBy: 1
})


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const url_model = mongoose.model("url_model" , urlSchema);

app.post("/api/shorturl", function(req,res){
  const url = req.body.url
  const new_model = new url_model({
     url
  })

  url_model.find({url:url}, '_id', function(err,docs){
    if(docs.length===0){
      new_model.save(function(err){
        if(err){
          res.redirect("/error")
          console.log(err)
        }else{
          url_model.find({url:url}, '_id', function(err1,docs){
            if(err1){
              console.log(err1)
            }else{
              res.json({
                original_url : url,
                short_url : docs[0].id
              })
            }
          })
        }
      })
    }else{
      res.json({
        original_url : url,
        short_url : docs[0]._id
      })
      
    }
  })

  
})

//getting redirected when entered shortUrl

app.get('/api/shorturl/:id', function(req,res){
  const id = req.params.id
  url_model.find({_id:id}, 'url', function(err,docs){
    res.redirect(docs[0].url)
  })
})

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
