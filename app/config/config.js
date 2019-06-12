module.exports = {
    db: {
        url: 'mongodb://localhost:27017/desafioConcrete',
        options: {
            server: {
                poolSize: 5,
                auto_reconnect: true
            }
        }
    },

};