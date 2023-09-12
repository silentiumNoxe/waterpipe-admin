export default class PipeNodeInjectView extends Konva.Group {

    injectType;

    constructor({x, y, id, type, title}) {
        super({x, y, id, name: `inject-node inject-type-${type}`, listening: true, draggable: true});
        this.injectType = type;
        this.title = title;

        const titleView = new Konva.Text({
            x: 10,
            y: 8,
            name: "inject-title",
            fill: Konva.Color.PRIMARY,
            fontSize: 14,
            text: title,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT
        });

        this.add(new Konva.Rect({
            width: titleView.width() + titleView.x() * 2,
            height: titleView.height() + titleView.y() * 2,
            name: "inject-shape",
            fill: Konva.Color.PRIMARY_INVERT,
            cornerRadius: 10,
            overflow: "hidden"
        }));

        this.add(titleView);

        this.on("dragstart", e => changeLayer(TopLayer, e.target));
        this.on("dragstart", e => e.target.listTarget = MidLayer.find(".field"))

        this.on("dragend", e => changeLayer(MidLayer, e.target));
        this.on("dragend", e => e.target.listTarget = null);
        this.on("dragend", e => {
            const interacted = e.target.interacted;
            if (interacted == null || !e.target.interactionSuccess) {
                return;
            }

            e.target.fire("injected", {field: interacted});
        })

        this.on("dragmove", e => {
            const target = e.target;
            if (target.listTarget == null || target.listTarget.length === 0) {
                debug("warning", "no list of targets");
                return;
            }

            const rect = target.getClientRect();
            for (const x of target.listTarget) {
                if (this.#haveIntersection(x.getClientRect(), rect)) {
                    this.#interactWith(x);
                    return;
                }
            }

            this.#interactWith(null);
        })

        this.on("injected", e => {
            if (e.field == null) {
                return;
            }

            e.field.injectValue(e.target);
        })
    }

    /** @return Konva.Group */
    getInjectValueView(field) {
        if (field == null) {
            throw new Error("required non null value - field is null");
        }
        const group = new Konva.Group({id: "copy:"+this.id(), name: this.name(), listening: true, draggable: false});
        group.field = field;

        const titleView = new Konva.Text({
            x: 10,
            y: 8,
            name: "inject-title",
            fill: Konva.Color.PRIMARY,
            fontSize: 14,
            text: this.title,
            fontStyle: "bold",
            fontFamily: Konva.DEFAULT_FONT,
            listening: false,
        });

        const shape = new Konva.Rect({
            width: titleView.width() + titleView.x() * 2,
            height: titleView.height() + titleView.y() * 2,
            name: "inject-shape",
            fill: Konva.Color.PRIMARY_INVERT,
            cornerRadius: 10,
            overflow: "hidden",
            listening: true
        })

        group.add(shape, titleView);

        shape.on("dblclick", e => {
            const origin = MidLayer.find("#"+group.id().substring("copy:".length))[0];
            if (origin == null) {
                throw new Error("not found origin: " + group.id());
            }

            const pos = group.absolutePosition();
            origin.position({x: pos.x+10, y: pos.y+10});
            origin.moveToTop()

            group.field.resetInjectValue();
            origin.show();
        })

        return group;
    }

    #haveIntersection(a, b) {
        return !(
            b.x > a.x + a.width ||
            b.x + b.width < a.x ||
            b.y > a.y + a.height ||
            b.y + b.height < a.y
        );
    }

    #interactWith(target) {
        if (this.interacted != null && !this.interacted.equals(target)) {
            setTimeout(((x, node) => {
                return () => {
                    if (node.interacted != null && node.interacted.equals(x)) {
                        return;
                    }

                    const p = x.find(".placeholder")[0];
                    if (p == null) {
                        console.warn("no placeholder", node.id);
                        return;
                    }

                    p.resetInteraction();
                }
            })(this.interacted, this), 0);
        }

        this.interacted = target;

        if (target == null) {
            return;
        }

        const placeholder = target.find(".placeholder").at(0);
        this.interactionSuccess = placeholder.interact(this);
    }
}