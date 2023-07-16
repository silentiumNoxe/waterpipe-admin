(async function () {
    console.debug("Load server health component");
    import("/component/ServerHealth.js").catch(console.error);
    import("/component/LineItem.js").catch(console.error);
})();

window.addEventListener("DOMContentLoaded", () => {
    loadData().catch(console.error);
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#filesystem > div[data-type='breadcrumbs'] > span")
        .addEventListener("click", x => {
            document.getElementById("filesystem").dataset.path = "root"
            document.querySelector("#filesystem > div[data-type='breadcrumbs']").innerHTML = "Root"
            drawFilesystemItem()
        })
})

class FSFolder {
    name;
    type = "folder";
    parent;
    pwd;
    #entries = [];

    constructor(parent, path, name) {
        this.name = name;
        this.parent = parent;
        this.path = path;
    }

    put(entry) {
        this.#entries.push(entry);
    }

    getEntry(name) {
        for (const x of this.#entries) {
            if (x.name === name) {
                return x;
            }
        }

        return null;
    }

    get entries() {
        return this.#entries;
    }
}

class FSFile {

    name;
    type;
    data;

    constructor(name, type, data) {
        this.name = name;
        this.type = type;
        this.data = data;
    }
}

const FS = new FSFolder("root");

//todo: make it lazy
async function loadData() {
    loadProcesses()
        .then(async list => {
            const client = await import("../client/process.js")
            const result = [];
            for (const x of list) {
                const versions = await client.GetVersions(x)
                for (const version of versions) {
                    const payload = await client.GetPayload(x, parseInt(version)) //todo: version should be string
                    result.push(payload)
                }
            }
            return result;
        })
        .then(list => {
            const result = [];
            for (const x of list) {
                result.push({path: `${x.package}.${x.name}`, name: x.version, type: "pipe", data: x})
            }
            return result;
        })
        .then(list => {
            for (const x of list) {
                const path = x.path.split(".")
                let folder = FS;
                let currentFolderPath = "root"
                for (const p of path) {
                    currentFolderPath += "."+p
                    if (p == null || p === "") {
                        continue
                    }

                    let entry = folder.getEntry(p)
                    if (entry == null) {
                        entry = new FSFolder(folder, currentFolderPath, p);
                        folder.put(entry);
                    }

                    folder = entry
                }

                folder.put(new FSFile(x.name, x.type, x.data));
            }
            return list
        })
        .then(drawFilesystemItem)
        .catch(console.error)

    loadCustomNodes()
        .then(async list => {
            const client = await import("../client/node.js")
            const result = [];
            for (const x of list) {
                const def = await client.getDefinition(x)
                result.push(def)
            }
            return result;
        })
        .then(list => {
            const result = [];
            for (const x of list) {
                result.push({path: x.package, name: x.name, type: "node", data: x})
            }
            return result;
        })
        .then(list => {
            for (const x of list) {
                const path = x.path.split(".")
                let folder = FS;
                let currentFolderPath = "root";
                for (const p of path) {
                    currentFolderPath += "."+p

                    if (p == null || p === "") {
                        continue
                    }

                    let entry = folder.getEntry(p)
                    if (entry == null) {
                        entry = new FSFolder(folder, currentFolderPath, p);
                        folder.put(entry)
                    }

                    folder = entry
                }

                folder.put(new FSFile(x.name, x.type, x.data));
            }
            return list
        })
        .then(drawFilesystemItem)
        .catch(console.error);
}

async function loadProcesses() {
    const client = await import("../client/process.js")
    return client.List()
}

async function drawProcess(id) {
    const client = await import("../client/process.js")
    const payload = await client.GetPayload(id, 1)

    const $container = document.createElement("div")
    $container.classList.add("line")
    $container.dataset.type = "process"
    $container.dataset.id = id;
    $container.addEventListener("click", () => {
        window.open(`/process/${id}/1`);
    })

    const $name = document.createElement("b")
    $name.dataset.type = "name";
    $name.innerHTML = "<span class='material-symbols-outlined'>schema</span>" + payload.name;
    $container.append($name)

    document.querySelector("#filesystem > div[data-type='content'] > div[data-type='list']").append($container)
}

