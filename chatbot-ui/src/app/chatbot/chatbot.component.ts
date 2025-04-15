import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  messages: { text: string; type: string; fileName?: string }[] = [
    { text: 'Welcome to SIM-AI! How can I assist you?', type: 'bot' }
  ];
  newMessage: string = '';
  selectedFile: File | null = null;
  loading: boolean = false;
  botTyping: boolean = false;
  isDarkTheme: boolean = false;

  constructor(private http: HttpClient) {}

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Selected file:', this.selectedFile.name); // Debug
    } else {
      this.selectedFile = null;
    }
  }

  sendMessage() {
    if (this.newMessage.trim() || this.selectedFile) {
      const userMessage = {
        text: this.newMessage.trim() || (this.selectedFile ? 'File uploaded' : ''),
        type: 'user',
        fileName: this.selectedFile ? this.selectedFile.name : undefined
      };
      this.messages.push(userMessage);

      const formData = new FormData();
      formData.append('question', this.newMessage);
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }

      this.newMessage = '';
      this.selectedFile = null;
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ''; // Allow re-uploading same file
      }

      this.loading = true;
      this.botTyping = true;

      this.http.post<any>('http://localhost:5000/ask', formData).subscribe(
        (response) => {
          const botResponse = response.answer.join('\n');
          this.messages.push({ text: botResponse, type: 'bot' });
          this.botTyping = false;
          this.loading = false;
        },
        (error) => {
          console.error('Error:', error);
          this.messages.push({ text: 'Sorry, an error occurred.', type: 'bot' });
          this.botTyping = false;
          this.loading = false;
        }
      );
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && (this.newMessage.trim() || this.selectedFile)) {
      this.sendMessage();
    }
  }

  clearFile() {
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }
}