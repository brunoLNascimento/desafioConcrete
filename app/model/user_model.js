const mongoose = require('mongoose'),
    Schema = mongoose.Schema


var user = new Schema({
    nome: { type: String },
    email:  { type: String, require},
    token: { type: String },
    senha:  { type: String },
    user_id: { type: String },
    data_criacao: { type: Date },
    data_atualizacao: { type: Date },
    ultimo_login:  { type: Date },
    lastLogin: { type: Date },
    data_delete: { type: Date },
    telefones: [
        { 
            numero:  { type: String },
            ddd:  { type: String }
      }
    ],
    active: { type: Boolean, default: true},
},{
    collection: user
})

user.set('toJSON', {
    getters: true,
    virtuals: true
})
user.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj._id;
    return obj;
   }
mongoose.model('User', user);