async function loadCustomNodes() {
    const client = await import("/client/node.js")
    return client.list()
}

async function drawCustomNode(id) {
    const $container = document.createElement("div")
    $container.classList.add("line")
    $container.dataset.type = "custom_node"
    $container.dataset.id = id;
    $container.addEventListener("click", () => {
        window.open(`/node/${id}`);
    })

    const $name = document.createElement("b")
    $name.dataset.type = "name";
    $name.innerHTML = "<span class='material-symbols-outlined'>category</span>" + id;
    $container.append($name)

    document.querySelector("#filesystem > div[data-type='content'] > div[data-type='list']").append($container)
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

function drawFilesystemItem() {
    const $filesystem = document.querySelector("#filesystem")
    const folder = getFolder($filesystem.dataset.path)

    const $container = $filesystem.querySelector("div[data-type='content'] > [data-type='list']")
    $container.innerHTML = "";

    const render = {
        folder: renderFolder,
        pipe: renderPipe,
        node: renderNode
    }

    const list = folder.entries.sort((a, b) => {
        if (a.name > b.name) {
            return 1
        }

        if (a.name < b.name) {
            return -1
        }

        return 0
    })

    for (const entry of list) {
        const view = render[entry.type](entry, $filesystem.dataset.path)
        $container.append(view);
    }
}

/**
 * @param data {FSFolder}
 * @param path {string}
 * @return HTMLElement
 * */
function renderFolder(data, path) {
    const $elem = document.createElement("waterpipe-line-item")
    $elem.setAttribute("type", "folder")
    $elem.setAttribute("name", data.name)

    $elem.addEventListener("dblclick", () => {
        document.querySelector("#filesystem").dataset.path += "." + data.name;

        const $breadcrumbs = document.querySelector("#filesystem > div[data-type='breadcrumbs']")
        const $a = document.createElement("span")
        $a.innerHTML = "> " + data.name
        $a.dataset.path = path + "." + data.name;
        $a.addEventListener("click", event => {
            document.getElementById("filesystem").dataset.path = event.target.dataset.path;
            document.querySelector("#filesystem div[data-type='breadcrumbs']").
            drawFilesystemItem()
        })

        $breadcrumbs.append($a)

        drawFilesystemItem();
    })

    return $elem;
}

/**
 * @param data {FSFile}
 * @return HTMLElement
 * */
function renderPipe(data) {
    const $elem = document.createElement("waterpipe-line-item")
    $elem.setAttribute("type", "pipe")
    $elem.setAttribute("name", data.name)
    $elem.setAttribute("author", data.data.author)
    $elem.setAttribute("timestamp", data.data.createdAt)
    return $elem
}

/**
 * @param data {FSFile}
 * @return HTMLElement
 * */
function renderNode(data) {
    const $elem = document.createElement("waterpipe-line-item")
    $elem.setAttribute("type", "node")
    $elem.setAttribute("name", data.name)
    $elem.setAttribute("author", data.data.author)
    $elem.setAttribute("timestamp", data.data.createdAt)
    return $elem
}

/** @return FSFolder */
function getFolder(breadcrumbs) {
    const path = breadcrumbs.split(".")
    let folder = FS
    for (let i = 0; i < path.length; i++) {
        if (i === 0) {
            continue
        }

        const x = folder.getEntry(path[i])
        if (x === null) {
            throw `not found folder ${breadcrumbs}`
        }
        folder = x
    }

    return folder;
}

function drawBreadcrumbs(path) {
    const $x = document.querySelector("#filesystem div[data-type='breadcrumbs']")
    $x.innerHTML = ""

    let pathX = ""
    for (const step of path.split(".")) {
        pathX += step+"."
        const x = document.createElement("span")
        x.innerText = "> "+step
        x.addEventListener("click", () => {
            document.querySelector("#filesystem").dataset.path = pathX.substring(0, pathX.length-1)
        })

        $x.append(x)
    }
}