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
  isDarkTheme: boolean = false; // Track theme state
  selectedFile: File | null=null;
  selectedFileName: string | null = null; // Track selected file name

  toggleTheme() { 
    this.isDarkTheme = !this.isDarkTheme; // Toggle theme
  }

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event) {
    const input= event.target as HTMLInputElement;
    if(input.files && input.files.length >0){
      this.selectedFile=input.files[0];
      this.selectedFileName=this.selectedFile.name; // Store the selected file name
      console.log('Selected file:', this.selectedFile);
     
    }
  }

  sendMessage() {
    const hasText = this.newMessage.trim() !== '';
    const hasFile = this.selectedFile && this.selectedFileName;
  
    if (hasText || hasFile) {
      if (hasText) {
        this.messages.push({ text: this.newMessage.trim(), type: 'user' });
      }
  
      if (hasFile) {
        this.messages.push({
          text: `Attached: ${this.selectedFileName}`,
          type: 'user',
          isFile: true,
          fileName: this.selectedFileName || ''
        });
   
      }
  
      this.loading = true;
      this.botTyping = true;

      // Construct FormData to send the file
      const formData=new FormData();
      formData.append('question', hasText ? this.newMessage.trim() : '');
      if(this.selectedFile){
        formData.append('file',this.selectedFile,this.selectedFileName || '');
      }

      this.newMessage = '';
      this.selectedFile = null;
      this.selectedFileName = null;
  
      // Send only the text part to backend, not file name
      // const lastTextMessage = this.messages
      //   .filter(m => m.type === 'user' && !m.isFile)
      //   .slice(-1)[0];
  
      this.http.post<any>('http://localhost:5000/ask', formData).subscribe(
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