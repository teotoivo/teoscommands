import { execSync } from 'child_process';
import * as fs from 'fs';
import path = require('path');
import * as vscode from 'vscode';

export async function buildReactProject(context: vscode.ExtensionContext) {

	

	return vscode.commands.registerCommand('teoscommands.buildReactProject', async () => {


		async function getProjectName(): Promise<string | undefined> {
			return await vscode.window.showInputBox({
				placeHolder: 'enter project name',
			});
		}

		let dir: string | undefined = (() => {
			if (vscode.workspace.workspaceFolders) {
				return vscode.workspace.workspaceFolders[0].uri.fsPath;
			}
			return undefined;
		})() ?? "no dir open";
	
		// Parse the project name from the command line arguments
		//const projectName = process.argv[2];
		
		let projectName = await getProjectName();
		if (projectName === undefined) {
			return;
		}

		//check if there is a project with the same name
		if (fs.existsSync(path.join(dir, projectName))) {
			vscode.window.showErrorMessage(`Project ${projectName} already exists`);
			return;
		}

		let projectdir = path.join(dir, projectName);

		// open new terminal
		const term: vscode.Terminal = vscode.window.createTerminal(projectName);
		term.show();

		// Create a new directory for the project
		fs.mkdirSync(projectdir);

		//change terminal directory
		term.sendText(`cd ${projectdir}`);

		// Navigate into the new project directory
		
		process.chdir(path.join(dir, projectName));

	
	
		// Initialize a new npm package
		fs.writeFileSync(
			'package.json',
			JSON.stringify({
			  	name: projectName,
			  	version: '1.0.0',
			  	private: true,
			  	scripts: {
					build: 'webpack --config webpack.config.js',
					start: 'webpack-dev-server --config webpack.config.js',
			  	},
			}, null, 4),
			'utf-8'
		);
		
		// Install React and React DOM as dependencies
		execSync(`cd "${projectdir}"&npm install react react-dom`, { stdio: 'inherit' });
		
		// Install TypeScript and the TypeScript React Preset as dev dependencies
		execSync(`cd "${projectdir}"&npm install --save-dev typescript @types/react @types/react-dom @types/node`, { stdio: 'inherit' });

		//babel
		execSync(`cd "${projectdir}"&npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader`, { stdio: 'inherit' });

		// Install TypeScript, Babel, and the required Babel presets and plugins as dev dependencies
		execSync(`cd "${projectdir}"&npm install --save-dev typescript @babel/preset-react @babel/preset-typescript @babel/plugin-proposal-class-properties`, {
			stdio: 'inherit',
		});

		// install webpack and webpack-cli as dev dependencies
		execSync(`cd "${projectdir}"&npm install --save-dev webpack webpack-cli webpack-dev-server ts-loader html-webpack-plugin`, { stdio: 'inherit' });

		// Create a basic TypeScript configuration file
		fs.writeFileSync(
		  'tsconfig.json',
		  JSON.stringify({
			compilerOptions: {
			  jsx: 'react',
			  lib: ['dom', 'esnext'],
			  module: 'esnext',
			  moduleResolution: 'node',
			  noImplicitAny: true,
			  outDir: 'build',
			  sourceMap: true,
			  strict: true,
			  target: 'es5',
			},
			include: ['src'],
			exclude: ['node_modules'],
		  }, null, 4),
		  'utf-8'
		);

		//create .bavlerc file
		fs.writeFileSync(
			'.babelrc',
			JSON.stringify({
				presets: ['@babel/preset-react', '@babel/preset-typescript'],
				plugins: ['@babel/plugin-proposal-class-properties'],
			}, null, 4),
			'utf-8'
		);



		// Create a basic Webpack configuration file
		fs.writeFileSync(
			'webpack.config.js',
			`

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
	mode: 'development',
	entry: './src/index.tsx',
	devtool: 'inline-source-map',
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'bundle.js'
	},
	devtool: 'inline-source-map',
	devServer: {
		static: './dist',
		open: true,
	},
	module: {
		rules: [
			{
				test: /.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		]
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	plugins:[
		new HtmlWebpackPlugin({
		template: './public/index.html'
		})
	]
}

		  `,
			'utf-8'
		);
	
		// Create the basic file structure for the project
		fs.mkdirSync('src');
		fs.mkdirSync('public');
	
		// Create a basic HTML file
		fs.writeFileSync(
		  'public/index.html',
		  `
<!DOCTYPE html>
<html>
  <head>
	<meta charset='utf-8'>
	<title>${projectName}</title>
  </head>
  <body>
	<div id='root'></div>
  </body>
</html>
		`,
		  'utf-8'
		);
		
		// Create a basic TypeScript entry point file
		fs.writeFileSync(
		  'src/index.tsx',
		  `
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
	
const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement
)

root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

		`,
		  'utf-8'
		);

		fs.writeFileSync(
			'src/App.tsx',
			`
import * as React from 'react';

const App = () => {
	return (
		<div>Hello World!</div>
  	)
}
export default App;
`,
			'utf-8'
		);


		vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectdir));
	});
}