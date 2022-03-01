import { Range } from 'vscode';
import Bracket from './bracket';

export default class Scope {
  public readonly open: Bracket;
  public readonly close: Bracket;
  public readonly range: Range;
  public readonly color: string;
  constructor(range: Range, color: string, open: Bracket, close: Bracket) {
    // Scope does not include edges
    this.range = new Range(
      range.start.translate(0, 1),
      range.end.translate(0, -1)
    );
    this.color = color;
    this.open = open;
    this.close = close;
  }
}
