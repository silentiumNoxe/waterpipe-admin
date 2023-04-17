import FieldRender from "./FieldRender.js";

export default class InputRender extends FieldRender {

    draw({rules, title, argument, onchange}) {
        if (rules == null) {
            throw "Missed render rules";
        }

        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = rules.required ? title + "*" : title;
        const $input = document.createElement("input");
        $input.addEventListener("keyup", e => onchange(e.target.value));

        let value = argument+"";
        switch (rules.dataType) {
            case "object":
                value = JSON.stringify(argument)
                break
        }

        $input.value = value;

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    support(ops) {
        return ops.view === "input";
    }
}