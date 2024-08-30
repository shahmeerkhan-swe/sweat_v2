const { roundToNearestHalf, safeDivide } = require('./helpers');
const Module = require('../models/module');

// Calculate preparation time distributions for coursework that is not of type exam
const calculatePreparationDistributions = (
  coursework,
  studyStyle,
  semester,
) => {
  if (!coursework) {
    throw new Error('Coursework is undefined');
  }

  const isWholeSession = semester.toLowerCase() === 'whole session';
  const totalWeeks = isWholeSession
    ? 33
    : semester.toLowerCase() === 'second'
      ? 18
      : 15;
  const workloadData = Array(totalWeeks)
    .fill(0)
    .map((_, i) => ({ week: i + 1, coursework: 0 }));

  const { preparationTime, deadlineWeek, releasedWeekPrior } = coursework;
  let actualStartWeek =
    deadlineWeek - (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior ?? 0);
  if (actualStartWeek < 1) {
    actualStartWeek = 1;
  }
  let totalPreparationTime = preparationTime || 0;

  const distributeTime = (startWeek, endWeek, timePerWeek) => {
    for (let week = startWeek; week <= endWeek; week++) {
      if (week > 0 && week <= totalWeeks) {
        workloadData[week - 1].coursework += roundToNearestHalf(timePerWeek);
      }
    }
  };

  switch (studyStyle) {
    case 'earlyStarter':
      const weeksForDistribution1 = deadlineWeek - actualStartWeek + 1;
      let timePerWeek1 = safeDivide(
        totalPreparationTime,
        weeksForDistribution1,
      );
      distributeTime(actualStartWeek, deadlineWeek, timePerWeek1);
      break;
    case 'steady':
      if (actualStartWeek > 0 && actualStartWeek <= totalWeeks) {
        const weeksForDistribution2 =
          deadlineWeek -
          (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior) +
          1;
        const incrementValue = safeDivide(
          2 * totalPreparationTime -
            2 * (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior) -
            2,
          (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior) *
            (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior) +
            (releasedWeekPrior === 'N/A' ? 2 : releasedWeekPrior),
        );
        let cumulativeTime = 1;
        workloadData[actualStartWeek - 1].coursework += 1; // First week always 1 hour
        for (let week = actualStartWeek + 1; week <= deadlineWeek; week++) {
          if (week > 0 && week <= totalWeeks) {
            cumulativeTime += incrementValue;
            workloadData[week - 1].coursework +=
              roundToNearestHalf(cumulativeTime);
          }
        }
      } else {
        throw new Error(`Invalid actual start week: ${actualStartWeek}`);
      }
      break;
    case 'justInTime':
      if (deadlineWeek > 0 && deadlineWeek <= totalWeeks) {
        workloadData[deadlineWeek - 1].coursework +=
          roundToNearestHalf(totalPreparationTime);
      } else {
        throw new Error(`Invalid deadline week: ${deadlineWeek}`);
      }
      break;
    default:
      throw new Error(`Unknown study style: ${studyStyle}`);
  }

  return workloadData.map((data) => ({
    week: data.week,
    hours: data.coursework,
  }));
};

const calculatePreparationTimeDistributions = (coursework, semester) => {
  const studyStyles = ['earlyStarter', 'steady', 'justInTime'];
  return studyStyles.map((style) => ({
    type: style,
    distribution: calculatePreparationDistributions(
      coursework,
      style,
      semester,
    ),
  }));
};

// Calculate private study time distribution for a given ratio using teachingSchedule
const calculatePrivateStudyDistribution = (
  teachingSchedule,
  privateStudyTime,
  ratio,
  totalWeeks,
  readingWeeks,
  semester,
) => {
  const workloadData = Array(totalWeeks)
    .fill(0)
    .map((_, i) => ({ week: i + 1, hours: 0 }));

  let totalAllocatedTime = 0;

  // Function to check if a week is a reading week
  const isReadingWeek = (week) => {
    if (Array.isArray(readingWeeks)) {
      return readingWeeks.includes(week);
    } else if (readingWeeks && typeof readingWeeks === 'object') {
      const { sem1, sem2 } = readingWeeks;
      if (semester.toLowerCase() === 'whole session') {
        // Map week to the respective semester
        if (week <= 15) {
          return sem1 && sem1.includes(week);
        } else {
          return sem2 && sem2.includes(week - 15);
        }
      } else {
        return (sem1 && sem1.includes(week)) || (sem2 && sem2.includes(week));
      }
    }
    return false;
  };

  Object.values(teachingSchedule).forEach((activity) => {
    if (activity.distribution && Array.isArray(activity.distribution)) {
      activity.distribution.forEach((week, index) => {
        const weekNumber = week.week;
        const prevWeekNumber =
          index > 0 ? activity.distribution[index - 1].week : weekNumber;
        const prevWeekHours =
          index > 0 ? activity.distribution[index - 1].hours : week.hours;
        const effectiveHours = isReadingWeek(weekNumber)
          ? prevWeekHours
          : week.hours;
        const studyHours = roundToNearestHalf(effectiveHours * ratio);
        workloadData[weekNumber - 1].hours += studyHours;
        totalAllocatedTime += studyHours;
      });
    }
  });

  const remainingTime = Math.max(privateStudyTime - totalAllocatedTime, 0);

  return { distribution: workloadData, remainingTime, totalAllocatedTime };
};

