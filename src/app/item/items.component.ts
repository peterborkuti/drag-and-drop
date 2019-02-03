import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { PanGestureEventData, GestureEventData, TouchGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import { Label } from 'ui/label';

import { AbsoluteLayout as Layout } from 'ui/layouts/absolute-layout';

@Component({
    selector: "ns-dand",
    moduleId: module.id,
    template: `
    <ActionBar title="My App" class="action-bar">
    </ActionBar>
    <AbsoluteLayout #layout width="100%" height="100%" backgroundColor="gray" (touch)="onTouch($event)">
    <Label #dragLabel text="Drag Me" (pan)="onPan($event)"></Label>
    </AbsoluteLayout> 

    
  `,
  styles: ['h1 { font-weight: normal; }']
})
export class ItemsComponent implements OnInit {
    @ViewChild("dragLabel") dragElementRef: ElementRef;
    @ViewChild("layout") layoutElementRef: ElementRef;
    dragLabel: Label;
    newLabel: Label;
    layout: Layout;
    prevDeltaX: number;
    prevDeltaY: number;
    panning = false;

    constructor() { }

    ngOnInit(): void {
        this.dragLabel = <Label>this.dragElementRef.nativeElement;
        this.layout = <Layout>this.layoutElementRef.nativeElement;
        this.newLabel = new Label();
        this.newLabel.text = "Hello";
        this.layout.addChild(this.newLabel);
        this.dragLabel.translateX = 0;
        this.dragLabel.translateY = 0;
        this.dragLabel.scaleX = 1;
        this.dragLabel.scaleY = 1;

        const lSize = this.layout.getActualSize();
        const dSize = this.dragLabel.getActualSize();
        this.dragLabel.translateX = lSize.width - dSize.width;
        this.dragLabel.translateY = lSize.height - dSize.height;
    }

    onTouch(args: TouchGestureEventData) {
        if (this.panning && args.action === 'up') {
            this.panning = false;
        }
        else if (!this.panning && args.action === 'up' ) {
            this.newLabel = new Label();
            this.newLabel.text = "X";
            this.layout.addChild(this.newLabel);
            this.newLabel.translateX = args.getX();
            this.newLabel.translateY = args.getY();
            console.log("touch:", args.getX(), args.getY());
        }
    }

    onPan(args: PanGestureEventData) {
        if (args.state === 1) // down
        {
          this.panning = true;
          this.prevDeltaX = 0;
          this.prevDeltaY = 0;
        }
        else if (args.state === 2) // panning
        {
          this.dragLabel.translateX += args.deltaX - this.prevDeltaX;
          this.dragLabel.translateY += args.deltaY - this.prevDeltaY;
          this.prevDeltaX = args.deltaX;
          this.prevDeltaY = args.deltaY;
        }
        else if (args.state === 3) // up
        {
        }

    }
}