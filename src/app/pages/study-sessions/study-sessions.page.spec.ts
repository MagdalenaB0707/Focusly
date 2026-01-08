import { ComponentFixture, TestBed } from '@angular/core/testing';
import { studySessionsPage } from './study-sessions.page';

describe('studySessionsPage', () => {
  let component: studySessionsPage;
  let fixture: ComponentFixture<studySessionsPage>;
  beforeEach(() => {
    fixture = TestBed.createComponent(studySessionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
