import {Component, Input} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {DialogModule} from "primeng/dialog";
import {InputMaskModule} from "primeng/inputmask";
import {InputNumberModule} from "primeng/inputnumber";
import {InputTextModule} from "primeng/inputtext";
import {InvaidTextComponent} from "../../form/invaid-text/invaid-text.component";
import {NgClass, NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ToastService} from "@services/toast";
import {CommentsService} from "@services/comments";
import { CommentPayload} from "@services/interfaces"
import {InputTextareaModule} from "primeng/inputtextarea";
import {ActivatedRoute} from "@angular/router";
import {finalize} from "rxjs";

@Component({
  selector: 'app-comment-dialog',
  standalone: true,
  imports: [
    ButtonModule,
    DialogModule,
    InputMaskModule,
    InputNumberModule,
    InputTextModule,
    InvaidTextComponent,
    NgIf,
    ReactiveFormsModule,
    NgClass,
    InputTextareaModule
  ],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.css'
})
export class CommentDialogComponent {
  visible: boolean = false;
  loading: boolean = false;
  @Input() getData!: Function
  public ruleForm = new FormGroup({
    comment: new FormControl<string>('', [Validators.required]),
    announcement: new FormControl<number | null>(null)
  })

  constructor(
    private toastService: ToastService,
    private commentService: CommentsService,
    private route: ActivatedRoute
  ) {
    this.ruleForm.patchValue({
      announcement: Number(this.route.snapshot.paramMap.get('id'))
    })
  }

  public onSubmit(): void {
    this.ruleForm.markAllAsTouched()
    if (this.ruleForm.invalid) return;
    this.postComment()
  }

  eventPipe(data: any) {
    this.closeDialog();
    this.ruleForm.reset();
    this.toastService.showMessage('success', 'Success', data.message)
  }

  postComment() {
    this.loading = true
    this.commentService.post(this.dataTransform()).pipe(finalize(() => {
      this.getData()
    })).subscribe((response) => {
      this.eventPipe({message: "Комментарий успешно отправлен", response: response});
    },)
  }

  dataTransform(): CommentPayload {
    return {
      comment: this.ruleForm.get('comment')!.value || '',
      announcement: this.ruleForm.get('announcement')!.value || 0
    }
  }

  showDialog() {
    this.visible = true;
  }

  closeDialog() {
    this.visible = false;
  }
}
