export const FieldState = {
    EMPTY: 0,
    UPDOWN: 1,
    LEFTRIGHT: 2,
    LEFTDOWN: 3,
    DOWNRIGHT: 4,
    RIGHTUP: 5,
    UPLEFT: 6
}

export const FieldType = {
    EMPTY: 0,
    BRIDGE: 1,
    MOUNTAIN: 2,
    OASIS: 3
}

export function getPathFromFieldType(fieldType) {
    switch (fieldType) {
        case FieldType.BRIDGE:
            return "media/tiles/bridge.png";
        case FieldType.MOUNTAIN:
            return "media/tiles/mountain.png";
        case FieldType.OASIS:
            return "media/tiles/oasis.png";
        case FieldType.EMPTY:
            return "media/tiles/empty.png";
    }
}

export class Field {
    fieldType; //FieldType
    defaultRotation; //int
    /*
    Állapot száma: az eredeti kép CLOCKWISE mennyit fordul el (90 fokban)
    4 Mező:
        - Híd (0-1)
        - Kanyar (0-3)
        - Üres (0)
        - Oázis (0)
    */

    fieldState; //FieldState
    //DEFAULT: 0 (empty)

    top;
    right;
    bottom;
    left;


    constructor(fieldType, defaultRotation, fieldState) {
        this.fieldType = fieldType;
        this.defaultRotation = defaultRotation;
        this.fieldState = fieldState;
        this.top = false;
        this.right = false;
        this.bottom = false;
        this.left = false;
    }

}