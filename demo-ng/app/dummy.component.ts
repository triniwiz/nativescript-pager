import { Component } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
    selector: 'dummy',
    template: `
		<StackLayout>
      <Label text="Just a test page - go back now"></Label>
      <Button text="go back" (tap)="goBack()"></Button>
      
		</StackLayout>
    `
})
export class DummyComponent {
  constructor(private routerExtensions: RouterExtensions){}

  goBack() {
    this.routerExtensions.back();
  }
}