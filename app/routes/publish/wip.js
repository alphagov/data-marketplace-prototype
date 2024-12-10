const govukPrototypeKit = require('govuk-prototype-kit')
const path = '/WIP/publish'
const router = govukPrototypeKit.requests.setupRouter(path)

// logging
// 
// router.use((req,res,next) => {
//     console.log(req.session.data)
//     next()
// })

// Access to publish
router.get('/bMVP_wip--dashboard-add-permission', (req, res) => {
  const permissions = req.session.data['WIP_settings_permissions'];
  if (permissions && permissions.includes("add")) {
    res.redirect('/WIP/publish/publish-dashboard.html');
  } else {
    res.redirect('/WIP/publish/no-add-permission.html');
  }
});

router.get('/bMVP_wip--method-add-permission', (req, res) => {
  const permissions = req.session.data['WIP_settings_permissions'];
  if (permissions && permissions.includes("add")) {
    res.redirect('/WIP/publish/method.html');
  } else {
    res.redirect('/WIP/publish/no-add-permission.html');
  }
});

// Publisher journey
router.post('/method', function(request, response) {

    var method = request.session.data['method']
    if (method == "web"){
        response.redirect(`${path}/manual/type`)
    } else if (method == "Upload a CSV file of metadata") {
        response.redirect(`${path}/csv/start`)
    } else {
        response.redirect(`${path}/api/start`)
    }
})

router.post('/manual/type', function(request, response) {

    var type = request.session.data['type']
    if (type == "Data set"){
        response.redirect(`${path}/manual/security-classification`)
    } else {
        response.redirect(`${path}/manual/type-error`)
    }
})

router.post('/manual/security-classification', function(request, response) {

    var official = request.session.data['security-classification']
    if (official == "Yes"){
        response.redirect(`${path}/manual/title`)
    } else {
        response.redirect(`${path}/manual/security-classification-error`)
    }
})

router.post('/manual/access-answer', function(request, response) {

    var access = request.session.data['access']
    if (access == 'Public'){
        response.redirect(`${path}/manual/links`)
    } else if (access == 'Restricted' ) {
        response.redirect(`${path}/manual/formats`)
    } else {
        response.redirect(`${path}/manual/access`)
    }
})

router.post('/manual/links-answer', function(request, response) {

    let data = request.session.data

    if (!data.links){
      data.links = {
        access: [],
        download: []
      }
    }

    let links

    if (data['link-type'] == 'File download') {
      links = data.links.download
    } else {
      links = data.links.access
    } 

    links.push({
        'type': data['link-type'],
        'title': data['link-title'],
        'url': data['link-url'],
        'download-format': data['link-download-format'],
        'download-size': data['link-download-size'],
        'download-units': data['link-download-units']
    })
  
    response.redirect(`${path}/manual/links-summary`)
})

router.post('/wip-licence-answer', function(request, response) {

    var licence = request.session.data['metadataLicence']
    if (licence == "Other"){
        response.redirect("/WIP/publish/manual/licence-other")
    } else {
        response.redirect("/WIP/publish/manual/security-classification")
    }
})

router.post('/wip-modified-answer', function(request, response) {

    var modified = request.session.data['MetadataModified']
    if (modified == "Yes"){
        response.redirect("/WIP/publish/manual/modified-date")
    } else {
        response.redirect("/WIP/publish/manual/related")
    }
})

router.post('/wip-type-answer', function(request, response) {

    var assetType = request.session.data['metadataType']
    if (assetType == "Dataset"){
        response.redirect("/WIP/publish/manual/frequency")
    } else {
        response.redirect("/WIP/publish/manual/endpoint-description")
    }
})

router.post('/wip-service-type-answer', function(request, response) {

    var serviceType = request.session.data['MetadataServiceType']
    if (serviceType == "Other"){
        response.redirect("/WIP/publish/manual/service-type-other")
    } else {
        response.redirect("/WIP/publish/manual/service-status")
    }
})

router.post('/wip-security-answer', function(request, response) {

    var securityType = request.session.data['MetadataSecurity']
    if (securityType == "Offical"){
        response.redirect("/WIP/publish/manual/related")
    } else {
        response.redirect("/WIP/publish/manual/security-error")
    }
})

