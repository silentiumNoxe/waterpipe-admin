import NodeView from "./canvas-view/node.js";

export default async function(def) {
    const view = new NodeView(def);

    view.draggable(false);
    view.width(400);
    view.height(200);
    view.setPosition({x: window.innerWidth / 5 - 100, y: window.innerHeight / 5 + 150});

    window.NodeLayer.add(view);

    scriptEditor(def.script);
}

function scriptEditor(script) {
    if (script == null || script === "") {
        return;
    }

    document.querySelector("#script-menu > textarea").value = atob(script);
}