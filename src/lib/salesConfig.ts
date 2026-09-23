/**
 * SALES PAGE & CHECKOUT URL CONFIGURATION FOR UPGRADE TIERS
 * You can paste your WarriorPlus checkout / sales page links into the variables below:
 */

export const SALES_PAGE_CONFIG = {
  // Sales Page / Checkout URL for Pro Edition (Unlimited Studio)
  proSalesUrl: "https://example.com/pro-edition-sales-page", // <-- PASTE PRO SALES PAGE LINK HERE

  // Sales Page / Checkout URL for Premium Edition (AI Ghostwriter & Continuity)
  premiumSalesUrl: "https://example.com/premium-edition-sales-page", // <-- PASTE PREMIUM SALES PAGE LINK HERE
};

/**
 * Open sales page in a new window/tab for the designated tier
 */
export function openSalesPage(tier: 'pro' | 'premium'): void {
  const url = tier === 'pro' ? SALES_PAGE_CONFIG.proSalesUrl : SALES_PAGE_CONFIG.premiumSalesUrl;
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

