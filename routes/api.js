/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGO_URI = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  app.route('/api/books')
  
    //response will be array of book objects
    //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    .get(function (req, res){
      MongoClient.connect(MONGO_URI, (err, db) => {
        db.collection('books').find().toArray( (err, allBooks) => {
          allBooks.map(b => {
            b.commentcount = b.comments.length;
            delete b.comments; 
          });
          res.json(allBooks);
        })
      });
    })
    
    //response will contain new book object including atleast _id and title
    .post(function (req, res){
      (!req.body.title) ? res.send('HINT: books have titles') : 
        MongoClient.connect(MONGO_URI, (err, db) => 
          db.collection('books').insert( {title:req.body.title, comments:[]}, (err,book) => res.json(book.ops[0]) )
        );
    })
    
    //if successful response will be 'complete delete successful'
    .delete(function(req, res){
      MongoClient.connect(MONGO_URI, (err, db) => {
        db.collection('books').remove();
        res.send("complete delete successful");
      });
    });



  app.route('/api/books/:id')
    //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    .get(function (req, res){
      MongoClient.connect(MONGO_URI, (err, db) =>
        db.collection('books').find({_id:new ObjectId(req.params.id)}).toArray((err, books) => 
          (books[0]) ? res.json(books[0]) : res.send('no book exists')
        )
      );
    })
    
    //json res format same as .get
    .post(function(req, res){
      MongoClient.connect(MONGO_URI, (err, db) => {
        db.collection('books').findAndModify(
          {_id: new ObjectId(req.params.id)},
          {}, 
          {$push: { comments: req.body.comment }},
          {new: true, upsert: false},
          (err, book) => res.json(book.value)
        );
      });
    })
    
    //if successful response will be 'delete successful'
    .delete(function(req, res){
      MongoClient.connect(MONGO_URI, (err, db) =>
        db.collection('books').findOneAndDelete({_id:new ObjectId(req.params.id)}, (err, book) => res.send("delete successful"))
      );      
    });
  
};
