
import 'server-only';

export const STRIPE_PRICES = {
    oneWeek: process.env.STRIPE_ONE_WEEK_PRICE_ID || '',
    oneMonth: process.env.STRIPE_ONE_MONTH_PRICE_ID || '',
};
