const govukPrototypeKit = require('govuk-prototype-kit')
const addFilter = govukPrototypeKit.views.addFilter

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