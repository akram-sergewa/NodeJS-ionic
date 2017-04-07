var mongoose = require('mongoose');

module.exports = mongoose.model('userInfo',{
	id: String,
	user_id: String,
	education: String,
	address: String,
	workPlace: String,
	telephone: String,
	name: String
});
