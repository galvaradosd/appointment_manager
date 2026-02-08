# Appointment Manager

A small single-page web application to manage services and client appointments using **vanilla JavaScript**, **semantic HTML**, and **modern CSS**.  
It was developed as the **final project for the [JavaScript course at Coderhouse](https://www.coderhouse.com/cursos/javascript)**.

It is designed as a learning project to practice DOM manipulation, browser storage (`localStorage`), higher-order functions on arrays, and basic async operations with `fetch` and an external library ([SweetAlert2](https://www.npmjs.com/package/sweetalert2)).  

---

## Features

- Define, list, edit and delete services (name, duration, price).
- Create, list and filter client appointments:
  - Filter by date and by status (pending, confirmed, cancelled).
  - Inline actions to confirm, cancel or delete appointments.
- Persistent data using `localStorage` for services and appointments.
- Semantic HTML layout with two main panels (Services / Appointments).
- Modern CSS with:
  - Logical properties (`padding-block`, `margin-inline`, etc.).
  - Relative units (`rem`).
  - Simple responsive grid layout.
- Async call to a public holidays API (`fetch`) to check if a selected date is a holiday.
- SweetAlert2 (via CDN) for nicer confirmation dialogs when deleting records.

---

## Tech stack

- **HTML5**: semantic structure (`header`, `main`, `section`, `footer`, `table`, `form`).
- **CSS3**:
  - Custom properties (`--color-*`, `--space-*`).
  - Logical properties and responsive layout.
- **JavaScript (ES6+)**:
  - Modules of logic grouped in a single `main.js`.
  - Higher-order functions: `map`, `filter`, `find`, `sort`, `includes`.
  - Browser Storage API: `localStorage.setItem`, `localStorage.getItem` with JSON  
    (see [MDN – Window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)).
  - `fetch` + `async/await` for HTTP calls.
  - External library: [SweetAlert2](https://www.npmjs.com/package/sweetalert2) via CDN for confirmation dialogs.

---

## Project structure

```text
.
├── index.html     # Main HTML file (semantic layout, script/style includes)
├── styles.css     # Global styles for layout, forms, tables and components
└── app.js         # Application logic (state, DOM handling, storage, async)
