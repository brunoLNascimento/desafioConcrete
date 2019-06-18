const mongoose = require('mongoose'),
    Schema = mongoose.Schema
require('mongoose-type-email');


var user = new Schema({
    nome: { type: String },
    email:  { type: mongoose.SchemaTypes.Email, lowercase: true },
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


