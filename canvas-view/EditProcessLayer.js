import {render as renderNode} from "./node.js";

export default class EditProcessLayer extends Konva.Layer {

    /** @type Konva.Group*/
    nodes;

    /** @type Konva.Group*/
    lines;

    /** @type Object*/
    processData;

    /**
     * @param data {Process}
     * @return Promise<EditProcessLayer>
     * */
    static build = async function(data) {
        const layer = new EditProcessLayer({id: "edit", listening: true});
        layer.lines = new Konva.Group();
        layer.nodes = new Konva.Group();
        layer.add(layer.lines, layer.nodes);

        layer.processData = {
            id: data.id,
            name: data.name,
            version: data.version
        };

        for (const n of data.nodes) {
            try {
                const view = await renderNode(n);
                layer.nodes.add(view);
            } catch(e) {
                console.error(e);
                notifyPopup(notifyPopup.ERROR, `failed render node ${n.type}`);
            }
        }

        for (const n of layer.nodes.children) {
            // here we collect connections between nodes
        }

        return layer;
    }
}