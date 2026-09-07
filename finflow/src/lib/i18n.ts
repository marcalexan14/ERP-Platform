export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export function isRtl(locale: string): boolean {
  return locale === "ar";
}

const dictionary = {
  // Sidebar / shell
  nav_dashboard: { en: "Dashboard", ar: "لوحة التحكم" },
  nav_invoices: { en: "Invoices", ar: "الفواتير" },
  nav_expenses: { en: "Expenses", ar: "المصروفات" },
  nav_recurring: { en: "Recurring", ar: "المتكررة" },
  nav_reports: { en: "Reports", ar: "التقارير" },
  nav_clients: { en: "Clients", ar: "العملاء" },
  nav_settings: { en: "Settings", ar: "الإعدادات" },
  sign_out: { en: "Sign out", ar: "تسجيل الخروج" },
  signed_in_as: { en: "Signed in as", ar: "تم تسجيل الدخول باسم" },

  // Dashboard home
  dashboard_title: { en: "Dashboard", ar: "لوحة التحكم" },
  dashboard_subtitle: { en: "Overview of {org}'s finances", ar: "نظرة عامة على أوضاع {org} المالية" },
  kpi_revenue: { en: "Revenue", ar: "الإيرادات" },
  kpi_expenses: { en: "Expenses", ar: "المصروفات" },
  kpi_net_profit: { en: "Net Profit", ar: "صافي الربح" },
  kpi_outstanding: { en: "Outstanding Invoices", ar: "الفواتير المستحقة" },
  kpi_no_prior_data: { en: "No prior data", ar: "لا توجد بيانات سابقة" },
  kpi_vs_last_month: { en: "vs last month", ar: "مقارنة بالشهر الماضي" },
  chart_revenue_vs_expenses: { en: "Revenue vs. Expenses", ar: "الإيرادات مقابل المصروفات" },
  chart_expense_breakdown: { en: "Expense breakdown", ar: "تفصيل المصروفات" },
  chart_total: { en: "Total", ar: "الإجمالي" },
  chart_no_transactions: {
    en: "No transactions yet — add an expense or income entry to see trends here.",
    ar: "لا توجد معاملات بعد — أضف مصروفًا أو إيرادًا لعرض الاتجاهات هنا.",
  },
  chart_no_expenses: {
    en: "No expenses yet — categorized spending will show up here.",
    ar: "لا توجد مصروفات بعد — ستظهر النفقات المصنّفة هنا.",
  },

  // Common
  save: { en: "Save", ar: "حفظ" },
  optional: { en: "Optional", ar: "اختياري" },
  select_client: { en: "Select a client", ar: "اختر عميلاً" },
  view: { en: "View", ar: "عرض" },
  add_line: { en: "Add line", ar: "إضافة سطر" },
  notes: { en: "Notes", ar: "ملاحظات" },
  description: { en: "Description", ar: "الوصف" },
  amount_usd: { en: "Amount (USD)", ar: "المبلغ (دولار)" },
  client: { en: "Client", ar: "العميل" },
  type: { en: "Type", ar: "النوع" },
  status_draft: { en: "DRAFT", ar: "مسودة" },
  status_sent: { en: "SENT", ar: "مُرسلة" },
  status_paid: { en: "PAID", ar: "مدفوعة" },
  status_overdue: { en: "OVERDUE", ar: "متأخرة" },
  status_void: { en: "VOID", ar: "ملغاة" },
  status_expense: { en: "EXPENSE", ar: "مصروف" },
  status_income: { en: "INCOME", ar: "إيراد" },
  status_invoice: { en: "INVOICE", ar: "فاتورة" },
  freq_weekly: { en: "Weekly", ar: "أسبوعي" },
  freq_monthly: { en: "Monthly", ar: "شهري" },
  freq_quarterly: { en: "Quarterly", ar: "ربع سنوي" },
  freq_yearly: { en: "Yearly", ar: "سنوي" },

  // Invoices
  invoices_title: { en: "Invoices", ar: "الفواتير" },
  invoices_subtitle: {
    en: "Bill your clients and track what's outstanding",
    ar: "أرسل فواتير لعملائك وتتبّع المستحقات",
  },
  invoices_new: { en: "New invoice", ar: "فاتورة جديدة" },
  invoices_due_date: { en: "Due date", ar: "تاريخ الاستحقاق" },
  invoices_line_items: { en: "Line items", ar: "بنود الفاتورة" },
  invoices_description_placeholder: { en: "Description", ar: "الوصف" },
  invoices_qty_placeholder: { en: "Qty", ar: "الكمية" },
  invoices_price_placeholder: { en: "Price", ar: "السعر" },
  invoices_create_send: { en: "Create & send invoice", ar: "إنشاء الفاتورة وإرسالها" },
  invoices_all: { en: "All invoices", ar: "جميع الفواتير" },
  invoices_col_number: { en: "Number", ar: "الرقم" },
  invoices_col_client: { en: "Client", ar: "العميل" },
  invoices_col_status: { en: "Status", ar: "الحالة" },
  invoices_col_due: { en: "Due", ar: "الاستحقاق" },
  invoices_col_total: { en: "Total", ar: "الإجمالي" },
  invoices_col_action: { en: "Action", ar: "الإجراء" },
  invoices_mark_paid: { en: "Mark paid", ar: "تحديد كمدفوعة" },
  invoices_undo_paid: { en: "Undo payment", ar: "التراجع عن الدفع" },
  invoices_empty: { en: "No invoices yet.", ar: "لا توجد فواتير بعد." },
  invoices_add_client_first: {
    en: "Add a client first before creating an invoice — see the Clients page.",
    ar: "أضف عميلاً أولاً قبل إنشاء فاتورة — راجع صفحة العملاء.",
  },
  invoices_clients_link: { en: "Clients", ar: "العملاء" },

  // Expenses
  expenses_title: { en: "Expenses & Income", ar: "المصروفات والإيرادات" },
  expenses_subtitle: {
    en: "Track money in and out — each entry posts to your ledger automatically",
    ar: "تتبّع الأموال الداخلة والخارجة — يُسجَّل كل إدخال في دفتر الأستاذ تلقائيًا",
  },
  expenses_add_entry: { en: "Add entry", ar: "إضافة إدخال" },
  expenses_category: { en: "Category", ar: "الفئة" },
  expenses_category_placeholder: { en: "e.g. Software", ar: "مثال: برمجيات" },
  expenses_description_placeholder: { en: "Optional note", ar: "ملاحظة اختيارية" },
  expenses_receipt: { en: "Receipt", ar: "الإيصال" },
  expenses_recent_activity: { en: "Recent activity", ar: "النشاط الأخير" },
  expenses_col_date: { en: "Date", ar: "التاريخ" },
  expenses_col_type: { en: "Type", ar: "النوع" },
  expenses_col_category: { en: "Category", ar: "الفئة" },
  expenses_col_description: { en: "Description", ar: "الوصف" },
  expenses_col_receipt: { en: "Receipt", ar: "الإيصال" },
  expenses_col_amount: { en: "Amount", ar: "المبلغ" },
  expenses_empty: { en: "No entries yet.", ar: "لا توجد إدخالات بعد." },

  // Recurring
  recurring_title: { en: "Recurring", ar: "المعاملات المتكررة" },
  recurring_subtitle: {
    en: "Bills and subscriptions that repeat automatically",
    ar: "فواتير واشتراكات تتكرر تلقائيًا",
  },
  recurring_run_due_now: { en: "Run due now", ar: "تشغيل المستحق الآن" },
  recurring_new_rule: { en: "New recurring rule", ar: "قاعدة متكررة جديدة" },
  recurring_frequency: { en: "Frequency", ar: "التكرار" },
  recurring_starts: { en: "Starts", ar: "تبدأ في" },
  recurring_description_placeholder: { en: "e.g. Hosting subscription", ar: "مثال: اشتراك الاستضافة" },
  recurring_add_rule: { en: "Add recurring rule", ar: "إضافة قاعدة متكررة" },
  recurring_all_rules: { en: "All rules", ar: "جميع القواعد" },
  recurring_col_type: { en: "Type", ar: "النوع" },
  recurring_col_description: { en: "Description", ar: "الوصف" },
  recurring_col_frequency: { en: "Frequency", ar: "التكرار" },
  recurring_col_next_run: { en: "Next run", ar: "التشغيل التالي" },
  recurring_col_amount: { en: "Amount", ar: "المبلغ" },
  recurring_col_status: { en: "Status", ar: "الحالة" },
  recurring_pause: { en: "Pause", ar: "إيقاف مؤقت" },
  recurring_resume: { en: "Resume", ar: "استئناف" },
  recurring_empty: { en: "No recurring rules yet.", ar: "لا توجد قواعد متكررة بعد." },

  // Reports
  reports_title: { en: "Reports", ar: "التقارير" },
  reports_subtitle: {
    en: "Generated live from your ledger — all activity to date",
    ar: "تُنشأ مباشرة من دفتر الأستاذ — لكل النشاط حتى الآن",
  },
  reports_tab_pnl: { en: "Profit & Loss", ar: "الأرباح والخسائر" },
  reports_tab_balance: { en: "Balance Sheet", ar: "الميزانية العمومية" },
  reports_tab_cashflow: { en: "Cash Flow", ar: "التدفق النقدي" },
  reports_revenue: { en: "Revenue", ar: "الإيرادات" },
  reports_expenses: { en: "Expenses", ar: "المصروفات" },
  reports_total_revenue: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
  reports_total_expenses: { en: "Total Expenses", ar: "إجمالي المصروفات" },
  reports_net_income: { en: "Net Income", ar: "صافي الدخل" },
  reports_assets: { en: "Assets", ar: "الأصول" },
  reports_liabilities: { en: "Liabilities", ar: "الخصوم" },
  reports_equity: { en: "Equity", ar: "حقوق الملكية" },
  reports_total_assets: { en: "Total Assets", ar: "إجمالي الأصول" },
  reports_total_liabilities: { en: "Total Liabilities", ar: "إجمالي الخصوم" },
  reports_total_equity: { en: "Total Equity", ar: "إجمالي حقوق الملكية" },
  reports_retained_earnings: { en: "Retained Earnings (Net Income)", ar: "الأرباح المحتجزة (صافي الدخل)" },
  reports_liabilities_plus_equity: {
    en: "Liabilities + Equity",
    ar: "الخصوم + حقوق الملكية",
  },
  reports_no_cash_activity: { en: "No cash activity yet.", ar: "لا يوجد نشاط نقدي بعد." },
  reports_net_change_cash: { en: "Net Change in Cash", ar: "صافي التغير في النقد" },

  // Clients
  clients_title: { en: "Clients", ar: "العملاء" },
  clients_subtitle: { en: "Who you bill", ar: "من تُصدر لهم الفواتير" },
  clients_add: { en: "Add client", ar: "إضافة عميل" },
  clients_name: { en: "Name", ar: "الاسم" },
  clients_email: { en: "Email", ar: "البريد الإلكتروني" },
  clients_address: { en: "Address", ar: "العنوان" },
  clients_all: { en: "All clients", ar: "جميع العملاء" },
  clients_empty: { en: "No clients yet.", ar: "لا يوجد عملاء بعد." },

  // Settings
  settings_title: { en: "Settings", ar: "الإعدادات" },
  settings_language: { en: "Language", ar: "اللغة" },
  settings_language_desc: {
    en: "Choose the display language for this organization's dashboard.",
    ar: "اختر لغة العرض للوحة تحكم هذه المؤسسة.",
  },

  // Standard chart-of-accounts display names (seeded in English; shown translated here)
  account_cash: { en: "Cash", ar: "النقدية" },
  account_accounts_receivable: { en: "Accounts Receivable", ar: "الذمم المدينة" },
  account_accounts_payable: { en: "Accounts Payable", ar: "الذمم الدائنة" },
  account_owners_equity: { en: "Owner's Equity", ar: "حقوق المالك" },
  account_sales_revenue: { en: "Sales Revenue", ar: "إيرادات المبيعات" },
  account_general_expenses: { en: "General Expenses", ar: "مصروفات عامة" },
} satisfies Record<string, Record<Locale, string>>;

export type TranslationKey = keyof typeof dictionary;

export function getTranslator(locale: string) {
  const resolved: Locale = LOCALES.includes(locale as Locale) ? (locale as Locale) : "en";
  return function t(key: TranslationKey, vars?: Record<string, string>) {
    let text = dictionary[key][resolved];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{${k}}`, v);
      }
    }
    return text;
  };
}

// Maps a seeded standard account's code to its translation key, so reports
// can show translated names for system accounts while leaving user-created
// accounts/categories/clients in whatever language the user typed them.
const STANDARD_ACCOUNT_KEYS: Record<string, TranslationKey> = {
  "1000": "account_cash",
  "1100": "account_accounts_receivable",
  "2000": "account_accounts_payable",
  "3000": "account_owners_equity",
  "4000": "account_sales_revenue",
  "5000": "account_general_expenses",
};

export function translateAccountName(locale: string, code: string, fallbackName: string) {
  const key = STANDARD_ACCOUNT_KEYS[code];
  if (!key) return fallbackName;
  return getTranslator(locale)(key);
}
