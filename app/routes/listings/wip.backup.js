const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const { promises: fs } = require("fs")

const root = process.cwd()

let itemsjs

let global = {}

const init = async function() {
    
    global.organisations = require(root + '/app/data/organisations.json')
    global.topics = require(root + '/app/data/topics.json')
    global.types = require(root + '/app/data/asset-types.json')
    global.access = require(root + '/app/data/access.json')
    global.resources = []
    const catalogue = require(root + '/app/data/catalogue.json')
    const mappedCatalogue = helpers.mapLiveSchemaToSpec(catalogue)
    global.resources =  global.resources.concat(mappedCatalogue)

    global.index = searchSetup(global.resources)
}

// Search and result workings

sprint = 'WIP/find' // For UR Ready sprint="find", For WIP sprint ="WIP/find"

router.get('/' + sprint + '/find', function(req, res) {  
    sprint = 'WIP/find'
    const paginationPerPage = 20
    let items = global.resources  
    let searchTerm
    let appliedFilters = {}
    let aggregations = global.index.data.aggregations
    let anyFiltersActive = false
    let page = '1'
    if (Object.keys(req.query).length !== 0) {
        if(req.query.q) {
            searchTerm = req.query.q
        }
        page = (typeof req.query.page === 'undefined') ? '1' : req.query.page
        if(Array.isArray(req.query.organisationFilters)) {
            anyFiltersActive = true
            appliedFilters.issuing_body = req.query.organisationFilters.filter(function(e) {
                if(e == '_unchecked' || e == req.query.removeFilter) {
                    return false
                }
                return true
            })
        }
        if (Array.isArray(req.query.topicFilters)) {
            appliedFilters.topic = req.query.topicFilters.filter(function(e) {
                anyFiltersActive = true
                if(e == '_unchecked' || e == req.query.removeFilter) {
                    return false
                }
                return true
            })
        }
        if (Array.isArray(req.query.typesFilters)) {
            appliedFilters.type = req.query.typesFilters.filter(function(e) {
                anyFiltersActive = true
                if(e == '_unchecked' || e == req.query.removeFilter) {
                    return false
                }
                return true
            })
        }
    }

    const results = search(searchTerm, appliedFilters, paginationPerPage, page)
    items = results.data.items
    aggregations = results.data.aggregations
    
    const filters = [
        {
            title: 'Topic',
            id: 'topicFilters',
            items: helpers.generateFilterItems(global.topics, 'topicFilters', aggregations.topic),
            selectedCount: helpers.getSelectedFiltersCount(aggregations.topic.buckets)
        },
        {
            title: 'Organisation',
            id: 'organisationFilters',
            items: helpers.generateFilterItems(global.organisations, 'organisationFilters', aggregations.issuing_body),
            selectedCount: helpers.getSelectedFiltersCount(aggregations.issuing_body.buckets)
        },
        {
            title: 'Type',
            id: 'typesFilters',
            items: helpers.generateFilterItems(global.types, 'typesFilters', aggregations.type),
            selectedCount: helpers.getSelectedFiltersCount(aggregations.type.buckets)
        },
        {
            title: 'Access',
            id: 'accessFilters',
            items: helpers.generateFilterItems(global.access, 'accessFilters', aggregations.access),
            selectedCount: helpers.getSelectedFiltersCount(aggregations.access.buckets)
        }
    ]

    const pagination = results.pagination
    pagination.from = ((pagination.page -1) * pagination.per_page) +1
    pagination.to = pagination.page * pagination.per_page
    pagination.to = (pagination.total <= pagination.to) ? pagination.total : pagination.to
    pagination.numPages = Math.ceil(pagination.total / pagination.per_page)
    pagination.items = helpers.getPaginationItems(pagination, req)
    pagination.next = helpers.getPaginationNext(pagination, req)
    pagination.previous = helpers.getPaginationPrev(pagination, req)

    items = helpers.enrichTopics(items)
    const clearlinkUrl = helpers.getClearFiltersUrl(req)
    const selectedFilters = helpers.getSelectedFilters(filters, req.url, clearlinkUrl)
    req.session.current_url = req.originalUrl

    res.render(sprint + "/find", {
        sprint: sprint,
        pagination: results.pagination,
        resources: items,
        selectedFilters: selectedFilters,
        count: pagination.total,
        query: searchTerm,
        filters: filters,
        anyFiltersActive: anyFiltersActive,
        clearlinkUrl: clearlinkUrl,
        thisUrl: req.baseUrl + req.path
    })
})

