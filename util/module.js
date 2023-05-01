/**
 * @param uuid {string|null}
 * @return boolean
 * */
export function validateUUID(uuid) {
    if (uuid == null || uuid === "" || uuid.length !== 36) {
        return false;
    }

    const reg = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    return reg.test(uuid);
}