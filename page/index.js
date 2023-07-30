(function () {
    const x = sessionStorage.getItem("breadcrumbs");
    if (x == null || x === "") {
        sessionStorage.setItem("breadcrumbs", "root");
    }
})();

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

//Create node file
window.addEventListener("createfile", async event => {
    const data = event.detail
    if (data == null) {
        console.warn("Missed file creation data")
        return
    }


    const isNodeDir = new RegExp("^root\\.nodes\\.").test(data.path)
    if (!isNodeDir) {
        return
    }

    const client = (await import("../client/node.js"))
    const NodeDefinition = (await import("../model/NodeDefinition.js")).default

    let pkg = data.path
    let folder = mkdirAll(data.path)

    pkg = pkg.replace(new RegExp("^root\\.\\w+\\."), "")
    if (pkg.length > 0 && !pkg.endsWith(".")) {
        pkg += "."
    }

    let qualifier = data.name
    if (pkg.length > 0) {
        qualifier = pkg + qualifier
    }

    const file = new FSFile(data.name, "node", new NodeDefinition({
        name: data.name,
        package: pkg,
        author: "Me",
        createdAt: new Date()
    }))
    folder.put(file)

    await client.save(file.data)

    setTimeout(() => drawFilesystem())
    window.open(`/node/${qualifier}`)
})

//Create pipe file
window.addEventListener("createfile", async event => {
    const data = event.detail
    if (data == null) {
        console.warn("Missed file creation data")
        return
    }


    const isPipeDir = new RegExp("^root\\.pipes\\.").test(data.path)
    if (!isPipeDir) {
        return
    }

    const client = (await import("../client/process.js"))
    const Process = (await import("../model/Process.js")).default

    let pkg = data.path
    let folder = mkdirAll(data.path)

    pkg = pkg.replace(new RegExp("^root\\.\\w+\\."), "")
    if (pkg.length > 0 && !pkg.endsWith(".")) {
        pkg += "."
    }

    const uuid = crypto.randomUUID()
    const version = 1 //todo: must be string (v0.1)

    const pipeDir = new FSFolder(null, null, data.name)
    pipeDir.type = "folder-pipe"
    folder.put(pipeDir)

    const file = new FSFile(version, "pipe", Process.empty(pkg.replace(new RegExp("\\.$"), ""), data.name, "me"))
    pipeDir.put(file)

    await client.Save(file.data, 1)

    setTimeout(() => drawFilesystem())
    window.open(`/pipe/${uuid}/${version}`)
})

class FSFolder {
    name;
    type = "folder";
    #entries = [];
    meta = {};

    constructor(__, _, name, meta={}) {
        this.name = name;
        this.meta = meta;
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

const FS = new FSFolder(null, null, "root");

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
                    currentFolderPath += "." + p
                    if (p == null || p === "") {
                        continue
                    }

                    let entry = folder.getEntry(p)
                    if (entry == null) {
                        entry = new FSFolder(folder, currentFolderPath, p);
                        if (i === path.length - 1) {
                            entry.meta.isPipe = true;
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
                result.push({path: "nodes." + x.package, name: x.name, type: "node", data: x})
            }
            return result;
        })
        .then(list => {
            for (const x of list) {
                const path = x.path.split(".")
                let folder = FS;
                let currentFolderPath = "root";
                for (const p of path) {
                    currentFolderPath += "." + p

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
        const path = document.querySelector("#filesystem").dataset.path;
        const x = document.createElement("dialog", {is: "waterpipe-create-file"})
        x.dataset.context = context
        x.setAttribute("path", path)
        document.body.append(x)
        x.showModal()

        x.addEventListener("close", async e => {
            if (e.target.returnValue == null || e.target.returnValue === "" || !e.target.returnValue.startsWith("{")) {
                return
            }

            window.dispatchEvent(new CustomEvent("createfile", {detail: JSON.parse(e.target.returnValue)}))
        })
        return
    }

    const $dialog = document.querySelector(`dialog[data-context="${context}"]`);
    if ($dialog == null) {
        console.error("Dialog ", context, "not found");
        return
    }
    $dialog.open = true;
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

async function drawFilesystem() {
    const $filesystem = document.querySelector("#filesystem")
    const folder = getFolder(sessionStorage.getItem("breadcrumbs"))

    drawBreadcrumbs(sessionStorage.getItem("breadcrumbs")).catch(console.error);

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

    for (const i in list) {
        const entry = list[i];
        const view = render[entry.type](entry, $filesystem.dataset.path);
        view.tabIndex = i+1;
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
    if (data.meta.isPipe) {
        $elem.setAttribute("type", "folder-pipe")
    }
    $elem.setAttribute("name", data.name)

    $elem.addEventListener("dblclick", () => {
        const path = sessionStorage.getItem("breadcrumbs");
        sessionStorage.setItem("breadcrumbs", path + "." + data.name);
        sessionStorage.setItem("is_pipe", "true")
        drawFilesystem().catch(console.error)
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
    breadcrumbs = breadcrumbs.replace(new RegExp("\\.$"), "")
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

function mkdirAll(path) {
    path = path.replace(new RegExp("\\.$"), "")
    const steps = path.split(".")
    let folder = FS
    for (let i = 0; i < steps.length; i++) {
        if (i === 0) {
            continue
        }

        let x = folder.getEntry(steps[i])
        if (x == null) {
            x = new FSFolder(null, null, steps[i]);
            folder.put(x)
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
        hideCreateButton()
        return
    }

    let currentPath = ""
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        currentPath += step + "."
        const $a = document.createElement("span")
        $a.innerText = step

        $x.append($a)

        if (i < steps.length - 1) {
            $a.classList.add("clickable")
            $a.addEventListener("click", ((path) => {
                return () => {
                    sessionStorage.setItem("breadcrumbs", path.substring(0, path.length-1));
                    sessionStorage.setItem("is_pipe", "false")
                    drawFilesystem()
                }
            })(currentPath))

            const $delimiter = document.createElement("span")
            $delimiter.classList.add("material-symbols-outlined")
            $delimiter.textContent = "chevron_right"
            $x.append($delimiter)
        }
    }

    showCreateButton()

    if (sessionStorage.getItem("is_pipe") === "true") {
        hideCreateButton()
    }
}

function showCreateButton() {
    document.querySelector("button[data-action='create']").classList.remove("hide")
}

function hideCreateButton() {
    document.querySelector("button[data-action='create']").classList.add("hide")
}