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
	
	//settings
	let config = vscode.workspace.getConfiguration('teoscommands');
	

	const teoscommandsBuildTsProject = await buildTsProject(context);

	const teoscommandsBuildReactProject = await buildReactProject(context);

	const teoscommandstrigger = vscode.commands.registerCommand('teoscommands.trigger', () => {
		return;
	});


	let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
	statusBarItem.text = "Build TS Project";
	statusBarItem.command = 'teoscommands.buildTsProject';

	//create new status bar item
	const statusBarItem3 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem3.tooltip = 'run';
    statusBarItem3.command = 'teoscommands.run';

	let triangle = String.fromCharCode(9654);

	statusBarItem3.text = `${triangle} Run`;
    context.subscriptions.push(statusBarItem3);

	
	
	if (config.get('createTsButton') as boolean) {
		statusBarItem.show();
	}

	let statusBarItem2 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 2);
	statusBarItem2.text = "Build React Project";
	statusBarItem2.command = 'teoscommands.buildReactProject';


	
	if (config.get('createReactButton') as boolean) {
		statusBarItem2.show();
	}


	vscode.workspace.onDidChangeConfiguration((e) => {
		let config = vscode.workspace.getConfiguration('teoscommands');
		
		if (e.affectsConfiguration("teoscommands.createTsButton")) {
			
			if (config.get('createTsButton') as boolean) {

				statusBarItem.show();
			} else {

				statusBarItem.hide();
			}
		}

	
		if (config.get('createReactButton') as boolean) {
			statusBarItem2.show();
		} else {
			statusBarItem2.hide();
		}
		//trigger extension
		vscode.commands.executeCommand('teoscommands.trigger');

	});

	vscode.languages.onDidChangeDiagnostics((e) => {
		console.log("onDidChangeDiagnostics");
		
		const languageid = vscode.window.activeTextEditor?.document.languageId;
		if (languageid === 'typescript') {
			statusBarItem3.show();
		} else if (languageid === 'javascript') {
			statusBarItem3.show();
		} else {
			statusBarItem3.hide();
		}
		//trigger extension
		vscode.commands.executeCommand('teoscommands.trigger');
	});



	const commands: { [key: string]: vscode.Disposable} = {
		teoscommandsBuildTsProject,
		teoscommandsBuildReactProject,
		teoscommandstrigger
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
