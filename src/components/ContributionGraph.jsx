import { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const ContributionGraph = () => {
  const [contributionData, setContributionData] = useState([]);
  const [maxContributions, setMaxContributions] = useState(0);
  const [tooltipInfo, setTooltipInfo] = useState(null);
  // После конвертации данных они не хотели выводиться в параграфе, поэтому сделал это вручную 
  const [finalDate, setFinalDate] = useState(null);

  useEffect(() => {
    // Запрос данных 
    axios.get('https://dpg.gg/test/calendar.json')
      .then(response => {
        const dataObject = response.data;
        //Решил переделать объект в массив и разделить даты с количеством contribution в отдельные объекты, чтобы легче было итерировать
        const dataArray = Object.keys(dataObject).map(date => ({
          date,
          count: dataObject[date]
        }));

        const maxCount = Math.max(...dataArray.map(item => item.count));
        setMaxContributions(maxCount);

        setContributionData(dataArray);
      })
      .catch(error => {
        console.error('Error fetching contribution data:', error);
      });
  }, []);

  // Tooltip создание и контроль местоположения, также здесь использую date-fns для конвертации входных данных
  const handleDayClick = (count, date, event) => {
    const rect = event.target.getBoundingClientRect();
    const tooltipLeft = rect.left + rect.width / 2;
    const tooltipTop = rect.top - 80; 
    const dateObject = parseISO(date);
    const formattedDate = format(dateObject, "EEEE, MMMM d, yyyy");
    setTooltipInfo({ count, date, left: tooltipLeft, top: tooltipTop });
    setFinalDate(formattedDate);
    console.log(typeof formattedDate)
  };
  
  const handleDayLeave = () => {
    setTooltipInfo(null);
  };

  return (
    <div className="contribution-graph">
    <h2>Contribution Graph</h2>
    <div className="graph">
      {contributionData.map((day, index) => (
        <div
          key={index}
          className="day"
          // в зависимости от кол-ва коммитов будем выбирать прозрачность блока
          style={{ backgroundColor: `rgba(37, 78, 119, ${day.count / maxContributions})` }}
          onClick={event => handleDayClick(day.count, day.date, event)}
          onMouseLeave={handleDayLeave}
        >
          {tooltipInfo && tooltipInfo.date === day.date && (
            <div
              className="tooltip"
              style={{
                top: tooltipInfo.top,
                left: tooltipInfo.left,
                transform: 'translateX(-50%)',
              }}
            >
             
              <p className='tooltip-date'> <span className='tooltip-contributions'>{tooltipInfo.count} contributions</span>{finalDate}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
  );
};

export default ContributionGraph;
