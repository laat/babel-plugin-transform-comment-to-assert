import traverse from 'babel-traverse';
import template from 'babel-template';
import * as babylon from 'babylon';
import * as t from 'babel-types';

const assertTemplate = template(`
assert.deepEqual($0, $1)
`);

const throwsTemplate = template(`
assert.throws(() => { $0 } , $1);
`);

const arrowRegex = /^\s?(=>|→|throws)/;

export default function visitor() {
  return {
    visitor: {
      ExpressionStatement(path) {
        const comments = path.node.trailingComments;
        if (comments &&
            comments.length > 0 &&
            comments[0].value.match(arrowRegex)) {
          const matches = comments[0].value.match(arrowRegex);
          const throws = matches[1] === 'throws';

          const child = path.node.expression;
          let comment;

          const rawComment = comments[0].value.replace(arrowRegex, '').trim();
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
            if (throws) {
              path.insertAfter(throwsTemplate(code, comment));
            } else {
              path.insertAfter(assertTemplate(code, comment));
            }
          } else {
            path.node.trailingComments = comments.splice(1); // eslint-disable-line
            if (throws) {
              path.replaceWith(throwsTemplate(child, comment));
            } else {
              path.replaceWith(assertTemplate(child, comment));
            }
          }
        }
      },
    },
  };
}
