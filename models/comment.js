var mongoose = require('mongoose');

module.exports = mongoose.model('comment',{
	id: String,
	body: String,
	date: String,
	author_id: String,
	author: String,
	post_id: String
});
