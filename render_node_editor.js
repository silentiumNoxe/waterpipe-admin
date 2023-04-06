import NodeView from "./canvas-view/node.js";
import * as client from "./client/node.js";

export default async function(def) {
    const view = new NodeView(def);

    view.draggable(false);
    view.width(300);
    view.height(150);
    view.setPosition({x: window.innerWidth / 3+150, y: window.innerHeight / 3});
    view.title = def.name;
    view.fontSizeScale = 1.5;
    view.important = def.important;

    window.NodeLayer.add(view);

    scriptEditor(def.script);

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
        e.target.dataset.value = value+"";
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

function scriptEditor(script) {
    if (script == null || script === "") {
        return;
    }

    document.querySelector("#script-menu > textarea").value = atob(script);
}

function markAsUnsaved() {
    document.getElementById("save-status").textContent = "Changes is not saved";
}

function markAsSaved() {
    document.getElementById("save-status").textContent = "All changes are saved";
}