import FieldView from "./FieldView.js";

const stepSize = 25;

export default class PipeNodeView extends Konva.Group {

    #definition;
    #data;

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

        (async function (node) {
            const shape = new Konva.Rect({
                name: "node-shape",
                fill: Konva.Color.PRIMARY_LIGHT_2,
                cornerRadius: 25,
                overflow: "hidden"
            });

            node.add(shape);

            const title = await node.#buildTitle(data.title, data.type, node.#definition.render);

            node.add(title);
            node.height(title.height()+title.y()+15);

            const fieldsContainer = new Konva.Group({x: 20, y: title.height()+title.y()+20, name: "fields-container"});

            const keys = node.#definition.args.keys();
            let i = 0;
            while (i < node.#definition.args.size) {
                const key = keys.next().value;
                if (key == null) {
                    break;
                }

                const def = node.#definition.args.get(key);

                const f = new FieldView(i,{x: 0, y: i * 40, name: key, type: def.type});
                fieldsContainer.add(f);
                fieldsContainer.height(f.height()+f.y());
                i++;
            }

            if (fieldsContainer.hasChildren()) {
                node.add(fieldsContainer);
                node.height(fieldsContainer.height()+fieldsContainer.y()+40);
            }

            if (node.#definition.important) {
                console.debug("render important icon");
                const important = await loadImage("/assets/icon/warning_circle.svg");
                important.scale({x: 0.5, y: 0.5});
                important.position({x: 0, y: -10});
                node.add(important);
            }

            node.width(title.width()+title.x());

            shape.width(node.width()+30);
            shape.height(node.height());
        })(this);
    }

    async #buildTitle(title, type, {icon}) {
        const group = new Konva.Group({x: 15, y: 10, name: "title"});

        let image;
        if (icon) {
            image = await loadImage("/assets/icon/"+icon+".svg");
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
            y: titleText.y()+titleText.height(),
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
        group.height(titleText.height()+typeText.height());

        return group;
    }
}

/** @return Promise<Konva.Image>*/
async function loadImage(path) {
    return new Promise((resolve, reject) => Konva.Image.fromURL(path, resolve, reject));
}