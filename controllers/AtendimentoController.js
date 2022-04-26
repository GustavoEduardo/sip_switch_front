const Connect  = require('../database/Connect');
const fs = require('fs');
const moment = require('moment');
const { Console } = require('console');

class AtendimentoController{

    async exibir(req,res){
        var filtro = {
            hrInit:"00:00:00",
            hrFim:"23:59:00"            
        }
        let midias = await Connect("midia").select();
        return res.render("atendimentos", {result:[], midias, filtro, erro:[], anonymous:""}); 

    }    

    async listar(req,res){ 
        let filtro = {
               ...req.body
            }

        try {
            var midias = await Connect("midia").select();
            var numeros = await Connect("cdr").select().where({userfield:filtro.telefone}).andWhere("calldate",">=",filtro.dtInit)
            
        } catch (e) {
            let erro = {
                menssagem: "Erro ao buscar no banco de dados. Reccarrege a página e tente novamente.",
                erro: e,
                codigo: 400
            }
            return res.render("atendimentos", {result:[], midias, filtro:[], erro, anonymous:"", midias: []}); 
        }       
        
        let result = numeros;
        AbortController.log(result.length)

        //filtra data final e conta anonymous
        var anonymous = 0;
        let numeros2 = [];
        numeros.map(n=>{
            if(n.src =="anonymous") anonymous++;
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
        result = numeros2

        //filtra horario
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
        result = numeros3

        async function criarCsv(data, agr){
            var content = "telefone,data,hora,data-do-documento: "+agr+"\n"
    
            data.map((call)=>{
                content = content+call.src+","+call.data+","+call.hora+"\n"
            })
    
            await fs.writeFileSync('arquivos/ligacoes.csv', content)
    
            
    
        }
        let agr = moment().format("YYYY-MM-DD HH:mm:ss")
        criarCsv(result, agr)
        res.render("atendimentos", {result, filtro, midias, erro:[], anonymous});        

    }  

}

module.exports = new AtendimentoController();
