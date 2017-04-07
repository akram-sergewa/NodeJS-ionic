var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');
var mongoose = require('mongoose');
var multer  = require('multer')
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now());
  }
});
var upload = multer({ storage : storage}).single('file');



// Connect to DB
    var url = 'mongodb://localhost:27017/findintripoli';
    mongoose.Promise = global.Promise;
mongoose.createConnection(url,function(err) {
      if (err){
        console.log("there was an error with the connection to the db through mongoose");
	console.log(err);
      }else{
        console.log("connection was succesful");
      }
    });
    


var postRouter = function(passport, jwt, config, User){

router.post('/', function(req, res){
  console.log('inside /api/posts');
    res.json({success: true, msg: 'Successful created new user.'});
});


router.post('/addPost', passport.authenticate('jwt', { session: false}), function(req, res) {


  console.log('add Post')
    var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    console.log(decoded);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          console.log('add new post');
          //add new post
          upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        
        var post = require('../models/post');

        var newPost = new post();

        newPost.body = req.body.body;



        //newPost.date = getDateTime();
        newPost.date = new Date();

        if (req.file){
          newPost.image = req.file.filename;
        }

        
         newPost.author = decoded.name;
         newPost.author_id = decoded._id;

        newPost.save(function(err) {
                                if (err){
                                    console.log('cannot save post: '+err);  
                                    throw err;  
                                }
                            console.log('post was saved succesfully');
            });

            res.redirect('posts/showPosts');
        });



        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});






router.get('/myPosts', function(req, res){
  if(req.isAuthenticated()){

  var post = require('../models/post');
console.log(req.user);
  
  post.find({author_id: req.user._id}).sort({date: -1}).limit(10).exec(function(err, posts) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }
  
    res.render('myPosts', {posts: posts});
  });
  
}else{
  res.redirect('/users/login');
}
  });



router.post('/myPosts', function(req, res){
   if(req.isAuthenticated()){

 var post = require('../models/post');
 var page = req.body.page_no;
  console.log(page);
    
    post.find({author_id: req.user._id}).sort({date: -1}).exec(function(err, posts) {
                      // In case of any error, return using the done method
                      if (err){
                          console.log('Error with mongodb quote: '+err);
                          return done(err);
                      }
      var sendData = [];
      for (var i = ((page-1)*10)-1; i<(page*10)-1 && i<posts.length;i++){
              console.log(i);

        sendData.push(posts[i]);
      }
      res.json(sendData);
    });
    
  }

  });

router.post('/deleteComment', function(req, res){

var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {


          var comment = require('../models/comment');
          var comment_id = req.body.comment_id;
          comment.findOne({_id: comment_id}, function (err, the_comment){
            if (err){
              conmsole.log("Error at finding the comment to delete "+err);
              res.json({success: false});
              return;
            }

              if (user._id != the_comment.author_id){
                console.log('the user doesnt own the comment');
                res.json({success: false});
                return;
              }



            the_comment.remove(function(err){
              if (err){
                console.log('error at removing the the comment '+err);
                res.json({success: false});
              }
              console.log('the comment was removed');
              res.json({success: true});

            })
          });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

});



router.post('/deletePost', function(req, res){

var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {

          var post = require('../models/post');
          var post_id = req.body.post_id;
          console.log('find post');
          post.findOne({_id: post_id}, function(err, the_post) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }

                    console.log('check if the user is the composer of the post');
                      if (the_post.author_id == decoded._id){
                      console.log('remove the post');
                      the_post.remove(function(err) {
                        if (!err) {
                            //remove comments as well
                            console.log('find comments');
                          var comment = require('../models/comment');
                            comment.find({post_id: post_id}, function(err, the_comments) {
                            // In case of any error, return using the done method
                            if (err){
                                console.log('Error with mongodb quote: '+err);
                                return done(err);
                            }
                            console.log('remove comments');
                            for (var i = 0; i<the_comments.length; i++){
                              the_comments[i].remove(function(err) {
                                if (!err) {
                                  console.log("one comment was deleted");
                                  if (i==the_comments.length-1)
                                          res.json({success: true});
                                }
                                else {
                                          res.json({success: false});
                                }
                             });
                            }
                              
                          });

                         
                        }
                        else {
                                  res.json({success: false});
                        }
                     });
                    }else{
                      res.json({success: false});
                    }
                });
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

});


