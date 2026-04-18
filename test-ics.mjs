import { generateTopicICalendar } from './src/utils/calendarService.js';

const mockTopic = {
  id: 't123',
  title: 'React Fundamentals',
  description: 'Learn hooks and context',
  createdDate: new Date('2026-04-18T10:00:00Z'),
};

const ics = generateTopicICalendar(mockTopic);
console.log(ics);
