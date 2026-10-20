# SurveyGlass marketing website + content editor

A responsive, animated marketing website for SurveyGlass with a separate visual content editor. It is built with plain HTML, CSS and JavaScript so it can be hosted on most static web hosts without a build step.

## Included

- `index.html` — public marketing website.
- `editor.html` — separate website content editor.
- `assets/styles.css` — design system, responsive layouts, liquid-glass styling, motion, and editor styles.
- `assets/app.js` — public site renderer, animations, theme toggle, navigation, and email-client-based contact form.
- `assets/site-content.js` — editable default copy and website configuration.
- `assets/editor.js` — content editor with section reorder/show/hide, copy editing, cards/plans/FAQ editing, theme controls, import/export.
- `assets/favicon.svg` — custom SurveyGlass mark.

## Quick start

1. Extract the ZIP.
2. Open `index.html` in a browser to view the site, or serve the folder through a local static web server for best same-origin preview behavior.
3. Open `editor.html` to customise the content.
4. Add your real contact email, phone (optional), and location before publishing.
5. Use **Export publish file** to download `site-content.js`.
6. Replace `assets/site-content.js` in the website project with the exported file.
7. Upload the entire folder to your hosting provider and test the published version on desktop and mobile.

### Local server option

If Python is installed, open a terminal in the extracted folder and run:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080` and `http://localhost:8080/editor.html`.

## Content editor behavior

The editor lets you:
- change the brand name and brand description;
- set contact email/phone/location;
- tune primary and secondary accent colours, glass blur, and motion level;
- edit each section's eyebrow, heading, supporting copy and CTA labels;
- edit, reorder and remove benefit cards, feature cards, workflow steps, FAQ items and pricing plans;
- add new cards/items/plans;
- reorder full sections using drag and drop or the up/down buttons;
- hide/show sections without deleting their content;
- save in the current browser, import/export JSON, and export a publish-ready `site-content.js` file.

## Important publishing limitations

This is a static website starter. The content editor does **not** have server-side authentication or one-click publishing. Browser-local saves are available only in that browser/profile. To publish changes for everyone, export `site-content.js`, replace the bundled file, and redeploy the website. If you need secure admin login, shared edits, media uploads, revision history or one-click publishing, connect a real authenticated CMS/backend.

The contact form validates fields and opens the visitor's default email application using the email address configured in Site Editor. It does not store or send form submissions to a server. For reliable lead capture, connect a form service or backend endpoint and configure spam protection. There is no payment gateway, billing system, customer login, analytics, or purchase flow connected in this starter.

## Claims and launch checklist

- The page's dashboard is an illustrative visual mockup, not live product data.
- Pricing labels are editable placeholders. Confirm features, availability, support terms and pricing before publishing.
- Avoid advertising capabilities as available until they are implemented and tested in the SurveyGlass application.
- Configure a real business contact and privacy/legal information appropriate for your business.
- If hosting `editor.html` publicly, understand that it is not protected by a login. The static editor alone does not provide secure admin access. Remove or protect it when moving to production, or connect it to an authenticated CMS.

## Customisation

Default copy lives in `assets/site-content.js`. The editor export is intended to replace that file. Layout and animation styles live in `assets/styles.css`; rendering logic lives in `assets/app.js`.
