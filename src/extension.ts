import * as vscode from "vscode";
import * as path from "path";

let idleTimeout: NodeJS.Timeout | undefined;
let gifPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  const createGifPanel = () => {
    if (gifPanel) {
      gifPanel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    gifPanel = vscode.window.createWebviewPanel(
      "justDoIt",
      "Just Do It",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "media")),
        ],
      }
    );

    gifPanel.onDidDispose(() => {
      gifPanel = undefined;
    });

    const gifPath = vscode.Uri.file(
      path.join(context.extensionPath, "media", "JustDoIt.gif")
    );
    const onDiskCSSPath = vscode.Uri.file(
      path.join(context.extensionPath, "style", "style.css")
    );
    const justDoItGifsrc = gifPanel.webview.asWebviewUri(gifPath);
    const csssrc = gifPanel.webview.asWebviewUri(onDiskCSSPath);
    console.log("GIF Path: ", gifPath.toString());
    gifPanel.webview.html = getWebviewContent(justDoItGifsrc, csssrc);
  };

  const resetIdleTimeout = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    idleTimeout = setTimeout(() => {
      createGifPanel();
    }, 60000);
  };

  const subscriptions = [
    vscode.window.onDidChangeActiveTextEditor(resetIdleTimeout),
    vscode.window.onDidChangeTextEditorSelection(resetIdleTimeout),
    vscode.workspace.onDidChangeTextDocument(resetIdleTimeout),
    vscode.window.onDidChangeWindowState(resetIdleTimeout),
  ];

  context.subscriptions.push(...subscriptions);
  resetIdleTimeout();
}

export function deactivate() {
  if (idleTimeout) {
    clearTimeout(idleTimeout);
  }
}

function getWebviewContent(justDoItsrc: vscode.Uri, csssrc: vscode.Uri) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource:; style-src vscode-resource:;">
    <title>Just Do It</title>
    <link rel="stylesheet" href="${csssrc}">
  </head>
  <body>
    <h1>Just Do It</h1>
    <div class="container">
      <img src="${justDoItsrc}" class="gif-image">
    </div>
  </body>
  </html>`;
}
