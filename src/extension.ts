import { commands, ExtensionContext, window, workspace, env, Uri } from 'vscode'
import DocumentDecorationManager from './models/documentDecorationManager'

export function activate(context: ExtensionContext) {
  let documentDecorationManager = new DocumentDecorationManager()

  const configuration = workspace.getConfiguration('RainbowBrackets', undefined)
  let noticeKey = 'depreciation-notice'
  var showNotice = configuration.get(noticeKey)
  if (showNotice) {
    window
      .showInformationMessage(
        'Rainbow Brackets is no longer being maintained.',
        { title: 'Learn more' },
        { title: "Don't show again" }
      )
      .then((e) => {
        if (e?.title === 'Learn more') {
          env.openExternal(
            Uri.parse('https://github.com/tal7aouy/RainbowBrackets#readme')
          )
        }

        if (e?.title === "Don't show again") {
          configuration.update(noticeKey, false, true)
        }
      })
  }

  context.subscriptions.push(
    commands.registerCommand('rainbow-brackets.expandBracketSelection', () => {
      const editor = window.activeTextEditor
      if (!editor) {
        return
      }
      documentDecorationManager.expandBracketSelection(editor)
    }),

    commands.registerCommand('rainbow-brackets.undoBracketSelection', () => {
      const editor = window.activeTextEditor
      if (!editor) {
        return
      }
      documentDecorationManager.undoBracketSelection(editor)
    }),

    workspace.onDidChangeConfiguration((event) => {
      if (
        event.affectsConfiguration('RainbowBrackets') ||
        event.affectsConfiguration('editor.lineHeight') ||
        event.affectsConfiguration('editor.fontSize')
      ) {
        documentDecorationManager.Dispose()
        documentDecorationManager = new DocumentDecorationManager()
        documentDecorationManager.updateAllDocuments()
      }
    }),

    window.onDidChangeVisibleTextEditors(() => {
      documentDecorationManager.updateAllDocuments()
    }),
    workspace.onDidChangeTextDocument((event) => {
      documentDecorationManager.onDidChangeTextDocument(event)
    }),
    workspace.onDidCloseTextDocument((event) => {
      documentDecorationManager.onDidCloseTextDocument(event)
    }),
    workspace.onDidOpenTextDocument((event) => {
      documentDecorationManager.onDidOpenTextDocument(event)
    }),
    window.onDidChangeTextEditorSelection((event) => {
      documentDecorationManager.onDidChangeSelection(event)
    })
  )

  documentDecorationManager.updateAllDocuments()
}

export function deactivate() {}
