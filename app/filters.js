const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

const marked = require('marked')

// To do - Create seperate JS files for each sub-service

addFilter('getAPIRef', (components, ref) => {

    ref = ref.replace('#/components/','')
    const refParts = ref.split('/')
    let result = components
    for (const part of refParts) {
        if (result[part] !== undefined) {
          result = result[part]
        } else {
          // If the part does not exist, break out of the loop
          break
        }
      }
      return result

})

addFilter('markdown', (content) => {
    try {
        return marked.parse(content)
    } catch {
        return
    }
  
}, {renderAsHtml: true})

addFilter('includes', (array, value) => {
    
    try {
        return array.includes(value)
    } catch {
        return
    }
})

addFilter('sortKeys', (input) => {
    const keys = Object.keys(input)
    return keys.slice().sort((a, b) => a.localeCompare(b))
})

addFilter('govukDate', (input) => {
    try {
        return new Date(input).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    } catch {
        return
    }
})

addFilter('numberWithCommas', (input) => {
    try {
        return input.toLocaleString('en-GB')
    } catch {
        return
    }
})
