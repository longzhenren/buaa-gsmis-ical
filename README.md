# buaa-gsmis-ical
## 简介
北航研究生信息系统课表导出为ical格式，可导入日历；浏览器js脚本，无需python环境。

## 使用方式
- 登录gsmis.buaa.edu.cn（支持校外通过d.buaa.edu.cn/e1.buaa.edu.cn/e2.buaa.edu.cn访问）
- 进入[“我的课表”app](http://gsmis.buaa.edu.cn/gsapp/sys/wdkbapp/*default/index.do#/xskcb)
- F12打开控制台
- 粘贴代码到控制台中回车
- 自动导出ical文件

## 注意事项
- 仅测试了ZY类型非定向非卓工研究生账号，其他类型研究生及博士生无账号未测试（欢迎pr）
- 导入前请新建日历，避免污染原有日历日程
- 当前仅在Mac日历中测试，其他日历软件暂未测试
