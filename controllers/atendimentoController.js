const Connect  = require('../database/Connect');
const fs = require('fs');

class AtendimentoController{

    async exibir(req,res){
        let midias = await Connect("midia").select();
        return res.render("atendimentos", {result:[], midias, filtro:[]}); 

    }    

    async listar(req,res){ 
        let filtro = {
               ...req.body
            }

        let midias = await Connect("midia").select();

        let numeros = await Connect("cdr").select().where({userfield:filtro.telefone}).andWhere("calldate",">=",filtro.dtInit)
        
        let result = numeros;

        let numeros2 = []
        numeros.map(n=>{
            var data;
            if(n.calldate.getMonth()+1 < 10){                        
                if(n.calldate.getDate() < 10){
                    data = `${n.calldate.getFullYear()}-0${n.calldate.getMonth()+1}-0${n.calldate.getDate()}`
                }else{
                    data = `${n.calldate.getFullYear()}-0${n.calldate.getMonth()+1}-${n.calldate.getDate()}`
                }
            }else{
                if(n.calldate.getDate() < 10){
                    data = `${n.calldate.getFullYear()}-${n.calldate.getMonth()+1}-0${n.calldate.getDate()}`
                }else{
                    data = `${n.calldate.getFullYear()}-${n.calldate.getMonth()+1}-${n.calldate.getDate()}`
                }
            }

                      
            if(data <= filtro.dtFim){
                let dtBR= data.split('-')
                n.data = `${dtBR[2]}/${dtBR[1]}/${dtBR[0]}`;
                numeros2.push(n)
            }   
                
        })        
        if(numeros2.length > 0){
            result = numeros2
        }

        let numeros3 = []
        numeros2.map(n=>{
            var h = new Date(n.calldate)
            var hora = h.getUTCHours();
            var min = h.getUTCMinutes();

            if(min < 10){
                var horario = hora + ':0' + min;
            }else{
                var horario = hora + ':' + min;
            }

            n.hora = horario;

            if(horario >= filtro.hrInit && horario <= filtro.hrFim){
                numeros3.push(n)                
            }            
                
        })
        if(numeros3.length>0){
            result = numeros3
        }

        async function criarCsv(data){
            var content = "telefone,data,hora\n"
    
            data.map((call)=>{
                content = content+call.src+","+call.data+","+call.hora+"\n"
            })
    
            await fs.writeFileSync('arquivos/ligacoes.csv', content)
    
            
    
        }
        criarCsv(result)

        res.render("atendimentos", {result, filtro, midias, filtro});        

    }  

}

module.exports = new AtendimentoController();















//Listar todos os atendimentos da midia selecionada
// router.post("/atendimentos-listar", (req,res) =>{ 
//         let filtro = {
//             ...req.body
//         }
//         //and calldate between "${filtro.dtInit}" and "${filtro.dtFim}"
//     Connect("cdr").select().where({userfield: filtro.telefone}).then(numeros =>{
//             let dtInicial =[];
//             let dtFinal = [];
//             let hrInicial = [];
//             let hrFinal = [];
//             let result;

//             console.log(numeros)

//             let data = (numeros, op)=>{
//                 numeros.map(n=>{
//                     var data;
//                     if(n.calldate.getMonth()+1 < 10){                        
//                         if(n.calldate.getDate() < 10){
//                             data = `${n.calldate.getFullYear()}-0${n.calldate.getMonth()+1}-0${n.calldate.getDate()}`
//                         }else{
//                             data = `${n.calldate.getFullYear()}-0${n.calldate.getMonth()+1}-${n.calldate.getDate()}`
//                         }
//                     }else{
//                         if(n.calldate.getDate() < 10){
//                             data = `${n.calldate.getFullYear()}-${n.calldate.getMonth()+1}-0${n.calldate.getDate()}`
//                         }else{
//                             data = `${n.calldate.getFullYear()}-${n.calldate.getMonth()+1}-${n.calldate.getDate()}`
//                         }
//                     }

//                     n.data = data;

//                     if(op == "dtInicial" && data >= filtro.dtInicial){
//                         dtInicial.push(n)
//                         result = dtInicial
//                     }
                    
//                     if(op == "dtFinal" && data <= filtro.dtFinal){
//                         dtFinal.push(n)
//                         result = dtFinal
//                     }
                        
//                 })
//             }

//             let horario = (numeros, op)=>{                      
//                 numeros.map(n=>{
//                     var h = new Date(n.calldate)
//                     var hora = h.getUTCHours();
//                     var min = h.getUTCMinutes();

//                     if(min < 10){
//                         var horario = hora + ':0' + min;
//                     }else{
//                         var horario = hora + ':' + min;
//                     }

//                     n.hora = horario;

//                     if(op == "hrInicial" && horario >= filtro.hrInicial){
//                         hrInicial.push(n)
//                         result = hrInicial
//                     }

//                     if(op == "hrFinal"){
//                         if(horario <= filtro.hrFinal){
//                             hrFinal.push(n)
//                             result = hrFinal
//                         }
//                         result = hrFinal
//                     }                    
                        
