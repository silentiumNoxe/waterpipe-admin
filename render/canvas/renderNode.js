import NodeView from "../../canvas-view/node.js";
import Render from "../render.js";
import {nodeMenuRender} from "../node_menu.js";
import {getDefinition} from "../../client/node.js";
import PipeNodeView from "../view/PipeNodeView.js";
import PipeNodeInjectView from "../view/PipeNodeInjectView.js";

const stepSize = 50;

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
export default async function (def, node) {
    console.debug("render", node.type);

    if (def.injectable) {
        return renderInjectable(def, node);
    }

    return renderNode(def, node);
}

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
async function renderNode(def, node) {
    return new PipeNodeView(def, node);

    // const renderOps = def.render;
    //
    // const group = new Konva.Group({id: `node_${node.id}`, listening: true, draggable: true});
    // group.offset({x: 0.5, y: 0.5})
    // group.position(node.position);
    // group.on("mouseover", () => document.body.style.cursor = "grab");
    // group.on("mouseout", () => document.body.style.cursor = "default");
    // group.on("dragstart", e => {
    //     e.target.moveTo(window.TopLayer);
    //     window.TopLayer.draw();
    // })
    // group.on("dragend", e => {
    //     e.target.moveTo(window.MidLayer);
    //     window.MidLayer.draw();
    // })
    // group.on("dragmove", e => {
    //     const target = e.target;
    //     if (target.x() % stepSize !== 0) {
    //         target.x(target.x() - target.x() % stepSize)
    //     }
    //     if (target.y() % stepSize !== 0) {
    //         target.y(target.y() - target.y() % stepSize)
    //     }
    // })
    //
    // const shape = new Konva.Rect({
    //     name: "shape",
    //     fill: Konva.Color.PRIMARY_LIGHT_2,
    //     cornerRadius: 25,
    //     overflow: "hidden"
    // });
    //
    // async function buildTitle() {
    //     const group = new Konva.Group();
    //
    //     let image;
    //     if (renderOps.icon) {
    //         image = await loadImage("/assets/icon/"+renderOps.icon+".svg");
    //         image.position({x: 0, y: -6})
    //         group.add(image);
    //     }
    //
    //     const titleText = new Konva.Text({
    //         fontFamily: Konva.DEFAULT_FONT,
    //         fontSize: 25,
    //         fontStyle: "bold",
    //         text: node.title,
    //         align: "left",
    //         wrap: "none",
    //         fill: Konva.Color.PRIMARY_INVERT,
    //     })
    //
    //     if (image) {
    //         titleText.x(image.width() + 8);
    //     }
    //
    //     const typeText = new Konva.Text({
    //         x: titleText.x(),
    //         y: titleText.y()+titleText.height(),
    //         fontFamily: Konva.DEFAULT_FONT,
    //         fontSize: 10,
    //         text: node.type,
    //         align: "left",
    //         wrap: "none",
    //         fill: Konva.Color.PRIMARY_INVERT
    //     })
    //
    //     let width = titleText.width() > typeText.width() ? titleText.width() : typeText.width();
    //     if (image) {
    //         width += image.width()
    //     }
    //
    //     group.add(titleText, typeText);
    //     group.width(width);
    //     group.height(titleText.height()+typeText.height());
    //
    //     return group;
    // }

    // const title = await buildTitle();
    // title.x(shape.x()+6);
    // title.y(shape.y()+10);
    //
    // group.add(shape, title);
    //
    // if (def.important) {
    //     console.debug("render important icon");
    //     const important = await loadImage("/assets/icon/warning_circle.svg");
    //     important.scale({x: 0.5, y: 0.5});
    //     important.position({x: 0, y: -10});
    //     group.add(important);
    // }
    //
    // const argsContainer = new Konva.Group();
    // let last = null;
    // for (const x of def.args.entries()) {
    //     console.debug("arg", x);
    //     const args = await renderArg(x.at(0), x.at(1).type);
    //     if (last) {
    //         args.y(last.height()+10)
    //     }
    //     argsContainer.height(argsContainer.height()+args.height()+10)
    //     argsContainer.add(args);
    //     last = args;
    // }
    //
    // argsContainer.x(15);
    // argsContainer.y(title.height()+20);
    //
    // group.add(argsContainer);
    //
    // const contentWidth = title.width()+30;
    // const contentHeight = title.height()+argsContainer.height()+20;
    //
    // group.width(contentWidth);
    // group.height(contentHeight);
    //
    // shape.width(group.width());
    // shape.height(group.height());
    //
    // return group;
}

