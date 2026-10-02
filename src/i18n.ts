const EN: Record<string, string> = {
  'হোম': 'Home',
  'আয়-ব্যয়': 'Finance',
  'চ্যাট': 'Chat',
  'ড্যাশবোর্ড': 'Dashboard',
  'লগইন': 'Login',
  'অ্যাডমিন': 'Admin',
  'মেনু': 'Menu',
  'দান করুন': 'Donate',
  'অনুদানের খাত': 'Donation Funds',
  'খাত খতিয়ান': 'Fund Ledger',
  'স্বচ্ছ আয়-ব্যয়': 'Transparent Accounts',
  'স্বেচ্ছাসেবক ও দায়িত্ব': 'Volunteers & Duties',
  'সদস্য ড্যাশবোর্ড': 'Member Dashboard',
  'লাইভ চ্যাট': 'Live Chat',
  'সাহায্য ম্যাপ': 'Relief Map',
  'সাম্প্রতিক কাজ ও প্রমাণ': 'Recent Work & Proof',
  'রক্তদান SOS': 'Blood Donation SOS',
  'নোটিশ': 'Notices',
  'গ্যালারি': 'Gallery',
  'সদস্য হওয়ার আবেদন': 'Apply for Membership',
  'অ্যাডমিন প্যানেল': 'Admin Panel',
  'নোটিফিকেশন': 'Notifications',
  'কোনো নোটিফিকেশন নেই': 'No notifications',
  'অনুদান পাঠানোর মাধ্যম': 'Ways to donate',
  'বন্ধ করুন': 'Close',
  'সব পেজ ও ফিচার': 'All pages & features',
  'লিংক কপি হয়েছে': 'Link copied',
  'লগআউট': 'Logout',
  'আয়-ব্যয় দেখুন': 'View accounts',
  'এই পেজটি পরের ধাপে যুক্ত হবে।': 'This page will be added in the next step.',
}

export const getLang = (): string => {
  try { return localStorage.getItem('lang') || 'bn' } catch { return 'bn' }
}
export const setLang = (l: string) => {
  try { localStorage.setItem('lang', l) } catch {}
}
export const t = (s: string): string => (getLang() === 'en' ? EN[s] || s : s)
