const Router = require('express').Router;
const Controller = require('../controllers/RelatorioController');
const auth = require("../middlewares/auth");

const RelatorioRoutes = Router();
RelatorioRoutes.route('/relatorios-vendedores').all(auth).post(Controller.exibirQualidadeVend);
RelatorioRoutes.route('/relatorios-vendedores').all(auth).post(Controller.listarQualidadeVend);


module.exports = RelatorioRoutes;