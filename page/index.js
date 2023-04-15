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

    const $top = document.createElement("div")
    $top.classList.add("top")

    const $img = document.createElement("img")
    $img.src = ""
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