router.post('/wip-distribution-answer', function(request, response) {

    var addAnother = request.session.data['addAnotherDistribution']
    if (addAnother == "Yes"){
        response.redirect("/WIP/publish/manual/distribution-2/distribution-title")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-related-answer', function(request, response) {

    var relatedMethod = request.session.data['method']
    if (relatedMethod == "dataset"){
            response.redirect("/WIP/publish/manual/frequency")
    } else {
        response.redirect("/WIP/publish/manual/endpoint-url")
    }
})

router.post('/wip-data-type-answer', function(request, response) {

    var dataCSV = request.session.data['data-CSV']
    var dataXML = request.session.data['data-XML']
    var dataXLXS = request.session.data['data-XLXS']
    var dataGeo = request.session.data['data-geo']
    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataCSV == "CSV"){
        response.redirect("/WIP/publish/manual/frequency")
    } else if (dataXML == "XML") {
        response.redirect("/WIP/publish/manual/frequency")
    } else if (dataXLXS == "XLXS") {
        response.redirect("/WIP/publish/manual/frequency")
    } else if (dataGeo == "GeoPackage") {
        response.redirect("/WIP/publish/manual/frequency")
    } else if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-frequency-answer', function(request, response) {

    var dataCSV = request.session.data['data-CSV']
    var dataXML = request.session.data['data-XML']
    var dataXLXS = request.session.data['data-XLXS']
    var dataGeo = request.session.data['data-geo']
    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataCSV == "CSV"){
        response.redirect("/WIP/publish/manual/add-data/csv")
    } else if (dataXML == "XML") {
        response.redirect("/WIP/publish/manual/add-data/xml")
    } else if (dataXLXS == "XLXS") {
        response.redirect("/WIP/publish/manual/add-data/xlxs")
    } else if (dataGeo == "GeoPackage") {
        response.redirect("/WIP/publish/manual/add-data/geopackage")
    } else if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-csv-answer', function(request, response) {

    var dataXML = request.session.data['data-XML']
    var dataXLXS = request.session.data['data-XLXS']
    var dataGeo = request.session.data['data-geo']
    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataXML == "XML") {
        response.redirect("/WIP/publish/manual/add-data/xml")
    } else if (dataXLXS == "XLXS") {
        response.redirect("/WIP/publish/manual/add-data/xlxs")
    } else if (dataGeo == "GeoPackage") {
        response.redirect("/WIP/publish/manual/add-data/geopackage")
    } else if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-xml-answer', function(request, response) {

    var dataXLXS = request.session.data['data-XLXS']
    var dataGeo = request.session.data['data-geo']
    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataXLXS == "XLXS") {
        response.redirect("/WIP/publish/manual/add-data/xlxs")
    } else if (dataGeo == "GeoPackage") {
        response.redirect("/WIP/publish/manual/add-data/geopackage")
    } else if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-xlxs-answer', function(request, response) {

    var dataGeo = request.session.data['data-geo']
    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataGeo == "GeoPackage") {
        response.redirect("/WIP/publish/manual/add-data/geopackage")
    } else if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-geo-answer', function(request, response) {

    var dataREST = request.session.data['data-REST']
    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataREST == "REST web service") {
        response.redirect("/WIP/publish/manual/add-data/rest")
    } else if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-rest-answer', function(request, response) {

    var dataSOAP = request.session.data['data-SOAP']
    var dataEvent = request.session.data['data-event']

    if (dataSOAP == "SOAP web service") {
        response.redirect("/WIP/publish/manual/add-data/soap")
    } else if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-soap-answer', function(request, response) {

    var dataEvent = request.session.data['data-event']

    if (dataEvent == "Event based service") {
        response.redirect("/WIP/publish/manual/add-data/event")
    } else {
        response.redirect("/WIP/publish/manual/check-answers")
    }
})

router.post('/wip-dist-url-question', function(request, response) {

    var classification = request.session.data['metadataAccessRights']
    if (classification == "Open"){
            response.redirect("/WIP/publish/manual/distribution-1/distribution-url")
    } else {
        response.redirect("/WIP/publish/manual/distribution-1/distribution-type")
    }
})

router.post('/wip-dist-url-question2', function(request, response) {

    var classification = request.session.data['metadataAccessRights']
    if (classification == "Open"){
            response.redirect("/WIP/publish/manual/distribution-2/distribution-url")
    } else {
        response.redirect("/WIP/publish/manual/distribution-2/distribution-type")
    }
})

router.post('/wip-upload-error', function(request, response) {

    var error = request.session.data['error']
    if (error == "yes"){
            response.redirect("/WIP/publish/csv/upload-summary-error")
    } else {
        response.redirect("/WIP/publish/csv/upload-summary")
    }
})
