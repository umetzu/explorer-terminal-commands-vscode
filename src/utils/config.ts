import * as vscode from "vscode";
import * as vscodeUri from "vscode-uri";

export interface iTerminalCommand {
    command: string;
    fileName: string;
    name: string;
    cwd?: string;
    auto?: boolean;
    multi?: boolean;
}

export type iComposeFiles = String[];

export class ConfigManager {
    static getBlockFromEditor(): string {
        let text = "";
        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showWarningMessage("Send snippet to Terminal: No document open");
            return text;
        }

        if (editor.selection.isEmpty) {
            let startLineNumber = editor.selection.start.line;
            let currentLineNumber = startLineNumber - 1;
            while (currentLineNumber >= 0) {
                let currentLineText = editor.document.lineAt(currentLineNumber);
                if (currentLineText.isEmptyOrWhitespace) {
                    break;
                }

                if (!currentLineText.text.endsWith("`") &&
                    !currentLineText.text.endsWith("\\")) {
                    break;
                }

                startLineNumber = currentLineNumber;
                currentLineNumber--;
            }

            let endLineNumber = editor.selection.end.line;
            currentLineNumber = endLineNumber;
            while (currentLineNumber < editor.document.lineCount) {
                let currentLineText = editor.document.lineAt(currentLineNumber);
                if (currentLineText.isEmptyOrWhitespace) {
                    break;
                }

                endLineNumber = currentLineNumber;
                if (!currentLineText.text.endsWith("`") &&
                    !currentLineText.text.endsWith("\\")) {
                    break;
                }

                currentLineNumber++;
            }

            let lastLine = editor.document.lineAt(endLineNumber);

            const expandedRange = editor.document.validateRange(new vscode.Range(startLineNumber, 0, endLineNumber, lastLine.text.length));
            text = editor.document.getText(expandedRange);
        }
        else {
            text = editor.document.getText(editor.selection);
        }

        return text;
    }

    static async getAllBlocks(): Promise<iTerminalCommand[]> {
        const allFiles = await vscode.workspace.findFiles("*", "*.*");

        let results: iTerminalCommand[] = [];

        for (let index = 0; index < allFiles.length; index++) {
            const fileUri = allFiles[index];
            let document = await vscode.workspace.openTextDocument(fileUri);

            if (document.lineCount > 0) {
                if (!document.lineAt(0).text.startsWith("#snippet")) {
                    continue;
                }

                var currentLineNumber = 1;

                while (currentLineNumber <= document.lineCount - 1) {
                    var blockLineStart = this.getBlockStart(document, currentLineNumber);

                    if (blockLineStart < 0) {
                        break;
                    }

                    currentLineNumber = blockLineStart;

                    currentLineNumber = this.getBlockEnd(document, currentLineNumber);

                    var blockText = this.getBlockData(document, blockLineStart, currentLineNumber);

                    if (blockText && blockText.command.trim().length > 0) {
                        blockText.fileName = vscodeUri.Utils.basename(fileUri);
                        results.push(blockText);
                    }

                    currentLineNumber++;
                }
            }
        }

        return results;
    }

    static getBlockData(document: vscode.TextDocument, blockLineStart: number, blockLineEnd: number): iTerminalCommand | undefined {
        var firstLine = document.lineAt(blockLineStart).text;
        var lastLine = document.lineAt(blockLineEnd);

        let isAuto = false;
        let nameIndexStart = 0;
        let nameIndexEnd = firstLine.length;

        if (firstLine.startsWith("#")) {
            blockLineStart++;
            nameIndexStart++;

            if (firstLine.endsWith("!")) {
                isAuto = true;
                nameIndexEnd--;
            }

            if (firstLine.startsWith("##")) {
                nameIndexStart++;

                if (lastLine.text.startsWith("##") &&
                    firstLine.substring(0, nameIndexEnd).trim().toLowerCase() == lastLine.text.trim().toLowerCase()) {
                    blockLineEnd--;
                    lastLine = document.lineAt(blockLineEnd);
                }
            }
        }

        let name = firstLine.substring(nameIndexStart, nameIndexEnd);

        if (blockLineStart > blockLineEnd) {
            return;
        }

        while (blockLineEnd >= blockLineStart) {
            if (lastLine.isEmptyOrWhitespace) {
                blockLineEnd--;
                lastLine = document.lineAt(blockLineEnd);
            } else {
                break;
            }
        }

        const expandedRange = document.validateRange(new vscode.Range(blockLineStart, 0, blockLineEnd, lastLine.text.length));
        let command = document.getText(expandedRange);

        if (name.trim().toLowerCase() == "") {
            name = command.trim();
            if (name.length > 10) {
                name = name.substring(0, 10) + "...";
            }
        }

        return {
            command: command,
            auto: isAuto,
            name: name,
            fileName: ""
        };
    }

    static getBlockStart(document: vscode.TextDocument, lineNumber: number): number {
        for (let i = lineNumber; i < document.lineCount; i++) {
            var line = document.lineAt(i);
            if (!line.isEmptyOrWhitespace) {
                return i;
            }
        }

        return -1;
    }

    static getBlockEnd(document: vscode.TextDocument, lineNumber: number): number {
        var firstLine = document.lineAt(lineNumber).text;

        if (firstLine.startsWith("##")) {
            return this.getBlockBatchEnd(document, lineNumber, firstLine);
        }

        return this.getBlockNonBatchhEnd(document, lineNumber, firstLine);
    }

    static getBlockBatchEnd(document: vscode.TextDocument, lineNumber: number, firstLine: string): number {
        let nameEnd = firstLine.endsWith("!") ? firstLine.length - 1 : firstLine.length;
        let searchTerm = firstLine.substring(0, nameEnd);

        lineNumber++;

        while (lineNumber < document.lineCount) {
            let currentLine = document.lineAt(lineNumber);

            if (currentLine.text.trim().toLowerCase() == searchTerm.trim().toLowerCase()) {
                return lineNumber;
            }

            lineNumber++
        }

        return document.lineCount - 1;
    }

    static getBlockNonBatchhEnd(document: vscode.TextDocument, lineNumber: number, firstLine: string): number {
        if (firstLine.startsWith("#")) {
            lineNumber++;
        }

        while (lineNumber <= document.lineCount - 1) {
            let currentLine = document.lineAt(lineNumber);

            if (currentLine.isEmptyOrWhitespace ||
                (!currentLine.text.endsWith("`") &&
                    !currentLine.text.endsWith("\\"))) {
                return lineNumber;
            }

            lineNumber++;
        }

        return document.lineCount - 1;
    }
}

