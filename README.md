# react-native-waterfall-list

基于 flatlist 实现的 多列 不定高 瀑布流组件

## 效果展示

### 两列瀑布流

![RPReplay_Final1726644535.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/3e12aad1feba44f1906b2940d288e91e~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727258066&x-orig-sign=UaW%2B4p7xXsgd6K%2BekmMP5gzdmpg%3D)

### 三列瀑布流

![RPReplay_Final1726645556.gif](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/2ec5d62047704027bf1a7f2d7a17e1f9~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=f64ab15b&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1727258066&x-orig-sign=PVkRxKM8JoydFTWPHfeSFeDcXGY%3D)

## 使用说明

- 组件基于 flatlist 实现   几乎支持 flatlist 所有属性 个别属性不支持 例如 horizontal 目前仅支持垂直方向
- 基于 ts + hooks 实现 有较好的类型提示
- 支持不定高 item 内部通过布局自动计算 所以 getItemLayout 设置无效
- 关于 ref 的支持 默认取到的是 WaterFallList 的 ref   内部包括自定义的属性和 flatlistRef.    如果想获取内部 flatlist 的 ref 对象 可以通过 WaterFallList 内部转发的的 flatListRef 对象

## 注意事项

1.  item 最大高度与最小高度差值不宜过大 建议:  `最小高度>=最大高度的30%`
2.  item 渲染完成后 **`不建议动态改变item的高度`** 会引起布局抖动
3.  内部封装了 refreshList 函数 在刷新列表前 建议先调用此函数(刷新调用即可 列表项增加不需要调用)
4.  仅支持垂直瀑布流

## 原理

1. 首先更改数据源 将单列表数组转换为 N 维数组确定每行的具体 item 数
2. 首先渲染一次当前列表 获取到每个元素的真实高度信息([获取定位信息的方式可以参考这篇文章](https://juejin.cn/post/7408086889590931510))，并通过\_itemHeightsRef 记录下来。
3. 当高度信息收集完成 触发强制刷新 再次渲染一次列表
4. 决策当前元素应该放在第几列 每行的高度是多少

例如当前一行是这个形式：
![截屏2024-09-18 19.21.35.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/f06660edec8547e5965604b4d473e6e7~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726744902&x-orig-sign=fYjNRRQ9f7ZSvoqe9RgbxaGv9Wk%3D)

第三个元素应该加在下一行的最短一列:
![截屏2024-09-18 19.22.03.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/c371783cdf164ba0a566f0cb27ac5caa~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726744932&x-orig-sign=tKDcdtNETZJPZj0dHaEvTehuSCM%3D)

同理第四个元素也加在最短的一列 第二列：
![截屏2024-09-18 19.26.49.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/644bae2b464f4abcaa8aa8caed806a4c~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726745217&x-orig-sign=obspdCX49jWnTUq56RIuY%2FYwqds%3D)

然后计算第二行的行高：<br>
因为 flatlist 的一行是以最长的元素高度为准 所以我们需要计算出最长的元素高度是多少 并且还要减去上一行的高度这个偏移量。
所以高度如下 <br>
![截屏2024-09-18 19.28.32.png](https://p0-xtjj-private.juejin.cn/tos-cn-i-73owjymdk6/1942887b05ab4fd8b5a9595b7f3bbd60~tplv-73owjymdk6-jj-mark-v1:0:0:0:0:5o6Y6YeR5oqA5pyv56S-5Yy6IEAg5p-Q5p-Q5p-Q5Lq6:q75.awebp?policy=eyJ2bSI6MywidWlkIjoiMzY0OTk5MDAyNTgxNTg1MyJ9&rk3s=e9ecf3d6&x-orig-authkey=f32326d3454f2ac7e96d3d06cdbb035152127018&x-orig-expires=1726745318&x-orig-sign=UCLa5%2F9BncWFJR35rdK997OCalU%3D)
然后不断循环列表 直到结束。
