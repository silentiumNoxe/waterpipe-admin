import loadImage from "./loadImage.js";

export default async function (target, {text, icon, pkg}) {
    if (!(target instanceof Konva.Group)) {
        console.warn("title is not instance of Konva.Group");
        return;
    }

    if (text == null || text === "") {
        throw new Error("title text is required");
    }

    let $icon = target.findOne(".icon");
    if ($icon != null && $icon.type !== icon) {
        $icon.remove();
        $icon = null;
    }
    if ($icon == null && icon != null) {
        $icon = await loadImage(icon);
        $icon.type = icon;
        $icon.name("icon");
        target.add($icon);
    }

    let $text = target.findOne(".text");
    if ($text == null && text != null) {
        $text = new Konva.Text({name: "text"});
        target.add($text);
    }

    let $package = target.findOne(".package")
    if ($package == null && pkg != null) {
        $package = new Konva.Text({name: "package"});
        target.add($package);
    }

    if ($icon != null) {
        $icon.x(15);
        $icon.y(7);
    }

    $text.x(20);
    $text.y(20);

    if ($icon != null) {
        $text.x($icon.x() + $icon.width() + 5);
    }

    $text.text(text);
    $text.fontFamily(Konva.DEFAULT_FONT);
    $text.fontSize(25);
    $text.fontStyle("bold");
    $text.align("left");
    $text.wrap("none");
    $text.fill(Konva.Color.PRIMARY_INVERT);

    if (text.length > 25) {
        $text.y(17);
        $text.fontSize(17);
    }

    if (text.length > 30) {
        $text.text(text.substring(0, 30) + "...");
        $text.on("mouseenter", () => document.body.title = text);
        $text.on("mouseleave", () => document.body.title = "");
    }

    if ($package != null) {
        $package.x($text.x());
        $package.y($text.y() + $text.height());
        $package.text(pkg);
        $package.fontFamily(Konva.DEFAULT_FONT);
        $package.fontSize(12);
        $package.align("left");
        $package.wrap("none");
        $package.fill(Konva.Color.PRIMARY_INVERT);
    }
}