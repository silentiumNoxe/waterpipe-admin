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

    localStorage.setItem("server-addr", $elem.value)
    document.getElementById("dialog-server-addr").remove();
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
    $p.classList.add("green")
    $p.classList.remove("hide")

    const $input = document.getElementById("host-server")
    $input.classList.add("error")
}