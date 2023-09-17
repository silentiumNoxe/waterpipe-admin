import FieldView from "./FieldView.js";
import {start} from "../../worker/server_health/starter.js";

const stepSize = 0.1;

export default class PipeNodeView extends Konva.Group {

    #definition;
    #data;
    shape;

    nextId;

    /**
     * @param definition {NodeDefinition}
     * @param data {ProcessNode}
     * */
    constructor(definition, data) {
        super({
            x: data.position.x,
            y: data.position.y,
            id: data.id,
            name: "node",
            offsetX: 0.5,
            offsetY: 0.5,
            listening: true,
            draggable: true
        });

        this.#definition = definition;
        this.#data = data;
        if (data.next != null && data.next !== "00000000-0000-0000-0000-000000000000") {
            this.nextId = data.next;
        }

        this.on("mouseover", () => document.body.style.cursor = "grab");
        this.on("mouseout", () => document.body.style.cursor = "default");

        this.on("dragstart", e => changeLayer(TopLayer, e.target));
        this.on("dragend", e => changeLayer(MidLayer, e.target));

        this.on("dragmove", e => {
            const target = e.target;
            if (target.x() % stepSize !== 0) {
                target.x(target.x() - target.x() % stepSize)
            }
            if (target.y() % stepSize !== 0) {
                target.y(target.y() - target.y() % stepSize)
            }
        });

        this.on("dragmove", e => {
            BottomLayer.find(".line-" + e.target.id()).forEach(x => {
                if (x.update) {
                    x.update();
                }
            });
        });

        (async function (node) {
            const shape = node.shape = new Konva.Rect({
                name: "node-shape",
                fill: Konva.Color.PRIMARY_LIGHT_2,
                cornerRadius: 25,
                overflow: "hidden"
            });

            shape.on("click", e => {
                e.target = node;
                node.#startFocus(e);
            });

            node.add(shape);

            const title = await node.#buildTitle(data.title, data.type, node.#definition.render);

            node.add(title);
            node.height(title.height() + title.y() + 15);

            const fieldsContainer = new Konva.Group({
                x: 20,
                y: title.height() + title.y() + 20,
                name: "fields-container"
            });

            const keys = node.#definition.args.keys();
            let i = 0;
            while (i < node.#definition.args.size) {
                const key = keys.next().value;
                if (key == null) {
                    break;
                }

                const def = node.#definition.args.get(key);

                const f = new FieldView(i, {x: 0, y: i * 40, name: key, type: def.type});
                fieldsContainer.add(f);
                fieldsContainer.height(f.height() + f.y());
                i++;
            }

            if (fieldsContainer.hasChildren()) {
                node.add(fieldsContainer);
                node.height(fieldsContainer.height() + fieldsContainer.y() + 40);
            }

            if (node.#definition.important) {
                console.debug("render important icon");
                const important = await loadImage("/assets/icon/warning_circle.svg");
                important.scale({x: 0.5, y: 0.5});
                important.position({x: 0, y: -10});
                node.add(important);
            }

            node.width(title.width() + title.x());

            shape.width(node.width() + 30);
            shape.height(node.height());
        })(this);

        setTimeout(() => {
            if (this.nextId == null) {
                return;
            }

            const target = MidLayer.findOne("#" + this.nextId);
            if (target == null) {
                console.warn("no next node", this.nextId);
                return;
            }

            const group = new Konva.Group();

            group.addName("line-" + this.id());
            group.addName("line-" + target.id());

            group.nodeA = this;
            group.nodeB = target;

            const startLine = group.startLine = new Konva.Circle({
                radius: 5,
                offsetX: 0.5,
                offsetY: 0.5,
                fill: Konva.Color.PRIMARY_INVERT
            });

            const line = group.line = new Konva.Line({
                stroke: Konva.Color.PRIMARY_INVERT,
                strokeWidth: 3
            });

            group.add(line, startLine);

            BottomLayer.add(group);

            group.update = function () {
                const offset = 10;

                let {
                    width: aw,
                    height: ah,
                    x: ax,
                    y: ay
                } = Object.assign({}, this.nodeA.getClientRect({skipShadow: true, skipTransform: true}));

                let {
                    width: bw,
                    height: bh,
                    x: bx,
                    y: by
                } = Object.assign({}, this.nodeB.getClientRect({skipShadow: true, skipTransform: true}));

                const aRect = Object.assign({}, this.nodeA.getClientRect({skipShadow: true, skipTransform: true}));
                const bRect = Object.assign({}, this.nodeB.getClientRect({skipShadow: true, skipTransform: true}));

                function boundPosition(rect, pos, offset) {
                    let x = pos.x;
                    let y = pos.y;

                    if (pos.x < rect.x-offset) {
                        x = rect.x-offset-100;
                    }

                    if (pos.x > rect.x + rect.width + offset) {
                        x = rect.x + rect.width + offset;
                    }

                    if (pos.y < rect.y-offset) {
                        y = rect.y-offset;
                    }

                    if (pos.y > rect.y + rect.height + offset) {
                        y = rect.y + rect.height + offset;
                    }

                    return {x, y};
                }


                let x1 = ax;
                let x2 = bx;
                let y1 = ay;
                let y2 = by;

                if (y1 < y2) {
                    y1 = y2
                }

                if (x1 < x2) {
                    x1 = x2
                }

                let p = boundPosition(aRect, {x: x1, y: y1}, offset);
                x1 = p.x;
                y1 = p.y;

                if (y2 < y1) {
                    y2 = y1
                }

                if (x2 < x1) {
                    x2 = x1
                }

                p = boundPosition(bRect, {x: x2, y: y2}, offset);
                x2 = p.x;
                y2 = p.y;

                this.startLine.x(x1);
                this.startLine.y(y1);
                this.line.points([x1, y1, x2, y2]);
            }

            group.update();
        }, 300);
    }

