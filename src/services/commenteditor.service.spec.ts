import { TestBed } from '@angular/core/testing';

import { CommentEditorService } from './commenteditor.service';

describe('CommenteditorService', () => {
  let service: CommentEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
