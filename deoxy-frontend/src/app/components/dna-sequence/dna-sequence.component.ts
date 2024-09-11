import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DnaService } from '../../services/dna.service';

@Component({
  selector: 'app-dna-sequence',
  standalone: true,
  templateUrl: './dna-sequence.component.html',
})
export class DnaSequenceComponent implements OnInit {
  dnaSequence!: string;

  constructor(private route: ActivatedRoute, private dnaService: DnaService) {}

  ngOnInit() {
    const fileId = this.route.snapshot.paramMap.get('id');

    // Convert fileId to a number and handle null case
    if (fileId) {
      const numericFileId = Number(fileId);
      if (!isNaN(numericFileId)) {
        this.dnaService.getDnaSequence(numericFileId).subscribe(sequence => {
          this.dnaSequence = sequence.dna_sequence;
        });
      } else {
        console.error('File ID is not a valid number.');
      }
    } else {
      console.error('File ID is null.');
    }
  }
}
