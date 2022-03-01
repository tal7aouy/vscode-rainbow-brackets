export default class BracketPair {

    public readonly openCharacter: string;
    public readonly closeCharacter: string;
    public readonly colors: string[];
    public readonly orphanColor: string;

    constructor(firstBracket: string, lastBracket: string, colors: string[], orphanColor: string) {
        this.openCharacter = firstBracket;
        this.closeCharacter = lastBracket;
        this.colors = colors;
        this.orphanColor = orphanColor;
    }
}
