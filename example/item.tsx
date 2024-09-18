import React, { memo } from "react";
import { Text, View } from "react-native";
import { type ItemData } from "../src/index";

const Item = ({ data }: { data: ItemData }) => {
  const { itemData, columnIndex } = data;

  const align = {
    0: "flex-start",
    1: "center",
    2: "flex-end",
  };

  return (
    <View
      style={{
        height: itemData.h,
        justifyContent: "center",
        alignItems: align[`${columnIndex}`],
      }}
    >
      <View
        style={{
          borderRadius: 10,
          width: "95%",
          height: "100%",
          backgroundColor: itemData.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            color: "white",
          }}
        >
          {itemData.name}
        </Text>
      </View>
    </View>
  );
};
export default memo<typeof Item>(Item);
