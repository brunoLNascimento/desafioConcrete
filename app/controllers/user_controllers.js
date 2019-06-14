const mongoose = require('mongoose');
const md5 = require('md5');
const User = mongoose.model('User');
const userService = require('../service/user_service')
const uuidv1 = require('uuidv1')
var crypto = require('crypto');

let jwt = require('jsonwebtoken');
mongoose.set('debug', true);

exports.saveUser = function(req, res){
   
/*  
    ·· data_atualizacao: data da última atualização do usuário
    ·· ultimo_login: data do último login (no caso da criação, será a mesma que a criação)
    ·· token: token de acesso da API (pode ser um GUID ou um JWT)
    · O token deverá ser persistido junto com o usuário
*/
    //userService.findByEmail(req, res)
    var query = { email: req.body.email, active: true }
        
    User.findOne(query, function(err, emailFound){
         if(err){
             return err    
         }else{
//             return emailFound
             if(emailFound){
                  return res.status(309).send({message: "E-mail já existente"})
              }

              var login = new Date()
              var senha = req.body.senha;
              var user_id = uuidv1()
              var senhaCrypted = crypto.createHmac('SHA256', user_id.toString()).update(senha).digest('hex').toString()
          
              
              var token = crypto.createHmac('SHA256', user_id.toString()).update(req.body.email).digest('hex').toString()

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

exports.login = function(req, res){
    if(!req.headers.token){
        return send.status(401).send({message: "Não autorizado"})        
    }

    var query = { email: req.body.email, active: true }

    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({message: "Erro ao consultar usuário"})
        }
        //mudar a mensagem e enviar o timer q ele pode tentar novamente

        if(req.headers.token != userFound._doc.token){
            
        }

        if(userFound._doc.user_flags.bloqueado == true){
           return res.status(500).send({message: "Usuário bloqueado, tente novamente mais tarde"})
        }
        
        if(userFound){
            var senha = req.body.senha
            var senhaCripted = crypto.createHmac('SHA256', userFound.user_id.toString()).update(senha).digest('hex').toString()
            if (userFound._doc.senha == senhaCripted) {
                return res.status(200).send({message: "Sign Up"})
            }else{
                //bloquear usuario na 3 tentativa de acesso
               if(userFound._doc.user_flags.tentativasLogin){
                   if(userFound._doc.user_flags.tentativas < 2){
                       var tentativas = userFound._doc.user_flags.tentativas + 1
                       var blocked = false
                       var tentativasLogin  = userFound._doc.user_flags.tentativasLogin
                   }else{
                       var blocked = true
                       var tentativas = userFound._doc.user_flags.tentativas + 1
                       var tentativasLogin  = userFound._doc.user_flags.tentativasLogin
                   }
               }else{
                   var tentativasLogin = new Date()
                   var tentativas = 1
                   var blocked = false
               }

               var queryUpdate = {
                   'user_flags.tentativasLogin' : tentativasLogin,
                   'user_flags.tentativas': tentativas,
                   'user_flags.bloqueado': blocked
               }

               User.findOneAndUpdate(query, queryUpdate, function(err, userUpdated){
                   if(err){
                       return res.status(500).send({message: "Erro ao consultar usuário"})
                   }else{
                       if(tentativas == 3){
                           return res.status(401).send({message: "Tentativas exedeu o limite, tente novamente daqui a 5 minutos"})
                       }else{
                           return res.status(401).send({message: "Usuário e/ou senha inválidos"})
                       }
                   }
               })
           }
        }else{
           return res.status(201).send({message: "Usuário e/ou senha inválidos"})
           }
       })
}

exports.FindUser = function(req, res){
/*Buscar usuário
· Chamadas para este endpoint devem conter um header na requisição de Authentication com o valor "Bearer {token}" onde {token} é o valor do token passado na criação ou sign in de um usuário.
· Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".
· Caso o token exista, buscar o usuário pelo user_id passado no path e comparar se o token no modelo é igual ao token passado no header.
· Caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"
· Caso seja o mesmo token, verificar se o último login foi a MENOS que 30 minutos atrás.
· Caso não seja a MENOS que 30 minutos atrás, retornar erro com status apropriado com mensagem "Sessão inválida".
· Caso tudo esteja ok, retornar o usuário.*/

    if(!req.headers.token){
        return send.status(401).send({message: "Não autorizado"})
    }

    var query = { user_id: req.params.id}

    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({message: "Ocorreu um erro ao consultar o usuário"})
        }
        
        if(req.headers.token != userFound._doc.token){
            return send.status(401).send({message: "Não autorizado"})
        }
        if(userFound){
            return res.status(200).send({userFound})
        }else{
            return res.status(401).send({message: "Usuário não encontrado"})
        }
        
    })

}


exports.updateUser = function(req, res){
    var query = { email: req.body.email, active: true }
    
    var queryUpdateUser = {
        data_atualizacao: new Date(),
        'telefones.numero': req.body.telefones.numero,
        'telefones.ddd': req.body.telefones.ddd
    }

    User.findOneAndUpdate(query, queryUpdateUser, function(err, userUpdated){
        if(err){
            return res.status(500).send({message: "Erro ao atualizar o usuário"})
        }else{
            return res.status(200).send({
                message: "Usuário atualizado com sucesso",
                user: userUpdated
            })
        }
    })
}


