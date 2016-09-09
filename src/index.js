const arrowRegex = /^\s?(=>|→|throws)/;

export default function visitor({ types: t, template, transform }) {
  const assertTemplate = template(`
      assert.deepEqual($0, $1)
  `);

  const throwsTemplate = template(`
      assert.throws(() => { $0 } , $1);
  `);

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

          const rawComment = comments[0].value.replace(arrowRegex, '').trim();
          const comment = transform(`() => (${rawComment})`).ast.program.body[0].expression.body;

          if (t.isCallExpression(child) &&
                  child.callee && child.callee.object &&
                  child.callee.object.name === 'console') {
            path.node.trailingComments = comments.splice(1); // eslint-disable-line
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
