import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataRoomPage } from './data-room.page';

describe('DataRoomPage', () => {
  let component: DataRoomPage;
  let fixture: ComponentFixture<DataRoomPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DataRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
