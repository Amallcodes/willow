'use client'

import { createContext, useContext, useEffect, useState } from "react";
import { ChatContextType, Message } from "../types/chat-types"

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useTodo must be used within a TodoProvider");
    }

    return context;
}

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const [messages, setMessagesState] = useState<Message[]>([]);

    const setMessages = (newMessage: Message) => {
        setMessagesState((prev) => [...prev, newMessage]);
    }

    // load local storage
    useEffect(() => {
        const storedMessages = JSON.parse(localStorage.getItem("messages") || "[]");
        if (storedMessages.length > 0) setMessagesState(storedMessages);
    }, [])

    // set local storage
    useEffect(() => {
        localStorage.setItem("messages", JSON.stringify(messages));
    }, [messages]);

    return (
        <ChatContext.Provider value={{messages, setMessages}}>
            {children}
        </ChatContext.Provider>
    )
}