/**
 * @param def {NodeDefinition}
 * @param node {ProcessNode}
 * @return Konva.Group
 * */
async function renderInjectable(def, node) {
    return new PipeNodeInjectView(def, node);

    // const renderOps = def.render;
    //
    // const group = new Konva.Group({listening: true, draggable: true});
    // group.position(node.position);
    // group.on("dragstart", e => {
    //     e.target.moveTo(window.TopLayer);
    //     window.TopLayer.draw();
    // })
    // group.on("dragend", e => {
    //     e.target.moveTo(window.MidLayer);
    //     window.MidLayer.draw();
    //
    //     if (e.target.targetField == null) {
    //         return;
    //     }
    //
    //     console.log(e.target);
    //     const placeholder = e.target.targetField.parent();
    //     const parent = placeholder.parent();
    //     placeholder.hide();
    //
    //     parent.add(e.target);
    //
    //     console.debug("Selected field", e.target.targetField);
    // })
    // group.on("dragmove", e => {
    //     const position = mousePosition();
    //     const shape = MidLayer.getIntersection(position);
    //
    //     e.target.targetField = null;
    //
    //     if (e.target.lastIntersection) {
    //         e.target.lastIntersection.fill(Konva.Color.PRIMARY_LIGHT_1);
    //     }
    //
    //     if (shape == null || shape.parent == null) {
    //         return;
    //     }
    //
    //     const p = shape.parent;
    //     if (!p.id().startsWith("arg")) {
    //         return;
    //     }
    //
    //     const x = e.target.lastIntersection = p.find(".shape_placeholder")[0];
    //     if (x == null) {
    //         return;
    //     }
    //
    //     const expectedType = p.id().split("_")[1]
    //     if (def.providedType.toLowerCase() !== expectedType.toLowerCase()) {
    //         x.fill(Konva.Color.ERROR);
    //         return;
    //     }
    //
    //     e.target.targetField = x;
    //     x.fill(Konva.Color.BLUE);
    // })
    //
    // const shape = new Konva.Rect({
    //     fill: Konva.Color.PRIMARY_INVERT,
    //     cornerRadius: 10,
    //     overflow: "hidden"
    // });
    //
    // async function buildTitle() {
    //     const group = new Konva.Group();
    //
    //     const titleText = new Konva.Text({
    //         fontFamily: Konva.DEFAULT_FONT,
    //         fontSize: 15,
    //         fontStyle: "bold",
    //         text: def.providedType,
    //         align: "left",
    //         wrap: "none",
    //         fill: Konva.Color.PRIMARY,
    //     })
    //
    //     group.add(titleText);
    //
    //     group.width(titleText.width());
    //     group.height(titleText.height());
    //
    //     return group;
    // }
    //
    // const title = await buildTitle();
    // title.x(shape.x()+15);
    // title.y(shape.y()+10);
    //
    // const contentWidth = title.width()+30;
    // const contentHeight = title.height()+20;
    //
    // group.width(contentWidth);
    // group.height(contentHeight);
    //
    // shape.width(group.width());
    // shape.height(group.height());
    //
    // group.add(shape, title);
    //
    // if (def.important) {
    //     console.debug("render important icon");
    //     const important = await loadImage("/assets/icon/warning_circle.svg");
    //     important.scale({x: 0.5, y: 0.5});
    //     important.position({x: 0, y: -10});
    //     group.add(important);
    // }
    //
    // return group;
}

