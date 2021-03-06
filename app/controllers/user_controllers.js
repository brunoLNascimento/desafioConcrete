const mongoose = require('mongoose');
const md5 = require('md5');
const User = mongoose.model('User');
const moment = require('moment-timezone');
const uuidv1 = require('uuidv1')
var crypto = require('crypto');
mongoose.set('debug', true);

exports.saveUser = function(req, res){
    //query para consultar email
    //OBS: active = true para usuários ativos e active = false para usuários "excluídos"
    var query = { email: req.body.email, active: true }
        
    User.findOne(query, function(err, emailFound){
         if(err){
             return res.status(500).send({mensagem: "Erro ao consular email"})    
         }else{
            if(emailFound){
                return res.status(309).send({mensagem: "E-mail já existente"})
            }
            
            //Verificação se o usuário informou a senha, email, ddd e telefone, sendo Email e Senha obrigatórios
            if(!req.body.senha){
                return res.status(401).send({mensagem: "Senha é obrigatório"})
            }

            if(!req.body.email){
                return res.status(401).send({mensagem: "E-mail é obrigatório"})
            }
            
            if(!req.body.telefones){
                return res.status(401).send({mensagem: "Telefone e DDD são obrigatórios"})
            }else if(!req.body.telefones.ddd){
                return res.status(401).send({mensagem: "DDD é obrigatório"})
            }else if(!req.body.telefones.numero){
                return res.status(401).send({mensagem: "Telefone é obrigatório"})
            }
            
            //cria criptografia da senha e do TOKEN
            var login = moment().tz("America/Sao_Paulo").format();
            var senha = req.body.senha;
            var user_id = uuidv1()
            var senhaCrypted = crypto.createHmac('SHA256', user_id.toString()).update(senha).digest('hex').toString()
            var token = crypto.createHmac('SHA256', user_id.toString()).update(senhaCrypted.toString()).digest('hex').toString()
            
            //Carrega dados para salvar no banco
            var user = new User({
                nome: req.body.nome,
                user_id: user_id,
                email: req.body.email,
                senha: senhaCrypted,
                data_criacao: login,
                ultimo_login: login,
                token: md5(token),
                telefones: [
                    { 
                        numero: req.body.telefones.numero,
                        ddd: req.body.telefones.ddd
                    }
                ]
            })
      
            user.save({_id:0}, function(err, userSaved ) {
                if(err){
                    if(err.errors.email){
                        return res.status(400).send({
                            mensagem: "E-mail inválido!"
                        })
                    }else{
                        return res.status(500).send({
                            mensagem: "Erro ao salavar usuário!"
                        })
                    }
                }
                if(userSaved){
                    return res.status(200).send({
                        mensagem: "usuário salvo com sucesso!",
                        response: userSaved
                    })
                }else{
                    return res.status(500).send({
                        mensagem: "Algo deu errado!",
                    })
                }
            })
        }
    })
}

exports.login = function(req, res){
    //Caso não tenha token no Header
    if(!req.headers.token){
        return res.status(401).send({mensagem: "Não autorizado"})        
    }

    //Este endpoint irá receber um objeto com e-mail e senha.
    var query = { email: req.body.email, active: true }

    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({mensagem: "Erro ao consultar usuário"})
        }
 
        if(!userFound){
            return res.status(400).send({mensagem: "Não encontrado"})
        }

        if(req.headers.token != userFound._doc.token){
            return res.status(401).send({mensagem: "Não autorizado"})
        }

        if(userFound){
            var senha = req.body.senha
            var senhaCripted = crypto.createHmac('SHA256', userFound.user_id.toString()).update(senha).digest('hex').toString()
            //Caso o e-mail exista e a senha seja a mesma que a senha persistida, retornar igual ao endpoint de Sign Up.
            if (userFound._doc.senha == senhaCripted) {
                var queryUpdate = { ultimo_login: moment().tz("America/Sao_Paulo").format()}
                User.findOneAndUpdate(query, queryUpdate, function(err, userFound){
                    if(err){
                        return res.status(500).send({mensagem: "Erro ao consultar usuário"})
                    }else{
                        return res.status(200).send({mensagem: "Sign Up"})
                    }
                })
            }else{
                //Caso o e-mail exista mas a senha não bata, retornar o status apropriado 401 mais a mensagem "Usuário e/ou senha inválidos"
                return res.status(401).send({mensagem: "Usuário e/ou senha inválidos"})
            }
        }else{
            //Caso o e-mail não exista, retornar erro com status apropriado mais a mensagem "Usuário e/ou senha inválidos"
           return res.status(401).send({mensagem: "Usuário e/ou senha inválidos"})
        }
    })
}

