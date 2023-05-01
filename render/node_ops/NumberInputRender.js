import FieldRender from "./FieldRender.js";

export default class NumberInputRender extends FieldRender {

    draw({rules, title, argument, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = rules.required ? title + "*" : title;
        const $input = document.createElement("input");
        $input.type = "number";
        $input.value = argument || 0;
        $input.addEventListener("keyup", e => {
            onchange(e.target.value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    support(definition) {
        return definition.view === "number";
    }
}