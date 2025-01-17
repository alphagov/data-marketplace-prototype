// #################################################
// Auth - WIP
// #################################################

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter('/WIP')

const allowedPaths = [
    '/sign-in',
    '/home',
    '/support'
]

router.use(function(request, response, next) {

    const path = request.path

    console.log(path)

    if (request.session.data.loggedin == 'true') {
        next()
        return
    }

    for (allowedPath of allowedPaths) {
        if (path.startsWith(allowedPath)) {
            next()
            return
        }
    }

    response.redirect('/WIP/sign-in')
    
})
