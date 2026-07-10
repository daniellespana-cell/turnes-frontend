module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let dirty = false;

    // Encuentra todos los elementos <button>
    root.find(j.JSXElement, {
        openingElement: { name: { name: 'button' } }
    }).forEach(path => {
        const openingElement = path.node.openingElement;
        const hasAriaLabel = openingElement.attributes.some(
            attr => attr.type === 'JSXAttribute' && attr.name.name === 'aria-label'
        );

        if (!hasAriaLabel) {
            openingElement.attributes.push(
                j.jsxAttribute(j.jsxIdentifier('aria-label'), j.literal('Acción'))
            );
            dirty = true;
        }
    });

    return dirty ? root.toSource() : null;
};
