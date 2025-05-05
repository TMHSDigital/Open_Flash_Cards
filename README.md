# Interactive Study Flashcards System

A modern, responsive web application for creating and studying flashcards with spaced repetition learning. Built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Features
- Create, edit, and delete flashcard decks
- Add cards with text and optional images
- Study mode with spaced repetition (SM-2 algorithm)
- Progress tracking per deck
- Import/Export functionality
- Local storage for data persistence

### UI/UX Features
- Clean, modern interface with consistent design system
- Light/Dark theme support
- Responsive design for all screen sizes
- Smooth animations and transitions
- Card flip animation
- Modal dialogs for actions
- Accessible design with proper focus states

### Design System
- Modern color palette with semantic colors
- Typography system with Inter font family
- Consistent spacing scale
- Border radius system
- Shadow system for depth
- Transition timings
- Component-specific styles
- Responsive breakpoints

## Setup

1. Clone the repository:
```bash
git clone https://github.com/TMHSDigital/flashcards.git
cd flashcards
```

2. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

3. Visit `http://localhost:8000` in your browser

## Usage

### Creating Decks
1. Click "Create New Deck" button
2. Enter deck name and optional description
3. Click "Create" to save

### Adding Cards
1. Click on a deck to view its details
2. Click "Add Card" button
3. Enter front and back content
4. Optionally add an image URL
5. Click "Add" to save

### Studying
1. Click "Study" on any deck
2. Use the "Flip" button to reveal answers
3. Rate your recall (1-5)
4. Cards will be scheduled for review based on your performance

### Theme Switching
1. Go to Settings tab
2. Select Light or Dark theme
3. Theme preference is saved automatically

### Import/Export
- Use the "Export" button to download your decks as JSON
- Use the "Import" button to restore decks from a JSON file

## Data Structure

Example deck JSON:
```json
{
  "id": "uuid",
  "name": "Example Deck",
  "description": "Sample deck for demonstration",
  "cards": [
    {
      "id": "uuid",
      "front": "What is the capital of France?",
      "back": "Paris",
      "imageUrl": "https://example.com/paris.jpg",
      "interval": 1,
      "easeFactor": 2.5,
      "repetitions": 0,
      "nextReview": "2024-03-20T10:00:00Z"
    }
  ],
  "createdAt": "2024-03-19T10:00:00Z",
  "lastModified": "2024-03-19T10:00:00Z"
}
```

## Technical Details

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Dependencies
- No external dependencies
- Uses modern JavaScript features
- Local Storage API for data persistence

### File Structure
```
flashcards/
├── css/
│   ├── styles.css    # Core styles
│   └── themes.css    # Theme variables
├── js/
│   ├── app.js        # Main application
│   ├── deckManager.js
│   ├── studyManager.js
│   ├── storageManager.js
│   └── uiManager.js
├── docs/
│   └── STYLES.md     # Style guide
├── index.html
└── README.md
```

## License

MIT License - feel free to use this project for any purpose.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## Author

TMHSDigital - [GitHub Profile](https://github.com/TMHSDigital)