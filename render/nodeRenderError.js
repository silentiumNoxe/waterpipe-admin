import loadImage from "./loadImage.js";

/**
 * @param target {Konva.Group}
 * @param value {boolean}
 * @param reason {string}
 * */
export default async function (target, {value, reason}) {
    let $error = target.findOne(".error")
    if ($error != null && !value) {
        $error.remove();
        return;
    }

    if ($error == null && value) {
        $error = await loadImage("error_circle");
        $error.name("error");
        $error.scale({x: 0.65, y: 0.65});
        $error.x(40);
        $error.y(-15);

        $error.on("mouseenter", () => document.body.title = reason);
        $error.on("mouseleave", () => document.body.title = "");

        target.add($error);
    }
}