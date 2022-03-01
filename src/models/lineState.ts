import { Position, Range } from 'vscode';
import BracketPair from './bracketPair';
import ColorMode from '../interfaces/colorMode';
import ColorIndexes from '../interfaces/IColorIndexes';
import ModifierPair from './modifierPair';
import MultipleIndexes from './multipleIndexes';
import Scope from './scope';
import Settings from './settings';
import SingleIndex from './SingleIndex';

export default class LineState {
  private colorIndexes: ColorIndexes;
  private previousBracketColor: string;
  private readonly settings: Settings;

  constructor(
    settings: Settings,
    previousState?: {
      colorIndexes: ColorIndexes
      previousBracketColor: string
    }
  ) {
    this.settings = settings;

    if (previousState !== undefined) {
      this.colorIndexes = previousState.colorIndexes;
      this.previousBracketColor = previousState.previousBracketColor;
    } else {
      switch (settings.colorMode) {
        case ColorMode.Consecutive:
          this.colorIndexes = new SingleIndex();
          break;
        case ColorMode.Independent:
          this.colorIndexes = new MultipleIndexes(settings);
          break;
        default:
          throw new RangeError('Not implemented enum value');
      }
    }
  }

  public getOpenBracketColor(bracketPair: BracketPair, range: Range): string {
    let colorIndex: number;

    if (this.settings.forceIterationColorCycle) {
      colorIndex =
        (this.colorIndexes.getPreviousIndex(bracketPair) + 1) %
        bracketPair.colors.length;
    } else {
      colorIndex =
        this.colorIndexes.getCurrentLength(bracketPair) %
        bracketPair.colors.length;
    }

    let color = bracketPair.colors[colorIndex];

    if (
      this.settings.forceUniqueOpeningColor &&
      color === this.previousBracketColor
    ) {
      colorIndex = (colorIndex + 1) % bracketPair.colors.length;
      color = bracketPair.colors[colorIndex];
    }

    this.previousBracketColor = color;
    this.colorIndexes.setCurrent(bracketPair, range, colorIndex);

    return color;
  }

  public getCloseBracketColor(bracketPair: BracketPair, range: Range): string {
    const colorIndex = this.colorIndexes.getCurrentColorIndex(
      bracketPair,
      range
    );
    let color: string;
    if (colorIndex !== undefined) {
      color = bracketPair.colors[colorIndex];
    } else {
      color = bracketPair.orphanColor;
    }

    this.previousBracketColor = color;

    return color;
  }

  public getOpenBrackets() {
    return this.colorIndexes.getOpenBrackets();
  }

  public copyMultilineContext(): LineState {
    const clone = {
      colorIndexes: this.colorIndexes.clone(),
      previousBracketColor: this.previousBracketColor,
    };

    return new LineState(this.settings, clone);
  }

  public getScope(position: Position): Scope | undefined {
    return this.colorIndexes.getScope(position);
  }
}
