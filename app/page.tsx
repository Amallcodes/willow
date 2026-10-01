'use client'

import { chatClaude } from "@/lib/chat-claude";
import { useState } from "react";
import { useChat } from "@/store/chat-context";

const Home = () => {
  const [formInput, setformInput] = useState("");
  const { messages, setMessages } = useChat();
  const [isLoading, setIsLoading] = useState(false);

  /* an array of messages with context. eg
  [
    {
      role: "user",
      content: "content"
    },
    {
      role: "assistant",
      content: "content"
    }
  ]
  */

  const submitPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newMessage = {
      role: "user",
      content: formInput
    }

    setMessages(newMessage)
    const updatedMessages = [...messages, newMessage];
    setIsLoading(true);

    try {
      const reply = await chatClaude(updatedMessages);

      if (reply) {
        setMessages({ role: "assistant", content: reply });
        setformInput("");
      }

      console.log(reply)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="aura-app">
      <div className="aura-glow aura-glow-top" />
      <div className="aura-glow aura-glow-bottom" />

      <header className="aura-header">
        <button className="icon-button" type="button" aria-label="Open menu">
          <span />
          <span />
          <span />
        </button>
        <div className="aura-brand">
          <span>Willow</span>
          <small>1.3</small>
          <em>BETA</em>
          <span className="chevron">v</span>
        </div>
        <div className="aura-actions">
          <button className="icon-button aura-action" type="button" aria-label="Voice chat">o</button>
          <button className="icon-button aura-action" type="button" aria-label="New chat">+</button>
          <button className="icon-button aura-action" type="button" aria-label="More options">...</button>
        </div>
      </header>

      <main className="aura-main">
        <section className="aura-hero">
          <div className="aura-orb" aria-hidden="true">
            <div className="aura-orb-core" />
          </div>
          <p className="aura-kicker">YOUR PERSONAL EMAIL AGENT</p>
          <h1>Hello Amal</h1>
          <p className="aura-subtitle">What would you like to get done today?</p>
        </section>

        {/* message list */}
        <div className="aura-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={"aura-message-row " + (msg.role === "user" ? "aura-message-row-user" : "aura-message-row-assistant")}
            >
              <div
                className={"aura-message " + (msg.role === "user" ? "aura-message-user" : "aura-message-assistant")}
              >
                {msg.role !== "user" && <span className="message-orb" aria-hidden="true" />}
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="aura-message-row aura-message-row-assistant">
              <div className="aura-message aura-message-assistant aura-loader" aria-label="Aura is thinking">
                <span className="aura-loader-dots" aria-hidden="true">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </span>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={submitPrompt}
          className="aura-composer"
        >
          <button className="composer-add" type="button" aria-label="Add attachment">+</button>
          <input
            type="text"
            className="aura-input"
            placeholder="Ask Willow anything..."
            value={formInput}
            onChange={(e) => setformInput(e.target.value)}
          />
          <button className="composer-send" type="submit" aria-label="Send message">&gt;</button>
        </form>
      </main>
    </div>
  );
}

export default Home
