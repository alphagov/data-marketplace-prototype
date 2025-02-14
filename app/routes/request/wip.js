const govukPrototypeKit = require('govuk-prototype-kit')
const path = '/WIP/request'
const router = govukPrototypeKit.requests.setupRouter(path)

router.post('/personal-data-answer', (request, response) => {

  const personalData = request.session.data['personal-data']

  if (personalData == 'Yes') {
    response.redirect(`${path}/special-category`)
  } else {
    response.redirect(`${path}/outside-uk`)
  }

})


router.post('/bMVP_wip--280', (req, res) => {
  
  const otherOrgs = req.body['otherOrgs'];

  if (otherOrgs === 'no') {
    res.redirect('WIP/request/030-how-impact-cat.html');
  } 
  else if (otherOrgs === 'yes') {
    res.redirect('WIP/request/030-what-other-orgs.html');
  }
});

router.post('/bMVP_wip--270', (req, res) => {

  const dataType = req.session.data['typeOfData'];

  console.log(dataType);

  // other orgs deed data
  if(Array.isArray(dataType) === true) {
    if (dataType.length > 1 && dataType.includes("personal") === true || dataType.length === 1 && dataType.includes("personal") === true) {
      res.redirect('WIP/request/030-legal-basis-personal-cat.html');
    } else if (dataType.includes("special") === true) {
      res.redirect('WIP/request/030-legal-basis-special-cat.html');
    } else if (dataType.includes("non-personal") === true) {
      res.redirect('WIP/request/030-geography-cat.html');
    } else{
      res.redirect('WIP/request/030-geography-cat.html');
    }
  // } else if (dataType === "personal") {
  //   res.redirect('WIP/request/030-legal-basis-personal-cat.html');
  // } else if (dataType === "special") {
  //   res.redirect('WIP/request/030-legal-basis-special-cat.html');
  // } else if (dataType === 'non-personal') {
  //   res.redirect('WIP/request/030-geography-cat.html');
  } else{
    res.redirect('WIP/request/030-geography-cat.html');
  }
});

router.post('/bMVP_wip--260', (req, res) => {

  const willLeave = req.body["reviewed"];

  // other orgs deed data
  if (willLeave === 'yes') {res.redirect('WIP/request/030-confirmation-request-sent-cat.html');} 
  else {res.redirect('WIP/request/030-last-warning-cat.html');} 

});

// Handles form submissions from 'What type of data do you need which is part of the acquirer wizard
router.post('/bMVP_wip--check-for-no-need', (req, res) => {

  const dataTypes = req.body["countries"];

  // If none is selected exit to no agreement required
  if (dataTypes === 'none') {
    res.redirect('WIP/request/020-may-not-need.html');
  } else {
    res.redirect('WIP/request/020-lawful-basis.html');
  }
});
router.post('/bMVP_wip--240', (req, res) => {

  const willLeave = req.body["leaveUK"];
  const dataType = req.session.data['typeOfData'];

  // data will be exported
  if (willLeave == 'yes') {
    res.redirect('WIP/request/030-what-countries-cat.html');
  } else {
    // data stays in uk
    if (Array.isArray(dataType) === true) {
      if (dataType.includes('non-personal') === true) {
        res.redirect('WIP/request/030-confirm-data-protection-answers.html');
      } else {
        res.redirect('WIP/request/030-role-cat.html');
      }
    } else {
      //undefined
      res.redirect('WIP/request/030-confirm-data-protection-answers.html');
    }
  }
});

router.post('/bMVP_wip--230', (req, res) => {

  const legalPower = req.body["specialCatBasis"];

  // clicked don't know or do not have power
  if (legalPower.includes('Reasons of substantial public interest (with a basis in law)')) {
    res.redirect('WIP/request/030-what-substantial-cat.html');
  } else {
    // They have the power
    res.redirect('WIP/request/030-geography-cat.html');
  }
});

router.post('/bMVP_wip--210', (req, res) => {

  const legalPower = req.body["haveLegalPower"];

  // clicked don't know or do not have power
  if (legalPower === undefined || legalPower === 'donthavepower' || legalPower === 'dontknow') {
    res.redirect('WIP/request/020-talk-to-lawyer-cat.html');
  } else {
    // They have the power
    res.redirect('WIP/request/030-legal-gateway-belief.html');
  }
});

router.post('/bMVP_wip--updateCountryList', (req, res) => {
  var newData = req.body['newList'];
  req.session.data['data-travel-countrieslist'] = newData;
  req.session.save(function(err) {
    console.log('Data travel countries list update');
  })
});

router.post('/bMVP_wip--addCountryToArray', (req, res) => {
  const dataType = req.session.data['typeOfData'];
  // if (req.body['data-travel-country'].length > 0) { 
  //   req.session.data['data-travel-countrieslist'].push(req.body['data-travel-country']);
  // }
  if (Array.isArray(dataType) === true) {
    if (dataType.includes('non-personal') === true) {
      res.redirect('WIP/request/030-confirm-data-protection-answers.html');
    } else {
      res.redirect('WIP/request/030-role-cat.html');
    }
  } else {
    //undefined
    res.redirect('WIP/request/030-confirm-data-protection-answers.html');
  }
});

router.post('/bMVP_wip--legalGateway', (req, res) => {
  const legalGateway = req.body["legal-gateway-belief"];
  if (legalGateway === undefined || legalGateway === 'Yes' || legalGateway === 'Other') {
    res.redirect('WIP/request/030-confirm-legal-answers.html');
  } else {
    res.redirect('WIP/request/020-talk-to-lawyer-cat_legal-gateway.html');
  }
});

router.post('/bMVP_wip--checkSpecialCatGDPR', (req, res) => {
  const dataType = req.session.data['typeOfData'];
  if (dataType.includes("special") === true) {
    res.redirect('WIP/request/030-legal-basis-special-cat.html');
  } else {
    res.redirect('WIP/request/030-geography-cat.html');
  }
});

router.post('/bMVP_wip--DataSubjectSkip', (req, res) => {
  const dataType = req.session.data['typeOfData'];
  if (dataType.includes('non-personal') === true) {
    res.redirect('WIP/request/030-aims-cat.html');
  } else {
    res.redirect('WIP/request/030-data-subjects-cat.html');
  }
});

router.post('/bMVP_wip--ReadyForCYA', (req, res) => {
  const dataType = req.session.data['typeOfData'];

  console.log(dataType);

  if (Array.isArray(dataType) === true) {
    res.redirect('WIP/request/030-check-answers.html');
  } else {
    res.redirect('WIP/request/020-tasks-cat_all-but-one.html');
  }
});

module.exports = router;

