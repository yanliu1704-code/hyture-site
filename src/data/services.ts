export interface Tier {
  label: string;
  engagement: string;
  items: string[];
}

export interface ServiceArea {
  id: string;
  number: string;
  name: string;
  blurb: string;
  intro: string;
  tiers: [Tier, Tier, Tier];
}

export const services: ServiceArea[] = [
  {
    id: 'bookkeeping',
    number: '01',
    name: 'Bookkeeping & Financial Management',
    blurb: 'AP/AR, reconciliation, BAS lodgement — clean books, always current.',
    intro: 'Keep your books clean, your cash visible, and your compliance current — on your existing platform (Xero, MYOB or QuickBooks).',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Accounts payable — invoice capture, coding, payment scheduling', 'Accounts receivable — invoicing, tracking, debtor follow-up', 'Bank reconciliation — daily or weekly', 'BAS lodgement — quarterly GST prep and ATO lodgement', 'Chart of accounts maintenance'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Monthly report pack — P&L, balance sheet, aged debtors/creditors', 'Weekly cashflow forecast and shortfall alerts', 'Budget vs actuals tracking', 'Payroll bookkeeping and super reconciliation', 'End-of-year prep and accountant liaison'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Fractional CFO support', 'Board and investor reporting packs', 'Scenario modelling and business case support', 'Custom KPI dashboards', 'Grant and incentive monitoring (R&D, ESIC)'] },
    ],
  },
  {
    id: 'admin',
    number: '02',
    name: 'Administration & Executive Support',
    blurb: 'Inbox, calendar, documents, and the paperwork that used to eat your evenings.',
    intro: 'Free up your calendar, clean up your inbox, and never let paperwork slow down a deal — across Google Workspace, Microsoft 365 and beyond.',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Data entry — CRM, spreadsheets, databases', 'Document prep — formatting, proofreading, version control', 'Digital filing and document management', 'Standard template creation', 'Basic scheduling — bookings and calendar holds'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Full inbox management — triage, drafting, flagging urgent items', 'Diary management — scheduling, prep briefs, follow-up', 'Travel coordination', 'Meeting support — agendas, minutes, action tracking', 'Expense management', 'Contractor and supplier coordination'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Dedicated executive assistant function', 'Project coordination — scope, milestones, stakeholders', 'Custom workflow design and documentation', 'Internal communications', 'Board and AGM preparation support', 'Office management'] },
    ],
  },
  {
    id: 'hr-payroll',
    number: '03',
    name: 'HR & Payroll',
    blurb: 'Payroll, STP, super, Fair Work compliance — handled accurately and on time.',
    intro: 'Stay compliant with Fair Work, keep your people paid accurately and on time, and build the foundations of a great workplace — without an in-house HR team.',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Payroll processing — employees and contractors', 'Single Touch Payroll (STP) lodgement', 'Superannuation processing and SGC compliance', 'Leave entitlement tracking', 'Basic employment contract templates', 'Termination and redundancy calculations'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Onboarding — offer letters, paperwork, Day 1 checklists', 'Offboarding — exit process, final pay, access removal', 'HR documentation — position descriptions, policies, handbook', 'Fair Work compliance monitoring', 'Performance review scheduling', 'Workforce reporting'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Fractional HR Manager function', 'Workforce planning and org design', 'Remuneration benchmarking', 'Culture and engagement programs', 'Performance management frameworks', 'Recruitment coordination'] },
    ],
  },
  {
    id: 'operations',
    number: '04',
    name: 'Operations & Procurement',
    blurb: 'Purchase orders, supplier management, inventory — kept moving.',
    intro: 'Keep your supply chain moving, your costs controlled, and your operational processes running smoothly — without a dedicated ops team.',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Purchase order creation and management', 'Supplier invoice processing and three-way matching', 'Basic inventory tracking', 'Supplier database maintenance', 'Reorder alerts and procurement scheduling'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Supplier relationship management and SLA tracking', 'Spend analysis and cost reporting', 'Procurement workflow design', 'Contract register and renewal tracking', 'Operational reporting', 'Compliance tracking for goods/services'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Fractional Operations Manager', 'Supply chain optimisation', 'Vendor negotiation support', 'Operational process redesign', 'Multi-site or multi-entity coordination'] },
    ],
  },
  {
    id: 'marketing',
    number: '05',
    name: 'Marketing',
    blurb: 'Social, content, campaigns — a consistent presence without an in-house team.',
    intro: 'Maintain a consistent, professional presence — online and offline — and run targeted campaigns that generate leads, without an in-house marketing team.',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Social media scheduling and posting', 'Content calendar management, 4–6 weeks ahead', 'Basic performance reporting', 'Graphic creation from your brand assets', 'Google My Business management'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Content creation — social, blogs, EDMs, web copy', 'Email marketing — campaigns, lists, reporting', 'Basic SEO — on-page, keyword tracking', 'Paid ad management (ad spend billed separately)', 'Campaign coordination', 'Competitor monitoring'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Fractional Marketing Manager', 'Brand development and positioning', 'Full cross-channel campaign strategy', 'Marketing technology stack management', 'Content strategy and thought leadership', 'Referral and partnership programs'] },
    ],
  },
  {
    id: 'customer-service',
    number: '06',
    name: 'Customer Service',
    blurb: 'Tickets, live chat, phone overflow — fast, on-brand, always covered.',
    intro: 'Deliver fast, consistent, professional customer experiences — backed by AI-assisted tooling and a human team that represents your business the way you would.',
    tiers: [
      { label: 'L1 — CORE', engagement: 'Monthly subscription, cancel anytime', items: ['Email and helpdesk ticket management', 'Template-based FAQ responses', 'CRM data entry and interaction logging', 'Basic escalation handling', 'Response within agreed SLA (typically 4–8 hrs)'] },
      { label: 'L2 — ADVANCED', engagement: 'Onboarding consult, 3-month minimum', items: ['Everything in L1', 'Live chat support on your existing platform', 'Phone overflow support in your business name', 'CRM management — pipeline, follow-up, reporting', 'Complaint resolution workflows', 'Post-sale follow-up and review sequences', 'Monthly reporting — volume, SLA, satisfaction'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, 6-month minimum', items: ['Everything in L1 & L2', 'Customer success program — outreach, renewals, upsell', 'Voice of Customer program — NPS, insight reporting', 'Customer retention strategy', 'End-to-end journey mapping', 'Knowledge base and self-service portal', 'CX technology review'] },
    ],
  },
  {
    id: 'systems',
    number: '07',
    name: 'Systems & Project Management',
    blurb: 'Migrations, new tools, complex initiatives — led from scoping to go-live.',
    intro: "Whether you're changing platforms, building new processes, or managing a complex initiative — structured, experienced project leadership so your business doesn't miss a beat.",
    tiers: [
      { label: 'L1 — CORE', engagement: 'Project-based quote or monthly retainer', items: ['Basic system configuration and setup', 'Data migration support', 'Software evaluation support', 'User training material preparation', 'Scoped to a single system or short-term project'] },
      { label: 'L2 — ADVANCED', engagement: 'Consulting to scope, then milestone-based', items: ['Everything in L1', 'Full system migration project management', 'Process mapping and redesign', 'Change management and training delivery', 'Multi-vendor coordination', 'Post-launch support', 'Project governance — status, risk, issues'] },
      { label: 'L3 — STRATEGIC', engagement: 'Custom solution design, milestone + retainer', items: ['Everything in L1 & L2', 'End-to-end digital transformation leadership', 'Technology roadmap development', 'Multi-system integration and automation design', 'Vendor selection and negotiation', 'Ongoing optimisation retainer', 'Business continuity planning'] },
    ],
  },
];
