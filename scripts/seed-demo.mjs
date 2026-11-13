// Local Docker Compose demo data. Run: node scripts/seed-demo.mjs
// Stable IDs and create-only upserts make reruns safe for existing records.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('..', import.meta.url));
function run(service, code) {
  const result = spawnSync('docker', ['compose', 'exec', '-T', service, 'node', '--input-type=module'], {
    cwd, encoding: 'utf8', input: code, maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || String(result.error));
  const line = result.stdout.split('\n').find(line => line.startsWith('DEMO_RESULT:'));
  return line ? JSON.parse(line.slice(12)) : null;
}
function db(service, code) {
  return run(service, `import { PrismaClient } from '@prisma/client';
    const p = new PrismaClient();
    try { ${code} } finally { await p.$disconnect(); }`);
}
const emit = value => `console.log('DEMO_RESULT:' + JSON.stringify(${value}));`;
const identity = db('auth-service', `
  const admin = await p.user.findFirst({where:{role:'ADMIN'}});
  if (!admin) throw new Error('An existing administrator is required.');
  const {randomBytes} = await import('node:crypto');
  const bcrypt = (await import('bcrypt')).default;
  const citizen = await p.user.upsert({where:{email:'demo.citizen@example.invalid'},update:{},create:{
    name:'Demo Citizen',email:'demo.citizen@example.invalid',role:'CITIZEN',
    passwordHash:await bcrypt.hash(randomBytes(32).toString('hex'),12)
  }});
  ${emit('{adminId:admin.id,citizenId:citizen.id}')}
`);
const zones = db('location-service', `
  const zones = await p.serviceZone.findMany({where:{isActive:true,areaId:{not:null}},include:{area:true},orderBy:{id:'asc'},take:3});
  if (!zones.length) throw new Error('Run the location service seed first.');
  ${emit('zones')}
`);
const categories = ['POTHOLE','STREETLIGHT','WATER_LEAK','GARBAGE','DRAINAGE','TRAFFIC_SIGNAL','FALLEN_TREE','ROAD_DAMAGE','OTHER'];
const titles = ['Potholes near bus stop','Streetlights out along main road','Water leak beside public footpath','Uncollected waste near market','Blocked stormwater drain','Traffic signal timing fault','Fallen branch obstructing pavement','Damaged road surface at junction','Broken public bench'];
const statuses = ['SUBMITTED','UNDER_REVIEW','VERIFIED','ASSIGNED','IN_PROGRESS','RESOLVED','RESOLVED','REJECTED','SUBMITTED','IN_PROGRESS','RESOLVED','VERIFIED'];
const uuid = (prefix, i) => `${prefix}-0000-4000-8000-${String(i + 1).padStart(12,'0')}`;
const now = Date.now();
const reports = Array.from({length:36}, (_, i) => {
  const zone = zones[i % zones.length];
  const created = now - (29 - Math.floor(i * 28 / 36)) * 86400000;
  return {
    id:uuid('de000001',i),citizenId:identity.citizenId,
    title:`${titles[i % 9]} - ${zone.area.name}`,
    description:`Sample report for demonstration: ${titles[i % 9].toLowerCase()} in ${zone.area.name}. Please inspect the site and coordinate the appropriate maintenance response.`,
    category:categories[i % 9],priority:['LOW','MEDIUM','HIGH','CRITICAL'][i % 4],status:statuses[i % 12],
    address:`${10 + i * 3} Demo Street, ${zone.area.name}`,
    districtId:zone.districtId,areaId:zone.areaId,serviceZoneId:zone.id,
    adminNote:'Demo data for local development.',
    createdAt:new Date(created).toISOString(),updatedAt:new Date(created + 48 * 3600000).toISOString(),
  };
});
db('report-service', `for (const data of ${JSON.stringify(reports)}) {
  await p.report.upsert({where:{id:data.id},update:{},create:data});
}`);
db('assignment-service', `
  const zones = ${JSON.stringify(zones)};
  const teams = [];
  for (const zone of zones) {
    teams.push(await p.maintenanceTeam.upsert({where:{code:'DEMO-Z'+zone.id},update:{},create:{
      code:'DEMO-Z'+zone.id,name:'Demo Maintenance - '+zone.area.name,
      specialization:'GENERAL',serviceZoneId:zone.id,contactEmail:'maintenance'+zone.id+'@example.invalid'
    }}));
  }
  const reports = ${JSON.stringify(reports)};
  for (const [i,report] of reports.entries()) {
    if (!['ASSIGNED','IN_PROGRESS','RESOLVED'].includes(report.status)) continue;
    const assignedAt = new Date(new Date(report.createdAt).getTime()+4*3600000);
    const completedAt = report.status === 'RESOLVED' ? new Date(report.updatedAt) : null;
    const data = {id:'de000002-0000-4000-8000-'+String(i+1).padStart(12,'0'),
      reportId:report.id,teamId:teams.find(t=>t.serviceZoneId===report.serviceZoneId).id,
      assignedBy:${JSON.stringify(identity.adminId)},status:completedAt?'COMPLETED':report.status,
      instructions:'Demo assignment: inspect, secure the site, and complete repairs.',assignedAt,
      startedAt:report.status==='ASSIGNED'?null:new Date(assignedAt.getTime()+2*3600000),
      completedAt,createdAt:assignedAt,updatedAt:new Date(report.updatedAt)};
    await p.assignment.upsert({where:{id:data.id},update:{},create:data});
  }
`);
const summary = run('analytics-service', `
  const {refreshAnalytics} = await import('./src/services/analytics.service.js');
  const {default:p} = await import('./src/config/prisma.js');
  try { const data=await refreshAnalytics(); ${emit('data.summary')} } finally {await p.$disconnect();}
`);
console.log(JSON.stringify(summary,null,2));