router.get('/' + sprint + '/resources/:resourceID', function(req, res) {
    sprint = 'WIP/find'
    let resource = global.resources.find(r => r.slug ==  req.params.resourceID)
    resource.topic = helpers.enrichTopic(resource.topic)
    let backLink = (req.session.current_url === undefined || req.session.current_url.startsWith('WIP/find/resource')) ? 'WIP/find/find' : req.session.current_url
    req.session.current_url = req.originalUrl
    res.render(sprint +  "/resource", { sprint: sprint, resource: resource, backLink: backLink })
})

const searchSetup = function(data) {
    const configuration = {
        sortings: {
            name_dsc: {
                field: 'dateUpdatedOrig',
                order: 'desc'
            }
        },
        aggregations: {
            topic: {
                title: 'Topics',
                size: 30,
                conjunction: false
            },
            issuing_body: {
                title: 'Organisations',
                size: 30,
                conjunction: false
            },
            type: {
                title: 'Asset Type',
                size: 30,
                conjunction: false
            },
            access: {
                title: 'AccessRights',
                size: 30,
                conjunction: false
            }
        },
        searchableFields: ['title', 'description', 'better description', 'issuing_body_readable'],
    }
    itemsjs = require('itemsjs')(data, configuration)
    return itemsjs.search()
}


const search = function(query, filters, perPage, page) {
    const results = itemsjs.search({
        per_page: perPage,
        page: page,
        sort: 'name_dsc',
        query: query,
        filters: filters
    })

    return results
}

