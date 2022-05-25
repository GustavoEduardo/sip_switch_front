const Connect  = require('../database/Connect');
const moment = require('moment');


class MidiaController{

    async listar(req,res){
        let query = Connect("midia").select()
        if(req.tipo != "admin"){
            query.innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
            query.where({id_usuario: req.id})
        }

        let midias = await query
        return res.render("midia/midias", {midias, tipo:req.tipo});
    }

    async nova(req,res){        
        return res.render("midia/novamidia");
    } 

    async create(req,res){
        let midia = {
            nome : req.body.nome,
            telefone: req.body.telefone,
            descricao: req.body.descricao
        }
        midia.criado = moment().format('YYYY-MM-DD HH:mm:ss');
        midia.modificado = moment().format('YYYY-MM-DD HH:mm:ss');

        await Connect("midia").insert(midia);
        
        let midias = await Connect("midia").select();
        return res.render("midia/midias", {midias});
    }

    async delete(req,res){
        let id_midia = req.body.id;
        await Connect("midia").delete().where({id_midia});        
        
        let midias = await Connect("midia").select();
        return res.render("midia/midias", {midias});
    }

    async editar(req,res){
        let id_midia = req.params.id;
        let midia = await Connect("midia").select().where({id_midia});
        return res.render("midia/editarmidia", {midia: midia[0]});
    }

    async update(req,res){
        let midia = {
           nome: req.body.nome,
           telefone: req.body.telefone,
           descricao:req.body.descricao
        }
        midia.modificado = moment().format('YYYY-MM-DD HH:mm:ss')
        await Connect("midia").update(midia).where({id_midia: req.body.id_midia});
        
        let midias = await Connect("midia").select();
        return res.render("midia/midias", {midias});
    }    


}

module.exports = new MidiaController();