const calculatePrivateStudyDistributions = (
  teachingSchedule,
  coursework,
  semester,
  readingWeeks,
) => {
  const isWholeSession = semester.toLowerCase() === 'whole session';
  const totalWeeks = isWholeSession
    ? 33
    : semester.toLowerCase() === 'second'
      ? 18
      : 15;

  if (coursework.type !== 'exam') {
    throw new Error(
      "Private study distributions should only be calculated for coursework of type 'exam'.",
    );
  }

  const { privateStudyTime } = coursework;
  const ratios = [0, 0.5, 1, 2];
  const privateStudyDistributions = ratios.map((ratio) => {
    const { distribution, remainingTime, totalAllocatedTime } =
      calculatePrivateStudyDistribution(
        teachingSchedule,
        privateStudyTime,
        ratio,
        totalWeeks,
        readingWeeks,
        semester,
      );

    // Adjust for the case where 2x ratio exceeds privateStudyTime
    const adjustedRemainingTime =
      ratio === 2 && totalAllocatedTime > privateStudyTime ? 4 : remainingTime;

    return {
      type: `ratio${ratio.toString().replace('.', '_')}`,
      distribution: distribution.map((data) => ({
        week: data.week,
        hours: data.hours,
      })),
      remainingTime: adjustedRemainingTime,
    };
  });

  return privateStudyDistributions;
};

const calculateRemainingPreparationDistributions = (
  remainingTime,
  studyStyle,
  semester,
  type,
) => {
  const isWholeSession = semester.toLowerCase() === 'whole session';
  const startWeek = isWholeSession
    ? 31
    : semester.toLowerCase() === 'second'
      ? 16
      : 13;
  const endWeek = isWholeSession
    ? 33
    : semester.toLowerCase() === 'second'
      ? 18
      : 15;
  const totalWeeks = endWeek - startWeek + 1;

  const workloadData = Array(totalWeeks)
    .fill(0)
    .map((_, i) => ({ week: startWeek + i, hours: 0 }));

  const distributeTime = (startWeek, endWeek, timePerWeek) => {
    for (let week = startWeek; week <= endWeek; week++) {
      workloadData[week - startWeek].hours += roundToNearestHalf(timePerWeek);
    }
  };

  switch (studyStyle) {
    case 'earlyStarter':
      const weeksForDistribution1 = endWeek - startWeek + 1;
      let timePerWeek1 = safeDivide(
        remainingTime > 0 ? remainingTime : 4,
        weeksForDistribution1,
      );
      distributeTime(startWeek, endWeek, timePerWeek1);
      break;
    case 'steady':
      const weeksForDistribution2 = endWeek - startWeek + 1;
      const incrementValue = safeDivide(
        2 * (remainingTime > 0 ? remainingTime : 4) - 2,
        (weeksForDistribution2 * (weeksForDistribution2 + 1)) / 2,
      );
      let cumulativeTime = 1;
      workloadData[0].hours += 1; // First week always 1 hour
      for (let week = startWeek + 1; week <= endWeek; week++) {
        cumulativeTime += incrementValue;
        workloadData[week - startWeek].hours +=
          roundToNearestHalf(cumulativeTime);
      }
      break;
    case 'justInTime':
      workloadData[endWeek - startWeek].hours += roundToNearestHalf(
        remainingTime > 0 ? remainingTime : 4,
      );
      break;
    default:
      throw new Error(`Unknown study style: ${studyStyle}`);
  }

  return workloadData.map((data) => ({ week: data.week, hours: data.hours }));
};

const calculateCompleteDistributions = (
  teachingSchedule,
  coursework,
  semester,
  readingWeeks,
) => {
  try {
    if (coursework.type !== 'exam') {
      return {
        privateStudyDistributions: [],
        preparationTimeDistributions: calculatePreparationTimeDistributions(
          coursework,
          semester,
        ),
      };
    }

    // Update the deadlineWeek for exam coursework
    coursework.deadlineWeek =
      semester.toLowerCase() === 'whole session'
        ? 33
        : semester.toLowerCase() === 'second'
          ? 18
          : 15;

    const privateStudyDistributions = calculatePrivateStudyDistributions(
      teachingSchedule,
      coursework,
      semester,
      readingWeeks,
    );

    const remainingTime = privateStudyDistributions.map(
      (item) => item.remainingTime,
    );

    const studyStyles = ['earlyStarter', 'steady', 'justInTime'];
    const preparationTimeDistributions = studyStyles
      .map((style) => {
        return remainingTime.map((time, index) => ({
          type: `${style}_${privateStudyDistributions[index].type}`,
          distribution: calculateRemainingPreparationDistributions(
            time,
            style,
            semester,
            privateStudyDistributions[index].type,
          ),
        }));
      })
      .flat();

    return {
      privateStudyDistributions,
      preparationTimeDistributions,
    };
  } catch (error) {
    console.error('Error in calculateCompleteDistributions:', error);
    throw error;
  }
};

