import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { supabase } from './supabase';

export const calculateNextUpdateDue = (
  frequency: string,
  lastUpdate: Date = new Date()
): Date => {
  switch (frequency) {
    case 'Daily':
      return addDays(lastUpdate, 1);
    case 'Weekly':
      return addWeeks(lastUpdate, 1);
    case 'Bi-Weekly':
      return addWeeks(lastUpdate, 2);
    case 'Monthly':
      return addMonths(lastUpdate, 1);
    case 'Quarterly':
      return addMonths(lastUpdate, 3);
    case 'Semi-Annual':
      return addMonths(lastUpdate, 6);
    case 'Annual':
      return addYears(lastUpdate, 1);
    default:
      return lastUpdate;
  }
};

export const updateTaskSchedule = async (taskId: string, frequency: string) => {
  const nextUpdateDue = calculateNextUpdateDue(frequency);

  const { error } = await supabase
    .from('project_tasks')
    .update({ next_update_due: nextUpdateDue.toISOString() })
    .eq('id', taskId);

  if (error) throw error;
  return nextUpdateDue;
};