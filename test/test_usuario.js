const mongoose = require('mongoose');
const md5 = require('md5');
const app = require('../app')
const User = mongoose.model('User');
const moment = require('moment-timezone');
const uuidv1 = require('uuidv1')
var crypto = require('crypto');
const request = require('supertest')
var jwt = require('jsonwebtoken');
mongoose.set('debug', true);
const config = require('../app/config/config')



var senha = "123456";
var user_id = uuidv1()
var senhaCrypted = crypto.createHmac('SHA256', user_id.toString()).update(senha).digest('hex').toString()
var token = crypto.createHmac('SHA256', user_id.toString()).update(senhaCrypted.toString()).digest('hex').toString()

var login = new Date(), minutos = 180;
login.setMinutes(login.getMinutes() - minutos);

var usuario1 = new User({
    teste: true,
    nome: "teste1",
    email: "aaa@jfaancom",
    data_criacao: login,
    ultimo_login: login,
    user_id: '1407b4a0-9055-11e9-88e5-b288c6fd9154',
    senha: "2d4489d8190804d8bc4f0f4a472e024bcc500c1a7697cf3c406b2444f89ecd96",
    token: "301e36da35e4c0af8b7a012692716ebfc6c881ceb2c1072161114f10838b5e97",
    telefones: 
        { 
            numero: "121878958",
            ddd: "21"
        }
})

describe('Testando usuarioController', done => {
    mongoose.connect(config.db.urlTeste)
    setTimeout( function () {
        mongoose.disconnect();
      }, 3000);

    //salvando
    it('Salvando usuario 1', done => {
        usuario1.save( () => done())
    })

    it('#Pesquisando usuario 1', done => {
            request(app)
            .get(`/findUser/${usuario1.user_id}`)
            .set('token', usuario1.token)
            .timeout(3000)
            .expect(200)
            .expect('Content-Type',/json/)
            .end(done);
    });

    it('#Logando usuario 1', done => {
        var usuario1 = { 
            email: "aaa@jfaancom",
            senha: "123456",
            token: "301e36da35e4c0af8b7a012692716ebfc6c881ceb2c1072161114f10838b5e97",
            
        }
        request(app)
            .post('/login')
            .send(usuario1)
            .set('token', usuario1.token)
            .timeout(3000)
            .expect(200, {"mensagem": "Sign Up"})
            .expect('Content-Type',/json/)
            .end(done);
    }); 

    it('#Atualizando telefone usuario 1', done => {
        var usuario1 = { 
            user_id: '1407b4a0-9055-11e9-88e5-b288c6fd9154',
            email: "aaa@jfaancom",
            senha: "123456",
            token: "301e36da35e4c0af8b7a012692716ebfc6c881ceb2c1072161114f10838b5e97",
            telefones: 
            { 
                numero: "-",
                ddd: "-"
            }
            
        }
        request(app)
            .put('/updateUser')
            .send(usuario1)
            .set('token', usuario1.token)
            .timeout(3000)
            .expect(200, {"mensagem": "Usuário atualizado com sucesso"})
            .expect('Content-Type',/json/)
            .end(done);
    }); 

    it('#Removendo usuario 1', done => {
        request(app)
            .delete(`/removeUser/${usuario1.user_id}`)
            .set('token', usuario1.token)
            .timeout(3000)
            .expect(200, {"mensagem": "Usuário removido com sucesso!"})
            .expect('Content-Type',/json/)
            .end(done)
    }); 
})
