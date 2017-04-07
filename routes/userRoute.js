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
//     var url = 'mongodb://localhost:27017/findintripoli';
//     mongoose.Promise = global.Promise;
// mongoose.createConnection(url,function(err) {
//       if (err){
//         console.log("there was an error with the connection to the db through mongoose");
// 	console.log(err);
//       }else{
//         console.log("connection was succesful");
//       }
//     });
    


var postRouter = function(passport, jwt, config, User){

router.post('/', function(req, res){
  console.log('inside /api/posts');
    res.json({success: true, msg: 'Successful created new user.'});
});


router.post('/uploadProfileImage', passport.authenticate('jwt', { session: false}), function(req, res) {

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
          var profileImageStorage =   multer.diskStorage({
            destination: function (req, file, callback) {
              callback(null, './uploads/'+decoded._id);
            },
            filename: function (req, file, callback) {
              callback(null, 'profileImage');
            }
          });
          var uploadProfileImage = multer({ storage : profileImageStorage}).single('file');

          //check if dir exists
          var fs = require('fs');
          var dir = './uploads/'+decoded._id;
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }

          uploadProfileImage(req,res,function(err) {
            if(err) {
                return res.end("Error uploading file.");
            }

        console.log("file uploaded succesfully");
          res.json({success: true});

        });



        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});






router.get('/myInfo', function(req, res){
  if(req.isAuthenticated()){

  var userInfo = require('../models/userInfo');
console.log(req.user);
  
  userInfo.findOne({user_id: req.user._id}).exec(function(err, posts) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return done(err);
                    }

                    var path = require('path');
                    var profileImagePath = 'none';
                    if (path.existsSync('.uploads/'+decoded._id+'profileImage')){
                      profileImagePath = '.uploads/'+decoded._id+'profileImage';
                    }
  
    res.render('myPosts', {posts: posts, profileImagePath: profileImagePath});
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




router.post('/addComment', function(req, res){
 if(req.isAuthenticated()){
   var comment = require('../models/comment');
   var newComment = new comment();
   newComment.body = req.body.body;
   newComment.post_id = req.body.post_id;
   newComment.author_id = req.user._id;
   newComment.author_name = req.user.username;

   newComment.date = getDateTime();
 console.log(req.body);
newComment.save(function(err) {
                            if (err){
                                console.log('cannot save comment: '+err);  
                                throw err;  
                            }
                        console.log('comment was saved succesfully');
                       res.redirect('showPost?post_id='+req.body.post_id);
                      
        });


 // var post = require('../models/post');

 //   post.findOne({_id: req.body.post_id}, function(err, the_post) {
 //                    // In case of any error, return using the done method
 //                    if (err){
 //                        console.log('Error with mongodb quote: '+err);
 //                        return done(err);
 //                    }
 //       the_post.comment.push(newComment);

            
 //       });
 }else{
    res.redirect('/users/login?next='+req.originalUrl);
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



router.get('/getMyInfo', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }
                  if (!the_info){
                    the_info = new userInfo();
                    the_info.user_id = decoded._id;
                    the_info.save(function(err) {
                                if (err){
                                    console.log('cannot save th_info: '+err);  
                                    throw err;  
                                }
                            console.log('the_info was saved succesfully');
                      });
                  }

                    //check profile image
                    var profileImagePath = 'none';
                    console.log('the_info '+the_info);

                    var fs = require('fs');
                    fs.stat('uploads/'+decoded._id+'/profileImage', function(err, stat){
                      if (!err){
                          profileImagePath = 'uploads/'+decoded._id+'/profileImage';
                          console.log('file found');
                          res.json({success: true, myInfo: the_info, profileImagePath: profileImagePath});

                      }else{
                        console.log(err);
                        res.json({success: true, myInfo: the_info, profileImagePath: profileImagePath});

                      }
                    });





                 });




        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }

});


router.post('/updateMyAddress', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }

                    the_info.address = req.body.address;
                    the_info.save();
                    res.json({success: true});
               
                 });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});


router.post('/updateMyWorkPlace', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }

                    the_info.workPlace = req.body.workPlace;
                    the_info.save();
                    res.json({success: true});
               
                 });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

router.post('/updateMyEducation', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }

                    the_info.education = req.body.education;
                    the_info.save();
                    res.json({success: true});
               
                 });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});




router.post('/updateMyName', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }

                    the_info.name = req.body.name;
                    console.log('the_info '+the_info+'\n'+'passed name '+req.body.name);
                    the_info.save();
                    res.json({success: true});
               
                 });

        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});




router.post('/updateMyTelephone', function(req, res){

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


                var userInfo = require('../models/userInfo');
                  //var searchVariable = req.param('s');
                    

                  
                  userInfo.findOne({user_id: decoded._id}).exec(function(err, the_info) {
                                    // In case of any error, return using the done method
                                    if (err){
                                        console.log('Error with mongodb quote: '+err);
                                        return done(err);
                                    }

                    the_info.telephone = req.body.telephone;
                    the_info.save();
                    res.json({success: true});
               
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
 
  var post = require('../models/post');
  var post_id = req.query.post_id;
  //var searchVariable = req.param('s');
    console.log("posts");

  
  post.findOne({_id:post_id}).sort({date: -1}).limit(10).exec(function(err, the_post) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error with mongodb quote: '+err);
                        return (err);
                    }
  
    console.log(the_post);
    res.json({success: true, post: the_post});
  });
  

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
