const Router = require('express').Router;
const Controller = require('../controllers/AtendimentoController');

const AtendimentoRoutes = Router();
AtendimentoRoutes.route('/atendimentos').get(Controller.exibir);
AtendimentoRoutes.route('/atendimentos-listar').post(Controller.listar);


module.exports = AtendimentoRoutes;