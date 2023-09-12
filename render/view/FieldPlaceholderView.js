export default class FieldPlaceholderView extends Konva.Group {

    constructor(typeName) {
        super({name: "placeholder"});

        this.type = typeName;

        const title = this.title = new Konva.Text({
            x: 10,
            y: 8,
            name: "placeholder-label",
            fill: Konva.Color.PRIMARY_INVERT_2,
            fontSize: 14,
            text: typeName,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT
        });

        const shape = this.shape = new Konva.Rect({
            width: title.width() + title.x() * 2,
            height: title.height() + title.y() * 2,
            name: "placeholder-shape",
            fill: Konva.Color.PRIMARY_LIGHT_1,
            cornerRadius: 10
        });

        this.add(shape, title);

        this.width(shape.width());
        this.height(shape.height());
    }

    resetInteraction() {
        this.shape.fill(Konva.Color.PRIMARY_LIGHT_1);
        this.title.fill(Konva.Color.PRIMARY_INVERT_2);
    }

    /**
     * @param x {PipeNodeInjectView}
     * @return boolean - successful interaction
     * */
    interact(x) {
        if (this.type === x.injectType) {
            this.shape.fill(Konva.Color.SUCCESS);
            this.title.fill(Konva.Color.PRIMARY);
            return true;
        }

        this.shape.fill(Konva.Color.ERROR);
        this.title.fill(Konva.Color.PRIMARY);
        return false;
    }
}