    async #buildTitle(title, type, {icon}) {
        const group = new Konva.Group({x: 15, y: 10, name: "title"});

        let image;
        if (icon) {
            image = await loadImage("/assets/icon/" + icon + ".svg");
            image.position({x: 0, y: -6})
            group.add(image);
        }

        const titleText = new Konva.Text({
            fontFamily: Konva.DEFAULT_FONT,
            fontSize: 25,
            fontStyle: "bold",
            text: title,
            align: "left",
            wrap: "none",
            fill: Konva.Color.PRIMARY_INVERT,
        })

        if (image) {
            titleText.x(image.width() + 8);
        }

        const typeText = new Konva.Text({
            x: titleText.x(),
            y: titleText.y() + titleText.height(),
            fontFamily: Konva.DEFAULT_FONT,
            fontSize: 10,
            text: type,
            align: "left",
            wrap: "none",
            fill: Konva.Color.PRIMARY_INVERT
        })

        let width = titleText.width() > typeText.width() ? titleText.width() : typeText.width();
        if (image) {
            width += image.width()
        }

        group.add(titleText, typeText);
        group.width(width);
        group.height(titleText.height() + typeText.height());

        return group;
    }

    #startFocus(e) {
        if (!(e.target instanceof PipeNodeView)) {
            return;
        }

        e.cancelBubble = true;
        e.evt.preventDefault();

        if (e.target.focused) {
            return;
        }

        if (window.focusedNode && window.focusedNode.stopFocus) {
            window.focusedNode.stopFocus();
        }

        const node = e.target;

        node.focused = true;
        window.focusedNode = node;

        node.shape.strokeEnabled(true);
        node.shape.strokeWidth(3);
        node.shape.stroke(Konva.Color.BLUE);

        BottomLayer.find(".line-" + node.id()).forEach(x => {
            x.line.stroke(Konva.Color.BLUE);
            x.startLine.fill(Konva.Color.BLUE);
        });
    }

    stopFocus() {
        this.focused = false;
        this.shape.strokeEnabled(false);
        BottomLayer.find(".line-" + this.id()).forEach(x => {
            x.line.stroke(Konva.Color.PRIMARY_INVERT);
            x.startLine.fill(Konva.Color.PRIMARY_INVERT);
        });
    }

    getClientRect(config) {
        return Object.assign({}, this.shape.getClientRect(config), this.position());
    }
}

/** @return Promise<Konva.Image>*/
async function loadImage(path) {
    return new Promise((resolve, reject) => Konva.Image.fromURL(path, resolve, reject));
}