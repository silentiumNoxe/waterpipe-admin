(async function () {
    console.debug("Load server health component");
    import("/component/ServerHealth.js").catch(console.error);
})();

window.addEventListener("DOMContentLoaded", () => {
    loadData("process").catch(console.error);
})

window.addEventListener("DOMContentLoaded", () => {
    const $nav = document.querySelector("nav[data-type='categories']")
    $nav.querySelectorAll("ul > li").forEach(x => x.addEventListener("click", e => {
        const type = e.target.dataset.type;
        const createButtonFunc = function (type) {
            if (type === "process") {
                return () => startDialog("create-process").catch(console.error);
            }

            if (type === "custom-node") {
                return () => startDialog("create-custom-node").catch(console.error);
            }

            throw "unknown type - " + type;
        }

        document.getElementById("create-button").onclick = createButtonFunc(type);
        loadData(type)
            .then(() => {
                $nav.querySelectorAll("ul > li").forEach(el => el.classList.remove("selected"));
            })
            .then(() => x.classList.add("selected"))
            .catch(console.error);
    }))
})

async function loadData(dataType) {
    if (dataType === "process") {
        document.getElementById("list").innerHTML = "";
        loadProcesses().then(ids => ids.forEach(drawProcess)).catch(console.error)
        return
    }

    if (dataType === "custom-node") {
        document.getElementById("list").innerHTML = "";
        loadCustomNodes().then(ids => ids.forEach(drawCustomNode)).catch(console.error)
        return
    }

    throw "unknown data type - " + dataType;
}

async function loadProcesses() {
    const client = await import("../client/process.js")
    return client.List()
}

async function drawProcess(id) {
    const client = await import("../client/process.js")
    const payload = await client.GetPayload(id, 1)

    const $container = document.createElement("div")
    $container.classList.add("card")
    $container.dataset.type = "process"
    $container.dataset.id = id;
    $container.addEventListener("click", () => {
        window.open(`/process/${id}/1`);
    })

    const $top = document.createElement("div")
    $top.classList.add("top")

    const $img = document.createElement("img")
    $img.src = "assets/process.png";
    $img.alt = "icon"
    $top.append($img)

    const $bottom = document.createElement("div")
    $bottom.classList.add("bottom")

    const $name = document.createElement("b")
    $name.textContent = payload.name;
    $bottom.append($name)

    $container.append($top, $bottom)

    document.getElementById("list").append($container)
}

async function loadCustomNodes() {
    const client = await import("/client/node.js")
    return client.list()
}

async function drawCustomNode(id) {
    const $container = document.createElement("div")
    $container.classList.add("card")
    $container.dataset.type = "custom_node"
    $container.dataset.id = id;
    $container.addEventListener("click", () => {
        window.open(`/node/${id}`);
    })

    const $top = document.createElement("div")
    $top.classList.add("top")

    const $img = document.createElement("img")
    $img.src = "assets/node.png";
    $img.alt = "icon"
    $top.append($img)

    const $bottom = document.createElement("div")
    $bottom.classList.add("bottom")

    const $name = document.createElement("b")
    $name.textContent = id;
    $bottom.append($name)

    $container.append($top, $bottom)

    document.getElementById("list").append($container)
}

async function startDialog(context) {
    const $dialog = document.querySelector(`dialog[data-context="${context}"]`);
    if ($dialog == null) {
        console.error("Dialog ", context, "not found");
        return
    }
    $dialog.open = true;
}

async function closeDialog(context) {
    const $dialog = document.querySelector(`dialog[data-context="${context}"]`);
    if ($dialog == null) {
        console.error("Dialog ", context, "not found");
        return
    }

    $dialog.open = false;
}

async function createProcess() {
    const procName = document.querySelector("dialog[data-context='create-process'] input").value;
    if (procName === "") {
        return
    }

    const client = await import("../client/process.js");
    const Process = (await import("../model/Process.js")).default;
    const ProcessNode = (await import("../model/ProcessNode.js")).default;

    const proc = new Process({
        name: procName,
        active: true,
        debug: false,
        path: "",
        nodes: []
    });

    const finalNode = new ProcessNode({
        id: crypto.randomUUID(),
        type: "waterpipe.final",
        title: "Default final",
        position: {x: 0, y: 400}
    });
    proc.nodes.push(finalNode)

    proc.nodes.push(new ProcessNode({
        id: crypto.randomUUID(),
        type: "waterpipe.start",
        title: "Default start",
        position: {x: 0, y: 0},
        next: finalNode.id
    }));

    client.Save(proc, 1)
        .then(() => closeDialog("create-process"))
        .catch(console.error);
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

    updateServer(url);
    document.getElementById("select-addr-dialog").open = false;
}

async function createCustomNode() {
    const NodeDefinition = (await import("/model/NodeDefinition.js")).default;
    const fullName = document.querySelector("dialog[data-context='create-custom-node'] input").value;
    if (fullName === "") {
        return
    }

    const index = fullName.lastIndexOf(".");
    const name = fullName.substring(index + 1);
    const pkg = fullName.substring(0, index);

    const client = await import("../client/node.js");

    const def = new NodeDefinition({name, package: pkg});

    client.save(def)
        .then(() => closeDialog("create-process"))
        .then(() => window.open(`/node/${fullName}`))
        .then(() => loadData("custom-node"))
        .catch(console.error);
}