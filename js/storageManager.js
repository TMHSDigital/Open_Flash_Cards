export class StorageManager {
    constructor(deckManager) {
        this.deckManager = deckManager;
        this.storageKey = 'flashcards_data';
    }

    async loadData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.deckManager.fromJSON(data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            const data = this.deckManager.toJSON();
            localStorage.setItem(this.storageKey, data);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    exportData() {
        try {
            const data = this.deckManager.toJSON();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `flashcards_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data');
        }
    }

    async importData(file) {
        try {
            const text = await file.text();
            this.deckManager.fromJSON(text);
            this.saveData();
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data');
        }
    }

    // Backup methods
    createBackup() {
        const data = this.deckManager.toJSON();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        localStorage.setItem(`${this.storageKey}_backup_${timestamp}`, data);
    }

    restoreBackup(timestamp) {
        const backupKey = `${this.storageKey}_backup_${timestamp}`;
        const data = localStorage.getItem(backupKey);
        if (data) {
            this.deckManager.fromJSON(data);
            this.saveData();
            return true;
        }
        return false;
    }

    listBackups() {
        const backups = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.storageKey}_backup_`)) {
                const timestamp = key.replace(`${this.storageKey}_backup_`, '');
                backups.push(timestamp);
            }
        }
        return backups.sort().reverse();
    }

    deleteBackup(timestamp) {
        const backupKey = `${this.storageKey}_backup_${timestamp}`;
        localStorage.removeItem(backupKey);
    }
} 