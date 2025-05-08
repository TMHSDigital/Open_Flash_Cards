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
        
        decksList.innerHTML = decks.map(deck => `
            <div class="deck-card" data-deck-id="${deck.id}">
                <h3>${deck.name}</h3>
                <p>${deck.description || ''}</p>
                <div class="deck-stats">
                    <span>${deck.cards.length} cards</span>
                    <span>${this.studyManager.getDueCardsCount(deck.id)} due</span>
                </div>
                <div class="deck-actions">
                    <button class="btn study-btn" data-deck-id="${deck.id}">Study</button>
                    <button class="btn add-card-btn" data-deck-id="${deck.id}">Add Card</button>
                    <button class="btn edit-btn" data-deck-id="${deck.id}">Edit</button>
                    <button class="btn delete-btn" data-deck-id="${deck.id}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add click handlers for deck cards
        document.querySelectorAll('.deck-card').forEach(card => {
            card.addEventListener('click', () => {
                const deckId = card.dataset.deckId;
                this.showDeckDetails(deckId);
            });
        });

        // Add event listeners for action buttons
        // Study
        Array.from(document.querySelectorAll('.study-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.startStudySession(btn.dataset.deckId);
            });
        });
        // Edit
        Array.from(document.querySelectorAll('.edit-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.editDeck(btn.dataset.deckId);
            });
        });
        // Delete
        Array.from(document.querySelectorAll('.delete-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.deleteDeck(btn.dataset.deckId);
            });
        });
        // Add Card
        Array.from(document.querySelectorAll('.add-card-btn')).forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this.showCardModal(btn.dataset.deckId);
            });
        });
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
        document.getElementById('card-modal').classList.add('active');
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

        if (card) {
            cardFront.innerHTML = this.formatCardContent(card.front, card.imageUrl);
            cardBack.innerHTML = this.formatCardContent(card.back);
        } else {
            cardFront.innerHTML = 'No cards to study';
            cardBack.innerHTML = '';
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
        const deck = this.deckManager.getDeck(deckId);
        if (!deck) return;

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
                            <button class="btn edit-card-btn" data-deck-id="${deckId}" data-card-id="${card.id}">Edit</button>
                            {/* Delete button will be added in a later step */}
                        </div>
                    </li>
                `;
            });
            cardListHTML += '</ul>';
        }

        modal.innerHTML = `
            <div class="modal-content">
                <button type="button" class="modal-close" aria-label="Close">&times;</button>
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
                // console.log(\`Edit card: \${cardId} from deck: \${deckId}\`);
                this.showEditCardModal(deckId, cardId);
                modal.remove(); // Close details modal when opening edit modal
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

        // For now, let's reuse the existing card modal.
        // We'll need to populate it and change its submit behavior.
        const cardModal = document.getElementById('card-modal');
        const cardForm = document.getElementById('card-form');
        const modalTitle = cardModal.querySelector('h3');
        
        // Hide bulk add, show single add
        document.getElementById('single-add-toggle').click(); // Ensure single add is active
        document.getElementById('bulk-add-section').style.display = 'none';
        document.getElementById('single-add-section').style.display = '';
        document.getElementById('toggle-group').style.display = 'none'; // Hide single/bulk toggle

        modalTitle.textContent = 'Edit Card';
        document.getElementById('card-front').value = card.front;
        document.getElementById('card-back').value = card.back;
        document.getElementById('card-image').value = card.imageUrl || '';

        // Change form submission to update
        cardForm.removeEventListener('submit', this._originalCardFormSubmitHandler);
        cardForm.removeAttribute('data-submit-handler-is-add');

        this._currentEditCardSubmitHandler = (e) => {
            e.preventDefault();
            const updatedFront = document.getElementById('card-front').value;
            const updatedBack = document.getElementById('card-back').value;
            const updatedImageUrl = document.getElementById('card-image').value;

            this.deckManager.updateCard(deckId, cardId, {
                front: updatedFront,
                back: updatedBack,
                imageUrl: updatedImageUrl
            });
            
            this.hideCardModal(); 
            this.renderDecks();
        };
        cardForm.addEventListener('submit', this._currentEditCardSubmitHandler);
        
        // ... (rest of modal showing logic) ...
    }

    showTemplate() {
        fetch('docs/bulk_import_template.txt')
            .then(response => response.text())
            .then(template => {
                const modal = document.createElement('div');
                modal.className = 'modal active';
                modal.innerHTML = `
                    <div class="modal-content" style="max-width: 600px;">
                        <button type="button" class="modal-close" aria-label="Close">&times;</button>
                        <h3>Bulk Import Template</h3>
                        <pre style="background: var(--color-light-gray); padding: 1rem; border-radius: 4px; overflow-x: auto;">${template}</pre>
                        <div class="modal-actions">
                            <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
                            <button class="btn primary" onclick="this.downloadTemplate()">Download Template</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);

                // Add close button handler
                modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
                
                // Add click outside to close
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) modal.remove();
                });

                // Add download handler
                window.downloadTemplate = () => {
                    const blob = new Blob([template], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'bulk_import_template.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                };
            })
            .catch(error => {
                console.error('Error loading template:', error);
                alert('Error loading template. Please try again.');
            });
    }

    refreshDeckView() {
        this.renderDecks();
    }
} 