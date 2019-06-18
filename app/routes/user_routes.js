const user = require('../controllers/user_controllers')

module.exports = function(server) {	
	//Rota para salvar usuario
	server.post('/user', user.saveUser)
	
	//Rota para atualizar usuario
	server.put('/updateUser', user.updateUser)
	
	//Rota para fazer login
	server.post('/login', user.login)

	//Rota para buscar usuario
	server.get('/findUser/:id', user.FindUser)

	//Rota para excluir usuario
	server.delete('/removeUser/:id', user.remove)

}