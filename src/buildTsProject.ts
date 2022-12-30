import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ExtensionContext } from 'vscode';

export async function buildTsProject(context: vscode.ExtensionContext) {
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

    

    function getDirectoriesToCreate(paths: string[]): string[] {
        const directoriesToCreate: string[] = [];

        console.log({paths});
        
      
        for (const path of paths) {
          const directories = path.split('/');
          let currentDirectory = '';
      
          for (const directory of directories) {
            currentDirectory += directory + '/';
            if (!directoriesToCreate.includes(currentDirectory)) {
              directoriesToCreate.push(currentDirectory);
            }
          }
        }
      
        return directoriesToCreate;
    }


    //get teoscommands.folders settings value
    
    const config = vscode.workspace.getConfiguration('teoscommands');
    const afolders = config.get('folders') as string[];
    
    

    const directoriesToCreate = getDirectoriesToCreate(afolders);

    for (const directory of directoriesToCreate) {
        if (!fs.existsSync(path.join(projectDir, directory))) {
            if (directory.includes('.')) {
                try {
                    fs.writeFileSync(path.join(projectDir, directory), '');
                } catch (error: any) {
                    if (error.code !== 'EEXIST') {
                        throw error;
                    }
                }
            } else {
                try {
                    fs.mkdirSync(path.join(projectDir, directory));
                } catch (error: any) {
                    if (error.code !== 'EEXIST') {
                        throw error;
                    }
                }
            }
        }
    }
    


    const tsconfig = {
        compilerOptions: {
            target: "esnext",
            module: "commonjs",
            watch: true,
            rootDir: "./src",
            outDir: "./dev",
            strict: true,
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


    //switch working vs code directory to project directory
    vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(projectDir));

    //message to user
    vscode.window.showInformationMessage(`Successfully created project "${projectName}"`);
}