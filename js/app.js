import { DeckManager } from './deckManager.js';
import { StudyManager } from './studyManager.js';
import { UIManager } from './uiManager.js';
import { StorageManager } from './storageManager.js';

class App {
    constructor() {
        this.deckManager = new DeckManager();
        this.studyManager = new StudyManager(this.deckManager);
        this.uiManager = new UIManager(this.deckManager, this.studyManager);
        this.storageManager = new StorageManager(this.deckManager);

        this.initializeApp();
    }

    async initializeApp() {
        // Load saved data
        await this.storageManager.loadData();

        // Initialize UI
        this.uiManager.initialize();

        // Set up event listeners
        this.setupEventListeners();

        // Load initial theme
        this.loadTheme();
    }

    setupEventListeners() {
        // Theme switcher
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Import/Export
        document.getElementById('export-data').addEventListener('click', () => {
            this.storageManager.exportData();
        });

        document.getElementById('import-trigger').addEventListener('click', () => {
            document.getElementById('import-data').click();
        });

        document.getElementById('import-data').addEventListener('change', (e) => {
            this.storageManager.importData(e.target.files[0]);
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        document.getElementById('theme-selector').value = savedTheme;
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
}); 