import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('tinteme.highlight', () => {
        const document = vscode.window.activeTextEditor?.document;

        if (document === undefined) {
            return;
        }

        const config = vscode.workspace.getConfiguration();

        const panel = vscode.window.createWebviewPanel('tinteme', 'Tinteme: ' + document.fileName, vscode.ViewColumn.Two, {});

        const theme = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light ? 'light' : 'dark';

        panel.webview.html = highlight(
            document.getText(),
            config.get('tinteme.foreground', 'var(--vscode-editor-foreground)'),
            config.get('tinteme.background', 'var(--vscode-editor-background)'),
            config.get('tinteme.colors.' + theme + 'Theme', []));
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}

function highlight(code: string | undefined, foreground: string, background: string, colors: string[]) {
    if (code === undefined) {
        return "";
    }

    code = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '\n ')
        .replace(/(\(|\[|'\()/g, '<span>$1')
        .replace(/(\)|\])/g, '$1</span>');

    const coloring = colors.map((color, index) => {
        return 'pre ' + '> span'.repeat(index + 1) + ':hover { background-color: ' + color + '; }';
    }).join('\n');

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Tinteme</title>
            <style>
                pre {
                    cursor: crosshair;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                    color: ${foreground};
                    background-color: ${background};
                }

                ${coloring}
            </style>
        </head>
        <body>
            <pre>${code}</pre>
        </body>
        </html>`;
}