export interface Message {
    role: string,
    content: string
}

export interface ChatContextType {
    messages: Message[];
    setMessages: (newMessage: Message) => void;
}