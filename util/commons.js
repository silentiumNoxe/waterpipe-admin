const TIME_SECOND = 1000;

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

function NotifyPopup(level, message) {
    const $notify = document.getElementById("notify");
    if ($notify == null) {
        console.error("#notify element not found");
        return
    }

    const $message = document.createElement("article");
    $message.textContent = message;
    $message.classList.add(level);

    $notify.append($message);

    const timeoutId = setTimeout(() => $message.remove(), TIME_SECOND * 15);
    $message.addEventListener("click", () => {
        $message.remove();
        clearTimeout(timeoutId);
    });
}

NotifyPopup.SUCCESS = "success";
NotifyPopup.WARNING = "warning";
NotifyPopup.ERROR = "error";