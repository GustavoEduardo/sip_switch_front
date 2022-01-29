const Connect  = require('../database/Connect');
const moment = require('moment');
const bcryptjs = require('bcryptjs');


class UsuarioController{

    async listar(req,res){
        let usuarios = await Connect("usuario").select("id_usuario","nome","email");
        return res.render("usuario/index", {usuarios});
    }

    async novo(req,res){        
        return res.render("usuario/new");
    } 

    async create(req,res){
        let salt = bcryptjs.genSaltSync(11);
        let usuario = {
            ...req.body
        }
        usuario.senha = bcryptjs.hashSync(usuario.senha, salt)
        usuario.criado = moment().format('YYYY-MM-DD HH:mm:ss');
        usuario.modificado = moment().format('YYYY-MM-DD HH:mm:ss');

        await Connect("usuario").insert(usuario);
        
        return res.redirect("/usuarios");
    }

    async delete(req,res){
        let id_usuario = req.body.id;
        await Connect("usuario").delete().where({id_usuario});        
        return res.redirect("/usuarios");
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
        return res.redirect("/usuarios");
    }       

}

module.exports = new UsuarioController();