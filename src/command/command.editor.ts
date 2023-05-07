import * as vscode from "vscode";
import * as path from "path";
import { ConfigManager, iTerminalCommand } from "../utils/config";
import { terminalFactory } from "../utils/terminal";

export class CommandEditorProvider  {
  exec() {
	var text = ConfigManager.getBlockFromEditor();

    let term = terminalFactory.getTerminal();
	if (term)
	{
    	term.sendText(text, true);
		term.show(false);
	}
  }
}
