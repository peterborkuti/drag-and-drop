import { Image } from 'ui/image';
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { PanGestureEventData, GestureEventData, TouchGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import { Label } from 'ui/label';
import { DragLabel } from './interfaces';

import { AbsoluteLayout as Layout } from 'ui/layouts/absolute-layout';
import {ImageSource, fromFile, fromResource, fromBase64} from "tns-core-modules/image-source";

import { getClosestNeighbourArrayIndex, projectPointOnToLine, getLabelArrayIndex } from './coordutil';

@Component({
    selector: "ns-dand",
    moduleId: module.id,
    template: `
    <ActionBar title="My App" class="action-bar">
    </ActionBar>
    <AbsoluteLayout #layout width="100%" height="100%" backgroundColor="gray" (touch)="onTouch($event)">
    <ContentView id="hm" width="100" height="100" style="clip-path: circle(80% at 55% 40%);"></ContentView>
    </AbsoluteLayout> 
    `,
  styles: ['h1 { font-weight: normal; }', '#hm {background-color: red;}']
})
export class ItemsComponent implements OnInit {
    @ViewChild("layout") layoutElementRef: ElementRef;
    labels: Label[] = [];
    layout: Layout;
    prevDeltaX: number;
    prevDeltaY: number;
    translateX: number;
    translateY: number;
    panning = false;
    polygon : DragLabel[];

    constructor() { }

    ngOnInit(): void {
        this.layout = <Layout>this.layoutElementRef.nativeElement;
        //const imageSource = fromBase64("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==");
        //const image = new Image();
        //image.imageSource = imageSource;
        //image.width = 100;
        //image.height = 100;
        //image.addCss("clip-path: circle(40%);");
        //image.setInlineStyle("clip-path: circle(40%);");
        //this.layout.addChild(image);
    }

    onTouch(args: TouchGestureEventData) {
        if (this.panning && args.action === 'up') {
            this.panning = false;
        }
        else if (!this.panning && args.action === 'up' ) {
            const label = new Label();
            label.text = '' + this.labels.length;
            const myPan = this.onPan.bind(this, label)
            label.on('pan', myPan);
            this.layout.addChild(label);
            label.translateX = args.getX();
            label.translateY = args.getY();
            this.labels.push(label);
            this.refreshPoligon();
        }
    }

    refreshPoligon() {
        this.polygon =
            this.labels.filter(label=>label.text).
            map(label => (
                {
                    'labelIndex': +label.text,
                    'x': Math.round(label.translateX),
                    'y': Math.round(label.translateY)
                })
            );
        this.polygon.forEach(p => console.log(p.labelIndex, p.x, p.y));
    }

    colorizeClosestNeighbour(labelText: string) {

    }

    moveLabel(label: Label, touchX: number, touchY: number) {
        const userPoint = {x: touchX, y: touchY};
        const labelArrayIndex = getLabelArrayIndex(this.polygon, +label.text);
        const neighBourArrayIndex = getClosestNeighbourArrayIndex(this.polygon, +label.text, userPoint);
        const dragLabel = this.polygon[labelArrayIndex];
        const neighbour = this.polygon[neighBourArrayIndex];
        const line = {x0: dragLabel.x, y0: dragLabel.y, x1: neighbour.x, y1: neighbour.y};
        const point = projectPointOnToLine(line, userPoint);
        //colorizeClosestNeighbour(label.text)
        label.translateX = point.x;
        label.translateY = point.y;
    }

    onPan(label: Label, args: PanGestureEventData) {
        if (args.state === 1) // down
        {
          this.panning = true;
          this.prevDeltaX = 0;
          this.prevDeltaY = 0;
          this.translateX = label.translateX;
          this.translateY = label.translateY;
        }
        else if (args.state === 2) // panning
        {
          this.translateX += args.deltaX - this.prevDeltaX;
          this.translateY += args.deltaY - this.prevDeltaY;

          this.moveLabel(label, this.translateX, this.translateY);

          this.prevDeltaX = args.deltaX;
          this.prevDeltaY = args.deltaY;

          if (label.translateX < 0 || label.translateY < 0) {
              label.off('pan');
              label.text = '';
              this.layout.removeChild(label);
              //TODO: meaningfully remove labels from memory
              this.refreshPoligon()
          }
        }
        else if (args.state === 3) // up
        {
            this.refreshPoligon();
        }

    }
}