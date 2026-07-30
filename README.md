# Sponge Global Full-Stack Employee Assessment

This package contains a complete frontend and backend for a Sponge Global employee assessment mini-site.

## Main features

### Frontend

- Red-and-white Sponge Global interface
- Employee details form
- Responsive desktop and mobile layout
- Progress tracking
- 30-question workplace capability assessment
- 12-question thinking-preference assessment
- Instant results page
- Printable employee report
- Percentage result such as:
  - 70% left preference
  - 30% right preference
- Admin results page
- CSV results download

### Workplace categories

1. Collaboration
2. Adaptability
3. Accountability
4. Communication
5. Problem Solving
6. Emotional Intelligence
7. Leadership Potential
8. Resilience
9. Attention to Detail
10. Initiative

### Backend

- Node.js backend using only built-in modules
- Server-side question validation
- Server-side scoring
- Reverse scoring for negatively worded questions
- Persistent JSON result storage
- Protected admin API
- CSV export
- Security headers and request validation
- No package installation or database installation required for the demonstration version

## Thinking-preference result

The second questionnaire returns two percentages that always add up to 100%.

Example:

```text
Left preference: 70%
Right preference: 30%
```

In this project:

- Left preference represents analytical, structured, detailed and sequential thinking.
- Right preference represents creative, intuitive, flexible and big-picture thinking.

The popular left-brain/right-brain personality idea is a simplified metaphor and not a neurological diagnosis. The result should be presented as a thinking-preference indicator only.

## Project structure

```text
sponge-global-fullstack-assessment/
├── data/
│   └── results.json
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── admin.html
│   └── admin.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Installation

Install Node.js 18 or later.

No package installation is required. Copy `.env.example` to `.env`.

Windows:

```bash
copy .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Open `.env` and replace the default admin key with a long random value.

Start the server:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

Admin results page:

```text
http://localhost:3000/admin
```

## Add it to an existing website

### Recommended approach

Host this application under a separate subdomain:

```text
assessment.spongeglobal.com
```

Then add a link to the existing website:

```html
<a href="https://assessment.spongeglobal.com">
  Complete employee assessment
</a>
```

### Same-domain path

You can also reverse proxy it through the existing website:

```text
https://spongeglobal.com/employee-assessment/
```

The exact reverse-proxy configuration depends on the existing hosting platform.

## Storage

The demonstration version stores results in:

```text
data/results.json
```

This is suitable for local testing and a small demonstration. For production, replace it with PostgreSQL, MySQL, SQL Server or another managed database.

## Production changes recommended

Before real employee use, add:

- HTTPS
- Company single sign-on
- Role-based admin access
- PostgreSQL or another production database
- Encryption and secure backups
- Privacy notice and employee consent wording
- Data retention and deletion rules
- Audit logging
- Rate limiting
- Validated psychometric questions and norms
- Accessibility and bias testing
- Review by an occupational psychologist
- Review against applicable employment and privacy law

Do not use this demonstration as the sole basis for recruitment, promotion, termination or other formal employment decisions.
