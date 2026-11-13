import {
  WorkerProfile,
  JobVacancy,
  CompatibilityScore,
  MatchingWeights,
  SkillMatchAnalysis,
  WorkerCompetitionBenchmark,
  JobRecommendationItem,
  JobApplication,
} from '../types';

export const DEFAULT_WEIGHTS: MatchingWeights = {
  skillsWeight: 0.35,
  experienceWeight: 0.20,
  geographicalWeight: 0.20,
  availabilityWeight: 0.15,
  compensationWeight: 0.10,
};

// Calculate Haversine distance between two coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function computeCompatibilityScore(
  worker: WorkerProfile,
  job: JobVacancy,
  weights: MatchingWeights = DEFAULT_WEIGHTS,
  applyVerifiedMultiplier: boolean = true
): CompatibilityScore {
  // 1. Skill Match Score (Case-insensitive matching)
  const workerSkillsLower = worker.skills.map((s) => s.trim().toLowerCase());
  const requiredLower = job.requiredSkills.map((s) => s.trim().toLowerCase());
  const preferredLower = job.preferredSkills.map((s) => s.trim().toLowerCase());

  const matchedRequired = job.requiredSkills.filter((skill) =>
    workerSkillsLower.includes(skill.trim().toLowerCase())
  );
  const missingSkills = job.requiredSkills.filter(
    (skill) => !workerSkillsLower.includes(skill.trim().toLowerCase())
  );
  const matchedPreferred = job.preferredSkills.filter((skill) =>
    workerSkillsLower.includes(skill.trim().toLowerCase())
  );

  const reqScore =
    requiredLower.length > 0
      ? (matchedRequired.length / requiredLower.length) * 85
      : 85;
  const prefScore =
    preferredLower.length > 0
      ? (matchedPreferred.length / preferredLower.length) * 15
      : 15;
  const skillMatchScore = Math.min(100, Math.round(reqScore + prefScore));

  // 2. Experience Score
  let experienceScore = 100;
  if (job.requiredExperienceYears > 0) {
    if (worker.experienceYears >= job.requiredExperienceYears) {
      experienceScore = 100;
    } else {
      experienceScore = Math.round(
        (worker.experienceYears / job.requiredExperienceYears) * 85
      );
    }
  }

  // 3. Geographical Suitability Score
  const distanceKm = calculateDistanceKm(
    worker.location.lat,
    worker.location.lng,
    job.location.lat,
    job.location.lng
  );
  const maxRadius = worker.location.maxTravelDistanceKm || 30;
  let geographicalScore = 100;
  if (distanceKm <= 5) {
    geographicalScore = 100;
  } else if (distanceKm <= maxRadius) {
    geographicalScore = Math.round(
      100 - ((distanceKm - 5) / Math.max(1, maxRadius - 5)) * 40
    );
  } else {
    const excess = distanceKm - maxRadius;
    geographicalScore = Math.max(10, Math.round(60 - excess * 2));
  }

  // 4. Availability Score
  let availabilityScore = 50;
  if (
    worker.availability === job.shift ||
    worker.availability === 'Flexible / Any' ||
    job.shift === 'Flexible / Any'
  ) {
    availabilityScore = 100;
  } else if (worker.availability.includes('Flexible')) {
    availabilityScore = 90;
  } else {
    availabilityScore = 40;
  }
  if (!worker.isAvailableNow) {
    availabilityScore = Math.max(30, availabilityScore - 20);
  }

  // 5. Compensation Preferences Score
  let compensationScore = 100;
  const workerRate =
    job.payType === 'daily' ? worker.dailyRate : worker.hourlyRate;
  const jobRate = job.payRate;

  if (jobRate >= workerRate) {
    compensationScore = 100;
  } else {
    const diffPercent = ((workerRate - jobRate) / Math.max(1, workerRate)) * 100;
    if (diffPercent <= 10) {
      compensationScore = 85;
    } else if (diffPercent <= 25) {
      compensationScore = 65;
    } else {
      compensationScore = Math.max(20, Math.round(60 - (diffPercent - 25)));
    }
  }

  // Multi-criteria Weighted Total Score
  const totalWeight =
    weights.skillsWeight +
    weights.experienceWeight +
    weights.geographicalWeight +
    weights.availabilityWeight +
    weights.compensationWeight;

  const rawTotal =
    (skillMatchScore * weights.skillsWeight +
      experienceScore * weights.experienceWeight +
      geographicalScore * weights.geographicalWeight +
      availabilityScore * weights.availabilityWeight +
      compensationScore * weights.compensationWeight) /
    (totalWeight || 1);

  const baseScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // 6. Verified Competencies Tiered Multiplier Bonus
  const verifiedBadges = (worker.verifiedBadges || []).filter(
    (b) => b.status === 'verified'
  );

  let multiplierBonus = 0;
  if (applyVerifiedMultiplier) {
    for (const badge of verifiedBadges) {
      const isDirectTrade = badge.competencyArea === job.trade;
      const isSafetyOrCompliance =
        badge.competencyArea === 'General Safety' ||
        badge.competencyArea === 'Compliance';

      if (isDirectTrade) {
        multiplierBonus += Math.max(0, (badge.tierMultiplier || 1.1) - 1.0);
      } else if (isSafetyOrCompliance) {
        multiplierBonus += Math.max(
          0,
          ((badge.tierMultiplier || 1.06) - 1.0) * 0.8
        );
      } else {
        multiplierBonus += 0.03;
      }
    }
  }

  // Cap the maximum badge multiplier to 1.30 (+30% max visibility boost)
  const finalMultiplier = Math.min(1.3, 1.0 + multiplierBonus);
  const totalScore = Math.min(
    100,
    Math.max(0, Math.round(baseScore * finalMultiplier))
  );

  let recommendationTier:
    | 'High Match'
    | 'Good Match'
    | 'Moderate Match'
    | 'Low Match' = 'Low Match';
  if (totalScore >= 80) recommendationTier = 'High Match';
  else if (totalScore >= 65) recommendationTier = 'Good Match';
  else if (totalScore >= 50) recommendationTier = 'Moderate Match';

  return {
    totalScore,
    baseScore,
    breakdown: {
      skillMatchScore,
      experienceScore,
      geographicalScore,
      availabilityScore,
      compensationScore,
    },
    verifiedBadgeMultiplier: Math.round(finalMultiplier * 100) / 100,
    verifiedBadgesCount: verifiedBadges.length,
    matchedSkills: [...matchedRequired, ...matchedPreferred],
    missingSkills,
    distanceKm,
    recommendationTier,
  };
}

