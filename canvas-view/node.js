import * as client from "../client/node.js";
import renderNode from "../render/canvas/renderNode.js";

export default class NodeView extends Konva.Group {

    #center;

    /** @type Map<String,Konva.Line>*/
    lines = new Map();

    type = "";
    #title = "";

    #view = {}

    #fontSizeScale = 1;

    #important = false;

    /** @type boolean*/
    #selected;

    constructor() {
        super({
            x: 0,
            y: 0,
            draggable: true
        })

        const mainShape = this.#view.shape = this.#mainShape();

        this.add(mainShape);

        this.#updateCenter();

        this.on("dragmove", () => {
            this.#updateCenter()
            this.#updateLines();
        })
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
     * @param type {string}
     * @return Konva.Line
     * */
    connectTo(node, type) {
        const connectionButton = this.findOne("#" + type);
        if (connectionButton == null) {
            throw `not found button connection "${type}" in ${this.id()}`;
        }

        const removeDuplicatedLine = (type) => {
            const prefix = `${type}_${this.id()}`;
            this.lines.forEach((l, id) => {
                if (id.startsWith(prefix)) {
                    l.destroy()
                    this.lines.delete(id)
                }
            })
        }

        if (this.id() === node.id()) {
            removeDuplicatedLine(type);
            return null;
        }

        const line = new Konva.Line({
            points: [this.getPosition().x + connectionButton.getPosition().x, this.getPosition().y + connectionButton.getPosition().y, node.getCenter().x, node.getCenter().y],
            stroke: Konva.Color.LIGHT,
            strokeWidth: 2,
            id: `${type}_${this.id()}_${node.id()}`
        });

        line.from = () => {
            const x = this.getPosition().x + connectionButton.getPosition().x;
            const y = this.getPosition().y + connectionButton.getPosition().y;
            return {x, y};
        };

        line.to = () => node.getCenter();

        removeDuplicatedLine(type)

        this.lines.set(line.id(), line);
        node.lines.set(line.id(), line);

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
        const {x,y} = this.getPosition();
        const halfWidth = this.#view.shape.width() / 2;
        const halfHeight = this.#view.shape.height() / 2;
        this.#center = {x: x + halfWidth, y: y + halfHeight}
    }

    #updateLines() {
        this.lines.forEach(line => {
            const from = line.from();
            const to = line.to();
            if (from == null || to == null) {
                console.debug("line", this.id(), from, to);
                return
            }
            line.points([from.x, from.y, to.x, to.y]);
        })
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
    important(val = null) {
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

    /**
     * @param val {boolean}
     * */
    set selected(val) {
        this.#selected = val;

        if (this.#selected) {
            this.#view.shape.fill(Konva.Color.BLUE2);
            return;
        }

        this.fillDefaultColor();
    }

    get selected() {
        return this.#selected;
    }

    fillDefaultColor() {
        let color = Konva.Color.LIGHT;
        if (this.#important) {
            color = Konva.Color.WARNING;
        }

        this.#view.shape.fill(color);
    }

    destroy() {
        this.lines.forEach(x => x.destroy());
        return super.destroy();
    }

    equal(x) {
        if (!(x instanceof NodeView)) {
            return false
        }

        if (x.id == null) {
            return false
        }

        return this.id() === x.id();
    }
}

/**
 * @param data {ProcessNode}
 * @return Promise<NodeView>
 * */
export async function render(data) {
    const def = await client.getDefinition(data.type);
    if (def.render == null) {
        def.render = {};
    }

    def.render.important = def.important;

    const node = renderNode(def.render, data);
    node.data = data;
    node.definition = def;
    return node;
}