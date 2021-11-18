import moment from 'moment';

export function formatTimestamp(timestamp: moment.Moment): string {
  return timestamp.format('YYYY-MM-DD HH:mm:ss');
}

export function truncateFloat(value: number, precision = 12): number {
  return parseFloat(value.toPrecision(precision));
}

export function intervalToCron(secs: number): string {
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  if (secs > 0 && secs < MINUTE && MINUTE % secs === 0) {
    return `*/${ secs } * * * * *`;
  }

  if (secs >= MINUTE && secs < HOUR && secs % MINUTE === 0 && HOUR % secs === 0) {
    return `0 */${ secs / MINUTE } * * * *`;
  }

  if (secs >= HOUR && secs < DAY && secs % HOUR === 0 && DAY % secs === 0) {
    return `0 0 */${ secs / HOUR } * * *`;
  }

  if (secs === DAY) {
    return '0 0 0 * * *';
  }

  return '';
}

export function roundToInterval(start: moment.Moment, interval: number): moment.Moment {
  return moment.unix(Math.floor((start.unix() + interval) / interval) * interval).utc();
}