/** @return Promise<Konva.Image>*/
async function loadImage(path) {
    return new Promise((resolve, reject) => Konva.Image.fromURL(path, resolve, reject));
}

/**
 * @return Konva.Group
 * */
async function renderArg(label, type) {
    const group = new Konva.Group({listening: true});

    const labelText = new Konva.Text({
        fontFamily: Konva.DEFAULT_FONT,
        fontSize: 15,
        fontStyle: "normal",
        text: label,
        align: "left",
        wrap: "none",
        fill: Konva.Color.PRIMARY_INVERT
    })

    const button = new Konva.Group({id: `arg_${type}_${label}`, overflow: "hidden"});

    const shape = new Konva.Rect({
        name: "shape_placeholder",
        fill: Konva.Color.PRIMARY_LIGHT_1,
        cornerRadius: 10
    });

    const titleText = new Konva.Text({
        fontFamily: Konva.DEFAULT_FONT,
        fontSize: 15,
        fontStyle: "normal",
        text: type,
        align: "left",
        wrap: "none",
        fill: Konva.Color.PRIMARY_INVERT,
    })

    titleText.x(15);
    titleText.y(10);

    labelText.y(titleText.height()/2);

    button.add(shape, titleText);
    button.x(labelText.width()+15);

    button.width(titleText.width()+30);
    button.height(titleText.height()+20);

    shape.width(button.width());
    shape.height(button.height());

    group.width(labelText.width()+button.width())
    group.height(button.height())

    group.add(labelText, button);

    return group;
}

function ondblclick(view) {
    view.on("dblclick", e => {
        e.cancelBubble = true;
    })
}

function onclick(view) {
    view.on("click", e => {
        if (window.connectionStart) {
            e.cancelBubble = true;

            if (window.connectionFrom == null) {
                console.warn("Something went wrong - connection from is empty");
                return;
            }

            if (window.connectionType == null) {
                console.warn("Something went wrong - connection type is empty");
                return;
            }

            const from = window.MidLayer.findOne("#" + window.connectionFrom);
            if (from == null) {
                console.warn(`node ${window.connectionFrom} not found`);
                return;
            }

            console.debug(`Connect ${from.id()} to ${view.id()}; connector=${window.connectionType}`);
            const line = from.connectTo(view, window.connectionType);
            if (line != null) {
                window.BottomLayer.add(line);
            }

            //Save new connection
            /** @type Process*/
            const process = window.CurrentProcess;
            const nFrom = process.nodes.filter(x => x.id === window.connectionFrom)[0];
            if (nFrom == null) {
                console.warn(`node ${window.connectionFrom} not found`);
                disableCurrentConnection();
                return;
            }

            console.debug("Update process data");
            (async function () {
                if (window.connectionType === "next_default") {
                    console.debug("Set new connection to default connector")
                    if (nFrom.id === view.id()) {
                        nFrom.next = null;
                        return
                    }
                    nFrom.next = view.id();
                    return;
                }

                const args = await getDefinition(nFrom.type).then(x => x.args);
                args.forEach((value, key) => {
                    if (value.type !== "node") {
                        return
                    }

                    if (value.connector !== window.connectionType) {
                        return;
                    }

                    console.debug(`Set new connection to "${value.connector}" connector`)
                    if (nFrom.id === view.id()) {
                        nFrom.args.set(key, null);
                        return;
                    }
                    nFrom.args.set(key, view.id());
                });
            })().then(disableCurrentConnection).catch(console.error)
        }
    });
}

function onmouseover(view) {
    view.on("mouseover", () => {
        if (window.connectionStart) {
            view.shape.fill(Konva.Color.BLUE);
        }
    });
}

