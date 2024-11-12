const govukPrototypeKit = require('govuk-prototype-kit')
const path = '/WIP/support'
const router = govukPrototypeKit.requests.setupRouter(path)

const fs = require('fs')
const yaml = require('yaml')

const root = process.cwd()

const apiSpecFile = fs.readFileSync(root + '/app/data/metadata_management_api.yaml', 'utf8')
const apiSpec = yaml.parse(apiSpecFile)

router.get('/test', (request, response) => {

    response.send(apiSpec)

})
