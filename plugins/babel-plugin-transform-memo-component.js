module.exports = function ({types: t}) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name === 'memo') {
          const memoArg = path.node.arguments[0];
          if (
            t.isFunctionExpression(memoArg) ||
            t.isArrowFunctionExpression(memoArg)
          ) {
            let functionName;
            functionName;
            if (memoArg.id) {
              functionName = memoArg.id.name;
              return;
            } else {
              const parent = path.findParent(parentPath =>
                parentPath.isVariableDeclarator(),
              );
              if (parent && parent.node.id && parent.node.id.name) {
                functionName = parent.node.id.name;
              } else {
                functionName = 'AnonymousComponent';
              }
            }
            const tempFunctionName = `${functionName}Defrost`;
            memoArg.id = t.identifier(tempFunctionName);
          }
        }
      },
    },
  };
};
