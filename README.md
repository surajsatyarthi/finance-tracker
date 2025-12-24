# Professional Finance Tracker

A production-ready, bank-grade personal finance application built with **Next.js 15**, **Supabase**, and **Tailwind CSS v4**.
This application provides a secure, real-time dashboard for tracking assets, liabilities, transactions, and financial goals.

**Current Status:** 🟢 **READY FOR PRODUCTION**

## 🚀 Key Features

### 📊 Comprehensive Dashboard
- **Net Worth Tracking**: Real-time calculation of Assets vs. Liabilities.
- **Financial Health Ratios**: Savings Rate, Debt Service Ratio, Liquidity Ratio.
- **Projections**: 3-month cash flow forecasting and budget analysis.

### 💰 Transaction Management
- **Full CRUD Operations**: Add, edit, delete income and expenses.
- **Smart Categorization**: Separation of Business vs. Personal finances.
- **Filtering**: Advanced search and filtering by type (Income/Expense).

### 🛡️ Enterprise-Grade Security
- **Authentication**: Secure user management via Supabase Auth.
- **Row Level Security (RLS)**: Strict data isolation ensuring users only see their own data.
- **Audit Logging**: Comprehensive tracking of all financial changes.
- **Validation**: Server-side validation for all inputs.

## 🛠️ Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Visualization**: Recharts for dynamic financial charts
- **Type Safety**: Fully typed with TypeScript

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- A Supabase project (referenced in `local` or `production` environment)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd finance-tracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file with your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📦 Deployment

This application is optimized for deployment on **Vercel**.

1.  Connect your GitHub repository to Vercel.
2.  Add the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in the Vercel dashboard.
3.  Deploy!

## 🔐 Security & Privacy
- **Local Mode**: Can be run in offline/local mode by setting `NEXT_PUBLIC_LOCAL_MODE=true` (Data will not persist between sessions).
- **Production Mode**: Uses Supabase for secure, persistent, encrypted cloud storage.

## 📂 Project Structure

To keep the project clean and maintainable, files are organized as follows:

*   **`src/`**: Application source code (Next.js App Router, components, lib).
*   **`supabase/migrations/`**: All SQL migration files and database queries.
*   **`scripts/`**: Utility scripts (Python, Node.js) for data migration, verification, and icons.
*   **`docs/`**: Project documentation, guides, and reports.
*   **`public/`**: Static assets like images and manifest files.
