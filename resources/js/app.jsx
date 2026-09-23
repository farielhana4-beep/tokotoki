import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'TOKOTOKI';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#22d3ee',
    },
});

// A 419 means the CSRF token / session is stale (expired session, session
// storage reset, token rotated in another tab). Inertia renders its error
// modal for such non-Inertia responses and leaves the page stuck, so refresh
// once to obtain a fresh session + token instead.
if (typeof document !== 'undefined') {
    document.addEventListener('inertia:invalid', (event) => {
        if (event?.detail?.response?.status === 419) {
            event.preventDefault();
            window.location.reload();
        }
    });
}
