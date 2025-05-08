export class UIManager {
    constructor(deckManager, studyManager) {
        this.deckManager = deckManager;
        this.studyManager = studyManager;
        this.currentDeckId = null;
        this.setupEventListeners();
    }

    initialize() {
        this.renderDecks();
        this.setupTabNavigation();
    }

    setupEventListeners() {
        // Deck creation
        document.getElementById('create-deck').addEventListener('click', () => this.showDeckModal());
        document.getElementById('deck-form').addEventListener('submit', (e) => this.handleDeckSubmit(e));
        document.getElementById('cancel-deck').addEventListener('click', () => this.hideDeckModal());
        document.getElementById('close-deck-modal').addEventListener('click', () => this.hideDeckModal());

        // Card creation
        document.getElementById('card-form').addEventListener('submit', (e) => this.handleCardSubmit(e));
        document.getElementById('cancel-card').addEventListener('click', () => this.hideCardModal());
        document.getElementById('template-button').addEventListener('click', () => this.showTemplate());

        // Study controls
        document.getElementById('flip-card').addEventListener('click', () => this.handleCardFlip());
        document.getElementById('next-card').addEventListener('click', () => this.handleNextCard());
        document.getElementById('prev-card').addEventListener('click', () => this.handlePreviousCard());

        // Rating buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.rating-btn')) {
                this.handleCardRating(parseInt(e.target.dataset.rating));
            }
        });

        // Enable/disable Create button based on deck name input
        const deckNameInput = document.getElementById('deck-name');
        const createDeckSubmit = document.getElementById('create-deck-submit');
        const deckNameError = document.getElementById('deck-name-error');
        deckNameInput.addEventListener('input', () => {
            createDeckSubmit.disabled = deckNameInput.value.trim() === '';
            if (deckNameInput.value.trim() !== '') {
                deckNameError.style.display = 'none';
            }
        });

        // Close deck modal by clicking outside modal-content
        document.getElementById('deck-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideDeckModal();
            }
        });

        // Card modal: toggle between single and bulk add
        const singleAddToggle = document.getElementById('single-add-toggle');
        const bulkAddToggle = document.getElementById('bulk-add-toggle');
        const singleAddSection = document.getElementById('single-add-section');
        const bulkAddSection = document.getElementById('bulk-add-section');
        let isBulkMode = false;
        singleAddToggle.addEventListener('click', () => {
            isBulkMode = false;
            singleAddToggle.setAttribute('aria-pressed', 'true');
            bulkAddToggle.setAttribute('aria-pressed', 'false');
            singleAddSection.style.display = '';
            bulkAddSection.style.display = 'none';
        });
        bulkAddToggle.addEventListener('click', () => {
            isBulkMode = true;
            singleAddToggle.setAttribute('aria-pressed', 'false');
            bulkAddToggle.setAttribute('aria-pressed', 'true');
            singleAddSection.style.display = 'none';
            bulkAddSection.style.display = '';
        });

        const cardForm = document.getElementById('card-form');
        this._originalCardFormSubmitHandler = (e) => this.handleCardSubmit(e); // Store bound reference
        cardForm.addEventListener('submit', this._originalCardFormSubmitHandler);
        cardForm.setAttribute('data-submit-handler-is-add', 'true');

        // Event listener for "Study All Due" button
        const studyAllDueBtn = document.getElementById('study-all-due-btn');
        if (studyAllDueBtn) {
            studyAllDueBtn.addEventListener('click', () => this.handleStudyAllDue());
        }
    }

    setupTabNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabId}-tab`);
        });

        // If switching to study tab and a deck is selected, start study session
        if (tabId === 'study' && this.currentDeckId) {
            this.startStudySession(this.currentDeckId);
        }
    }

    renderDecks() {
        const decksList = document.getElementById('decks-list');
        const decks = this.deckManager.getAllDecks();
        
        this.renderQuickAccessStats(decks); // Call to render stats
        
        decksList.innerHTML = decks.map(deck => `
            <div class="deck-card-revamped" data-deck-id="${deck.id}">
                <div class="deck-card-main-info">
                    <h3 class="deck-card-title">${deck.name}</h3>
                    <p class="deck-card-description">${deck.description || 'No description'}</p>
                </div>
                <div class="deck-card-stats-actions">
                    <div class="deck-card-stats">
                        <span class="stat-total-cards">${deck.cards.length} Card${deck.cards.length === 1 ? '' : 's'}</span>
                        <span class="stat-due-cards">${this.studyManager.getDueCardsCount(deck.id)} Due</span>
                    </div>
                    <div class="deck-card-actions">
                        <button class="btn study-btn" data-deck-id="${deck.id}">
                            <svg viewBox="0 0 24 24" class="icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path></svg> Study
                        </button>
                        <button class="btn add-card-btn" data-deck-id="${deck.id}">
                            <svg viewBox="0 0 24 24" class="icon"><path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM3 16h7v-2H3v2z"></path></svg> Add Card
                        </button>
                        <button class="btn edit-btn" data-deck-id="${deck.id}">
                            <svg viewBox="0 0 24 24" class="icon"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg> Edit
                        </button>
                        <button class="btn delete-btn" data-deck-id="${deck.id}">
                            <svg viewBox="0 0 24 24" class="icon"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers for deck cards (now .deck-card-revamped)
        document.querySelectorAll('.deck-card-revamped').forEach(cardElement => {
            cardElement.addEventListener('click', (e) => {
                console.log('[DEBUG] Deck card clicked. Target:', e.target);
                // Only trigger showDeckDetails if the click is on the card itself,
                // not on a button inside .deck-card-actions
                if (e.target.closest('.deck-card-actions')) {
                    console.log('[DEBUG] Click detected within actions area, ignoring for showDeckDetails.');
                    return;
                }
                const deckId = cardElement.dataset.deckId;
                console.log(`[DEBUG] Attempting to show details for deckId: ${deckId}`);
                this.showDeckDetails(deckId);
            });
        });

        // Add event listeners for action buttons
        // Study
        Array.from(document.querySelectorAll('.study-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                console.log(`[DEBUG] Study button clicked for deck: ${btn.dataset.deckId}`);
                this.startStudySession(btn.dataset.deckId);
            });
        });
        // Edit
        Array.from(document.querySelectorAll('.edit-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                console.log(`[DEBUG] Edit Deck button clicked for deck: ${btn.dataset.deckId}`);
                this.editDeck(btn.dataset.deckId);
            });
        });
        // Delete
        Array.from(document.querySelectorAll('.delete-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                console.log(`[DEBUG] Delete Deck button clicked for deck: ${btn.dataset.deckId}`);
                this.deleteDeck(btn.dataset.deckId);
            });
        });
        // Add Card
        Array.from(document.querySelectorAll('.add-card-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                console.log(`[DEBUG] Add Card button clicked for deck: ${btn.dataset.deckId}`);
                this.showCardModal(btn.dataset.deckId);
            });
        });
    }

    renderQuickAccessStats(decks) {
        const totalDecksStat = document.getElementById('total-decks-stat');
        const totalDueStat = document.getElementById('total-due-stat');
        const studyAllDueBtn = document.getElementById('study-all-due-btn');

        if (totalDecksStat) {
            totalDecksStat.textContent = decks.length;
        }

        const allDueCards = this.deckManager.getAllDueCards();
        if (totalDueStat) {
            totalDueStat.textContent = allDueCards.length;
        }

        if (studyAllDueBtn) {
            studyAllDueBtn.disabled = allDueCards.length === 0;
            // Update button text or style if needed based on count
            studyAllDueBtn.querySelector('.icon + span').textContent = `Study All Due (${allDueCards.length})`;
        }
    }

    handleStudyAllDue() {
        console.log('[DEBUG] handleStudyAllDue called.');
        const allDueCards = this.deckManager.getAllDueCards();
        if (allDueCards.length === 0) {
            this.showToast('No cards are due right now!', 'info');
            return;
        }
        // For Option 2 (Better but more complex for StudyManager):
        // This requires StudyManager to handle a list of cards not tied to a single currentDeckId
        // or to virtually create a temporary deck.
        // console.log('Starting study session for all due cards:', allDueCards);
        const firstCard = this.studyManager.startStudySessionWithCards(allDueCards); 
        this.switchTab('study'); 
        this.updateStudyUI(firstCard); // Explicitly update UI with the first card from the new session
    }

    showDeckModal() {
        document.getElementById('deck-modal').classList.add('active');
        document.addEventListener('keydown', this._handleDeckModalKeydown);
        setTimeout(() => {
            document.getElementById('deck-name').focus();
        }, 0);
    }

    hideDeckModal() {
        document.getElementById('deck-modal').classList.remove('active');
        document.getElementById('deck-form').reset();
        document.removeEventListener('keydown', this._handleDeckModalKeydown);
    }

    // Handle Esc key and focus trap for deck modal
    _handleDeckModalKeydown = (e) => {
        if (e.key === 'Escape') {
            this.hideDeckModal();
            return;
        }
        if (e.key === 'Tab') {
            const modal = document.getElementById('deck-modal');
            const focusable = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
            const focusableEls = Array.from(focusable).filter(el => !el.disabled && el.offsetParent !== null);
            if (focusableEls.length === 0) return;
            const first = focusableEls[0];
            const last = focusableEls[focusableEls.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    }

    async handleDeckSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('deck-name').value;
        const description = document.getElementById('deck-description').value;
        const deckNameError = document.getElementById('deck-name-error');
        if (name.trim() === '') {
            deckNameError.style.display = 'block';
            return;
        } else {
            deckNameError.style.display = 'none';
        }
        this.deckManager.createDeck(name, description);
        this.hideDeckModal();
        this.renderDecks();
    }

    showCardModal(deckId) {
        this.currentDeckId = deckId;
        const modal = document.getElementById('card-modal');
        modal.classList.add('active');

        // Add listeners for Esc key, focus trap, and click outside
        this._현재CardModalKeydown = (e) => this._handleModalKeydown(e, 'card-modal', () => this.hideCardModal());
        this._현재CardModalClickOutside = (e) => this._handleModalClickOutside(e, 'card-modal', () => this.hideCardModal());
        document.addEventListener('keydown', this._현재CardModalKeydown);
        modal.addEventListener('click', this._현재CardModalClickOutside);
        
        setTimeout(() => {
             // Focus the first relevant input
            if (document.getElementById('single-add-section').style.display !== 'none') {
                document.getElementById('card-front').focus();
            } else {
                document.getElementById('bulk-cards').focus();
            }
        }, 0);
    }

    hideCardModal() {
        const cardModal = document.getElementById('card-modal');
        const cardForm = document.getElementById('card-form');
        const modalTitle = cardModal.querySelector('h3');

        cardModal.classList.remove('active');
        cardForm.reset();
        modalTitle.textContent = 'Add New Card'; // Reset title
        document.getElementById('toggle-group').style.display = 'flex'; // Show single/bulk toggle

        if (this._currentEditCardSubmitHandler) {
            cardForm.removeEventListener('submit', this._currentEditCardSubmitHandler);
            this._currentEditCardSubmitHandler = null;
        }
        // Re-attach original add handler if it's not already set
        if (!cardForm.getAttribute('data-submit-handler-is-add')) {
            cardForm.addEventListener('submit', this._originalCardFormSubmitHandler);
            cardForm.setAttribute('data-submit-handler-is-add', 'true');
        }

        // Remove listeners
        if (this._현재CardModalKeydown) {
            document.removeEventListener('keydown', this._현재CardModalKeydown);
            this._현재CardModalKeydown = null;
        }
        if (this._현재CardModalClickOutside) {
            cardModal.removeEventListener('click', this._현재CardModalClickOutside);
            this._현재CardModalClickOutside = null;
        }
    }

    async handleCardSubmit(e) {
        e.preventDefault();
        const isBulkMode = document.getElementById('bulk-add-section').style.display !== 'none';
        if (isBulkMode) {
            // Bulk add logic
            const bulkInput = document.getElementById('bulk-cards').value;
            const errorDiv = document.getElementById('bulk-add-error');
            errorDiv.style.display = 'none';
            const lines = bulkInput.split('\n')
                .map(line => line.trim()) // Trim each line
                .filter(line => line && !line.startsWith('#')); // Filter out empty lines AND lines starting with #
            let added = 0;
            let errors = 0;
            lines.forEach((line, idx) => {
                const [front, back] = line.split('|').map(s => s && s.trim());
                if (front && back) {
                    this.deckManager.addCard(this.currentDeckId, front, back, '');
                    added++;
                } else {
                    errors++;
                }
            });
            if (added === 0) {
                errorDiv.textContent = 'No valid cards found. Use "Front | Back" per line.';
                errorDiv.style.display = 'block';
                return;
            }
            if (errors > 0) {
                errorDiv.textContent = `${added} cards added. ${errors} lines skipped (missing front or back).`;
                errorDiv.style.display = 'block';
            }
            this.hideCardModal();
            this.renderDecks();
            return;
        }
        const front = document.getElementById('card-front').value;
        const back = document.getElementById('card-back').value;
        const imageUrl = document.getElementById('card-image').value;

        this.deckManager.addCard(this.currentDeckId, front, back, imageUrl);
        this.hideCardModal();
        this.renderDecks();
    }

    startStudySession(deckId) {
        this.currentDeckId = deckId;
        this.switchTab('study');
        const card = this.studyManager.startStudySession(deckId);
        this.updateStudyUI(card);
    }

    updateStudyUI(card) {
        const cardFront = document.querySelector('.card-front');
        const cardBack = document.querySelector('.card-back');
        const progress = this.studyManager.getProgress();
        const ratingControls = document.querySelector('.rating-controls');

        if (card) {
            cardFront.innerHTML = this.formatCardContent(card.front, card.imageUrl);
            cardBack.innerHTML = this.formatCardContent(card.back);
            document.querySelector('.card').classList.remove('flipped'); // Ensure card is not flipped initially
            ratingControls.style.display = 'none'; // Hide ratings for new card
            document.getElementById('flip-card').style.display = 'inline-block'; // Show flip button
        } else {
            cardFront.innerHTML = 'No cards to study';
            cardBack.innerHTML = '';
            ratingControls.style.display = 'none';
            document.getElementById('flip-card').style.display = 'none'; // Hide flip if no card
        }

        document.getElementById('cards-remaining').textContent = 
            `${progress.current} of ${progress.total} cards`;
        document.getElementById('study-progress').textContent = 
            `${progress.percentage}% complete`;
    }

    formatCardContent(content, imageUrl = null) {
        let html = content;
        if (imageUrl) {
            html += `<img src="${imageUrl}" alt="Card image" class="card-image">`;
        }
        return html;
    }

    handleCardFlip() {
        const isFlipped = this.studyManager.flipCard();
        document.querySelector('.card').classList.toggle('flipped', isFlipped);
        const ratingControls = document.querySelector('.rating-controls');
        if (isFlipped) {
            ratingControls.style.display = 'flex'; // Show rating buttons
            document.getElementById('flip-card').style.display = 'none'; // Hide flip button
        } else {
            ratingControls.style.display = 'none'; // Hide rating buttons if flipping back
            document.getElementById('flip-card').style.display = 'inline-block'; // Show flip button
        }
    }

    handleNextCard() {
        const card = this.studyManager.nextCard();
        this.updateStudyUI(card);
    }

    handlePreviousCard() {
        const card = this.studyManager.previousCard();
        this.updateStudyUI(card);
    }

    handleCardRating(quality) {
        const card = this.studyManager.rateCard(quality);
        this.updateStudyUI(card);
    }

    editDeck(deckId) {
        const deck = this.deckManager.getDeck(deckId);
        if (!deck) return;

        // Populate and show deck modal
        document.getElementById('deck-name').value = deck.name;
        document.getElementById('deck-description').value = deck.description;
        this.showDeckModal();

        // Update form submission handler
        const form = document.getElementById('deck-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            const name = document.getElementById('deck-name').value;
            const description = document.getElementById('deck-description').value;
            this.deckManager.updateDeck(deckId, { name, description });
            this.hideDeckModal();
            this.renderDecks();
        };
    }

    deleteDeck(deckId) {
        if (confirm('Are you sure you want to delete this deck?')) {
            this.deckManager.deleteDeck(deckId);
            this.renderDecks();
        }
    }

    showDeckDetails(deckId) {
        console.log(`[DEBUG] showDeckDetails called for deckId: ${deckId}`);
        const deck = this.deckManager.getDeck(deckId);
        if (!deck) {
            console.error(`[DEBUG] Deck not found for id: ${deckId}`);
            return;
        }

        // Create modal structure
        const modalId = 'deck-details-modal';
        let modal = document.getElementById(modalId);
        if (modal) modal.remove(); // Remove if already exists

        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active deck-details-modal'; // Add a specific class for styling if needed

        let cardListHTML = '<p>No cards in this deck.</p>';
        if (deck.cards && deck.cards.length > 0) {
            cardListHTML = '<ul class="deck-details-card-list">';
            deck.cards.forEach(card => {
                cardListHTML += `
                    <li data-card-id="${card.id}">
                        <div class="card-info">
                            <p><strong>Front:</strong> ${this.truncateText(card.front, 50)}</p>
                            <p><strong>Back:</strong> ${this.truncateText(card.back, 50)}</p>
                        </div>
                        <div class="card-actions">
                            <button class="btn edit-card-btn" data-deck-id="${deckId}" data-card-id="${card.id}">
                                <svg viewBox="0 0 24 24" class="icon"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg> Edit
                            </button>
                            <button class="btn delete-card-btn" data-deck-id="${deckId}" data-card-id="${card.id}">
                                <svg viewBox="0 0 24 24" class="icon"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg> Delete
                            </button>
                        </div>
                    </li>
                `;
            });
            cardListHTML += '</ul>';
        }

        modal.innerHTML = `
            <div class="modal-content">
                <button type="button" class="modal-close icon-only" aria-label="Close">
                    <svg viewBox="0 0 24 24" class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                </button>
                <h3>${deck.name} - Cards</h3>
                ${cardListHTML}
                <div class="modal-actions">
                    <button type="button" class="btn" id="close-deck-details">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners for the new modal
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.querySelector('#close-deck-details').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Click outside modal-content
                modal.remove();
            }
        });

        // Event listeners for edit card buttons
        modal.querySelectorAll('.edit-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.currentTarget.dataset.cardId;
                this.showEditCardModal(deckId, cardId);
                modal.remove(); // Close details modal when opening edit modal
            });
        });

        // Event listeners for delete card buttons
        modal.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cardId = e.currentTarget.dataset.cardId;
                if (confirm('Are you sure you want to delete this card?')) {
                    this.deckManager.deleteCard(deckId, cardId);
                    this.renderDecks(); // Update card counts on main deck list
                    // Refresh the current modal view by re-showing details
                    // This is a simple way to update the list in the modal
                    this.showDeckDetails(deckId);
                }
            });
        });
        
        // Add Esc key listener for closing
        this._currentDeckDetailsModalKeydown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', this._currentDeckDetailsModalKeydown);
            }
        };
        document.addEventListener('keydown', this._currentDeckDetailsModalKeydown);
        // Ensure to remove this listener when modal closes (already handled by modal.remove() in Esc and click outside)
    }

    // Helper function to truncate text
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showEditCardModal(deckId, cardId) {
        const deck = this.deckManager.getDeck(deckId);
        const card = deck ? deck.cards.find(c => c.id === cardId) : null;

        if (!card) {
            alert('Error: Card not found.');
            return;
        }

        const cardModal = document.getElementById('card-modal');
        this.currentDeckId = deckId; // Set currentDeckId for the modal context
        cardModal.classList.add('active');

        // Add listeners for Esc key, focus trap, and click outside
        this._현재CardModalKeydown = (e) => this._handleModalKeydown(e, 'card-modal', () => this.hideCardModal());
        this._현재CardModalClickOutside = (e) => this._handleModalClickOutside(e, 'card-modal', () => this.hideCardModal());
        document.addEventListener('keydown', this._현재CardModalKeydown);
        cardModal.addEventListener('click', this._현재CardModalClickOutside);
        
        setTimeout(() => {
            document.getElementById('card-front').focus();
        }, 0);

        this._currentEditCardSubmitHandler = async (e) => {
            e.preventDefault();
            const updatedFront = document.getElementById('card-front').value;
            const updatedBack = document.getElementById('card-back').value;
            const updatedImageUrl = document.getElementById('card-image').value;

            try {
                const result = await this.deckManager.updateCard(deckId, cardId, {
                    front: updatedFront,
                    back: updatedBack,
                    imageUrl: updatedImageUrl
                });
                if (result) {
                    this.showToast('Card updated successfully!', 'success');
                } else {
                    // This case might occur if updateCard returns null/false on non-exceptional failure
                    this.showToast('Failed to update card. Card not found or no changes made.', 'error');
                }
            } catch (error) {
                console.error('Error updating card:', error);
                this.showToast(`Error updating card: ${error.message}`, 'error');
            }
            
            this.hideCardModal(); 
            this.renderDecks();
        };
        const cardForm = document.getElementById('card-form');
        cardForm.addEventListener('submit', this._currentEditCardSubmitHandler);
    }

    showTemplate() {
        fetch('docs/bulk_import_template.txt')
            .then(response => response.text())
            .then(template => {
                const modalId = 'template-display-modal';
                // Remove existing modal if any to prevent duplicates
                let existingModal = document.getElementById(modalId);
                if (existingModal) existingModal.remove();

                const modal = document.createElement('div');
                modal.id = modalId;
                modal.className = 'modal active';
                // Add a specific class for content to help with focus trap exclusion if needed
                modal.innerHTML = `
                    <div class="modal-content modal-template-content" style="max-width: 600px;">
                        <button type="button" class="modal-close icon-only" aria-label="Close">
                            <svg viewBox="0 0 24 24" class="icon"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                        </button>
                        <h3>Bulk Import Template</h3>
                        <pre class="bulk-import-preview">${template}</pre>
                        <div class="modal-actions">
                            <button type="button" class="btn close-template-btn">Close</button>
                            <button type="button" class="btn primary download-template-btn">Download Template</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                const closeFn = () => {
                    modal.remove();
                    if (this._현재TemplateModalKeydown) {
                         document.removeEventListener('keydown', this._현재TemplateModalKeydown);
                         this._현재TemplateModalKeydown = null;
                    }
                    // Click outside listener is on `modal` itself, so it's removed with `modal.remove()`
                };

                // Add close button handler
                modal.querySelector('.modal-close').addEventListener('click', closeFn);
                modal.querySelector('.close-template-btn').addEventListener('click', closeFn);
                
                // Add click outside to close (already on `modal` but specific to its content)
                modal.addEventListener('click', (e) => {
                     if (e.target === modal) closeFn(); // Only if click is on backdrop
                });

                // Add download handler
                modal.querySelector('.download-template-btn').addEventListener('click', () => {
                    const blob = new Blob([template], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'bulk_import_template.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });

                // Add Esc key listener for closing and focus trap
                this._현재TemplateModalKeydown = (e) => this._handleModalKeydown(e, modalId, closeFn);
                document.addEventListener('keydown', this._현재TemplateModalKeydown);

                // Focus the close button initially
                setTimeout(() => {
                    modal.querySelector('.close-template-btn').focus();
                }, 0);
            })
            .catch(error => {
                console.error('Error loading template:', error);
                alert('Error loading template. Please try again.');
            });
    }

    refreshDeckView() {
        this.renderDecks();
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error('Toast container not found!');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        // The CSS animation handles removal, but we can also remove explicitly
        // This timeout should roughly match the CSS animation total visible time + fade out time
        setTimeout(() => {
            // Check if the toast is still in the DOM before trying to remove
            if (toast.parentElement === container) {
                container.removeChild(toast);
            }
        }, duration);
    }

    // Generic modal keydown handler (Esc and Tab focus trap)
    _handleModalKeydown = (e, modalId, closeFn) => {
        const modal = document.getElementById(modalId);
        if (!modal || !modal.classList.contains('active')) return;

        if (e.key === 'Escape') {
            closeFn();
            return;
        }
        if (e.key === 'Tab') {
            const focusable = modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
            const focusableEls = Array.from(focusable).filter(el => !el.disabled && el.offsetParent !== null && !el.closest('.modal-template-content')); // Exclude template modal content if nested
            if (focusableEls.length === 0) return;
            const first = focusableEls[0];
            const last = focusableEls[focusableEls.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === last || !focusableEls.includes(document.activeElement)) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    }

    // Generic modal click outside handler
    _handleModalClickOutside = (e, modalId, closeFn) => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) { // Check if the click is on the modal backdrop itself
            closeFn();
        }
    }
} 