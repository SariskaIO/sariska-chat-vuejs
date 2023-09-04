<template>
  <div class="chat-box">
    <div class="chat-header">
      <button @click="toggleChat" class="toggle-button">
        <i v-if="!showChat" class="fas fa-chevron-up"></i>
        <i v-else class="fas fa-chevron-down"></i>
      </button>
    </div>
    <div class="chat-content" v-show="showChat" id="chatContent">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="message-container"
      >
        <div
          :class="{
            'message-sender': message.isUser,
            'message-receiver': !message.isUser,
          }"
        >
          {{ message.text }}
        </div>
      </div>
    </div>
    <div class="chat-input" v-show="showChat">
      <input
        type="text"
        placeholder="Type a message..."
        class="message-input"
        v-model="messageText"
      />
      <button @click="sendMessage" class="send-button">Send</button>
      <div class="button-space"></div>
    </div>
  </div>
</template>

<script>
import { onBeforeUnmount, ref } from "vue";
import { Socket } from "phoenix";
import { WEB_SOCKET_URL } from "../constants";
import { getToken } from "../utils";

let channel = null; // Define the channel variable outside of setup
let userId = 0; // Hardcoded user id
let hasJoined = false;

export default {
  data() {
    return {
      showChat: false,
      messageText: "", // This property will store the input text
      messages: [],
    };
  },

  setup() {
    const socket = ref(null);

    const setSocket = (val) => {
      socket.value = val;
    };

    const generateRandomID = () => {
      return 1234;
    };

    const fetchData = async () => {
      userId = generateRandomID();
      const token = await getToken(userId.toString());

      const params = { token };
      const s = new Socket(WEB_SOCKET_URL, { params });
      s.onOpen(() => console.log("connection open!"));
      s.onError(() => console.log("there was an error with the connection!"));
      s.onClose(() => console.log("the connection dropped"));
      s.connect();
      setSocket(s);

      // Initialize the channel here
      channel = s.channel(`chat:coachvantagetest`);
    };

    fetchData();

    onBeforeUnmount(() => {
      socket.value && socket.value.disconnect();
    });

    return {
      socket,
    };
  },

  methods: {
    toggleChat() {
      this.showChat = !this.showChat;

      if (!hasJoined) {
        channel
          .join()
          .receive("ok", () => {
            console.log("Channel Joined");
            hasJoined = true;
          })
          .receive("error", () => console.log("Failed to join"))
          .receive("timeout", () =>
            console.log("Networking issue. Still waiting...")
          );
          
        channel.on("archived_message", (message) => {
          // by default last 20 messages will be received if there is any chat history present
          console.log(message);
          if (message.created_by == userId) {
            this.messages.push({ text: message.content, isUser: true });
          } else {
            this.messages.push({ text: message.content, isUser: false });
          }
        });

        channel.on("new_message", (message) => {
          console.log(message);
          // Create a new chat bubble element
          if (message.created_by == userId) {
            this.messages.push({ text: message.content, isUser: true });
          } else {
            this.messages.push({ text: message.content, isUser: false });
          }
        });
      }
    },

    sendMessage() {
      // Implement sending a message
      const message = this.messageText;
      channel
        .push("new_message", { content: message })
        .receive("ok", () => {
          console.log("Message sent");
        })
        .receive("error", () => {
          console.log("Failed to send message");
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
  background-color: #fff;
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
  color: #f0f0f0;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
}

.toggle-button:hover {
  background-color: #f0f0f0;
}

.chat-content {
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.message-container {
  display: flex;
  margin-bottom: 10px;
}

.message-sender {
  background-color: #007bff;
  color: #fff;
  border-radius: 10px;
  padding: 10px;
  max-width: 70%;
  word-wrap: break-word;
  align-self: flex-start;
}

.message-receiver {
  background-color: #f2f2f2;
  color: #333;
  border-radius: 10px;
  padding: 10px;
  max-width: 70%;
  word-wrap: break-word;
  align-self: flex-end; /* Align received messages to the right */
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

.button-space {
  height: 10px; /* Adjust the height for the desired space */
}
</style>
