import * as cu from '../../../src/app/item/coordutil';
import { DragLabel } from '../../../src/app/item/interfaces';

describe('getClosestNeighbour', () => {
    const anyPoint = {x:0, y: 0};

    it('should throw exception when there is no element in the array', () => {
        expect(function() {cu.getClosestNeighbourArrayIndex([], 0, anyPoint)}).toThrow();
    })

    it('should return with the only one index if there is only one element in the array', () => {
        const index = 1;
        const e: DragLabel = {labelIndex: index, x: 0, y: 0};
        expect(cu.getClosestNeighbourArrayIndex([e], 1, anyPoint)).toBe(0);
    })

    it('should return with the other index if there are two elements in the array and the input is one', () => {
        const oneIndex = 1;
        const otherIndex = 2;
        const elements = [
            {labelIndex: oneIndex, x: 0, y: 0},
            {labelIndex: otherIndex, x: 0, y: 0}
        ];
        expect(cu.getClosestNeighbourArrayIndex(elements, oneIndex, anyPoint)).toBe(1);
    })

    it('should throw error when labelIndex is not in array', () => {
        const oneIndex = 1;
        const otherIndex = 2;
        const notExistingIndex = 3;
        const elements = [
            {labelIndex: oneIndex, x: 0, y: 0},
            {labelIndex: otherIndex, x: 0, y: 0}
        ];
        expect(function() {
            cu.getClosestNeighbourArrayIndex(elements, notExistingIndex, anyPoint) }
            ).toThrow();
    })

    it('should return with the closest neighbour', () => {
        const oneNeighbour = 2;
        const oneNeighbourArrayIndex = 1;
        const labelIndex = 3;
        const otherNeighbour = 4;
        const otherNeighbourArrayIndex = 3;
        const elements = [
            {labelIndex: 1, x: 0, y: 0},
            {labelIndex: oneNeighbour, x: 50, y: 50},
            {labelIndex: labelIndex, x: 0, y: 0},
            {labelIndex: otherNeighbour, x: 20, y: 40},
            {labelIndex: 5, x: 0, y: 0}
        ];

        const pointCloseToOne = {x: 51, y: 51}

        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOne)).
        toBe(oneNeighbourArrayIndex);

        const pointCloseToOther = {x: 21, y: 41}

        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOther)).
        toBe(otherNeighbourArrayIndex);
    })

    it('should return with the closest neighbour - circular case - 1', () => {
        const oneNeighbour = 1;
        const oneNeighbourArrayIndex = 0;
        const labelIndex = 4;
        const otherNeighbour = 3;
        const otherNeighbourArrayIndex = 2;
        const elements = [
            {labelIndex: oneNeighbour, x: 50, y: 50},
            {labelIndex: 2, x: 0, y: 0},
            {labelIndex: otherNeighbour, x: 20, y: 70},
            {labelIndex: labelIndex, x: 0, y: 0},
        ];

        const pointCloseToOne = {x: 51, y: 51};
        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOne)).
        toBe(oneNeighbourArrayIndex);

        const pointCloseToOther = {x: 19, y: 69};
        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOther)).
        toBe(otherNeighbourArrayIndex);
    })

    it('should return with the closest neighbour - circular case - 2', () => {
        const oneNeighbour = 2;
        const oneNeighbourArrayIndex = 1;
        const labelIndex = 1;
        const otherNeighbour = 4;
        const otherNeighbourArrayIndex = 3;
        const elements = [
            {labelIndex: labelIndex, x: 0, y: 0},
            {labelIndex: oneNeighbour, x: 50, y: 50},
            {labelIndex: 3, x: 0, y: 0},
            {labelIndex: otherNeighbour, x: 20, y: 40},
        ];

        const pointCloseToOne = {x: 51, y: 51};
        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOne)).
        toBe(oneNeighbourArrayIndex);

        const pointCloseToOther = {x: 19, y: 39};
        expect(cu.getClosestNeighbourArrayIndex(elements, labelIndex, pointCloseToOther)).
        toBe(otherNeighbourArrayIndex);
    })
})

describe('project point onto line', () => {
    it('should deal with horizontal line', () => {
        const line = {x0: 10, y0: 100, x1: 50, y1: 100};
        const point = {x: 5, y: 200}
        expect(cu.projectPointOnToLine(line, point)).toEqual({x: 10, y: 100});
    })

    it('should deal with vertical line', () => {
        const line = {x0: 100, y0: 10, x1: 100, y1: 50};
        const point = {x: 5, y: 200}
        expect(cu.projectPointOnToLine(line, point)).toEqual({x: 100, y: 50});
    })

    it('should deal with normal line and point not out of constraining rectangle', () => {
        const line = {x0: 0, y0: 0, x1: 100, y1: 100};
        const point = {x: 10, y: 50}
        expect(cu.projectPointOnToLine(line, point)).toEqual({x: 30, y: 30});
    })

    it('should deal with normal line and point out of constraining rectangle', () => {
        const line = {x0: 0, y0: 0, x1: 100, y1: 100};
        const point = {x: 200, y: 50}
        expect(cu.projectPointOnToLine(line, point)).toEqual({x: 100, y: 100});
    })
})