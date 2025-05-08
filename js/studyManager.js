export class StudyManager {
    constructor(deckManager) {
        this.deckManager = deckManager;
        this.currentDeckId = null;
        this.currentCardIndex = 0;
        this.studyCards = [];
        this.isFlipped = false;
    }

    startStudySession(deckId) {
        this.currentDeckId = deckId;
        this.currentCardIndex = 0;
        this.isFlipped = false;
        
        // Get due cards first, then add remaining cards
        const dueCards = this.deckManager.getDueCards(deckId);
        const deck = this.deckManager.getDeck(deckId);
        const remainingCards = deck.cards.filter(card => !dueCards.includes(card));
        
        // Shuffle both arrays
        this.studyCards = [
            ...this.shuffleArray(dueCards),
            ...this.shuffleArray(remainingCards)
        ];

        return this.getCurrentCard();
    }

    startStudySessionWithCards(cardsToStudy) {
        this.currentDeckId = null; // No single current deck for this type of session
        this.currentCardIndex = 0;
        this.isFlipped = false;
        
        // Shuffle the provided cards
        this.studyCards = this.shuffleArray(cardsToStudy);

        // If UIManager.updateStudyUI is to be called, it needs the first card.
        // This method needs to be called from UIManager after switching tab.
        // For now, the UIManager will handle calling updateStudyUI with the first card.
        // We also need to ensure that rateCard can work without a currentDeckId, 
        // using the deckId stored on the card itself.
        const firstCard = this.getCurrentCard();
        if (firstCard) {
            this.currentDeckId = firstCard.deckId; // Set currentDeckId for the first card
        }
        return firstCard;
    }

    getCurrentCard() {
        if (!this.studyCards.length) return null;
        return this.studyCards[this.currentCardIndex];
    }

    nextCard() {
        if (this.currentCardIndex < this.studyCards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;
            const nextCardToStudy = this.getCurrentCard();
            if (nextCardToStudy) {
                this.currentDeckId = nextCardToStudy.deckId; // Update deckId for the next card
            }
            return nextCardToStudy;
        }
        this.currentDeckId = null; // Clear deckId if no more cards
        return null;
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            const prevCardToStudy = this.getCurrentCard();
            if (prevCardToStudy) {
                this.currentDeckId = prevCardToStudy.deckId; // Update deckId for the previous card
            }
            return prevCardToStudy;
        }
        this.currentDeckId = null; // Clear deckId if at the beginning
        return null;
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        return this.isFlipped;
    }

    rateCard(quality) {
        const currentCard = this.getCurrentCard();
        if (!currentCard) return null;

        // Use currentCard.deckId as it was added in deckManager.getAllDueCards()
        // OR this.currentDeckId which should be set by nextCard/prevCard/startStudySessionWithCards
        const deckIdToUpdate = currentCard.deckId || this.currentDeckId;
        if (!deckIdToUpdate) {
            console.error("Deck ID missing for card rating in aggregated session.");
            return this.nextCard(); // Skip rating if deckId is missing
        }

        this.deckManager.updateCardProgress(deckIdToUpdate, currentCard.id, quality);
        
        // Move to next card
        return this.nextCard();
    }

    getProgress() {
        if (!this.studyCards.length) return { current: 0, total: 0, percentage: 0 };
        
        return {
            current: this.currentCardIndex + 1,
            total: this.studyCards.length,
            percentage: Math.round(((this.currentCardIndex + 1) / this.studyCards.length) * 100)
        };
    }

    getDueCardsCount(deckId) {
        return this.deckManager.getDueCards(deckId).length;
    }

    // Helper method to shuffle array
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
} 