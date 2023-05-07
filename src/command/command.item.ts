import * as vscode from "vscode";
import * as path from "path";
import { iTerminalCommand } from "../utils/config";
import { terminalFactory } from "../utils/terminal";

export class TerminalCommandItem extends vscode.TreeItem {
    /**
     * Attrs
     */

    terminalCommand: iTerminalCommand;

    /**
     * Creates an instance of terminal command item.
     * @param label
     * @param terminalCommand
     */
    isFile = false;

    constructor(readonly context: vscode.ExtensionContext, label: string, terminalCommand: iTerminalCommand, isFile: boolean) {
        super(label, vscode.TreeItemCollapsibleState.None);

        this.terminalCommand = terminalCommand;
        this.tooltip = terminalCommand.command;
        this.command = {
            command: "explorerTerminalCommands.executeCommand",
            title: "Execute",
            arguments: [this]
        };
        this.isFile = isFile;

        if (isFile) {
            this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        } else {
            this.refreshIcon();
        }
    }

    /**
     * Set treeitem icon
     * Auto commands will be displayed with a blue icon
     * @returns
     */

    refreshIcon() {
        const iconPath = path.join(__filename, "..", "..", "resources");

        if (this.terminalCommand.auto) {
            this.iconPath = {
                light: this.context.asAbsolutePath('resources/light/blue.svg'),
                dark: this.context.asAbsolutePath('resources/dark/blue.svg')
            };
            return;
        }

        this.iconPath = {
            light: this.context.asAbsolutePath('resources/light/default.svg'),
            dark: this.context.asAbsolutePath('resources/dark/default.svg')
        };
    }

    exec() {
        if (this.isFile) {
            return;
        }

        let command = this.terminalCommand;

        let term = terminalFactory.getTerminal();
        if (term) {
            term.sendText(command.command, command.auto);
            term.show(false);
        }
    }
}
