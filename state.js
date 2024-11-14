import { Field, FieldType, FieldState } from "./field.js";
import { levels } from "./levels.js";

class Coordinate {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Edge {
    coord1;
    coord2;
    constructor(coord1, coord2) {
        this.coord1 = coord1;
        this.coord2 = coord2;
    }
}

export class AppState {
    board = [];
    railMatrix = [];
    leaderboard = {
        easy: [],
        hard: []
    };

    init(difficulty) {
        let levelIndex = Math.floor(Math.random() * 5);

        const selectedLevel = difficulty === "easy" ? levels.easy[levelIndex] : levels.hard[levelIndex];
        this.board = selectedLevel.map(row => row.map(field => new Field(field.fieldType, field.defaultRotation, field.fieldState)));
        this.railMatrix = [];
    }

    click(x, y, eventTarget, eventButton) {
        const field = this.board[x][y];
        if(eventButton === 2) {
            // Right click
            field.fieldState = FieldState.EMPTY;
            eventTarget.src = this.getTileFileFromState(field.fieldState, field.fieldType);
            eventTarget.className = '';
            eventTarget.classList.add(`rotate-${field.defaultRotation}`);
            this.setFieldConnections(field);
            return;
        }
        // Left click
        const cycle = this.getCycle(field.fieldType, field.defaultRotation);

        field.fieldState = cycle[(cycle.indexOf(field.fieldState) + 1) % cycle.length];

        eventTarget.src = this.getTileFileFromState(field.fieldState, field.fieldType);
        eventTarget.className = '';
        eventTarget.classList.add(`rotate-${this.getRotationFromState(field.fieldState, field.defaultRotation)}`);
        this.setFieldConnections(field);
        if(this.isGameOver()) {
            return true;
        }
        return false;
        
    }

    addToLeaderboard(difficulty, name, time) {
        this.leaderboard[difficulty].push({ name, time });
        this.leaderboard[difficulty].sort((a, b) => a.time - b.time);
    }

    // MEGNÉZZÜK A KAPCSOLATOKAT AZ ÉLEK KÖZÖTT, ÉS GRÁFOT CSINÁLUNK BELŐLÜK
    // MEGNÉZZÜK HOGY ÖSSZEFÜGGŐ-E
    // + EGYÉB FELTÉTELEK
    isGameOver() {
        this.railMatrix = [];
        // LEFT-RIGHT CHECK
        for (let i = 0; i < this.board.length; i++) {
            const row = this.board[i];
            //check for edge cases
            if (row[0].left || row[row.length - 1].right) {
                console.log("-1" + " i: " + i);
                return false;
            }
            //Az utolsó elemet itt nézzük meg, a többit a belső ciklusban (így optimálisabb)
            if(row[row.length - 1].fieldState === FieldState.EMPTY && row[row.length - 1].fieldType !== FieldType.OASIS) {
                console.log("-2" + " i: " + i);
                return false;
            }
            for (let j = 1; j < row.length; j++) {
                const prev = row[j - 1];
                const actual = row[j];
                if(prev.fieldState === FieldState.EMPTY && prev.fieldType !== FieldType.OASIS) {
                    console.log("-3" + " i: " + i + " j: " + j);
                    return false;
                }
                //true true
                //élet hozzáadni
                if((prev.right && actual.left)) {
                    const coord1 = new Coordinate(j - 1, i);
                    const coord2 = new Coordinate(j, i);
                    this.railMatrix.push(new Edge(coord1, coord2));
                }
                //false false
                else if((!prev.right && !actual.left)) {
                    continue;
                }
                else {
                    console.log("-4" + " i: " + i + " j: " + j);
                    return false;
                }
            }
        }
        console.log("left-right check done");
        
        //számolni kell hogy hány mezőn van sín
        //meg kel nézni hogy a sínes mezők száma egyenlő e az összes kitölthető mező számával

        // UP-DOWN CHECK (can be built together, for simplicity reasons we will leave it this way)
        for (let i = 0; i < this.board.length; i++) {
            //check for edge cases
            if (this.board[0][i].top || this.board[this.board.length - 1][i].bottom) {
                return false;
            }
            //Az utolsó elemet itt nézzük meg, a többit a belső ciklusban (így optimálisabb)
            if(this.board[this.board.length - 1][i].fieldState === FieldState.EMPTY && this.board[this.board.length - 1][i].fieldType !== FieldType.OASIS) {
                return false;
            }
            for (let j = 1; j < this.board.length; j++) {
                const prev = this.board[j - 1][i];
                const actual = this.board[j][i];
                if(prev.fieldState === FieldState.EMPTY && prev.fieldType !== FieldType.OASIS) {
                    return false;
                }
                //true true
                //élet hozzáadni
                if((prev.bottom && actual.top)) {
                    const coord1 = new Coordinate(i, j - 1);
                    const coord2 = new Coordinate(i, j);
                    this.railMatrix.push(new Edge(coord1, coord2));
                }
                //false false
                else if((!prev.bottom && !actual.top)) {
                    continue;
                }
                else {
                    return false;
                }
            }
        }
        console.log("up-down check done");

        // CHECK IF RAIL MATRIX IS CONNECTED
        //console.log("Is rail matrix connected: " + this.isRailMatrixConnected());
        if (!this.isRailMatrixConnected()) {
            return false;
        }

        // FILLED EVERYTHING CHECK
        let oasisCount = 0;
        for (let row of this.board) {
            for (let field of row) {
                if (field.fieldType === FieldType.OASIS) {
                    oasisCount++;
                }
            }
        }
        let railCount = 0;
        for (let row of this.board) {
            for (let field of row) {
                if (field.fieldState !== FieldState.EMPTY) {
                    railCount++;
                }
            }
        }
        console.log("railcount: " + railCount + " oasiscount: " + oasisCount);
        if(railCount === (this.board.length * this.board.length) - oasisCount) {
            return true;
        }
        else {
            return false;
        }


    }
    
