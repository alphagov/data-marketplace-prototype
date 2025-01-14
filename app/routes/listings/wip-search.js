const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter('/WIP')

const root = process.cwd()

const searchData = require(`${root}/app/data/dgu.json`)

const log = (input) => {
    if (typeof input == "string") {
        console.log(input)
    } else {
        console.log(JSON.stringify(input, null, 2))
    }
}

log(searchData.length + " listings")

const searchConfig = {
    sortings: {
        "listing-updated-desc": {
            field: 'listingUpdated',
            order: 'desc'
        }
    },
    aggregations: {
        topic: {
            title: 'Topic',
            size: 50,
            sort: "key",
            conjunction: false,
            hide_zero_doc_count: true
        },
        organisation: {
            title: 'Organisation',
            size: 50,
            sort: "key",
            conjunction: false,
            hide_zero_doc_count: true
        },
        type: {
            title: 'Type',
            size: 2,
            conjunction: false,
            hide_zero_doc_count: true
        },
        access: {
            title: 'Access',
            size: 2,
            conjunction: false,
            hide_zero_doc_count: true
        }
    },
    searchableFields: ['title', 'summary', 'organisation'],
}

const itemsjs = require('itemsjs')(searchData, searchConfig)

const processFilters = (aggregations) => {

    const filters = Object.values(aggregations)
        .map((aggregation) => ({
            title: aggregation.title,
            items: aggregation.buckets
                .filter((item) => item.key != "")
                .map((item) => ({
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

// remove _unchecked from query

router.use((request, response, next) => {
    
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

    searchOptions.sort = "listing-updated-desc"

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


const stringSimilarity = require("string-similarity")

const findSimilar = (items, targetItem) => {
  return items.map(item => ({
    ...item,
    similarity: stringSimilarity.compareTwoStrings(
      `${item.title} ${item.title} ${item.title} ${item.organisation} ${item.topic}`,
      `${targetItem.title} ${targetItem.title} ${targetItem.title} ${targetItem.organisation} ${item.topic}`
    )
  }))
  .sort((a, b) => b.similarity - a.similarity)
  .slice(1,6)
//   .filter( (item) => item.similarity > 0.5)
}

router.get('/listings/:resourceID', function(request, response) {
    const listing = searchData.find(listing => listing.slug == request.params.resourceID)
    response.locals.listing = listing
    response.locals.similar = findSimilar(searchData, listing)
    log(response.locals.similar)
    response.render("/WIP/listings/view")
})
