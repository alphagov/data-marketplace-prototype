const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter('/WIP')

const root = process.cwd()

const dgu = require(`${root}/app/data/dgu.json`)
const apis = require(`${root}/app/data/apis.json`)

const searchData = dgu.concat(apis)

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
        "updated-newest": {
            field: 'listingUpdated',
            order: 'desc'
        },
        "updated-oldest": {
            field: 'listingUpdated',
            order: 'asc'
        }
    },
    aggregations: {
        topic: {
            title: 'Topic',
            size: 100,
            sort: "key",
            conjunction: false,
            hide_zero_doc_count: true
        },
        organisation: {
            title: 'Organisation',
            size: 1000,
            sort: "key",
            conjunction: false,
            hide_zero_doc_count: true
        },
        type: {
            title: 'Type',
            size: 10,
            conjunction: false,
            hide_zero_doc_count: true
        },
        access: {
            title: 'Access',
            size: 10,
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

function removeQuery(url, name, value) {
    
    console.log(url)

    const urlObj = new URL(url)

    urlObj.searchParams.delete(name, value)
    urlObj.searchParams.delete('page')

    return urlObj.toString()

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
        searchOptions.filters.topic = [].concat(topic)
    }

    const organisation = request.query.organisation

    if (organisation) {
        searchOptions.filters.organisation = [].concat(organisation)
    }

    const type = request.query.type

    if (type) {
        searchOptions.filters.type = [].concat(type)
    }

    const access = request.query.access

    if (access) {
        searchOptions.filters.access = [].concat(access)
    }

    const page = Number(request.query.page) || 1

    if (page) {
        searchOptions.page = page
    }

    let sort = request.query.sort

    if (!sort) {
        sort = (term) ? "relevance" : "updated-newest"
    }

    response.locals.sort = sort

    if (sort !== "relevance") {
        // default sort is relevance so only set it for other sorts
        searchOptions.sort = sort
    }

    const results = itemsjs.search(searchOptions)

    response.locals.listings = results.data.items
    response.locals.count = results.pagination.total
    response.locals.filters = processFilters(results.data.aggregations)

    // remove filter links

    let removeFilterLinks = []

    let filters = searchOptions.filters

    const currentURL = `${request.protocol}://${request.get('host')}${request.originalUrl}`

    for (let name in filters) {
        for (let value of filters[name]) {
            let text = value
            if (value == 'Open') {
                text = 'Open access'
            }
            if (value == 'On request') {
                text = 'Access on request'
            }
            removeFilterLinks.push({
                text: text,
                href: removeQuery(currentURL, name, value)
            })
        }
    }

    response.locals.removeFilterLinks = removeFilterLinks

    // pagination

    let pagination = {
        page: page
    }

    let paginationURL = new URL(currentURL)

    // results text

    pagination.resultsFrom = 1 + (page -1) * results.pagination.per_page
    pagination.resultsTo = pagination.resultsFrom + results.data.items.length -1

    // previous

    if (page != 1) {
        const prevPage = page - 1
        paginationURL.searchParams.set('page', prevPage)
        pagination.previous = {
            href: paginationURL.href
        }
    }

    // next

    const totalPages = Math.ceil(results.pagination.total/results.pagination.per_page)

    if (page != totalPages) {
        const nextPage = page + 1
        paginationURL.searchParams.set('page', nextPage)
        pagination.next = {
            href: paginationURL.href
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
    response.render("WIP/listings/view")
})

router.get('/home', function(request, response) {

    response.locals.totalListings = searchData.length

    const uniqueOrganisations = new Set()

    searchData.forEach(item => {
        uniqueOrganisations.add(item.organisation);
    })

    response.locals.totalOrganisations = uniqueOrganisations.size

    response.render("WIP/home")

})
