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
  messages: { text: string, type: string }[] = [{ text: 'Welcome to SIM-AI! How can I assist you?', type: 'bot' }];
  newMessage: string = '';
  loading: boolean = false;
  botTyping: boolean = false;

  constructor(private http: HttpClient) {}

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({ text: this.newMessage, type: 'user' });
      this.newMessage = '';
      this.loading = true;
      this.botTyping = true;

      this.http.post<any>('http://localhost:5000/ask', { question: this.messages[this.messages.length - 1].text }).subscribe(
        (response) => {
          const botResponse = response.answer.join('\n');
          this.messages.push({ text: botResponse, type: 'bot' });
          this.botTyping = false;
          this.loading = false;
        },
        (error) => {
          console.error('Error fetching response:', error);
          this.messages.push({ text: 'Sorry, an error occurred. Please try again.', type: 'bot' });
          this.botTyping = false;
          this.loading = false;
        }
      );
    }
  }

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.newMessage.trim()) {
      this.sendMessage();
    }
  }

  // Scroll to the bottom after the view is checked
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}