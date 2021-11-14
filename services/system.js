// const Record = require("../mongoDB/model/Record");
// const Timer = require("../mongoDB/model/Timer");
// const schedule = require("node-schedule");
// const controller = require("../controller");
// const moment = require("moment");

// const IB_scan_save = (time) => {
//   // 每分钟的第30秒触发： '30 * * * * *'

//   // 每小时的1分30秒触发 ：'30 1 * * * *'

//   // 每天的凌晨1点1分30秒触发 ：'30 1 1 * * *'

//   // 每月的1日1点1分30秒触发 ：'30 1 1 1 * *'

//   // 2016年的1月1日1点1分30秒触发 ：'30 1 1 1 2016 *'

//   // 每周1的1点1分30秒触发 ：'30 1 1 * * 1'
//   schedule.scheduleJob(time, async () => {
//     try {
//       // get last timer 
//       let timer = await Timer.findOne({ _id: "607fad3cf79bb491db3927b6" });
//       let {
//         scan_success_count,
//         scan_failed_count,
//         last_scan_success,
//         last_scan_failed,
//         failed_page_number_on,
//       } = timer;
// //
//       let end_date = moment(last_scan_failed).isAfter(last_scan_success)
//         ? last_scan_failed
//         : moment
//             .utc()
//             .utcOffset("-07:00", true)
//             .format("YYYY-MM-DDTHH:mm:ss.SSZ");
//       let page_number = moment(last_scan_failed).isAfter(last_scan_success)? failed_page_number_on : 1
//       let start_date = last_scan_success 
//       // beign scanAndSave
//       console.log("start scan and save on " + end_date);
//       let result = await controller.scanAndSave(
//         start_date,
//         end_date,
//         500,
//         page_number
//       );

//       //update timer
//       await Timer.findOneAndUpdate(
//         { _id: "607fad3cf79bb491db3927b6" },
//         {
//           last_scan_success: result == 0 ? end_date : start_date,
//           last_scan_failed: result == 0 ? timer.last_scan_failed : end_date,
//           scan_success_count: result == 0 ? scan_success_count + 1 : scan_success_count,
//           scan_failed_count: result == 0 ? scan_failed_count: sscan_failed_count + 1,
//           failed_page_number_on : result ,
//         }
//       );
//     } catch (error) {
//       console.error;
//     }
//   });
// };

// module.exports = {
//   IB_scan_save,
// };
