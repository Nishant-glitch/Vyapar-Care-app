# Vyapar Care Consultancy — Admin Web Panel

Modern, responsive Next.js Admin Web Panel built for **Vyapar Care Consultancy Services** to manage business registrations, legal filings, tax compliance, payments, documents, and customer notifications.

---

## 🌟 Key Features

1. **Executive Dashboard**:
   - 4 Top Stat Cards (Total Applications, Pending Review, Documents Pending, Completed).
   - Live Revenue Metrics (All-time collected, monthly comparison, growth).
   - Unified Recent Activity stream combining all 8 compliance departments.

2. **8 Specialized Service Management Modules**:
   - **GST Registration** (`/dashboard/gst`): Form GST REG-01 scrutiny, promoter KYC, business premises, document checklist, missing doc requests, and 15-digit GSTIN issuance.
   - **PLC Incorporation** (`/dashboard/plc`): MCA SPICe+ tracking, RUN name approvals, Directors DIN/DSC, subscribers shareholding %, and RoC office proofs.
   - **Trademark (TM-A)** (`/dashboard/trademark`): Brand & device mark logo inspection, NICE classes, usage evidence, Form TM-48 power of attorney, and IP India application number tracking.
   - **FSSAI Food License** (`/dashboard/fssai`): FoSCoS portal workflow, Basic/State/Central tier eligibility, food products & capacity, premises water tests, and 14-digit license number issuance.
   - **Import Export Code (IEC)** (`/dashboard/iec`): DGFT e-IEC validation, PFMS bank account pre-validation, export product profiles, and IEC code issuance.
   - **ITR Tax Filing** (`/dashboard/itr`): Assessment year selection, ITR-1 to ITR-4 form recommendation, head-wise income breakdown, deductions, tax computations, and e-filing acknowledgment numbers.
   - **MSME / Udyam** (`/dashboard/udyam`): Micro/Small/Medium enterprise tier evaluation, NIC 2008 4/5-digit activity codes, plant & machinery investment, and Udyam certificate registration numbers.
   - **Other Consultancy Services** (`/dashboard/other`): Custom requirements, urgency timelines, staff assignment, and custom quotes.

3. **Core Administration**:
   - **Orders & Timeline** (`/dashboard/orders`): 2-column detailed workspace with customer info, fee schedules, payment history, timeline tracker, document verifier, admin internal notes, and direct client notification dispatch.
   - **Users & Clients** (`/dashboard/users`): Client directory with cross-service portfolios, orders, payment history, and communication logs.
   - **Financials & Payments** (`/dashboard/payments`): Transaction tracking, reconciliation, success/pending/failed filters, and one-click CSV export.
   - **Notification Center** (`/dashboard/notifications`): Broadcast announcements or target individual clients with preset templates (Payment Reminder, Document Request, Service Update, Application Approved).
   - **Admin Settings** (`/dashboard/settings`): Admin profile, password management, email whitelist manager, and editable service fees table.

4. **Document Viewer Modal**:
   - Interactive modal with zoom in/out/reset for image documents.
   - External tab preview for PDF documents.
   - Inline status updates (Verified, Rejected, Under Review) with remarks input.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router, JavaScript)
- **Styling**: Tailwind CSS with custom palette (Navy `#1B2B5E`, Gold `#C5991A`, Slate `#F5F5F5`)
- **Database / Auth**: `@supabase/supabase-js`, `@supabase/ssr`
- **Date Utilities**: `date-fns`

---

## 🚀 Getting Started

### 1. Environment Setup
Create a `.env.local` file in the root of `vyapar-admin`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://meakrbzjepuournoogoi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

NEXT_PUBLIC_ADMIN_EMAILS=admin@vyaparcare.com,vyaparcareconsultancy@gmail.com
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🔒 Security & Admin Authentication

- Route protection ensures all `/dashboard/*` routes are protected.
- Admin whitelist validation checks that authenticated users match authorized administration emails (`admin@vyaparcare.com`, `vyaparcareconsultancy@gmail.com`).
- Sensitive numbers (PAN, Bank Accounts, Aadhaar) are masked automatically in the UI.
