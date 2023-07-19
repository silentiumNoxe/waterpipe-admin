(async function () {
    import("/component/ServerHealth.js").catch(console.error);
    import("/component/LineItem.js").catch(console.error);
    import("/component/dialog/CreateFile.js").catch(console.error);
})();

window.addEventListener("DOMContentLoaded", () => {
    loadData().catch(console.error);
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#filesystem > div[data-type='breadcrumbs'] > span")
        .addEventListener("click", x => {
            document.getElementById("filesystem").dataset.path = "root"
            document.querySelector("#filesystem > div[data-type='breadcrumbs']").innerHTML = "Root"
            drawFilesystem().catch(console.error)
        })
})

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#filesystem div[data-type='content']")
        .addEventListener("contextmenu", () => {
        console.debug("context menu requested")
    })
})

window.addEventListener("DOMContentLoaded", () => {
    for (const button of document.querySelectorAll("button")) {
        const dialog = button.dataset.dialog
        if (dialog == null || dialog === "") {
            continue
        }

        button.addEventListener("click", () => {
            startDialog(dialog).catch(console.error)
        })
    }
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
                result.push({path: `pipes.${x.package}.${x.name}`, name: x.version, type: "pipe", data: x})
            }
            return result;
        })
        .then(list => {
            for (const x of list) {
                const path = x.path.split(".")
                let folder = FS;
                let currentFolderPath = "root"
                for (let i = 0; i < path.length; i++) {
                    const p = path[i]
                    currentFolderPath += "."+p
                    if (p == null || p === "") {
                        continue
                    }

                    let entry = folder.getEntry(p)
                    if (entry == null) {
                        entry = new FSFolder(folder, currentFolderPath, p);
                        if (i === path.length-1) {
                            entry.type = "folder-pipe"
                        }
                        folder.put(entry);
                    }

                    folder = entry
                }

                folder.put(new FSFile(x.name, x.type, x.data));
            }
            return list
        })
        .then(drawFilesystem)
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
                result.push({path: "nodes."+x.package, name: x.name, type: "node", data: x})
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
        .then(drawFilesystem)
        .catch(console.error);
}

async function loadProcesses() {
    const client = await import("../client/process.js")
    return client.List()
}

async function loadCustomNodes() {
    const client = await import("/client/node.js")
    return client.list()
}

async function startDialog(context) {
    if (context === "create-file") {
        const x = document.createElement("dialog", {is: "waterpipe-create-file"})
        x.dataset.context = context
        document.body.append(x)
        x.showModal()
        return
    }

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

async function drawFilesystem() {
    const $filesystem = document.querySelector("#filesystem")
    const folder = getFolder($filesystem.dataset.path)

    drawBreadcrumbs($filesystem.dataset.path).catch(console.error)

    const $container = $filesystem.querySelector("div[data-type='content'] > [data-type='list']")
    $container.innerHTML = "";

    const render = {
        "folder-pipe": renderFolder,
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
    $elem.setAttribute("type", data.type)
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

        drawFilesystem();
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
    $elem.setAttribute("href", `/process/${data.data.id}/${data.data.version}`)
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
    $elem.setAttribute("href", `/node/${data.data.id}`)
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

async function drawBreadcrumbs(path) {
    console.debug("draw breadcrumbs", path)
    const $x = document.querySelector("#filesystem div[data-type='breadcrumbs']")
    $x.innerHTML = ""

    const steps = path.split(".")
    if (steps.length === 1) {
        const $a = document.createElement("span")
        $a.textContent = steps[0]
        $x.append($a)
        return
    }

    let currentPath = ""
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        currentPath += step+"."
        const $a = document.createElement("span")
        $a.innerText = step

        $x.append($a)

        if (i < steps.length-1) {
            $a.classList.add("clickable")
            $a.addEventListener("click", ((path) => {
                return () => {
                    console.debug("jump to", path)
                    document.querySelector("#filesystem").dataset.path = path.substring(0, path.length-1)
                    drawFilesystem()
                }
            })(currentPath))

            const $delimiter = document.createElement("span")
            $delimiter.classList.add("material-symbols-outlined")
            $delimiter.textContent = "chevron_right"
            $x.append($delimiter)
        }
    }
}