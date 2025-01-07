const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter('/WIP')

const root = process.cwd()

const catalogue = require(`${root}/app/data/catalogue.json`)
const organisations = require(`${root}/app/data/organisations.json`)
const topics = require(`${root}/app/data/topics.json`)

const log = (input) => {
    console.log(JSON.stringify(input, null, 2))
}

const getOrganisation = (id) => {
    return organisations.find((item) => item.id == id)
}

const getTopics = (input) => {

    const oldTopics = input.split(',').filter((item) => item != "")
    const newTopics = oldTopics.map((oldTopic => {
        if (oldTopic == ""){
            return
        }
        const newTopic = topics.find((topic) => topic.id == oldTopic)
        return newTopic.name
    }))
    return newTopics
}

// to do - cache this
const searchData = catalogue.map(item => ({
    title: item.name,
    type: item.type,
    access: item.accessRights,
    topic: getTopics(item.topic),
    organisation: getOrganisation(item.provider).name,
    description: item.description,
    slug: item.name.toLowerCase().replaceAll(' ','-')
}))

const searchConfig = {
    sortings: {
        name_dsc: {
            field: 'dateUpdatedOrig',
            order: 'desc'
        }
    },
    aggregations: {
        topic: {
            title: 'Topic',
            size: 30,
            conjunction: false,
            hide_zero_doc_count: true
        },
        organisation: {
            title: 'Organisation',
            size: 30,
            conjunction: false,
            hide_zero_doc_count: true
        },
        type: {
            title: 'Type',
            size: 30,
            conjunction: false,
            hide_zero_doc_count: true
        },
        access: {
            title: 'Access',
            size: 30,
            conjunction: false,
            hide_zero_doc_count: true
        }
    },
    searchableFields: ['title', 'description', 'organisation'],
}

const itemsjs = require('itemsjs')(searchData, searchConfig)

const processFilters = (aggregations) => {

    const filters = Object.values(aggregations).map((aggregation) => ({
        title: aggregation.title,
        items: aggregation.buckets.map((item) => ({
            text: item.key,
            value: item.key,
            checked: item.selected,
            label: {
                classes: "govuk-!-font-size-16"
            }
        }))
    }))

    return filters
}

router.use((request, response, next) => {
    // remove _unchecked from query
    for (let i in request.query) {
        if (request.query[i] == "_unchecked") {
            delete request.query[i]
        } else if (Array.isArray(request.query[i])) {
            request.query[i] = request.query[i].filter((item) => item != "_unchecked")
        }
    }
    next()
})

router.get('/search', (request, response) => {

    const searchOptions = {
        filters: {}
    }

    const term = request.query.term

    if (term) {
        searchOptions.query = term
        response.locals.term = term
    }

    const topic = request.query.topic

    if (topic) {
        searchOptions.filters.topic = topic
    }

    const organisation = request.query.organisation

    if (organisation) {
        searchOptions.filters.organisation = organisation
    }

    const type = request.query.type

    if (type) {
        searchOptions.filters.type = type
    }

    const access = request.query.access

    if (access) {
        searchOptions.filters.access = access
    }

    const page = Number(request.query.page) || 1

    if (page) {
        searchOptions.page = page
    }

    const results = itemsjs.search(searchOptions)

    response.locals.listings = results.data.items
    response.locals.count = results.pagination.total
    response.locals.filters = processFilters(results.data.aggregations)

    // pagination

    let pagination = {}

    let url = new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`)

    // previous

    if (page != 1) {
        const prevPage = page - 1
        url.searchParams.set('page', prevPage)
        pagination.previous = {
            href: url.href
        }
    }

    // next

    if (page != results.pagination.numPages) {
        const nextPage = page + 1
        url.searchParams.set('page', nextPage)
        pagination.next = {
            href: url.href
        }
    }

    response.locals.pagination = pagination

    response.render('/WIP/listings/search')

})

router.get('/listings/:resourceID', function(request, response) {
    response.locals.listing = searchData.find(listing => listing.slug == request.params.resourceID)
    response.render("/WIP/listings/view")
})