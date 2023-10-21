export default async function (target, {width, height}) {
    target.x(0);
    target.y(0);
    target.width(width);
    target.height(height);
    target.fill(Konva.Color.PRIMARY_LIGHT_2);
    target.cornerRadius(25);
}