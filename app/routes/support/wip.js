const govukPrototypeKit = require('govuk-prototype-kit')
const path = '/WIP/support'
const router = govukPrototypeKit.requests.setupRouter(path)

const fs = require('fs')
const yaml = require('yaml')

const root = process.cwd()

const apiSpecFile = fs.readFileSync(root + '/app/data/metadata_management_api.yaml', 'utf8')
const apiSpec = yaml.parse(apiSpecFile)

router.get('/ipa-spec/:path', (request, response) => {

    const path = '/' + request.params.path

    response.locals.path = path

    response.locals.endpoint = apiSpec.paths[path]
    response.locals.components = apiSpec.components

    response.render('/WIP/support/ipa-spec')

})
