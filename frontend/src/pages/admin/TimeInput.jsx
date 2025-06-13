import React from 'react';

const TimeInput = ({ value, onChange }) => {
  // value: '01:00 PM' o '01:00 AM'
  const [timePart, periodPart] = value.split(' ');
  const [hour, minute] = timePart.split(':');
  const ampm = periodPart || 'PM';

  const handleHourChange = (e) => {
    const newHour = e.target.value.padStart(2, '0');
    onChange(`${newHour}:${minute} ${ampm}`);
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value.padStart(2, '0');
    onChange(`${hour}:${newMinute} ${ampm}`);
  };

  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    onChange(`${hour}:${minute} ${newPeriod}`);
  };

  return (
    <div className="time-input-container">
      <select className="time-select" value={hour} onChange={handleHourChange}>
        {Array.from({ length: 12 }, (_, i) => {
          const h = String(i + 1).padStart(2, '0');
          return <option key={h} value={h}>{h}</option>;
        })}
      </select>

      <span className="time-separator">:</span>

      <select className="time-select" value={minute} onChange={handleMinuteChange}>
        {['00', '15', '30', '45'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select className="time-select" value={ampm} onChange={handlePeriodChange}>
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};

export default TimeInput;
