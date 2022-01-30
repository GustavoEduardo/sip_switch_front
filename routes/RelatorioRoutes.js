const Router = require('express').Router;
const Controller = require('../controllers/RelatorioController');

const RelatorioRoutes = Router();
RelatorioRoutes.route('/relatorios-vendedores').get(Controller.exibirQualidadeVend);
RelatorioRoutes.route('/relatorios-vendedores').post(Controller.listarQualidadeVend);


module.exports = RelatorioRoutes;