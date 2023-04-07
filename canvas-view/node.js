export default class NodeView extends Konva.Group {

    #center;
    lines = [];

    type = "";
    #title = "";

    #view = {}

    #fontSizeScale = 1;

    #important = false;

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
            document.body.style.cursor = "pointer";
        })
        this.on("mouseout", () => {
            document.body.style.cursor = "auto";
        })
    }

    #mainShape() {
        return new Konva.Rect({
            width: 300,
            height: 150,
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

    setPosition(pos) {
        const x = super.setPosition(pos);
        if (pos != null) {
            this.#updateCenter();
        }
        return x;
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

    width(val) {
        return this.#view.shape.width(val);
    }

    height(val) {
        return this.#view.shape.height(val);
    }

    set fontSizeScale(val) {
        this.#fontSizeScale = val;
        this.#view.title.fontSize(this.#view.title.ops.fontSize * val);
    }

    /**
     * @param val {boolean|null}
     * @return boolean
     * */
    important(val=null) {
        if (val == null) {
            return this.#important;
        }

        this.#important = val;
        if (this.#important === true) {
            this.#view.shape.fill(Konva.Color.WARNING);
        } else {
            this.#view.shape.fill(Konva.Color.LIGHT);
        }

        return this.#important;
    }

    /**
     * @param view {Konva.Node}
     * */
    put(view) {
        this.add(view);
    }

    /**
     * @return Konva.Rect
     * */
    get shape() {
        return this.#view.shape;
    }
}