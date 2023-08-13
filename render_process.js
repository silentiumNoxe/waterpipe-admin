import * as client from "./client/node.js";
import renderNode from "./render/canvas/renderNode.js";

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

        nodes[n.id] = await renderNode(def, n);

        // if (n.next != null) {
        //     connections.push({from: n.id, to: n.next, type: "next_default"});
        // }
        //
        // def.args.forEach((arg, name) => {
        //     if (arg.type === "node" && n.args.get(name) != null) {
        //         connections.push({from: n.id, to: n.args.get(name), type: arg.connector});
        //     }
        // })
    }

    // for (const conn of connections) {
    //     const from = nodes[conn.from];
    //     const to = nodes[conn.to];
    //     if (from == null || to == null) {
    //         continue;
    //     }
    //
    //     lines.push(from.connectTo(to, conn.type));
    // }

    for (const id of Object.keys(nodes)) {
        const n = nodes[id];
        window.MidLayer.add(n);
    }

    for (const l of lines) {
        window.BottomLayer.add(l);
    }
}