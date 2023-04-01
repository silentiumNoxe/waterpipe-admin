Konva.DEFAULT_FONT = "Ubuntu";
Konva.Color = {
    PRIMARY: "#212525",
    LIGHT: "#a0a8a8",

    SUCCESS: "#4d7c45",
    WARNING: "#a24444",
    ERROR: "#bb853e"
}

window.addEventListener("DOMContentLoaded", () => {
    showConnectedServer()

    const width = window.innerWidth;
    const height = window.innerHeight;
    const stage = new Konva.Stage({x: width/3, y: height/5, container: "editor", width, height, draggable: true});

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

    const layer = window.NodeLayer = new Konva.Layer({name: "Node"});
    const lineLayer = window.LineLayer = new Konva.Layer({name: "Line"});

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

/**
 * @param view {NodeView}
 * @param node {ProcessNode}
 * @param def {NodeDefinition}
 * */
function showNodeMenu(view, node, def) {
    const $menu = document.getElementById("node-menu");

    const $title = $menu.querySelector("[data-type='node-title']");
    $title.value = node.title || def.name;
    $title.onkeyup = e => {
        view.title = node.title = e.target.value;
        markAsUnsaved();
    }

    $menu.querySelector("[data-type='node-id']").textContent = node.id;
    $menu.querySelector("[data-type='node-type']").textContent = node.type;
    $menu.open = true;

    const $body = $menu.querySelector(".body");
    $body.innerHTML = "";

    function drawInputField({name, value, required, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = required ? name + "*" : name;
        const $input = document.createElement("input");
        if (value == null) {
            value = ""
        }
        $input.value = value;
        $input.addEventListener("keyup", e => {
            onchange(e.target.value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    function drawInputNumField({name, value, required, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = required ? name + "*" : name;
        const $input = document.createElement("input");
        $input.type = "number";
        if (value == null) {
            value = ""
        }
        $input.value = value;
        $input.addEventListener("keyup", e => {
            onchange(e.target.value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    for (const argName of Object.keys(def.args)) {
        if (node.type === "waterpipe.code" && argName === "script") {
            continue;
        }

        const defArg = def.args[argName];
        const nodeArg = node.args[argName];

        const ops = {
            name: argName,
            value: nodeArg != null ? nodeArg : null,
            required: defArg.required,
            onchange: value => {
                if (node.args == null) {
                    node.args = {};
                }
                switch (defArg.type) {
                    case "number":
                        value = parseFloat(value);
                        if (!isNaN(value)) {
                            value = parseFloat(value);
                        }
                        break
                    case "boolean":
                        value = value === "true";
                        break;
                }
                node.args[argName] = value
                markAsUnsaved();
            }
        };

        let $elem = null;
        switch (defArg.type) {
            case "number":
                $elem = drawInputNumField(ops);
                break
            default:
                $elem = drawInputField(ops);
        }
        $body.append($elem);
    }
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