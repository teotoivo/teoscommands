// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { buildTsProject } from './buildTsProject';
import { buildReactProject } from './buildReactProject';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "teoscommands" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	
	

	const teoscommandsBuildTsProject = await buildTsProject(context);

	const teoscommandsBuildReactProject = await buildReactProject(context);

	//create new status bar item
	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	statusBarItem.text = "Build TS Project";
	statusBarItem.command = 'teoscommands.buildTsProject';
	statusBarItem.show();

	let statusBarItem2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 2);
	statusBarItem2.text = "Build React Project";
	statusBarItem2.command = 'teoscommands.buildReactProject';
	statusBarItem2.show();



	const commands: { [key: string]: vscode.Disposable} = {
		teoscommandsBuildTsProject,
		teoscommandsBuildReactProject

	};
	
	for (const key in commands) {
		if (commands.hasOwnProperty(key)) {
			const element = commands[key];
			context.subscriptions.push(element);
		}
	}	
}

// This method is called when your extension is deactivated
export function deactivate() {}
