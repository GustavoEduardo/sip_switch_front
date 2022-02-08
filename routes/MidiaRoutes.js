const Router = require('express').Router;
const Controller = require('../controllers/MidiaController');
const auth = require("../middlewares/auth");

const MidiaRoutes = Router();
MidiaRoutes.route('/midias').all(auth).post(Controller.listar);
MidiaRoutes.route('/midia-cadastrar').all(auth).get(Controller.nova);
MidiaRoutes.route('/midia-cadastrar').all(auth).post(Controller.create);
MidiaRoutes.route('/midia-deletar').all(auth).post(Controller.delete);
MidiaRoutes.route('/midia-editar/:id').all(auth).get(Controller.editar);
MidiaRoutes.route('/alterarmidia').all(auth).post(Controller.update);


module.exports = MidiaRoutes;