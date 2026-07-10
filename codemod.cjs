module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let dirty = false;

    // 1. Framer Motion
    root.find(j.ImportDeclaration, { source: { value: 'framer-motion' } })
        .forEach(path => {
            let hasMotion = false;
            let newSpecifiers = [];
            path.node.specifiers.forEach(specifier => {
                if (
                    specifier.type === 'ImportSpecifier' &&
                    specifier.imported.name === 'motion'
                ) {
                    hasMotion = true;
                    newSpecifiers.push(
                        j.importSpecifier(j.identifier('m'), j.identifier('motion'))
                    );
                } else {
                    newSpecifiers.push(specifier);
                }
            });
            if (hasMotion) {
                path.node.specifiers = newSpecifiers;
                dirty = true;
            }
        });

    // 2. Buttons type & aria-label
    root.find(j.JSXOpeningElement, { name: { name: 'button' } })
        .forEach(path => {
            let hasType = false;
            let hasAriaLabel = false;
            let hasTitle = false;

            // Check existing attributes
            const attrs = path.node.attributes || [];
            attrs.forEach(attr => {
                if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'type') {
                    hasType = true;
                }
                if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'aria-label') {
                    hasAriaLabel = true;
                }
                if (attr.type === 'JSXAttribute' && attr.name && attr.name.name === 'title') {
                    hasTitle = true;
                }
            });

            if (!hasType) {
                attrs.push(
                    j.jsxAttribute(
                        j.jsxIdentifier('type'),
                        j.stringLiteral('button')
                    )
                );
                dirty = true;
            }

            if (!hasAriaLabel && !hasTitle) {
                attrs.push(
                    j.jsxAttribute(
                        j.jsxIdentifier('aria-label'),
                        j.stringLiteral('Acción')
                    )
                );
                dirty = true;
            }
            
            path.node.attributes = attrs;
        });

    return dirty ? root.toSource() : null;
};
