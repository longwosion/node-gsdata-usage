
## 程序说明

该程序用于从gsdata.cn网站上，通过API采集部分微信公众号的统计数据。用于文章配图生成。

各个目录说明如下：

### tasks
编程语言：nodejs

* `fetch_group_info.js`
抓取分组信息（需要在gsdata上注册账号，增加需要抓取数据的相关公众号）

* `fetch_week_data.js`
抓取两个分组（每个10个公众号）的50周统计数据

数据存储在本地的一个mongo数据里

### figure
使用Jupyter Notebook读取抓取的数据，生成文章需要图片

### data
存放最终生成的图片
