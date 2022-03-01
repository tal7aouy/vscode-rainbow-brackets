import { Position, Range } from 'vscode';
import Bracket from './bracket';
import BracketPair from './bracketPair';
import ColorIndexes from '../interfaces/IColorIndexes';
import Scope from './scope';
import Settings from './settings';

export default class MultipleIndexes implements ColorIndexes {
  private openBrackets: { [character: string]: Bracket[] } = {};
  private previousOpenBracketColorIndexes: { [character: string]: number } = {};
  private bracketScopes: Scope[] = [];
  private readonly settings: Settings;

  constructor(
    settings: Settings,
    previousState?: {
      currentOpenBracketColorIndexes: { [character: string]: Bracket[] }
      previousOpenBracketColorIndexes: { [character: string]: number }
    }
  ) {
    this.settings = settings;

    if (previousState !== undefined) {
      this.openBrackets = previousState.currentOpenBracketColorIndexes;
      this.previousOpenBracketColorIndexes =
        previousState.previousOpenBracketColorIndexes;
    } else {
      settings.bracketPairs.forEach((bracketPair) => {
        this.openBrackets[bracketPair.openCharacter] = [];
        this.previousOpenBracketColorIndexes[bracketPair.openCharacter] = -1;
      });
    }
  }

  public getOpenBrackets() {
    const brackets = new Set<string>();
    Object.keys(this.openBrackets).forEach((key) => {
      if (this.openBrackets[key].length > 0) {
        brackets.add(key);
      }
    });

    return brackets;
  }

  public getPreviousIndex(bracketPair: BracketPair): number {
    return this.previousOpenBracketColorIndexes[bracketPair.openCharacter];
  }

  public setCurrent(
    bracketPair: BracketPair,
    range: Range,
    colorIndex: number
  ) {
    this.openBrackets[bracketPair.openCharacter].push(
      new Bracket(bracketPair.openCharacter, range, colorIndex)
    );
    this.previousOpenBracketColorIndexes[bracketPair.openCharacter] = colorIndex;
  }

  public getCurrentLength(bracketPair: BracketPair): number {
    return this.openBrackets[bracketPair.openCharacter].length;
  }

  public getCurrentColorIndex(
    bracketPair: BracketPair,
    range: Range
  ): number | undefined {
    const openBracket = this.openBrackets[bracketPair.openCharacter].pop();
    if (openBracket) {
      const closeBracket = new Bracket(
        bracketPair.closeCharacter,
        range,
        openBracket.colorIndex
      );
      const scopeRange = new Range(openBracket.range.start, range.end);
      this.bracketScopes.push(
        new Scope(
          scopeRange,
          bracketPair.colors[openBracket.colorIndex],
          openBracket,
          closeBracket
        )
      );
      return openBracket.colorIndex;
    }
  }

  public getScope(position: Position): Scope | undefined {
    for (const scope of this.bracketScopes) {
      if (scope.range.contains(position)) {
        return scope;
      }
    }
  }

  public clone(): ColorIndexes {
    const bracketColorIndexesCopy: { [character: string]: Bracket[] } = {};

    Object.keys(this.openBrackets).forEach((key) => {
      bracketColorIndexesCopy[key] = this.openBrackets[key].slice();
    });

    const previousOpenBracketIndexesCopy: { [character: string]: number } = {};

    Object.keys(this.previousOpenBracketColorIndexes).forEach((key) => {
      previousOpenBracketIndexesCopy[key] =
        this.previousOpenBracketColorIndexes[key];
    });

    return new MultipleIndexes(this.settings, {
      currentOpenBracketColorIndexes: bracketColorIndexesCopy,
      previousOpenBracketColorIndexes: previousOpenBracketIndexesCopy,
    });
  }
}
