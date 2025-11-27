const moment = require('moment-timezone');

exports.isProviderActive = (provider) => {
  if (!provider || !provider.providerSettings || !provider.providerSettings.activeHours) return false;

  try {
    const { start, end } = provider.providerSettings.activeHours;
    const timezone = provider.providerSettings.timezone || 'UTC';

    const now = moment().tz(timezone);
    const day = now.format('YYYY-MM-DD');

    const startTime = moment.tz(`${day} ${start}`, 'YYYY-MM-DD HH:mm', timezone);
    const endTime = moment.tz(`${day} ${end}`, 'YYYY-MM-DD HH:mm', timezone);

    let adjustedStart = startTime;
    let adjustedEnd = endTime;

    if (endTime.isBefore(startTime)) {
      adjustedEnd = endTime.clone().add(1, 'day');
      if (now.isBefore(startTime)) adjustedStart = startTime.clone().subtract(1, 'day');
    }

    return now.isBetween(adjustedStart, adjustedEnd);
  } catch (_err) {
    return false;
  }
};
