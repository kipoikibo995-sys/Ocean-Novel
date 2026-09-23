/**
 * CẤU HÌNH ĐƯỜNG LINK SALES PAGE / CHECKOUT CHO CÁC GÓI NÂNG CẤP
 * Bạn có thể dán đường link Sales Page của mình vào các biến dưới đây:
 */

export const SALES_PAGE_CONFIG = {
  // Đường dẫn Sales Page cho gói Pro Edition (Unlimited Studio)
  proSalesUrl: "https://example.com/pro-edition-sales-page", // <-- DÁN LINK SALES PAGE PRO VÀO ĐÂY

  // Đường dẫn Sales Page cho gói Premium Edition (AI Ghostwriter & Continuity)
  premiumSalesUrl: "https://example.com/premium-edition-sales-page", // <-- DÁN LINK SALES PAGE PREMIUM VÀO ĐÂY
};

/**
 * Hàm mở trang Sales Page theo từng gói
 */
export function openSalesPage(tier: 'pro' | 'premium'): void {
  const url = tier === 'pro' ? SALES_PAGE_CONFIG.proSalesUrl : SALES_PAGE_CONFIG.premiumSalesUrl;
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