function onmouseout(view) {
    view.on("mouseout", () => {
        if (window.connectionStart) {
            if (view.selected) {
                view.selected = true; //trigger fill color selected
                return;
            }

            view.fillDefaultColor();
        }
    });
}

function ondragmove(view, node) {
    view.on("dragmove", () => node.position = view.getPosition());
}

function showNodeMenu(view, node) {
    view.on("click", e => {
        e.cancelBubble = true;

        if (window.selectedNodeId != null && window.selectedNodeId !== node.id) {
            const prev = window.MidLayer.findOne("#" + window.selectedNodeId);
            if (prev != null) {
                prev.selected = false;
            }
        }

        view.selected = true;
        nodeMenuRender(view, node).catch(console.error);
        window.selectedNodeId = node.id;
    })
}

/**
 * @param renderOps {Object}
 * @param text {string}
 * @param inject {function(Konva.Node)}
 * */
function title(renderOps, text, inject = () => {
}) {
    const view = new Konva.Text({
        id: "title",
        padding: 10,
        width: renderOps.width,
        align: "center",
        fontSize: 18,
        text,
        fontFamily: Konva.DEFAULT_FONT
    });


    inject(view);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function subTitle(renderOps, node, inject = () => {
}) {
    const view = new Konva.Text({
        id: "sub-title",
        y: 30,
        padding: 10,
        width: renderOps.width,
        align: "center",
        fontSize: 12,
        opacity: 0.5,
        text: node.type,
        fontFamily: Konva.DEFAULT_FONT
    });

    inject(view);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function connectors(renderOps, node, inject = () => {
}) {
    if (renderOps.no_connector) {
        return;
    }

    defaultConnector(renderOps, node, inject);
    additionalConnector(renderOps, node, inject);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function defaultConnector(renderOps, node, inject = () => {
}) {
    const conn = renderConnector(node.id, "next_default", {
        x: renderOps.width / 2,
        y: renderOps.height
    });
    inject(conn);
}

/**
 * @param renderOps {Object}
 * @param node {ProcessNode}
 * @param inject {function(Konva.Node)}
 * */
function additionalConnector(renderOps, node, inject = () => {
}) {
    if (renderOps.connectors == null) {
        return;
    }

    for (const id of Object.keys(renderOps.connectors)) {
        const ops = renderOps.connectors[id];
        const conn = renderConnector(node.id, id, {
            x: renderOps.width / 100 * ops.position.x,
            y: renderOps.height / 100 * ops.position.y
        }, ops.title);
        inject(conn);
    }
}

function renderConnector(nodeId, id, {x, y}, title = {text: "", position: {x: 0, y: 0}, fontSize: 12}) {
    const group = new Konva.Group({id: id, x: x, y: y});
    group.id(id);

    if (title.text !== "") {
        const titleView = new Konva.Text({
            x: title.position.x,
            y: title.position.y,
            fontSize: 12 * title.fontSize,
            text: title.text,
            fontFamily: Konva.DEFAULT_FONT
        });

        group.add(titleView);
    }

    const button = new Konva.Circle({
        radius: 15,
        stroke: Konva.Color.PRIMARY,
        strokeWidth: 2,
        fill: Konva.Color.PRIMARY_INVERT,
    });

    button.on("mouseover", () => {
        document.body.style.cursor = "pointer";
    });
    button.on("mouseend", () => {
        document.body.style.cursor = "auto";
    });

    group.on("click", e => {
        console.debug("start connection");
        e.cancelBubble = true;

        if (window.disableCurrentConnection) {
            disableCurrentConnection();
        }

        button.fill(Konva.Color.BLUE);
        window.connectionStart = true;
        window.connectionFrom = nodeId;
        window.connectionType = group.id();

        window.disableCurrentConnection = function () {
            console.debug("Disable current connection");
            button.fill(Konva.Color.PRIMARY_INVERT);
            window.connectionStart = false;
            window.connectionFrom = null;
            window.connectionType = null;
        }
    });

    group.add(button);

    return group;
}