exports.FindUser = function(req, res){
    /*
    Header na requisição de Authentication com o valor "Bearer {token}" onde {token}
    é o valor do token passado na criação ou sign in de um usuário.
    */

    //Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".
    if(!req.headers.token){
        return res.status(401).send({mensagem: "Não autorizado"})
    }

    var query = { user_id: req.params.id, active: true}

    //Caso o token exista, buscar o usuário pelo user_id passado no path 
    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({mensagem: "Ocorreu um erro ao consultar o usuário"})
        }

        //
        if(!userFound){
            return res.status(400).send({mensagem: "Favor verificar o ID do usuário"})
        }
        /* E comparar se o token no modelo é igual ao token passado no header
        caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"
        */
        if(req.headers.token != userFound._doc.token){
            return res.status(401).send({mensagem: "Não autorizado"})
        }

        if(userFound){
            //Caso seja o mesmo token, verificar se o último login foi a MENOS que 30 minutos atrás.
            var lastLogin = userFound._doc.ultimo_login, minutos = 30;
            lastLogin.setMinutes(lastLogin.getMinutes() + minutos);
            var dateNow = new Date()

            /*var dateNow = moment().tz("America/Sao_Paulo"), minutos = 30;
            dateNow.setMinutes(dateNow.getMinutes() + minutos);*/

            //Caso não seja a MENOS que 30 minutos atrás, retornar erro com status apropriado com mensagem "Sessão inválida".
            if(dateNow < lastLogin){
                return res.status(401).send({mensagem: "Sessão inválida"})
            }else{
                //Caso tudo esteja ok, retornar o usuário.
                return res.status(200).send({userFound})
            }
        }else{
            return res.status(400).send({mensagem: "Usuário não encontrado"})
        }
    })
}

exports.updateUser = function(req, res){
    //Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".
    if(!req.headers.token){
        return res.status(401).send({mensagem: "Não autorizado"})
    }

    if(!req.body.user_id){
        return res.status(400).send({mensagem: "Id do usuário é obrigatório"})
    }
    
    //Consula ID do usuário para atualização
    var query = { user_id: req.body.user_id, active: true }
    
    //carrega query para atualizar banco, alterações apenas nos itens Telefone e DDD
    var queryUpdateUser = {
        data_atualizacao: moment().tz("America/Sao_Paulo").format(),
        $push: 
            {
                telefones: [
                    {
                        numero: req.body.telefones.numero,
                        ddd: req.body.telefones.ddd
                    }
                ]
            }
    }
    
    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({mensagem: "Ocorreu um erro ao consultar o usuário"})
        }

        /* E comparar se o token no modelo é igual ao token passado no header
        caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"
        */
        if(req.headers.token != userFound._doc.token){
            return res.status(401).send({mensagem: "Não autorizado"})
        }else{
            //Procura e atualiza um usuário
            User.findOneAndUpdate(query, queryUpdateUser, function(err, userUpdated){
                if(err){
                    return res.status(500).send({mensagem: "Erro ao atualizar usuário"})
                }
                if(!userUpdated){
                    //status
                    return res.status(403).send({mensagem: "Não foi possível atualizar o usuário"})
                }else{
                    return res.status(200).send({
                        mensagem: "Usuário atualizado com sucesso",
                    })
                }
            })
        }
    })
}

exports.remove = function(req, res){
    //Caso o token não exista, retornar erro com status apropriado com a mensagem "Não autorizado".
    if(!req.headers.token){
        return res.status(401).send({mensagem: "Não autorizado"})
    }

    //query = query para consulta usuário
    var query = { user_id: req.params.id, active: true }

    //queryRemove = query para atualizar os dados e mudar o active para false
    //OBS: a exclusão do dado é lógica,

    User.findOne(query, function(err, userFound){
        if(err){
            return res.status(500).send({mensagem: "Ocorreu um erro ao consultar o usuário"})
        }

        /* E comparar se o token no modelo é igual ao token passado no header
        caso não seja o mesmo token, retornar erro com status apropriado e mensagem "Não autorizado"
        */
        if(req.headers.token != userFound._doc.token){
            return res.status(401).send({mensagem: "Não autorizado"})
        }else{
            var queryRemove = { user_id: req.params.id, active: false, data_delete: moment().tz("America/Sao_Paulo").format()}

            User.findOneAndUpdate(query, queryRemove, function(err, userRemoved){
                if(err){
                    return res.status(500).send({mensagem: "Ocorreu um erro ao consultar o usuário"})
                }

                if(userRemoved){
                    return res.status(200).send({mensagem: "Usuário removido com sucesso!"})
                }else{
                    return res.status(403).send({mensagem: "Usuário não encontrado"})
                }
            })
        }
    })
}
