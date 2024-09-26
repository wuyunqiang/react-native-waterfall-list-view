import React, { useRef, useState, useEffect, useImperativeHandle, memo, forwardRef, } from "react";
import { FlatList, View } from "react-native";
const WaterFallList = (props, ref) => {
    const p = { ...props };
    Reflect.deleteProperty(p, "getItemLayout");
    const { data, numColumns = 2, rowStyle, ItemSeparatorComponent, ...otherProps } = p;
    const _itemHeightsRef = useRef([]);
    const flatListRef = useRef(null);
    const [update, forceUpdate] = useState(false);
    const [listData, changeListData] = useState([]);
    useEffect(() => {
        _itemHeightsRef.current = [];
    }, [numColumns]);
    useImperativeHandle(ref, () => {
        return {
            flatList: flatListRef.current,
            refreshList(offset = 0, animated = true) {
                _itemHeightsRef.current = [];
                flatListRef.current?.scrollToOffset({
                    offset,
                    animated,
                });
            },
        };
    }, []);
    useEffect(() => {
        if (!data) {
            return;
        }
        const columnHeights = new Array(numColumns).fill(0);
        let rowData = [];
        let rowIndex = 0;
        let rowOffsetTop = 0;
        const dataSource = [];
        data.forEach((item, index) => {
            /**
             * 选中当前高度最小的列 将元素放在高度最小的列
             */
            let columnIndex = 0;
            for (let idx = 1; idx < numColumns; idx++) {
                if (columnHeights[columnIndex] > columnHeights[idx]) {
                    columnIndex = idx;
                    break;
                }
            }
            const itemH = _itemHeightsRef.current[index] || 0;
            const offsetTop = columnHeights[columnIndex] || 0;
            columnHeights[columnIndex] += itemH;
            if (rowData.length === numColumns) {
                rowOffsetTop += dataSource[rowIndex]?.rowH || 0;
                rowData = [];
                rowIndex++;
            }
            rowData.push({
                offsetTop,
                itemH,
                index,
                itemData: item,
                columnIndex,
            });
            /**
             * 一行的高度由最高的item决定
             * 获取一行中 最高的item
             */
            const largestItem = rowData.sort((a, b) => b.itemH + b.offsetTop - (a.itemH + a.offsetTop))[0];
            const rowH = largestItem.offsetTop + largestItem.itemH - rowOffsetTop;
            dataSource[rowIndex] = {
                rowIndex,
                rowData,
                rowH,
                rowOffsetTop,
            };
        });
        forceUpdate(false);
        changeListData(dataSource);
    }, [data, numColumns, update]);
    console.log("test rerender");
    /**
     * 收集每个item的实际高度
     */
    const onItemHeightChange = (height, index) => {
        if (!data) {
            return;
        }
        if (_itemHeightsRef.current[index] === height) {
            return;
        }
        _itemHeightsRef.current[`${index}`] = height;
        for (let i = 0; i < data.length; i++) {
            if (_itemHeightsRef.current[i] === undefined) {
                return;
            }
        }
        console.log("test 强制刷新");
        /**
         * 所有item高度收集完毕后强制刷新页面
         */
        forceUpdate(!update);
    };
    return (<FlatList keyExtractor={(item, index) => `row_${index}`} {...otherProps} ref={flatListRef} ItemSeparatorComponent={null} horizontal={false} numColumns={1} data={listData} renderItem={({ item }) => {
            return (<View style={[
                    rowStyle ? rowStyle : { width: "100%" },
                    {
                        position: "relative",
                        height: item.rowH || 0,
                    },
                ]}>
            {item.rowData.map((rowItemData) => {
                    const { offsetTop, columnIndex, index, itemH } = rowItemData;
                    const opacity = itemH ? 1 : 0;
                    const itemW = 100 / numColumns;
                    return (<View key={index} style={{
                            position: "absolute",
                            top: offsetTop - item.rowOffsetTop,
                            left: `${columnIndex * itemW}%`,
                            opacity,
                            width: `${itemW}%`,
                        }} onLayout={(e) => {
                            onItemHeightChange(e.nativeEvent.layout.height, index);
                        }}>
                  <>
                    {props.renderItem({ item: rowItemData, index, row: item })}
                    {ItemSeparatorComponent && ItemSeparatorComponent()}
                  </>
                </View>);
                })}
          </View>);
        }}/>);
};
export default memo(forwardRef(WaterFallList));
//# sourceMappingURL=index.js.map