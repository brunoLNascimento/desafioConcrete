module.exports = {
    db: {
        url: 'mongodb://localhost:27017/desafioConcrete',
        urlTeste: 'mongodb://localhost:27017/concreteTeste',
        options: {
            server: {
                poolSize: 5,
                auto_reconnect: true
            }
        }
    },

};