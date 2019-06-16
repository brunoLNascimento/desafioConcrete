const mongoose = require('mongoose');
const md5 = require('md5');
const User = mongoose.model('User');
const userService = require('../service/user_service')
const uuidv1 = require('uuidv1')
var crypto = require('crypto');

mongoose.set('debug', true);

//falta comentarios
exports.saveUser = function(req, res){
    //userService.findByEmail(req, res)
    var query = { email: req.body.email, active: true }
        
    User.findOne(query, function(err, emailFound){
         if(err){
             return err    
         }else{
            if(emailFound){
                return res.status(309).send({message: "E-mail já existente"})
            }

            var login = new Date()
            var senha = req.body.senha;
            var user_id = uuidv1()
            var senhaCrypted = crypto.createHmac('SHA256', user_id.toString()).update(senha).digest('hex').toString()
            var token = crypto.createHmac('SHA256', user_id.toString()).update(login.toString()).digest('hex').toString()

            var user = new User({
                nome: req.body.nome,
                user_id: user_id,
                email: req.body.email,
                senha: senhaCrypted,
                create_at: login,
                ultimo_login: login,
                token: md5(token),
                telefones: [
                    { 
                        numero: req.body.telefones.numero,
                        ddd: req.body.telefones.ddd
                    }
                ]
            })
                userService.save(user, res)
        }
    })
}

//login OK
exports.login = function(req, res){
    //Caso não tenha token no Header
    if(!req.headers.token){
        return send.status(401).send({message: "Não autorizado"})        
    }

    //Este endpoint irá receber um objeto com e-mail e senha.
    var query = { email: req.body.email, active: true }

    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({message: "Erro ao consultar usuário"})
        }
 
        if(req.headers.token != userFound._doc.token){
            return send.status(401).send({message: "Não autorizado"})
        }

        if(userFound){
            var senha = req.body.senha
            var senhaCripted = crypto.createHmac('SHA256', userFound.user_id.toString()).update(senha).digest('hex').toString()
            //Caso o e-mail exista e a senha seja a mesma que a senha persistida, retornar igual ao endpoint de Sign Up.
            if (userFound._doc.senha == senhaCripted) {
                User.findOneAndUpdate(query, {ultimo_login: new Date()}, function(err, userFound){
                    if(err){
                        return res.status(500).send({message: "Erro ao consultar usuário"})
                    }else{
                        return res.status(200).send({message: "Sign Up"})
                    }
                })
            }else{
                //Caso o e-mail exista mas a senha não bata, retornar o status apropriado 401 mais a mensagem "Usuário e/ou senha inválidos"
                return res.status(401).send({message: "Usuário e/ou senha inválidos"})
            }
        }else{
            //Caso o e-mail não exista, retornar erro com status apropriado mais a mensagem "Usuário e/ou senha inválidos"
           return res.status(401).send({message: "Usuário e/ou senha inválidos"})
        }
    })
}

//falta comentarios
exports.FindUser = function(req, res){
    if(!req.headers.token){
        return send.status(401).send({message: "Não autorizado"})
    }

    var query = { user_id: req.params.id, active: true}

    User.findOne(query, function(err, userFound){
        if(req.headers.token != userFound._doc.token){
            return send.status(401).send({message: "Não autorizado"})
        }

        if(err){
            return res.status(500).send({message: "Ocorreu um erro ao consultar o usuário"})
        }

        if(req.headers.token != userFound._doc.token){
            return send.status(401).send({message: "Não autorizado"})
        }

        if(userFound){
            var ultimoLogin = userFound._doc.ultimo_login
            var dateNow = new Date(), minutos = 30;
            dateNow.setMinutes(dateNow.getMinutes() + minutos);

            if(ultimoLogin < dateNow ){
                return res.status(401).send({message: "Sessão inválida"})
            }else{
                return res.status(200).send({userFound})
            }
        }else{
            return res.status(401).send({message: "Usuário não encontrado"})
        }
    })
}

//falta comentarios
exports.updateUser = function(req, res){
    var query = { user_id: req.body.user_id, active: true }
    
    var queryUpdateUser = {
        data_atualizacao: new Date(),
        telefones: {numero: req.body.telefones.numero,
                        ddd: req.body.telefones.ddd}
    }

    User.findOneAndUpdate(query, queryUpdateUser, function(err, userUpdated){
        if(err){
            return res.status(500).send({message: "Erro ao atualizar usuário"})
        }
        if(!userUpdated){
            //status
            return res.status(500).send({message: "Não foi possível atualizar o usuário"})
        }else{
            User.find(query, function(err, user){
                if(err){
                    return res.status(500).send({message: "Erro ao consultar o usuário atualizado"})
                }else{
                    return res.status(200).send({
                        message: "Usuário atualizado com sucesso",
                        user: user
                        })
                }
            })
        }
    })
}


exports.remove = function(req, res){
    //ajustes no remove
    if(!req.headers.token){
        return send.status(401).send({message: "Não autorizado"})
    }

    var query = { user_id: req.params.id, active: true }
    var queryRemove = { user_id: req.params.id, active: false, data_delete: new Date() }

    User.findOneAndUpdate(query, queryRemove, function(err, userRemoved){
        if(err){
            return res.status(500).send({message: "Ocorreu um erro ao consultar o usuário"})
        }

        if(userRemoved){
            return res.status(200).send({message: "Usuário removido com sucesso!"})
      
        }else{
            return res.status(403).send({message: "Usuário não encontrado"})
        }
    })

}