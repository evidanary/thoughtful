import React, { useState, useCallback, useRef } from 'react';

const SocialMedia = () => {
  const [pastedContent, setPastedContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("list");
  const [scheduledPosts, setScheduledPosts] = useState({}); // { postId: 'YYYY-MM-DD' }
  const [draggedPost, setDraggedPost] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const calendarRef = useRef(null);

  // Parse pasted content from Google Sheets (tab-separated)
  const parseGoogleSheetsContent = useCallback((content) => {
    if (!content.trim()) {
      setPosts([]);
      return;
    }

    const lines = content.trim().split("\n");
    const parsedPosts = [];

    lines.forEach((line, index) => {
      // Skip empty lines
      if (!line.trim()) return;

      // Split by tab (Google Sheets copies as tab-separated)
      const columns = line.split("\t");

      // Expect 4 columns: Date Added, Post Content, Image List, Status
      if (columns.length >= 4) {
        const [dateAdded, postContent, imageList, status] = columns;

        // Parse image list (could be comma-separated URLs)
        const images = imageList
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        parsedPosts.push({
          id: `post-${index}-${Date.now()}`,
          dateAdded: dateAdded.trim(),
          content: postContent.trim(),
          images,
          status: status.trim(),
          originalIndex: index,
        });
      }
    });

    setPosts(parsedPosts);
  }, []);

  const handlePaste = (e) => {
    const content = e.target.value;
    setPastedContent(content);
    parseGoogleSheetsContent(content);
  };

  const handleContentEdit = (postId, newContent) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, content: newContent } : post
      )
    );
  };

  // Filter posts for queue (exclude "Posted" status and already scheduled posts)
  const queuedPosts = posts.filter(
    (post) => post.status.toLowerCase() !== "posted" && !scheduledPosts[post.id]
  );

  // Get scheduled date for a post
  const getScheduledDate = (postId) => scheduledPosts[postId] || null;

  // Drag and drop handlers
  const handleDragStart = (e, post) => {
    setDraggedPost(post);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", post.id);
  };

  const handleDragEnd = () => {
    setDraggedPost(null);
    setHoveredDate(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, date) => {
    e.preventDefault();
    if (draggedPost) {
      setHoveredDate(date);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving to a non-calendar element
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setHoveredDate(null);
    }
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    if (draggedPost) {
      setScheduledPosts((prev) => ({
        ...prev,
        [draggedPost.id]: date,
      }));
    }
    setDraggedPost(null);
    setHoveredDate(null);
  };

  const removeFromSchedule = (postId) => {
    setScheduledPosts((prev) => {
      const updated = { ...prev };
      delete updated[postId];
      return updated;
    });
  };

  // Generate calendar data for 6 months starting from current month
  const generateCalendarData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const months = [];

    for (let i = 0; i < 6; i++) {
      const month = (currentMonth + i) % 12;
      const year = currentYear + Math.floor((currentMonth + i) / 12);

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

      // Adjust to start from Monday (0 = Monday, 6 = Sunday)
      const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

      const days = [];

      // Add empty cells for days before the first
      for (let j = 0; j < adjustedStartDay; j++) {
        days.push(null);
      }

      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        days.push({
          day,
          date: dateStr,
          isToday: new Date().toISOString().split("T")[0] === dateStr,
        });
      }

      months.push({
        name: new Date(year, month).toLocaleString("default", {
          month: "long",
        }),
        year,
        days,
      });
    }

    return months;
  };

  const calendarData = generateCalendarData();
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Helper to escape content for CSV/TSV format (preserves newlines in Google Sheets)
  const escapeForSheet = (text) => {
    // Escape double quotes by doubling them, then wrap in double quotes
    // This allows newlines and special characters to be preserved in the cell
    const escaped = text.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  // Copy schedule to clipboard
  const copyScheduleToClipboard = () => {
    const scheduledEntries = Object.entries(scheduledPosts)
      .map(([postId, date]) => {
        const post = posts.find((p) => p.id === postId);
        if (!post) return null;

        // Preserve formatting by wrapping in quotes (escapes newlines for Google Sheets)
        const formattedContent = escapeForSheet(post.content.trim());
        const formattedImages = escapeForSheet(post.images.join(", ").trim());

        // Format: Date\tContent\tImages\tStatus (always "Pending")
        return `${date}\t${formattedContent}\t${formattedImages}\tPending`;
      })
      .filter(Boolean);

    const clipboardText = scheduledEntries.join("\n");

    navigator.clipboard
      .writeText(clipboardText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  // Get posts scheduled for a specific date
  const getPostsForDate = (date) => {
    return Object.entries(scheduledPosts)
      .filter(([_, scheduledDate]) => scheduledDate === date)
      .map(([postId, _]) => posts.find((p) => p.id === postId))
      .filter(Boolean);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0d1117",
        padding: "20px",
        color: "#e6edf3",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {/* Header */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "2.5rem",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #f97316, #fb923c, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.5px",
          }}
        >
          📱 Social Media Planner
        </h1>

        {/* Paste Area */}
        <div
          style={{
            backgroundColor: "#161b22",
            borderRadius: "16px",
            border: "1px solid #30363d",
            padding: "24px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>📋</span>
            <h2
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#e6edf3",
              }}
            >
              Paste from Google Sheets
            </h2>
          </div>
          <p
            style={{
              margin: "0 0 16px 0",
              color: "#8b949e",
              fontSize: "14px",
            }}
          >
            Copy data from Google Sheets with columns:{" "}
            <strong>Date Added</strong>, <strong>Post Content</strong>,{" "}
            <strong>Image List</strong>, <strong>Status</strong>
          </p>
          <textarea
            value={pastedContent}
            onChange={handlePaste}
            placeholder="Paste your Google Sheets content here...&#10;&#10;Example:&#10;2024-01-15	Check out our latest product launch! 🚀	https://example.com/img1.jpg, https://example.com/img2.jpg	Draft&#10;2024-01-16	Happy Monday everyone! ☀️	https://example.com/monday.jpg	Scheduled"
            style={{
              width: "100%",
              minHeight: "150px",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #30363d",
              backgroundColor: "#0d1117",
              color: "#e6edf3",
              fontSize: "14px",
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#f97316")}
            onBlur={(e) => (e.target.style.borderColor = "#30363d")}
          />
          {posts.length > 0 && (
            <div
              style={{
                marginTop: "12px",
                padding: "8px 12px",
                backgroundColor: "#238636",
                borderRadius: "8px",
                color: "white",
                fontSize: "14px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>✓</span>
              Parsed {posts.length} post{posts.length !== 1 ? "s" : ""} (
              {queuedPosts.length} in queue)
            </div>
          )}
        </div>

        {/* Queue Section */}
        {queuedPosts.length > 0 && (
          <div
            style={{
              backgroundColor: "#161b22",
              borderRadius: "16px",
              border: "1px solid #30363d",
              padding: "24px",
              marginBottom: "30px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🔄</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  color: "#e6edf3",
                }}
              >
                Queue
              </h2>
              <span
                style={{
                  backgroundColor: "#f97316",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {queuedPosts.length} posts
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "16px",
                overflowX: "auto",
                paddingBottom: "12px",
                scrollbarWidth: "thin",
                scrollbarColor: "#30363d #161b22",
              }}
            >
              {queuedPosts.map((post) => {
                const scheduledDate = getScheduledDate(post.id);
                return (
                  <div
                    key={post.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, post)}
                    onDragEnd={handleDragEnd}
                    style={{
                      flex: "0 0 200px",
                      width: "200px",
                      height: "200px",
                      backgroundColor: "#21262d",
                      borderRadius: "12px",
                      border:
                        draggedPost?.id === post.id
                          ? "2px solid #f97316"
                          : "1px solid #30363d",
                      padding: "16px",
                      cursor: "grab",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(249, 115, 22, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Status Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        backgroundColor:
                          post.status.toLowerCase() === "draft"
                            ? "#6e7681"
                            : post.status.toLowerCase() === "scheduled"
                            ? "#1f6feb"
                            : "#f97316",
                        color: "white",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                      }}
                    >
                      {post.status}
                    </div>

                    {/* Image Preview */}
                    {post.images.length > 0 && (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          backgroundColor: "#30363d",
                          marginBottom: "12px",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={post.images[0]}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML = "🖼️";
                          }}
                        />
                      </div>
                    )}

                    {/* Content Preview */}
                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#e6edf3",
                        lineHeight: "1.4",
                        flex: 1,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: post.images.length > 0 ? 3 : 5,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {post.content}
                    </p>

                    {/* Scheduled indicator */}
                    {scheduledDate && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "6px 10px",
                          backgroundColor: "#238636",
                          borderRadius: "6px",
                          fontSize: "11px",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>📅</span>
                        <span>{scheduledDate}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        {posts.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => setActiveTab("list")}
                style={{
                  padding: "12px 24px",
                  backgroundColor: activeTab === "list" ? "#f97316" : "#21262d",
                  color: activeTab === "list" ? "white" : "#8b949e",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>📝</span>
                Drafts
              </button>
              <button
                onClick={() => setActiveTab("calendar")}
                style={{
                  padding: "12px 24px",
                  backgroundColor:
                    activeTab === "calendar" ? "#f97316" : "#21262d",
                  color: activeTab === "calendar" ? "white" : "#8b949e",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>📅</span>
                Schedule Posts
              </button>
            </div>

            {/* Tab Content */}
            <div
              style={{
                backgroundColor: "#161b22",
                borderRadius: "16px",
                border: "1px solid #30363d",
                overflow: "hidden",
              }}
            >
              {/* Drafts Tab */}
              {activeTab === "list" && (
                <div style={{ padding: "24px" }}>
                  <h3
                    style={{
                      margin: "0 0 20px 0",
                      color: "#e6edf3",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                    }}
                  >
                    All Posts ({posts.length})
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          backgroundColor: "#21262d",
                          borderRadius: "12px",
                          border: "1px solid #30363d",
                          padding: "20px",
                          transition: "border-color 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "20px",
                          }}
                        >
                          {/* Left: Content */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  backgroundColor:
                                    post.status.toLowerCase() === "posted"
                                      ? "#238636"
                                      : post.status.toLowerCase() === "draft"
                                      ? "#6e7681"
                                      : post.status.toLowerCase() ===
                                        "scheduled"
                                      ? "#1f6feb"
                                      : "#f97316",
                                  color: "white",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  textTransform: "uppercase",
                                }}
                              >
                                {post.status}
                              </span>
                              <span
                                style={{
                                  color: "#8b949e",
                                  fontSize: "13px",
                                }}
                              >
                                Added: {post.dateAdded}
                              </span>
                              {getScheduledDate(post.id) && (
                                <span
                                  style={{
                                    backgroundColor: "#238636",
                                    color: "white",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                  }}
                                >
                                  📅 Scheduled: {getScheduledDate(post.id)}{" "}
                                  12:00 PM
                                </span>
                              )}
                            </div>

                            {editingPostId === post.id ? (
                              <textarea
                                value={post.content}
                                onChange={(e) =>
                                  handleContentEdit(post.id, e.target.value)
                                }
                                onBlur={() => setEditingPostId(null)}
                                autoFocus
                                style={{
                                  width: "100%",
                                  minHeight: "100px",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  border: "1px solid #f97316",
                                  backgroundColor: "#0d1117",
                                  color: "#e6edf3",
                                  fontSize: "14px",
                                  resize: "vertical",
                                  outline: "none",
                                }}
                              />
                            ) : (
                              <p
                                onClick={() => setEditingPostId(post.id)}
                                style={{
                                  margin: 0,
                                  fontSize: "15px",
                                  color: "#e6edf3",
                                  lineHeight: "1.6",
                                  cursor: "pointer",
                                  padding: "12px",
                                  borderRadius: "8px",
                                  backgroundColor: "#161b22",
                                  border: "1px solid transparent",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.borderColor = "#30363d";
                                  e.target.style.backgroundColor = "#0d1117";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.borderColor = "transparent";
                                  e.target.style.backgroundColor = "#161b22";
                                }}
                                title="Click to edit"
                              >
                                {post.content}
                              </p>
                            )}
                          </div>

                          {/* Right: Images */}
                          {post.images.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                                maxWidth: "280px",
                              }}
                            >
                              {post.images.map((img, imgIndex) => (
                                <div
                                  key={imgIndex}
                                  style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    backgroundColor: "#30363d",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <img
                                    src={img}
                                    alt={`Post image ${imgIndex + 1}`}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = "none";
                                      e.target.parentNode.innerHTML = `<span style="font-size: 24px">🖼️</span>`;
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Posts Tab */}
              {activeTab === "calendar" && (
                <div style={{ padding: "24px" }} ref={calendarRef}>
                  {/* Copy to Clipboard Button */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "24px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        color: "#e6edf3",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                      }}
                    >
                      Drag posts from queue to schedule
                    </h3>
                    <button
                      onClick={copyScheduleToClipboard}
                      disabled={
                        Object.keys(scheduledPosts).length === 0 || copied
                      }
                      style={{
                        padding: "12px 24px",
                        backgroundColor: copied
                          ? "#166534"
                          : Object.keys(scheduledPosts).length > 0
                          ? "#238636"
                          : "#21262d",
                        color: copied
                          ? "white"
                          : Object.keys(scheduledPosts).length > 0
                          ? "white"
                          : "#8b949e",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor:
                          Object.keys(scheduledPosts).length > 0 && !copied
                            ? "pointer"
                            : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.3s ease",
                        minWidth: "220px",
                        justifyContent: "center",
                      }}
                    >
                      {copied ? (
                        <>
                          <span>✓</span>
                          Copied!
                        </>
                      ) : (
                        <>
                          <span>📋</span>
                          Copy Schedule to Clipboard
                          {Object.keys(scheduledPosts).length > 0 && (
                            <span
                              style={{
                                backgroundColor: "rgba(255,255,255,0.2)",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "12px",
                              }}
                            >
                              {Object.keys(scheduledPosts).length}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Calendar Grid */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "40px",
                    }}
                  >
                    {calendarData.map((month, monthIndex) => (
                      <div key={monthIndex}>
                        <h4
                          style={{
                            margin: "0 0 16px 0",
                            color: "#f97316",
                            fontSize: "1.2rem",
                            fontWeight: "700",
                            letterSpacing: "-0.3px",
                          }}
                        >
                          {month.name} {month.year}
                        </h4>

                        {/* Days of Week Header */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                            marginBottom: "8px",
                          }}
                        >
                          {daysOfWeek.map((day) => (
                            <div
                              key={day}
                              style={{
                                textAlign: "center",
                                color: "#8b949e",
                                fontSize: "12px",
                                fontWeight: "600",
                                padding: "8px 0",
                                textTransform: "uppercase",
                              }}
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(7, 1fr)",
                            gap: "4px",
                          }}
                        >
                          {month.days.map((dayData, dayIndex) => {
                            if (!dayData) {
                              return <div key={`empty-${dayIndex}`} />;
                            }

                            const postsForDay = getPostsForDate(dayData.date);
                            const hasScheduledPosts = postsForDay.length > 0;

                            const isHovered = hoveredDate === dayData.date;

                            return (
                              <div
                                key={dayData.date}
                                onDragOver={handleDragOver}
                                onDragEnter={(e) =>
                                  handleDragEnter(e, dayData.date)
                                }
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, dayData.date)}
                                style={{
                                  minHeight: "80px",
                                  backgroundColor: isHovered
                                    ? "#2d1810"
                                    : dayData.isToday
                                    ? "#1c3a5e"
                                    : hasScheduledPosts
                                    ? "#1a2f1a"
                                    : "#21262d",
                                  borderRadius: "8px",
                                  border: isHovered
                                    ? "2px dashed #f97316"
                                    : dayData.isToday
                                    ? "2px solid #1f6feb"
                                    : "1px solid #30363d",
                                  padding: "8px",
                                  transition: "all 0.15s ease",
                                  transform: isHovered
                                    ? "scale(1.02)"
                                    : "scale(1)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: dayData.isToday ? "700" : "500",
                                    color: dayData.isToday
                                      ? "#58a6ff"
                                      : "#8b949e",
                                    marginBottom: "6px",
                                  }}
                                >
                                  {dayData.day}
                                </div>

                                {/* Scheduled posts for this day */}
                                {postsForDay.map((post) => (
                                  <div
                                    key={post.id}
                                    style={{
                                      backgroundColor: "#f97316",
                                      borderRadius: "4px",
                                      padding: "4px 6px",
                                      marginBottom: "4px",
                                      fontSize: "10px",
                                      color: "white",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      cursor: "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: "4px",
                                    }}
                                    title={post.content}
                                  >
                                    <span
                                      style={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {post.content.substring(0, 20)}...
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeFromSchedule(post.id);
                                      }}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        color: "white",
                                        cursor: "pointer",
                                        padding: "0 2px",
                                        fontSize: "12px",
                                        opacity: 0.8,
                                      }}
                                      title="Remove from schedule"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State */}
        {posts.length === 0 && (
          <div
            style={{
              backgroundColor: "#161b22",
              borderRadius: "16px",
              border: "1px solid #30363d",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📱</div>
            <h3
              style={{
                margin: "0 0 12px 0",
                color: "#e6edf3",
                fontSize: "1.5rem",
              }}
            >
              No posts yet
            </h3>
            <p
              style={{
                margin: 0,
                color: "#8b949e",
                fontSize: "15px",
                maxWidth: "400px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Paste content from Google Sheets above to get started. Make sure
              your data has columns for Date Added, Post Content, Image List,
              and Status.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMedia;

