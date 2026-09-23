/**
 * Shared design tokens for the whole app (storefront, auth, admin, POS).
 *
 * Both visual themes already use the same shape language; these constants
 * document it in one place so new code stays consistent without a redesign:
 * - light storefront theme: emerald + amber on white/stone
 * - dark workspace theme (admin/POS/auth): cyan + slate
 *
 * Shared across themes: rounded-2xl cards/inputs/buttons, pill badges,
 * 44px minimum touch targets, short transitions, visible focus ring
 * (the global :focus-visible rule in app.css).
 */

/** Join class strings, skipping falsy values. */
export function cx(...parts) {
    return parts.filter(Boolean).join(' ');
}

/** Minimum comfortable touch target for pressable elements. */
export const touchTarget = 'min-h-11';

/** Short, subtle transition used for hover/press feedback (no flashy motion). */
export const softTransition = 'transition duration-150 ease-in-out';

/** Card container shape shared by storefront cards and admin panels. */
export const cardRadius = 'rounded-2xl';

/** Pill badge shape shared by status/category labels. */
export const pillBadge = 'rounded-full';

/**
 * Small solid action button for the storefront (e.g. "+ Keranjang").
 * Colors stay in the existing store palette; shape matches the other
 * storefront CTAs (rounded-xl) and the app-wide card radius family.
 */
export const storeActionButton =
    'inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60';
