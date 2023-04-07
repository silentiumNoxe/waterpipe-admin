import * as client from "./client/node.js";
import NodeView from "./canvas-view/node.js";
import {nodeMenuRender} from "./page/render/node_menu.js";
import renderNode from "./canvas/renderNode.js";

/**
 * @param process {Process}
 * */
export default async function (process) {
    const nodes = {};
    const lines = [];
    const connections = [];
    for (const n of process.nodes) {
        const def = await client.getDefinition(n.type);
        if (def.render == null) {
            def.render = {};
        }
        def.render.important = def.important;
        //todo: fix it
        def.render.width = 300;
        def.render.height = 150;
        const x = nodes[n.id] = await renderNode(def.render, n);
        x.on("click", e => {
            e.cancelBubble = true;
            nodeMenuRender(x, n, def);
        });
        x.on("dragmove", () => {
            n.position = x.getPosition();
        });
        connections.push({from: n.id, to: n.next});
    }

    for (const conn of connections) {
        const from = nodes[conn.from];
        const to = nodes[conn.to];
        if (from == null || to == null) {
            continue;
        }

        lines.push(from.connectTo(to, "next_default"));
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