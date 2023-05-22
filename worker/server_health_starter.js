export default function startServerHealthWorker() {
    const serverHealthWorker = new SharedWorker("/worker/server_health.js", {
        type: "module",
        name: "server_healthcheck"
    });

    window.checkHealth = function () {
        serverHealthWorker.port.postMessage({action: "force"});
    }

    const _updateServer = window.updateServer;
    window.updateServer = function (url) {
        _updateServer(url);
        serverHealthWorker.port.postMessage({action: "update", url});
        checkHealth();
    }

    serverHealthWorker.port.start();
    serverHealthWorker.addEventListener("error", console.error);
    serverHealthWorker.port.addEventListener("message", e => {
        const resp = e.data;
        if (resp.status !== "online") {
            console.warn("got health resp", resp);
        }
        showServerHealth(resp.status, resp.url, resp.msg);
    });
    serverHealthWorker.port.addEventListener("messageerror", console.error);

    updateServer(localStorage.getItem("server-addr"));
    checkHealth();
}

function showServerHealth(status, url, msg) {
    function offline() {
        const $elem = document.querySelector("[data-type='server-addr']")
        $elem.classList.remove("success")
        $elem.classList.remove("error")
        $elem.classList.add("warning")
        $elem.title = msg;
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

    switch (status) {
        case "offline":
            offline();
            break;
        case "online":
            connected(url);
            break;
        case "error":
            error(msg);
            break;
    }
}