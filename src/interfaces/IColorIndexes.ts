import { Position, Range } from 'vscode';
import Bracket from '../models/bracket';
import BracketPair from '../models/bracketPair';
import Scope from '../models/scope';

interface IColorIndex {
  getPreviousIndex(bracketPair: BracketPair): number
  setCurrent(bracketPair: BracketPair, range: Range, colorIndex: number): void
  getCurrentLength(bracketPair: BracketPair): number
  getCurrentColorIndex(
    bracketPair: BracketPair,
    range: Range
  ): number | undefined
  getScope(position: Position): Scope | undefined
  getOpenBrackets(): Set<string>
  clone(): IColorIndex
}

export default IColorIndex;
