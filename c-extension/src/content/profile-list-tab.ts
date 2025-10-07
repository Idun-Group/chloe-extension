export function displayListPage(id?: string) {
    const content = document.getElementById('chloe-extension-body');

    if (content) {
        chrome.runtime.sendMessage(
            { action: 'GET_LAZY_ALL_PROFILE_LISTS' },
            (response) => {
                if (response && response.profileLists) {
                    let currentIndex = 1;
                    if (id) {
                        currentIndex = response.profileLists.findIndex(
                            (list: { id: string }) => list.id === id,
                        );
                    }
                    content.innerHTML = `
                        <div class="chloe-extension__list">
                            <div class="chloe-extension__list__header">
                                <h2  class="chloe-extension__list__header__title"> <span id="list-name"> name </span> <span id="list-type" class="chloe-extension__list__header__type"> type </span> </h2>

                                <button id="export-csv-btn" class="chloe-extension__list__header__button"> Export as CSV </button>
                            </div>

                            <div class="chloe-extension__list__table-container">
                                <table id="profile-list-table" class="chloe-extension__list__table">

                                </table>
                            </div>

                            <div class="chloe-extension__list__pagination">
                                <button id="previous-btn" class="chloe-extension__list__pagination__button"> < </button>

                                <p> Page <span id="current-page">${
                                    currentIndex + 1
                                }</span> of <span id="total-pages">${
                        response.profileLists.length
                    }</span> </p>

                                <button id="next-btn" class="chloe-extension__list__pagination__button"> > </button>
                            </div>
                        </div>
                    `;

                    const table = document.getElementById('profile-list-table');

                    const nextBtn = document.getElementById('next-btn');
                    const prevBtn = document.getElementById('previous-btn');

                    const exportBtn = document.getElementById('export-csv-btn');

                    exportBtn?.addEventListener('click', () => {
                        const currentListId =
                            response.profileLists[currentIndex].id;
                        chrome.runtime.sendMessage(
                            {
                                action: 'DOWNLOAD_PROFILE_LIST',
                                data: { id: currentListId },
                            },
                            (response) => {
                                if (response && response.success) {
                                    console.log(
                                        'Download started for list:',
                                        currentListId,
                                    );
                                }
                            },
                        );
                    });

                    const updatePagination = () => {
                        const currentPageEl = document.getElementById(
                            'current-page',
                        ) as HTMLElement;
                        const totalPagesEl = document.getElementById(
                            'total-pages',
                        ) as HTMLElement;

                        if (currentPageEl && totalPagesEl) {
                            currentPageEl.innerText = `${currentIndex + 1}`;
                            totalPagesEl.innerText = `${response.profileLists.length}`;

                            // Gérer la visibilité/état des boutons de navigation
                            const isFirstPage = currentIndex === 0;
                            const isLastPage =
                                currentIndex ===
                                response.profileLists.length - 1;
                            const isOnlyOnePage =
                                response.profileLists.length <= 1;

                            if (prevBtn) {
                                if (isFirstPage || isOnlyOnePage) {
                                    prevBtn.style.display = 'none';
                                } else {
                                    prevBtn.style.display = 'block';
                                }
                            }

                            if (nextBtn) {
                                if (isLastPage || isOnlyOnePage) {
                                    nextBtn.style.display = 'none';
                                } else {
                                    nextBtn.style.display = 'block';
                                }
                            }

                            if (table && response.profileLists[currentIndex]) {
                                displayProfileListData(
                                    response.profileLists[currentIndex].id,
                                );
                            }
                        }
                    };

                    prevBtn?.addEventListener('click', () => {
                        if (currentIndex > 0) {
                            currentIndex -= 1;
                            updatePagination();
                        }
                    });

                    nextBtn?.addEventListener('click', () => {
                        if (currentIndex < response.profileLists.length - 1) {
                            currentIndex += 1;
                            updatePagination();
                        }
                    });

                    // Initialiser la pagination et afficher les données
                    updatePagination();
                } else {
                    content.innerHTML = `
                        <p>No lists found.</p>
                    `;
                }
            },
        );
    }
}

function displayProfileListData(listId: string) {
    console.log('Displaying profile list with id:', listId);

    const tableContainer = document.getElementById('profile-list-table');
    if (tableContainer) {
        chrome.runtime.sendMessage(
            { action: 'GET_PROFILELIST_BY_ID', data: { id: listId } },
            (response) => {
                console.log('Received response for profile list:', response);
                if (response) {
                    const { name, type, description, peopleProfiles } =
                        response;

                    const listNameEl = document.getElementById('list-name');
                    if (listNameEl) {
                        listNameEl.innerText = name;
                    }

                    const listTypeEl = document.getElementById('list-type');
                    if (listTypeEl) {
                        listTypeEl.innerText =
                            type == 'PEOPLE' ? 'Personne' : 'Organisation';
                    }

                    if (type === 'PEOPLE') {
                        tableContainer.innerHTML = `
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Company</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${response.peopleProfiles
                                .map(
                                    (item: {
                                        fullName: string;
                                        email: string;
                                        phone: string;
                                        company: string;
                                    }) => `
                                        <tr>
                                            <td>${item.fullName}</td>
                                            <td>${item.email}</td>
                                            <td>${item.phone}</td>
                                            <td>${item.company}</td>
                                        </tr>
                                    `,
                                )
                                .join('')}
                            </tbody>
                        `;
                    } else {
                        tableContainer.innerHTML = `
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                            ${response.organizationProfiles
                                .map(
                                    (item: {
                                        name: string;
                                        description: string;
                                        type: string;
                                    }) => `
                                    <tr>
                                        <td>${item.name}</td>
                                        <td>${item.description}</td>
                                        <td>${item.type}</td>
                                    </tr>
                                    `,
                                )
                                .join('')}
                            </tbody>
                        `;
                    }
                }
            },
        );
    }
}
