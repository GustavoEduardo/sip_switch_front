const express = require('express');
const app = express();
const routes = require("./routes/routes");
require('dotenv').config();
const auth = require("./middlewares/auth");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json({limit: '150mb'}));
app.use(routes);
app.set('view engine', 'ejs');

//pagina Home
app.post('/home',auth, (req, res) => {
	let token= req.body.token
	res.render("home",{token});
});
//Página de login
app.get('/', (req, res) => {
	res.render("usuario/login",{erro:{}});	
});

//Iniciando o servidor
app.listen(4000,(err) =>{
	if(err){
		console.log(err)
	}else{
		console.log("Sip rodando na porta 4000.")
	}
});