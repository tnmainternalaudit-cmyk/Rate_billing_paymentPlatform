PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_user (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'billing_officer', 'cashier', 'auditor')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer (
    customer_id TEXT PRIMARY KEY,
    customer_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    preferred_channel TEXT NOT NULL DEFAULT 'sms' CHECK (preferred_channel IN ('sms', 'email', 'both')),
    postal_address TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS property_rate_account (
    property_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    property_number TEXT NOT NULL UNIQUE,
    digital_address TEXT,
    property_use TEXT,
    valuation_amount NUMERIC NOT NULL DEFAULT 0,
    annual_rate NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE IF NOT EXISTS business_operating_account (
    business_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    business_name TEXT NOT NULL,
    permit_number TEXT NOT NULL UNIQUE,
    business_type TEXT,
    annual_license_fee NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE IF NOT EXISTS market_store_account (
    store_account_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    market_name TEXT NOT NULL,
    store_number TEXT NOT NULL,
    rent_frequency TEXT NOT NULL CHECK (rent_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    rent_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (market_name, store_number),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE IF NOT EXISTS bill (
    bill_id TEXT PRIMARY KEY,
    bill_number TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    bill_type TEXT NOT NULL CHECK (bill_type IN ('property_rate', 'business_operating_rate', 'market_store_rent')),
    account_reference_id TEXT NOT NULL,
    billing_period_start TEXT NOT NULL,
    billing_period_end TEXT NOT NULL,
    due_date TEXT NOT NULL,
    subtotal_amount NUMERIC NOT NULL,
    penalty_amount NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_paid', 'paid', 'cancelled', 'overdue')),
    issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    issued_by TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (issued_by) REFERENCES app_user(user_id)
);

CREATE TABLE IF NOT EXISTS bill_line_item (
    line_item_id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    item_description TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_amount NUMERIC NOT NULL,
    line_total NUMERIC NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bill(bill_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment (
    payment_id TEXT PRIMARY KEY,
    payment_reference TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    payment_date TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank', 'mobile_money', 'card', 'cheque')),
    amount_received NUMERIC NOT NULL,
    currency_code TEXT NOT NULL DEFAULT 'GHS',
    recorded_by TEXT NOT NULL,
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (recorded_by) REFERENCES app_user(user_id)
);

CREATE TABLE IF NOT EXISTS payment_allocation (
    allocation_id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    bill_id TEXT NOT NULL,
    amount_allocated NUMERIC NOT NULL,
    allocated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE CASCADE,
    FOREIGN KEY (bill_id) REFERENCES bill(bill_id),
    UNIQUE (payment_id, bill_id)
);

CREATE TABLE IF NOT EXISTS receipt (
    receipt_id TEXT PRIMARY KEY,
    receipt_number TEXT NOT NULL UNIQUE,
    payment_id TEXT NOT NULL UNIQUE,
    customer_id TEXT NOT NULL,
    issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_sms INTEGER NOT NULL DEFAULT 0 CHECK (sent_sms IN (0, 1)),
    sent_email INTEGER NOT NULL DEFAULT 0 CHECK (sent_email IN (0, 1)),
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id),
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id)
);

CREATE TABLE IF NOT EXISTS notification_queue (
    notification_id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    related_bill_id TEXT,
    related_receipt_id TEXT,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
    notification_type TEXT NOT NULL CHECK (notification_type IN ('bill', 'receipt', 'reminder')),
    destination TEXT NOT NULL,
    subject TEXT,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sent_at TEXT,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (related_bill_id) REFERENCES bill(bill_id),
    FOREIGN KEY (related_receipt_id) REFERENCES receipt(receipt_id)
);

CREATE INDEX IF NOT EXISTS idx_bill_customer_status ON bill(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_customer_date ON payment(customer_id, payment_date);
CREATE INDEX IF NOT EXISTS idx_notification_status_channel ON notification_queue(status, channel);
