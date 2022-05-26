const Connect  = require('../database/Connect');
const moment = require('moment');
const bcryptjs = require('bcryptjs');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const {base64encode, base64decode} = require('nodejs-base64');
const EmailTemplateService = require('../helpers/email/EmailTemplateService');


class UsuarioController{

    async listar(req,res){
        let usuarios = await Connect("usuario").select("id_usuario","nome","email","tipo");
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
        let usuario = await Connect("usuario").select().where({id_usuario})
        
        let midias_do_usuario = await Connect("midia").select()
        .innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
        .where({"usuario_midia.id_usuario": req.params.id})

        let midias = await Connect("midia").select()

        return res.render("usuario/edit", {usuario: usuario[0], midias_do_usuario, midias});

    }

    async update(req,res){
        let usuario = {
            nome: req.body.nome,
            email: req.body.email,
            tipo: req.body.tipo
        }
        usuario.modificado = moment().format('YYYY-MM-DD HH:mm:ss')
        await Connect("usuario").update(usuario).where({id_usuario: req.body.id_usuario});
        let usuarios = await Connect("usuario").select("id_usuario","nome","email","tipo");
        return res.render("usuario/index", {usuarios});
    }

    async removeMidia(req,res){
        let id_usuario = req.params.id
        let id_midia = req.body.id_midia
        await Connect("usuario_midia").delete().where({id_usuario}).andWhere({id_midia});
        
        let usuario = await Connect("usuario").select().where({id_usuario})
        let midias = await Connect("midia").select()
        let midias_do_usuario = await Connect("midia").select()
        .innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
        .where({"usuario_midia.id_usuario": req.params.id})
        return res.render("usuario/edit", {usuario: usuario[0], midias_do_usuario, midias})
    }

    async addMidia(req,res){
        let id_usuario = req.params.id
        let id_midia = req.body.id_midia_add

        let ja_existe = await Connect("usuario_midia").select()
        .where({id_usuario}).andWhere({id_midia});

        if(ja_existe.length ==0){
            await Connect("usuario_midia").insert({id_usuario, id_midia});
        }
        
        let usuario = await Connect("usuario").select().where({id_usuario})
        let midias = await Connect("midia").select()
        let midias_do_usuario = await Connect("midia").select()
        .innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
        .where({"usuario_midia.id_usuario": req.params.id})
        return res.render("usuario/edit", {usuario: usuario[0], midias_do_usuario, midias})
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
                    dados.token =  await jwt.sign(dados, "obelix", {
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

    async esqueciasenha(req, res){
        return res.render("usuario/esqueciasenha");
    }

    async recuperarSenha (req, res){
        try {
            let  email= req.body.email;
        
            let user = await Connect("usuario").select().where({email});
            if(!user){
                throw 'Nenhum usuario enconrado com esse email'
            }
            
            let token = user[0].email+"~"+moment().format('YYYY-MM-DD HH:mm:ss');
            token = base64encode(token);
            let link = `http://localhost:4000/novasenha/${token}`;
            let data = {
                email: user[0].email,
                replaces: {
                    link
                }
            };
            EmailTemplateService.recuperarSenha(data);
            return res.render("usuario/login", {dados:[], erro:{menssagem: "Um email de recuperação foi enviado para "+email}});
            
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

    async novasenha(req, res){
        return res.render("usuario/novasenha", {token: "", erro:{}});
    }

    async alterarSenha (req, res){
        let {tokenPass, senha, confirmeSenha} = req.body;
        try {            
            let token = base64decode(tokenPass)
            let dados = token.split("~")
            let data ={
                email: dados[0],
                data: dados[1],
                senha
            } 

            if(moment().subtract(15, 'minutes').format('YYYY-MM-DD HH:mm:ss') > data.data){  
               throw('Token de recuperação expirado')
            }
    
            if(senha != confirmeSenha){
                throw('As senhas devem ser iguais')
            }
    
            if(!data.email || !data.data){
                throw('Token Inválido')
            }            
           
            var salt = bcryptjs.genSaltSync(parseInt(process.env.SALT));

            let up ={            
                senha : bcryptjs.hashSync(data.senha, salt),
                modificado : moment().format('YYYY-MM-DD HH:mm:ss')
            }           
            await Connect.table("usuario").update(up).where({email:data.email});
             res.redirect("/login")
        } catch (e) {
            console.log(e)
            let erro = {
                menssagem: e,
                erro: e,
                codigo: 400
            }
            return res.render("usuario/novasenha", {token: tokenPass, erro});
        }
        
        
                 
        
    }    

}

module.exports = new UsuarioController();