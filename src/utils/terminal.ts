import * as vscode from "vscode";

/**
 * Terminal factory
 */

class TerminalFactory {
    /**
     * Attrs
     */

    private static instance: TerminalFactory;
    private terminals: vscode.Terminal[];

    /**
     * Creates an instance of terminal factory.
     */

    private constructor() {
        this.terminals = [];
    }

    /**
     * Gets instance
     * @returns instance 
     */

    static getInstance(): TerminalFactory {
        if (!TerminalFactory.instance) {
            TerminalFactory.instance = new TerminalFactory();
        }

        return TerminalFactory.instance;
    }

    /**
     * Gets terminal
     * @param options 
     * @returns terminal or undefined
     */

    public getTerminal(): vscode.Terminal | undefined {
        let terminal = vscode.window.activeTerminal;

        if (!terminal) {
            terminal = vscode.window.createTerminal();
            if (!terminal) {
                vscode.window.showWarningMessage("Send snippet to Terminal: No Terminal available");
                return;
            }
            terminal.show(true);
        }

        return terminal;
    }
}

let terminalFactory = TerminalFactory.getInstance();
export { terminalFactory };