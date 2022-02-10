const Router = require('express').Router;
const Controller = require('../controllers/usuarioController');
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");

const usuarioRoutes = Router();
usuarioRoutes.route('/usuarios').all(auth).all(authAdmin).post(Controller.listar);
usuarioRoutes.route('/usuario-cadastrar').get(Controller.novo);
usuarioRoutes.route('/usuario-cadastrar').all(auth).post(Controller.create);
usuarioRoutes.route('/usuario-deletar').all(auth).post(Controller.delete);
usuarioRoutes.route('/usuario-editar/:id').get(Controller.editar);
usuarioRoutes.route('/alterarusuario').all(auth).post(Controller.update);

usuarioRoutes.route('/login').get(Controller.login);
usuarioRoutes.route('/login').post(Controller.logar);
usuarioRoutes.route('/logout').get(Controller.logout);


module.exports = usuarioRoutes;