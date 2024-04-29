import pysmile_license
import pysmile as ps
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)


class NodesUpdate(BaseModel):
    nodes: list
    states: list


net = ps.Network()
net.read_file("pruebaGENIE.xdsl")


@app.get("/api")
def init():
    net.clear_all_evidence()
    nodes = net.get_all_nodes()
    evidences = []
    for node in nodes:
        id = net.get_node_id(node)
        if net.get_node_user_properties(node)[0].value == 'evidence':
            states = []
            for outcome in range(net.get_outcome_count(node)):
                states.append(net.get_outcome_id(node, outcome))
            evidences.append({'id': id, 'states': states})

    return {'evidences': evidences}


@app.post("/api/diagnose")
def diagnose(updates: NodesUpdate):

    net.clear_all_evidence()
    nodes_ids = updates.nodes
    nodes_states = updates.states
    for i, n in enumerate(nodes_ids):
        net.set_evidence(n, nodes_states[i])
    net.update_beliefs()

    probabilities = []
    nodes = net.get_all_nodes()

    for node in nodes:
        id = net.get_node_id(node)
        value = round(net.get_node_value(node)[0] * 100)
        if net.get_node_user_properties(node)[0].value == 'diagnostic':
            probabilities.append({'id': id, 'value': value})

    return {'probabilities': probabilities}


uvicorn.run(app, host="127.0.0.1", port=8000)
