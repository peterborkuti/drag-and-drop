import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { PanGestureEventData, TouchGestureEventData } from "ui/gestures/gestures";
import { Label } from 'ui/label';
import { AbsoluteLayout as Layout } from 'ui/layouts/absolute-layout';

import { DragLabel } from './interfaces';

import {
    getClosestNeighbourArrayIndex,
    projectPointOnToLine,
    getLabelArrayIndex
} from './coordutil';

@Component({
    selector: "ns-dand",
    moduleId: module.id,
    template:`
    <ActionBar title="drag demo" class="action-bar">
    </ActionBar>
    <StackLayout>
    <Label text="1. Place movable pieces with touching the screen"></Label>
    <Label text="2. Drag the pieces with dragging"></Label>
    <Label textWrap=true text="Movements are constrained on lines to the two neighbor pieces"></Label>
    <AbsoluteLayout
        #layout
        width="100%" height="100%"
        backgroundColor="gray"
        (touch)="placeNewLabel($event)">
    </AbsoluteLayout>
    </StackLayout>
    `,
  styles: ['h1 { font-weight: normal; }']
})
export class ItemsComponent implements OnInit {
    @ViewChild("layout") private layoutElementRef: ElementRef;

    private labels: Label[] = [];
    private layout: Layout;
    private prevDeltaX: number;
    private prevDeltaY: number;
    private translateX: number;
    private translateY: number;
    private panning = false;
    private polygon : DragLabel[];

    ngOnInit(): void {
        this.layout = <Layout>this.layoutElementRef.nativeElement;
    }

    // touch handler
    placeNewLabel(args: TouchGestureEventData) {
        if (this.panning && args.action === 'up') {
            this.panning = false;
        }
        else if (!this.panning && args.action === 'up' ) {
            const label = this.createLabel(this.labels.length, args.getX(), args.getY());

            this.layout.addChild(label);
            this.labels.push(label);

            this.polygon = this.refreshPoligon(this.labels);
        }
    }

    private createLabel(text: number, x: number, y: number): Label {
        const label = new Label();

        label.text = '' + text;
        label.translateX = x;
        label.translateY = y;

        const myPan = this.dragLabel.bind(this, label);
        label.on('pan', myPan);

        return label;
    }

    private refreshPoligon(labels: Label[]): DragLabel[] {
        return labels.
            filter(label=>label.text).
            map(label => (
                {
                    'labelIndex': +label.text,
                    'x': Math.round(label.translateX),
                    'y': Math.round(label.translateY)
                })
            );
    }

    // pan handler for labels
    dragLabel(label: Label, args: PanGestureEventData) {
        switch (args.state) {
            case 1: {
                this.startPanning(label);
                break;
            }
            case 2: {
                this.doPanning(label, args);
                break;
            }
            case 3: {
                this.endPanning();
            }
        }
    }

    private startPanning(label: Label): void {
        this.panning = true;
        this.prevDeltaX = 0;
        this.prevDeltaY = 0;
        this.translateX = label.translateX;
        this.translateY = label.translateY;
    }

    private endPanning(): void {
        this.polygon = this.refreshPoligon(this.labels);
    }

    private doPanning(label: Label, args: PanGestureEventData): void {
        this.translateX += args.deltaX - this.prevDeltaX;
        this.translateY += args.deltaY - this.prevDeltaY;

        this.moveLabel(label, this.translateX, this.translateY);

        this.prevDeltaX = args.deltaX;
        this.prevDeltaY = args.deltaY;
    }

    private moveLabel(label: Label, touchX: number, touchY: number) {
        const userPoint = {x: touchX, y: touchY};

        const labelArrayIndex = getLabelArrayIndex(this.polygon, +label.text);
        const dragLabel = this.polygon[labelArrayIndex];

        const neighBourArrayIndex = getClosestNeighbourArrayIndex(this.polygon, +label.text, userPoint);
        const neighbour = this.polygon[neighBourArrayIndex];

        const line = {x0: dragLabel.x, y0: dragLabel.y, x1: neighbour.x, y1: neighbour.y};

        const point = projectPointOnToLine(line, userPoint);

        label.translateX = point.x;
        label.translateY = point.y;
    }

}