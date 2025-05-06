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
        document.getElementById('card-modal').classList.remove('active');
        document.getElementById('card-form').reset();
    }

    async handleCardSubmit(e) {
        e.preventDefault();
        const isBulkMode = document.getElementById('bulk-add-section').style.display !== 'none';
        if (isBulkMode) {
            // Bulk add logic
            const bulkInput = document.getElementById('bulk-cards').value;
            const errorDiv = document.getElementById('bulk-add-error');
            errorDiv.style.display = 'none';
            const lines = bulkInput.split('\n').map(line => line.trim()).filter(Boolean);
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

        // Show deck details in a modal or dedicated section
        // Implementation depends on your UI design
    }
} 