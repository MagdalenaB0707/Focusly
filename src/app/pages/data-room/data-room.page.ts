import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonMenuButton, IonFooter } from '@ionic/angular/standalone';

@Component({
  selector: 'app-data-room',
  templateUrl: './data-room.page.html',
  styleUrls: ['./data-room.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButtons, IonMenuButton, IonFooter],
})
export class DataRoomPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
