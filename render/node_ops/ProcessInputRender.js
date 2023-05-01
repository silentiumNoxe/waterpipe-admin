import FieldRender from "./FieldRender.js";
import * as client from "../../client/process.js";
import * as util from "/util/module.js";

export default class ProcessInputRender extends FieldRender {

    draw({rules, title, argument, onchange}) {
        if (rules == null) {
            throw "Missed render rules";
        }

        if (argument == null) {
            argument = "";
        }

        if (typeof argument !== "string") {
            throw "illegal argument type - expected string";
        }

        const $container = document.createElement("fieldset")
        $container.classList.add("pointer");

        const $legend = document.createElement("legend")
        $legend.textContent = rules.required ? title + "*" : title;
        $container.append($legend);

        const $input = document.createElement("input")
        $input.dataset.type = "process_id";
        $input.hidden = true;
        $input.value = argument+"";
        $container.append($input);

        const getProcessId = () => {
            return $input.value;
        }

        $container.classList.add("process_selector");

        const $value = document.createElement("span")
        $value.textContent = argument+"";
        $container.append($value);

        if (util.validateUUID(argument)) {
            (async function() {
                const process = await client.GetPayload(argument, 1);
                let name = process.name;
                if (process.path != null && process.path !== "") {
                    name = process.path + name;
                }
                $value.textContent = name;
            })()
        }

        const $open = document.createElement("button")
        $open.textContent = "open";
        $open.classList.add("float-right");
        $open.classList.add("pill");
        $open.addEventListener("click", e => {
            e.preventDefault(); //todo: bug - not working
            window.open(`/process/${getProcessId()}/1`);
        })
        $container.append($open);

        $container.addEventListener("click", async () => {
            const response = await startDialog("process-selector");

            if (util.validateUUID(response.process_id)) {
                (async function(processId) {
                    const process = await client.GetPayload(processId, 1);
                    let name = process.name;
                    if (process.path != null && process.path !== "") {
                        name = process.path + name;
                    }
                    $value.textContent = name;
                })(response.process_id).catch(console.error);

                $value.textContent = response.process_id;
                onchange(response.process_id);
            }
        })

        return $container;
    }

    support(ops) {
        return ops.view === "process_selector";
    }
}