const helpers = {
    getPaginationItems(pagination, req) {
        let manyPages = false
        if (pagination.numPages > 6 ) {
            manyPages = true
        }
        let url = new URL(helpers.getFullUrl(req))
        let items = []
        for (let index = 1; index <= pagination.numPages; index++) {
            if (manyPages) {
                switch (index) {
                    case 1:
                        break
                    case pagination.page:
                        break
                    case pagination.page -1:
                        break
                    case pagination.page +1:
                        break
                    case pagination.numPages:
                        break
                    default:
                        items.push({
                            ellipsis: true
                        })
                        continue
                }
            }
            url.searchParams.set('page', index)
            const item = {
                "number": index,
                "href": url.href
            }
            if (index == pagination.page) {
                item.current = true
            }
            items.push(item)
        }
        // Remove duplicate adjacent ellipsis
        items = items.filter((i,index) => {
            if (index == 0) {
                return true
            }
            if (!i.ellipsis) {
                return true
            }
            return items[index-1].ellipsis !== i.ellipsis
        })
        return items
    },
    getPaginationNext(pagination, req) {
        // If we're not on the last page, return a next link
        if(pagination.page != pagination.numPages) {
            const nextPage = pagination.page + 1
            let url = new URL(helpers.getFullUrl(req))
            url.searchParams.set('page', nextPage)
            return {
                text: 'Next',
                href: url.href
            }
        }
    },
    getPaginationPrev(pagination, req) {
        // If we're not on the first page, return a previous link
        if(pagination.page != 1) {
            const prevPage = pagination.page - 1
            let url = new URL(helpers.getFullUrl(req))
            url.searchParams.set('page', prevPage)
            return {
                text: 'Previous',
                href: url.href
            }
        }
    },
    getClearFiltersUrl(req) {
        let url = new URL(helpers.getFullUrl(req))
        url.searchParams.set('topicFilters', "_unchecked")
        url.searchParams.set('organisationFilters', "_unchecked")
        url.searchParams.set('typesFilters', "_unchecked")
        return url
    },
    getFullUrl(req) {
        const url = req.protocol + '://' + req.get('host') + req.originalUrl
        return url
    },
    mapLiveSchemaToSpec(data) {
        return data.map(function(e) {
            let n = {}

            n.title = e.name
            n.description = e.description
            n.issuing_body = e.provider
            n.issuing_body_readable = helpers.getOrgTitle(e.provider)
            n.contact = e.maintainer
            n.documentation = e.documentation
            n.distributions = e.distributions
            n.dateUpdated = e.dateUpdated
            n.dateUpdatedOrig = helpers.trueDate(n.dateUpdated)
            n.dateUpdated = helpers.formatDate(n.dateUpdated)
            if(e.topic) {
                n.topic = helpers.splitTopics(e.topic)
            }
            n.type = e.type
            n.accessRights = e.accessRights
            
            n.url = e.url
            n.slug = n.title.toLowerCase().replaceAll(' ','-')
            n['better description'] = e['better description']
            return n
        })
    },
    splitTopics(string) {
        const topics = [].concat(string.split(','))
        return topics.map(function(e) {
            const newTopic = global.topics.find(element => element.id == e)
            try {
                newTopic.id
            } catch (e) {
                console.error('Topic does not match one of the pre-defined topics:' + e)
            }
            if(newTopic) {
                return newTopic.id
            }
            return ""
        })
    },
    formatDate(inputDate) {
        // Validate the input date format ("yyyy-mm-dd")
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(inputDate)) {
            console.log(inputDate)
            throw new Error("Invalid date format. Expected format: yyyy-mm-dd")
        }

        // Parse the input date into a JavaScript Date object
        const dateObject = new Date(inputDate)

        // Format the date using Intl.DateTimeFormat
        const formattedDate = new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(dateObject)

        return formattedDate
    },
    trueDate(inputDate) {
        function convertToDateObject(dateString) {
            const [year, month, day] = dateString.split('-').map(Number)
            return new Date(year, month - 1, day)
            }
        const dateStr = inputDate
        const dateObj = convertToDateObject(dateStr)

        return dateObj
    },
    enrichTopics(resources) {
        resources.forEach(function(resource, index) {
            resources[index].topic = helpers.enrichTopic(resource.topic)
        })
        return resources
    },
    enrichTopic(topic) {
        if(typeof topic == 'undefined') {
            return
        }
        const topics = topic.map(function(e) {
            if(typeof e == 'object') {
                return e
            }
            const newTopic = global.topics.find(topic => topic.id == e)
            return newTopic
        })
        return topics
    },
    generateFilterItems(items, groupId, aggregation) {
        return aggregation.buckets.map(function(e) {
            const ogFilterItem = items.find(item => item.id == e.key)
            let n = {
                value: ogFilterItem.id,
                text: ogFilterItem.name,
                name: groupId,
                label: {
                    classes: "govuk-!-font-size-16"
                }
            }
            if (e.selected) {
                n.checked = 'checked'
            }
            return n
        })
    },
    getOrgTitle(id) {
        let name
        for (let i = 0; i < global.organisations.length; i++) {
            if (global.organisations[i]['id'] == id) {
                name = global.organisations[i]['name']
                break
            }
        }
        return name
    },
    getSelectedFilters(filters, currentUrl, clearlinkUrl) {
        let selectedFilters =  {
            heading: {
            text: 'Selected filters'
            },
            clearLink: {
            text: 'Clear filters',
            href: clearlinkUrl
            }
        }
        selectedFilters.categories =  filters.map(function(c) {
            let category = {}
            category.items = c.items.filter(function(item) {
                if(item.checked !== 'checked') {
                    return false
                }
                else {
                    return true
                }
            }).map(function(b) {
                const item = {
                    href: currentUrl + '&removeFilter=' + b.value,
                    text: b.text
                }
                return item
            })
            category.heading = {
                text: c.title
            }

            return category
        })
        selectedFilters.categories = selectedFilters.categories.filter(function(category) {
            if(category.items.length == 0) {
                return false
            }
            return true
        })
        if(selectedFilters.categories.length == 0){
            return false
        }
        return selectedFilters
    },
    getSelectedFiltersCount(items) {
        // console.log(items)
        const selectedItems = items.filter(function(item) {
            return item.selected  
        })
        return selectedItems.length
    }
}

init()

module.exports = router