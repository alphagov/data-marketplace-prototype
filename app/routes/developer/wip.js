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
        "scopes": ['discover','publish','delete'],
        "expiry-day": "1",
        "expiry-month": "1",
        "expiry-year": "2026"
    })

    data.appCreated = true

    response.redirect(path + '/api-confirmation')

})

router.get('/api-keys/:name', (request, response, next) => {

    const data = request.session.data
    const appName = request.params.name

    // display notification banners

    if (data.appCreated) {
        response.locals.appCreated = true
        delete data.appCreated
    }

    if (data.changesSaved) {
        response.locals.changesSaved = true
        delete data.changesSaved
    }

    response.locals.app = data.developer.apps.find(app => app.name == appName)

    if (!response.locals.app) {
        next()
        return
    }

    response.render(path + '/view-api-key')

})

router.get('/api-key-name/:name', (request, response) => {

    const data = request.session.data
    const appName = request.params.name

    response.locals.app = data.developer.apps.find(app => app.name == appName)

    response.render(path + '/api-key-name')

})

router.post('/api-key-name/:name', (request, response) => {

    const data = request.session.data
    const newAppName = data['app-name']
    const oldAppName = request.params.name

    let app = data.developer.apps.find(app => app.name == oldAppName)

    app.name = newAppName

    data.changesSaved = true

    response.redirect(path + '/api-keys/' + newAppName)

})

router.get('/api-key-scopes/:name', (request, response) => {

    const data = request.session.data
    const appName = request.params.name

    response.locals.app = data.developer.apps.find(app => app.name == appName)

    response.render(path + '/api-key-scopes')

})

router.post('/api-key-scopes/:name', (request, response) => {

    const data = request.session.data
    const scopes = data['scopes']
    const appName = request.params.name

    let app = data.developer.apps.find(app => app.name == appName)

    app.scopes = scopes

    data.changesSaved = true

    response.redirect(path + '/api-keys/' + appName)

})

router.get('/api-key-expiry/:name', (request, response) => {

    const data = request.session.data
    const appName = request.params.name

    response.locals.app = data.developer.apps.find(app => app.name == appName)

    response.render(path + '/api-key-expiry')

})

router.post('/api-key-expiry/:name', (request, response) => {

    const data = request.session.data
    const day = data['expiry-day']
    const month = data['expiry-month']
    const year = data['expiry-year']
    const appName = request.params.name

    let app = data.developer.apps.find(app => app.name == appName)

    app['expiry-day'] = day
    app['expiry-month'] = month
    app['expiry-year'] = year

    data.changesSaved = true

    response.redirect(path + '/api-keys/' + appName)

})

router.get('/api-confirm-revoke/:name', (request, response) => {

    response.locals.name = request.params.name

    response.render(path + '/api-confirm-revoke')

})

// post api key revoke route

router.post('/api-confirm-revoke/:name', (request, response) => {

    const data = request.session.data

    const appName = request.params.name

    data.developer.apps = data.developer.apps.filter(app => app.name !== appName)

    response.redirect(path + '/api-keys?revoked=true')

})
  

router.get('/api-keys', (request, response) => {

    if (request.session.data.revoked){
        delete request.session.data.revoked
    }

    console.dir(response.locals)

    response.render(path + '/api-keys')

})

