import { useState, useEffect } from "react";
import axios from "axios";
import uploadFile from "./api/upload.js";
import {
  backendDomain,
  backendSocket,
} from "../configurations/configurations.js";
import ScrollableCard from "../components/ScrollableCard.jsx";
import { v4 as uuidv4 } from 'uuid';
import ReactTyped from "react-typed";


const generateRandomUsername = () => {
  const randomUUID = uuidv4();

  // Filter out non-alphabetic characters
  const username = randomUUID.replace(/[^a-zA-Z]/g, '').substr(0, 8);

  return username;
};

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [mode, setMode] = useState("rest");

  useEffect(() => {
    const client_id = generateRandomUsername()
    setClientId(client_id);
    const newWs = new WebSocket(`${backendSocket}/ws/${client_id}`);
    setWs(newWs);

    newWs.onopen = () => {
      console.log("WebSocket connection opened");
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if ("data" in data || "uri" in data || "updateReaction" in data) {
        if (data.updateReaction) {
          const { index, message } = data;
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[index] = message;
            return updatedMessages;
          });
        } else {
          const timestamp = Date.now();
          setMessages((prevMessages) => [
            ...prevMessages,
            { timestamp, data: event.data, reactions: [] },
          ]);
        }
      }
      else {
        return
      }
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error", error);
    };

    return () => {
      newWs.close();
    };
  }, []);

  async function getMessages() {

    try {
      const response = await axios.post(`${backendDomain}/bot`, {
        question: messageText
      });
      console.log(response.data)

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          timestamp: Date.now(),
          data: JSON.stringify({ data: response.data.message, client_id: response.data.client_id }),
          reactions: [],
        },
      ]);

    } catch (err) {
      console.error(err);
    }
  }

  const sendMessage = (event) => {
    event.preventDefault();
    if (messageText.includes("user")) {
      setMode("user");
    } else if (messageText.includes("rest")) {
      setMode("rest");
    }

    if (mode === "user") {
      ws.send(JSON.stringify({ data: messageText }));
      setMessageText("");
    } else if (mode === "rest") {
      ws.send(JSON.stringify({ data: messageText }));
      getMessages();
    }

    event.preventDefault();
  };

  const [file, setFile] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);
  };

  const [bookmarkedMessages, setBookmarkedMessages] = useState([]);

  const toggleBookmark = (index) => {
    const messageToBookmark = messages[index];
    const isAlreadyBookmarked = bookmarkedMessages.includes(messageToBookmark);

    if (isAlreadyBookmarked) {
      setBookmarkedMessages((prevBookmarks) =>
        prevBookmarks.filter((msg) => msg !== messageToBookmark)
      );
    } else {
      setBookmarkedMessages((prevBookmarks) => [
        ...prevBookmarks,
        messageToBookmark,
      ]);
    }
  };

  const addReaction = (index, reactionType) => {
    const updatedMessages = [...messages];
    const message = updatedMessages[index];

    const existingReactionIndex = message.reactions.findIndex(
      (reaction) =>
        reaction.user === clientId && reaction.type === reactionType
    );

    if (existingReactionIndex !== -1) {
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      message.reactions.push({ user: clientId, type: reactionType });
    }

    // Send the updated message to the WebSocket
    ws.send(JSON.stringify({ updateReaction: true, index, message }));

    setMessages(updatedMessages);
  };

    // Function to format text with bold and italic tags
    const formatText = (text) => {
      // Replace **text** with <b> tags for bold text
      text = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  
      // Replace _text_ with <i> tags for italic text
      text = text.replace(/_(.*?)_/g, "<i>$1</i>");
  
      return text;
    };

  return (
    <>
      <div className="chat_container">
        <div className="content">
          {/* <h1>WebSocket Chat {mode}</h1>
          <h2>Your ID: {clientId}</h2> */}

          <ul style={{ listStyleType: "none", padding: 0 }}>
            {messages.map((message, index) => {
              const parsedMessage = message?.data ? JSON.parse(message.data) : {};
              const isSender = parsedMessage.client_id === clientId;
              const isBookmarked = bookmarkedMessages.includes(message);

              return (
                <li key={message?.timestamp} className={isSender ? "sender" : "others"}>
                  <div style={{ display: "flex" }}>
                    <div className="user_icons">
                      {parsedMessage.client_id === clientId
                        ? "You"
                        : parsedMessage.client_id?.substring(0, 1)}
                    </div>
                    <div style={{ flex: 1, marginLeft: "0.5rem" }} className={isSender ? "sender_messages" : "others_messages"}>
                      <div style={{ whiteSpace: "pre-line" }}>
                        {Object.keys(parsedMessage).map((key, i) => (
                          <div key={i}>
                            {key === "uri" ? (
                              <>
                                <ul>
                                  <ul
                                    className={
                                      isSender
                                        ? "sender_user_card"
                                        : "others_user_card"
                                    }
                                  >
                                    <li class="user_icons">
                                      {parsedMessage.client_id === clientId
                                        ? "You"
                                        : parsedMessage.client_id?.substring(0, 1)}
                                    </li>

                                    <img src={parsedMessage.uri} alt="" />

                                  </ul>
                                </ul>
                              </>
                            ) : (
                              <p>
                                {key === "data" && (
                                  <>
                                    <ul
                                      className={
                                        isSender
                                          ? "sender_user_card"
                                          : "others_user_card"
                                      }
                                    >
                                     
                                      <li>
                                      <ReactTyped
                    strings={[formatText(parsedMessage.data)]}
                    typeSpeed={10}
                  >
                    <p
                      className="leading-relaxed text-base text-gray-900"
                      style={{ whiteSpace: "pre-line" }}
                      dangerouslySetInnerHTML={{
                        __html: formatText(parsedMessage.data),
                      }}
                    ></p>
                  </ReactTyped>
                                      </li>
                                    </ul>
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        ))}
                        <div className="message_addons">
                          <button onClick={() => toggleBookmark(index)}>
                            {isBookmarked ? "Unbookmark" : "Bookmark"}
                          </button>
                          <div>
                            Reactions:
                            {message?.reactions.map(
                              (reaction, reactionIndex) => (
                                <span key={reactionIndex}>
                                  {reaction.user === clientId
                                    ? "You"
                                    : `User: ${reaction.user}`} reacted with: {reaction.type}
                                  {reactionIndex <
                                    message.reactions.length - 1 && ", "}
                                </span>
                              )
                            )}
                            <button onClick={() => addReaction(index, "thumbsUp")}>👍</button>
                            <button onClick={() => addReaction(index, "thumbsDown")}>👎</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

              );
            })}
          </ul>
          <ScrollableCard />
          <div className="form">
            <form onSubmit={sendMessage} className="input_form">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                autoComplete="off"
                className="input_box_text"
              />

              <button className="send">

                <div className="send_buttom">Send</div>

              </button>
            </form>
            <div className="upload_form">
              <div>
                <input type="file" onChange={handleFileChange} />
                <button onClick={(e) => uploadFile(e, file, ws, clientId)}>
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
