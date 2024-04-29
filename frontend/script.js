const apiUrl = "http://localhost:8000"

// Cuando se inicia el front debe cargar los nodos evidencia para poder seleccionarlos
fetch(apiUrl + "/api")
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
        return response.json();
    })
.then(data => {    
    
    var evid = data["evidences"];

    var form = document.getElementById("evid");

    var i = 0

    evid.forEach(elem => {
        var p = document.createElement("p");
        nodo = elem["id"];
        p.innerHTML = nodo;

        form.appendChild(p);

        var states = elem["states"];

        states.forEach(elem2 => {
            var radio = document.createElement("input");
            radio.setAttribute("type", "radio");
            radio.setAttribute("name", nodo);
            radio.setAttribute("state", elem2)
            radio.setAttribute("id", i)
            var label = document.createElement("label");
            label.innerHTML = elem2;
            var br = document.createElement("br");

            form.appendChild(radio)
            form.appendChild(label)
            form.appendChild(br)

            i++;
        });

        var radio = document.createElement("input");
        radio.setAttribute("type", "radio");
        radio.setAttribute("name", nodo);
        radio.setAttribute("state", "Desconocido")
        radio.setAttribute("id", i)
        var label = document.createElement("label");
        label.innerHTML = "Desconocido";
        var br = document.createElement("br");

        form.appendChild(radio)
        form.appendChild(label)
        form.appendChild(br)

        document.getElementById(i).checked = true;

        i++;
    });
})
.catch(error => {
    console.error('Error:', error);
});


// Acción de botón. Muestra los diagnósticos dadas las evidencias.
document.getElementById('boton').addEventListener('click', function() {
    
    var nodes = [];
    var states = [];

    var i = 0;
    var actual = document.getElementById(i);
    while (actual != null) {

        if (actual.checked & actual.getAttribute("state") != "Desconocido") {
            nodes.push(actual.getAttribute("name"));
            states.push(actual.getAttribute("state"));
        }

        i++;
        actual = document.getElementById(i);
    }

    fetch(apiUrl + "/api/diagnose", {
        method: "POST",
        body: JSON.stringify({
            nodes: nodes,
            states: states
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
            return response.json();
        })
    .then(data => {
        var table = document.getElementById('diag');

        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        var probs = data["probabilities"];

        probs.sort(function (a, b) {
            return parseInt(a["value"]) - parseInt(b["value"])
        });

        probs.forEach(elem => {
            var row = table.insertRow(0);

            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);

            cell1.innerHTML = elem["id"];
            cell2.innerHTML = elem["value"] + "%";
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });

});