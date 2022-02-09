const Connect  = require('../database/Connect');
const moment = require('moment');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
var jwt = require('jsonwebtoken');


class UsuarioController{

    async listar(req,res){
        let usuarios = await Connect("usuario").select("id_usuario","nome","email");
        return res.render("usuario/index", {usuarios});
    }

    async novo(req,res){        
        return res.render("usuario/new");
    } 

    async create(req,res){      
        let sal = parseInt(process.env.SALT)
        let salt = bcryptjs.genSaltSync(sal);
        let usuario = {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            tipo: req.body.tipo
        }
        usuario.senha = bcryptjs.hashSync(usuario.senha, salt)
        usuario.criado = moment().format('YYYY-MM-DD HH:mm:ss');
        usuario.modificado = moment().format('YYYY-MM-DD HH:mm:ss');
        await Connect("usuario").insert(usuario);
        
        let usuarios = await Connect("usuario").select("id_usuario","nome","email");
        return res.render("usuario/index", {usuarios});
    }

    async delete(req,res){
        let id_usuario = req.body.id;
        await Connect("usuario").delete().where({id_usuario});        
        
        let usuarios = await Connect("usuario").select("id_usuario","nome","email");
        return res.render("usuario/index", {usuarios});
    }

    async editar(req,res){
        let id_usuario= req.params.id;
        let usuario = await Connect("usuario").select().where({id_usuario});
        return res.render("usuario/edit", {usuario: usuario[0]});
    }

    async update(req,res){
        let usuario = {
            nome: req.body.nome,
            email: req.body.email
        }
        usuario.modificado = moment().format('YYYY-MM-DD HH:mm:ss')
        await Connect("usuario").update(usuario).where({id_usuario: req.body.id_usuario});
        
        let usuarios = await Connect("usuario").select("id_usuario","nome","email");
        return res.render("usuario/index", {usuarios});
    }

    async login(req, res){
        return res.render("usuario/login", {dados:[], erro:{}});
    }
    
    async logar(req,res){
        let data = req.body;
        try{
            let usuario = await Connect.select("id_usuario","nome","email","senha","tipo").table("usuario").where({email: data.login});
            if(!usuario[0]){
                throw "Email não encontrado"
            }
            let correct = bcryptjs.compareSync(data.senha, usuario[0].senha);
            if(!correct){        
                throw "Senha Inválida"
            }else{
                if(usuario){
                    var dados = {id_usuario: usuario[0].id_usuario, nome: usuario[0].nome, tipo: usuario[0].tipo}
                    dados.token =  await jwt.sign(dados, process.env.SECRET, {
                        expiresIn: 28800 // expires in 8hrs
                    });     

                    return res.render("home",{token:  dados.token, tipo: dados.tipo});
                }else{
                    throw "Usuario não encontrado"
                }
            }       

        } catch (e) {
            console.log(e)
            let erro = {
                menssagem: e,
                erro: e,
                codigo: 400
            }
            return res.render("usuario/login", {dados:[], erro});
        }    
    }

    async logout(req, res){
         req.headers.authorization= "";

        return res.redirect("/login");

    }

}

module.exports = new UsuarioController();