import React, { useState } from 'react';
import { WorkerProfile, JobVacancy, ProjectTask } from '../types';
import { GLOBAL_WORK_SITES, WorkSiteData } from '../data/workSitesData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  BarChart2,
  Grid3X3,
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

interface ResourceAllocationProps {
  workers: WorkerProfile[];
  jobs: JobVacancy[];
  tasks: ProjectTask[];
}

export interface SiteUtilizationMetric {
  id: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  region: 'Asia-Pacific' | 'Middle East' | 'Europe' | 'North America';
  contractor: string;
  plannedCapacity: number;
  deployedWorkers: number;
  unfilledVacancies: number;
  reserveSurplus: number;
  utilizationRate: number; // percentage (e.g. 72% or 108%)
  staffingStatus: 'under-staffed' | 'optimal' | 'over-capacity';
  criticalTradeShortage?: string;
  tradeBreakdown: {
    trade: string;
    deployed: number;
    required: number;
    utilization: number;
  }[];
  rebalanceAction: string;
}

export const ResourceAllocationSection: React.FC<ResourceAllocationProps> = ({
  workers,
  jobs,
  tasks,
}) => {
  const [chartViewMode, setChartViewMode] = useState<'stacked-bar' | 'heatmap'>('stacked-bar');
  const [filterStatus, setFilterStatus] = useState<'all' | 'under-staffed' | 'optimal' | 'over-capacity'>('all');
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Compute realistic utilization metrics across active project sites
  const siteUtilizationData: SiteUtilizationMetric[] = [
    {
      id: 'site-chennai-metro',
      name: 'Chennai Central Metro Hub & Underground Rail',
      shortName: 'Chennai Metro',
      city: 'Chennai',
      country: 'India',
      region: 'Asia-Pacific',
      contractor: 'Metro Infrastructure & EPC Ltd',
      plannedCapacity: 48,
      deployedWorkers: 38,
      unfilledVacancies: 10,
      reserveSurplus: 0,
      utilizationRate: 79.2,
      staffingStatus: 'under-staffed',
      criticalTradeShortage: '3-Phase Electricians & Cable Pullers',
      tradeBreakdown: [
        { trade: 'Electrical', deployed: 14, required: 20, utilization: 70 },
        { trade: 'Welding', deployed: 10, required: 12, utilization: 83 },
        { trade: 'Heavy Operations', deployed: 8, required: 10, utilization: 80 },
        { trade: 'Carpentry', deployed: 6, required: 6, utilization: 100 },
      ],
      rebalanceAction: 'Dispatch 6 industrial electricians from Chennai standby bench to tunnel shaft 3.',
    },
    {
      id: 'site-chennai-omr',
      name: 'OMR Cyber City Phase-II Tower B & C',
      shortName: 'OMR Cyber City',
      city: 'Chennai',
      country: 'India',
      region: 'Asia-Pacific',
      contractor: 'Skyline Structural Builders',
      plannedCapacity: 24,
      deployedWorkers: 26,
      unfilledVacancies: 0,
      reserveSurplus: 2,
      utilizationRate: 108.3,
      staffingStatus: 'over-capacity',
      criticalTradeShortage: 'Surplus Framing Carpenters',
      tradeBreakdown: [
        { trade: 'Electrical', deployed: 4, required: 4, utilization: 100 },
        { trade: 'Welding', deployed: 9, required: 8, utilization: 112 },
        { trade: 'Carpentry', deployed: 8, required: 7, utilization: 114 },
        { trade: 'Plumbing', deployed: 5, required: 5, utilization: 100 },
      ],
      rebalanceAction: 'Redeploy 2 structural welders and 1 carpenter to under-staffed Metro station package.',
    },
    {
      id: 'site-dubai-south',
      name: 'Dubai South Aviation & Logistics Megahub',
      shortName: 'Dubai South Hub',
      city: 'Dubai',
      country: 'UAE',
      region: 'Middle East',
      contractor: 'Gulf Infrastructure Partners',
      plannedCapacity: 68,
      deployedWorkers: 52,
      unfilledVacancies: 16,
      reserveSurplus: 0,
      utilizationRate: 76.5,
      staffingStatus: 'under-staffed',
      criticalTradeShortage: 'Ammonia VRF HVAC & Night Logistics Stagers',
      tradeBreakdown: [
        { trade: 'Logistics', deployed: 18, required: 24, utilization: 75 },
        { trade: 'HVAC', deployed: 14, required: 20, utilization: 70 },
        { trade: 'Electrical', deployed: 12, required: 14, utilization: 86 },
        { trade: 'Welding', deployed: 8, required: 10, utilization: 80 },
      ],
      rebalanceAction: 'Mobilize 6 night-shift forklift operators and 4 HVAC technicians from Gulf contractor network.',
    },
    {
      id: 'site-singapore-tuas',
      name: 'Singapore Tuas Mega Port Automated Berth 3',
      shortName: 'Singapore Tuas',
      city: 'Singapore',
      country: 'Singapore',
      region: 'Asia-Pacific',
      contractor: 'Jurong Marine & Civil Consortium',
      plannedCapacity: 50,
      deployedWorkers: 44,
      unfilledVacancies: 6,
      reserveSurplus: 0,
      utilizationRate: 88.0,
      staffingStatus: 'optimal',
      tradeBreakdown: [
        { trade: 'Heavy Operations', deployed: 16, required: 18, utilization: 89 },
        { trade: 'Electrical', deployed: 14, required: 16, utilization: 87.5 },
        { trade: 'Welding', deployed: 8, required: 10, utilization: 80 },
        { trade: 'Carpentry', deployed: 6, required: 6, utilization: 100 },
      ],
      rebalanceAction: 'Maintain current cadence; shift 2 high-voltage electricians for quay crane commissioning on Friday.',
    },
    {
      id: 'site-tokyo-chuo',
      name: 'Tokyo Chuo Shinkansen Maglev Tunnel',
      shortName: 'Tokyo Maglev',
      city: 'Tokyo',
      country: 'Japan',
      region: 'Asia-Pacific',
      contractor: 'Nippon Rail Tech Joint Venture',
      plannedCapacity: 40,
      deployedWorkers: 36,
      unfilledVacancies: 4,
      reserveSurplus: 0,
      utilizationRate: 90.0,
      staffingStatus: 'optimal',
      tradeBreakdown: [
        { trade: 'Electrical', deployed: 14, required: 15, utilization: 93 },
        { trade: 'Heavy Operations', deployed: 12, required: 13, utilization: 92 },
        { trade: 'Carpentry', deployed: 6, required: 7, utilization: 86 },
        { trade: 'Welding', deployed: 4, required: 5, utilization: 80 },
      ],
      rebalanceAction: 'Optimal synchronization; schedule rotational rest days for cryogenic pipefitters.',
    },
    {
      id: 'site-frankfurt-dc',
      name: 'Frankfurt Main Hyperscale Campus DC-4',
      shortName: 'Frankfurt DC-4',
      city: 'Frankfurt',
      country: 'Germany',
      region: 'Europe',
      contractor: 'Rhine-Main Industrial Electrical',
      plannedCapacity: 45,
      deployedWorkers: 39,
      unfilledVacancies: 6,
      reserveSurplus: 0,
      utilizationRate: 86.7,
      staffingStatus: 'optimal',
      tradeBreakdown: [
        { trade: 'Electrical', deployed: 18, required: 20, utilization: 90 },
        { trade: 'HVAC', deployed: 12, required: 14, utilization: 86 },
        { trade: 'Plumbing', deployed: 5, required: 6, utilization: 83 },
        { trade: 'Logistics', deployed: 4, required: 5, utilization: 80 },
      ],
      rebalanceAction: 'Optimal staffing; stage UPS battery delivery teams for weekend substation load testing.',
    },
    {
      id: 'site-london-hs2',
      name: 'London Old Oak Common HS2 Super-Hub',
      shortName: 'London HS2',
      city: 'London',
      country: 'UK',
      region: 'Europe',
      contractor: 'Balfour Beatty Vinci Joint Venture',
      plannedCapacity: 42,
      deployedWorkers: 33,
      unfilledVacancies: 9,
      reserveSurplus: 0,
      utilizationRate: 78.6,
      staffingStatus: 'under-staffed',
      criticalTradeShortage: 'Deep Diaphragm Wall Rebar Welders',
      tradeBreakdown: [
        { trade: 'Carpentry', deployed: 12, required: 14, utilization: 86 },
        { trade: 'Heavy Operations', deployed: 10, required: 12, utilization: 83 },
        { trade: 'Welding', deployed: 6, required: 10, utilization: 60 },
        { trade: 'Electrical', deployed: 5, required: 6, utilization: 83 },
      ],
      rebalanceAction: 'Accelerate screening for 4 certified AWS structural welders to clear diaphragm wall backlog.',
    },
    {
      id: 'site-riyadh-airport',
      name: 'Riyadh King Salman International Aerotropolis',
      shortName: 'Riyadh Aerotropolis',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      region: 'Middle East',
      contractor: 'Red Sea EPC Constructors',
      plannedCapacity: 78,
      deployedWorkers: 58,
      unfilledVacancies: 20,
      reserveSurplus: 0,
      utilizationRate: 74.4,
      staffingStatus: 'under-staffed',
      criticalTradeShortage: 'District Chilled Water Plumbers & MEP Riggers',
      tradeBreakdown: [
        { trade: 'HVAC', deployed: 20, required: 28, utilization: 71 },
        { trade: 'Electrical', deployed: 18, required: 24, utilization: 75 },
        { trade: 'Welding', deployed: 12, required: 15, utilization: 80 },
        { trade: 'Plumbing', deployed: 8, required: 11, utilization: 73 },
      ],
      rebalanceAction: 'Peak surge deficit: trigger cross-regional relocation bonuses for 12 certified commercial HVAC techs.',
    },
    {
      id: 'site-sf-transbay',
      name: 'San Francisco Transbay Infrastructure & Power Hub',
      shortName: 'SF Transbay',
      city: 'San Francisco',
      country: 'USA',
      region: 'North America',
      contractor: 'Pacific Bay Electrical & Heavy',
      plannedCapacity: 26,
      deployedWorkers: 28,
      unfilledVacancies: 0,
      reserveSurplus: 2,
      utilizationRate: 107.7,
      staffingStatus: 'over-capacity',
      criticalTradeShortage: 'Surplus Heavy Shoring Operators',
      tradeBreakdown: [
        { trade: 'Electrical', deployed: 11, required: 10, utilization: 110 },
        { trade: 'Heavy Operations', deployed: 9, required: 8, utilization: 112 },
        { trade: 'Plumbing', deployed: 5, required: 5, utilization: 100 },
        { trade: 'Carpentry', deployed: 3, required: 3, utilization: 100 },
      ],
      rebalanceAction: 'Transfer 2 heavy equipment operators to California High-Speed Rail civil packages.',
    },
    {
      id: 'site-sydney-aerotropolis',
      name: 'Sydney Western Airport Logistics & 33kV Hub',
      shortName: 'Sydney Airport',
      city: 'Sydney',
      country: 'Australia',
      region: 'Asia-Pacific',
      contractor: 'Australasian Construction Group',
      plannedCapacity: 36,
      deployedWorkers: 31,
      unfilledVacancies: 5,
      reserveSurplus: 0,
      utilizationRate: 86.1,
      staffingStatus: 'optimal',
      tradeBreakdown: [
        { trade: 'Logistics', deployed: 12, required: 14, utilization: 86 },
        { trade: 'Electrical', deployed: 10, required: 11, utilization: 91 },
        { trade: 'Carpentry', deployed: 5, required: 6, utilization: 83 },
        { trade: 'Plumbing', deployed: 4, required: 5, utilization: 80 },
      ],
      rebalanceAction: 'Optimal balance; align next apprentice rotation with airfield ring main unit energization.',
    }
  ];

  // High-level calculations
  const totalPlannedCapacity = siteUtilizationData.reduce((acc, s) => acc + s.plannedCapacity, 0);
  const totalDeployed = siteUtilizationData.reduce((acc, s) => acc + s.deployedWorkers, 0);
  const totalUnfilled = siteUtilizationData.reduce((acc, s) => acc + s.unfilledVacancies, 0);
  const totalSurplus = siteUtilizationData.reduce((acc, s) => acc + s.reserveSurplus, 0);
  const overallUtilization = ((totalDeployed / totalPlannedCapacity) * 100).toFixed(1);

  const underStaffedCount = siteUtilizationData.filter((s) => s.staffingStatus === 'under-staffed').length;
  const optimalCount = siteUtilizationData.filter((s) => s.staffingStatus === 'optimal').length;
  const overCapacityCount = siteUtilizationData.filter((s) => s.staffingStatus === 'over-capacity').length;

  // Filtered list
  const filteredSites = siteUtilizationData.filter((site) => {
    if (filterStatus === 'all') return true;
    return site.staffingStatus === filterStatus;
  });

  // Data formatted for Stacked Bar Chart
  const stackedChartData = filteredSites.map((site) => ({
    name: site.shortName,
    fullName: site.name,
    city: site.city,
    deployed: site.deployedWorkers,
    unfilled: site.unfilledVacancies,
    surplus: site.reserveSurplus,
    capacity: site.plannedCapacity,
    utilization: site.utilizationRate,
    status: site.staffingStatus,
  }));

  // Unique Trades for Heatmap Matrix
  const heatmapTrades = ['Electrical', 'Welding', 'HVAC', 'Heavy Operations', 'Carpentry', 'Logistics'];

  const getHeatmapColor = (pct: number) => {
    if (pct < 75) return 'bg-stone-100 border-stone-300 text-stone-700';
    if (pct <= 95) return 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
    return 'bg-emerald-800 border-emerald-900 text-white font-bold';
  };

  const getStatusBadge = (status: 'under-staffed' | 'optimal' | 'over-capacity') => {
    switch (status) {
      case 'under-staffed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-300">
            <AlertCircle className="w-3 h-3 text-stone-600" />
            Staffing Deficit
          </span>
        );
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-800" />
            Optimal (80-95%)
          </span>
        );
      case 'over-capacity':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-200 text-stone-800 border border-stone-400">
            <Activity className="w-3 h-3 text-stone-700" />
            Reserve Surplus
          </span>
        );
    }
  };

  return (
    <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-stone-800 border border-stone-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-800" />
              Dynamic Capacity & Workforce Saturation
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs font-mono text-emerald-800 font-semibold">Live Telemetry</span>
          </div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-1 flex items-center gap-2">
            Resource Allocation & Regional Utilization Rates
          </h2>
          <p className="text-xs text-stone-600 max-w-3xl mt-0.5">
            Real-time worker density, staffing deficit detection, and cross-site workforce balancing across active infrastructure projects.
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart View Switcher */}
          <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5">
            <button
              onClick={() => setChartViewMode('stacked-bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                chartViewMode === 'stacked-bar'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Stacked Capacity</span>
            </button>
            <button
              onClick={() => setChartViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                chartViewMode === 'heatmap'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Utilization Heatmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>Network Utilization</span>
            <Zap className="w-3.5 h-3.5 text-emerald-800" />
          </div>
          <div className="text-2xl font-mono font-black text-stone-900 flex items-baseline gap-1">
            <span>{overallUtilization}%</span>
            <span className="text-[10px] font-normal text-stone-500">avg</span>
          </div>
          <p className="text-[10px] font-mono text-emerald-800 font-semibold">
            Target benchmark: 80–95%
          </p>
        </div>

        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>Deployed Workforce</span>
            <Users className="w-3.5 h-3.5 text-emerald-800" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-800">
            {totalDeployed} <span className="text-xs font-normal text-stone-500">/ {totalPlannedCapacity}</span>
          </div>
          <p className="text-[10px] font-mono text-stone-500">
            Across 10 project sites
          </p>
        </div>

        <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-300 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-700">
            <span>Staffing Deficits</span>
            <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
          </div>
          <div className="text-2xl font-mono font-black text-stone-900">
            {underStaffedCount} Sites
          </div>
          <p className="text-[10px] font-mono text-stone-600">
            -{totalUnfilled} unfilled specialist openings
          </p>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-emerald-900">
            <span>Optimal Sites</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
          </div>
          <div className="text-2xl font-mono font-black text-emerald-800">
            {optimalCount} Sites
          </div>
          <p className="text-[10px] font-mono text-emerald-800">
            Peak operational efficiency
          </p>
        </div>

        <div className="bg-stone-100 p-3.5 rounded-xl border border-stone-300 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-stone-700">
            <span>Surplus Reserves</span>
            <Activity className="w-3.5 h-3.5 text-stone-600" />
          </div>
          <div className="text-2xl font-mono font-black text-stone-900">
            {overCapacityCount} Sites
          </div>
          <p className="text-[10px] font-mono text-stone-600">
            +{totalSurplus} surplus ready for redeployment
          </p>
        </div>
      </div>

      {/* Filter Tabs for Region/Status */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-bold mr-1">
            Status Filter:
          </span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-colors ${
              filterStatus === 'all'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200'
            }`}
          >
            All Sites ({siteUtilizationData.length})
          </button>
          <button
            onClick={() => setFilterStatus('under-staffed')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
              filterStatus === 'under-staffed'
                ? 'bg-stone-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-stone-500" />
            Staffing Deficit ({underStaffedCount})
          </button>
          <button
            onClick={() => setFilterStatus('optimal')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
              filterStatus === 'optimal'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-800" />
            Optimal ({optimalCount})
          </button>
          <button
            onClick={() => setFilterStatus('over-capacity')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 ${
              filterStatus === 'over-capacity'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            Surplus Reserves ({overCapacityCount})
          </button>
        </div>

        <div className="text-xs font-mono text-stone-500">
          Showing {filteredSites.length} of {siteUtilizationData.length} active sites
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODE 1: STACKED BAR CHART OF CAPACITY VS DEFICIT/SURPLUS */}
      {/* ========================================================= */}
      {chartViewMode === 'stacked-bar' && (
        <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-800" />
                Workforce Capacity Stack by Project Site
              </h3>
              <p className="text-xs text-stone-500">
                Forest green represents actively deployed crew; Stone gray indicates unfilled staffing deficits; Warm slate indicates over-capacity reserve.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-800" />
                <span className="text-stone-700 font-medium">Deployed Crew</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-stone-400" />
                <span className="text-stone-700 font-medium">Unfilled Deficit</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-stone-600" />
                <span className="text-stone-700 font-medium">Surplus Standby</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stackedChartData}
                margin={{ top: 15, right: 15, left: -10, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                />
                <YAxis
                  tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  label={{
                    value: 'Specialists Headcount',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#78716c',
                    fontSize: 10,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e7e5e4',
                    borderRadius: 10,
                    fontSize: 12,
                    color: '#1c1917',
                    fontFamily: 'JetBrains Mono',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                  formatter={(value: any, name: any, item: any) => {
                    if (name === 'deployed') return [`${value} Specialists`, 'Active Deployed'];
                    if (name === 'unfilled') return [`${value} Positions Short`, 'Staffing Deficit'];
                    if (name === 'surplus') return [`${value} In Reserve`, 'Surplus Reserve'];
                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const item = payload[0].payload;
                      return `${item.fullName} (${item.city}) — ${item.utilization.toFixed(1)}% Capacity`;
                    }
                    return label;
                  }}
                />
                <Bar dataKey="deployed" stackId="capacity" fill="#065f46" radius={[0, 0, 0, 0]} name="deployed" />
                <Bar dataKey="unfilled" stackId="capacity" fill="#a8a29e" radius={[4, 4, 0, 0]} name="unfilled" />
                <Bar dataKey="surplus" stackId="capacity" fill="#57534e" radius={[4, 4, 0, 0]} name="surplus" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: REGIONAL UTILIZATION HEATMAP MATRIX              */}
      {/* ========================================================= */}
      {chartViewMode === 'heatmap' && (
        <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-emerald-800" />
                Cross-Trade Regional Utilization Heatmap
              </h3>
              <p className="text-xs text-stone-500">
                Cell colors indicate trade saturation: Stone Neutral (&lt;75% deficit), Soft Forest Green (75–95% optimal), Deep Forest Green (&gt;95% saturated).
              </p>
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-stone-100 border border-stone-300" />
                <span className="text-stone-700 font-medium">&lt;75% Deficit</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 border border-emerald-300" />
                <span className="text-emerald-900 font-medium">75–95% Optimal</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-800 border border-emerald-900 text-white" />
                <span className="text-stone-800 font-medium">&gt;95% Saturated</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-mono text-stone-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Active Project Site</th>
                  <th className="py-2.5 px-2">Overall Saturation</th>
                  {heatmapTrades.map((trade) => (
                    <th key={trade} className="py-2.5 px-2 text-center">
                      {trade}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono text-xs">
                {filteredSites.map((site) => (
                  <tr
                    key={site.id}
                    onClick={() => setSelectedSiteId(selectedSiteId === site.id ? null : site.id)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                        <span>{site.name}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">
                        {site.city}, {site.country} • {site.contractor}
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <div className="font-bold text-stone-900">
                        {site.utilizationRate.toFixed(1)}%
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {site.deployedWorkers}/{site.plannedCapacity} crew
                      </div>
                    </td>

                    {/* Trade Heatmap Cells */}
                    {heatmapTrades.map((tradeName) => {
                      const matchedTrade = site.tradeBreakdown.find((t) => t.trade === tradeName);
                      if (!matchedTrade) {
                        return (
                          <td key={tradeName} className="py-3 px-2 text-center">
                            <span className="text-[10px] text-stone-400 font-mono">N/A</span>
                          </td>
                        );
                      }
                      return (
                        <td key={tradeName} className="py-3 px-2 text-center">
                          <div
                            className={`inline-flex flex-col items-center justify-center px-2 py-1 rounded-lg border text-[11px] font-bold ${getHeatmapColor(
                              matchedTrade.utilization
                            )}`}
                            title={`${matchedTrade.trade}: ${matchedTrade.deployed} deployed / ${matchedTrade.required} required (${matchedTrade.utilization}%)`}
                          >
                            <span>{matchedTrade.utilization}%</span>
                            <span className="text-[9px] opacity-75">
                              {matchedTrade.deployed}/{matchedTrade.required}
                            </span>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-right">
                      {getStatusBadge(site.staffingStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Regional Site Cards with Rebalancing Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            Regional Staffing Diagnostic & Rebalancing Action Matrix
          </h3>
          <span className="text-xs font-mono text-stone-500">
            Click any site card to inspect detailed trade allocations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredSites.map((site) => {
            const isSelected = selectedSiteId === site.id;
            return (
              <div
                key={site.id}
                onClick={() => setSelectedSiteId(isSelected ? null : site.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  site.staffingStatus === 'under-staffed'
                    ? 'bg-stone-50/70 border-stone-300 hover:border-stone-400'
                    : site.staffingStatus === 'over-capacity'
                    ? 'bg-stone-100/70 border-stone-300 hover:border-stone-400'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                } ${isSelected ? 'ring-2 ring-emerald-800 border-emerald-800' : ''}`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{site.name}</span>
                    </div>
                    <div className="text-[11px] font-mono text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span>{site.city}, {site.country}</span>
                      <span className="text-stone-300">•</span>
                      <span>{site.region}</span>
                    </div>
                  </div>
                  {getStatusBadge(site.staffingStatus)}
                </div>

                {/* Progress Bar for Utilization */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-stone-500">Worker Saturation:</span>
                    <span className="font-bold text-stone-900">
                      {site.deployedWorkers} / {site.plannedCapacity} Specialists ({site.utilizationRate.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        site.staffingStatus === 'under-staffed'
                          ? 'bg-stone-400'
                          : site.staffingStatus === 'over-capacity'
                          ? 'bg-stone-600'
                          : 'bg-emerald-800'
                      }`}
                      style={{ width: `${Math.min(site.utilizationRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Critical Shortage Tag or Surplus Badge */}
                {site.criticalTradeShortage && (
                  <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200 flex items-center gap-1.5 text-xs font-mono">
                    <span className="text-stone-500">Deficit Focus:</span>
                    <span className="text-stone-800 font-bold">{site.criticalTradeShortage}</span>
                  </div>
                )}

                {/* Recommended Rebalancing Action */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-2 text-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-stone-600 font-mono text-[11px] block font-semibold">
                      Resource Rebalance Recommendation:
                    </span>
                    <span className="text-stone-700 font-normal leading-relaxed">
                      {site.rebalanceAction}
                    </span>
                  </div>
                </div>

                {/* Detailed Trade Breakdown Expandable */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-stone-200 space-y-2 animate-in fade-in duration-150">
                    <span className="text-[11px] font-mono text-stone-600 block font-semibold">
                      Trade Breakdown Telemetry:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {site.tradeBreakdown.map((tb, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-stone-50 border border-stone-200 text-[11px] font-mono space-y-0.5"
                        >
                          <div className="text-stone-900 font-bold">{tb.trade}</div>
                          <div className="text-stone-600">
                            Deployed: <strong className="text-stone-900">{tb.deployed}</strong> / {tb.required}
                          </div>
                          <div className="text-emerald-800 text-[10px] font-semibold">
                            Utilization: {tb.utilization}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