// =========================================================================
// MODULE 5: SKILL REQUIRED MATCHING MODULE
// =========================================================================
export function analyzeSkillMatch(
  worker: WorkerProfile,
  job: JobVacancy
): SkillMatchAnalysis {
  const workerSkillsLower = worker.skills.map((s) => s.trim().toLowerCase());

  const requiredMatched = job.requiredSkills.filter((s) =>
    workerSkillsLower.includes(s.trim().toLowerCase())
  );
  const requiredMissing = job.requiredSkills.filter(
    (s) => !workerSkillsLower.includes(s.trim().toLowerCase())
  );

  const preferredMatched = job.preferredSkills.filter((s) =>
    workerSkillsLower.includes(s.trim().toLowerCase())
  );
  const preferredMissing = job.preferredSkills.filter(
    (s) => !workerSkillsLower.includes(s.trim().toLowerCase())
  );

  const requiredTotal = job.requiredSkills.length;
  const preferredTotal = job.preferredSkills.length;

  const requiredCoveragePct =
    requiredTotal > 0
      ? Math.round((requiredMatched.length / requiredTotal) * 100)
      : 100;
  const preferredBonusPct =
    preferredTotal > 0
      ? Math.round((preferredMatched.length / preferredTotal) * 100)
      : 100;

  const overallSkillFitPct = Math.round(
    requiredCoveragePct * 0.8 + preferredBonusPct * 0.2
  );

  const verifiedBadges = (worker.verifiedBadges || []).filter(
    (b) => b.status === 'verified'
  );
  const hasTradeMatch = worker.trade === job.trade;
  const hasDirectTradeBadge = verifiedBadges.some(
    (b) => b.competencyArea === job.trade
  );
  const hasSafetyBadge = verifiedBadges.some(
    (b) =>
      b.competencyArea === 'General Safety' ||
      b.competencyArea === 'Compliance'
  );

  const upskillSuggestions: string[] = [];
  if (requiredMissing.length > 0) {
    upskillSuggestions.push(
      `Complete field qualification in: ${requiredMissing.join(', ')}`
    );
  }
  if (!hasDirectTradeBadge) {
    upskillSuggestions.push(
      `Obtain an accredited ${job.trade} license badge to unlock a +10% to +15% ranking boost`
    );
  }
  if (!hasSafetyBadge) {
    upskillSuggestions.push(
      'Add OSHA-30 or Site Compliance certification for safety-critical project eligibility'
    );
  }
  if (preferredMissing.length > 0 && requiredMissing.length === 0) {
    upskillSuggestions.push(
      `Optional advantage: Add ${preferredMissing[0]} to hit 100% preferred coverage`
    );
  }

  return {
    requiredTotal,
    requiredMatched,
    requiredMissing,
    preferredTotal,
    preferredMatched,
    preferredMissing,
    requiredCoveragePct,
    preferredBonusPct,
    overallSkillFitPct,
    hasTradeMatch,
    hasDirectTradeBadge,
    hasSafetyBadge,
    upskillSuggestions,
  };
}

