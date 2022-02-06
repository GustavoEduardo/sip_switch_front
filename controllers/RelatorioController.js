const Connect  = require('../database/Connect');
const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');

class RelatorioController{
   
    async exibirQualidadeVend(req,res){
        var filtro = {
            hrInit:"00:00:00",
            hrFim:"23:59:00",
            tempMin:"00",
            ordem: "dst",
            tipoOrdem: "DESC"
        }

        return res.render("relatorio/qualidadeVendedores", {filtro, vendedores:[], totais:[], erro:[]}); 

    }    

    async listarQualidadeVend(req,res){
        let filtro ={
            ...req.body
        }
        
        try {
             //filtrando ligações efetuadas (só ativas!!!)
            let query = Connect.select().table("cdr").where("calldate",">=",filtro.dtInit)
            .andWhere("dcontext", "!=", "Supervisores").andWhere("dcontext", "!=", "Ramais-JM")
            .whereRaw("dstchannel NOT LIKE '%@Discador%'").andWhereBetween("dst", [1000,9999])
            if(filtro.tempMin){
                query.andWhere("duration", ">=", filtro.tempMin)
            }
            if(filtro.ramal){
                query.andWhere("dst", "=", filtro.ramal)
            }
            var retorno = await query.orderBy(filtro.ordem,filtro.tipoOrdem);
            var result= retorno;
            
        } catch (e) {

            console.log("oioioi")
            
            return res.render("relatorio/qualidadeVendedores", {filtro, vendedores:[], totais:[], erro});
        }

        //filtrar data final
        let retorno2 = [];
        retorno.map(r=>{
            var data;
            if(r.calldate.getMonth()+1 < 10){                        
                if(r.calldate.getDate() < 10){
                    data = `${r.calldate.getFullYear()}-0${r.calldate.getMonth()+1}-0${r.calldate.getDate()}`
                }else{
                    data = `${r.calldate.getFullYear()}-0${r.calldate.getMonth()+1}-${r.calldate.getDate()}`
                }
            }else{
                if(r.calldate.getDate() < 10){
                    data = `${r.calldate.getFullYear()}-${r.calldate.getMonth()+1}-0${r.calldate.getDate()}`
                }else{
                    data = `${r.calldate.getFullYear()}-${r.calldate.getMonth()+1}-${r.calldate.getDate()}`
                }
            }
                      
            if(data <= filtro.dtFim){
                let dtBR= data.split('-')
                r.data = `${dtBR[2]}/${dtBR[1]}/${dtBR[0]}`;
                retorno2.push(r)
            }   
                
        })          
        result = retorno2

        //filtrar horario
        let retorno3 = []
        retorno2.map(r=>{
            var h = new Date(r.calldate)
            var hora = h.getUTCHours();
            var min = h.getUTCMinutes();

            if(min < 10){
                var horario = hora + ':0' + min;
            }else{
                var horario = hora + ':' + min;
            }
            r.hora = horario;

            if(horario >= filtro.hrInit && horario <= filtro.hrFim){
                retorno3.push(r)                
            }      
                
        })
        result = retorno3        

        //cria lista de ramais obitidos
        let ramais = []         
        result.forEach((r) => {
            if(!ramais.includes(r.dst)){
                ramais.push(r.dst)
            }
        });        

        //Cria e popula vendedores
        let vendedores = []
        for(let i=0; i< ramais.length; i++){
            let vend = {
                ramal: ramais[i],
                tempoTot: 0,
                tmaTot: 0,
                ligEfetuadas: 0,
                atendidas: 0,
                na:0,
                ocupadas:0,
                falhas:0
            }
            vendedores.push(vend)
        }

        //para resumo do relatório
        let totais = {
            ligEfetuadas: 0,
            atendidas: 0,
            na:0,
            ocupadas:0,
            falhas:0
        }

        //ordena array vendedores pelo ramal
        // vendedores.sort(function(a,b) {
        //     return a.ramal < b.ramal ? -1 : a.ramal > b.ramal ? 1 : 0;
        // });
        
        //atualiza valores
        result.map(r=>{
            for(let i=0; i< vendedores.length; i++){
                if(r.dst == vendedores[i].ramal){
                    vendedores[i].hrFalada = vendedores[i].hrFalada +r.duration;
                    vendedores[i].tempoTot = vendedores[i].tempoTot + r.duration
                    vendedores[i].ligEfetuadas = vendedores[i].ligEfetuadas+1;
                    totais.ligEfetuadas++

                    if(r.disposition == "ANSWERED"){
                        vendedores[i].atendidas = vendedores[i].atendidas+1;
                        totais.atendidas++
                    }else if(r.disposition == "NO ANSWER"){
                        vendedores[i].na = vendedores[i].na+1;
                        totais.na++
                    }else if(r.disposition == "BUSY"){
                        vendedores[i].ocupadas = vendedores[i].ocupadas+1;
                        totais.ocupadas++
                    }else if(r.disposition == "FAILED"){
                        vendedores[i].falhas = vendedores[i].falhas+1;
                        totais.falhas++
                    }else{
                        console.log("Satatus não definido")
                    }

                    vendedores[i].tmaTot=  Math.round((vendedores[i].tempoTot /  vendedores[i].ligEfetuadas))
                    
                }
            }
        })

        //formatar segundos tempoTot
        for(let i=0; i< vendedores.length; i++){
            let hr;
            let min;
            let seg;
            seg = vendedores[i].tempoTot % 60;
            min = parseInt(vendedores[i].tempoTot / 60);
            hr= parseInt(min/60);
            min = min - (60* hr)            

            if(min < 10){
               min = "0"+min.toString() 
            }
            if(seg < 10){
                seg = "0"+seg.toString() 
            }
            vendedores[i].tempoTot = hr+":"+min+":"+seg
        }

        //formatar segundos tmaTot
        for(let i=0; i< vendedores.length; i++){
            let hr;
            let min;
            let seg;
            seg = vendedores[i].tmaTot % 60;
            min = parseInt(vendedores[i].tmaTot / 60);
            hr= parseInt(min/60);
            min = min - (60* hr)            

            if(min < 10){
               min = "0"+min.toString() 
            }
            if(seg < 10){
                seg = "0"+seg.toString() 
            }
            vendedores[i].tmaTot = hr+":"+min+":"+seg
        }  
       
        //cria csv
        async function criarCsv(data){
            var content = "Ramal,Tempo Falado,TMA Total,Efetuadas,Atendidas,NA,Ocupadas,Falhas\n"  
    
            data.map((d)=>{
                content = content+d.ramal+","+d.tempoTot+","+d.tmaTot+","+d.ligEfetuadas+","+d.atendidas+","+d.na+","+d.ocupadas+","+d.falhas+"\n"
            })    
            await fs.writeFileSync('arquivos/produtividade.csv', content)             
    
        }
        criarCsv(vendedores)

        //cria pdf
        ejs.renderFile('./helpers/pdf/produtividade.ejs',{vendedores},(err, html)=>{
            if(err){
                console.log("Erro ao renderizar EJS de produtividade")
            }else{
                const options={
                    format: "A4",
                    border: {
                        right:10,
                        left:10,
                        top:15,
                        botton:15
                    }
                };
    
                pdf.create(html, options).toFile("./arquivos/produtividade.pdf", (error, response)=>{
                    if(err){
                        console.log("Erro ao gerar PDF de produtividade")
                    }else{
                        console.log("Pdf de produtividade criado")
                    }
                })
            }            
        })
       
        return res.render("relatorio/qualidadeVendedores", {filtro, vendedores, totais, erro:{}});

    }  

}

module.exports = new RelatorioController();