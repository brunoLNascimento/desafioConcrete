const mongoose = require('mongoose');
const User = mongoose.model('User');
const userService = require('../service/user_service')
const uuidv1 = require('uuidv1')
var crypto = require('crypto');
mongoose.set('debug', true);

exports.saveUser = function(req, res){
   

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

              var senha = req.body.senha;
              var user_id = uuidv1()
              var senhaCrypted = crypto.createHmac('SHA256', user_id.toString()).update(senha).digest('hex').toString()
          
              var user = new User({
                  nome: req.body.nome,
                  user_id: user_id,
                  email: req.body.email,
                  senha: senhaCrypted,
                  create_at: new Date(),
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

exports.FindUser = function(req, res){


}

exports.updateUser = function(req, res){
    var query = { email: req.body.email, active: true }
    
            
    User.findOne(query, function(err, userFound){
         if(err){
             return res.status(500).send({message: "Erro ao consultar usuário"})
         }

         if(userFound._doc.user_flags.bloqueado == true){
            return res.status(500).send({message: "Usuário bloqueado, tente novamente mais tarde"})
         }
         
         if(userFound){
             var senha = req.body.senha
             var senhaCripted = crypto.createHmac('SHA256', userFound.user_id.toString()).update(senha).digest('hex').toString()
             if (userFound._doc.senha == senhaCripted) {
                //atualiza usuario


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
                    }
                    if(!userUpdated){
                        return res.status(201).send({message: "Nenhum usuáro encontrado"})
                    }else{
                        if(tentativas == 3){
                            return res.status(201).send({message: "Usuário Bloqueado, tente novamente daqui a 5 minutos"})
                        }else{
                            return res.status(201).send({message: "Você tentou: " +tentativas+ ", na 3 tentativa você será bloqueado temporariamente"})
                        }
                    }
                })
            }
         }else{
            return res.status(201).send({message: "Nenhum usuáro encontrado"})
            }
        })

}
//data_atualizacao: data da última atualização do usuário

/*Buscar usuário

· Chamadas para este endpoint devem conter um header na requisição de Authentication com o valor "Bearer {token}" onde {token} é o valor do token passado na criação ou sign in de um usuário.

· Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".

· Caso o token exista, buscar o usuário pelo user_id passado no path e comparar se o token no modelo é igual ao token passado no header.

· Caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"

· Caso seja o mesmo token, verificar se o último login foi a MENOS que 30 minutos atrás.

· Caso não seja a MENOS que 30 minutos atrás, retornar erro com status apropriado com mensagem "Sessão inválida".

· Caso tudo esteja ok, retornar o usuário.*/