router.post('/addComment', function(req, res){

var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {



           var comment = require('../models/comment');
             var newComment = new comment();
             newComment.body = req.body.comment;
             newComment.post_id = req.body.post_id;
             newComment.author_id = decoded._id;
             newComment.author =decoded.name;

             newComment.date = new Date();
             console.log(newComment);
           
          newComment.save(function(err) {
                                      if (err){
                                          console.log('cannot save comment: '+err);  
                                          throw err;  
                                          res.json({success: false});
                                      }
                                  console.log('comment was saved succesfully');
                                  res.json({success: true});
                                 
                                
                  });


        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }




});

router.get('/showPost', function(req, res){
 
 var post_id = req.query.post_id;

  var post = require('../models/post');
  var comment = require('../models/comment')
  var user = require('../models/user');
  //var searchVariable = req.param('s');


  
  post.findOne({_id: post_id}, function(err, posts) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }

       comment.find({post_id: post_id}, function(err, comments) {
                        // In case of any error, return using the done method
                        if (err){
                            console.log('Error with mongodb quote: '+err);
                            return done(err);
                        }

            //get author information through author_id
            var commentsToPass = {};

           



            if (comments.length > 0){
              var i = 0;
               //takes commentsToPass and fill it with the names of authors
              function getAuthor(){
                var user = require('../models/user');
                  user.findOne({_id: comments[i].author_id}, function(err, author) {
                                          // In case of any error, return using the done method
                                if (err){
                                    console.log('Error with mongodb quote: '+err);
                                    return done(err);
                                }
                                commentsToPass[i]={author:author.name, body:comments[i].body, date:comments[i].date};
                                i++;
                                if (i < comments.length){
                                    getAuthor(req, res, commentsToPass, comments, posts, i);
                                } else{
                                   console.log(commentsToPass);
                                   res.render('showPost', {post:posts, comments:commentsToPass});
                                }       

                      });
                }

              getAuthor(req, res, commentsToPass, comments, posts, i);
            }else{
              console.log('comments.length =< 0, therefore render showPost without comments');
              res.render('showPost', {post:posts});
            }
           

            
       });
   });
  

  });



router.get('/getMyPosts', function(req, res){

  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {


                var post = require('../models/post');
                  //var searchVariable = req.param('s');
                    console.log("posts");

                  
                  post.find({author: decoded.name}).sort({date: -1}).exec(function(err, posts) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }
                  

                                    var post_c = 0;
                                    var comments_per_post = [];
                                    
                                 var find_comments_per_post = function (callback){
                                    if (post_c >= posts.length){

                                      console.log('find_comments_per_post is finished');
                                      callback();
                                      return;
                                    }
                                    var comment = require('../models/comment');
                                    comment.find({post_id: posts[post_c]._id}).exec(function(err, the_comments) {
                                                    // In case of any error, return using the done method
                                                    if (err){
                                                        console.log('Error with mongodb quote: '+err);
                                                        return (err);
                                                    }
                                                    var comments_count = the_comments.length;
                                                comments_per_post.push(comments_count);

                                                post_c+=1;
                                                find_comments_per_post(callback);
                                     })
                                   }


                                    
                                    find_comments_per_post(function(){
                                       toSendPosts = [];
                                         var pageNumber = req.query.pageNumber;

                                        for (var i = ((pageNumber-1)*3); i<posts.length && i<(pageNumber*3); i++){
                                          console.log("comments_per_post "+i+" "+comments_per_post[i]);
                                            toSendPosts.push(postDateConverter(posts[i], comments_per_post[i]));
                                          }
                                        
                                        console.log("toSendPosts "+toSendPosts);


                                        //console.log(toSendPosts);
                                        if (pageNumber*3>=posts.length){

                                           res.json({success: true, posts: toSendPosts, endOfPosts:true});

                                        }else{
                                          for (var i = 0; i<toSendPosts.length ; i++){
                                            console.log(toSendPosts[i]);
                                          }

                                            res.json({success: true, posts: toSendPosts, endOfPosts:false});
                                        }
                                    });
                                    


                 });




        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }


 
  
  

  });

