import { Position, Range } from 'vscode';
import FoundBracket from './foundBracket';
import LineState from './lineState';
import Scope from './scope';
import Settings from './settings';

export default class TextLine {
  public colorRanges = new Map<string, Range[]>();
  public readonly index: number;
  private lineState: LineState;
  private readonly settings: Settings;
  private readonly content: string;

  constructor(
    content: string,
    settings: Settings,
    index: number,
    lineState?: LineState
  ) {
    this.settings = settings;
    this.content = content;
    this.index = index;
    if (lineState !== undefined) {
      this.lineState = lineState;
    } else {
      this.lineState = new LineState(settings);
    }
  }

  // Return a copy of the line while mantaining bracket state. colorRanges is not mantained.
  public copyMultilineContext() {
    return this.lineState.copyMultilineContext();
  }

  public addBracket(bracket: FoundBracket) {
    const openBrackets = this.lineState.getOpenBrackets();
    this.settings.bracketPairs.sort((a, b) => {
      const x = openBrackets.has(a.openCharacter);
      const y = openBrackets.has(b.openCharacter);
      return x === y ? 0 : x ? -1 : 1;
    });

    for (const bracketPair of this.settings.bracketPairs) {
      if (bracketPair.openCharacter === bracket.character) {
        const color = this.lineState.getOpenBracketColor(
          bracketPair,
          bracket.range
        );

        const colorRanges = this.colorRanges.get(color);

        if (colorRanges !== undefined) {
          colorRanges.push(bracket.range);
        } else {
          this.colorRanges.set(color, [bracket.range]);
        }
        return;
      } else if (bracketPair.closeCharacter === bracket.character) {
        const color = this.lineState.getCloseBracketColor(
          bracketPair,
          bracket.range
        );

        const colorRanges = this.colorRanges.get(color);
        if (colorRanges !== undefined) {
          colorRanges.push(bracket.range);
        } else {
          this.colorRanges.set(color, [bracket.range]);
        }
        return;
      }
    }
  }

  public getScope(position: Position): Scope | undefined {
    return this.lineState.getScope(position);
  }
}
