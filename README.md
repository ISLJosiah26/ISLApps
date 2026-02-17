# Recruitment Social Ad Generator

A simple web app to generate branded recruitment post graphics in **portrait** or **landscape** PNG format.

## Features

- Enter only:
  - Job title
  - Location
  - Contact name
- Select orientation:
  - Portrait (1080x1350)
  - Landscape (1200x628)
- Export as PNG in one click.
- Styling and canvas text are configured to use **Gotham** font (with fallbacks if Gotham is unavailable on the machine).
- Layout follows the supplied blue wave Integrated Staffing-style format.

## Usage

1. Open `index.html` in a browser.
2. Fill in the three fields.
3. Select portrait or landscape.
4. Click **Download PNG**.

## Customisation

Update these in `app.js`:

- `brand.company`
- `brand.website`
- `brand.colours`
- `sizes` for output dimensions
