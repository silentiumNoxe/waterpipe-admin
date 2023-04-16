if (!document.documentElement.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(console.error);
}

window.addEventListener("DOMContentLoaded", () => {
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
    const $container = document.createElement("div")
    $container.classList.add("card")
    $container.dataset.type = "process"
    $container.dataset.id = id;
    $container.addEventListener("click", () => {
        //todo: change url
        window.open(`/waterpipe-admin/process.html?process=${id}&v=1&_ijt=oe3cc42v78klhei3e6b2dja7e3&_ij_reload=RELOAD_ON_SAVE`);
    })

    const $top = document.createElement("div")
    $top.classList.add("top")

    const $img = document.createElement("img")
    $img.src = "../assets/process.png";
    $img.alt = "icon"
    $top.append($img)

    const $bottom = document.createElement("div")
    $bottom.classList.add("bottom")

    const $name = document.createElement("b")
    $name.textContent = "Test Process"
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