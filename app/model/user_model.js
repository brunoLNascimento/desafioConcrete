const mongoose = require('mongoose'),
    Schema = mongoose.Schema


var user = new Schema({
    nome: { type: String },
    email:  { type: String, require},
    senha:  { type: String },
    user_id: { type: String },
    create_at: { type: Date },
    update_at: { type: Date },
    lastLogin: { type: Date },
    telefones: [
        { 
            numero:  { type: String },
            ddd:  { type: String }
      }
    ],
    active: { type: Boolean, default: true},
    user_flags: {
        tentativasLogin: { type: Date },
        bloqueado: { type: Boolean, default: false },
        tentativas: { type: Number }, //3 Tentativas, na quarta usuário é bloqueado
    }
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


