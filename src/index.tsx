import React, {
  type ForwardRefRenderFunction,
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  FlatList,
  type FlatListProps,
  View,
  type ViewStyle,
} from "react-native";

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

const WaterFallList: ForwardRefRenderFunction<
  IWaterFallList,
  IWaterFallListProps
> = (props: IWaterFallListProps, ref) => {
  const {
    data,
    numColumns = 2,
    rowStyle,
    getItemLayout,
    ItemSeparatorComponent,
    ...otherProps
  } = props;
  const _itemHeightsRef = useRef<number[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const [update, forceUpdate] = useState(false);
  const [listData, changeListData] = useState<RowData[]>([]);

  useEffect(() => {
    _itemHeightsRef.current = [];
  }, [numColumns]);

  useImperativeHandle(
    ref,
    () => {
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
    },
    []
  );

  useEffect(() => {
    if (!data) {
      return;
    }
    const columnHeights = new Array(numColumns).fill(0);
    let rowData: ItemData[] = [];
    let rowIndex = 0;
    let rowOffsetTop = 0;
    const dataSource: RowData[] = [];
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
      const largestItem = rowData.sort(
        (a, b) => b.itemH + b.offsetTop - (a.itemH + a.offsetTop)
      )[0];

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
  const onItemHeightChange = (height: number, index: number) => {
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

  return (
    <FlatList
      keyExtractor={(item, index) => `row_${index}`}
      {...otherProps}
      ref={flatListRef}
      ItemSeparatorComponent={null}
      horizontal={false}
      numColumns={1}
      data={listData}
      renderItem={({ item }) => {
        return (
          <View
            style={[
              rowStyle ? rowStyle : { width: "100%" },
              {
                position: "relative",
                height: item.rowH || 0,
              },
            ]}
          >
            {item.rowData.map((rowItemData: ItemData) => {
              const { offsetTop, columnIndex, index, itemH } = rowItemData;
              const opacity = itemH ? 1 : 0;
              const itemW = 100 / numColumns;
              return (
                <View
                  key={index}
                  style={{
                    position: "absolute",
                    top: offsetTop - item.rowOffsetTop,
                    left: `${columnIndex * itemW}%`,
                    opacity,
                    width: `${itemW}%`,
                  }}
                  onLayout={(e) => {
                    onItemHeightChange(e.nativeEvent.layout.height, index);
                  }}
                >
                  <>
                    {props.renderItem({ item: rowItemData, index, row: item })}
                    {ItemSeparatorComponent && ItemSeparatorComponent()}
                  </>
                </View>
              );
            })}
          </View>
        );
      }}
    />
  );
};

export default memo(
  forwardRef<IWaterFallList, IWaterFallListProps>(WaterFallList)
);
