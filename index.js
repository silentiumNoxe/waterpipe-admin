(function () {
    const host = localStorage.getItem("server-addr");
    if (host != null || host !== "") {
        document.getElementById("dialog-server-addr").classList.add("hide");
    }

    connectedServer(host);
})();

function applyServer() {
    const $elem = document.getElementById("host-server")
    if ($elem == null) {
        console.error("host-server input not found")
        return
    }

    if ($elem.value === "") {
        setTimeout(() => testServerError("address not specified"))
        return;
    }

    const host = $elem.value;

    localStorage.setItem("server-addr", host)
    document.getElementById("dialog-server-addr").classList.add("hide");
    connectedServer(host);
}

function testServer() {
    const $elem = document.getElementById("host-server")
    if ($elem == null) {
        console.error("host-server input not found")
        return
    }

    if ($elem.value === "") {
        setTimeout(() => testServerError("address not specified"))
        return;
    }

    const addr = $elem.value;
    fetch(`${addr}/health`, {mode: "cors"})
        .then(resp => {
            if (resp.status !== 200) {
                setTimeout(() => testServerError("server unavailable"))
                return
            }

            const $p = document.getElementById("message");
            $p.innerText = "success";
            $p.classList.remove("hide")
            $p.classList.remove("red")
            $p.classList.add("green")

            const $input = document.getElementById("host-server")
            $input.classList.add("success")
        })
        .catch(e => {
            console.error(e);
            setTimeout(() => testServerError("server unavailable"))
        })
}

function testServerError(msg) {
    const $p = document.getElementById("message");
    $p.innerText = msg;
    $p.classList.add("red")
    $p.classList.remove("green")
    $p.classList.remove("hide")

    const $input = document.getElementById("host-server")
    $input.classList.add("error")
    $input.classList.remove("success")
}

function showSelectServerDialog() {
    const $elem = document.getElementById("dialog-server-addr");
    $elem.classList.remove("hide");
    document.getElementById("host-server").value = localStorage.getItem("server-addr");
}

function connectedServer(addr) {
    const $elem = document.getElementById("connected-server");
    $elem.innerText = addr;

    document.querySelector(".loader").classList.remove("hide")
}