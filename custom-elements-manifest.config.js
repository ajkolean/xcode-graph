import { typeParserPlugin, getTsProgram } from '@wc-toolkit/type-parser';
import { customElementJetBrainsPlugin } from 'custom-element-jet-brains-integration';
import { customElementVsCodePlugin } from 'custom-element-vs-code-integration';

export default {
  globs: [
    'src/components/**/*.ts',
    'src/graph/components/**/*.ts',
    'src/ui/components/**/*.ts',
    'src/ui/layout/**/*.ts',
  ],
  exclude: [
    'src/**/*.test.ts',
    'src/graph/components/canvas/**/*.ts',
    'src/graph/components/test-helpers/**/*.ts',
  ],
  outdir: '.',
  litelement: true,
  dev: false,

  overrideModuleCreation({ ts, globs }) {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program
      .getSourceFiles()
      .filter((sf) => globs.some((glob) => sf.fileName.includes(glob)));
  },

  plugins: [
    typeParserPlugin(),
    customElementVsCodePlugin({
      outdir: '.',
      htmlFileName: 'vscode.html-custom-data.json',
      cssFileName: 'vscode.css-custom-data.json',
    }),
    customElementJetBrainsPlugin({
      outdir: '.',
      htmlFileName: 'web-types.json',
    }),
  ],
};
