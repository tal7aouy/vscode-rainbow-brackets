import {
  TextDocument,
  TextDocumentChangeEvent,
  TextEditor,
  TextEditorSelectionChangeEvent,
  window,
} from 'vscode';
import DocumentDecoration from './documentDecoration';
import GutterIconManager from './gutterIconManager';
import Settings from './settings';

export default class DocumentDecorationManager {
  private readonly loadLanguages = require('prismjs/components/index.js');
  private readonly loadedLanguages = new Set<string>();
  private readonly components = require('prismjs/components');
  private readonly supportedLanguages = new Set(
    Object.keys(this.components.languages)
  );
  private readonly gutterIcons = new GutterIconManager();
  private showError = true;
  private documents = new Map<string, DocumentDecoration>();

  public Dispose() {
    this.documents.forEach((document, key) => {
      document.dispose();
    });

    this.gutterIcons.Dispose();
  }

  public expandBracketSelection(editor: TextEditor) {
    const documentDecoration = this.getDocumentDecorations(editor.document);
    if (documentDecoration) {
      documentDecoration.expandBracketSelection(editor);
    }
  }

  public undoBracketSelection(editor: TextEditor) {
    const documentDecoration = this.getDocumentDecorations(editor.document);
    if (documentDecoration) {
      documentDecoration.undoBracketSelection(editor);
    }
  }

  public updateDocument(document: TextDocument) {
    const documentDecoration = this.getDocumentDecorations(document);
    if (documentDecoration) {
      documentDecoration.triggerUpdateDecorations();
    }
  }

  public onDidOpenTextDocument(document: TextDocument) {
    const documentDecoration = this.getDocumentDecorations(document);
    if (documentDecoration) {
      documentDecoration.triggerUpdateDecorations();
    }
  }

  public onDidChangeTextDocument(event: TextDocumentChangeEvent) {
    const documentDecoration = this.getDocumentDecorations(event.document);
    if (documentDecoration) {
      documentDecoration.onDidChangeTextDocument(event.contentChanges);
    }
  }

  public onDidCloseTextDocument(closedDocument: TextDocument) {
    const uri = closedDocument.uri.toString();
    const document = this.documents.get(uri);
    if (document !== undefined) {
      document.dispose();
      this.documents.delete(closedDocument.uri.toString());
    }
  }

  public onDidChangeSelection(event: TextEditorSelectionChangeEvent) {
    const documentDecoration = this.getDocumentDecorations(
      event.textEditor.document
    );
    if (
      documentDecoration &&
      (documentDecoration.settings.highlightActiveScope ||
        documentDecoration.settings.showBracketsInGutter ||
        documentDecoration.settings.showVerticalScopeLine ||
        documentDecoration.settings.showHorizontalScopeLine)
    ) {
      documentDecoration.triggerUpdateScopeDecorations(event);
    }
  }

  public updateAllDocuments() {
    window.visibleTextEditors.forEach((editor) => {
      this.updateDocument(editor.document);
    });
  }

  private getDocumentDecorations(
    document: TextDocument
  ): DocumentDecoration | undefined {
    if (!this.isValidDocument(document)) {
      return;
    }

    const uri = document.uri.toString();
    let documentDecorations = this.documents.get(uri);

    if (documentDecorations === undefined) {
      try {
        const languages = this.getPrismLanguageID(document.languageId);
        const primaryLanguage = languages[0];

        if (!this.supportedLanguages.has(primaryLanguage)) {
          return;
        }

        const settings = new Settings(
          primaryLanguage,
          this.gutterIcons,
          document.uri
        );

        if (settings.excludedLanguages.has(document.languageId)) {
          return;
        }

        this.loadLanguageOnce(primaryLanguage);
        documentDecorations = new DocumentDecoration(document, settings);
        this.documents.set(uri, documentDecorations);
      } catch (error) {
        if (error instanceof Error) {
          if (this.showError) {
            window.showErrorMessage('BracketPair Settings: ' + error.message);

            // Don't spam errors
            this.showError = false;
            setTimeout(() => {
              this.showError = true;
            }, 3000);
          }
        }
        return;
      }
    }

    return documentDecorations;
  }

  private getPrismLanguageID(languageID: string): string[] {
    // Some VSCode language ids need to be mapped to match http://prismjs.com/#languages-list
    switch (languageID) {
      case 'ahk':
        return ['autohotkey'];
      case 'bat':
        return ['batch'];
      case 'apex':
        return ['java'];
      case 'gradle':
        return ['groovy'];
      case 'html':
        return ['markup', 'javascript'];
      case 'javascriptreact':
        return ['jsx'];
      case 'json5':
        return ['javascript'];
      case 'jsonc':
        return ['javascript'];
      case 'mathml':
        return ['markup'];
      case 'nunjucks':
        return ['twig'];
      case 'razor':
        return ['markup', 'javascript', 'csharp', 'aspnet']; // Workaround
      case 'scad':
        return ['swift']; // Workaround
      case 'svg':
        return ['markup'];
      case 'systemverilog':
        return ['verilog'];
      case 'typescriptreact':
        return ['tsx'];
      case 'vb':
        return ['vbnet'];
      case 'vue':
        return ['markup', 'javascript'];
      case 'xml':
        return ['markup'];
      case "postcss": return ["css"];
      default:
        return [languageID];
    }
  }

  private isValidDocument(document?: TextDocument): boolean {
    if (
      document === undefined ||
      document.lineCount === 0 ||
      document.uri.scheme === 'vscode'
    ) {
      return false;
    }

    return true;
  }

  private loadLanguageOnce(prismLanguageId: string) {
    if (this.loadedLanguages.has(prismLanguageId)) {
      return;
    }
    this.loadLanguages([prismLanguageId]);
    this.loadedLanguages.add(prismLanguageId);
  }
}
