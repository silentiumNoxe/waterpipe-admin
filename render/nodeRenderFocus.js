/**
 * @param target {Konva.Rect}
 * @param value {boolean}
 * */
export default function (target, {value}) {
    if (!value) {
        target.strokeEnabled(false);
        return;
    }

    target.strokeWidth(2);
    target.stroke(Konva.Color.BLUE2);
    target.strokeEnabled(true);
}