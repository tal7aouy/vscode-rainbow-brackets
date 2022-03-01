import { Range } from "vscode";

export default class Bracket {
    public readonly character: string;
    public readonly range: Range;
    public readonly colorIndex: number;

    constructor(character: string, range: Range, colorIndex: number, pair?: Bracket) {
        this.character = character;
        this.range = range;
        this.colorIndex = colorIndex;
    }
}
