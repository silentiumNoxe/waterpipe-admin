import * as client from "./client/node.js";
import NodeView from "./canvas-view/node.js";

/**
 * @param process {Process}
 * */
export default async function (process) {
    const nodes = {};
    const lines = [];
    const connections = [];
    for (const n of process.nodes) {
        nodes[n.id] = await renderNode(n);
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
 * @return Promise<NodeView>
 * */
async function renderNode(node) {
    const view = new NodeView();
    const def = await client.getDefinition(node.type);

    view.id(node.id);
    view.setPosition(node.position);
    view.title = node.title || def.name;

    return view;
}