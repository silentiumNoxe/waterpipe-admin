window.addEventListener("DOMContentLoaded", () => {
    showConnectedServer();
    loadData("process")
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

    console.warn("Unknown data type - ", dataType)
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
    const client = await import("../client/node.js")
    return client.List()
}

async function drawCustomNode(id) {

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

        fetch(addr+"/health")
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