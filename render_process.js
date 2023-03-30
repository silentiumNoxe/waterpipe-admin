import * as client from "./client/node.js";
import NodeView from "./canvas-view/node.js";

/**
 * @param process {Process}
 * */
export default function (process) {
    const nodes = {};
    const lines = [];
    const connections = [];
    for (const n of process.nodes) {
        nodes[n.id] = renderNode(n);
        connections.push({from: n.id, to: n.next});
    }

    for (const conn of connections) {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        if (from == null || to == null) {
            continue;
        }

        lines.push(from.connectTo(to));
    }

    for (const id of Object.keys(nodes)) {
        const n = nodes[id];
        window.NodeLayer.add(n);
        window.NodeLayer.draw();
    }

    for (const l of lines) {
        window.LineLayer.add(l);
    }
    window.LineLayer.draw();
}

/**
 * @param node {ProcessNode}
 * @return NodeView
 * */
function renderNode(node) {
    const view = new NodeView();
    const def = client.GetDefinition(node.type);

    view.id(node.id);
    view.setPosition(node.position);
    view.title = node.title || def.name;

    return view;
}