const calculateAggregatedData = async (
  moduleCodes,
  studyStyle,
  ratio,
  semester,
) => {
  try {
    const modules = await Module.find({
      'moduleSetup.moduleCode': { $in: moduleCodes },
    });

    const aggregatedData = {};

    modules.forEach((module) => {
      const moduleCode = module.moduleSetup.moduleCode;
      const moduleSemester = module.moduleSetup.semester;

      // Initialize the module's data in the aggregatedData object
      if (!aggregatedData[moduleCode]) {
        aggregatedData[moduleCode] = {};
      }

      // Helper function to handle week adjustments based on semester
      const adjustWeek = (week) => {
        if (moduleSemester === 'whole session') {
          if (semester === 'second' && week > 15) {
            return week - 15; // Map weeks 16-33 to weeks 1-18 for the second semester
          } else if (semester === 'first' && week <= 15) {
            return week; // Use weeks 1-15 as-is for the first semester
          }
        } else if (moduleSemester === semester) {
          return week; // Use week as-is if module's semester matches the requested semester
        }
        return null; // Week should not be considered for this semester
      };

      // Step 1: Aggregate Teaching Schedule Distributions
      Object.values(module.teachingSchedule).forEach((schedule) => {
        if (schedule && schedule.distribution) {
          schedule.distribution.forEach(({ week, hours }) => {
            const adjustedWeek = adjustWeek(week);
            if (adjustedWeek !== null) {
              if (!aggregatedData[moduleCode][adjustedWeek]) {
                aggregatedData[moduleCode][adjustedWeek] = 0;
              }
              aggregatedData[moduleCode][adjustedWeek] += hours;
            }
          });
        }
      });

      // Step 2: Aggregate Coursework Preparation Time Distributions
      module.courseworkList.forEach((coursework) => {
        let relevantDistribution;

        if (coursework.type === 'exam') {
          const combinedType = `${studyStyle}_ratio${ratio}`;
          relevantDistribution = coursework.preparationTimeDistributions.find(
            (dist) => dist.type === combinedType,
          );
        } else {
          relevantDistribution = coursework.preparationTimeDistributions.find(
            (dist) => dist.type === studyStyle,
          );
        }

        if (relevantDistribution) {
          relevantDistribution.distribution.forEach(({ week, hours }) => {
            const adjustedWeek = adjustWeek(week);
            if (adjustedWeek !== null) {
              if (!aggregatedData[moduleCode][adjustedWeek]) {
                aggregatedData[moduleCode][adjustedWeek] = 0;
              }
              aggregatedData[moduleCode][adjustedWeek] += hours;
            }
          });
        }
      });

      // Step 3: Aggregate Private Study Distributions
      const privateStudyDistribution = module.privateStudyDistributions.find(
        (dist) => dist.type === ratio,
      );

      if (privateStudyDistribution) {
        privateStudyDistribution.distribution.forEach(({ week, hours }) => {
          const adjustedWeek = adjustWeek(week);
          if (adjustedWeek !== null) {
            if (!aggregatedData[moduleCode][adjustedWeek]) {
              aggregatedData[moduleCode][adjustedWeek] = 0;
            }
            aggregatedData[moduleCode][adjustedWeek] += hours;
          }
        });
      }
    });

    // Determine the maximum week number based on the semester
    const maxWeek = semester === 'second' ? 18 : 15;

    // Generate the weeks array dynamically based on the maxWeek value
    const weeks = Array.from({ length: maxWeek }, (_, i) => i + 1);

    // Convert aggregatedData into an array of objects suitable for the frontend
    const result = weeks.map((week) => {
      const weekData = { week: `Week ${week}` };
      moduleCodes.forEach((moduleCode) => {
        weekData[moduleCode] = aggregatedData[moduleCode][week] || 0;
      });
      return weekData;
    });

    return result;
  } catch (error) {
    console.error('Error aggregating module data:', error);
    throw new Error('Data aggregation failed');
  }
};

module.exports = {
  calculatePreparationTimeDistributions,
  calculatePrivateStudyDistributions,
  calculateCompleteDistributions,
  calculateAggregatedData,
};
