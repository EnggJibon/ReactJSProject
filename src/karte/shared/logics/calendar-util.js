import Cookies from 'universal-cookie';

export default class CalendarUtil {

  /**
   * Framework7 Calendarオブジェクトのプロパティを言語に応じてセットする
   * @param {*} calandar 
   * @param {*} lang 
   */
  static setCalendarProperties(calendar, lang) {
    if (lang ==='ja') {
      //
      calendar.monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    }
    else if (lang === 'zh') {
      //
      calendar.monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    }
    calendar.dateFormat = 'yyyy/mm/dd';
  }

  static getCalendarProperties(_inputEl,param) {
    var props = {
      inputEl: _inputEl,
      closeOnSelect: true,
      dateFormat: 'yyyy/mm/dd',
      routableModals: false, //URLを変更しない
      on:{...param}
    };
    const cookies = new Cookies();
    var lang = cookies.get('LANG');
    if (lang ==='ja') {
      props.monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      props.monthNamesShort = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      props.dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
      props.dayNamesShort = ['日', '月', '火', '水', '木', '金', '土'];
    }
    else if (lang === 'zh') {      
      props.monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      props.monthNamesShort = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      props.dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      props.dayNamesShort = ['日', '一', '二', '三', '四', '五', '六'];
    }
    return props;
  }

  static createDateTimePicker(f7app, _toolbarCloseText, _inputEl,param,today) {
    today = today!==undefined?today:new Date();
    return f7app.picker.create({
      //containerEl: _containerEl,
      inputEl: _inputEl,
      //toolbar: false,
      toolbarCloseText: _toolbarCloseText,
      rotateEffect: true,
      routableModals: false, //URLを変更しない
      value: [
        today.getFullYear(),      //0
        today.getMonth() + 1,     //1
        today.getDate(),          //2
        today.getHours(),         //3
        today.getMinutes(),        //4
      ],
      formatValue: function (values, displayValues) {
        return values[0] + '/' + displayValues[1] + '/' + displayValues[2] + ' ' + displayValues[3] + ':' + displayValues[4];
      },
      cols: [
        // Years
        {
          values: (function () {
            var arr = [];
            for (var i = 1950; i <= 2100; i++) { arr.push(i); }
            return arr;
          })(),
        },
        // Months
        {
          values: [1,2,3,4,5,6,7,8,9,10,11,12],
          displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),
        },
        // Days
        {
          values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
          displayValues: ('01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31').split(' '),
        },
        // Space divider
        {
          divider: true,
          content: '&nbsp;&nbsp;'
        },
        // Hours
        {
          values: (function () {
            var arr = [];
            for (var i = 0; i <= 23; i++) { arr.push(i); }
            return arr;
          })(),
          displayValues: (function () {
            var arr = [];
            for (var i = 0; i <= 23; i++) { arr.push(i < 10 ? '0' + i : i); }
            return arr;
          })(),
        },
        // Divider
        {
          divider: true,
          content: ':'
        },
        // Minutes
        {
          values: (function () {
            var arr = [];
            for (var i = 0; i <= 59; i++) { arr.push(i); }
            return arr;
          })(),
          displayValues: (function () {
            var arr = [];
            for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
            return arr;
          })(),
        }
      ],
      on: {
        change: function (picker, values) { // displayValues) {
          var daysInMonth = new Date(picker.value[0], picker.value[1], 0).getDate();
          if (values[2] > daysInMonth) {
            picker.cols[2].setValue(daysInMonth);
          }
        },
        ...param
      }
    });

  }

}
