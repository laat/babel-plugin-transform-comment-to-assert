/* eslint-disable comma-dangle */
import { declare } from '@babel/helper-plugin-utils';

const arrowRegex = /^\s?(=>|→|throws)/;

export default declare(function visitor(api) {
  const { types: t, transform } = api;
  api.assertVersion(7);
  const assertExpression = (actual, expected, loc, message) => {
    const exp = t.callExpression(
      t.memberExpression(t.identifier('assert'), t.identifier('deepEqual')),
      [actual, expected, ...(message ? [t.stringLiteral(message)] : [])]
    );
    exp.loc = loc;
    return exp;
  };

  const throwsExpression = (body, arg, loc, message) => {
    const exp = t.callExpression(
      t.memberExpression(t.identifier('assert'), t.identifier('throws')),
      [
        t.arrowFunctionExpression([], body),
        arg,
        ...(message ? [t.stringLiteral(message)] : []),
      ]
    );
    exp.loc = loc;
    return exp;
  };

  return {
    visitor: {
      ExpressionStatement(path, state) {
        const comments = path.node.trailingComments;
        const message = state.opts && state.opts.message;
        if (
          comments &&
          comments.length > 0 &&
          comments[0].value.match(arrowRegex)
        ) {
          const matches = comments[0].value.match(arrowRegex);
          const throws = matches[1] === 'throws';
          if (path.node.type !== 'ExpressionStatement') {
            return;
          }
          const child = path.node.expression;
          const commentLoc = comments[0].loc;
          const rawComment = comments[0].value.replace(arrowRegex, '').trim();

          const comment = transform(`() => (${rawComment})`, { ast: true }).ast
            .program.body[0].expression.body;

          path.node.trailingComments = comments.splice(1);
          if (
            t.isCallExpression(child) &&
            child.callee &&
            child.callee.object &&
            child.callee.object.name === 'console'
          ) {
            const code = child.arguments[0];
            if (throws) {
              path.insertAfter(
                t.expressionStatement(
                  throwsExpression(code, comment, commentLoc, message)
                )
              );
            } else {
              path.insertAfter(
                t.expressionStatement(
                  assertExpression(code, comment, commentLoc, message)
                )
              );
            }
          } else {
            if (throws) {
              path.replaceWith(
                throwsExpression(child, comment, commentLoc, message)
              );
            } else {
              path.replaceWith(
                assertExpression(child, comment, commentLoc, message)
              );
            }
          }
        }
      },
    },
  };
});
