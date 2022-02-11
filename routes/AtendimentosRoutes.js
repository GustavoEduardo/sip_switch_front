const Router = require('express').Router;
const Controller = require('../../sip-front/controllers/AtendimentoController');
const auth = require("../middlewares/auth");

const AtendimentoRoutes = Router();
AtendimentoRoutes.route('/atendimentos').all(auth).post(Controller.exibir);
AtendimentoRoutes.route('/atendimentos-listar').all(auth).post(Controller.listar);


module.exports = AtendimentoRoutes;