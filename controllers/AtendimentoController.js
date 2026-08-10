const Connect  = require('../database/Connect');
const fs = require('fs');
const moment = require('moment');

class AtendimentoController{

    async exibir(req,res){
        var filtro = {
            hrInit:"00:00:00",
            hrFim:"23:59:00"            
        }
        let query = Connect("midia").select()
        
        if(req.tipo != "admin"){
            query.innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
            query.where({id_usuario: req.id})
        }
        
        let midias = await query
        return res.render("atendimentos", {result:[], midias, filtro,encontradas:"", erro:[], anonymous:""}); 

    }    

    async listar(req,res){ 
        let filtro = {
               ...req.body
            }
            let de = filtro.dtInit+" "+filtro.hrInit
            let ate = filtro.dtFim+" "+filtro.hrFim

        try {
            if(req.tipo == "admin"){
                var midias = await Connect("midia").select();
            }else{
                var midias = await Connect("midia").select() 
                .innerJoin('usuario_midia','usuario_midia.id_midia','midia.id_midia')
                .where({id_usuario: req.id})                
            }
            
            var query =  Connect("cdr").select().whereBetween('calldate',[de,ate])
            
            if(filtro.telefone){
                query.where({userfield:filtro.telefone})
            }else {
                let midiaTels = midias.map(m=> m.telefone)
                filtro.telefone = "Todas as Mídias"
                query.whereIn("userfield",[...midiaTels])
                console.log(midiaTels)
            }

            var numeros = await query;
            
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
            var content = "MIDIA;DDD;TELEFONE;DATA;HORA;data-do-documento: "+agr+"\n"

            data.map((call)=>{
                if(call.src !="anonymous"){
                    var mais = call.src.substr(0, 1)
                    if(mais == "+"){
                        var ddd = call.src.substr(4, 2)
                        var tel = call.src.substr(6)
                    }else{
                        var ddd = call.src.substr(0, 2)
                        var tel = call.src.substr(2)
                    }

                    var midia = call.userfield ? call.userfield : ""

                    content = content+midia+";"+ddd+";"+tel+";"+call.data+";"+call.hora+"\n"
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
