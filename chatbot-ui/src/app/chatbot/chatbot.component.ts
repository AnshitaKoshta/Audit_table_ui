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

  messages: { text: string, type: string, isFile?: boolean, fileName?: string }[] = [
    { text: 'Welcome to SIM-AI! How can I assist you?', type: 'bot' }
  ];

  newMessage: string = '';
  loading: boolean = false;
  botTyping: boolean = false;
  isDarkTheme: boolean = false;

  selectedFiles: File[] = [];
  sessionId: string = this.getOrCreateSessionId();

  constructor(private http: HttpClient) {}

  private getOrCreateSessionId(): string {
    const storedId = localStorage.getItem('chat_session_id');
    if (storedId) return storedId;

    const newId = 'session-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chat_session_id', newId);
    return newId;
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  sendMessage() {
  const userId = 'curl_test_user';
  const sessionId = this.sessionId;
  const messageText = this.newMessage.trim();

  if (!messageText) return;

  // Add user message to chat
  this.messages.push({ text: messageText, type: 'user' });

  this.loading = true;
  this.botTyping = true;

  // Reset input
  this.newMessage = '';

  const payload = {
    user_id: userId,
    session_id: sessionId,
    text: messageText
  };

  this.http.post<any>('http://localhost:8000/api/v1/chat/send_message', payload).subscribe(
    (response) => {
      const botResponse = response?.payload?.text || 'No response from server.';
      this.displayBotMessageWithTypingEffect(botResponse);
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

  handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.newMessage.trim()) {
      this.sendMessage();
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
      console.error('Error scrolling to bottom:', err);
    }
  }

  private async displayBotMessageWithTypingEffect(fullText: string) {
    this.messages.push({ text: '', type: 'bot' });
    const index = this.messages.length - 1;
    let currentText = '';

    for (let i = 0; i < fullText.length; i++) {
      currentText += fullText[i];
      this.messages[index].text = currentText;
      await this.delay(10);
    }
    this.botTyping = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
