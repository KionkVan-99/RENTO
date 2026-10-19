import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "https://rento-api-rime.onrender.come.onrender.come.onrender.come.onrender.come.onrender.com/api/messages";

function AgentMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMessages = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages.");
      }

      setMessages(data.messages || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
      setError(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = useMemo(() => {
    return messages.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.senderName?.toLowerCase().includes(searchText) ||
        item.senderEmail?.toLowerCase().includes(searchText) ||
        item.message?.toLowerCase().includes(searchText) ||
        item.propertyTitle?.toLowerCase().includes(searchText) ||
        item.propertyLocation?.toLowerCase().includes(searchText);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "unread"
          ? !item.isRead
          : item.isRead;

      return matchesSearch && matchesFilter;
    });
  }, [messages, search, filter]);

  const unreadCount = messages.filter((item) => !item.isRead).length;
  const readCount = messages.filter((item) => item.isRead).length;

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (!message.isRead) {
      try {
        const response = await fetch(
          `${API_URL}/${message.id}/read`,
          {
            method: "PATCH",
          }
        );

        if (response.ok) {
          setMessages((prev) =>
            prev.map((item) =>
              item.id === message.id
                ? { ...item, isRead: true }
                : item
            )
          );

          setSelectedMessage((prev) =>
            prev ? { ...prev, isRead: true } : prev
          );
        }
      } catch (error) {
        console.error("Mark as read error:", error);
      }
    }
  };

  const deleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete message.");
      }

      setMessages((prev) =>
        prev.filter((item) => item.id !== id)
      );

      setSelectedMessage(null);
    } catch (error) {
      console.error("Delete message error:", error);
      alert(error.message || "Failed to delete message.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="agent-messages-page">
      <div className="agent-messages-bg-orb orb-one"></div>
      <div className="agent-messages-bg-orb orb-two"></div>

      <header className="agent-messages-header">
        <div className="agent-messages-header-inner">
          <Link to="/agent" className="agent-back-link">
            <ArrowLeft size={18} />
            Back to Agent
          </Link>

          <div className="agent-messages-brand">
            <span>RENTO</span>
            <small>AGENT CENTER</small>
          </div>

          <button
            className="agent-refresh-btn"
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "spin-icon" : ""}
            />
            Refresh
          </button>
        </div>
      </header>

      <main className="agent-messages-container">
        <section className="agent-messages-hero">
          <div>
            <span className="agent-eyebrow">
              <MessageSquare size={14} />
              INBOX
            </span>

            <h1>
              Agent <span>Messages</span>
            </h1>

            <p>
              Manage inquiries from people interested in your
              properties.
            </p>
          </div>

          <div className="agent-message-stats">
            <div className="message-stat">
              <strong>{messages.length}</strong>
              <span>Total</span>
            </div>

            <div className="message-stat">
              <strong>{unreadCount}</strong>
              <span>Unread</span>
            </div>

            <div className="message-stat">
              <strong>{readCount}</strong>
              <span>Read</span>
            </div>
          </div>
        </section>

        <section className="agent-messages-toolbar">
          <div className="agent-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search messages, names or properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="agent-filter-tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
              <span>{messages.length}</span>
            </button>

            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread
              <span>{unreadCount}</span>
            </button>

            <button
              className={filter === "read" ? "active" : ""}
              onClick={() => setFilter("read")}
            >
              Read
              <span>{readCount}</span>
            </button>
          </div>
        </section>

        {error && (
          <div className="agent-messages-error">
            <X size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="agent-messages-loading">
            <div className="loading-ring"></div>
            <p>Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="agent-empty-state">
            <div className="empty-icon">
              <MessageSquare size={34} />
            </div>

            <h2>No messages found</h2>

            <p>
              {search
                ? "Try changing your search."
                : "Messages from property visitors will appear here."}
            </p>
          </div>
        ) : (
          <section className="agent-messages-layout">
            <div className="agent-message-list">
              {filteredMessages.map((item) => (
                <button
                  key={item.id}
                  className={`agent-message-card ${
                    selectedMessage?.id === item.id
                      ? "selected"
                      : ""
                  } ${!item.isRead ? "unread" : ""}`}
                  onClick={() => openMessage(item)}
                >
                  <div className="message-avatar">
                    {item.senderName
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </div>

                  <div className="message-card-content">
                    <div className="message-card-top">
                      <h3>{item.senderName}</h3>

                      {!item.isRead && (
                        <span className="unread-dot"></span>
                      )}
                    </div>

                    <p className="message-property">
                      <MapPin size={13} />
                      {item.propertyTitle ||
                        "Property inquiry"}
                    </p>

                    <p className="message-preview">
                      {item.message}
                    </p>

                    <span className="message-date">
                      <Clock3 size={12} />
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {selectedMessage && (
              <aside className="agent-message-detail">
                <button
                  className="detail-close"
                  onClick={() => setSelectedMessage(null)}
                >
                  <X size={18} />
                </button>

                <div className="detail-header">
                  <div className="detail-avatar">
                    {selectedMessage.senderName
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </div>

                  <div>
                    <h2>{selectedMessage.senderName}</h2>
                    <p>
                      Sent {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>

                  <CheckCircle2
                    className="read-icon"
                    size={20}
                  />
                </div>

                <div className="detail-property">
                  <span>PROPERTY INQUIRY</span>

                  <h3>
                    {selectedMessage.propertyTitle ||
                      "Property"}
                  </h3>

                  {selectedMessage.propertyLocation && (
                    <p>
                      <MapPin size={15} />
                      {selectedMessage.propertyLocation}
                    </p>
                  )}
                </div>

                <div className="detail-message">
                  <span>MESSAGE</span>

                  <p>{selectedMessage.message}</p>
                </div>

                <div className="detail-contact">
                  <span>CONTACT INFORMATION</span>

                  {selectedMessage.senderEmail && (
                    <a
                      href={`mailto:${selectedMessage.senderEmail}`}
                    >
                      <Mail size={16} />
                      {selectedMessage.senderEmail}
                    </a>
                  )}

                  {selectedMessage.senderPhone && (
                    <a
                      href={`tel:${selectedMessage.senderPhone}`}
                    >
                      <Phone size={16} />
                      {selectedMessage.senderPhone}
                    </a>
                  )}

                  {!selectedMessage.senderEmail &&
                    !selectedMessage.senderPhone && (
                      <p className="no-contact">
                        No contact information provided.
                      </p>
                    )}
                </div>

                <div className="detail-actions">
                  {selectedMessage.senderEmail && (
                    <a
                      href={`mailto:${selectedMessage.senderEmail}`}
                      className="detail-action primary"
                    >
                      <Mail size={16} />
                      Reply by Email
                    </a>
                  )}

                  {selectedMessage.senderPhone && (
                    <a
                      href={`tel:${selectedMessage.senderPhone}`}
                      className="detail-action"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  )}

                  <button
                    className="detail-action delete"
                    onClick={() =>
                      deleteMessage(selectedMessage.id)
                    }
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </aside>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default AgentMessages;