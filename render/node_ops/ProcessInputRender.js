import FieldRender from "./FieldRender.js";
import * as client from "../../client/process.js";

export default class ProcessInputRender extends FieldRender {

    draw({rules, title, argument, onchange}) {
        if (rules == null) {
            throw "Missed render rules";
        }

        const $container = document.createElement("fieldset")
        const $legend = document.createElement("legend")
        $legend.textContent = rules.required ? title + "*" : title;
        $container.append($legend)

        $container.classList.add("process_selector");

        const $value = document.createElement("span")
        if (argument == null) {
            argument = "";
        }
        $value.textContent = argument+"";
        $container.append($value);

        const $open = document.createElement("span")
        $open.textContent = "<open>";
        $container.append($value);

        $container.addEventListener("click", async () => {
            const idList = await client.List();
            /** @type Array<Process>*/
            const processList = [];
            for (const id of idList) {
                processList.push(await client.GetPayload(id, 1));// todo: always version 1
            }

            const $datalist = document.querySelector("div[data-list='process']")
            $datalist.innerHTML = "";

            const $inputId = document.querySelector("#process-selector input[data-type='process-id']")

            const $inputName = document.querySelector("#process-selector input[data-type='process-name']")
            $inputName.oninput = () => {
                const value = $inputName.value;
                $datalist.childNodes.forEach(ch => {
                    ch.hidden = ch.textContent.indexOf(value) === -1;
                    if (ch.textContent === value) {
                        $inputId.value = ch.dataset.id;
                    }
                })
            }

            const optionList = [];
            for (const x of processList) {
                const $process = document.createElement("div")
                $process.addEventListener("click", e => {
                    $inputName.value = e.target.textContent;
                    $inputId.value = e.target.dataset.id;
                })
                let name = x.name;
                if (x.path != null || x.path !== "") {
                    name = x.path + name;
                }
                $process.textContent = name;

                $process.dataset.id = x.id;

                optionList.push($process);
            }

            $datalist.append(...optionList);

            const response = await startDialog("process-selector");
            $value.textContent = response.process_id;
        })

        return $container;
    }

    support(ops) {
        return ops.view === "process_selector";
    }

    /**
     * @param id {string}
     * @return boolean
     * */
    #validate(id) {
        const reg = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        return reg.test(id)
    }
}