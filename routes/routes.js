const Router = require('express').Router;
const AtendimentosRoutes = require('..//routes/AtendimentosRoutes');
const MidiaRoutes = require('..//routes/MidiaRoutes');
const UsuarioRoutes = require('..//routes/UsuarioRoutes');
const RelatorioRoutes = require('..//routes/RelatorioRoutes');

const routes = new Router();

routes.use(AtendimentosRoutes);
routes.use(MidiaRoutes);
routes.use(UsuarioRoutes);
routes.use(RelatorioRoutes);

module.exports = routes;
