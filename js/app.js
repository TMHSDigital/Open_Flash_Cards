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

        // Add listener for data changes to trigger save
        document.addEventListener('datachanged', () => {
            console.log('[DEBUG] datachanged event detected, saving data...');
            this.storageManager.saveData();
        });
    }

    setupEventListeners() {
        // Theme switcher
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Import/Export
        document.getElementById('export-data').addEventListener('click', () => {
            try {
                this.storageManager.exportData();
                this.uiManager.showToast('Data exported successfully!', 'success');
            } catch (error) {
                console.error('Export failed:', error);
                this.uiManager.showToast(`Export failed: ${error.message}`, 'error');
            }
        });

        document.getElementById('import-trigger').addEventListener('click', () => {
            document.getElementById('import-data').click();
        });

        document.getElementById('import-data').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await this.storageManager.importData(file);
                    this.uiManager.showToast('Data imported successfully!', 'success');
                    this.uiManager.refreshDeckView(); // Refresh deck view
                } catch (error) {
                    console.error('Import failed:', error);
                    this.uiManager.showToast(`Import failed: ${error.message}`, 'error');
                }
                // Reset file input to allow importing the same file again if needed
                e.target.value = null;
            }
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