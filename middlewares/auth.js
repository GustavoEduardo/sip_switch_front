
const jwt = require('jsonwebtoken');
require('dotenv').config();
let auth = (req,res,next,) => {

    let retorno  = {
        status:"success",
        message:"Ação realizada com sucesso",
        code: 200,
        data: {}
    };
    return next();
    try {
        //validar se existe authorization no header
        const authHeader =  req.headers.authorization;
    
        if( !authHeader ) throw 'Acesso não autorizado (code 1)';

        //validar se há 2 partes authorization
        const parts = authHeader.split(' ');
        if( !parts[1]) throw 'Acesso não autorizado (code 2)';        

        //validar schema do authorization "Bearer"
        const [scheme, token] = parts;
        if( !/^Bearer$/i.test(scheme) ) throw 'token invalido'

        if (!token) throw 'Token invalido';
        
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
          if (err) throw 'Token Invalido.';
          if(decoded){                    
            //se tudo estiver ok, salva no request para uso posterior  
            req.id = decoded.id_usuario;        
          }
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
