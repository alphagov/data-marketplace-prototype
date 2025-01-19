//
// For guidance on how to add JavaScript see:
// https://prototype-kit.service.gov.uk/docs/adding-css-javascript-and-images
//

//TO DO - Create seperate JS files (with prefixes) for each sub-service and import them into this file

window.GOVUKPrototypeKit.documentReady(() => {
  // Add JavaScript here
  if ( document.getElementById('appUpload') ) {
    document.getElementById('appUpload').addEventListener('click', function() {
      document.getElementById('appBrowse').classList.add('active');
    });

    document.getElementById('errorButton').addEventListener('click', function() {
      document.getElementById('noNavigate').style.display = 'none';
      document.getElementById('noErrorNavigate').style.display = 'none';
      document.getElementById('errorNavigate').style.display = 'inline-block';
      document.getElementById('appBrowse').classList.remove('active');
      document.getElementById('appUploadText').textContent = 'my_data_file_with_error.csv';
    });

    document.getElementById('noErrorButton').addEventListener('click', function() {
      document.getElementById('noNavigate').style.display = 'none';
      document.getElementById('errorNavigate').style.display = 'none';
      document.getElementById('noErrorNavigate').style.display = 'inline-block';
      document.getElementById('appBrowse').classList.remove('active');
      document.getElementById('appUploadText').textContent = 'my_data_file_without_errors.csv';
    });
  }

  const dropdowns = document.querySelectorAll('.app-header-dropdown')

  dropdowns.forEach(($dropdown) => {

    $dropdown.addEventListener('click', function(event) {
        
      console.log('dropdown click')

      const forId = $dropdown.dataset.for

      console.log(forId)

      const submenus = document.querySelectorAll('.header-submenu')

      submenus.forEach(($submenu) => {

        if ($submenu.id == forId) {

          if ($submenu.hasAttribute('hidden')) {
            $submenu.removeAttribute('hidden')
          } else {
            $submenu.setAttribute('hidden', '')
          }

        } else {
          $submenu.setAttribute('hidden', '')
        }
          
      })
  
    })

  })


  const toggleLinksButtons = document.querySelectorAll('.toggle-links-button')

  toggleLinksButtons.forEach(($button) => {

    $button.addEventListener('click', function(event) {

      if ($button.innerText == 'Show more') {
        $button.innerText = 'Show less'
      } else {
        $button.innerText = 'Show more'
      }
        
      console.log('toggleLinks click')

      const forId = $button.dataset.for

      console.log(forId)

      const $forElement = document.querySelector('#' + forId)

      const links = $forElement.querySelectorAll('.additional-link')

      links.forEach(($link) => {
        $link.classList.toggle('hidden')
      })
  
    })

  })

})
