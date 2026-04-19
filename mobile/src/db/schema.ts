export const localTables = {
  Ratepayer: 'id, uniqueRef, fullName, phone, updatedAt',
  Bill: 'id, billNo, totalDue, status, updatedAt',
  Payment: 'id, localId, billId, ratepayerId, amount, method, paidAt, synced',
  Receipt: 'id, paymentId, receiptNo, smsStatus',
  SyncBatch: 'id, deviceId, pushedAt, recordCount, status',
};
