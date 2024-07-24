import axios from 'axios';
import format from 'date-fns/format';
import getDay from 'date-fns/getDay';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
// import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import './StudentCalendar.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditTermDateModal from './EditCourseworkCalendarModal';
import { CalendarKeyDateEvent } from '../../shared/types';
// for getting abus module data

import { Programme } from '../../../shared/types';
import { fetchData } from '../../../utils/admin/ProgrammeDesigner';

import { ModuleInstance } from '../../../types/admin/ProgrammeDesigner';
import { ModuleDocument } from '../../../types/admin/CreateModule';

import EffortGraph from '../../Graph/EffortGraph';

// import { TeachingSchedule, InputData } from '../../Graph/GraphTypes';

const locales = {};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventsOnCalendar: CalendarKeyDateEvent[] = [];

const baseURL = import.meta.env.VITE_API_BASE_URL + 'calendar/';

// Add all to calendar does not work because it will open a new tab with the calendar event for each event
// TODO: move the bank holidays fetching func to a separate file
// TODO: move code to respective components

function StudentCalendar() {
  const [programmeState, setProgrammeState] = useState<Programme[]>([]);
  const [searchResults, setSearchResults] = useState<ModuleDocument[]>([]);

  console.log('Programme state:', programmeState); // this is to avoid typescript errors
  console.log('Search results:', searchResults); // this is to avoid typescript errors

  const [moduleInstances, setModuleInstances] = useState<ModuleInstance[]>([]);

  const [showKeyDatesTable, setShowKeyDatesTable] = useState(false);
  const [showDatesCalendar, setShowDatesCalendar] = useState(false);

  const [currentChosenSemester, setCurrentChosenSemester] =
    useState<string>('sem1');

  useEffect(() => {
    fetchData(setProgrammeState, setSearchResults, setModuleInstances);
  }, []);

  console.log(moduleInstances);
  // console.log(programmeState); // this is to avoid typescript errors
  // console.log(searchResults); // this is to avoid typescript errors

  const [academicYear, setAcademicYear] = useState<string>('2024/25');

  // course CS means no reading week, EE means reading week.
  // This is used to filter out reading week events, but this distinction is not shown to the user, they can just select yes or no for reading week
  const [course, setCourse] = useState('CS'); // State for selected course

  // const [holidayEvent, setHolidayEvent] = useState({
  //   title: '',
  //   allDay: true,
  //   start: new Date(),
  //   end: new Date(),
  // });

  const [semester1Event, setSemester1Event] = useState({
    title: 'Semester 1 Start Date', // hardcoded to prevent changing the title to anything else
    allDay: true,
    start: new Date(),
    end: new Date(),
  });

  const [semester2Event, setSemester2Event] = useState({
    title: 'Semester 2 Start Date', // hardcoded to prevent changing the title to anything else
    allDay: true,
    start: new Date(),
    end: new Date(),
  });

  const [easterBreakEvent, setEasterBreakEvent] = useState({
    title: 'Easter Break',
    allDay: true,
    start: new Date(),
    end: new Date(),
  });

  console.log('easterBreakEvent:', easterBreakEvent); // this is to avoid typescript errors

  const [christmasBreakEvent, setChristmasBreakEvent] = useState({
    title: 'Christmas Break',
    allDay: true,
    start: new Date(),
    end: new Date(),
  });

  console.log('christmasBreakEvent:', christmasBreakEvent); // this is to avoid typescript errors

  const [newEvent, setNewEvent] = useState({
    title: '',
    allDay: true,
    start: new Date(),
    end: new Date(),
  });

  // state that will be used to render the calendar
  const [events, setEvents] =
    useState<CalendarKeyDateEvent[]>(eventsOnCalendar);

  const [fetchedItems, setFetchedItems] = useState<CalendarKeyDateEvent[]>([]);

  // State for managing calendar versions
  const [currentVersion, setCurrentVersion] = useState(1);
  const [versions, setVersions] = useState<number[]>([1]);

  console.log('versions:', versions); // this is to avoid typescript errors

  // fetch events from the server and set the events state
  useEffect(() => {
    // Clear existing events when changing the calendar version
    setEvents([]);

    const fetchData = async () => {
      const res = await fetch(baseURL);
      const data = await res.json();

      // Search for events with titles "Semester 1 Start Date" and "Semester 2 Start Date"
      const semester1StartDateEvent = data.find((event: CalendarKeyDateEvent) =>
        event.title.includes('Semester 1 Start Date'),
      );
      const semester2StartDateEvent = data.find((event: CalendarKeyDateEvent) =>
        event.title.includes('Semester 2 Start Date'),
      );

      // Extract semester start dates
      let semester1Start: Date | null = null;
      let semester2Start: Date | null = null;
      if (semester1StartDateEvent) {
        semester1Start = new Date(semester1StartDateEvent.start);
      }
      if (semester2StartDateEvent) {
        semester2Start = new Date(semester2StartDateEvent.start);
      }

      // Log the dates of these events and assign them to global variables
      if (semester1Start) {
        console.log('Semester 1 start date:', semester1Start);
        setSemester1Event({
          ...semester1Event,
          start: semester1Start,
        });
      }
      if (semester2Start) {
        console.log('Semester 2 start date:', semester2Start);
        setSemester2Event({
          ...semester2Event,
          start: semester2Start,
        });
      }

      // extract easter start and end dates
      const easterBreakEvent = data.find((event: CalendarKeyDateEvent) =>
        event.title.includes('Easter Break'),
      );

      if (easterBreakEvent) {
        console.log('Easter break start date:', easterBreakEvent.start);
        console.log('Easter break end date:', easterBreakEvent.end);
        setEasterBreakEvent({
          ...easterBreakEvent,
          start: new Date(easterBreakEvent.start),
          end: new Date(easterBreakEvent.end),
        });
      }

      // extract christmas start and end dates
      const christmasBreakEvent = data.find((event: CalendarKeyDateEvent) =>
        event.title.includes('Christmas Break'),
      );

      if (christmasBreakEvent) {
        console.log('Christmas break start date:', christmasBreakEvent.start);
        console.log('Christmas break end date:', christmasBreakEvent.end);
        setChristmasBreakEvent({
          ...christmasBreakEvent,
          start: new Date(christmasBreakEvent.start),
          end: new Date(christmasBreakEvent.end),
        });
      }

      // extract reading week start and end dates
      const readingWeekEvent = data.find((event: CalendarKeyDateEvent) =>
        event.title.includes('Reading Week'),
      );

      if (readingWeekEvent) {
        console.log('Reading week start date:', readingWeekEvent.start);
        console.log('Reading week end date:', readingWeekEvent.end);
      }

      setFetchedItems(data);
      console.log('Fetched items: ', data);

      // Extract all version numbers from the fetched events
      const versionNumbers = new Set<number>();
      data.forEach((event: CalendarKeyDateEvent) => {
        const match = event.title.match(/CV(\d+)/);
        if (match) {
          versionNumbers.add(Number(match[1]));
        }
      });

      // Sort the version numbers in ascending order
      const versionsArray = Array.from(versionNumbers).sort((a, b) => a - b);
      setVersions(versionsArray.length > 0 ? versionsArray : [1]);

      // Set default version to 1 if it exists, otherwise use the last version
      setCurrentVersion(
        versionsArray.includes(1) ? 1 : versionsArray[versionsArray.length - 1],
      );
    };
    fetchData();
  }, []);

  // Ensure currentVersion defaults to 1 if it's not set
  // this is because if there are no events with CV* in the title, the currentVersion will be undefined, so we set it to 1 (CV1)
  useEffect(() => {
    if (!currentVersion) {
      setCurrentVersion(1);
    }
  }, [currentVersion]);

  // this if we want to keep the fetched bank holidays stored only locally (not in MongoDB)
  // Add the fetched items to existing events
  useEffect(() => {
    const localNewEvents = fetchedItems.map((item: CalendarKeyDateEvent) => ({
      _id: item._id,
      title: `${item.title}`,
      start: new Date(item.start),
      end: new Date(item.end),
      allDay: item.allDay,
    }));

    // Filter out "Reading Week" event if the course is CS
    const filteredEvents =
      course === 'CS'
        ? localNewEvents.filter(
            (event) => !event.title.includes('Reading Week'),
          )
        : localNewEvents;

    const versionFilteredEvents = filteredEvents.filter((event) => {
      const titleSuffix = `CV${currentVersion}`;
      // Filter out events that don't have the current version suffix
      return event.title.includes(titleSuffix) || !event.title.includes('CV');
    });

    const academicYearFilteredEvents = versionFilteredEvents.filter((event) =>
      event.title.includes(academicYear),
    );

    setEvents(academicYearFilteredEvents);

    setEvents((prevEvents) => {
      const uniqueNewEvents = academicYearFilteredEvents.filter((newEvent) =>
        prevEvents.every((existingEvent) => existingEvent._id !== newEvent._id),
      );

      const updatedEvents = [...prevEvents, ...uniqueNewEvents];

      if (course === 'CS') {
        return updatedEvents.filter(
          (event) => !event.title.includes('Reading Week'),
        );
      }

      return [...prevEvents, ...uniqueNewEvents];
    });
  }, [fetchedItems, course, currentVersion, academicYear]);

  // function to handle academic year change
  const handleAcademicYearChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedYear = e.target.value;
    setAcademicYear(selectedYear);
  };

  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [selectEvent, setSelectEvent] = useState<CalendarKeyDateEvent | null>(
    null,
  );

  // state to store the start and end dates of the selected event
  const [selectedEventStartDate, setSelectedEventStartDate] = useState<Date>(
    new Date(),
  );

  const [selectedEventEndDate, setSelectedEventEndDate] = useState<Date>(
    new Date(),
  );

  // Function to handle course selection
  //@ts-expect-error // this is to avoid typescript errors
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCourse = e.target.value;
    setCourse(selectedCourse);
  };

  // const getSemesterWeekNumber = (
  //   date: Date,
  //   sem1Start: Date,
  //   sem2Start: Date,
  //   easterBreakStart: Date,
  //   easterBreakEnd: Date,
  //   christmasBreakStart: Date,
  //   christmasBreakEnd: Date,
  // ) => {
  //   console.log('Date:', date);

  //   const semester1StartDate = sem1Start;
  //   const semester2StartDate = sem2Start;
  //   const easterBreakStartDate = easterBreakStart;
  //   const easterBreakEndDate = easterBreakEnd;
  //   const christmasBreakStartDate = christmasBreakStart;
  //   const christmasBreakEndDate = christmasBreakEnd;

  //   // Calculate the difference in milliseconds between the date and the semester 1 start date
  //   const millisecondsDifferenceSem1 =
  //     date.getTime() - semester1StartDate.getTime();

  //   // Calculate the difference in milliseconds between the date and the semester 2 start date
  //   const millisecondsDifferenceSem2 =
  //     date.getTime() - semester2StartDate.getTime();

  //   // if date is semester 1
  //   if (date >= semester1StartDate && date < semester2StartDate) {
  //     console.log('Date is in semester 1');

  //     // Check if the date is in semester 1 and not in christmas break
  //     if (
  //       date >= semester1StartDate &&
  //       !(date >= christmasBreakStartDate && date <= christmasBreakEndDate)
  //     ) {
  //       console.log('Date is in semester 1, not in Christmas break');
  //       // Calculate the number of full weeks elapsed
  //       const fullWeeksElapsed = Math.floor(
  //         millisecondsDifferenceSem1 / (7 * 24 * 60 * 60 * 1000),
  //       );

  //       console.log('weeks elapsed: ' + fullWeeksElapsed);

  //       // Add 1 to start counting from week 1
  //       const weekNumber = fullWeeksElapsed + 1;

  //       // Subtract 3 to account for the Christmas break weeks
  //       if (date > christmasBreakEndDate) {
  //         return weekNumber - 3;
  //       }

  //       return weekNumber;
  //     }

  //     // calculate the number of days between the date and the christmas break start date
  //     // Math.ceil because daysDifference give numbers like 6.9 which should be 7
  //     const christmasDaysDifference = Math.ceil(
  //       (date.getTime() - christmasBreakStartDate.getTime()) /
  //         (24 * 60 * 60 * 1000),
  //     );

  //     console.log('Days difference:', christmasDaysDifference);

  //     // if date is in week 1 of christmas break
  //     if (christmasDaysDifference >= 0 && christmasDaysDifference < 7) {
  //       return 'C1';
  //     }

  //     // if date is in week 2 of christmas break
  //     if (christmasDaysDifference >= 7 && christmasDaysDifference < 14) {
  //       return 'C2';
  //     }

  //     // if date is in week 3 of christmas break

  //     if (christmasDaysDifference >= 14 && christmasDaysDifference < 21) {
  //       return 'C3';
  //     }
  //   }

  //   if (date >= semester2StartDate) {
  //     console.log('Date is in semester 2');

  //     // Check if the date is in semester 2 and not in Easter break
  //     if (
  //       date >= semester2StartDate &&
  //       !(date >= easterBreakStartDate && date <= easterBreakEndDate)
  //     ) {
  //       console.log('Date is in semester 2, not in Easter break');
  //       // Calculate the number of full weeks elapsed
  //       const fullWeeksElapsed = Math.floor(
  //         millisecondsDifferenceSem2 / (7 * 24 * 60 * 60 * 1000) + 0.01,
  //       );

  //       console.log('weeks elapsed: ' + fullWeeksElapsed);

  //       // Add 1 to start counting from week 1
  //       const weekNumber = fullWeeksElapsed + 1;

  //       // Subtract 3 to account for the Easter break weeks
  //       if (date > easterBreakEndDate) {
  //         return weekNumber - 3;
  //       }

  //       return weekNumber;
  //     }

  //     // Calculate the number of days between the date and the Easter break start date
  //     // Math.ceil because daysDifference give numbers like 6.9 which should be 7
  //     const easterDaysDifference = Math.ceil(
  //       (date.getTime() - easterBreakStartDate.getTime()) /
  //         (24 * 60 * 60 * 1000),
  //     );

  //     console.log('Days difference:', easterDaysDifference);

  //     // if date is in week 1 of Easter break
  //     if (easterDaysDifference >= 0 && easterDaysDifference < 7) {
  //       return 'E1';
  //     }

  //     // if date is in week 2 of Easter break
  //     if (easterDaysDifference >= 7 && easterDaysDifference < 14) {
  //       return 'E2';
  //     }

  //     // if date is in week 3 of Easter break
  //     if (easterDaysDifference >= 14 && easterDaysDifference < 21) {
  //       return 'E3';
  //     }
  //   }
  // };

  // Called when the user clicks the add event button (for semester start dates and holidays)
  // const handleAddEvent = (event: CalendarKeyDateEvent) => {
  //   // check that event title is not empty (so bank holidays can't be added without a title)
  //   if (!event.title) {
  //     toast('Please enter a name for the date');
  //     return;
  //   }

  //   // Ensure currentVersion is defined - should always be defined this is for testing
  //   if (!currentVersion) {
  //     toast('Current version is not set');
  //     return;
  //   }

  //   event.start.setHours(0, 0, 0, 0);

  //   // Calculate week number based on difference between event start date and Semester 1 start date
  //   const weekNumber = getSemesterWeekNumber(
  //     event.start,
  //     semester1Event.start,
  //     semester2Event.start,
  //     easterBreakEvent.start,
  //     easterBreakEvent.end,
  //     christmasBreakEvent.start,
  //     christmasBreakEvent.end,
  //   );

  //   // when adding easter break, don't add week number to the title
  //   if (!event.title.includes('Easter Break')) {
  //     // Add week number to the event title
  //     event.title += ` (Week ${weekNumber})`;
  //   }

  //   event.title += ` CV${currentVersion}`;

  //   // add academic year to the event title
  //   event.title += ` (${academicYear})`;

  //   // Check for clashes with existing events and warn user
  //   const clashDetected = checkClash(event, events);

  //   // Make POST request to add the event to MongoDB
  //   axios
  //     .post(baseURL + 'add-event', event)
  //     .then((res: { data: CalendarKeyDateEvent }) => {
  //       console.log('Event added to MongoDB: ', event);
  //       console.log(res);

  //       // Update the event with the _id returned from MongoDB locally, to allow deletion without refreshing the page
  //       const newEvent = { ...event, _id: res.data._id };
  //       // Add the new event to the events array in the local state
  //       setEvents([...events, newEvent]);
  //     })
  //     .catch((err: { data: CalendarKeyDateEvent }) => {
  //       console.error('Error adding event to MongoDB: ', err);
  //     });

  //   // Add the new event to the calendar even if there is a clash
  //   setEvents([...events, event]);

  //   if (clashDetected) {
  //     toast('Clash with another event detected'); // warning
  //   }

  //   toast(event.title + ' added');
  // };

  // deletes from mongodb and updates the events state locally
  function deleteEvents() {
    if (selectEvent) {
      // Make DELETE request to backend API endpoint to delete the event from MongoDB
      axios
        .delete(baseURL + `delete-event/${selectEvent._id}`)
        .then((res: { data: CalendarKeyDateEvent }) => {
          console.log('Event deleted from MongoDB: ', selectEvent);
          console.log(res);
        })
        .catch((err: { data: CalendarKeyDateEvent }) => {
          console.error('Error deleting event from MongoDB: ', err);
        });

      // Update local state to reflect the event deletion
      const newEvents = events.filter((event) => event !== selectEvent);
      setEvents(newEvents);
      setShowModal(false);

      toast(selectEvent.title + ' deleted');
    }
  }

  // called when a user clicks on a calendar slot
  function handleSelectSlot(slotInfo: { start: Date; end: Date }) {
    setNewEvent({
      title: '',
      allDay: true,
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowModal(true);
  }

  // called when a user clicks on an existing event
  function handleSelectedEvent(event: CalendarKeyDateEvent) {
    // Prevent editing or deleting bank holidays
    // Bank holidays have '(BH)' in their title
    // an alternative way to check if it's a bank holiday is to check if the event has an _id because only mongodb events have an _id
    if (event.title.includes('(BH)')) {
      toast('Bank holidays cannot be edited or deleted'); // alert
      return;
    }

    setEventTitle(event.title);
    setNewEvent(event);
    setSelectEvent(event);
    setShowModal(true);
    // Set the selected event start and end dates for the add to calendar button
    setSelectedEventStartDate(event.start);
    setSelectedEventEndDate(event.end);
  }

  // called when a user clicks save on the modal
  // this function also has support for adding events by clicking on a calendar slot and editing events by clicking on an existing event
  function saveEvent() {
    // Check if the event title is empty
    if (!eventTitle) {
      toast('Please enter a title for the event');
      return;
    }

    // Combine new event properties with its title
    const updatedEvent = { ...newEvent, title: eventTitle };

    // check if there is a clash only if saving a new event not editing an existing event
    if (!selectEvent && checkClash(updatedEvent, events)) {
      toast('Date clash with another event');
    }

    // If it's an existing event (selectEvent is defined), update the event
    if (selectEvent) {
      // Make PUT request to update the event in MongoDB
      axios
        .put(baseURL + `update-event/${selectEvent._id}`, updatedEvent)
        .then((res: { data: CalendarKeyDateEvent }) => {
          console.log('Event updated in MongoDB: ', updatedEvent);
          console.log(res);
        })
        .catch((err: { data: CalendarKeyDateEvent }) => {
          console.error('Error updating event in MongoDB: ', err);
        });

      // Update the event in the local state
      const updatedEvents = events.map((event) =>
        event === selectEvent ? updatedEvent : event,
      );
      setEvents(updatedEvents);

      toast(eventTitle + ' updated');
    }
    // If it's a new event, add it to the events array
    else {
      setEvents([...events, updatedEvent]);
      console.log('Events: ', [...events, updatedEvent]);
    }

    // Reset modal state
    setShowModal(false);
  }

  function checkClash(
    newEvent: CalendarKeyDateEvent,
    allEvents: CalendarKeyDateEvent[],
  ): boolean {
    // Iterate over all existing events
    for (const event of allEvents) {
      // Extract the date part of the start and end times of the events
      const existingEventStartDate = new Date(event.start.setHours(0, 0, 0, 0));
      const existingEventEndDate = new Date(event.end.setHours(0, 0, 0, 0));
      const newEventStartDate = new Date(newEvent.start.setHours(0, 0, 0, 0));
      const newEventEndDate = new Date(newEvent.end.setHours(0, 0, 0, 0));

      // Check if the new event overlaps with the existing event
      if (
        (newEventStartDate >= existingEventStartDate &&
          newEventStartDate <= existingEventEndDate) || // New event starts during the existing event
        (newEventEndDate >= existingEventStartDate &&
          newEventEndDate <= existingEventEndDate) || // New event ends during the existing event
        (newEventStartDate <= existingEventStartDate &&
          newEventEndDate >= existingEventEndDate) // New event spans the entire existing event
      ) {
        return true; // Clash detected
      }
    }

    return false; // No clash detected
  }

  // const archiveCurrentCalendar = () => {
  //   // Determine the maximum version number from the existing versions array
  //   const maxVersion = Math.max(...versions);

  //   // Create a new version that is one higher than the maximum version number
  //   const newVersion = maxVersion + 1;

  //   // Update the current version and versions state
  //   setCurrentVersion(newVersion);
  //   setVersions((prevVersions) => [...prevVersions, newVersion]);

  //   // Clear current events (if that's intended)
  //   setEvents([]);

  //   // Show a toast notification to inform the user
  //   toast(`Archived current calendar. Now viewing version ${newVersion}`);
  // };

  // moduleInstances data:
  //   {
  //     "module": {
  //         "_id": "668a7e2a96afc1668e168a73",
  //         "moduleSetup": {
  //             "moduleCode": "compidk",
  //             "moduleTitle": "123123",
  //             "moduleCredit": 15,
  //             "courseworkPercentage": 20,
  //             "examPercentage": 80,
  //             "studyYear": 1,
  //             "programme": [
  //                 "CSEE"
  //             ],
  //             "semester": "first",
  //             "type": "core",
  //             "_id": "668a7e2a96afc1668e168a74"
  //         },
  //         "courseworkList": [
  //             {
  //                 "title": "CW1",
  //                 "weight": 20,
  //                 "type": "assignment",
  //                 "deadlineWeek": 1,
  //                 "releasedWeekEarlier": 1,
  //                 "deadlineDay": "Monday",
  //                 "deadlineTime": "09:00",
  //                 "contactTimeLectures": 0,
  //                 "contactTimeTutorials": 0,
  //                 "contactTimeLabs": 0,
  //                 "contactTimeSeminars": 0,
  //                 "contactTimeFieldworkPlacement": 0,
  //                 "contactTimeOthers": 0,
  //                 "formativeAssessmentTime": 1,
  //                 "privateStudyTime": 0,
  //                 "preparationTime": 20,
  //                 "keyboardTime": 8,
  //                 "feedbackTime": 1,
  //                 "_id": "668a7e2a96afc1668e168a93"
  //             },
  //             {
  //                 "title": "Exam",
  //                 "weight": 80,
  //                 "type": "exam",
  //                 "deadlineWeek": 15,
  //                 "releasedWeekEarlier": 1,
  //                 "deadlineDay": "",
  //                 "deadlineTime": "",
  //                 "contactTimeLectures": 24,
  //                 "contactTimeTutorials": 12,
  //                 "contactTimeLabs": 0,
  //                 "contactTimeSeminars": 0,
  //                 "contactTimeFieldworkPlacement": 0,
  //                 "contactTimeOthers": 0,
  //                 "formativeAssessmentTime": 0,
  //                 "privateStudyTime": 81,
  //                 "preparationTime": 0,
  //                 "keyboardTime": 3,
  //                 "feedbackTime": 0,
  //                 "_id": "668a7e2a96afc1668e168a94"
  //             }
  //         ],
  //         "id": "31bf511a-46df-4c34-865f-e6237898d0ae",
  //         "__v": 0
  //     },
  //     "programmeId": "CSEE",
  //     "uniqueId": "compidk-CSEE"
  // }

  // HERE
  const DAYS_OF_WEEK = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Function to get the date of a specific week and day in the semester
  const getDateForWeekAndDay = (
    semesterStart: Date,
    week: number,
    day: string,
  ) => {
    const startDate = new Date(semesterStart);
    const dayOffset = DAYS_OF_WEEK.indexOf(day);
    const date = new Date(
      startDate.setDate(startDate.getDate() + (week - 1) * 7 + dayOffset),
    );
    return date;
  };

  // Function to populate the database with coursework events
  const populateCourseworkEvents = (
    moduleInstances: ModuleInstance[],
    semester1Start: Date,
    semester2Start: Date,
    currentVersion: number,
    academicYear: string,
  ) => {
    // Iterate over all module instances
    moduleInstances.forEach((moduleInstance) => {
      // Extract the module setup and coursework list from the module instance
      console.log('Module instance:', moduleInstance);
      // the above console logs all the module instances one by one

      const { module } = moduleInstance;

      // Extract the module setup data
      const { moduleSetup } = module;

      // Extract the coursework list data
      const { courseworkList } = module;

      // Get all the courseworks from every module instance and add them to the calendar
      courseworkList.forEach((coursework) => {
        // Extract the coursework data
        const {
          title,
          deadlineWeek,
          deadlineDay,
          // deadlineTime,
          releasedWeekEarlier,
        } = coursework;

        // Get the date of the deadline
        const deadlineDate = getDateForWeekAndDay(
          deadlineWeek === 1 ? semester1Start : semester2Start,
          deadlineWeek,
          deadlineDay || '',
        );

        // Get the date of the release date
        const releaseDate = getDateForWeekAndDay(
          deadlineWeek === 1 ? semester1Start : semester2Start,
          deadlineWeek - releasedWeekEarlier,
          deadlineDay || '',
        );

        // Create the coursework event
        const courseworkEvent = {
          title: title,
          start: releaseDate,
          end: deadlineDate,
          allDay: false,
        };

        if (courseworkEvent.title === '') {
          courseworkEvent.title = 'Coursework';
        }

        // append the module code to the event title
        courseworkEvent.title =
          `${moduleSetup.moduleCode} ` + courseworkEvent.title;

        // add the week number to the event title
        courseworkEvent.title += ` (Week ${deadlineWeek})`;

        // Add the academic year to the event title
        courseworkEvent.title += ` (${academicYear})`;

        // Add the version number to the event title
        courseworkEvent.title += ` CV${currentVersion}`;

        // Check for clashes with existing events and warn user
        const clashDetected = checkClash(courseworkEvent, events);

        // if these events are not already in the calendar after fetching from the database, add them
        if (
          !events.some(
            (event) =>
              event.title === courseworkEvent.title &&
              event.start.getTime() === courseworkEvent.start.getTime(),
          )
        ) {
          console.log('Adding event to calendar:', courseworkEvent);
          // Make POST request to add the event to MongoDB
          axios
            .post(baseURL + 'add-event', courseworkEvent)
            .then((res: { data: CalendarKeyDateEvent }) => {
              console.log('Event added to MongoDB: ', courseworkEvent);
              console.log(res);

              // Update the event with the _id returned from MongoDB locally, to allow deletion without refreshing the page
              const newEvent = { ...courseworkEvent, _id: res.data._id };
              // Add the new event to the events array in the local state
              setEvents([...events, newEvent]);
            })
            .catch((err: { data: CalendarKeyDateEvent }) => {
              console.error('Error adding event to MongoDB: ', err);
            });

          // Add the new event to the calendar even if there is a clash
          setEvents([...events, courseworkEvent]);

          if (clashDetected) {
            // toast('Clash with another event detected'); // warning
          }

          // toast(courseworkEvent.title + ' added');
        } else {
          // console.log('Event already exists in the calendar:', courseworkEvent);
        }
      });
    });
  };

  // Call the function to populate the database with coursework events
  useEffect(() => {
    populateCourseworkEvents(
      moduleInstances,
      semester1Event.start,
      semester2Event.start,
      currentVersion,
      academicYear,
    );
  }, [moduleInstances, semester1Event, semester2Event, currentVersion]);

  // fetch bank holidays from api and add to calendar
  useEffect(() => {
    fetch('https://www.gov.uk/bank-holidays.json')
      .then((response) => response.json())
      .then((data) => {
        const bankHolidays = data['england-and-wales'].events;
        setEvents((prevEvents) => {
          // Filter out duplicate bank holidays
          const uniqueBankHolidays = bankHolidays.filter(
            (holiday: { date: string }) => {
              const holidayDate = new Date(holiday.date).toISOString();
              return !prevEvents.some(
                (event) => event.start.toISOString() === holidayDate,
              );
            },
          );
          // Merge unique bank holidays with previous events
          return [
            ...prevEvents,
            ...uniqueBankHolidays.map(
              (holiday: { title: string; date: string }) => ({
                title: '(BH) ' + holiday.title,
                start: new Date(holiday.date),
                end: new Date(holiday.date),
                allDay: true,
              }),
            ),
          ];
        });
      })
      .catch((error) => {
        console.error('Error fetching bank holidays: ', error);
      });
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className="calendar">
        <button
          className="backButton btn btn-secondary mx-3 my-3 fixed-top col-sm-1"
          onClick={() => {
            window.history.back();
          }}
        >
          Home
        </button>
        <div className="calendarHeader">
          <h1 className="mb-4 mt-4">Your Coursework Calendar</h1>

          <div>
            {/* dropdown for selecting current academic year */}
            <span>Current Academic Year: </span>
            <select
              className="mb-4"
              value={academicYear}
              onChange={handleAcademicYearChange}
            >
              <option value="2024/25">2024/25</option>
            </select>
          </div>

          <div>
            {/* dropdown for selecting current academic year */}
            <span>Choose Semester: </span>

            <select
              className="mb-4"
              value={currentChosenSemester}
              onChange={(e) => setCurrentChosenSemester(e.target.value)}
            >
              <option value="sem1">Semester 1</option>
              <option value="sem2">Semester 2</option>
            </select>
          </div>

          {/* Dropdown for selecting course */}
          {/* <span>Show reading week </span>
          <select className="mb-4" value={course} onChange={handleCourseChange}>
            <option value="CS">No</option>
            <option value="EE">Yes</option>
          </select> */}

          {/* <div>
            <label>Calendar Version: </label>
            <select
              value={currentVersion}
              onChange={(e) => setCurrentVersion(Number(e.target.value))}
            >
              {versions.map((version) => (
                <option key={version} value={version}>
                  CV{version}
                </option>
              ))}
            </select>
            <button onClick={archiveCurrentCalendar}>
              Archive Current Calendar
            </button>
          </div> */}

          {/* Input field for adding courseworks */}
          {/* <div>
            <span>Add coursework: </span>
            <input
              type="text"
              placeholder="Coursework name"
              style={{ width: '20%', marginRight: '10px' }}
              value={holidayEvent.title}
              onChange={(e) =>
                setHolidayEvent({ ...holidayEvent, title: e.target.value })
              }
            />
            <div className="datePickers">
              <span>Coursework start date: </span>
              <div className="d-inline">
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Add Holiday"
                  selected={holidayEvent.start}
                  onChange={(start: Date) =>
                    setHolidayEvent({ ...holidayEvent, start })
                  }
                />
              </div>
            </div>
            <div className="datePickers">
              <span>Coursework end date: </span>
              <div className="d-inline">
                <DatePicker
                  dateFormat="dd/MM/yyyy"
                  placeholderText="End Date"
                  selected={holidayEvent.end}
                  onChange={(end: Date) =>
                    setHolidayEvent({ ...holidayEvent, end })
                  }
                />
              </div>
            </div>

            <button
              className="eventButton"
              onClick={() => handleAddEvent(holidayEvent)}
            >
              Set coursework
            </button>
          </div> */}
        </div>
        <hr className="rounded"></hr>

        {/* All modules in a table with module names on y axis and weeks 1 to 15 for each semester on the x axis at the top */}
        {/* show No Event when there is no coursework or exam on the week, and show the event title when there is an event */}
        {/* get the semester value from the module setup and show only the modules that are in the selected semester */}
        {/* semester 1 modules: */}

        <div className="cwbody mx-4">
          <div
            className="horizontalScrollDiv"
            style={{
              overflowX: 'auto',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="currentChosenSemester">
              {currentChosenSemester === 'sem1' ? (
                <>
                  <h3 className="mx-4">Semester 1</h3>
                  <table className="table table-bordered mx-4">
                    <thead>
                      <tr>
                        <th></th>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(
                          (week) => (
                            <th key={week}>
                              Week {week}
                              {/* show the week commence date */}
                              <br />
                              {getDateForWeekAndDay(
                                semester1Event.start,
                                week,
                                'Monday',
                              ).toLocaleDateString()}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {moduleInstances.map((moduleInstance, index) => {
                        const { module } = moduleInstance;
                        const { moduleSetup } = module;
                        const { semester } = moduleSetup;
                        if (semester === 'first') {
                          return (
                            <tr key={index}>
                              <td>{moduleSetup.moduleCode}</td>
                              {Array.from({ length: 15 }, (_, i) => i + 1).map(
                                (week) => {
                                  const event = events.find(
                                    (event) =>
                                      event.title.includes(
                                        moduleSetup.moduleCode,
                                      ) &&
                                      event.title.includes(`Week ${week})`) &&
                                      !event.title.includes('Exam'),
                                  );
                                  return (
                                    // show the first 2 words of the event title only (removes the week number, academic year and version number)
                                    <td key={week}>
                                      {event
                                        ? event.title
                                            .split(' ')
                                            .slice(0, 2)
                                            .join(' ') +
                                          // get coursework percentage from the module setup and show it in the table if it's a coursework and show exam percentage if it's an exam
                                          (event.title.includes('Coursework')
                                            ? ` (${moduleSetup.courseworkPercentage}%)`
                                            : event.title.includes('Exam')
                                              ? ``
                                              : '')
                                        : '-'}
                                    </td>
                                  );
                                },
                              )}
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <h3 className="mx-4">Semester 2</h3>
                  <table className="table table-bordered mx-4">
                    <thead>
                      <tr>
                        <th></th>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(
                          (week) => (
                            <th key={week}>
                              Week {week}
                              {/* show the week commence date */}
                              <br />
                              {getDateForWeekAndDay(
                                semester2Event.start,
                                week,
                                'Tuesday',
                              ).toLocaleDateString()}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {moduleInstances.map((moduleInstance, index) => {
                        const { module } = moduleInstance;
                        const { moduleSetup } = module;
                        const { semester } = moduleSetup;
                        if (semester === 'second') {
                          return (
                            <tr key={index}>
                              <td>{moduleSetup.moduleCode}</td>
                              {Array.from({ length: 15 }, (_, i) => i + 1).map(
                                (week) => {
                                  const event = events.find(
                                    (event) =>
                                      event.title.includes(
                                        moduleSetup.moduleCode,
                                      ) &&
                                      event.title.includes(`Week ${week})`) &&
                                      !event.title.includes('Exam'),
                                  );
                                  return (
                                    // show the first 2 words of the event title only (removes the week number, academic year and version number)
                                    <td key={week}>
                                      {event
                                        ? event.title
                                            .split(' ')
                                            .slice(0, 2)
                                            .join(' ') +
                                          // get coursework percentage from the module setup and show it in the table if it's a coursework and show exam percentage if it's an exam
                                          (event.title.includes('Coursework')
                                            ? ` (${moduleSetup.courseworkPercentage}%)`
                                            : event.title.includes('Exam')
                                              ? ` (${moduleSetup.examPercentage}%)`
                                              : '')
                                        : '-'}
                                    </td>
                                  );
                                },
                              )}
                            </tr>
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>

          <hr className="rounded"></hr>
        </div>
        {/* button called show dates, that when pressed shows the key dates and deadlines table */}
        <button
          className="btn btn-secondary mx-4"
          onClick={() => setShowKeyDatesTable(!showKeyDatesTable)}
        >
          Toggle Key Dates and Deadlines table
        </button>

        {/* key dates and deadlines table */}
        {showKeyDatesTable && (
          <div>
            <h2 className="mx-4">Key Dates and Deadlines</h2>
            <ul className="list-group mx-4">
              {events.map((event, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  {event.title}
                  <span>{event.end.toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* when button called show calendar view is pressed, toggle the calendar */}
        <button
          className="btn btn-secondary mx-4"
          onClick={() => setShowDatesCalendar(!showDatesCalendar)}
        >
          Toggle Deadline Calendar View
        </button>

        {showDatesCalendar && (
          <div>
            {/* Calendar View */}
            <Calendar
              localizer={localizer}
              events={events}
              views={['month', 'week', 'day']}
              defaultView="month"
              startAccessor="start"
              endAccessor="end"
              // selectable={true} // this is being able to select a date slot (not event)
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectedEvent}
              style={{
                height: 800,
                marginLeft: '50px',
                marginRight: '50px',
                marginTop: '20px',
                marginBottom: '20px',
              }}
            />

            <EditTermDateModal
              eventTitle={eventTitle}
              showModal={showModal}
              selectEvent={selectEvent}
              newEvent={newEvent}
              selectedEventStartDate={selectedEventStartDate}
              selectedEventEndDate={selectedEventEndDate}
              setShowModal={setShowModal}
              setEventTitle={setEventTitle}
              setSelectEvent={setSelectEvent}
              setNewEvent={setNewEvent}
              saveEvent={saveEvent}
              deleteEvents={deleteEvents}
            />
          </div>
        )}
      </div>
      <hr className="rounded"></hr>

      <EffortGraph />
    </>
  );
}

export default StudentCalendar;
