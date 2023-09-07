import type tsModule from 'typescript/lib/tsserverlibrary';
import type ts from 'typescript/lib/tsserverlibrary';
declare function init(modules: {
    typescript: typeof ts;
}): {
    create: (info: ts.server.PluginCreateInfo) => tsModule.LanguageService;
    getExternalFiles: (project: tsModule.server.ConfiguredProject) => string[];
};
export = init;
