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

        //filtra data final
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