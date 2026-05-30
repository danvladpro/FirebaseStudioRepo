
import 'server-only';

export const STRIPE_PRICES = {
    oneWeek: process.env.STRIPE_ONE_WEEK_PRICE_ID || '',
    lifetime: process.env.STRIPE_LIFETIME_PRICE_ID || '',
};
