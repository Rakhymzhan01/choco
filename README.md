# Choco — coupons & discounts marketplace (Web Programming project)

A complete multi-page website (HTML + CSS + vanilla JavaScript) in the style of a coupon/deals aggregator.
All data lives in PostgreSQL, in normalized tables (see `schema.sql`). `db.php` turns them into the lists the scripts use.

## How to run
Needs PostgreSQL and PHP (with `pdo_pgsql`). Create the database once, then start the site:
```
createdb choco && psql choco -f schema.sql
php -S localhost:8000
```
Then open http://localhost:8000

## Demo accounts
| Role  | Email             | Password |
|-------|-------------------|----------|
| User  | demo@Choco.kz    | Demo1234 |
| Admin | admin@Choco.kz   | Admin123 |

Reset all data: run `Store.resetAll()` in the browser console, then reload.

## Pages
| Page | File |
|------|------|
| Home | `index.html` |
| Register / Login / Forgot password | `register.html`, `login.html`, `pages/forgot-password.html` |
| Deals (search + filters + sorting) | `pages/deals.html` |
| Deal details | `pages/details.html?id=1` |
| Cart → Booking form → Confirmation | `pages/cart.html`, `pages/checkout.html`, `pages/confirmation.html` |
| Profile (edit, bookings, change password) | `profile.html` |
| Admin panel (dashboard, users, CRUD deals, bookings status) | `admin.html` |
| About, Contact, Privacy, Terms | `pages/*.html` |

## Requirements checklist
- Registration (required + optional fields) with validation incl. unique email ✔
- Login: empty fields, non-existing user, wrong password ✔
- Home page, consistent navbar with active page, footer on every page ✔
- Main functionality: search → results (12 cards) → details → cart → booking form → confirmation ✔
- Profile with edit + booking history + logout ✔
- Admin panel with Create / Read / Update / Delete of deals, users list, booking status change ✔
- Validation: 10+ error situations (empty field, invalid email, short password, mismatch, duplicate email, invalid phone, past date, invalid quantity, price > old price, empty form…) ✔
- Responsive: desktop / tablet / mobile (media queries, burger menu, stacked tables) ✔
- Consistent design (CSS variables, shared buttons / cards / forms) ✔
- HTML: semantic tags, forms, lists, tables, images. CSS: selectors, box model, Flexbox, Grid, media queries, hover, transitions. JS: variables, functions, conditions, events, DOM, validation, dynamic content ✔

## Structure
```
Choco/
├── index.html  login.html  register.html  profile.html  admin.html
├── pages/      deals, details, cart, checkout, confirmation, about, contact, privacy, terms, forgot-password
├── css/style.css
├── js/
│   ├── data.js        categories, districts, seed deals
│   ├── store.js       localStorage "database"
│   ├── validation.js  form validation rules
│   ├── auth.js        register / login / session / guards
│   ├── cart.js        shopping cart
│   ├── layout.js      navbar, footer, shared UI helpers, card template
│   └── *.js           one script per page
└── images/            logo + generated SVG deal illustrations
```

## Notes
Passwords are hashed with a simple demo hash. A real site must hash on a server (bcrypt/argon2).
