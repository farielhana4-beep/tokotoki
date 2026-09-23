import { usePage } from '@inertiajs/react';

const DEFAULTS = {
    name: 'TOKOTOKI',
    shortDescription: 'Toko Kerajinan & Dekorasi',
    tagline: 'Kerajinan kecil, dekorasi yang berarti.',
    description:
        'TOKOTOKI adalah toko kerajinan dan dekorasi yang menyediakan berbagai produk untuk melengkapi kebutuhan dekorasi, aksesoris, perlengkapan rumah, dan souvenir.',
    logoUrl: null,
    whatsapp: '',
    email: '',
    location: '',
    instagram: '',
    tiktok: '',
};

/**
 * Single source of storefront branding.
 *
 * Values come from Settings (branding group) and are shared to every Inertia
 * page via HandleInertiaRequests. To rename the store, change the tagline,
 * or update contacts, edit Super Admin → Settings once — no code changes
 * needed.
 */
export function useBrand() {
    const { settings } = usePage().props;
    const branding = settings?.branding ?? {};

    const whatsapp = branding.store_whatsapp || DEFAULTS.whatsapp;

    return {
        name: branding.app_name || DEFAULTS.name,
        shortDescription: branding.store_short_description || DEFAULTS.shortDescription,
        tagline: branding.store_tagline || DEFAULTS.tagline,
        description: branding.store_description || DEFAULTS.description,
        logoUrl: branding.logo_url || DEFAULTS.logoUrl,
        logoAlt: `Logo ${branding.app_name || DEFAULTS.name} - Toko Kerajinan dan Dekorasi`,
        whatsapp,
        whatsappUrl: whatsapp ? `https://wa.me/${normalizeWhatsapp(whatsapp)}` : '',
        email: branding.store_email || DEFAULTS.email,
        location: branding.store_location || DEFAULTS.location,
        instagram: branding.store_instagram || DEFAULTS.instagram,
        tiktok: branding.store_tiktok || DEFAULTS.tiktok,
    };
}

/**
 * Normalize an Indonesian WhatsApp number to the digit format wa.me expects.
 * Accepts inputs like 0812-3456-7890, +62812..., 62812..., or with spaces.
 */
export function normalizeWhatsapp(number) {
    const digits = String(number ?? '').replace(/\D/g, '');

    if (digits.startsWith('0')) {
        return `62${digits.slice(1)}`;
    }

    return digits;
}
