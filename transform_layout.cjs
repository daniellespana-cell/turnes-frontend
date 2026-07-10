module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let dirty = false;

  const layoutProps = ['height', 'width', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'top', 'bottom', 'left', 'right', 'padding', 'margin', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'];
  const targetAttributes = ['initial', 'animate', 'exit', 'whileHover', 'whileTap'];

  root.find(j.JSXAttribute).forEach(attrPath => {
    const attrName = attrPath.node.name.name;
    if (targetAttributes.includes(attrName) && attrPath.node.value && attrPath.node.value.type === 'JSXExpressionContainer') {
      const expression = attrPath.node.value.expression;
      
      // If it's an object expression (e.g. exit={{ opacity: 0, height: 0 }})
      if (expression.type === 'ObjectExpression') {
        const newProperties = [];
        let hasScaleOrScaleY = false;
        
        // First pass: check if scale or scaleY already exist
        expression.properties.forEach(prop => {
            if (prop.type === 'Property' && prop.key && prop.key.type === 'Identifier') {
                if (prop.key.name === 'scale' || prop.key.name === 'scaleY' || prop.key.name === 'scaleX') {
                    hasScaleOrScaleY = true;
                }
            }
        });

        let heightRemoved = false;
        
        expression.properties.forEach(prop => {
          if (prop.type === 'Property' && prop.key && prop.key.type === 'Identifier') {
            if (layoutProps.includes(prop.key.name)) {
                dirty = true;
                if (prop.key.name === 'height') {
                    heightRemoved = true;
                }
                // Do not add to newProperties (removing it)
            } else {
                newProperties.push(prop);
            }
          } else {
             newProperties.push(prop);
          }
        });
        
        if (dirty) {
            expression.properties = newProperties;
        }
      }
    }
  });

  return dirty ? root.toSource() : null;
};
