import { DragLabel, Line, Point } from './interfaces';

function getNeighboursArrayIndexes(dragLabels: DragLabel[], labelArrayIndex: number): [number, number] {
    const leftNeighbourArrayIndex = (labelArrayIndex === 0) ? dragLabels.length - 1 : labelArrayIndex - 1;
    const rightNeighbourArrayIndex = (labelArrayIndex === dragLabels.length - 1) ? 0 : labelArrayIndex + 1;

    return [leftNeighbourArrayIndex, rightNeighbourArrayIndex];
}

function distance(point1: Point, point2: Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;

    return Math.sqrt( dx * dx + dy * dy);
}

function getDistance(dragLabels: DragLabel[], point: Point, neighbourIndex): number {
    const [x , y] = [dragLabels[neighbourIndex].x, dragLabels[neighbourIndex].x];

    return distance(point, {x, y});
}

export function getLabelArrayIndex(dragLabels: DragLabel[], labelIndex: number): number {
    const arrIndexes = dragLabels.
    map((e, i) => ({labelIndex: e.labelIndex, arrayIndex: i})).
    filter(e => e.labelIndex === labelIndex);

    if (arrIndexes.length === 0) {
        throw new Error("LabelIndex should be in the array");
    }

    if (arrIndexes.length > 1) {
        throw new Error("LabelIndex should be only once in the array");
    }

    const labelArrayIndex = arrIndexes[0].arrayIndex;

    return labelArrayIndex;
}

export function getClosestNeighbourArrayIndex(
        dragLabels: DragLabel[],
        labelIndex: number,
        point: Point): number
    {

    if (!dragLabels || dragLabels.length === 0) {
        throw new Error("Array should not be empty");
    }

    const labelArrayIndex = getLabelArrayIndex(dragLabels, labelIndex);

    if (dragLabels.length === 1) {
        return 0;
    }

    if (dragLabels.length === 2) {
        return 1 - labelArrayIndex;
    }

    const indexes = getNeighboursArrayIndexes(dragLabels, labelArrayIndex);

    const dragLabel = dragLabels[labelArrayIndex];
    const dragLabel1 = dragLabels[indexes[0]];
    const dragLabel2 = dragLabels[indexes[1]];

    const line1 = {x0: dragLabel1.x, y0:dragLabel1.y, x1:dragLabel.x, y1: dragLabel.y};
    const line2 = {x0: dragLabel2.x, y0:dragLabel2.y, x1:dragLabel.x, y1: dragLabel.y};
    const distances = [
        distanceOfLineAndPoint(line1, point),
        distanceOfLineAndPoint(line2, point)
    ];

    return (distances[0] < distances[1]) ? indexes[0] : indexes[1];
}

function constrain(line: Line, point: Point): Point {
    let p: Point = {x: point.x, y: point.y};
    const maxX = Math.max(line.x0, line.x1);
    const minX = Math.min(line.x0, line.x1);
    const maxY = Math.max(line.y0, line.y1);
    const minY = Math.min(line.y0, line.y1);

    p.x = Math.max(Math.min(point.x, maxX), minX);
    p.y = Math.max(Math.min(point.y, maxY), minY);

    return p;
}

export function projectPointOnToLine(
        line: {x0: number, y0: number, x1: number, y1: number},
        point: {x: number, y: number},
        epsilon = 2
    ): {x: number, y: number} {

    // line is horizontal
    if (Math.abs(line.y0 - line.y1) < epsilon) {
        return constrain(line, {x: point.x, y: line.y0})
    }

    // line is vertical
    if (Math.abs(line.x0 - line.x1) < epsilon) {
        return constrain(line, {x: line.x0, y: point.y})
    }

    // slope of the line
    const m = (line.y1 - line.y0) / (line.x1 - line.x0);

    // This is the end-equation of the process:
    //  write te eq of the line
    //  stand a perpendicular line onto it which goes through the point
    //  write the eq of the cross-point of these two lines
    //  this is the projection of the point onto the line
    const x = (point.x / m + point.y + m * line.x0 - line.y0) / (m + 1 / m);
    const y = m * (x - line.x0) + line.y0;

    return constrain(line, {x, y});
}

function distanceOfLineAndPoint(line: Line, point: Point): number {
    const pointOnLine = projectPointOnToLine(line, point);

    return distance(point, pointOnLine);
}