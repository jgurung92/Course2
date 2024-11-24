
    function toggleSearch() {
        const searchForm = document.querySelector('.search-form');
        searchForm.classList.toggle('hidden'); // Toggle the 'hidden' class to show/hide the search form
    }

    // Attach event listener to the search toggle button
    const searchToggleButton = document.querySelector('#toggle-search-button');
    searchToggleButton.addEventListener('click', toggleSearch);

