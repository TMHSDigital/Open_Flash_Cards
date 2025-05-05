export class DeckManager {
    constructor() {
        this.decks = new Map();
    }

    createDeck(name, description = '') {
        const id = crypto.randomUUID();
        const deck = {
            id,
            name,
            description,
            cards: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        this.decks.set(id, deck);
        return deck;
    }

    deleteDeck(id) {
        return this.decks.delete(id);
    }

    getDeck(id) {
        return this.decks.get(id);
    }

    getAllDecks() {
        return Array.from(this.decks.values());
    }

    addCard(deckId, front, back, imageUrl = null) {
        const deck = this.decks.get(deckId);
        if (!deck) return null;

        const card = {
            id: crypto.randomUUID(),
            front,
            back,
            imageUrl,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            // Spaced repetition data
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: new Date().toISOString()
        };

        deck.cards.push(card);
        deck.lastModified = new Date().toISOString();
        return card;
    }

    updateCard(deckId, cardId, updates) {
        const deck = this.decks.get(deckId);
        if (!deck) return null;

        const cardIndex = deck.cards.findIndex(card => card.id === cardId);
        if (cardIndex === -1) return null;

        const card = deck.cards[cardIndex];
        Object.assign(card, updates, { lastModified: new Date().toISOString() });
        deck.lastModified = new Date().toISOString();

        return card;
    }

    deleteCard(deckId, cardId) {
        const deck = this.decks.get(deckId);
        if (!deck) return false;

        const initialLength = deck.cards.length;
        deck.cards = deck.cards.filter(card => card.id !== cardId);
        deck.lastModified = new Date().toISOString();

        return deck.cards.length !== initialLength;
    }

    updateDeck(deckId, updates) {
        const deck = this.decks.get(deckId);
        if (!deck) return null;

        Object.assign(deck, updates, { lastModified: new Date().toISOString() });
        return deck;
    }

    getDueCards(deckId) {
        const deck = this.decks.get(deckId);
        if (!deck) return [];

        const now = new Date();
        return deck.cards.filter(card => new Date(card.nextReview) <= now);
    }

    // Spaced repetition algorithm (SM-2)
    updateCardProgress(deckId, cardId, quality) {
        const card = this.getDeck(deckId)?.cards.find(c => c.id === cardId);
        if (!card) return null;

        // SM-2 algorithm implementation
        let { interval, easeFactor, repetitions } = card;

        if (quality >= 3) { // Successful recall
            repetitions += 1;
            if (repetitions === 1) {
                interval = 1;
            } else if (repetitions === 2) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
        } else { // Failed recall
            repetitions = 0;
            interval = 1;
        }

        // Update ease factor
        easeFactor = Math.max(1.3, easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)));

        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        return this.updateCard(deckId, cardId, {
            interval,
            easeFactor,
            repetitions,
            nextReview: nextReview.toISOString()
        });
    }

    // Export/Import methods
    toJSON() {
        return JSON.stringify(Array.from(this.decks.entries()));
    }

    fromJSON(json) {
        try {
            const data = JSON.parse(json);
            this.decks = new Map(data);
        } catch (error) {
            console.error('Error importing decks:', error);
            throw new Error('Invalid deck data format');
        }
    }
} 