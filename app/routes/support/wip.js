const govukPrototypeKit = require('govuk-prototype-kit')
const path = '/WIP/support'
const router = govukPrototypeKit.requests.setupRouter(path)

const fs = require('fs')
const yaml = require('yaml')

const root = process.cwd()

const apiSpecFile = fs.readFileSync(root + '/app/data/metadata_management_api.yaml', 'utf8')
const apiSpec = yaml.parse(apiSpecFile)

router.get('/ipa-spec/:action', (request, response) => {

    const endpoints = {
        'search-your-data': {
            title: 'Search your data',
            path: '/cataloged-resources',
            method: 'get'
        },
        'submit-dataset': {
            title: 'Submit dataset',
            path: '/datasets',
            method: 'post'
        },
        'get-dataset': {
            title: 'Get dataset',
            path: '/datasets/{dataset-id}',
            method: 'get'
        },
        'update-dataset': {
            title: 'Update dataset',
            path: '/datasets/{dataset-id}',
            method: 'patch'
        },
        'delete-dataset': {
            title: 'Delete dataset',
            path: '/datasets/{dataset-id}',
            method: 'delete'
        }
    }

    const endpoint = endpoints[request.params.action]
    
    response.locals.title = endpoint.title
    response.locals.path = endpoint.path
    response.locals.method = endpoint.method
    response.locals.endpoint = apiSpec.paths[endpoint.path][endpoint.method]
    response.locals.components = apiSpec.components

    response.render('/WIP/support/ipa-spec')

})
