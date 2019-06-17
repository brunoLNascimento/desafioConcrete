
const mongoose = require('mongoose');
const User = mongoose.model('User');
var async = require("async");

class UserService {
    findByEmail(req){
        var query = { email: req.body.email, active: true }
        
       User.findOne(query, function(err, emailFound){
            if(err){
                return err    
            }else{
                return emailFound
            }
        })
    }

    save(user, res){
    user.save({_id:0}, function(err, userSaved ) {
            if(err){
                return res.status(500).send({
                    mensagem: "Erro ao salavar usuário!"
                })
            }
            if(userSaved){
                return res.status(200).send({
                    mensagem: "usuário salvo com sucesso!",
                    response: userSaved
                })
            }else{
                return res.status(201).send({
                    mensagem: "Algo deu errado!",
                })
            }
        })
    }
}

module.exports = new UserService();