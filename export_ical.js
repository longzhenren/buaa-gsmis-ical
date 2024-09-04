// 使用说明: 登录gsmis.buaa.edu.cn,打开"我的课表"app,按F12打开开发者工具,在Console中粘贴此脚本并回车,即可下载课程表的iCal文件
// Author: AmurBear
// Date: 2023-09-01

// 设置开始日期（第1周星期一）,按需修改
const startDate = new Date('2024-09-02');

// 节次到时间范围的映射,按需修改
const scheduleMappings = {
  1: { startTime: '08:00', endTime: '08:45' },
  2: { startTime: '08:50', endTime: '09:35' },
  3: { startTime: '09:50', endTime: '10:35' },
  4: { startTime: '10:40', endTime: '11:25' },
  5: { startTime: '11:30', endTime: '12:15' },
  6: { startTime: '14:00', endTime: '14:45' },
  7: { startTime: '14:50', endTime: '15:35' },
  8: { startTime: '15:50', endTime: '16:35' },
  9: { startTime: '16:40', endTime: '17:25' },
  10: { startTime: '17:30', endTime: '18:15' },
  11: { startTime: '19:00', endTime: '19:45' },
  12: { startTime: '19:50', endTime: '20:35' },
  13: { startTime: '20:40', endTime: '21:25' },
  14: { startTime: '21:30', endTime: '22:15' }
};

// 解析HTML代码，生成iCal格式数据
let icalData = 
`BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:课程表
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Asia/Shanghai
TZURL:http://tzurl.org/zoneinfo-outlook/Asia/Shanghai
X-LIC-LOCATION:Asia/Shanghai
BEGIN:STANDARD
TZOFFSETFROM:+0800
TZOFFSETTO:+0800
TZNAME:CST
DTSTART:19700101T000000
END:STANDARD
END:VTIMEZONE
`;

function formatICalDateTime(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

// 找到包含课程信息的父元素
const courseContainer = document.getElementById('xsjxrwDiv'); // 使用实际的父元素ID

if (courseContainer) {
  const tables = courseContainer.querySelectorAll('table');

  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const columns = row.querySelectorAll('td');

      // 解析课程信息和时间信息
      const courseCode = columns[0].textContent.trim();
      const courseName = columns[1].textContent.trim();
      const weekText = columns[9].innerText.trim(); // 例如：2-17周 星期二[1-3节]主M401
      const teacher = columns[7].textContent.trim();
      if (!weekText) {
        console.log("解析失败:", courseCode, "无时间安排,可能为线上课程");
        return;
      }
      console.log("解析成功:", courseCode, courseName, weekText, teacher);
      
      // 将多段上课信息分割
      const repeatCourse = weekText.split('\n');
      repeatCourse.forEach(weekInfo => {
        // 解析每一段的周次范围
        const weekRangeText =weekInfo.split(' ')[0].replace('周', '');
        const weekRanges = weekRangeText.split(',');
        // const weekRanges = weekInfo.match(/(\d+-\d+周)/g);
        const [, weekday, schedule, place] = weekInfo.match(/星期(\S+)\[(\d+-\d+)节\](.+)/);

        weekRanges.forEach(weekRange => {
          const [startWeek, endWeek] = weekRange.replace('周', '').split('-').map(Number);
          const [startPeriod, endPeriod] = schedule.split('-');
          const startTime = scheduleMappings[startPeriod].startTime;
          const endTime = scheduleMappings[endPeriod].endTime;

          // 计算课程日期
          const dayOffset = ['一', '二', '三', '四', '五', '六', '日'].indexOf(weekday);
          // 循环每周生成一个事件
          for (let i = startWeek; i <= endWeek; i++) {
            const courseStartDate = new Date(
              startDate.getTime() +
              (i - 1) * 7 * 24 * 60 * 60 * 1000 +
              dayOffset * 24 * 60 * 60 * 1000
            );
            const [shours, sminutes] = startTime.split(':').map(Number);
            const courseStartDateTime = new Date(
              courseStartDate.getTime() +
              shours * 60 * 60 * 1000 +
              sminutes * 60 * 1000
            );
            const [ehours, eminutes] = endTime.split(':').map(Number);
            const courseEndDateTime = new Date(
              courseStartDate.getTime() +
              ehours * 60 * 60 * 1000 +
              eminutes * 60 * 1000
            );

            icalData += 
`
BEGIN:VEVENT
DESCRIPTION:${teacher}
DTSTART;TZID=Asia/Shanghai:${formatICalDateTime(courseStartDateTime)}
DTEND;TZID=Asia/Shanghai:${formatICalDateTime(courseEndDateTime)}
LOCATION:${place}
SUMMARY:${courseName}
END:VEVENT`;
          }
        });
      });
    });
  });

  icalData += 
`
END:VCALENDAR`;

  // 导出iCal数据为文件
  const blob = new Blob([icalData], { type: 'text/calendar' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'class_schedule.ics';
  link.click();
} else {
  console.log('Course container element not found.');
}