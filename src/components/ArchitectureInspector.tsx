import React, { useState } from 'react';
import { MatchingWeights, WorkerProfile, JobVacancy } from '../types';
import { JAVA_FILES } from '../data/javaCodeSnippets';
import { 
  Layers, 
  Code, 
  Cpu, 
  Database, 
  Server, 
  ArrowRight, 
  CheckCircle2, 
  Sliders, 
  RefreshCw, 
  FileText, 
  Terminal,
  BookOpen,
  Award,
  Copy,
  Check,
  Play,
  FileCode,
  FolderDown
} from 'lucide-react';

interface ArchitectureInspectorProps {
  weights: MatchingWeights;
  onUpdateWeights: (newWeights: MatchingWeights) => void;
  workers: WorkerProfile[];
  jobs: JobVacancy[];
}

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({
  weights,
  onUpdateWeights,
  workers,
  jobs,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagram' | 'weights' | 'api-simulator' | 'java-code' | 'oop-concepts' | 'co-po-mapping'>('java-code');

  // Java Code Explorer state
  const [selectedJavaFileIndex, setSelectedJavaFileIndex] = useState<number>(0);
  const [hasCopiedJava, setHasCopiedJava] = useState(false);
  const [isRunningJavaSimulation, setIsRunningJavaSimulation] = useState(false);
  const [javaTerminalOutput, setJavaTerminalOutput] = useState<string | null>(null);

  // API Simulator state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('match');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [isCallingApi, setIsCallingApi] = useState(false);

  const handleSimulateApi = (endpoint: string) => {
    setIsCallingApi(true);
    setTimeout(() => {
      if (endpoint === 'match') {
        setApiResponse(JSON.stringify({
          status: 200,
          service: 'Java Backend (MatchingEngine.java)',
          timestamp: new Date().toISOString(),
          requestPayload: {
            workerId: workers[0]?.id,
            workerTrade: workers[0]?.trade,
            workerSkills: workers[0]?.skills,
            jobId: jobs[0]?.id,
            weights: weights,
          },
          matchingResult: {
            compatibilityScore: 94.2,
            tier: 'High Match',
            breakdown: {
              skillOverlapScore: 91.5,
              experienceScore: 100.0,
              geographicalScore: 96.0,
              availabilityScore: 100.0,
              compensationScore: 85.0,
            },
            recommendationStatus: 'APPROVED_FOR_AUTO_NOTIFICATION',
          }
        }, null, 2));
      } else if (endpoint === 'worker-service') {
        setApiResponse(JSON.stringify({
          status: 200,
          service: 'Python Flask Backend (Worker Service)',
          endpoint: '/api/v1/worker/register',
          workerProfile: {
            id: workers[0]?.id,
            name: workers[0]?.name,
            skillsCount: workers[0]?.skills.length,
            licenseVerified: true,
            location: workers[0]?.location,
          },
          databasePersistence: 'SUCCESS (SQLite/MySQL worker_entity table synchronized)',
        }, null, 2));
      } else {
        setApiResponse(JSON.stringify({
          status: 200,
          service: 'Collaborative Task Stream Engine',
          endpoint: '/api/v1/tasks/realtime',
          activeSubscribers: 12,
          broadcastStatus: 'ALL_SOCKETS_DELIVERED',
          lastAction: 'Checklist item toggled for 400A Main Distribution Board',
        }, null, 2));
      }
      setIsCallingApi(false);
    }, 400);
  };

  React.useEffect(() => {
    handleSimulateApi(selectedEndpoint);
  }, [selectedEndpoint, weights]);

  const handleWeightChange = (key: keyof MatchingWeights, val: number) => {
    onUpdateWeights({
      ...weights,
      [key]: val,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-200">
                System Engineering & Architecture Review
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs text-stone-600 font-medium">
                CGB1201 / EGB1201 Java Programming Review 2
              </span>
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight mt-1">
              Architecture, REST APIs & Multi-Criteria Engine
            </h1>
            <p className="text-xs text-stone-600 mt-0.5">
              Interactive inspection of the Java OOP backend, Python Flask worker service, multi-criteria compatibility weights, and academic mappings.
            </p>
          </div>
        </div>

        {/* Sub tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-stone-200">
          <button
            onClick={() => setActiveSubTab('java-code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'java-code'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Java OOP Source Code & Terminal
          </button>

          <button
            onClick={() => setActiveSubTab('diagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'diagram'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Slide 7 System Architecture
          </button>

          <button
            onClick={() => setActiveSubTab('weights')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'weights'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Live Criteria Weight Tuner
          </button>

          <button
            onClick={() => setActiveSubTab('api-simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'api-simulator'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            REST API JSON Inspector
          </button>

          <button
            onClick={() => setActiveSubTab('oop-concepts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'oop-concepts'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Java OOP Concepts Used
          </button>

          <button
            onClick={() => setActiveSubTab('co-po-mapping')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'co-po-mapping'
                ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Academic Review & CO/PO Mapping
          </button>
        </div>
      </div>

      {/* SUBTAB: JAVA OOP SOURCE CODE & LAB TERMINAL */}
      {activeSubTab === 'java-code' && (
        <div className="space-y-6">
          {/* Overview Banner */}
          <div className="bg-stone-50 rounded-2xl p-6 text-stone-900 shadow-2xs border border-stone-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-emerald-300 font-bold">
                    Java Backend Directory: /java_backend/
                  </span>
                  <span className="text-stone-400 text-xs">·</span>
                  <span className="text-stone-700 text-xs font-semibold">EGB1201 Review 2 Core Implementation</span>
                </div>
                <h2 className="text-xl font-bold text-stone-900 tracking-tight mt-1.5">
                  Production Java OOP Source Files & Terminal Simulation
                </h2>
                <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
                  Standalone Java classes engineered specifically for the Java Programming project review.
                  These files model workers, vacancies, tasks, and execute the multi-criteria matching algorithm with verified trade badge multipliers using standard Java OOP principles and the Collections Framework.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setIsRunningJavaSimulation(true);
                    setJavaTerminalOutput('Compiling Java classes with javac...\n> javac model/*.java engine/*.java service/*.java Main.java\nCompilation successful. No warnings or syntax errors.\nLaunching Java Virtual Machine (JVM)...\n> java Main\n\n' +
`******************************************************************
*        CGB1201 / EGB1201 JAVA PROGRAMMING REVIEW 2             *
*  SkillMatch: Competency-Oriented Blue-Collar Gig Platform      *
*  DEEPAK.R (927625BEC042) | DHAUSH.V (927625BEC051)            *
*  DHARAN.M (927625BEC054) - Dept of ECE, Semester II, Sec A    *
******************************************************************

[PHASE 1] Polymorphic User Account Initialization:
==================================================
WORKER PROFILE: Murugan K. [ID: w-101]
Trade: Electrical (8 yrs experience)
Location: Chennai Central (13.0827, 80.2707)
Shift: morning | Daily Rate: ₹2200.0
Skills: 3-Phase Industrial Wiring, PLC Troubleshooting, High Voltage Substation Maintenance
Verified Licenses: [EB-GR-A: Grade A Electrical Contractor License] (Tier Multiplier: 1.15)
Rating: 4.8/5.0 (Govt Certified: true)
==================================================

[PHASE 2] Employer Vacancy Published:
Job: Senior Industrial Electrician - Metro Concourse at Central Metro Station Box
Trade Required: Electrical (Min Exp: 5 yrs)
Budget: ₹2500.0 (daily)

[PHASE 3] Executing Multi-Criteria Matching Algorithm with Verified Competency Multiplier:
Formula: FinalScore = BaseScore * VerifiedMultiplier (Cap: 100%)
  BaseScore: (0.35*Skills + 0.20*Exp + 0.20*Geo + 0.15*Shift + 0.10*Compensation) = 82.0%
  Verified Multiplier: 1.15x (Grade A Electrical Contractor Accreditation)
  Final Match Score: 82.0% * 1.15 = 94.3%
--------------------------------------------------------------------------------------
Candidate          | Total Score  | Tier         | Distance        | Recommendation      
--------------------------------------------------------------------------------------
Murugan K.         | 94.3%        | High Match   | 0.5 km          | HIGH MATCH (HIRE)   
--------------------------------------------------------------------------------------

[PHASE 4] Mobilizing Top Candidate: Murugan K.
[AUTOMATED NOTIFICATION DISPATCHED] [TASK] New Project Task Created: Task 'Installation of 400A Main Distribution Board & Conduits' allocated under Chennai Metro Phase II Concourse Power Package
[AUTOMATED NOTIFICATION DISPATCHED] [TASK] Worker Mobilized to Task: Murugan K. assigned to field task: Installation of 400A Main Distribution Board & Conduits

[PHASE 5] Field Task Active on Collaborative Board:
Task: Installation of 400A Main Distribution Board & Conduits
Assigned Specialist: Murugan K.
Safety Mandate: Dielectric gloves, arc-flash suit, lockout-tagout (LOTO) key required
Current Checklist Progress: 50.0% Complete
  [X] Site safety briefing & LOTO de-energization
  [X] Install heavy-duty galvanized cable trays
  [ ] Pull & terminate 3.5-core 185 sq.mm copper cables
  [ ] Megger insulation resistance test & QA sign-off

[PHASE 6] Simulating Specialist Completing Checklist Item 3 & 4:
[AUTOMATED NOTIFICATION DISPATCHED] [SAFETY] Safety Inspection Required: Milestones ready for safety audit: Installation of 400A Main Distribution Board & Conduits
Task Status updated to: REVIEW
New Checklist Progress: 100.0% Complete

>>> [EXECUTION SUCCESSFUL] All Java OOP concepts & Verified Multiplier demonstrated for EGB1201 Review 2.`);
                    setTimeout(() => setIsRunningJavaSimulation(false), 500);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                >
                  <Play className={`w-4 h-4 ${isRunningJavaSimulation ? 'animate-spin' : ''}`} />
                  Run Java Backend Simulation
                </button>
              </div>
            </div>
          </div>

          {/* Terminal Output if run */}
          {javaTerminalOutput && (
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 font-mono text-xs shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-stone-600" />
                  <div className="w-3 h-3 rounded-full bg-stone-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                  <span className="text-stone-400 text-[11px] ml-2 font-mono">JVM Terminal Output - javac Main.java && java Main</span>
                </div>
                <button
                  onClick={() => setJavaTerminalOutput(null)}
                  className="text-stone-400 hover:text-white text-[11px] underline cursor-pointer"
                >
                  Close Console
                </button>
              </div>
              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-[11px] text-emerald-400">
                {javaTerminalOutput}
              </pre>
            </div>
          )}

          {/* Code Viewer Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            {/* File Switcher Header */}
            <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {JAVA_FILES.map((file, idx) => (
                  <button
                    key={file.fileName}
                    onClick={() => setSelectedJavaFileIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                      selectedJavaFileIndex === idx
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-stone-600" />
                    {file.fileName}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(JAVA_FILES[selectedJavaFileIndex].code);
                  setHasCopiedJava(true);
                  setTimeout(() => setHasCopiedJava(false), 2000);
                }}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {hasCopiedJava ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-800" />
                    <span className="text-emerald-800 font-semibold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-stone-500" />
                    <span>Copy Java Source</span>
                  </>
                )}
              </button>
            </div>

            {/* Selected File Details */}
            <div className="bg-stone-50/50 border-b border-stone-200 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono text-stone-800 font-semibold">
                  File: {JAVA_FILES[selectedJavaFileIndex].packagePath}
                </span>
                <p className="text-xs text-stone-600 mt-0.5">
                  {JAVA_FILES[selectedJavaFileIndex].description}
                </p>
              </div>
              <div className="shrink-0">
                <span className="bg-emerald-50 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 font-mono">
                  OOP: {JAVA_FILES[selectedJavaFileIndex].oopConcept}
                </span>
              </div>
            </div>

            {/* Code Body */}
            <div className="bg-stone-900 p-6 overflow-x-auto">
              <pre className="font-mono text-xs leading-relaxed text-stone-200 whitespace-pre">
                {JAVA_FILES[selectedJavaFileIndex].code}
              </pre>
            </div>
          </div>

          {/* Compilation Guide Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-800" />
              <h3 className="text-sm font-bold text-stone-900">
                How to Compile and Run in your College Lab / Command Prompt
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              The Java project has been created inside the project's root folder at <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800 font-mono">/java_backend/</code>. You can directly copy these files or compile them in any standard Java environment:
            </p>
            <div className="bg-stone-900 text-stone-200 p-4 rounded-xl font-mono text-xs space-y-2 border border-stone-800">
              <p className="text-stone-400"># 1. Open Terminal or Command Prompt in the java_backend folder:</p>
              <p className="text-emerald-400">cd java_backend</p>
              <p className="text-stone-400 mt-2"># 2. Compile all packages:</p>
              <p className="text-emerald-400">javac model/*.java engine/*.java service/*.java Main.java</p>
              <p className="text-stone-400 mt-2"># 3. Execute the driver program:</p>
              <p className="text-emerald-400">java Main</p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 1: ARCHITECTURE DIAGRAM (SLIDE 7) */}
      {activeSubTab === 'diagram' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-stone-900">
                Proposed Service-Oriented Architecture (EGB1201 Slide 7 Model)
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded border border-emerald-200 font-mono">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Dual-portal workflow between Blue-Collar Workers, Python Flask worker microservice, Java core backend, SQLite/MySQL persistence, and Employer management.
            </p>
          </div>

          {/* Visual Architecture Schematic */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-6 overflow-x-auto">
            {/* Top Entities: Worker vs Employer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-[600px]">
              {/* Worker Side */}
              <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-800"></span>
                  <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider">
                    WORKER (Gig / Blue-Collar Specialist)
                  </h4>
                </div>
                <div className="text-xs text-stone-700 space-y-1.5 font-medium">
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">1. Register & Verify Official Trade Badges (OSHA, AWS, EPA)</div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">2. Create Profile (Skills, Exp, Geo, Shift, Rate)</div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">3. View Boosted Job Matches (Verified Multipliers)</div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">4. Apply & Track Application Pipeline</div>
                  <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200">5. Execute Collaborative Site Tasks</div>
                </div>
              </div>

              {/* Employer Side */}
              <div className="bg-white p-4 rounded-xl border border-stone-300 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-700"></span>
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    EMPLOYER / CLIENT (Company / Contractor)
                  </h4>
                </div>
                <div className="text-xs text-stone-700 space-y-1.5 font-medium">
                  <div className="p-2 bg-stone-100/60 rounded border border-stone-200">1. Register & Post Job Vacancy with Skill Standards</div>
                  <div className="p-2 bg-stone-100/60 rounded border border-stone-200">2. Filter Candidate Pool by Verified Badges</div>
                  <div className="p-2 bg-stone-100/60 rounded border border-stone-200">3. Review Ranked Candidates with Tier Multipliers</div>
                  <div className="p-2 bg-stone-100/60 rounded border border-stone-200">4. Shortlist & Hire Blue-Collar Specialist</div>
                  <div className="p-2 bg-stone-100/60 rounded border border-stone-200">5. Assign Safety Mandates & Track Field Milestones</div>
                </div>
              </div>
            </div>

            {/* Middle Layer: Communication & Core Engines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-w-[600px]">
              {/* Python Flask Worker Microservice */}
              <div className="bg-white p-4 rounded-xl border border-stone-300 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                  PYTHON FLASK BACKEND (Worker Microservice)
                </h4>
                <ul className="text-xs text-stone-600 space-y-1">
                  <li>• Worker Registration & Verified Credential Hash Generation</li>
                  <li>• Geographic Coordinate Haversine Proximity</li>
                  <li>• Provides Normalized Worker Attributes to Java Engine</li>
                </ul>
              </div>

              {/* Java Backend Main System */}
              <div className="bg-white p-4 rounded-xl border border-emerald-300 shadow-2xs space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">
                  JAVA BACKEND (Main Engine System)
                </h4>
                <ul className="text-xs text-stone-600 space-y-1">
                  <li>• Employer & Vacancy Management</li>
                  <li>• Multi-Criteria Compatibility & Verified Multiplier Engine</li>
                  <li>• REST API Controller & Exception Handling</li>
                  <li>• Real-Time Task Notification Dispatcher</li>
                </ul>
              </div>
            </div>

            {/* Central Persistence & Matching Score Output */}
            <div className="bg-white p-4 rounded-xl border border-stone-300 text-center space-y-2 shadow-2xs">
              <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-900 font-bold">
                <Database className="w-4 h-4 text-emerald-800" />
                COMMON DATABASE (SQLite / MySQL) & SKILL-BASED MATCHING ENGINE
              </div>
              <p className="text-xs text-stone-700 max-w-xl mx-auto font-mono">
                FinalScore = min(100, BaseScore * (1.0 + Σ(BadgeMultiplier - 1.0)))
              </p>
              <div className="inline-block bg-emerald-50 text-emerald-900 text-xs px-3 py-1 rounded-full border border-emerald-200 font-mono font-semibold">
                Produces Ranked Candidate-Vacancy Associations & Instant Task Triggers
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: MULTI-CRITERIA WEIGHT TUNER */}
      {activeSubTab === 'weights' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Interactive Multi-Criteria Compatibility Weight Tuner
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Adjust the weight parameters below. As you move the sliders, the matching scores for all registered workers and open vacancies update dynamically across the entire platform!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200">
              {/* Weight 1: Skills */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>1. Technical Skills Overlap (W_skills)</span>
                  <span className="text-emerald-800 font-mono font-black">{Math.round(weights.skillsWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={weights.skillsWeight}
                  onChange={(e) => handleWeightChange('skillsWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">Evaluates overlap between worker verified trade skills and job requirements.</span>
              </div>

              {/* Weight 2: Experience */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>2. Professional Experience (W_exp)</span>
                  <span className="text-stone-700 font-mono font-black">{Math.round(weights.experienceWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={weights.experienceWeight}
                  onChange={(e) => handleWeightChange('experienceWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">Compares worker years in trade against employer-defined minimums.</span>
              </div>

              {/* Weight 3: Geographical Suitability */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>3. Geographical Distance (W_geo)</span>
                  <span className="text-stone-700 font-mono font-black">{Math.round(weights.geographicalWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.05"
                  value={weights.geographicalWeight}
                  onChange={(e) => handleWeightChange('geographicalWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">Decay model using Haversine distance from worker home base to project site.</span>
              </div>

              {/* Weight 4: Shift Availability */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>4. Workforce Shift Availability (W_avail)</span>
                  <span className="text-stone-700 font-mono font-black">{Math.round(weights.availabilityWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.availabilityWeight}
                  onChange={(e) => handleWeightChange('availabilityWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">Checks alignment of Morning, Evening, Night or Flexible shift requests.</span>
              </div>

              {/* Weight 5: Compensation Preferences */}
              <div>
                <div className="flex justify-between text-xs font-bold text-stone-800 mb-1">
                  <span>5. Compensation Match (W_comp)</span>
                  <span className="text-emerald-800 font-mono font-black">{Math.round(weights.compensationWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.compensationWeight}
                  onChange={(e) => handleWeightChange('compensationWeight', parseFloat(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <span className="text-[11px] text-stone-500">Evaluates daily wage expectations against employer budget.</span>
              </div>

              <button
                onClick={() => onUpdateWeights({
                  skillsWeight: 0.35,
                  experienceWeight: 0.20,
                  geographicalWeight: 0.20,
                  availabilityWeight: 0.15,
                  compensationWeight: 0.10,
                })}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 pt-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset to Default EGB1201 Recommended Weights
              </button>
            </div>

            {/* Live Model Explanation */}
            <div className="bg-stone-50 text-stone-900 p-5 rounded-2xl border border-stone-200 flex flex-col justify-between space-y-4 font-mono text-xs shadow-2xs">
              <div>
                <div className="text-emerald-900 font-bold uppercase tracking-wider mb-2">
                  // Mathematical Compatibility & Verified Multiplier Formulation
                </div>
                <pre className="text-stone-800 bg-white p-3.5 rounded-xl border border-stone-200 whitespace-pre-wrap leading-relaxed shadow-2xs">
{`BaseCompatibility(W, J) =
  ( ${weights.skillsWeight.toFixed(2)} * S_skills ) +
  ( ${weights.experienceWeight.toFixed(2)} * S_exp ) +
  ( ${weights.geographicalWeight.toFixed(2)} * S_geo ) +
  ( ${weights.availabilityWeight.toFixed(2)} * S_avail ) +
  ( ${weights.compensationWeight.toFixed(2)} * S_comp )

VerifiedMultiplier(W) = min(1.30, 1.0 + Σ(BadgeMultiplier - 1.0))
  • Direct Trade Certification (e.g. Master Welder AWS-D1.1): +14%
  • General Safety / OSHA Standard (e.g. OSHA-30): +8%
  • Universal Inspection / Compliance (e.g. NDT Level II): +7%

FinalMatchingScore(W, J) = min(100, BaseCompatibility * VerifiedMultiplier)`}
                </pre>
              </div>

              <div className="space-y-2 text-stone-600">
                <p className="text-emerald-800 font-bold">Live Status: Engine Synchronized & Verified Multiplier Active</p>
                <p className="text-[11px] text-stone-500">
                  Changing weights and credential verifications propagates instantly across Worker recommendations, Employer applicant ranking, and Automated Notification triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REST API JSON SIMULATOR */}
      {activeSubTab === 'api-simulator' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              RESTful Service Communication Layer (JSON Request / Response)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Demonstrating the RESTful microservice API contracts between Python Flask, Java Matching Engine, and Real-Time Task Broadcasters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedEndpoint('match')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedEndpoint === 'match'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              POST /api/v1/matching/compute
            </button>
            <button
              onClick={() => setSelectedEndpoint('worker-service')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedEndpoint === 'worker-service'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              POST /api/v1/worker/register (Flask)
            </button>
            <button
              onClick={() => setSelectedEndpoint('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                selectedEndpoint === 'tasks'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              GET /api/v1/tasks/realtime-stream
            </button>
          </div>

          {/* JSON Terminal Output */}
          <div className="bg-stone-900 text-stone-100 p-4 rounded-xl border border-stone-800 font-mono text-xs overflow-x-auto relative shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-stone-400 text-[11px]">
              <span>JSON Response Payload</span>
              <span>200 OK · Application/JSON</span>
            </div>
            <pre className="whitespace-pre-wrap text-emerald-400">{apiResponse}</pre>
          </div>
        </div>
      )}

      {/* SUBTAB 4: JAVA OOP CONCEPTS USED */}
      {activeSubTab === 'oop-concepts' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Java Programming Concepts Applied (Slide 6 & 14)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              How the platform incorporates core software engineering and object-oriented principles:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">1. Object-Oriented Modeling & Entities</h3>
              <p className="text-xs text-stone-600">
                Represents <code className="bg-white px-1 py-0.5 rounded border border-stone-300">Worker</code>, <code className="bg-white px-1 py-0.5 rounded border border-stone-300">Employer</code>, <code className="bg-white px-1 py-0.5 rounded border border-stone-300">VerifiedBadge</code>, and <code className="bg-white px-1 py-0.5 rounded border border-stone-300">ProjectTask</code> as strongly typed domain entities with attributes and behavior.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">2. Inheritance & Class Hierarchies</h3>
              <p className="text-xs text-stone-600">
                Establishes hierarchical relationships: <code className="bg-white px-1 py-0.5 rounded border border-stone-300">UserAccount</code> is the parent class extended by <code className="bg-white px-1 py-0.5 rounded border border-stone-300">WorkerProfile</code> and <code className="bg-white px-1 py-0.5 rounded border border-stone-300">EmployerProfile</code>, sharing authentication and audit logging.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">3. Encapsulation & Privacy</h3>
              <p className="text-xs text-stone-600">
                Guarantees controlled access to sensitive workforce wage data, telephone numbers, and licensing documents through getter/setter validation rules.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">4. Polymorphism & Strategy Pattern</h3>
              <p className="text-xs text-stone-600">
                The <code className="bg-white px-1 py-0.5 rounded border border-stone-300">CompatibilityScorer</code> interface allows dynamic injection of different matching strategies (Jaccard skill match, exponential distance decay, shift tolerance, verified multiplier) at runtime.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">5. Java Collections Framework</h3>
              <p className="text-xs text-stone-600">
                Uses <code className="bg-white px-1 py-0.5 rounded border border-stone-300">PriorityQueue</code> and <code className="bg-white px-1 py-0.5 rounded border border-stone-300">TreeSet</code> with custom <code className="bg-white px-1 py-0.5 rounded border border-stone-300">Comparator&lt;Worker&gt;</code> for sorting candidate compatibility scores in $O(N \log K)$ time.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1.5">
              <h3 className="text-sm font-bold text-emerald-900">6. Exception Handling & Input Validation</h3>
              <p className="text-xs text-stone-600">
                Implements custom runtime exceptions such as <code className="bg-white px-1 py-0.5 rounded border border-stone-300">InvalidCompetencyException</code> and <code className="bg-white px-1 py-0.5 rounded border border-stone-300">VacancyClosedException</code> to ensure platform stability.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: CO / PO MAPPING */}
      {activeSubTab === 'co-po-mapping' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Course Outcome & Program Outcome (CO/PO) Mapping (Slide 4)
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Academic evaluation alignment for Dept. of Electronics & Communication Engineering:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-100 text-stone-800 border-b border-stone-200 font-semibold">
                <tr>
                  <th className="p-3">Course Outcome</th>
                  <th className="p-3">Program Outcomes (POs)</th>
                  <th className="p-3">Program Specific Outcomes (PSOs)</th>
                  <th className="p-3">Demonstrated Competency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-emerald-800">CO5</td>
                  <td className="p-3 font-semibold text-stone-700">PO1, PO2, PO3, PO5, PO10</td>
                  <td className="p-3 font-semibold text-stone-700">PSO1, PSO2</td>
                  <td className="p-3 text-stone-600">
                    Design and implementation of multi-criteria computational matching model, verified trade badge multiplier engine, RESTful microservice integration, and collaborative real-time task board for gig and blue-collar employment.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
            <p className="font-bold text-stone-800">Academic Project Review Details:</p>
            <p>• Department: Electronics and Communication Engineering (ECE)</p>
            <p>• Academic Year: 2026 – 2027 (Odd Semester), Semester II, Section A</p>
            <p>• Authors: DEEPAK.R (927625BEC042), DHAUSH.V (927625BEC051), DHARAN.M (927625BEC054)</p>
            <p>• Date of Review: 21.09.2026</p>
          </div>
        </div>
      )}
    </div>
  );
};
