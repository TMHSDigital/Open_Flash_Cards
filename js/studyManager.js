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

    getCurrentCard() {
        if (!this.studyCards.length) return null;
        return this.studyCards[this.currentCardIndex];
    }

    nextCard() {
        if (this.currentCardIndex < this.studyCards.length - 1) {
            this.currentCardIndex++;
            this.isFlipped = false;
            return this.getCurrentCard();
        }
        return null;
    }

    previousCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            this.isFlipped = false;
            return this.getCurrentCard();
        }
        return null;
    }

    flipCard() {
        this.isFlipped = !this.isFlipped;
        return this.isFlipped;
    }

    rateCard(quality) {
        const currentCard = this.getCurrentCard();
        if (!currentCard) return null;

        // Update card progress using SM-2 algorithm
        this.deckManager.updateCardProgress(this.currentDeckId, currentCard.id, quality);
        
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