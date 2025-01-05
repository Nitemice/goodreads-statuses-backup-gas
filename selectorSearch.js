// Basic Selector-like support for GAS
// Using XmlService functionality
// 
// Need to support:
// - Array of classes/attributes
// - Pattern matching attribute value
//
// Does not support:
// - CSS/query selector strings
// - comma separated lists of selectors,
// - most combinators and separators,
// - pseudo-classes
//
// Based on code from
// https://sites.google.com/site/scriptsexamples/learn-by-example/parsing-html
//
//
// TODO: Rename everything, optimise loops...

let selectorSearch = (function()
{
    function getElementsByAttribute(element, attributeName, attributeValues = [])
    {
        const data = [];
        const descendants = element.getDescendants();
        for (let descendant of descendants)
        {
            const descendantElement = descendant.asElement();
            if (descendantElement)
            {
                const attribute = descendantElement.getAttribute(attributeName);
                if (attribute)
                {
                    // If no attribute values were passed,
                    // just the presence of the attribute is a success
                    if (attributeValues.length > 0)
                    {
                        const attributeList =
                            attribute.getValue().split(' ').map((x) => x.trim());

                        // Check that every desired attribute value is included
                        // in attribute list of found element
                        if (attributeValues.every((attributeValue) =>
                            attributeList.includes(attributeValue)))
                        {
                            data.push(descendantElement);
                        }
                    }
                    else
                    {
                        data.push(descendantElement);

                    }
                }
            }
        }
        return data;
    }

    function getElementsByTagName(element, tagName)
    {
        const data = [];
        const descendants = element.getDescendants();

        for (let descendant of descendants)
        {
            const elt = descendant.asElement();
            if (elt && elt.getName() === tagName)
            {
                data.push(elt);
            }
        }
        return data;
    }

    function querySelectorAll(element, selector)
    {
        const parts = selector.trim().split(/\s+/);
        let currentElements = [element];

        // Process each part of the selector
        for (let part of parts)
        {
            let newElements = [];
            for (const currentElement of currentElements)
            {

                // ID selector (e.g. #id)
                if (part.startsWith('#'))
                {
                    const id = part.substring(1);
                    const found =
                        getElementsByAttribute(currentElement, 'id', [id]);
                    newElements.push(...found);
                }
                // Class selector (e.g. .class)
                else if (part.startsWith('.'))
                {
                    const classNames = part.split('.').filter((x) => x == '');
                    const found =
                        getElementsByAttribute(currentElement, 'class', classNames);
                    newElements.push(...found);

                }
                // Attributes selector (e.g. [type="text"])
                else if (part.includes('['))
                {
                    const att = part.split('=');
                    const attribute = att[0];
                    const value = att[1].replaceAll('"', '');
                    const found =
                        getElementsByAttribute(currentElement, attribute, [value]);
                    newElements.push(...found);
                }
                // Tag selector (e.g. div, p)
                else
                {
                    const found = getElementsByTagName(currentElement, part);
                    newElements.push(...found);
                }

            }
            // No elements found, so we don't need to continue
            if (newElements.length === 0)
            {
                return [];
            }
            currentElements = newElements;
        }

        // Return all matching elements
        return currentElements;
    }

    function querySelector(element, selector)
    {
        const found = querySelectorAll(element, selector);
        // Return the first element found
        return found.length > 0 ? found[0] : null;
    }

    function find(element, tag = null, attributeName = null, attributeValues = [])
    {
        // Phase 1, get all descendants
        let descendants = element.getDescendants();
        // Filter out non-element nodes
        descendants = descendants.map((descendant) => descendant.asElement())
            .filter((descendantElement) => descendantElement);

        // Phase 2, filter on tag, if specified
        if (tag)
        {
            const foundElements = [];
            for (let descendant of descendants)
            {
                if (descendant.getName() === tag)
                {
                    foundElements.push(descendant);
                }
            }

            // No elements found, so we don't need to continue
            if (foundElements.length === 0)
            {
                return [];
            }
            descendants = foundElements;
        }

        // Phase 3, filter on attribute name & values, if specified
        if (attributeName)
        {
            const foundElements = [];
            for (let descendant of descendants)
            {
                const attribute = descendant.getAttribute(attributeName);
                if (attribute)
                {
                    // If no attribute values were passed,
                    // just the presence of the attribute is a success
                    if (attributeValues.length > 0)
                    {
                        const attributeList =
                            attribute.getValue().split(' ').map((x) => x.trim());

                        // Check that every desired attribute value is included
                        // in attribute list of found element
                        if (attributeValues.every((attributeValue) =>
                            attributeList.includes(attributeValue)))
                        {
                            foundElements.push(descendant);
                        }
                    }
                    else
                    {
                        foundElements.push(descendant);

                    }
                }
            }
            descendants = foundElements;
        }

        // Phase 4, return results
        return descendants;
    }

    ///////////////////////////////////////////////////////////////////////////

    return {
        querySelector,
        querySelectorAll,
        find
    }
})();
