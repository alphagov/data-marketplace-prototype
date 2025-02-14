// #################################################
// Auth - WIP
// #################################################

const url = require('url')

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter('/WIP')

const allowedPaths = [
    '/sign-in',
    '/home',
    '/support*',
    '/'
]

router.use(function(request, response, next) {

    const path = request.path

    console.log(path)

    console.dir(request.session.data)

    if (request.session.data.loggedin == 'true') {
        next()
        return
    }

    for (let allowedPath of allowedPaths) {
        if (allowedPath.endsWith('*')){
            if (path.startsWith(allowedPath.slice(0,-1))) {
                next()
                return
            }
        } else if (path == allowedPath) {
            next()
            return
        }
    }

    let query = request.query

    query.loggedin = 'true'

    const returnURL = url.format({
        pathname: '/WIP' + request.path,
        query: query
    })

    const passwordPageURL = url.format({
        pathname: '/WIP/sign-in',
        query: { returnURL }
    })

    response.redirect(passwordPageURL)
    
})
