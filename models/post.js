var mongoose = require('mongoose');
var comment = require('./comment');

module.exports = mongoose.model('post',{
	id: String,
	body: String,
	date: String,
	image: String,
	author: String,
	author_id: String
});
