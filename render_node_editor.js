import NodeView from "./canvas-view/node.js";
import * as client from "./client/node.js";
import {nodeMenuRender} from "./render/node_menu.js";
import ProcessNode from "./model/ProcessNode.js";
import renderNode from "./render/canvas/renderNode.js";

/**
 * @param def {NodeDefinition}
 * */
export default async function (def) {
    const node = new ProcessNode({
        id: "NODE_ID",
        type: def.package + "." + def.name,
        title: "Node Title",
        position: {x: window.innerWidth / 3 + 150, y: window.innerHeight / 3}
    });

    const rn = () => {
        def.render.important = def.important;
        def.render.width = 300;
        def.render.height = 150;
        const view = renderNode(def.render, node);
        view.width(def.render.width);
        view.height(def.render.height);
        view.important = def.important;

        return view;
    }

    const redraw = () => {
        view.destroy();
        view = rn();
        NodeLayer.add(view);
    }

    let view = rn();

    nodeMenuRender(view, node, def);

    window.NodeLayer.add(view);

    renderParametersList(def.args, value => {
        def.args = value;
        nodeMenuRender(view, node, def);
        redraw();
    })
    renderEditor(def.render, value => {
        def.render = value;
        nodeMenuRender(view, node, def);
        redraw();
    });
    scriptEditor(def.script, value => {
        def.script = value;
    });

    const $nodeName = document.querySelector("[data-type='node-name'] > input");
    $nodeName.value = def.name;
    $nodeName.addEventListener("keyup", e => {
        def.name = view.title = e.target.value;
        markAsUnsaved();
    })

    document.querySelector("[data-type='node-title']")

    const $nodePkg = document.querySelector("[data-type='node-pkg'] > input");
    $nodePkg.value = def.package;
    $nodePkg.addEventListener("keyup", e => {
        def.package = e.target.value;
        markAsUnsaved()
    })

    const $nodeImportant = document.querySelector("[data-type='node-important']");
    if (def.important === true) {
        $nodeImportant.textContent = "disable important";
        $nodeImportant.classList.add("warning");
    }

    $nodeImportant.addEventListener("click", e => {
        let value = e.target.dataset.value !== "true";
        e.target.dataset.value = value + "";
        def.important = value;
        view.important = value;
        if (value) {
            e.target.textContent = "disable important";
            e.target.classList.add("warning");
        } else {
            e.target.textContent = "enable important";
            e.target.classList.remove("warning");
        }
        markAsUnsaved();
    })

    document.querySelector("button[data-type='save']").addEventListener("click", () => {
        client.save(def)
            .then(() => {
                markAsSaved();
            })
            .catch(e => {
                console.error(e);
                markAsUnsaved();
            })
    })
}

function renderParametersList(payload = new Map(), apply = () => {
}) {
    let timeoutId;
    const $elem = document.querySelector("#parameters-menu > textarea");
    $elem.value = JSON.stringify(Object.fromEntries(payload), null, "\t");
    $elem.onkeydown = editorKeydown;
    $elem.onkeyup = (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const value = e.target.value;
            if (value === "") {
                apply();
                return
            }

            const map = new Map();
            const b = JSON.parse(e.target.value);
            for (const x of Object.keys(b)) {
                map.set(x, b[x]);
            }
            apply(map);
        }, 1000);
    }
}

function renderEditor(payload = {}, apply = () => {
}) {
    let timeoutId;
    const $elem = document.querySelector("#render-menu > textarea");
    $elem.value = JSON.stringify(payload, null, "\t");
    $elem.onkeydown = editorKeydown;
    $elem.onkeyup = e => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const value = e.target.value;
            if (value === "") {
                apply();
                return
            }

            apply(JSON.parse(e.target.value));
        }, 1000);
    }
}

function scriptEditor(script, apply = () => {
}) {
    if (script == null || script === "") {
        return;
    }

    let timeoutId;
    const $elem = document.querySelector("#script-menu > textarea");
    $elem.value = script;
    $elem.onkeydown = editorKeydown;
    $elem.onkeyup = (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const value = e.target.value;
            if (value === "") {
                apply();
                return;
            }
            apply(btoa(value));
        }, 1000);
    }
}

function editorKeydown(e) {
    tabListener.bind(this)(e);
    quotesListener.bind(this)(e);
}

function tabListener(e) {
    if (e.key === "Tab") {
        e.preventDefault();
        let start = this.selectionStart;
        let end = this.selectionEnd;

        this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

function quotesListener(e) {
    if (e.key === "\"" || e.key === "\'") {
        e.preventDefault();
        let start = this.selectionStart;
        let end = this.selectionEnd;

        this.value = this.value.substring(0, start) + e.key + e.key + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

function markAsUnsaved() {
    document.getElementById("save-status").textContent = "Changes is not saved";
}

function markAsSaved() {
    document.getElementById("save-status").textContent = "All changes are saved";
}