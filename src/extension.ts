import { CommandTreeViewProvider } from './command/command.tree';
import { CommandEditorProvider } from './command/command.editor';
import { ExtensionContext, window, commands } from 'vscode';

export async function activate(context: ExtensionContext) {
    const commandProvider = new CommandTreeViewProvider(context);
    const selectionProvider = new CommandEditorProvider();
    await commandProvider.loadCommands();
    window.registerTreeDataProvider('explorerTerminalCommands', commandProvider);

    let execCommand = commands.registerCommand('explorerTerminalCommands.executeCommand', (cmd) => {
        cmd.exec();
    });

    let selectCommand = commands.registerCommand('explorerTerminalCommands.executeSelection', (cmd) => {
        selectionProvider.exec();
    });

    let refreshCommand = commands.registerCommand('explorerTerminalCommands.refreshCommands', () => {
        commandProvider.refresh();
    });

    context.subscriptions.push(execCommand);
    context.subscriptions.push(refreshCommand);
    context.subscriptions.push(selectCommand);
}

export function deactivate() { }

