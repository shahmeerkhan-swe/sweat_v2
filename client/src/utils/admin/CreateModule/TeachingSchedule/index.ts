import { fetchModuleTemplate } from '../../../../services/admin/CreateModule/TeachingSchedule';
import {
  TeachingScheduleSaveData,
  Distribution,
} from '../../../../types/admin/CreateModule/TeachingSchedule';

export const fetchTemplateData = async (
  moduleCredit: number,
  semester: string,
  setTemplateData: (data: number[][][]) => void,
) => {
  const template = await fetchModuleTemplate(moduleCredit, semester);
  setTemplateData(template);
};

export const getSemesterHeading = (semester: string): string => {
  if (semester === 'First') {
    return 'First Semester';
  } else if (semester === 'Second') {
    return 'Second Semester';
  } else {
    return `${semester.charAt(0).toUpperCase() + semester.slice(1)} Semester`;
  }
};

export const transformTemplateDataToSaveData = (
  templateData: number[][][],
): TeachingScheduleSaveData => {
  const teachingScheduleSaveData: TeachingScheduleSaveData = {
    lectures: { hours: 0 },
    tutorials: { hours: 0 },
    labs: { hours: 0 },
    seminars: { hours: 0 },
    fieldworkPlacement: { hours: 0 },
    other: { hours: 0 },
  };
  const activityKeys: (keyof TeachingScheduleSaveData)[] = [
    'lectures',
    'tutorials',
    'labs',
    'seminars',
    'fieldworkPlacement',
    'other',
  ];

  const isWholeSession = templateData.length === 2;
  const totalWeeks = isWholeSession ? 33 : templateData[0][0].length;

  templateData.forEach((semesterData, semesterIndex) => {
    const startWeek = semesterIndex === 0 ? 1 : 16;

    semesterData.forEach((row, rowIndex) => {
      const activityKey = activityKeys[rowIndex];
      if (activityKey) {
        const distribution = row.map((hours, weekIndex) => ({
          week: startWeek + weekIndex,
          hours,
        }));

        const activity = teachingScheduleSaveData[activityKey];
        activity.hours += distribution.reduce(
          (total, dist) => total + dist.hours,
          0,
        );

        if (!activity.distribution) {
          activity.distribution = [];
        }
        activity.distribution.push(...distribution);
      }
    });
  });

  // Ensure all weeks up to totalWeeks are represented
  activityKeys.forEach((key) => {
    const activity = teachingScheduleSaveData[key];
    if (activity.distribution) {
      const fullDistribution = Array.from({ length: totalWeeks }, (_, i) => ({
        week: i + 1,
        hours: 0,
      }));

      activity.distribution.forEach((d) => {
        const index = fullDistribution.findIndex((fd) => fd.week === d.week);
        if (index !== -1) {
          fullDistribution[index] = d;
        }
      });

      activity.distribution = fullDistribution;
    }
  });

  return teachingScheduleSaveData;
};

export const transformEditingDataToTemplateData = (
  scheduleData: TeachingScheduleSaveData,
  templateType: 'first' | 'second' | 'whole session',
): number[][][] => {
  const splitDistribution = (
    distribution: Distribution[] = [],
    firstSemesterWeeks: number,
    secondSemesterWeeks: number,
  ): [Distribution[], Distribution[]] => {
    const firstSemester = distribution.filter(
      (item) => item.week <= firstSemesterWeeks,
    );
    const secondSemester = distribution.filter(
      (item) =>
        item.week > firstSemesterWeeks &&
        item.week <= firstSemesterWeeks + secondSemesterWeeks,
    );
    return [firstSemester, secondSemester];
  };

  const createWeekArray = (
    distribution: Distribution[] = [],
    weeks: number,
    startWeek: number = 1,
  ): number[] => {
    const weekArray = new Array(weeks).fill(0);
    distribution.forEach((item) => {
      const index = item.week - startWeek;
      if (index >= 0 && index < weeks) {
        weekArray[index] = item.hours;
      }
    });
    return weekArray;
  };

  const firstSemesterWeeks = 15;
  const secondSemesterWeeks = 18;

  const [lecturesFirst, lecturesSecond] = splitDistribution(
    scheduleData.lectures?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );
  const [tutorialsFirst, tutorialsSecond] = splitDistribution(
    scheduleData.tutorials?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );
  const [labsFirst, labsSecond] = splitDistribution(
    scheduleData.labs?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );
  const [seminarsFirst, seminarsSecond] = splitDistribution(
    scheduleData.seminars?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );
  const [fieldworkFirst, fieldworkSecond] = splitDistribution(
    scheduleData.fieldworkPlacement?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );
  const [otherFirst, otherSecond] = splitDistribution(
    scheduleData.other?.distribution,
    firstSemesterWeeks,
    secondSemesterWeeks,
  );

  const createSemesterData = (
    distributions: Distribution[][],
    weeks: number,
    startWeek: number = 1,
  ) => [
    createWeekArray(distributions[0], weeks, startWeek),
    createWeekArray(distributions[1], weeks, startWeek),
    createWeekArray(distributions[2], weeks, startWeek),
    createWeekArray(distributions[3], weeks, startWeek),
    createWeekArray(distributions[4], weeks, startWeek),
    createWeekArray(distributions[5], weeks, startWeek),
  ];

  switch (templateType) {
    case 'first':
      return [
        createSemesterData(
          [
            lecturesFirst,
            tutorialsFirst,
            labsFirst,
            seminarsFirst,
            fieldworkFirst,
            otherFirst,
          ],
          firstSemesterWeeks,
        ),
      ];
    case 'second':
      return [
        createSemesterData(
          [
            lecturesSecond,
            tutorialsSecond,
            labsSecond,
            seminarsSecond,
            fieldworkSecond,
            otherSecond,
          ],
          secondSemesterWeeks,
          firstSemesterWeeks + 1,
        ),
      ];
    case 'whole session':
      return [
        createSemesterData(
          [
            lecturesFirst,
            tutorialsFirst,
            labsFirst,
            seminarsFirst,
            fieldworkFirst,
            otherFirst,
          ],
          firstSemesterWeeks,
        ),
        createSemesterData(
          [
            lecturesSecond,
            tutorialsSecond,
            labsSecond,
            seminarsSecond,
            fieldworkSecond,
            otherSecond,
          ],
          secondSemesterWeeks,
          firstSemesterWeeks + 1,
        ),
      ];
    default:
      throw new Error('Invalid template type');
  }
};

