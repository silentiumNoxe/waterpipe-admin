/** @return Promise<Konva.Image>*/
export default async function (iconName) {
    return new Promise((resolve, reject) => Konva.Image.fromURL(`assets/icon/${iconName}.svg`, resolve, reject)).then(x => {
        console.debug(`icon ${iconName} has loaded`);
        return x;
    });
}