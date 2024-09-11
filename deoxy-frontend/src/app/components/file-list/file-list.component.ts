// src/app/components/file-list/file-list.component.ts
import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-file-list',
  standalone: true,
  templateUrl: './file-list.component.html',
})
export class FileListComponent implements OnInit {
  files: any[] = [];

  constructor(private fileService: FileService) {}

  ngOnInit() {
    // this.fileService.getFiles().subscribe(data => {
    //   this.files = data;
    // });
  }
}