// =========================================================================
// MODULE 3: WORKER COMPETITION PROFILE MODULE
// =========================================================================
function computeWorkerCompetitionIndex(worker: WorkerProfile): number {
  const skillPoints = Math.min(25, (worker.skills?.length || 0) * 4);
  const expPoints = Math.min(20, (worker.experienceYears || 0) * 2.5);
  const badgePoints = Math.min(
    25,
    (worker.verifiedBadges || []).filter((b) => b.status === 'verified')
      .length * 12
  );
  const ratingPoints = Math.min(20, ((worker.rating || 4.0) / 5.0) * 20);
  const gigPoints = Math.min(10, Math.round((worker.completedGigs || 0) / 5));
  return Math.min(
    100,
    Math.round(skillPoints + expPoints + badgePoints + ratingPoints + gigPoints)
  );
}

export function computeWorkerCompetitionProfile(
  worker: WorkerProfile,
  allWorkers: WorkerProfile[],
  jobs: JobVacancy[]
): WorkerCompetitionBenchmark {
  const safeWorkers = allWorkers.length > 0 ? allWorkers : [worker];
  const tradePeers = safeWorkers.filter((w) => w.trade === worker.trade);
  const peersPool = tradePeers.length > 0 ? tradePeers : safeWorkers;

  const peerStandings = peersPool
    .map((w) => ({
      workerId: w.id,
      name: w.name,
      title: w.title,
      city: w.location.city,
      skillsCount: w.skills.length,
      badgesCount: (w.verifiedBadges || []).filter((b) => b.status === 'verified')
        .length,
      experienceYears: w.experienceYears,
      rating: w.rating,
      completedGigs: w.completedGigs,
      dailyRate: w.dailyRate,
      competitionScore: computeWorkerCompetitionIndex(w),
      isCurrent: w.id === worker.id,
    }))
    .sort((a, b) => b.competitionScore - a.competitionScore);

  const allScored = safeWorkers
    .map((w) => ({
      id: w.id,
      score: computeWorkerCompetitionIndex(w),
    }))
    .sort((a, b) => b.score - a.score);

  const tradeRank = Math.max(
    1,
    peerStandings.findIndex((p) => p.workerId === worker.id) + 1
  );
  const overallRank = Math.max(
    1,
    allScored.findIndex((p) => p.id === worker.id) + 1
  );

  const competitionScore = computeWorkerCompetitionIndex(worker);
  const percentile = Math.max(
    1,
    Math.min(
      99,
      Math.round(
        ((allScored.length - overallRank + 1) / Math.max(1, allScored.length)) *
          100
      )
    )
  );

  const avgTradeSkills =
    Math.round(
      (peersPool.reduce((acc, w) => acc + w.skills.length, 0) /
        peersPool.length) *
        10
    ) / 10;
  const avgTradeExperience =
    Math.round(
      (peersPool.reduce((acc, w) => acc + w.experienceYears, 0) /
        peersPool.length) *
        10
    ) / 10;
  const avgTradeDailyRate = Math.round(
    peersPool.reduce((acc, w) => acc + w.dailyRate, 0) / peersPool.length
  );
  const avgTradeBadges =
    Math.round(
      (peersPool.reduce(
        (acc, w) =>
          acc +
          (w.verifiedBadges || []).filter((b) => b.status === 'verified')
            .length,
        0
      ) /
        peersPool.length) *
        10
    ) / 10;
  const avgTradeRating =
    Math.round(
      (peersPool.reduce((acc, w) => acc + w.rating, 0) / peersPool.length) * 10
    ) / 10;

  // High-demand skills in this trade missing from current worker
  const workerSkillsLower = worker.skills.map((s) => s.toLowerCase());
  const demandSkillFreq: Record<string, number> = {};
  jobs
    .filter((j) => j.trade === worker.trade || jobs.length <= 3)
    .forEach((j) => {
      [...j.requiredSkills, ...j.preferredSkills].forEach((skill) => {
        if (!workerSkillsLower.includes(skill.toLowerCase())) {
          demandSkillFreq[skill] = (demandSkillFreq[skill] || 0) + 1;
        }
      });
    });

  const highDemandMissingSkills = Object.entries(demandSkillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([skill]) => skill);

  const competitiveStrengths: string[] = [];
  if (worker.skills.length >= avgTradeSkills) {
    competitiveStrengths.push(
      `Broad technical stack (${worker.skills.length} skills vs ${avgTradeSkills} trade avg)`
    );
  }
  const verifiedCount = (worker.verifiedBadges || []).filter(
    (b) => b.status === 'verified'
  ).length;
  if (verifiedCount >= 2) {
    competitiveStrengths.push(
      `Dual-accredited badge tier unlocking top priority in employer searches`
    );
  } else if (verifiedCount === 1) {
    competitiveStrengths.push(
      `Verified industry credential active (+10% to +15% ranking multiplier)`
    );
  }
  if (worker.experienceYears >= avgTradeExperience) {
    competitiveStrengths.push(
      `Senior field tenure (${worker.experienceYears} yrs vs ${avgTradeExperience} yrs avg)`
    );
  }
  if (worker.rating >= 4.7) {
    competitiveStrengths.push(
      `Elite reliability score (${worker.rating}/5.0 across ${worker.completedGigs} gigs)`
    );
  }
  if (competitiveStrengths.length === 0) {
    competitiveStrengths.push(
      `Competitive daily rate positioning (₹${worker.dailyRate}/day vs ₹${avgTradeDailyRate} market avg)`
    );
  }

  return {
    tradeRank,
    totalPeersInTrade: peersPool.length,
    overallRank,
    totalWorkers: allScored.length,
    percentile,
    competitionScore,
    avgTradeSkills,
    avgTradeExperience,
    avgTradeDailyRate,
    avgTradeBadges,
    avgTradeRating,
    highDemandMissingSkills,
    competitiveStrengths,
    peerStandings,
  };
}

