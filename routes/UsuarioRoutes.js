const Router = require('express').Router;
const Controller = require('../controllers/usuarioController');

const usuarioRoutes = Router();
usuarioRoutes.route('/usuarios').get(Controller.listar);
usuarioRoutes.route('/usuario-cadastrar').get(Controller.novo);
usuarioRoutes.route('/usuario-cadastrar').post(Controller.create);
usuarioRoutes.route('/usuario-deletar').post(Controller.delete);
usuarioRoutes.route('/usuario-editar/:id').get(Controller.editar);
usuarioRoutes.route('/alterarusuario').post(Controller.update);


module.exports = usuarioRoutes;