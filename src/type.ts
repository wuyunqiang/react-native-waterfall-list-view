import React from 'react';
import { FlatList, type FlatListProps, type ViewStyle } from 'react-native';

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
    extends Omit<FlatListProps<RowData>, 'renderItem' | 'ItemSeparatorComponent'> {
    renderItem: ({ item, index, row }: IRenderItemProps) => React.ReactElement | null;
    ItemSeparatorComponent?: () => JSX.Element;
    children?: React.ReactNode; // 添加children类型
    rowStyle?: ViewStyle;
    data: any[];
}

export interface IWaterFallList {
    refreshList: (offset?: number, animated?: boolean) => void;
    flatList: FlatList | null;
}