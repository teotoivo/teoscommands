import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function buildTsProject() {
    return vscode.commands.registerCommand('teoscommands.buildTsProject', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		
		let dir: string | undefined = (() => {
			if (vscode.workspace.workspaceFolders) {
				return vscode.workspace.workspaceFolders[0].uri.fsPath;
			}
			return undefined;
		})() ?? "no dir open";

		async function getProjectName (): Promise<string> {
            const input: string | undefined = await vscode.window.showInputBox({
                placeHolder: 'enter project name',
            });
            
            if (input === undefined) {
                return 'cancelled';
            }

            if (!isValidTypeScriptProjectName(input).valid) {
                vscode.window.showErrorMessage(isValidTypeScriptProjectName(input).message ?? "invalid project name");
                return getProjectName();
            }
            
            return input;
        }

        let projectName: string = await getProjectName();
        if (projectName === 'cancelled') {
            return;
        }
        
        createProject(projectName, dir);
	});
}

function isValidTypeScriptProjectName(name: string): { valid: boolean, message?: string } {
    //TypeScript project names can't contain capital letters
    if (name.match(/[A-Z]/)) {
        return { valid: false, message: "TypeScript project names can't contain capital letters" };
    }

    // TypeScript project names must start with a letter or underscore
    if (!/^[a-z_]/i.test(name)) {
      return { valid: false, message: 'TypeScript project names must start with a letter or underscore' };
    }
  
    // TypeScript project names can only contain letters, digits, underscores, and dots
    if (!/^[a-z0-9_.]+$/i.test(name)) {
      return { valid: false, message: 'TypeScript project names can only contain letters, digits, underscores, and dots' };
    }
  
    // TypeScript project names cannot contain consecutive dots
    if (/\.{2,}/.test(name)) {
      return { valid: false, message: 'TypeScript project names cannot contain consecutive dots' };
    }
  
    // TypeScript project names cannot end with a dot
    if (/\.$/.test(name)) {
      return { valid: false, message: 'TypeScript project names cannot end with a dot' };
    }
  
    return { valid: true };
}


async function createProject(projectName: string, dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const projectDir = path.join(dir, projectName);

    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir);
    }

    const srcDir = path.join(projectDir, 'src');
    const devlopmentDir = path.join(projectDir, 'dev');

    if (!fs.existsSync(srcDir)) { 
        fs.mkdirSync(srcDir);
    }

    if (!fs.existsSync(devlopmentDir)) {
        fs.mkdirSync(devlopmentDir);
    }

    if (!fs.existsSync(path.join(projectDir, 'src/public'))) {
        fs.mkdirSync(path.join(projectDir, 'src/public'));
    }

    if (!fs.existsSync(path.join(projectDir, 'src/css'))) {
        fs.mkdirSync(path.join(projectDir, 'src/css'));
    }

    if (!fs.existsSync(path.join(projectDir, 'src/js'))) {
        fs.mkdirSync(path.join(projectDir, 'src/js'));
    }

    if (!fs.existsSync(path.join(projectDir, 'src/html'))) {
        fs.mkdirSync(path.join(projectDir, 'src/html'));
    }
    

    const tsconfig = {
        compilerOptions: {
          target: "esnext",
          module: "commonjs",
          watch: true,
          rootDir: "./src",
          outDir: "./dev"
        },
        include: ["src/**/*"]
    };

    fs.writeFileSync(path.join(projectDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    const packageJson = {
        name: projectName,
        version: '1.0.0',
        private: true,
        scripts: {
          build: 'tsc',
        },
        devDependencies: {
          typescript: 'latest',
        },
    };

    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    const indexTs = `console.log('hello world');`;

    fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs);


    //message to user
    vscode.window.showInformationMessage(`Successfully created project "${projectName}"`);
}