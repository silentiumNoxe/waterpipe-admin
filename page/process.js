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

    stage.on("click", hideNodeMenu)

    stage.on("dblclick", () => {
        const mouse = mousePosition();
        console.log(mouse);
        createNode("waterpipe.code", mouse);
    })

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    const lineLayer = window.LineLayer = new Konva.Layer({name: "Line"});

    window.addNode = node => {
        layer.add(node);
    };

    lineLayer.listening(false);

    stage.add(lineLayer);
    stage.add(layer);

    const params = new URLSearchParams(window.location.search)
    const processId = params.get("process")
    const version = Number(params.get("v"))

    import("../client/process.js")
        .then(m => {
            m.GetPayload(processId, version)
                .then(process => {
                    import("../render_process.js").then(m1 => m1.default(process));
                    window.CurrentProcess = process;
                    document.querySelector("[data-type='process-name']").textContent = process.name;
                })
        })

    document.querySelector("[data-type='save']").addEventListener("click", () => {
        const $elem = document.getElementById("save-process");
        $elem.open = true;
    });

    document.querySelector("#save-process button[data-type='save']").addEventListener("click", () => {
        const $elem = document.querySelector("[data-type='process-version']");
        const version = parseInt($elem.value);

        import("../client/process.js")
            .then(m => {
                m.Save(window.CurrentProcess, version)
                    .then(() => markAsSaved())
                    .catch(console.error);
            })

        document.getElementById("save-process").open = false;
    });

    document.querySelector("#save-process button[data-type='cancel']").addEventListener("click", () => {
        document.getElementById("save-process").open = false;
    })
})

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

function hideNodeMenu() {
    document.getElementById("node-menu").open = false;
}

function markAsUnsaved() {
    document.getElementById("save-status").textContent = "Changes is not saved";
}

function markAsSaved() {
    document.getElementById("save-status").textContent = "All changes are saved";
}

async function createNode(type, {x=0, y=0}) {
    const client = (await import("../client/node.js"));
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
    const NodeView = (await import("../canvas-view/node.js")).default;
    const view = new NodeView();

    view.id(node.id);
    view.setPosition(node.position);
    view.title = node.title || def.name;

    view.on("click", e => {
        e.cancelBubble = true;
        showNodeMenu(view, node, def);
    });
    view.on("dragmove", () => {
        node.position = view.getPosition();
    });

    return view;
}