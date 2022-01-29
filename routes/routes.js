const Router = require('express').Router;
const AtendimentosRoutes = require('../routes/AtendimentosRoutes');
const MidiaRoutes = require('../routes/MidiaRoutes');
const UsuarioRoutes = require('../routes/UsuarioRoutes');

const routes = new Router();

routes.use(AtendimentosRoutes);
routes.use(MidiaRoutes);
routes.use(UsuarioRoutes);

module.exports = routes;
