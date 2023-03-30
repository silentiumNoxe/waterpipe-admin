export default class NodeView extends Konva.Group {

    #center;
    lines = [];

    type = "";
    #title = "";

    #view = {}

    constructor() {
        super({
            x: 0,
            y: 0,
            draggable: true
        })

        const mainShape = this.#view.shape = this.#mainShape();

        this.add(mainShape);

        this.#updateCenter();

        this.on("dragmove", this.#updateCenter)
        this.on("dragmove", this.#updateLines)
        this.on("mouseover", () => {
        })
    }

    #mainShape() {
        return new Konva.Rect({
            width: 200,
            height: 90,
            fill: Konva.Color.LIGHT,
            cornerRadius: 10,
            overflow: "hidden"
        });
    }

    getCenter() {
        return this.#center;
    }

    /**
     * @param node {NodeView}
     * @return Konva.Line
     * */
    connectTo(node) {
        const line = new Konva.Line({
            points: [this.getCenter().x, this.getCenter().y, node.getCenter().x, node.getCenter().y],
            stroke: Konva.Color.LIGHT,
            strokeWidth: 2,
            id: `${this.id()}_${node.id()}`
        });

        line.from = this;
        line.to = node;

        this.lines.push(line);
        node.lines.push(line);

        return line;
    }

    #updateCenter() {
        this.#center = {x: this.x() + this.#view.shape.width() / 2, y: this.y() + this.#view.shape.height() / 2}
    }

    #updateLines() {
        if (this.lines.length === 0) {
            return
        }

        for (const line of this.lines) {
            const from = line.from.getCenter();
            const to = line.to.getCenter();
            line.points([from.x, from.y, to.x, to.y]);
        }
    }

    set title(val) {
        this.#title = val;
        if (this.#view.title == null) {
            /** @type Konva.Text*/
            const t = this.#view.title = new Konva.Text({
                padding: 10,
                width: this.#view.shape.width(),
                align: "center",
                fontSize: 18,
                fontFamily: Konva.DEFAULT_FONT
            })

            this.add(t);
        }

        this.#view.title.text(val);
    }
}