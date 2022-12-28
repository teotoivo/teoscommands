// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { buildTsProject } from './buildTsProject';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log("activate");
	

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "teoscommands" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json


	let disposable = await buildTsProject();



	let disposable2 = vscode.commands.registerCommand('teoscommands.testTeo', () => {
		console.log("testTeo");
		
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});



	const commands: { [key: string]: vscode.Disposable} = {
		disposable,
		disposable2
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
