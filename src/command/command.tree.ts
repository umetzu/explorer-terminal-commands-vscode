import { TreeDataProvider, EventEmitter, ExtensionContext, TreeItem, Event } from "vscode";
import { ConfigManager, iTerminalCommand } from "../utils/config";
import { TerminalCommandItem } from "./command.item";

export class CommandTreeViewProvider<T> implements TreeDataProvider<TerminalCommandItem> {

	protected _onDidChangeTreeData = new EventEmitter<any>();
	public commands: iTerminalCommand[] = [];
	public files: string[] = [];

	constructor(private context: ExtensionContext) {
	}

	public async loadCommands() {
		this.commands = await ConfigManager.getAllBlocks();
		this.files = [];

		for (let index = 0; index < this.commands.length; index++) {
			const fileName = this.commands[index].fileName;
			if (this.files.indexOf(fileName) == -1) {
				this.files.push(fileName);
			}
		}

		this.files.sort((a, b) => b.localeCompare(a)).reverse();
	}

	public async getChildren(element?: TreeItem|undefined): Promise<TerminalCommandItem[]> {
		let treeCommand: TerminalCommandItem[] = [];
		if (this.commands.length !== 0) {
			if (this.files.length > 1) {
				if (element) {
					for (var i = 0; i < this.commands.length; i++) {
						if (this.commands[i].fileName == element.label) {
							treeCommand.push(new TerminalCommandItem(this.context, this.commands[i].name, this.commands[i], false));
						}
					}
				} else {
					for (var i = 0; i < this.files.length; i++) {
						var test = { command: "", auto: false, name: "", fileName: "" };
						treeCommand[i] = new TerminalCommandItem(this.context, this.files[i], test, true);
					}
				}
			}
			else {
				for (var i = 0; i < this.commands.length; i++) {
					treeCommand[i] = new TerminalCommandItem(this.context, this.commands[i].name, this.commands[i], false);
				}
			}
		}
		return treeCommand;
	}

	public getTreeItem(command: TerminalCommandItem): TreeItem {
		return command;
	}

	async refresh(root?: T): Promise<void> {
		await this.loadCommands();
		this._onDidChangeTreeData.fire();
		//this.commands =  ConfigManager.getAllBlocks();
	}

	public get onDidChangeTreeData(): Event<any> {
		return this._onDidChangeTreeData.event;
	}
}
