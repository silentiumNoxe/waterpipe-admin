function isNumber(value) {
    if (typeof value !== "string") {
        return false;
    }
    return !isNaN(value) && !isNaN(parseFloat(value))
}

function updateServer(url) {
    if (url == null || url === "") {
        throw "invalid url";
    }

    localStorage.setItem("server-addr", url); //todo: use indexeddb
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