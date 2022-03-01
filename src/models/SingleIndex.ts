import * as vscode from 'vscode';
import Bracket from './bracket';
import BracketPair from './bracketPair';
import ColorIndexes from '../interfaces/IColorIndexes';
import Scope from './scope';

export default class SingleIndex implements ColorIndexes {
  private openBrackets: Bracket[] = [];
  private previousOpenBracketColorIndex: number = -1;
  private bracketScopes: Scope[] = [];

  constructor(previousState?: {
    currentOpenBracketColorIndexes: Bracket[]
    previousOpenBracketColorIndex: number
  }) {
    if (previousState !== undefined) {
      this.openBrackets = previousState.currentOpenBracketColorIndexes;
      this.previousOpenBracketColorIndex =
        previousState.previousOpenBracketColorIndex;
    }
  }

  public getOpenBrackets() {
    return new Set<string>(this.openBrackets.map((e) => e.character));
  }

  public getPreviousIndex(bracketPair: BracketPair): number {
    return this.previousOpenBracketColorIndex;
  }

  public setCurrent(
    bracketPair: BracketPair,
    range: vscode.Range,
    colorIndex: number
  ) {
    this.openBrackets.push(
      new Bracket(bracketPair.openCharacter, range, colorIndex)
    );
    this.previousOpenBracketColorIndex = colorIndex;
  }

  public getCurrentLength(bracketPair: BracketPair): number {
    return this.openBrackets.length;
  }

  public getCurrentColorIndex(
    bracketPair: BracketPair,
    range: vscode.Range
  ): number | undefined {
    const openBracket = this.openBrackets.pop();
    if (openBracket) {
      const closeBracket = new Bracket(
        bracketPair.closeCharacter,
        range,
        openBracket.colorIndex
      );
      const scopeRange = new vscode.Range(openBracket.range.start, range.end);
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

  public getScope(position: vscode.Position): Scope | undefined {
    for (const scope of this.bracketScopes) {
      if (scope.range.contains(position)) {
        return scope;
      }
    }
  }

  public clone() {
    return new SingleIndex({
      currentOpenBracketColorIndexes: this.openBrackets.slice(),
      previousOpenBracketColorIndex: this.previousOpenBracketColorIndex,
    });
  }
}
