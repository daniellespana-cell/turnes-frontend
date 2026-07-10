module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let dirty = false;

  // Identify React components (functions returning JSX)
  function isComponent(path) {
    let returnsJSX = false;
    j(path).find(j.ReturnStatement).forEach(p => {
      if (p.node.argument && (p.node.argument.type === 'JSXElement' || p.node.argument.type === 'JSXFragment' || (p.node.argument.type === 'ConditionalExpression' && (p.node.argument.consequent.type === 'JSXElement' || p.node.argument.consequent.type === 'Literal')))) {
        returnsJSX = true;
      }
    });
    return returnsJSX;
  }

  // Check if an initializer is static (doesn't depend on scope)
  function isStatic(node) {
    if (!node) return false;
    if (node.type === 'Literal') return true;
    if (node.type === 'ArrayExpression') {
      return node.elements.every(el => isStatic(el));
    }
    if (node.type === 'ObjectExpression') {
      return node.properties.every(prop => 
        (prop.type === 'Property' && isStatic(prop.value) && (prop.key.type === 'Identifier' || prop.key.type === 'Literal')) ||
        (prop.type === 'ObjectProperty' && isStatic(prop.value) && (prop.key.type === 'Identifier' || prop.key.type === 'Literal'))
      );
    }
    if (node.type === 'JSXElement') {
      // Can't easily hoist JSX elements if they use props, but let's assume they don't if they pass isStatic for all attributes and children.
      // Actually, let's allow JSXElement if all attributes and children are static.
      let staticElement = true;
      node.openingElement.attributes.forEach(attr => {
         if (attr.type === 'JSXAttribute' && attr.value && attr.value.type === 'JSXExpressionContainer') {
             if (!isStatic(attr.value.expression)) staticElement = false;
         }
      });
      return staticElement;
    }
    // Very naive, let's also allow React.createElement? No.
    return false;
  }

  root.find(j.VariableDeclaration).forEach(path => {
    // Only target variable declarations directly inside a block statement of a component
    if (path.parent.node.type === 'BlockStatement' && 
        (path.parent.parent.node.type === 'ArrowFunctionExpression' || path.parent.parent.node.type === 'FunctionDeclaration')) {
        
        if (isComponent(path.parent.parent)) {
            // Check if all declarators are static
            const allStatic = path.node.declarations.every(decl => isStatic(decl.init));
            
            if (allStatic) {
                // Remove from inside the component
                const declarations = path.node.declarations;
                j(path).remove();
                
                // Insert above the component
                const componentPath = path.parent.parent.parent;
                // If it's `const Comp = () => {}`
                if (componentPath.node.type === 'VariableDeclarator') {
                   const componentDecl = componentPath.parent;
                   j(componentDecl).insertBefore(j.variableDeclaration('const', declarations));
                   dirty = true;
                } else if (componentPath.node.type === 'FunctionDeclaration') {
                   j(componentPath).insertBefore(j.variableDeclaration('const', declarations));
                   dirty = true;
                }
            }
        }
    }
  });

  return dirty ? root.toSource() : null;
};
