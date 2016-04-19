import traverse from 'babel-traverse';
import template from 'babel-template';
import * as babylon from 'babylon';
import * as t from 'babel-types';

const assertTemplate = template(`
assert.deepEqual($0, $1)
`);

export default function visitor() {
  return {
    visitor: {
      ExpressionStatement(path) {
        const comments = path.node.trailingComments;
        if (comments &&
            comments.length > 0 &&
            comments[0].value.match(/^=>/)) {
          const child = path.node.expression;
          let comment;

          const rawComment = comments[0].value.substring(2).trim();
          const ast = babylon.parse(`return ${rawComment}`, {
            allowReturnOutsideFunction: true,
          });
          traverse.cheap(ast, (node) => {
            if (t.isReturnStatement(node)) {
              comment = node.argument;
            }
          });

          if (t.isCallExpression(child) &&
                  child.callee && child.callee.object &&
                  child.callee.object.name === 'console') {
            const code = child.arguments[0];
            path.insertAfter(assertTemplate(code, comment));
          } else {
            path.node.trailingComments = comments.splice(1); // eslint-disable-line
            path.replaceWith(assertTemplate(child, comment));
          }
        }
      },
    },
  };
}
