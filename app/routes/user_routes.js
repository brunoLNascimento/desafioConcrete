const user = require('../controllers/user_controllers')

module.exports = function(server) {	
	server.post('/user', user.saveUser)

}