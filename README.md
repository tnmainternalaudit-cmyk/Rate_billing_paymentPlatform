# Rate Billing & Payment Platform (Tano North Municipal Assembly)

This repository now contains a **production-ready baseline database design** for an online municipal revenue billing and payment platform covering:

- Property Rate payers
- Business Operating Rate payers
- Market Store Rent payers

## What is implemented

- `database/schema.sql`
  - Core relational schema for customers, billing accounts, bills, line items, payments, receipts, and notification queue
  - Support for SMS and email bill/receipt workflows
  - Role-aware users for billing, cashier, audit, and admin operations
  - Indexes for common billing, payment, and notification queries

- `database/schema_validation.sql`
  - Minimal validation dataset and query checks to verify that billing, payment, receipt, and notification flows work end-to-end

## Platform alignment with your requirements

- **Online platform support**: schema is designed for a centralized server database accessed over API.
- **Windows desktop compatibility**: can be hosted and operated from Windows-based environments (e.g., SQLite/PostgreSQL deployments and desktop client integrations).
- **Android compatibility**: Android app can consume the same API/database-backed workflows for billing and payments.
- **Customer notifications**: notification queue supports **SMS** and **Email** for bills, reminders, and receipts.

## Quick validation (SQLite)

```bash
sqlite3 /tmp/tnma_billing.db < database/schema.sql
sqlite3 /tmp/tnma_billing.db < database/schema_validation.sql
```

If both commands run successfully, the base database structure is working as expected.
