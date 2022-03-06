
const jwt = require('jsonwebtoken');
require('dotenv').config();
let auth = (req,res,next,) => {

    let retorno  = {
        status:"success",
        message:"Ação realizada com sucesso",
        code: 200,
        data: {}
    };
    try {
        //validar se existe authorization no header
        const token =  req.body.token;
    
        if(!token) throw 'Acesso não autorizado (code 1)';
        
        jwt.verify(token,"obelix", (err, decoded) => {
          if (err) throw 'Token Invalido.';                  
            //se tudo estiver ok, salva no request para uso posterior  
            req.id = decoded.id_usuario;  
            req.tipo = decoded.tipo;
        });
    }catch (e) {
        retorno.message = e;
        retorno.code = 400;
        retorno.status = "error";
        return res.status(400).json(retorno);
    }
    return next();
};


module.exports = auth;