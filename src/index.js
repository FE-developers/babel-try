const logReport = 'logReport';

function getFunctionName(path){
  const node = path.node;

  if(
    node.id &&
    node.id.name
  ) return node.id.name;

  if(
    path.parent &&
    path.parent.id &&
    path.parent.id.name
  ) return path.parent.id.name;

  if(
    node.key &&
    node.key.name
  ) return node.key.name;

  if(
    path.parent &&
    path.parent.key &&
    path.parent.key.name
  ) return path.parent.key.name;

  // 表达式
  return 'anonymous';
};

function createBlockStatement(t,node,name,filename,logReport){
  if(node.body.body.length < 1) return node.body;

  return t.blockStatement([
    t.tryStatement(
      node.body,
      t.catchClause(
        t.Identifier('e'),
        t.blockStatement([
          t.expressionStatement(
            t.CallExpression(
              t.identifier(logReport),
              [
                t.objectExpression([
                  t.ObjectProperty(t.Identifier('error'),t.identifier('e')),
                  t.ObjectProperty(t.Identifier('name'),t.StringLiteral(name)),
                  t.ObjectProperty(t.Identifier('filename'),t.StringLiteral(filename || 'normal'))
                ])
              ]
            )
          )
        ])
      )
    )
  ]);
}

module.exports = function (babel) {

  const {types: t} = babel;
  const startHash = new Map();
  return {
    name: "babel-try-info",
    visitor: {
      // state.opts.log
      ['ObjectMethod|ClassMethod|FunctionExpression|FunctionDeclaration|ArrowFunctionExpression']:{
        enter(path,state) {
          const node = path.node;
          if (startHash.get(node.start)) return;
          let name = getFunctionName(path);
          path.node.body = createBlockStatement(t,node,name,state.filename,state.opts.log || logReport);
          startHash.set(path.node.start,path);
        }
      }
    }
  };
};
