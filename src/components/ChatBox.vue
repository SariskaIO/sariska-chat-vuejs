<template>
  <div class="chat-box">
    <div class="chat-header">
      <button @click="toggleChat" class="toggle-button">
        <i v-if="!showChat" class="fas fa-chevron-up"></i>
        <i v-else class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="chat-content" v-show="showChat" id="chatContent">
      <!-- Chat messages go here -->
    </div>
    <div class="chat-input" v-show="showChat">
      <input
        type="text"
        placeholder="Type a message..."
        class="message-input"
        v-model="messageText"
      />
      <button @click="sendMessage" class="send-button">Send</button>
    </div>
  </div>
</template>


<script>
import { onBeforeUnmount, ref } from "vue";
import { Socket } from "phoenix";
import { WEB_SOCKET_URL } from "../constants";
import { getToken } from "../utils";

let channel = null; // Define the channel variable outside of setup

export default {
  setup() {
    const socket = ref(null);

    const setSocket = (val) => {
      socket.value = val;
    };

    const fetchData = async () => {
      const token = await getToken();
      const params = { token };
      const s = new Socket(WEB_SOCKET_URL, { params });
      s.onOpen(() => console.log("connection open!"));
      s.onError(() => console.log("there was an error with the connection!"));
      s.onClose(() => console.log("the connection dropped"));
      s.connect();
      setSocket(s);

      // Initialize the channel here
      channel = s.channel(`chat:roamroam`);
      channel
        .join()
        .receive("ok", () => console.log("Channel Joined"))
        .receive("error", () => console.log("Failed to join"))
        .receive("timeout", () =>
          console.log("Networking issue. Still waiting...")
        );

      channel.on("new_message", (message) => {
        console.log("Bhai message aya hai " + message.content);
        // Create a new chat bubble element
        const messageBubble = document.createElement("div");
        messageBubble.classList.add("message-bubble");

        // Customize the message bubble HTML structure and styling as needed
        messageBubble.innerHTML = `<div class="message-content">${message.content}</div>`;

        // Append the chat bubble to the chat content area
        const chatContent = document.getElementById("chatContent");
        chatContent.appendChild(messageBubble);

        // Scroll to the bottom of the chat content to display the new message
        chatContent.scrollTop = chatContent.scrollHeight;
      });
    };

    fetchData();

    onBeforeUnmount(() => {
      socket.value && socket.value.disconnect();
    });

    return {
      socket,
    };
  },

  data() {
    return {
      showChat: false,
      messageText: "", // This property will store the input text
    };
  },

  methods: {
    toggleChat() {
      this.showChat = !this.showChat;
    },

    sendMessage() {
      // Implement sending a message
      const message = this.messageText;
      console.log(message);
      channel
        .push("new_message", { content: message })
        .receive("ok", () => {
          console.log("Message sent");
          // You can add additional logic here when the message is successfully sent
        })
        .receive("error", () => {
          console.log("Failed to send message");
          // You can add error handling logic here if the message fails to send
        });

      this.messageText = "";
    },
  },
};
</script>

<style scoped>
/* Add your chat box styling here */
.chat-box {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-header {
  background-color: #007bff;
  color: #fff;
  padding: 10px;
  text-align: center;
}

.toggle-button {
  background-color: #0056b3;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
}

.toggle-button:hover {
  background-color: #004999;
}

.chat-content {
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.message-input {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-right: 10px;
}

.send-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
}

.send-button:hover {
  background-color: #0056b3;
}
</style>
