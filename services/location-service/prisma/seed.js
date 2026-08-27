import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const data = [
  { name: "Colombo", code: "COL", areas: [{ name: "Colombo 01", postalCode: "00100" }, { name: "Colombo 03", postalCode: "00300" }, { name: "Maharagama", postalCode: "10280" }, { name: "Kaduwela", postalCode: "10640" }, { name: "Dehiwala", postalCode: "10350" }] },
  { name: "Gampaha", code: "GAM", areas: [{ name: "Gampaha", postalCode: "11000" }, { name: "Negombo", postalCode: "11500" }] },
];
try {
  for (const item of data) {
    const district = await prisma.district.upsert({ where: { code: item.code }, update: { name: item.name }, create: { name: item.name, code: item.code } });
    for (const area of item.areas) await prisma.area.upsert({ where: { districtId_name: { districtId: district.id, name: area.name } }, update: { postalCode: area.postalCode }, create: { ...area, districtId: district.id } });
  }
  const colombo = await prisma.district.findUnique({ where: { code: "COL" } });
  const zones = [{ name: "Colombo Central Zone", description: "Central Colombo responsibility zone", area: "Colombo 01" }, { name: "Colombo South Zone", description: "Southern Colombo responsibility zone", area: "Dehiwala" }, { name: "Kaduwela Service Zone", description: "Kaduwela responsibility zone", area: "Kaduwela" }];
  for (const zone of zones) { const area = await prisma.area.findUnique({ where: { districtId_name: { districtId: colombo.id, name: zone.area } } }); await prisma.serviceZone.upsert({ where: { name: zone.name }, update: { districtId: colombo.id, areaId: area.id, description: zone.description }, create: { name: zone.name, districtId: colombo.id, areaId: area.id, description: zone.description } }); }
  console.log("Location seed complete");
} finally { await prisma.$disconnect(); }
