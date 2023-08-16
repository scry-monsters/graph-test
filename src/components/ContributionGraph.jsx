import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const ContributionGraph = () => {
  const [contributionData, setContributionData] = useState({});
  const [maxContributions, setMaxContributions] = useState(0);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  const [finalDate, setFinalDate] = useState(null);
  const daysOfWeek = ['Monday', 'Wednesday', 'Friday'];

  useEffect(() => {
    // Fetch contribution data from the provided API
    axios.get('https://dpg.gg/test/calendar.json')
      .then(response => {
        setContributionData(response.data);
        const maxCount = Math.max(...Object.values(response.data));
        setMaxContributions(maxCount);
      })
      .catch(error => {
        console.error('Error fetching contribution data:', error);
      });
  }, []);

  const handleDayClick = (count, date, event) => {
    const rect = event.target.getBoundingClientRect();
    const tooltipLeft = rect.left + rect.width / 2;
    const tooltipTop = rect.top - 50;
    const dateObject = parseISO(date);
    const formattedDate = format(dateObject, "EEEE, MMMM d, yyyy");
    setTooltipInfo({ count, date, left: tooltipLeft, top: tooltipTop });
    setFinalDate(formattedDate);
  };

  const handleDayLeave = () => {
    setTooltipInfo(null);
  };

  const generateGraphCells = () => {
    const cells = [];
  
    for (let week = 1; week <= 52; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(2023, 0, (week - 1) * 7 + day + 1);
        const date = format(currentDate, 'yyyy-MM-dd');
        const count = contributionData[date] || 0;
        let backgroundColor;
  
        if (count > 30) {
          backgroundColor = '#254E77';
        } else if (count > 20) {
          backgroundColor = '#527BA0';
        } else if (count > 10) {
          backgroundColor = '#7FA8C9';
        } else if (count > 1) {
          backgroundColor = '#ACD5F2';
        } else {
          backgroundColor = '#EDEDED';
        }
  
        cells.push(
          <div
            key={`${week}-${day}`}
            className="day"
            style={{ backgroundColor }}
            onClick={event => handleDayClick(count, date, event)}
            onMouseLeave={handleDayLeave}
          >
            {/* Tooltip logic */}
            {tooltipInfo && tooltipInfo.date === date && (
              <div
                className="tooltip"
                style={{
                  top: tooltipInfo.top,
                  left: tooltipInfo.left,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Tooltip content */}
                <p className="tooltip-date">
                <span className="tooltip-contributions">{tooltipInfo.count} contributions</span>
                {tooltipInfo.date}</p>
              </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  const generateMonthLabels = () => {
    const monthLabels = [];
    const months = [
      'Апр', 'Май', 'Июнь', 'Июнь', 'Авг.', 'Сент.',
      'Окт.', 'Нояб.', 'Дек.', 'Янв.', 'Февр.', 'Март'
    ];

    for (let month = 0; month < 12; month++) {
      monthLabels.push(
        <div key={month} className="month-label">
          {months[month]}
        </div>
      );
    }

    return monthLabels;
  };

  

  return (
    <div className="contribution-graph">
      <h2>Contribution Graph</h2>
      <div className="month-labels">
        {generateMonthLabels()}
      </div>
      <div className="graph">
        {generateGraphCells()}
      </div>
    </div>
  );
};

export default ContributionGraph;
