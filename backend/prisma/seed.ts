import { PrismaClient, RatepayerType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@tnma.gov.gh' },
    update: {},
    create: {
      email: 'admin@tnma.gov.gh',
      passwordHash: adminPassword,
      fullName: 'System Administrator',
      role: UserRole.ADMIN,
      isActive: true,
      createdBy: 'seed',
      updatedBy: 'seed',
    },
  });

  const zones = ['Duayaw Nkwanta Central', 'Bomaa', 'Yamfo'];
  const zoneRecords = [] as { id: string; name: string }[];
  for (const name of zones) {
    zoneRecords.push(
      await prisma.zone.upsert({
        where: { name },
        update: {},
        create: { name, createdBy: admin.id, updatedBy: admin.id },
      }),
    );
  }

  const period = await prisma.billingPeriod.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-12-31T23:59:59Z'),
      status: 'OPEN',
      createdBy: admin.id,
      updatedBy: admin.id,
    },
  });

  const makeRef = (prefix: string, idx: number) => `${prefix}-${String(idx).padStart(4, '0')}`;
  let index = 1;
  for (const t of [RatepayerType.PROPERTY, RatepayerType.BUSINESS, RatepayerType.MARKET_STORE]) {
    for (let i = 0; i < 5; i++) {
      const uniqueRef = makeRef(t.slice(0, 3), index++);
      const zone = zoneRecords[i % zoneRecords.length];
      const rp = await prisma.ratepayer.upsert({
        where: { uniqueRef },
        update: {},
        create: {
          uniqueRef,
          type: t,
          fullName: `${t} Ratepayer ${i + 1}`,
          phone: `+23324${String(100000 + i).padStart(6, '0')}`,
          email: `payer${i + 1}.${t.toLowerCase()}@example.com`,
          address: `Area ${i + 1}`,
          zoneId: zone.id,
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      });

      if (t === RatepayerType.PROPERTY) {
        await prisma.property.create({
          data: {
            ratepayerId: rp.id,
            propertyNo: `PR-${i + 1}`,
            location: `Location ${i + 1}`,
            useType: 'Residential',
            ratableValue: 1000 + i * 100,
            rateImpost: 10,
            createdBy: admin.id,
            updatedBy: admin.id,
          },
        });
      }

      if (t === RatepayerType.BUSINESS) {
        await prisma.business.create({
          data: {
            ratepayerId: rp.id,
            businessName: `Business ${i + 1}`,
            businessType: 'Retail',
            category: 'B',
            annualFee: 500 + i * 50,
            createdBy: admin.id,
            updatedBy: admin.id,
          },
        });
      }

      if (t === RatepayerType.MARKET_STORE) {
        await prisma.marketStore.create({
          data: {
            ratepayerId: rp.id,
            marketName: 'Duayaw Market',
            storeNo: `S-${i + 1}`,
            monthlyRent: 120,
            createdBy: admin.id,
            updatedBy: admin.id,
          },
        });
      }

      await prisma.bill.create({
        data: {
          billNo: `BILL-${period.year}-${uniqueRef}`,
          ratepayerId: rp.id,
          billingPeriodId: period.id,
          principal: 300,
          arrears: 50,
          totalDue: 350,
          status: 'UNPAID',
          issuedAt: new Date(),
          createdBy: admin.id,
          updatedBy: admin.id,
        },
      });
    }
  }

  console.log('Seed complete. Dev admin: admin@tnma.gov.gh / Admin@123 (dev-only)');
}

main().finally(async () => {
  await prisma.$disconnect();
});
