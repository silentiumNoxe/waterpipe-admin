export default class FieldView extends Konva.Group {

    constructor(index, {x, y, name, type}) {
        super({x, y, name: `field field-${index} field-type-${type}`});

        const label = this.label = new Konva.Text({
            name: "field-label",
            fill: Konva.Color.PRIMARY_INVERT,
            fontSize: 16,
            text: name,
            fontFamily: Konva.DEFAULT_FONT
        });

        this.add(label);

        const placeholder = this.placeholder = new FieldPlaceholderView(type);
        placeholder.x(label.width() + 10);
        placeholder.y(label.height() / 2 * -1)

        this.add(placeholder);
    }

    injectValue(node) {
        console.debug("inject value", node.id());
        this.placeholder.hide();

        const copy= this.injected = node.getInjectValueView(this);

        copy.addName("injected")
        copy.addName("ref-"+node.id())

        copy.x(this.label.width() + 10);
        copy.y(this.label.height() / 2 * -1)

        this.add(copy);
        node.hide();
    }

    resetInjectValue() {
        console.debug("reset inject value", this.injected.id());

        this.placeholder.show();
        this.injected.remove();
    }

    equals(x) {
        if (!(x instanceof FieldView)) {
            return false;
        }

        return this.id() === x.id() && this.name() === x.name();
    }
}