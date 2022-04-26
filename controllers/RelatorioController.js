const Connect  = require('../database/Connect');
const fs = require('fs');
const pdf = require('html-pdf');
const ejs = require('ejs');
const moment = require('moment');


class RelatorioController{
   
    async exibirQualidadeVend(req,res){
        var filtro = {
            hrInit:"00:00:00",
            hrFim:"23:59:00",
            tempMin:"00",
            ordem: "src",
            tipoOrdem: "ASC"
        }

        return res.render("relatorio/qualidadeVendedores", {filtro, vendedores:[], totais:[], erro:[]}); 

    }
    
    async listarQualidadeVend(req,res){
        let filtro ={
            ...req.body
        }
        let de = filtro.dtInit+" "+filtro.hrInit
        let ate = filtro.dtFim+" "+filtro.hrFim
        de = moment(de).format("YYYY-MM-DD HH-mm-ss");
        ate = moment(ate).format("YYYY-MM-DD HH-mm-ss");
        try {
             //Filtrando ligações ativas****************************************
            let query = Connect.select().table("cdr")
            .whereBetween("calldate",[de,ate])
            .whereNot("src", "<", 1000).whereNot("src", ">", 5000)
            // .whereNot("userfield", "<", 1000).whereNot("userfield", ">", 5000)// Só traz as atendidas
            

            if(filtro.ramal){
                query.andWhere("src", "=", filtro.ramal)
            }
            var ativas = await query.orderBy(filtro.ordem,filtro.tipoOrdem);
            var result= ativas;

            console.log("Ligações ativas: "+ativas.length)

            //Filtrando ligações recepitivas**************************************
            let query2 = Connect.select().table("cdr")
            .where('dstchannel', 'NOT LIKE', '%@Discador%')
            .whereBetween("calldate",[de,ate])
            .andWhere("src", ">", 10000000)
            .andWhere('dcontext','!=','from-internal-xfer')

            var receptivas = await query2;

            console.log("Ligações receptivas (com todos os ramais): "+receptivas.length)
            
        } catch (e) {
            console.log(e)
            let erro = e.message;
            
            return res.render("relatorio/qualidadeVendedores", {filtro, vendedores:[], totais:[], erro});
        }

        //cria lista de ramais encontrados na query1
        let ramais = []         
        result.forEach((r) => {
            if(!ramais.includes(r.src)){
                ramais.push(r.src)
            }
        });

        //Cria e popula vendedores 
        let vendedores = []
        for(let i=0; i< ramais.length; i++){
            let vend = {
                ramal: ramais[i],
                tempoReceptivo: 0,
                tmaReceptivo: 0,
                tempoAtivo: 0,
                tmaAtivo: 0,
                tempoTot:0,
                tmaTot: 0,
                ligRecebidas:0,
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
            ligRecebidas: 0,
            ligEfetuadas: 0,
            atendidas: 0,
            na:0,
            ocupadas:0,
            falhas:0
        }       
        
        var secMin =0;
        if(filtro.tempMin){
          secMin = filtro.tempMin
        }
        //atualiza valores com ligações ativas
        result.map(r=>{
            for(let i=0; i< vendedores.length; i++){
                if(r.src == vendedores[i].ramal && r.billsec >=secMin){
                    vendedores[i].tempoAtivo = vendedores[i].tempoAtivo + r.billsec
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

                    vendedores[i].tmaAtivo=  Math.round((vendedores[i].tempoAtivo /  vendedores[i].ligEfetuadas))
                    
                }
            }
        })

        //Para atualizar com ligalçoes receptivos
        var atualizaVendedores = (ramal, r)=>{
            console.log("---------------atualizaVendedores------------------- Ramal: "+ramal)
            for(let i=0; i< vendedores.length; i++){
                if(ramal == vendedores[i].ramal){                    
                    vendedores[i].tempoReceptivo = vendedores[i].tempoReceptivo + r.billsec
                    vendedores[i].ligRecebidas = vendedores[i].ligRecebidas+1;
                    totais.ligRecebidas++

                    vendedores[i].tmaReceptivo=  Math.round((vendedores[i].tempoReceptivo /  vendedores[i].ligRecebidas))                    
                }
            }
        }

        //atualiza valores com ligações receptivas
        receptivas.forEach(r=>{
            if(r.billsec >=secMin){
                let barra = r.dstchannel.indexOf("/")
                let ramal = r.dstchannel[barra+1]+r.dstchannel[barra+2]+r.dstchannel[barra+3]+r.dstchannel[barra+4]
                if(filtro.ramal && filtro.ramail != ramal){
                    return
                }else{
                    if(r.dstchannel[barra+5] == "@"){                
                        if(ramais.includes(ramal)){
                            atualizaVendedores(ramal, r)
                        }else{
                            ramais.push(ramal)                          
                            let vendNovo = {
                                ramal: ramal,
                                tempoReceptivo: 0,
                                tmaReceptivo: 0,
                                tempoAtivo: 0,
                                tmaAtivo: 0,
                                tempoTot:0,
                                tmaTot: 0,
                                ligRecebidas:0,
                                ligEfetuadas: 0,
                                atendidas: 0,
                                na:0,
                                ocupadas:0,
                                falhas:0
                            }
                            console.log("Não ligou só recebeu>>>>>>>>>>>>> "+ramal)
                            vendedores.push(vendNovo)
                            atualizaVendedores(ramal, r)
                        }
                    }else if(r.dstchannel[barra+5] == "-"){
                        if(r.dst == ramal || r.dst <= 9000){
                            if(ramais.includes(ramal)){
                                atualizaVendedores(ramal, r)
                            }else{
                                ramais.push(ramal)
                                console.log("Não ligou só recebeu--------------> "+ramal)
                                let vendNovo = {
                                    ramal: ramal,
                                    tempoReceptivo: 0,
                                    tmaReceptivo: 0,
                                    tempoAtivo: 0,
                                    tmaAtivo: 0,
                                    tempoTot:0,
                                    tmaTot: 0,
                                    ligRecebidas:0,
                                    ligEfetuadas: 0,
                                    atendidas: 0,
                                    na:0,
                                    ocupadas:0,
                                    falhas:0
                                }
                                vendedores.push(vendNovo)
                                atualizaVendedores(ramal, r)
                            }
                        }
                    }

                }                
            }      
            
        })

        //função formatar segundos em hr
        function segParaHora(time, with_seg = true){
    
            var hours = Math.floor( time / 3600 );
            var minutes = Math.floor( (time % 3600) / 60 );
            var seconds = time % 60;
              
            minutes = minutes < 10 ? '0' + minutes : minutes;      
            seconds = seconds < 10 ? '0' + seconds : seconds;
            hours = hours < 10 ? '0' + hours : hours;
              
            if(with_seg){
               return  hours + ":" + minutes + ":" + seconds;
            }
              
            return  hours + ":" + minutes;
        }
       
         //formatar todos os campos de segundos em horas
         for(let i=0; i< vendedores.length; i++){ 
            vendedores[i].tempoTot = vendedores[i].tempoAtivo + vendedores[i].tempoReceptivo
            vendedores[i].tempoTot = segParaHora(vendedores[i].tempoTot)            
            vendedores[i].tmaAtivo = segParaHora(vendedores[i].tmaAtivo)
            vendedores[i].tmaReceptivo = segParaHora(vendedores[i].tmaReceptivo)
            vendedores[i].tmaTot = Math.round((vendedores[i].tempoAtivo + vendedores[i].tempoReceptivo ) / (vendedores[i].ligEfetuadas + vendedores[i].ligRecebidas))
            vendedores[i].tmaTot = segParaHora(vendedores[i].tmaTot)
        }

       
        //cria csv
        async function criarCsv(data, agr){
            var content = "Ramal;Tempo Total;TMA Ativo;TMA Receptivo;TMA Total;Efetuadas;Atendidas;NA;Ocupadas;Falhas;data-do-documento: "+agr+"\n"  
    
            data.map((d)=>{
                content = content+d.ramal+";"+d.tempoTot+";"+d.tmaAtivo+";"+d.tmaReceptivo+";"+d.tmaTot+";"+d.ligEfetuadas+";"+d.atendidas+";"+d.na+";"+d.ocupadas+";"+d.falhas+"\n"
            })    
            await fs.writeFileSync('arquivos/produtividade.csv', content)             
    
        }
        let agr = moment().format("YYYY-MM-DD HH:mm:ss")
        criarCsv(vendedores, agr)

        //cria pdf
        ejs.renderFile('./helpers/pdf/produtividade.ejs',{vendedores,agr},(err, html)=>{
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