# react-native-waterfall-list-view

基于官方 flatlist 实现的 多列 不定高 瀑布流组件 不依赖任何第三方

## 效果展示

### 两列瀑布流

![RPReplay_Final1726644535](https://github.com/user-attachments/assets/14212aa4-209a-4978-a533-65e1043bdb50)

### 三列瀑布流

![RPReplay_Final1726645556](https://github.com/user-attachments/assets/88919985-a0fd-40c6-ab13-b064310e1521)

## 使用说明

- 组件基于 flatlist 实现   几乎支持 flatlist 所有属性 个别属性不支持 例如 horizontal 目前仅支持垂直方向
- 基于 ts + hooks 实现 有较好的类型提示
- 支持不定高 item 内部通过布局自动计算 所以 getItemLayout 设置无效
- 关于 ref 的支持 默认取到的是 WaterFallList 的 ref   内部包括自定义的属性和 flatlist 实例方法.    如果想获取内部 flatlist 的 ref 对象 可以通过 WaterFallList 内部转发的的 flatList 属性

```typescript
const waterfallRef = useRef<IWaterFallList>(null);

<WaterFallList ref={waterfallRef} />;

waterfallRef.current?.flatList?.scrollToOffset;
```

## 接口类型定义

```javascript
export type ItemData = {
  offsetTop: number; // !! 元素距离容器顶部的距离
  itemH: number; // 元素高度
  itemData: any; // 元素数据
  columnIndex: number; // 当前元素所在的列
  index: number; // 原始列表的位置索引
};

export type RowData = {
  rowIndex: number; // 第几行
  rowData: ItemData[]; // 每行的列数据
  rowH: number; // 行高度
  rowOffsetTop: number; // !! 每行距离容器顶部的距离
};

export type IRenderItemProps = {
  item: ItemData;
  index: number;
  row: RowData;
};

export interface IWaterFallListProps
  extends Omit<
    FlatListProps<RowData>,
    "renderItem" | "ItemSeparatorComponent"
  > {
  renderItem: ({
    item,
    index,
    row,
  }: IRenderItemProps) => React.ReactElement | null;
  ItemSeparatorComponent?: () => JSX.Element;
  children?: React.ReactNode; // 添加children类型
  rowStyle?: ViewStyle;
}

export interface IWaterFallList {
  refreshList: (offset?: number, animated?: boolean) => void;
  flatList: FlatList | null;
}
```

## 示例

```javascript
import WaterFallList from "react-native-waterfall-list-view"
import React, { memo, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Item from "./item";

const colors = [
  "#5A479A",
  "#001694",
  "#32296B",
  "#D1D1D1",
  "#641024",
  "#FE3666",
  "#292647",
  "#B0E38F",
  "#6195FC",
  "#444444",
  "#FFD283",
  "#52210D",
  "#FFE8ED",
  "#3C325F",
  "#19191E",
];

let index = 0;

const getList = (length = 15) => {
  return Array.from({ length }, () => {
    index++;
    return {
      h: Math.floor(Math.random() * 80) + 100,
      bg: colors[Math.floor(Math.random() * colors.length)],
      index,
      key: index,
      name: index,
    };
  });
};

const App = () => {
  const [list, changeList] = useState([]);
  const waterfallRef = useRef<IWaterFallList>();

  const refresh = () => {
    index = 0;
    waterfallRef.current?.refreshList();
    changeList(getList(20));

    console.log(
      "test scrollToOffset",
      waterfallRef.current?.flatListRef.current?.scrollToOffset
    );
  };

  const onEndReached = () => {
    const nList = [...list, ...getList(20)];
    console.log("test onEndReached", nList);
    changeList(nList);
  };

  const onScroll = () => {
    console.log("test onScroll");
  };

  useEffect(() => {
    changeList(getList(20));
  }, []);

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#FAB5B5",
        paddingHorizontal: 5,
      }}
    >
      <TouchableOpacity onPress={refresh}>
        <View
          style={{
            width: "100%",
            backgroundColor: "blue",
            height: 50,
            marginTop: 20,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>刷新列表</Text>
        </View>
      </TouchableOpacity>
      <WaterFallList
        ref={waterfallRef}
        ItemSeparatorComponent={() => {
          return <View style={{ width: "100%", height: 10 }}></View>;
        }}
        initialNumToRender={10}
        windowSize={10}
        ListHeaderComponent={() => {
          return (
            <View
              style={{
                width: "100%",
                backgroundColor: "orange",
                height: 300,
                marginBottom: 20,
              }}
            ></View>
          );
        }}
        onScroll={onScroll}
        renderItem={({ item }) => <Item data={item}></Item>}
        data={list}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReachedThreshold={0.5}
        onEndReached={onEndReached}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => {
          return (
            <View
              style={{
                width: "100%",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "pink",
              }}
            >
              <Text style={{ fontSize: 30, color: "red" }}>empty</Text>
            </View>
          );
        }}
        ListFooterComponent={() => {
          return (
            <View
              style={{
                width: "100%",
                height: 50,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "pink",
              }}
            >
              <Text style={{ fontSize: 30, color: "red" }}>正在加载中</Text>
            </View>
          );
        }}
      />
    </View>
  );
};
export default memo<typeof App>(App);
```

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

例如当前一行是这个形式：<br>
<img width="631" alt="截屏2024-09-18 19 48 46" src="https://github.com/user-attachments/assets/caa091d4-5a0e-494c-be13-ed0d7714be15">

第三个元素应该加在下一行的最短一列:<br>
<img width="619" alt="截屏2024-09-18 19 48 41" src="https://github.com/user-attachments/assets/2e3de52b-1032-4cb6-926d-344369c6fbbc">

同理第四个元素也加在最短的一列 第二列<br>
然后计算第二行的行高：<br>
因为 flatlist 的一行是以最长的元素高度为准 所以我们需要计算出最长的元素高度是多少 并且还要减去上一行的高度这个偏移量。<br>
所以高度如下 <br>
<img width="636" alt="截屏2024-09-18 17 59 27" src="https://github.com/user-attachments/assets/b000cc2e-4b52-4e72-aba4-d95f9e0bf8e7">

然后不断循环列表 直到结束。
