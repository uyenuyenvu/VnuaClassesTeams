import { Semester } from './semester';
import { Student } from './student';

export class TeachingClass {
    subjectId: string;
    subjectGroup: string;
    displayName?: string;
    credit: number;
    subjectName: string;
    classCodes: string;
    location: string;
    dayOfWeek: number;
    createStatus: ClassCreateStatus = { type: 'none' };
    semester: Semester;
    occurences: ClassOccurence[] = [];
    hasOnlineMeeting?: boolean;
    students: {
        url: string;
        value: Student[];
    };
}

class ClassOccurence {
    daysOfWeeks: number[];
    startPeriod: number;
    endPeriod: number;
    location: string;
    practiceGroup: string | null;
    students: Student[];
    weekStr: string;
}

export type ClassCreateStatus =
    | {
          type: 'success';
      }
    | {
          type: 'error';
          message: string;
      }
    | { type: 'none' };
