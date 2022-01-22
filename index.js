const express = require('express');
const app = express();



//Controllers
const atendimentoController = require("./controllers/atendimentoController");


app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(express.json({limit: '150mb'}));
app.use(express.urlencoded({ extended: false }));

//rotas

//pagina Home
app.get('/', (req, res) => {
	res.redirect("/");	
});


//Routers

app.use('/',atendimentoController);


//Iniciando o servidor
app.listen(3031,(err) =>{
	if(err){
		console.log(err)
	}else{
		console.log("Front rodando na porta 4001.")
	}
});