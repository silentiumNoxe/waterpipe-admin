import NodeView from "./canvas-view/node.js";

export default async function(def) {
    const view = new NodeView(def)
    view.setPosition({x: window.innerWidth / 3, y: window.innerHeight / 3})
    window.NodeLayer.add(view);
}