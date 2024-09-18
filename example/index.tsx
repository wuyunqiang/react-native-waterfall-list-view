import React, { memo, useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import WaterFallList, { type IWaterFallList } from "../src/index";
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
