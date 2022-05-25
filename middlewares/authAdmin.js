require('dotenv').config();
let auth = (req,res,next,) => {

    let retorno  = {
        status:"success",
        message:"Ação realizada com sucesso",
        code: 200,
        data: {}
    };
    try {
      if(req.tipo != "admin"){
        throw "Acesso não autorizado para esta serviço"
      }
        
    }catch (e) {
        retorno.message = e;
        retorno.code = 400;
        retorno.status = "error";
        return res.status(400).json(retorno);
    }
    return next();
};
module.exports = auth;