export const handleInputChange = (
  tableIndex: number,
  rowIndex: number,
  colIndex: number,
  value: string, // Keep value as a string
  templateData: number[][][],
  setTemplateData: (data: number[][][]) => void,
  isReadingWeek: boolean, // Pass whether it's a reading week
) => {
  // Create a deep copy of templateData to ensure immutability
  const updatedData = [...templateData];

  // If it's a reading week, force the value to be 0
  if (isReadingWeek) {
    updatedData[tableIndex][rowIndex][colIndex] = 0;
    setTemplateData(updatedData);
    return;
  }

  // Allow empty string for backspacing (for UI purposes)
  if (value === '') {
    // Ensure row and column are properly initialized before assignment
    if (!updatedData[tableIndex]) updatedData[tableIndex] = [];
    if (!updatedData[tableIndex][rowIndex])
      updatedData[tableIndex][rowIndex] = [];

    // Temporarily hold an empty string (don't update the underlying data yet)
    updatedData[tableIndex][rowIndex][colIndex] = NaN; // Store NaN temporarily, which we'll ignore in display
    setTemplateData(updatedData);
    return;
  }

  // Parse the input value into a number once it’s no longer an empty string
  const parsedValue = parseInt(value);
  if (isNaN(parsedValue)) return; // Don't update if the value isn't a valid number

  // Ensure row and column are properly initialized before assignment
  if (!updatedData[tableIndex]) updatedData[tableIndex] = [];
  if (!updatedData[tableIndex][rowIndex])
    updatedData[tableIndex][rowIndex] = [];

  // Update the specific cell with the parsed number
  updatedData[tableIndex][rowIndex][colIndex] = parsedValue;

  // Set the new templateData state
  setTemplateData(updatedData);
};

export const updateTemplateDataForReadingWeek = (
  templateData: number[][][],
  readingWeeks: number[] | { sem1: number[]; sem2: number[] },
): number[][][] => {
  const updatedTemplateData = templateData.map(
    (semesterData, semesterIndex) => {
      // Determine the weeks to use based on the semesterIndex and type of readingWeeks
      let weeks: number[] = [];
      if (Array.isArray(readingWeeks)) {
        weeks = readingWeeks;
      } else if (readingWeeks && typeof readingWeeks === 'object') {
        weeks = semesterIndex === 0 ? readingWeeks.sem1 : readingWeeks.sem2;
      } else {
        console.error('Unexpected format for readingWeeks:', readingWeeks);
      }

      // Ensure weeks is always an array
      if (!Array.isArray(weeks)) {
        console.error('Weeks is not an array:', weeks);
        weeks = [];
      }

      return semesterData.map((contactTimeData) => {
        return contactTimeData.map((hours, weekIndex) => {
          const adjustedWeekIndex =
            semesterIndex === 1 ? weekIndex + 1 : weekIndex + 1;
          if (weeks.includes(adjustedWeekIndex)) {
            return 0;
          }
          return hours;
        });
      });
    },
  );

  return updatedTemplateData;
};
