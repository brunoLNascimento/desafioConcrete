
exports.save = function(user, res){
   user.save({_id:0}, function(err, userSaved ) {
        if(err){
            return res.status(500).send({
                message: "Erro ao salavar usuário!"
            })
        }
        if(userSaved){
            return res.status(200).send({
                message: "usuário salvo com sucesso!",
                response: userSaved
            })
        }else{
            return res.status(201).send({
                message: "Algo deu errado!",
            })
        }
    })
}