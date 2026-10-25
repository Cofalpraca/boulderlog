import ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { format } from 'node:util';

export const slash = value => value.replaceAll('\\', '/');
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]).sort();
}
export function discover(root) {
  const files = walk(join(root, 'src')).filter(file => /\.(test|spec)\.tsx?$/.test(file));
  const cases = [];
  const unsupported = [];
  for (const file of files) {
    const source = slash(relative(root, file));
    const text = readFileSync(file, 'utf8');
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const environment = text.includes('@vitest-environment node') ? 'node' : 'jsdom';
    function visit(node, ancestors = [], inheritedSkip = false) {
      if (ts.isCallExpression(node)) {
        let callee = node.expression;
        let parameters;
        if (ts.isCallExpression(callee) && ts.isPropertyAccessExpression(callee.expression) && callee.expression.name.text === 'each') {
          const values = callee.arguments[0];
          if (values && ts.isArrayLiteralExpression(values)) {
            parameters = values.elements.map(value => {
              if (ts.isStringLiteralLike(value)) return [value.text];
              if (ts.isNumericLiteral(value)) return [Number(value.text)];
              return null;
            });
          }
          callee = callee.expression.expression;
        }
        const parts = callee.getText(ast).split('.');
        const kind = parts[0];
        if (['describe', 'suite', 'it', 'test'].includes(kind) && node.arguments.length >= 1 && !parts.includes('each')) {
          const titleNode = node.arguments[0];
          if (!ts.isStringLiteralLike(titleNode) || parameters?.some(p => p === null)) {
            unsupported.push({ source, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, declaration: node.getText(ast) });
            return;
          }
          const skipped = inheritedSkip || parts.includes('skip');
          const todo = parts.includes('todo');
          if (kind === 'describe' || kind === 'suite') {
            const callback = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
            if (callback) ts.forEachChild(callback.body, child => visit(child, [...ancestors, titleNode.text], skipped));
            return;
          }
          const body = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
          const assertions = [];
          function collect(child) {
            if (ts.isCallExpression(child) && ts.isPropertyAccessExpression(child.expression) && /^to[A-Z]/.test(child.expression.name.text)
              && /^expect(?:\.soft)?\s*\(/.test(child.getText(ast))) {
              assertions.push(child.getText(ast).replace(/\s+/g, ' '));
            }
            ts.forEachChild(child, collect);
          }
          if (body) collect(body.body);
          for (const values of parameters || [[]]) {
            const title = values.length ? format(titleNode.text, ...values) : titleNode.text;
            const fullName = [...ancestors, title].join(' ');
            cases.push({ source, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
              title, fullName, environment, declaredSkip: skipped, declaredTodo: todo,
              sourceHash: sha256(text), assertions, key: `${source}::${fullName}` });
          }
          return;
        }
      }
      ts.forEachChild(node, child => visit(child, ancestors, inheritedSkip));
    }
    visit(ast);
  }
  return { files: files.map(file => slash(relative(root, file))), cases, unsupported };
}
