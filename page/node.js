// Startup health shared worker
window.addEventListener("DOMContentLoaded", () => {
    import("/worker/server_health_starter.js").then(m => m.default()).catch(console.error);
})

// Init editor
window.addEventListener("DOMContentLoaded", async () => {
    const Editor = (await import("../canvas-view/Editor.js")).default;
    if (Editor == null) {
        notifyPopup(notifyPopup.ERROR, "Failed load editor");
        return;
    }

    const editor = window.editor = Editor.build({
        width: window.innerWidth,
        height: window.innerHeight,
        draggable: false,
        scalable: false,
    });

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    layer.listening(false);

    editor.addLayer(layer);
})

// Load node definition
window.addEventListener("DOMContentLoaded", async () => {
    const type = window.location.pathname.split("/")[2];
    console.debug("TYPE", type);
    document.title = `Node | ${type} | Waterpipe`;

    const client = (await import("../client/node.js"));
    const render = (await import("../render_node_editor.js")).default;

    client.getDefinition(type)
        .then(render)
        .catch(err => notifyPopup(notifyPopup.ERROR, err));
})

function selectEditorPage(elem) {
    const $active = document.querySelector("#categories li.active");
    if ($active) {
        $active.classList.remove("active");
        document.getElementById($active.dataset.linked).hidden = true;
    }
    elem.classList.add("active");
    document.getElementById(elem.dataset.linked).hidden = false;

}

function save() {

}