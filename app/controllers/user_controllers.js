const mongoose = require('mongoose');
const User = mongoose.model('User');
const userService = require('../service/user_service')
const uuidv1 = require('uuidv1')


exports.saveUser = function(req, res){
    
    var user = new User({
        nome:  req.body.nome,
        user_id: uuidv1(),
        email:   req.body.email,
        senha:   req.body.senha,
        telefones: [
            { 
                numero:   req.body.telefones.numero,
                ddd:   req.body.telefones.ddd
            }
        ]
    })

    userService.save(user, res)
  

}