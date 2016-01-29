import traverse from 'babel-traverse'
import template from 'babel-template'
import * as babylon from 'babylon'
import * as t from 'babel-types'

let assertTemplate = template(`
assert.deepEqual($0, $1)
`)

export default function visitor () {
  return {
    visitor: {
      ExpressionStatement (path) {
        let comments = path.node.trailingComments
        if (comments &&
            comments.length > 0 &&
            comments[0].value.match(/^=>/)) {
          let child = path.node.expression
          let comment

          let rawComment = comments[0].value.substring(2).trim()
          let ast = babylon.parse('return ' + rawComment, {
            allowReturnOutsideFunction: true
          })
          traverse.cheap(ast, (node) => {
            if (t.isReturnStatement(node)) {
              comment = node.argument
            }
          })

          if (t.isCallExpression(child) && child.callee.object.name === 'console') {
            let code = child.arguments[0]
            path.insertAfter(assertTemplate(code, comment))
          } else {
            path.node.trailingComments = comments.splice(1)
            path.replaceWith(assertTemplate(child, comment))
          }
        }
      }
    }
  }
}
