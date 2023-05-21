// Startup health shared worker
window.addEventListener("DOMContentLoaded", () => {
    import("/worker/server_health_starter.js").then(m => m.default()).catch(console.error);
});

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
        draggable: true,
        scalable: true,
    });

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    const lineLayer = window.LineLayer = new Konva.Layer({name: "Line"});

    window.addNode = node => {
        layer.add(node);
    };

    lineLayer.listening(false);

    editor.addLayer(layer);
    editor.addLayer(lineLayer);

    editor.listen("dblclick", (event) => {
        const {x, y} = event.detail;
        startDialog("create-node", `[data-type="node-type"]`)
            .then(response => {
                if (response.type == null) {
                    throw "Type not specified";
                }
                createNode(response.type, {x, y});
            })
            .catch(e => {
                if (e !== "canceled") {
                    console.error(e);
                }
            })
    })
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#process-version-dialog button[data-type='apply']").addEventListener("click", () => {
        const version = document.querySelector("#process-version-dialog input[data-type='process-version']").value;
        if (version == null || version === "") {
            return;
        }

        window.location.href = `/process/${window.CurrentProcess.id}/${version}`;
    });
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("button[data-type='process-version']").addEventListener("click", () => {
        document.getElementById("process-version-dialog").open = true;
    });
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#save-process button[data-type='cancel']").addEventListener("click", () => {
        document.getElementById("save-process").open = false;
    });
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#save-process button[data-type='save']").addEventListener("click", () => {
        const $elem = document.querySelector("input[data-type='process-version']");
        const version = parseInt($elem.value);
        if (isNaN(version)) {
            throw "Invalid version - " + $elem.value;
        }

        import("/client/process.js")
            .then(m => {
                m.Save(window.CurrentProcess, version)
                    .catch(console.error);
            })

        document.getElementById("save-process").open = false;
    });
})

window.addEventListener("DOMContentLoaded", () => {
    const entries = window.location.pathname.split("/")
    const processId = entries[2];
    const version = entries[3];

    document.querySelector("#header button[data-type='process-version']").textContent = "Version: " + version;

    import("/client/process.js")
        .then(m => {
            m.GetPayload(processId, parseInt(version))
                .then(process => {
                    import("/render_process.js").then(m1 => m1.default(process));
                    window.CurrentProcess = process;
                    document.querySelector("[data-type='process-name']").textContent = process.name;
                })

            m.GetVersions(processId)
                .then(list => {
                    const $ul = document.querySelector("#process-version-dialog ul")
                    list.forEach(v => {
                        const $li = document.createElement("li")
                        $li.textContent = v
                        $li.addEventListener("click", e => {
                            document.querySelector("#process-version-dialog input").value = e.target.textContent;
                        })
                        $ul.append($li);
                    })
                })
        })
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("[data-type='save']").addEventListener("click", () => {
        const $elem = document.getElementById("save-process");
        $elem.open = true;
    });
})

window.addEventListener("DOMContentLoaded", () => {
    import("/render/dialog/aggregation.js").then(m => m.default.forEach(x => x.draw())).catch(console.error);
})

window.addEventListener("keypress", e => {
    switch (e.key) {
        case "Delete":
            deleteSelectedNode();
            break;
    }
});

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * */
async function showNodeMenu(view, node, def) {
    (await import("/render/node_menu.js")).nodeMenuRender(view, node).catch(console.error);
}

function unselectNode() {
    if (window.selectedNodeId == null || window.selectedNodeId === "") {
        return;
    }

    const node = window.NodeLayer.findOne("#" + window.selectedNodeId);
    if (node == null) {
        console.warn(`node ${window.selectedNodeId} not found`);
        return;
    }

    node.selected = false;
}

function hideNodeMenu() {
    document.getElementById("node-menu").open = false;
}

async function createNode(type, {x = 0, y = 0}) {
    const client = (await import("/client/node.js"));
    const ProcessNode = (await import("../model/ProcessNode.js")).default;

    const definition = await client.getDefinition(type);

    const node = ProcessNode.new(type);
    node.position = {x, y};

    const view = await renderNode(node, definition);

    window.addNode(view);
    window.CurrentProcess.nodes.push(node);
}

/**
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * @return Promise<NodeView>
 * */
async function renderNode(node, def) {
    const renderNode = (await import("/render/canvas/renderNode.js")).default;
    return renderNode(def.render, node);
}

function startDialog(name, focus = null) {
    return new Promise((resolve, reject) => {
        const $dialog = document.getElementById(name);
        $dialog.open = true;
        if (focus) {
            $dialog.querySelector(focus).focus();
        }

        $dialog.querySelector("input[type='submit'][data-type='apply']").onclick = () => {
            const response = {};
            $dialog.open = false;

            $dialog.querySelectorAll("input").forEach(x => {
                if (x.type === "submit") {
                    return
                }

                response[x.name] = x.value;
            })

            resolve(response);
        }

        $dialog.querySelector("input[type='submit'][data-type='cancel']").onclick = () => {
            $dialog.open = false;
            reject("canceled");
        }
    })
}

function deleteSelectedNode() {
    if (window.selectedNodeId == null || window.selectedNodeId === "") {
        return
    }

    const node = window.NodeLayer.findOne("#" + window.selectedNodeId);
    if (node == null) {
        console.warn(`node ${window.selectedNodeId} not found`);
        return;
    }

    for (let i = 0; i < window.CurrentProcess.nodes.length; i++) {
        const n = window.CurrentProcess.nodes[i];
        if (n.id === window.selectedNodeId) {
            window.CurrentProcess.nodes.splice(i, 1);
            break;
        }
    }

    node.destroy();
}