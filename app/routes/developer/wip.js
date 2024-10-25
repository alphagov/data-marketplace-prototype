const govukPrototypeKit = require('govuk-prototype-kit')
const { resetState } = require('govuk-prototype-kit/lib/routes/api')
const path = '/WIP/developer'
const router = govukPrototypeKit.requests.setupRouter(path)

router.post('/new-api-key', (request, response) => {

    let data = request.session.data
    
    const appName = data['app-name']
    const environment = data['app-environment']

    if (appName.trim() === '') {
        // no name entered
        response.redirect(path + '/new-api-key')
        return
    }

    data.developer.apps.push({
        "name": appName,
        "environment": environment,
    })

    data.appCreated = true

    response.redirect(path + '/api-keys/' + appName)

})

router.get('/api-keys/:name', (request, response) => {

    const data = request.session.data
    const appName = request.params.name

    // display notification banner if app was just created

    if (data.appCreated) {
        response.locals.appCreated = true
        delete data.appCreated
    }

    response.locals.app = data.developer.apps.find(app => app.name == appName)

    response.render(path + '/view-api-key')

})
