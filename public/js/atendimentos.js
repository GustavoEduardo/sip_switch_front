	let port = 3030;

    var axiosConfig= {
        headers: {
            authorization: "Bearer "+ localStorage.getItem("token")
        }
    }

    function buscarLigacoes(){

        var telefone = document.getElementById('tel').value;		
        var dtInit = document.getElementById('dtInit').value;
        var dtFim = document.getElementById('dtFim').value;
        var hrInit = document.getElementById('hrInit').value;
        var hrFim = document.getElementById('hrFim').value;
        
        var itens = document.querySelector("#lista");
        itens.parentNode.removeChild(itens);

        var tbody = document.createElement("tbody");
        tbody.setAttribute('id',"lista");
        tabela.appendChild(tbody);

        axios.get(`http://localhost:${port}/ligacao-receptiva/${telefone}?dtInicial=${dtInit}&dtFinal=${dtFim}&hrInicial=${hrInit}&hrFinal=${hrFim}`).then( response => {
            var calls = response.data.result;
            
            calls.forEach(call => {

                var item = document.createElement("tr");
                var td1 = document.createElement("td");
                td1.innerHTML = call.src;
                item.appendChild(td1);

                var td2 = document.createElement("td");
                td2.innerHTML = call.data;
                item.appendChild(td2);

                var td3 = document.createElement("td");
                td3.innerHTML = call.hora;
                item.appendChild(td3);

                var td4 = document.createElement("td");
                td4.innerHTML = call.duration;
                item.appendChild(td4);
                item.setAttribute('data-id',call.uniqueid);
                
                lista.appendChild(item);

                document.getElementById('total').innerHTML = calls.length;
                document.getElementById('telefone').innerHTML = telefone;
                document.getElementById('de').innerHTML = dtInit;
                document.getElementById('ate').innerHTML = dtFim;
                document.getElementById('hrDe').innerHTML = hrInit;
                document.getElementById('hrAte').innerHTML = hrFim;
            });
        }).catch( err => { 
            console.log(err);
        });

    }

    axios.get(`http://localhost:${port}/midia`).then( response => {
        var midias = response.data.result;

        midias.forEach(m => {
            var option = document.createElement("option");
            option.innerHTML = m.nome;
            option.value = m.telefone
            tel.appendChild(option);
        });
    }).catch( err => { 
        console.log(err);
    });