"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const typescript_1 = require("typescript");
function init(modules) {
    /**
     * Now the real deal - when a .blend file is imported, load in the .blend file using parseBlend.ts, and provide a extend Record<string, string> of objects and their parents
     */
    function create(info) {
        // Diagnostic logging
        info.project.projectService.logger.info("I'm getting set up now! Check the log for this message.");
        // Set up decorator object
        const languageServiceHost = {};
        const languageServiceHostProxy = new Proxy(info.languageServiceHost, {
            get(target, key) {
                return languageServiceHost[key]
                    ? languageServiceHost[key]
                    : target[key];
            },
        });
        const typeFolderPath = ".godot/types";
        function resPathToFileString(path) {
            return path.slice(6); // Remove "res://"
        }
        const scriptPath = "addons/godot-scene-type/cli-src/test.gd";
        const godotPath = "C:/Projects/Coding/godot/bin/godot.windows.editor.x86_64.exe";
        languageServiceHost.getScriptKind = (fileName) => {
            if (isSupportedExtension(fileName)) {
                return modules.typescript.ScriptKind.TS;
            }
            return info.languageServiceHost.getScriptKind(fileName);
        };
        languageServiceHost.getScriptSnapshot = (fileName) => {
            if (isSupportedExtension(fileName)) {
                info.project.projectService.logger.info(fileName);
                const relativeToProjectRoot = path_1.default.relative(info.project.getCurrentDirectory(), fileName);
                const resolvedPath = `res://${relativeToProjectRoot}`;
                const command = `${godotPath} --headless --path "${info.project.getCurrentDirectory()}" --script "${scriptPath}" -- "${resolvedPath}" "${typeFolderPath}"`;
                info.project.projectService.logger.info(`Running command: ${command}`);
                (0, child_process_1.execSync)(command);
                info.project.projectService.logger.info(relativeToProjectRoot);
                const toSnapshot = path_1.default.resolve(info.project.getCurrentDirectory(), typeFolderPath, relativeToProjectRoot + ".d.ts");
                info.project.projectService.logger.info(toSnapshot);
                return typescript_1.ScriptSnapshot.fromString(fs_1.default.readFileSync(toSnapshot).toString());
            }
            // Fall back to the default behavior.
            return info.languageServiceHost.getScriptSnapshot(fileName);
        };
        languageServiceHost.resolveModuleNameLiterals = (moduleNames, containingFile, redirectedReference, options, sourceFile, reusedNames) => {
            return moduleNames.map(moduleName => {
                if (isSupportedExtension(moduleName.text)) {
                    // if module starts with res:// we treat this differently
                    const fromProjectRoot = moduleName.text.startsWith("res://")
                        ? resPathToFileString(moduleName.text)
                        : path_1.default.relative(info.project.getCurrentDirectory(), `${path_1.default.dirname(containingFile)}/${moduleName.text}`);
                    const resolvedModule = {
                        resolvedFileName: path_1.default.resolve(info.project.getCurrentDirectory(), fromProjectRoot),
                        extension: modules.typescript.Extension.Dts,
                        isExternalLibraryImport: false,
                    };
                    info.project.projectService.logger.info(`Resolved module: ${JSON.stringify(resolvedModule)}`);
                    return { resolvedModule };
                }
                // Fall back to the default behavior. (What I think is default?)
                const result = modules.typescript.resolveModuleName(moduleName.text, containingFile, options, languageServiceHostProxy);
                return { resolvedModule: result.resolvedModule };
            });
        };
        const languageService = modules.typescript.createLanguageService(languageServiceHostProxy);
        return languageService;
    }
    const supportedExtensions = [
        '.tscn',
        '.scn',
        '.glb',
        '.gltf',
        '.tbg',
        '.blend',
    ];
    function isSupportedExtension(fileName) {
        return supportedExtensions.some(supportedExt => fileName.endsWith(supportedExt));
    }
    function getExternalFiles(project) {
        return project.getFileNames().filter(isSupportedExtension);
    }
    return { create, getExternalFiles };
}
module.exports = init;