router.get('/getLatestPosts', function(req, res){

  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {


                var post = require('../models/post');
                  //var searchVariable = req.param('s');
                    console.log("posts");

                  
                  post.find({}).sort({date: -1}).exec(function(err, posts) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }
                  

                                    var post_c = 0;
                                    var comments_per_post = [];
                                    
                                 var find_comments_per_post = function (callback){
                                    if (post_c >= posts.length){

                                      console.log('find_comments_per_post is finished');
                                      callback();
                                      return;
                                    }
                                    var comment = require('../models/comment');
                                    comment.find({post_id: posts[post_c]._id}).exec(function(err, the_comments) {
                                                    // In case of any error, return using the done method
                                                    if (err){
                                                        console.log('Error with mongodb quote: '+err);
                                                        return (err);
                                                    }
                                                    var comments_count = the_comments.length;
                                                comments_per_post.push(comments_count);

                                                post_c+=1;
                                                find_comments_per_post(callback);
                                     })
                                   }


                                    
                                    find_comments_per_post(function(){
                                       toSendPosts = [];
                                         var pageNumber = req.query.pageNumber;

                                        for (var i = ((pageNumber-1)*3); i<posts.length && i<(pageNumber*3); i++){
                                          console.log("comments_per_post "+i+" "+comments_per_post[i]);
                                            toSendPosts.push(postDateConverter(posts[i], comments_per_post[i]));
                                          }
                                        
                                        console.log("toSendPosts "+toSendPosts);


                                        //console.log(toSendPosts);
                                        if (pageNumber*3>=posts.length){

                                           res.json({success: true, posts: toSendPosts, endOfPosts:true});

                                        }else{
                                          for (var i = 0; i<toSendPosts.length ; i++){
                                            console.log(toSendPosts[i]);
                                          }

                                            res.json({success: true, posts: toSendPosts, endOfPosts:false});
                                        }
                                    });
                                    


                 });




        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }


 
  
  

  });

router.get('/getPosts', function(req, res){
 
  var post = require('../models/post');
  //var searchVariable = req.param('s');
    console.log("posts");

  
  post.find({}).sort({date: -1}).limit(10).exec(function(err, posts) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }
  
    console.log(posts);
    res.json({success: true, posts: posts});
  });
  

  });

router.get('/getPost', function(req, res){


   var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {


              var post = require('../models/post');
              var comment = require('../models/comment')
              var post_id = req.query.post_id;
              //var searchVariable = req.param('s');
                console.log("posts");

              
              post.findOne({_id:post_id}).sort({date: -1}).limit(10).exec(function(err, the_post) {
                                // In case of any error, return using the done method
                                if (err){
                                    console.log('Error with mongodb quote: '+err);
                                    return (err);
                                }
              
                comment.find({post_id:the_post._id}).sort({date: -1}).exec(function(err, the_comments){
                  if (err){
                    console.log('Error with mongodv quote '+err);
                    return (err);
                  } 

                  res.json({seccess: true, post: postDateConverter(the_post), comments: commentsDateConverter(the_comments, decoded._id)})
                })
                // res.json({success: true, post: the_post});
              });


        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

 

  

  });



router.get('/showPosts', function(req, res){
 
 // mongoose.connect(url,function(err) {
 //      if (err){
 //        console.log("there was an error with the connection to the db through mongoose");
 //      }else{
 //        console.log("connection was succesful");
 //      }
 //    });

  var post = require('../models/post');
  //var searchVariable = req.param('s');

  
  post.find({}).sort({date: -1}).limit(10).exec(function(err, posts) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }
  
    res.render('showPosts', {posts: posts});
  });
  

  });



