const Connect  = require('../database/Connect');
const fs = require('fs');
const moment = require('moment');

class AtendimentoController{

    async exibir(req,res){
        var filtro = {
            hrInit:"00:00:00",
            hrFim:"23:59:00"            
        }
        let midias = await Connect("midia").select();
        return res.render("atendimentos", {result:[], midias, filtro,encontradas:"", erro:[], anonymous:""}); 

    }    

    async listar(req,res){ 
        let filtro = {
               ...req.body
            }
            let de = filtro.dtInit+" "+filtro.hrInit
            let ate = filtro.dtFim+" "+filtro.hrFim

        try {
            var midias = await Connect("midia").select();
            var numeros = await Connect("cdr").select().where({userfield:filtro.telefone}).whereBetween('calldate',[de,ate])
            
        } catch (e) {
            let erro = {
                menssagem: "Erro ao buscar no banco de dados. Reccarrege a página e tente novamente.",
                erro: e,
                codigo: 400
            }
            return res.render("atendimentos", {result:[], midias, filtro:[], erro,encontradas: "", anonymous:"", midias: []}); 
        }       
        
        let result = numeros;

        //conta anonymous
        var anonymous = 0;
        let numeros2 = [];
        numeros.map(n=>{            
            if(n.src =="anonymous"){
                anonymous++
            }else{
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
                let dtBR= data.split('-')
                n.data = `${dtBR[2]}/${dtBR[1]}/${dtBR[0]}`;

                //arruma horario ara exibição no front
                var h = new Date(n.calldate)
                var hora = h.getUTCHours();
                var min = h.getUTCMinutes();

                if(min < 10){
                    var horario = hora + ':0' + min;
                }else{
                    var horario = hora + ':' + min;
                }

                n.hora = horario;


                numeros2.push(n)

                }         
                
        })        
        result = numeros2

        async function criarCsv(data, agr){
            var content = "DDD;TELEFONE;DATA;HORA;data-do-documento: "+agr+"\n"
    
            data.map((call)=>{
                if(call.src !="anonymous"){
                    var mais = call.src.substr(1, 1)
                    if(mais == "+"){
                        var ddd = call.src.substr(4, 2)
                        var tel = call.src.substr(5)
                    }else{
                        var ddd = call.src.substr(1, 2)
                        var tel = call.src.substr(2)
                    }
                    

                    content = content+ddd+";"+tel+";"+call.data+";"+call.hora+"\n"
                }
            })
    
            await fs.writeFileSync('arquivos/ligacoes.csv', content)    
    
        }


        let agr = moment().format("YYYY-MM-DD HH:mm:ss")
        criarCsv(result, agr)
        var encontradas = result.length + anonymous
        res.render("atendimentos", {result, filtro,encontradas, midias, erro:[], anonymous});        

    }  

}

module.exports = new AtendimentoController();
