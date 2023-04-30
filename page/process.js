window.addEventListener("DOMContentLoaded", () => {
    showConnectedServer()

    const width = window.innerWidth;
    const height = window.innerHeight;
    const stage = new Konva.Stage({container: "editor", width, height, draggable: true});

    window.mousePosition = function () {
        return stage.getPointerPosition();
    }

    stage.on("wheel", e => {
        const scaleBy = 1.05;
        // stop default scrolling
        e.evt.preventDefault();

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        // how to scale? Zoom in? Or zoom out?
        let direction = e.evt.deltaY > 0 ? 1 : -1;

        // when we zoom on trackpad, e.evt.ctrlKey is true
        // in that case lets revert direction
        if (e.evt.ctrlKey) {
            direction = -direction;
        }

        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        stage.scale({x: newScale, y: newScale});

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };
        stage.position(newPos);
    })

    stage.on("dragmove", () => {
        document.body.style.cursor = "grab";
    })

    stage.on("dragend", () => {
        document.body.style.cursor = "auto";
    })

    stage.on("click", hideNodeMenu);
    stage.on("click", unselectNode)

    stage.on("dblclick", () => {
        const mouse = mousePosition();
        startDialog("create-node", `[data-type="node-type"]`)
            .then(response => {
                if (response.type == null) {
                    throw "Type not specified";
                }
                createNode(response.type, mouse);
            })
            .catch(e => {
                if (e !== "canceled") {
                    console.error(e);
                }
            })
    })

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    const lineLayer = window.LineLayer = new Konva.Layer({name: "Line"});

    window.addNode = node => {
        layer.add(node);
    };

    lineLayer.listening(false);

    stage.add(lineLayer);
    stage.add(layer);

    const entries = window.location.pathname.split("/")
    const processId = entries[2];
    const version = entries[3];

    document.querySelector("#header button[data-type='process-version']").textContent = "Version: "+version;

    import("/client/process.js")
        .then(m => {
            m.GetPayload(processId, version)
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

    document.querySelector("[data-type='save']").addEventListener("click", () => {
        const $elem = document.getElementById("save-process");
        $elem.open = true;
    });

    document.querySelector("#save-process button[data-type='save']").addEventListener("click", () => {
        const $elem = document.querySelector("input[data-type='process-version']");
        const version = parseInt($elem.value);
        if (isNaN(version)) {
            throw "Invalid version - "+$elem.value;
        }

        import("/client/process.js")
            .then(m => {
                m.Save(window.CurrentProcess, version)
                    .catch(console.error);
            })

        document.getElementById("save-process").open = false;
    });

    document.querySelector("#save-process button[data-type='cancel']").addEventListener("click", () => {
        document.getElementById("save-process").open = false;
    });

    document.querySelector("button[data-type='process-version']").addEventListener("click", () => {
        document.getElementById("process-version-dialog").open = true;
    });

    document.querySelector("#process-version-dialog button[data-type='apply']").addEventListener("click", () => {
        const version = document.querySelector("#process-version-dialog input[data-type='process-version']").value;
        if (version == null || version === "") {
            return;
        }

        window.location.href = `/process/${window.CurrentProcess.id}/${version}`;
    });
})

window.addEventListener("keypress", e => {
    switch (e.key) {
        case "Delete":
            deleteSelectedNode();
            break;
    }
});

function showConnectedServer() {
    function offline() {
        const $elem = document.querySelector("[data-type='server-addr']")
        $elem.classList.remove("success")
        $elem.classList.remove("error")
        $elem.classList.add("warning")
        $elem.textContent = "server offline"
    }

    function error(msg) {
        const $elem = document.querySelector("[data-type='server-addr']")
        $elem.classList.remove("success")
        $elem.classList.remove("warning")
        $elem.classList.add("error")
        $elem.title = msg;
        $elem.textContent = "server error"
    }

    function connected(addr) {
        const $elem = document.querySelector("[data-type='server-addr']")
        $elem.classList.remove("warning")
        $elem.classList.remove("error")
        $elem.classList.add("success")
        $elem.title = addr;
        $elem.textContent = "server connected";
    }

    function check() {
        const addr = localStorage.getItem("server-addr");
        if (addr == null || addr === "") {
            error("url not specified")
            return
        }

        fetch(addr + "/health")
            .then(resp => {
                if (resp.status !== 200) {
                    error(resp.statusText);
                    return
                }

                connected(addr)
            })
            .catch(e => {
                console.warn(e)
                offline()
            })
    }

    check();
    setInterval(check, 30000)
}

function selectServer() {
    document.getElementById("select-addr-dialog").open = true;
}

function applyServer() {
    const $input = document.getElementById("server-addr-input");
    const url = $input.value;
    if (url == null || url === "") {
        $input.classList.add("error")
        return
    }

    localStorage.setItem("server-addr", url);
    document.getElementById("select-addr-dialog").open = false;
}

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