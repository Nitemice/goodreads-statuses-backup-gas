// Extra XML navigation functionality
// Using GAS XmlService
//

let xmlcommon = (function()
{
    // Basic Selector-like search support
    // Based on code from
    // https://sites.google.com/site/scriptsexamples/learn-by-example/parsing-html
    //
    // Supports:
    // - array of classes/attribute values
    //
    // Need to support:
    // - pattern matching attribute value
    //
    // Does not support:
    // - CSS/query selector strings
    // - comma separated lists of selectors,
    // - most combinators and separators,
    // - pseudo-classes
    function findAll(element, tag = null, attributeName = null, attributeValues = [])
    {
        // Phase 1: get all descendants, then filter out non-element nodes
        let descendants = element.getDescendants()
            .map((descendant) => descendant.asElement())
            .filter((descendant) => descendant);

        // Phase 2: filter on tag, if specified
        if (tag)
        {
            descendants = descendants.filter((descendant) =>
                descendant.getName() === tag);
        }

        // Phase 3: filter on attribute name & values, if specified
        if (attributeName)
        {
            descendants = descendants.filter((descendant) =>
            {
                const attribute = descendant.getAttribute(attributeName);
                // Skip elements without the attribute
                if (!attribute)
                {
                    return false;
                }

                // If no attribute values were passed,
                // just the presence of the attribute is a success
                if (attributeValues.length === 0)
                {
                    return true;
                }

                // Check that every desired attribute value is included
                // in attribute list of found element
                const attributeList = attribute.getValue().split(' ')
                    .map((x) => x.trim());
                return attributeValues.every((value) =>
                    attributeList.includes(value));

            });
        }

        // Phase 4: return results
        return descendants;
    }


    function find(element, tag = null, attributeName = null, attributeValues = [])
    {
        const found = findAll(element, tag, attributeName, attributeValues);
        // Return the first element found
        return found.length > 0 ? found[0] : null;
    }

    function getAttributeValue(element, attribute) {
        const attribObj = element.getAttribute(attribute);
        // Skip elements without the attribute
        if (!attribObj)
        {
            return null;
        }
        return attribObj.getValue();
    }

    ///////////////////////////////////////////////////////////////////////////

    return {
        find,
        findAll,
        getAttributeValue
    }
})();