    isRailMatrixConnected() {
        if (this.railMatrix.length === 0) return false;

        const visited = new Set();
        const stack = [this.railMatrix[0].coord1];

        while (stack.length > 0) {
            const current = stack.pop();
            const key = `${current.x},${current.y}`;
            if (!visited.has(key)) {
                visited.add(key);
                for (const edge of this.railMatrix) {
                    if (edge.coord1.x === current.x && edge.coord1.y === current.y && !visited.has(`${edge.coord2.x},${edge.coord2.y}`)) {
                        stack.push(edge.coord2);
                    } else if (edge.coord2.x === current.x && edge.coord2.y === current.y && !visited.has(`${edge.coord1.x},${edge.coord1.y}`)) {
                        stack.push(edge.coord1);
                    }
                }
            }
        }
        console.log("visited.size: " + visited.size);
        console.log("visited:");
        console.log(visited);
        return visited.size === this.railMatrix.length;
    }

    setFieldConnections(field) {
        field.top = false;
        field.right = false;
        field.bottom = false;
        field.left = false;

        switch(field.fieldState) {
            case FieldState.EMPTY:
                break;
            case FieldState.UPDOWN:
                field.top = true;
                field.bottom = true;
                break;
            case FieldState.LEFTRIGHT:
                field.left = true;
                field.right = true;
                break;
            case FieldState.LEFTDOWN:
                field.left = true;
                field.bottom = true;
                break;
            case FieldState.DOWNRIGHT:
                field.bottom = true;
                field.right = true;
                break;
            case FieldState.RIGHTUP:
                field.right = true;
                field.top = true;
                break;
            case FieldState.UPLEFT:
                field.top = true;
                field.left = true;
                break;
        }
    }

    getRotationFromState(fieldState, defaultRotation) {
        switch (fieldState) {
            case FieldState.EMPTY:
                return defaultRotation;
            case FieldState.UPDOWN:
                return 0;
            case FieldState.LEFTRIGHT:
                return 1;
            case FieldState.LEFTDOWN:
                return 1;
            case FieldState.DOWNRIGHT:
                return 0;
            case FieldState.RIGHTUP:
                return 3;
            case FieldState.UPLEFT:
                return 2;
        }
    }

    getTileFileFromState(fieldState, fieldType) {
        switch (fieldState) {
            case FieldState.EMPTY:
                switch (fieldType) {
                    case FieldType.EMPTY:
                        return "media/tiles/empty.png";
                    case FieldType.BRIDGE:
                        return "media/tiles/bridge.png";
                    case FieldType.MOUNTAIN:
                        return "media/tiles/mountain.png";
                    case FieldType.OASIS:
                        return "media/tiles/oasis.png";
                }
            case FieldState.UPDOWN:
            case FieldState.LEFTRIGHT:
                if(fieldType === FieldType.BRIDGE) {
                    return "media/tiles/bridge_rail.png";
                }
                else {
                    return "media/tiles/straight_rail.png";
                }
            case FieldState.LEFTDOWN:
            case FieldState.DOWNRIGHT:
            case FieldState.RIGHTUP:
            case FieldState.UPLEFT:
                if(fieldType === FieldType.MOUNTAIN) {
                    return "media/tiles/mountain_rail.png";
                }
                else {
                    return "media/tiles/curve_rail.png";
                }
        }
    }

    getCycle(fieldType, defaultRotation) {
        switch (fieldType) {
            case FieldType.BRIDGE:
                switch(defaultRotation) {
                    case 0:
                        return [0, 1];
                    case 1:
                        return [0, 2];
                }
            case FieldType.MOUNTAIN:
                switch (defaultRotation) {
                    case 0:
                        return [0, 4];
                    case 1:
                        return [0, 3];
                    case 2:
                        return [0, 6];
                    case 3:
                        return [0, 5];
                }
                return [0, 3];
            case FieldType.OASIS:
                return [0];
            case FieldType.EMPTY:
                return [0, 1, 2, 3, 4, 5, 6];
        }
    }
}