router.post('/showPosts', function(req, res){
 
 var post = require('../models/post');
 var page = req.body.page_no;
  console.log(page);
    
    post.find({}).sort({date: -1}).exec(function(err, posts) {
                      // In case of any error, return using the done method
                      if (err){
                          console.log('Error with mongodb quote: '+err);
                          return done(err);
                      }
      var sendData = [];
      for (var i = ((page-1)*10)-1; i<(page*10)-1 && i<posts.length;i++){
              console.log(i);

        sendData.push(posts[i]);
      }
      res.json(sendData);
    });
    
  

  });





  // function searchPost(req, res){
  // var post = require('../models/post');
  // var searchVariable = req.param('s');
  // post.find({'$or' : [ {'body' : {'$regex' : searchVariable }} ]} , function(err, blog) {
  //                   // In case of any error, return using the done method
  //                   if (err){
  //                       console.log('Error with mongodb quote: '+err);
  //                       return done(err);
  //                   }
  // console.log(post);
  // res.contentType('application/json');
  //   res.send(JSON.stringify(JSON.stringify(post)));
  // })
  // };


function postDateConverter (post, comments_count){
  var newPost = {};
  newPost._id = post._id;
  newPost.author = post.author;
  newPost.author_id = post.author_id;
  newPost.body = post.body;
  newPost.date = 'منذ ' + convertMS(new Date() - new Date(post.date));
  newPost.image = post.image;
  newPost.comments_count = comments_count;
  return newPost;
}

function postsDateConverter (posts){
  var newPosts = [];
  for (var i = 0; i<posts.length; i++){
    var newPost = {};
    newPost._id = posts[i]._id;
    newPost.author = posts[i].author;
    newPost.author_id = posts[i].author_id;
    newPost.body = posts[i].body;
    newPost.date = 'منذ ' + convertMS(new Date() - new Date(posts[i].date));
    newPost.image = posts[i].image;
    newPost.comments_count = posts[i].comments_count;
    newPosts.push(newPost);
  }
  
  return newPosts;
}


function commentsDateConverter (comments, user_id){
  var newComments = [];
  for (var i = 0; i<comments.length; i++){
    var newComment = {};
    newComment.post_id = comments[i].post_id;
    newComment._id = comments[i]._id;
    newComment.author = comments[i].author;
    newComment.author_id = comments[i].author_id;
    newComment.body = comments[i].body;
    newComment.date = 'منذ ' + convertMS(new Date() - new Date(comments[i].date));
    newComment.removable = false;
    console.log(newComment.author_id +' '+ user_id);
    if (newComment.author_id == user_id){
        newComment.removable = true;
    }
    newComments.push(newComment);
  }
  
  return newComments;
}



function getDateTime() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;


     var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;



    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + "-" + month + "-" + day + "T" + hour + ":" + min + ":" + sec;
}

function convertMS(ms) {
      var d, h, m, s;
      s = Math.floor(ms / 1000);
      m = Math.floor(s / 60);
      s = s % 60;
      h = Math.floor(m / 60);
      m = m % 60;
      d = Math.floor(h / 24);
      h = h % 24;

      if (h == 0){
        return m + "دقيقة";
      }else if (m == 0){
        return h + 'ساعة ' + m + "دقيقة";
      }else{
        return d + 'يوم ' + h + 'ساعة ' + m + "دقيقة";
      }
};

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    //req.flash('error_msg','You are not logged in');
    res.redirect('/users/login');
  }
}

return router;
}

module.exports = postRouter;
