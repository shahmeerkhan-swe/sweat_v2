import { ModuleDocument } from '../../admin/CreateModule';

export interface FiltersProps {
  year: number;
  setYear: (value: number) => void;
  programme: string;
  setProgramme: (value: string) => void;
  semester: 'first' | 'second' | 'whole session' | 'wholeSession';
  setSemester: (
    value: 'first' | 'second' | 'whole session' | 'wholeSession',
  ) => void;
}

export interface CourseworkCalendarProps {
  semester: 'first' | 'second' | 'whole session' | 'wholeSession';
  programme: string;
  modules: ModuleDocument[];
  year: number;
  readingWeeks?: number[] | { sem1: number[]; sem2: number[] };
  // @ts-expect-error any type here works
  semester1Start?;
  // @ts-expect-error any type here works
  semester2Start?;
}

export interface OptionType {
  label: string;
  value: string;
}

export interface AggregatedData {
  week: string;
  [moduleCode: string]: number | string; // Allows dynamic module codes
}

export interface StudentWorkloadGraphProps {
  modules: ModuleDocument[];
  semester: 'first' | 'second' | 'whole session' | 'wholeSession';
}
