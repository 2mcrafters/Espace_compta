# 🎨 Dark Mode & Responsive Design - User Guide

## 🌓 How to Toggle Dark Mode

### Option 1: Desktop Sidebar (1024px+)
1. Look at the bottom of the left sidebar
2. Find the sun/moon icon button
3. Click to toggle between light ☀️ and dark 🌙 modes

### Option 2: Mobile/Tablet (< 1024px)
1. Open the mobile menu (hamburger icon ☰)
2. Scroll to find the sun/moon toggle button
3. Click to switch themes
4. Theme applies immediately

### Option 3: Tablet Header (768px - 1023px)
1. Look at the top-right of the header bar
2. Find the sun/moon icon next to your profile badge
3. Click to toggle

## ✨ Dark Mode Features

### Automatic Features
- 🔄 **Auto-saves your preference** - Theme persists across sessions
- 🎯 **System detection** - Automatically uses your OS theme on first visit
- ⚡ **Instant apply** - No page reload needed
- 🎨 **Smooth transitions** - Colors fade in/out gracefully

### What Changes in Dark Mode?
- **Backgrounds**: White → Dark gray
- **Text**: Black → White
- **Cards**: Light → Dark with subtle borders
- **Charts**: Adjusted for visibility
- **Buttons**: Enhanced contrast
- **Scrollbars**: Dark themed

## 📱 Responsive Breakpoints

### Mobile Portrait (< 475px)
- ✅ Single column layout
- ✅ Compact spacing
- ✅ Stacked cards
- ✅ Full-width elements
- ✅ Drawer navigation

### Mobile Landscape / Small Tablets (475px - 639px)
- ✅ Slight spacing increase
- ✅ 2-column grids for quick actions
- ✅ Medium text sizes

### Tablets (640px - 1023px)
- ✅ 2-column layouts
- ✅ Increased padding
- ✅ Drawer navigation still present
- ✅ Theme toggle in header

### Desktop (1024px - 1279px)
- ✅ Sidebar visible
- ✅ 3-column grids
- ✅ Full-size components
- ✅ Optimal spacing

### Large Desktop (1280px - 1535px)
- ✅ 3-4 column grids
- ✅ Wider containers
- ✅ More comfortable spacing

### Extra Large (1536px+)
- ✅ Maximum 4-column grids
- ✅ Centered content
- ✅ Generous spacing

## 🎯 Recommended Settings

### For Best Experience:

#### Dark Mode When:
- 🌙 Working late at night
- 🎬 In dim lighting
- 👁️ Sensitive eyes
- ⚡ Battery saving (OLED screens)

#### Light Mode When:
- ☀️ Bright environments
- 📊 Sharing screen
- 🖨️ Printing pages
- 👔 Formal presentations

## 🔧 Troubleshooting

### Theme not saving?
- Check browser localStorage is enabled
- Try clearing cache and setting again

### Colors look off?
- Ensure browser is updated
- Check if dark mode reader extensions are interfering
- Disable browser dark mode extensions

### Toggle not visible?
- Check screen size - position changes with breakpoint
- Try refreshing the page

## 💡 Tips & Tricks

1. **Keyboard Users**: Tab to the toggle button and press Enter/Space
2. **Auto-Switch**: Theme matches your system preference on first visit
3. **Quick Toggle**: Click anywhere on the button - entire surface is clickable
4. **Visual Feedback**: Icon rotates and changes on click

## 🎨 Color Reference

### Light Mode
- Primary Background: White (#FFFFFF)
- Secondary Background: Light Gray (#F9FAFB)
- Text: Dark Gray (#111827)
- Borders: Light Gray (#E5E7EB)

### Dark Mode
- Primary Background: Dark Gray (#1F2937)
- Secondary Background: Darker Gray (#111827)
- Text: White (#F9FAFB)
- Borders: Medium Gray (#374151)

### Always Consistent
- Primary Color: Blue (#004493)
- Success: Green (#10B981)
- Warning: Orange (#F59E0B)
- Error: Red (#EF4444)

## 📱 Mobile Navigation Guide

### Opening Mobile Menu
1. Tap hamburger icon (☰) top-left
2. Menu slides from left
3. All navigation options visible

### Menu Contents
- Dashboard
- Rapports
- Collaborateurs
- Portefeuilles
- Tâches
- Demandes
- Clients
- Profil
- Rôles et permissions
- **Theme Toggle** ← Toggle dark mode here
- Déconnexion button

### Closing Mobile Menu
- Tap any menu item (navigates and closes)
- Tap outside the menu
- Tap the X button
- Swipe left on the menu

## ✨ Animation Details

### Theme Toggle
- Icon rotates 90° on switch
- Color transition: 200ms
- Smooth fade between icons

### Layout Changes
- All color transitions: 300ms
- Card animations: Spring physics
- Hover effects: Instant

## 🎯 Accessibility

- ♿ ARIA labels on toggle ("Toggle theme")
- ⌨️ Keyboard accessible (Tab + Enter)
- 🎨 High contrast in both modes
- 👁️ Focus indicators visible
- 📱 Touch targets ≥ 44x44px

## 📊 Performance

- ⚡ Zero layout shift on toggle
- 🚀 Instant theme application
- 💾 Minimal localStorage usage (~10 bytes)
- 🎨 CSS-only transitions (GPU accelerated)

---

**Enjoy your new dark mode and fully responsive app! 🎉**

---

## 👥 Collaborateurs — Création & Invitation

Vous pouvez créer des utilisateurs depuis la page Collaborateurs. Le modal de création prend en charge:

- Champs de base (prénom, nom, email, téléphone, etc.)
- Objectifs d'heures mensuel/annuel
- Taux horaire initial + date d'effet
- Attribution des rôles
- Envoi d'une invitation par email (optionnel)

### Invitation par email

Dans le modal, cochez « Envoyer un email d'invitation ». Le champ mot de passe devient facultatif et l'utilisateur recevra un email avec un lien pour définir son mot de passe.

Pré-requis:

- Configurer l'envoi d'emails dans `.env` (MAIL_MAILER, MAIL_HOST, ...)
- Définir `FRONTEND_URL` (ex: http://localhost:5173) pour que le lien pointe vers le frontend
- En dev, vous pouvez utiliser `QUEUE_CONNECTION=sync` pour envoyer immédiatement

Comportement:

- Le backend génère un token de réinitialisation et envoie un email « Bienvenue » avec un bouton « Définir mon mot de passe ».
- Les toasts de succès / erreur s'affichent en bas à droite.
- Les erreurs de validation s'affichent sous les champs concernés.
