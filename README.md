# MangeXis - Premium Manga Reading Platform

A modern, minimalist manga/webtoon reading platform with a sleek black & white aesthetic inspired by elite anime characters.

## Features

- 🎨 **Elite Design**: Black & white theme with smooth animations
- 📱 **Responsive**: Works perfectly on all devices
- 🎬 **Auto Slider**: Smooth fade transitions for featured manga
- 🔍 **Advanced Filtering**: Search by name, status, and genre
- 📖 **Immersive Reader**: Full-screen reading experience with keyboard navigation
- ⚡ **Fast Performance**: Built with Vite for lightning-fast load times

## Tech Stack

- **React 18** - UI Framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

This project is optimized for Netlify deployment. Simply connect your repository to Netlify and it will automatically deploy.

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx
│   ├── Slider.jsx
│   ├── SearchFilter.jsx
│   └── MangaCard.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── MangaDetail.jsx
│   └── Reader.jsx
├── data/
│   └── mangaData.js
├── App.jsx
├── main.jsx
└── index.css
```

## Adding New Manga

Edit `src/data/mangaData.js` and add your manga following this structure:

```javascript
{
  slug: 'manga-slug',
  title: 'Manga Title',
  description: 'Description...',
  cover: 'cover-image-url',
  status: 'ongoing' or 'finished',
  genres: ['Genre1', 'Genre2'],
  chapters: [
    {
      id: '1',
      title: 'Chapter Title',
      imageLinks: ['page1-url', 'page2-url']
    }
  ]
}
```

## Keyboard Shortcuts (Reader)

- `→` Next page
- `←` Previous page

## Design Philosophy

- **Minimal but Powerful**: Clean interface with strong functionality
- **Silent but Violent**: Subtle hover effects that make an impact
- **Elite Aura**: Confident design that doesn't need to shout

---

Built with 💀 by MangeXis Team
