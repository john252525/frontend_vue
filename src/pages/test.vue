<template>
  <div class="message-tester">
    <h1>Message Tester</h1>

    <div class="form-group">
      <label for="from">From:</label>
      <input
        type="text"
        id="from"
        v-model="messageData.from"
        placeholder="Sender's Number"
      />
    </div>

    <div class="form-group">
      <label for="to">To:</label>
      <input
        type="text"
        id="to"
        v-model="messageData.to"
        placeholder="Recipient's Number"
      />
    </div>

    <div class="form-group">
      <label for="time">Time:</label>
      <input
        type="number"
        id="time"
        v-model="messageData.time"
        placeholder="Timestamp (e.g., 1678886400000)"
      />
    </div>

    <div class="form-group">
      <label for="text">Text:</label>
      <input
        type="text"
        id="text"
        v-model="messageData.text"
        placeholder="Message Text"
      />
    </div>

    <div class="form-group">
      <label for="thread">Thread:</label>
      <input
        type="text"
        id="thread"
        v-model="messageData.thread"
        placeholder="Thread ID"
      />
    </div>

    <div class="form-group">
      <label for="item">Item:</label>
      <input
        type="text"
        id="item"
        v-model="messageData.item"
        placeholder="Unique Message ID"
      />
    </div>

    <div class="form-group">
      <label for="outgoing">Outgoing:</label>
      <select id="outgoing" v-model="messageData.outgoing">
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    </div>

    <div class="form-group">
      <label for="replyTo">Reply To:</label>
      <input
        type="text"
        id="replyTo"
        v-model="messageData.replyTo"
        placeholder="ID of Replied Message (Optional)"
      />
    </div>

    <div class="form-group">
      <label for="content">Content (JSON):</label>
      <textarea
        id="content"
        v-model="messageData.content"
        placeholder="Content as JSON Array (e.g., [{ type: 'text', text: 'Hello' }])"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="hook_type">Hook Type:</label>
      <input
        type="text"
        id="hook_type"
        v-model="messageData.hook_type"
        placeholder="Hook Type (e.g., message)"
      />
    </div>

    <button @click="sendMessage">Send Message</button>

    <div v-if="response">
      <h2>Response:</h2>
      <pre>{{ response }}</pre>
    </div>

    <div v-if="error">
      <p class="error">Error: {{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const messageData = ref({
  from: "",
  to: "",
  time: null,
  text: "",
  thread: "",
  item: "",
  outgoing: "false",
  replyTo: "",
  content: "[]",
  hook_type: "",
});

const response = ref(null);
const error = ref(null);

const sendMessage = async () => {
  try {
    // Validate time

    // Validate JSON
    try {
      JSON.parse(messageData.value.content);
    } catch (e) {
      error.value = "Invalid JSON format for content.";
      return;
    }
    const parsedContent = JSON.parse(messageData.value.content);

    const payload = {
      from: messageData.value.from,
      to: "79198670001",
      time: "1742925093000000",
      thread: "79198670001@c.us",
      item: "3EB093adsBsFEDd2sads1ss55Bs6sв57sfdsdEFsAA",
      text: "eesse",
      outgoing: false,
      replyTo: messageData.value.replyTo || null,
      content: [{ type: "has_seen", src: "" }],
      hook_type: "message",
    };

    response.value = null;
    error.value = null;

    const res = await axios.post("http://localhost:4000/api/webhook", payload); // Replace with your API endpoint
    response.value = JSON.stringify(res.data, null, 2);
  } catch (e) {
    error.value = e.message || "An error occurred";
    response.value = null;
  }
};
</script>

<style scoped>
.message-tester {
  font-family: sans-serif;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

textarea {
  height: 100px;
  font-family: monospace; /* Improves readability for JSON */
}

select {
  appearance: none; /* Remove default arrow in some browsers */
  background-image: url("data:image/svg+xml,%3Csvg fill='none' stroke='%23999' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  padding-right: 30px;
}

button {
  padding: 12px 20px;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #45a049;
}

.error {
  color: red;
  margin-top: 10px;
}

pre {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto; /* Enable horizontal scrolling for long responses */
  white-space: pre-wrap; /* Keeps formatting, wraps text */
  font-family: monospace;
}
</style>