//                 })

//             }

//             //Data Inicial
//             if(filtro.dtInit){                
//                 data(numeros,"dtInicial")
//             }
//             //Data Final
//             if(dtInicial.length > 0 && filtro.dtFim){                             
//                 data(dtInicial,"dtFinal")
//             }else if(filtro.dtFinal){
//                 data(numeros,"dtFinal")
//             }


//             //Horario Inicial
//             if(dtFinal.length> 0 && filtro.hrInicial){ 
//                 horario(dtFinal,"hrInicial")
//             }else if(dtInicial.length > 0 && filtro.hrInicial){  
//                 horario(dtInicial,"hrInicial")
//             }else if(filtro.hrInicial){
//                 horario(numeros,"hrInicial")
//             }

//             //Horario Final
//             if(hrInicial.length> 0 && filtro.hrFinal){
//                 horario(hrInicial,"hrFinal")
//             }else if(dtFinal.length> 0 && filtro.hrFinal){
//                 horario(dtFinal,"hrFinal")
//             }else if(dtInicial.length > 0 && filtro.hrFinal){
//                 horario(dtInicial,"hrFinal")
//             }else if(filtro.hrFinal){
//                 horario(numeros,"hrFinal")
//             }


//             res.render("atendimentos", {result: result});
//     })
		
// });




















// //Pesquisa pelo nome no index
// router.post("/admin/sellers/search", adminAuth, (req,res) =>{
// 	const Op = Sequelize.Op;              // biblioteca de operadores
// 	const query = `%${req.body.search}%`; // string de consulta
// 	let pesquisa = req.body.search;

// 	Seller.findAll({ where: { name: { [Op.like]: query } } })
// 	.then(sellers => {
// 		res.render("admin/seller/index", {sellers, adm: req.session.adm, pesquisa, team: ""});
// 	});	
// });


// //Pesquisa pela equipe no index
// router.post("/admin/sellers/team", adminAuth, (req,res) =>{

// 	var team = req.body.team;
// 	if(team == undefined || team == "" || team == null ){
// 		res.redirect("/admin/sellers")
// 	}else{
	
// 		Seller.findAll({ where: { team: team } })
// 		.then(sellers => {		
// 			res.render("admin/seller/index", {sellers, adm: req.session.adm, team, pesquisa: ""});
// 		});
// 	}
	
// });

// //tela de cadastro de vendedor
// router.get("/admin/seller/new", adminAuth,  (req,res) =>{

// 	res.render("admin/seller/new", {adm: req.session.adm, msg: ""});

// });


// //salva o novo vendedor no banco de dados
// router.post("/createSeller", adminAuth,  (req,res) =>{

// 	var name = req.body.name;
// 	var email = req.body.email;
// 	var team = req.body.team;
// 	var login = req.body.login;
// 	var password = req.body.password;

// 	var salt = bcrypt.genSaltSync(10); //"sal" para incrementar o hash de senha com bcryptjs
// 	var hash = bcrypt.hashSync(password, salt);//gerando o hash da senha


// 	Seller.findOne({
// 		where: {
// 			name: name
// 		}
// 	}).then(seller =>{

// 		if (seller) {

// 			res.render("admin/seller/new", {adm: req.session.adm, msg: "Já existe um vendedor com esse nome no banco de dados!"});

// 		}else{

// 			Seller.findOne({
// 				where: {
// 					login: login
// 				}
// 			}).then(seller =>{
		
// 				if (seller) {
		
// 					res.render("admin/seller/new", {adm: req.session.adm, msg: "Já existe um vendedor com esse login no banco de dados!"});
		
// 				}else{

// 					Seller.create({
// 						name: name,
// 						email: email,
// 						team: team,
// 						login: login,
// 						password: hash,
// 						status: "ativo"

// 					}).then(() => {
// 						res.redirect('/admin/sellers')
// 					}).catch((err) => {
// 						res.send(err)

// 					});
// 				}

// 			});
// 		}
// 	});

// });

// //tela de edição de Vendedor
// router.get("/admin/seller/adit/:id",  adminAuth, (req, res) =>{

// 	var id = req.params.id;

// 	Seller.findOne({where: {id: id}})
// 	.then( seller =>{
// 		res.render("admin/seller/edit", {msg: "",seller, adm: req.session.adm})
// 	});

// });

// //salva alterações no banco
// router.post("/updateSeller", adminAuth,(req, res) =>{
// 	let id = req.body.id;
// 	let name = req.body.name;
// 	let team = req.body.team;
// 	let email = req.body.email;
// 	let status = req.body.status;

// 	Seller.update({
// 		name: name,
// 		team: team,
// 		email: email,
// 		status: status	
// 	},
// 	{where: {id: id}

// 	}).then(()=>{
// 		res.redirect("/admin/sellers");
// 	}).catch(err =>{
// 		res.send("Erro inesperado: "+ err)
// 	})
// });

