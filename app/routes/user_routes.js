const user = require('../controllers/user_controllers')

module.exports = function(server) {	
	server.post('/user', user.saveUser)
	server.put('/updateUser', user.updateUser)
	server.post('/login', user.login)
	server.get('/FindUser/:id', user.FindUser)

}