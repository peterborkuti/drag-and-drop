import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { PanGestureEventData, GestureEventData, TouchGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import { Label } from 'ui/label';

import { AbsoluteLayout as Layout } from 'ui/layouts/absolute-layout';

interface DragLabel {
    label: Label,
    x: number;
    y: number;
}

@Component({
    selector: "ns-dand",
    moduleId: module.id,
    template: `
    <ActionBar title="My App" class="action-bar">
    </ActionBar>
    <AbsoluteLayout #layout width="100%" height="100%" backgroundColor="gray" (touch)="onTouch($event)">
    </AbsoluteLayout> 

    
  `,
  styles: ['h1 { font-weight: normal; }']
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
    polygon : {'index': number, x: number, y: number}[];

    constructor() { }

    ngOnInit(): void {
        this.layout = <Layout>this.layoutElementRef.nativeElement;
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
                    'index': +label.text,
                    'x': Math.round(label.translateX),
                    'y': Math.round(label.translateY)
                })
            );
        this.polygon.forEach(p => console.log(p.index, p.x, p.y));
    }

    moveLabel(label: Label, touchX: number, touchY: number) {
        label.translateX = touchX;
        label.translateY = touchY;
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