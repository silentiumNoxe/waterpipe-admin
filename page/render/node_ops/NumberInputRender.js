import FieldRender from "./FieldRender.js";

class NumberInputRender extends FieldRender {

    draw({definition, argument, onchange}) {
        const $fs = document.createElement("fieldset");
        $fs.classList.add("input");
        const $legend = document.createElement("legend");
        $legend.textContent = required ? name + "*" : name;
        const $input = document.createElement("input");
        $input.type = "number";
        $input.value = argument || definition.default;
        $input.addEventListener("keyup", e => {
            onchange(e.target.value);
        });

        $fs.append($legend);
        $fs.append($input);
        return $fs;
    }

    support(type) {
        return type === "number";
    }
}