import FieldRender from "./FieldRender.js";

export default class BoolInputRender extends FieldRender {

    draw({definition, title, argument, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = definition.required ? title + "*" : title;
        const $input = document.createElement("input");
        $input.value = argument || definition.default;
        $input.addEventListener("keyup", e => {
            onchange(e.target.value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    support(definition) {
        return definition.type === "bool";
    }
}