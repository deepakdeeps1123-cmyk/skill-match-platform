import * as THREE from 'three';
import { WorkerProfile, JobVacancy } from '../types';

export interface WorkSiteData {
  id: string;
  name: string;
  projectName: string;
  contractor: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  activeWorkersCount: number;
  openVacanciesCount: number;
  densityIndex: number; // 0 to 100 specialists / km²
  densityLevel: 'Low' | 'Moderate' | 'High' | 'Peak Surge';
  status: 'active' | 'expansion' | 'commissioning';
  tradeDistribution: { trade: string; count: number; color: string }[];
  stationedWorkers: { id: string; name: string; trade: string; rating: number; avatar: string }[];
  activeVacancies: { id: string; title: string; payRate: number; urgency: string }[];
  description: string;
  equipmentOnSite: string[];
}

export const GLOBAL_WORK_SITES: WorkSiteData[] = [
  {
    id: 'site-chennai-metro',
    name: 'Chennai Central Metro Hub & Phase-II Underground',
    projectName: 'Metro Phase-II Underground Station Electrical & Tunnel Package',
    contractor: 'Metro Infrastructure & EPC Ltd',
    city: 'Chennai',
    country: 'India',
    lat: 13.0827,
    lng: 80.2707,
    activeWorkersCount: 38,
    openVacanciesCount: 8,
    densityIndex: 88,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Electrical', count: 14, color: '#065f46' },
      { trade: 'Welding & Fabrication', count: 10, color: '#047857' },
      { trade: 'Heavy Equipment & Operations', count: 8, color: '#10b981' },
      { trade: 'Civil & Carpentry', count: 6, color: '#57534e' },
    ],
    stationedWorkers: [
      { id: 'w-1', name: 'Ramesh Kumar', trade: 'Electrical', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&h=256&q=80' },
      { id: 'w-2', name: 'Suresh Mani', trade: 'Welding & Fabrication', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80' },
      { id: 'w-7', name: 'Dinesh Babu', trade: 'Masonry & Concrete', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-101', title: 'Industrial Cable Tray & 3-Phase Electrician', payRate: 2500, urgency: 'urgent' },
      { id: 'job-104', title: 'Heavy Hydraulic Excavator Operator', payRate: 3200, urgency: 'urgent' },
    ],
    description: 'High-density underground rail excavation and 3-phase substation grid installation connecting Chennai Central to the southern arterial corridor.',
    equipmentOnSite: ['20T Hydraulic Excavators', 'Galvanized Cable Tray Racks', 'Laser Survey Stations', 'Diesel Gantry Cranes'],
  },
  {
    id: 'site-chennai-omr',
    name: 'OMR Cyber City Phase-II Tower B & C',
    projectName: 'Commercial IT Park Tower B - Steel Roof Truss & Fitout',
    contractor: 'Skyline Structural Builders',
    city: 'Chennai',
    country: 'India',
    lat: 13.0450,
    lng: 80.2110,
    activeWorkersCount: 26,
    openVacanciesCount: 5,
    densityIndex: 76,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Welding & Fabrication', count: 9, color: '#047857' },
      { trade: 'Carpentry & Framing', count: 8, color: '#57534e' },
      { trade: 'Plumbing', count: 5, color: '#78716c' },
      { trade: 'Electrical', count: 4, color: '#065f46' },
    ],
    stationedWorkers: [
      { id: 'w-2', name: 'Suresh Mani', trade: 'Welding & Fabrication', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80' },
      { id: 'w-6', name: 'Murugan Velu', trade: 'Carpentry & Framing', rating: 4.85, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-102', title: 'Structural Steel MIG/TIG Welder', payRate: 2400, urgency: 'immediate' },
      { id: 'job-106', title: 'Commercial Drywall & Ceiling Carpenter', payRate: 2100, urgency: 'normal' },
    ],
    description: 'Structural steel column splicing, high-elevation truss installation, and acoustic ceiling grid execution across 18 floors.',
    equipmentOnSite: ['Tower Cranes', 'MIG/TIG Inverter Welding Stations', 'Scissor Lifts', 'Laser Levels'],
  },
  {
    id: 'site-dubai-south',
    name: 'Dubai South Aviation & Logistics Megahub',
    projectName: 'Al Maktoum International Logistics Zone & Cargo Hangar 4',
    contractor: 'Gulf Infrastructure Partners',
    city: 'Dubai',
    country: 'United Arab Emirates',
    lat: 25.0657,
    lng: 55.1713,
    activeWorkersCount: 52,
    openVacanciesCount: 14,
    densityIndex: 96,
    densityLevel: 'Peak Surge',
    status: 'expansion',
    tradeDistribution: [
      { trade: 'Logistics & Warehousing', count: 18, color: '#44403c' },
      { trade: 'HVAC & Refrigeration', count: 14, color: '#78716c' },
      { trade: 'Electrical', count: 12, color: '#065f46' },
      { trade: 'Welding & Fabrication', count: 8, color: '#047857' },
    ],
    stationedWorkers: [
      { id: 'w-8', name: 'Ganesh Nathan', trade: 'Logistics & Warehousing', rating: 4.85, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80' },
      { id: 'w-3', name: 'Arun Prasath', trade: 'HVAC & Refrigeration', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-105', title: 'Night Shift Forklift & Inbound Stager', payRate: 2950, urgency: 'immediate' },
      { id: 'job-dxb-1', title: 'Industrial Cold-Storage VRF Specialist', payRate: 3600, urgency: 'urgent' },
    ],
    description: 'Rapid-deployment automated cargo terminal with 45,000 sq.m high-bay racking and industrial ammonia refrigeration circuits.',
    equipmentOnSite: ['Reach Trucks', 'Automated Guided Vehicles', 'Industrial Ammonia Chillers', 'Boom Lifts'],
  },
  {
    id: 'site-singapore-tuas',
    name: 'Singapore Tuas Mega Port Phase-II',
    projectName: 'Automated Container Terminal 3 Deep Berth & Quay Crane Substation',
    contractor: 'Jurong Marine & Civil Consortium',
    city: 'Singapore',
    country: 'Singapore',
    lat: 1.2902,
    lng: 103.8519,
    activeWorkersCount: 44,
    openVacanciesCount: 9,
    densityIndex: 86,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Heavy Equipment & Operations', count: 16, color: '#10b981' },
      { trade: 'Electrical', count: 14, color: '#065f46' },
      { trade: 'Welding & Fabrication', count: 8, color: '#047857' },
      { trade: 'Masonry & Concrete', count: 6, color: '#57534e' },
    ],
    stationedWorkers: [
      { id: 'w-1', name: 'Ramesh Kumar', trade: 'Electrical', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-sg-1', title: '22kV Port Quay Substation Commissioning Engineer', payRate: 4200, urgency: 'urgent' },
    ],
    description: 'Reclamation, caisson placement, and high-voltage automated rail-mounted gantry crane energization for Tuas Terminal 3.',
    equipmentOnSite: ['Caisson Floating Cranes', 'Piling Rigs', '22kV Switchgear', 'Automated RMG Cranes'],
  },
  {
    id: 'site-tokyo-chuo',
    name: 'Tokyo Chuo Shinkansen Maglev Tunnel',
    projectName: 'Southern Alps Deep Shield Tunneling & Cryogenic Substation',
    contractor: 'Nippon Rail Tech Joint Venture',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    activeWorkersCount: 36,
    openVacanciesCount: 6,
    densityIndex: 81,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Electrical', count: 14, color: '#065f46' },
      { trade: 'Heavy Equipment & Operations', count: 12, color: '#10b981' },
      { trade: 'Civil & Carpentry', count: 6, color: '#57534e' },
      { trade: 'Welding & Fabrication', count: 4, color: '#047857' },
    ],
    stationedWorkers: [
      { id: 'w-4', name: 'Karthik Raja', trade: 'Plumbing', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-tyo-1', title: 'Tunnel Bore Machine (TBM) Electrical Tech', payRate: 3900, urgency: 'normal' },
    ],
    description: 'Precision subterranean maglev guide-way alignment, shield machine instrumentation, and liquid-helium cooling line piping.',
    equipmentOnSite: ['14m Tunnel Boring Machines', 'Laser Guidance System', 'Cryogenic Transfer Piping', 'Segment Erector'],
  },
  {
    id: 'site-frankfurt-dc',
    name: 'Frankfurt Main Hyperscale Campus DC-4',
    projectName: '120MW High-Density AI Cluster Redundant Power & Cooling Facility',
    contractor: 'Rhine-Main Industrial Electrical',
    city: 'Frankfurt',
    country: 'Germany',
    lat: 50.1109,
    lng: 8.6821,
    activeWorkersCount: 39,
    openVacanciesCount: 11,
    densityIndex: 84,
    densityLevel: 'High',
    status: 'commissioning',
    tradeDistribution: [
      { trade: 'Electrical', count: 18, color: '#065f46' },
      { trade: 'HVAC & Refrigeration', count: 12, color: '#78716c' },
      { trade: 'Plumbing', count: 5, color: '#10b981' },
      { trade: 'Logistics & Warehousing', count: 4, color: '#44403c' },
    ],
    stationedWorkers: [
      { id: 'w-3', name: 'Arun Prasath', trade: 'HVAC & Refrigeration', rating: 4.7, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-fra-1', title: 'Medium Voltage Busway & UPS Specialist', payRate: 4100, urgency: 'urgent' },
    ],
    description: 'Installation of dual 110kV substations, static transfer switches, chilled-water cooling loops, and modular server containment aisles.',
    equipmentOnSite: ['Rotary UPS Systems', 'Plate Heat Exchangers', 'Fiber Fusion Splicers', 'Cable Pullers'],
  },
  {
    id: 'site-london-hs2',
    name: 'London Old Oak Common HS2 Interchange',
    projectName: 'High Speed 2 Super-Hub Underground Station Box Excavation',
    contractor: 'Balfour Beatty Vinci Joint Venture',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    activeWorkersCount: 33,
    openVacanciesCount: 7,
    densityIndex: 78,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Civil & Carpentry', count: 12, color: '#57534e' },
      { trade: 'Heavy Equipment & Operations', count: 10, color: '#10b981' },
      { trade: 'Welding & Fabrication', count: 6, color: '#047857' },
      { trade: 'Electrical', count: 5, color: '#065f46' },
    ],
    stationedWorkers: [
      { id: 'w-6', name: 'Murugan Velu', trade: 'Carpentry & Framing', rating: 4.85, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-lon-1', title: 'Deep Diaphragm Wall Rebar Welder', payRate: 3400, urgency: 'normal' },
    ],
    description: 'Construction of the UK\'s largest new rail station, featuring 14 high-speed platforms within an 850-meter underground concrete box.',
    equipmentOnSite: ['Diaphragm Wall Hydrofraise', 'Crawler Cranes', 'Concrete Batching Plants', 'Total Stations'],
  },
  {
    id: 'site-riyadh-airport',
    name: 'Riyadh King Salman International Aerotropolis',
    projectName: 'Terminal 1 Mega-Dome & Rapid Transit People Mover',
    contractor: 'Red Sea EPC Constructors',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lng: 46.6753,
    activeWorkersCount: 58,
    openVacanciesCount: 16,
    densityIndex: 98,
    densityLevel: 'Peak Surge',
    status: 'expansion',
    tradeDistribution: [
      { trade: 'HVAC & Refrigeration', count: 20, color: '#78716c' },
      { trade: 'Electrical', count: 18, color: '#065f46' },
      { trade: 'Welding & Fabrication', count: 12, color: '#047857' },
      { trade: 'Plumbing', count: 8, color: '#10b981' },
    ],
    stationedWorkers: [
      { id: 'w-1', name: 'Ramesh Kumar', trade: 'Electrical', rating: 4.9, avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&h=256&q=80' },
      { id: 'w-2', name: 'Suresh Mani', trade: 'Welding & Fabrication', rating: 4.8, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-ruh-1', title: 'District Cooling Chilled Water Master Plumber', payRate: 3800, urgency: 'urgent' },
    ],
    description: 'Gigawatt-scale solar-integrated terminal expansion, 12,000-ton structural steel canopy, and district cooling distribution loop.',
    equipmentOnSite: ['Heavy Lift Hydraulic Jacks', 'Chiller Installation Gantry', 'Articulated Booms', 'Mobile Substations'],
  },
  {
    id: 'site-sf-transbay',
    name: 'San Francisco Transbay Infrastructure & Power Hub',
    projectName: 'Downtown Transit Center Seismic Retrofit & 480V Overhaul',
    contractor: 'Pacific Bay Electrical & Heavy',
    city: 'San Francisco',
    country: 'United States',
    lat: 37.7749,
    lng: -122.4194,
    activeWorkersCount: 28,
    openVacanciesCount: 6,
    densityIndex: 72,
    densityLevel: 'Moderate',
    status: 'active',
    tradeDistribution: [
      { trade: 'Electrical', count: 11, color: '#065f46' },
      { trade: 'Heavy Equipment & Operations', count: 9, color: '#10b981' },
      { trade: 'Plumbing', count: 5, color: '#78716c' },
      { trade: 'Civil & Carpentry', count: 3, color: '#57534e' },
    ],
    stationedWorkers: [
      { id: 'w-5', name: 'Vikram Singh', trade: 'Heavy Equipment & Operations', rating: 4.95, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-sfo-1', title: 'Seismic Dampening & Heavy Shoring Specialist', payRate: 4600, urgency: 'normal' },
    ],
    description: 'Underground rail link box shoring, seismic damper integration, and high-amperage switchgear renewal under live transit operations.',
    equipmentOnSite: ['Hydraulic Jacking Cylinders', 'Non-Destructive Testing Rigs', 'Forklifts', 'Safety Shoring'],
  },
  {
    id: 'site-sydney-aerotropolis',
    name: 'Sydney Western Airport & Aerotropolis Logistics Hub',
    projectName: 'Cargo Precinct & 33kV Terminal Distribution Infrastructure',
    contractor: 'Australasian Construction Group',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    activeWorkersCount: 31,
    openVacanciesCount: 8,
    densityIndex: 75,
    densityLevel: 'High',
    status: 'active',
    tradeDistribution: [
      { trade: 'Logistics & Warehousing', count: 12, color: '#44403c' },
      { trade: 'Electrical', count: 10, color: '#065f46' },
      { trade: 'Masonry & Concrete', count: 5, color: '#57534e' },
      { trade: 'Plumbing', count: 4, color: '#78716c' },
    ],
    stationedWorkers: [
      { id: 'w-8', name: 'Ganesh Nathan', trade: 'Logistics & Warehousing', rating: 4.85, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80' },
    ],
    activeVacancies: [
      { id: 'job-syd-1', title: 'Airfield 33kV Ring Main Unit (RMU) Installer', payRate: 4300, urgency: 'urgent' },
    ],
    description: 'Western Sydney International greenfield logistics freight hub, automated sorting conveyor power, and 24/7 runway fueling systems.',
    equipmentOnSite: ['Trenchers', 'Cable Winches', 'Automated Conveyor Assemblies', 'Concrete Laser Screed'],
  }
];

/**
 * Converts geographic latitude and longitude (in degrees) to 3D Cartesian coordinates on a sphere of radius R.
 */
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Generates an elevated 3D Quadratic Bezier Arc between two points on the globe surface.
 */
export function createGreatCircleArc(
  start: THREE.Vector3,
  end: THREE.Vector3,
  elevation: number = 3.5,
  pointsCount: number = 40
): THREE.Vector3[] {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const normal = mid.clone().normalize();
  mid.add(normal.multiplyScalar(elevation));

  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(pointsCount);
}
