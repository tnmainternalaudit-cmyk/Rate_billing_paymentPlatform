PRAGMA foreign_keys = ON;

INSERT INTO app_user(user_id, full_name, email, role)
VALUES ('usr-001', 'System Admin', 'admin@tnma.gov.gh', 'admin');

INSERT INTO customer(customer_id, customer_code, full_name, phone_number, email, preferred_channel)
VALUES ('cus-001', 'TNMA-C-0001', 'Kwame Mensah', '+233200000001', 'kwame@example.com', 'both');

INSERT INTO property_rate_account(property_account_id, customer_id, property_number, digital_address, annual_rate)
VALUES ('prop-001', 'cus-001', 'PROP-1001', 'BA-123-4567', 1200.00);

INSERT INTO bill(
    bill_id, bill_number, customer_id, bill_type, account_reference_id,
    billing_period_start, billing_period_end, due_date,
    subtotal_amount, penalty_amount, total_amount, issued_by
) VALUES (
    'bill-001', 'BILL-2026-0001', 'cus-001', 'property_rate', 'prop-001',
    '2026-01-01', '2026-12-31', '2026-06-30',
    1200.00, 0.00, 1200.00, 'usr-001'
);

INSERT INTO bill_line_item(line_item_id, bill_id, item_description, quantity, unit_amount, line_total)
VALUES ('line-001', 'bill-001', 'Annual property rate', 1, 1200.00, 1200.00);

INSERT INTO payment(payment_id, payment_reference, customer_id, payment_date, payment_method, amount_received, recorded_by)
VALUES ('pay-001', 'PAY-2026-0001', 'cus-001', '2026-05-15', 'mobile_money', 1200.00, 'usr-001');

INSERT INTO payment_allocation(allocation_id, payment_id, bill_id, amount_allocated)
VALUES ('alloc-001', 'pay-001', 'bill-001', 1200.00);

INSERT INTO receipt(receipt_id, receipt_number, payment_id, customer_id, sent_sms, sent_email)
VALUES ('rcp-001', 'RCP-2026-0001', 'pay-001', 'cus-001', 1, 1);

INSERT INTO notification_queue(
    notification_id, customer_id, related_bill_id, related_receipt_id,
    channel, notification_type, destination, subject, message_body, status, sent_at
) VALUES (
    'ntf-001', 'cus-001', 'bill-001', NULL,
    'sms', 'bill', '+233200000001', NULL, 'Your rate bill BILL-2026-0001 is ready.', 'sent', CURRENT_TIMESTAMP
), (
    'ntf-002', 'cus-001', NULL, 'rcp-001',
    'email', 'receipt', 'kwame@example.com', 'Payment Receipt RCP-2026-0001', 'Thank you for your payment.', 'sent', CURRENT_TIMESTAMP
);

SELECT bill_number, total_amount, status
FROM bill
WHERE customer_id = 'cus-001';

SELECT receipt_number, sent_sms, sent_email
FROM receipt
WHERE customer_id = 'cus-001';
