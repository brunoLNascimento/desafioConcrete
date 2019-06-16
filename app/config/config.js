module.exports = {
    db: {
        //url: 'mongodb://localhost:27017/desafioConcrete',
        url: 'mongodb+srv://bruno:bruno123!@desafiocluster-besb7.mongodb.net/test?retryWrites=true&w=majority',
        urlTeste: 'mongodb://localhost:27017/concreteTeste',
        options: {
            server: {
                poolSize: 5,
                auto_reconnect: true
            }
        }
    },

};

