class Node extends Konva.Rect {

    #center;
    lines = [];

    constructor({x, y}) {
        super({
            x, y,
            width: 200,
            height: 90,
            fill: "#ffffff",
            stroke: "black",
            strokeWidth: 2,
            draggable: true,
            id: crypto.randomUUID()
        })

        this.#updateCenter();

        this.on("dragmove", this.#updateCenter)
        this.on("dragmove", this.#updateLines)
    }

    getCenter() {
        return this.#center;
    }

    /**
     * @param node {Node}
     * @return Konva.Line
     * */
    connectTo(node) {
        const line = new Konva.Line({
            points: [this.getCenter().x, this.getCenter().y, node.getCenter().x, node.getCenter().y],
            stroke: "black",
            strokeWidth: 2,
            fill: "black",
            id: `${this.id()}_${node.id()}`
        });

        line.from = this;
        line.to = node;

        this.lines.push(line);
        node.lines.push(line);

        return line;
    }

    #updateCenter() {
        this.#center = {x: this.x() + this.width()/2, y: this.y() + this.height()/2}
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
}