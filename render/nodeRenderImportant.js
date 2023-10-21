import loadImage from "./loadImage.js";

/**
 * @param target {Konva.Group}
 * @param value {boolean}
 * */
export default async function (target, {value}) {
    let $important = target.findOne(".important")
    if ($important != null && !value) {
        $important.remove();
        return;
    }

    if ($important == null && value) {
        $important = await loadImage("warning_circle");
        $important.name("important");
        $important.scale({x: 0.65, y: 0.65});
        $important.x(10);
        $important.y(-15);

        $important.on("mouseenter", () => document.body.title = "important node");
        $important.on("mouseleave", () => document.body.title = "");

        target.add($important);
    }
}