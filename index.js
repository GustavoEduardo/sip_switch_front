const express = require('express');
const app = express();
const routes = require("./routes/routes");


app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.json({limit: '150mb'}));
app.use(routes);
app.set('view engine', 'ejs');


//pagina Home
app.get('/home', (req, res) => {
	res.render("home");	
});
//Página de login
app.get('/', (req, res) => {
	res.render("usuario/login");	
});

//Iniciando o servidor
app.listen(4000,(err) =>{
	if(err){
		console.log(err)
	}else{
		console.log("Sip rodando na porta 4000.")
	}
});