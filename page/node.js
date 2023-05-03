window.addEventListener("DOMContentLoaded", () => {
    import("/worker/server_health_starter.js").then(m => m.default()).catch(console.error);
})

window.addEventListener("DOMContentLoaded", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const stage = new Konva.Stage({container: "editor", width, height, draggable: false});

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    layer.listening(false);

    stage.add(layer);

    const type = window.location.pathname.split("/")[2];
    console.debug("TYPE", type);
    document.title = `Node | ${type} | Waterpipe`;

    import("../client/node.js")
        .then(m => {
            m.getDefinition(type)
                .then(def => import("../render_node_editor.js").then(m1 => m1.default(def)))
        })
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