const mongoose = require('mongoose'),
    Schema = mongoose.Schema


var user = new Schema({
    nome: { type: String },
    email:  { type: String },
    senha:  { type: String },
    user_id: { type: String },
    telefones: [
        { 
            numero:  { type: String },
            ddd:  { type: String }
      }
    ],
    active: { type: Boolean, default: true}
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


