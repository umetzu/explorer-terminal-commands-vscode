import { CommandTreeViewProvider } from './command/command.tree';
import { CommandEditorProvider } from './command/command.editor';
//import { ComposeTreeViewProvider } from './compose/compose.tree';
import { ExtensionContext, window, commands } from 'vscode';

export async function activate(context: ExtensionContext) {
  const commandProvider = new CommandTreeViewProvider(context);
  const selectionProvider = new CommandEditorProvider();
 // const composeProvider = new ComposeTreeViewProvider(context);
  await commandProvider.loadCommands();
	window.registerTreeDataProvider('explorerTerminalCommands', commandProvider);
 // window.registerTreeDataProvider('composeTerminalCommands', composeProvider);

 let execCommand = commands.registerCommand('explorerTerminalCommands.executeCommand', (cmd) => {
  cmd.exec();
});

  let selectCommand = commands.registerCommand('explorerTerminalCommands.executeSelection', (cmd) => {
    selectionProvider.exec();
  });
  
  let refreshCommand = commands.registerCommand('explorerTerminalCommands.refreshCommands', () => {
    commandProvider.refresh();
  //  composeProvider.refresh();
  });

  context.subscriptions.push(execCommand);
	context.subscriptions.push(refreshCommand);
	context.subscriptions.push(selectCommand);
}

export function deactivate() { }