// =========================================================================
// MODULE 7: JOB RECOMMENDATION MODULE
// =========================================================================
export function generateJobRecommendations(
  worker: WorkerProfile,
  jobs: JobVacancy[],
  applications: JobApplication[],
  bookmarkedJobIds: string[],
  weights: MatchingWeights = DEFAULT_WEIGHTS
): JobRecommendationItem[] {
  return jobs
    .filter((job) => job.status === 'open' || job.status === 'in_progress')
    .map((job) => {
      const score = computeCompatibilityScore(worker, job, weights, true);
      const skillAnalysis = analyzeSkillMatch(worker, job);
      const application = applications.find(
        (app) => app.jobId === job.id && app.workerId === worker.id
      );
      const isApplied = Boolean(application);
      const isBookmarked = bookmarkedJobIds.includes(job.id);

      let fitCategory: JobRecommendationItem['fitCategory'] = 'Explore';
      if (score.totalScore >= 80) {
        fitCategory = 'Top Recommended';
      } else if (
        score.totalScore >= 65 &&
        skillAnalysis.requiredMissing.length <= 1
      ) {
        fitCategory = 'Strong Skill Fit';
      } else if (
        skillAnalysis.requiredMissing.length >= 1 &&
        skillAnalysis.requiredMissing.length <= 2 &&
        worker.trade === job.trade
      ) {
        fitCategory = 'Upskill Opportunity';
      }

      const reasons: string[] = [];
      if (skillAnalysis.requiredMatched.length > 0) {
        reasons.push(
          `Matches ${skillAnalysis.requiredMatched.length}/${skillAnalysis.requiredTotal} required skills (${skillAnalysis.requiredCoveragePct}%)`
        );
      }
      if (score.verifiedBadgeMultiplier && score.verifiedBadgeMultiplier > 1.0) {
        reasons.push(
          `Verified credentials boost score by ${score.verifiedBadgeMultiplier}x`
        );
      }
      if (score.distanceKm <= worker.location.maxTravelDistanceKm) {
        reasons.push(
          `Within travel radius (${score.distanceKm} km from ${worker.location.city})`
        );
      }
      if (score.breakdown.compensationScore >= 90) {
        reasons.push(
          `Meets your compensation target (₹${job.payRate}/${job.payType})`
        );
      }
      if (job.urgency === 'immediate' || job.urgency === 'urgent') {
        reasons.push(`Priority hiring (${job.urgency.toUpperCase()})`);
      }

      return {
        job,
        score,
        skillAnalysis,
        fitCategory,
        reasons,
        isApplied,
        isBookmarked,
        application,
      };
    })
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}
