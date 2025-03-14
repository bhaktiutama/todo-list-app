package api

import (
	"encoding/json"
	"log"
	"os"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/majoo/todo-list-app/models"
)

// WebSocketEvent represents a WebSocket event
type WebSocketEvent struct {
	Type      string      `json:"type"`
	TodoList  *models.TodoList `json:"todo_list,omitempty"`
	UpdatedBy string      `json:"updated_by,omitempty"`
}

// Client represents a WebSocket client
type Client struct {
	ID         string
	Connection *websocket.Conn
	TodoListID string
}

// WebSocketManager manages WebSocket connections
type WebSocketManager struct {
	clients      map[string]*Client
	clientsMutex sync.RWMutex
	todoClients  map[string]map[string]*Client
	todoMutex    sync.RWMutex
	enabled      bool
}

var (
	// Manager is the global WebSocket manager
	Manager = NewWebSocketManager()
)

// NewWebSocketManager creates a new WebSocket manager
func NewWebSocketManager() *WebSocketManager {
	enabled := os.Getenv("ENABLE_WEBSOCKET") != "false"
	return &WebSocketManager{
		clients:     make(map[string]*Client),
		todoClients: make(map[string]map[string]*Client),
		enabled:     enabled,
	}
}

// Start initializes the WebSocket manager
func (m *WebSocketManager) Start() {
	if !m.enabled {
		log.Println("WebSocket manager disabled")
		return
	}
	log.Println("WebSocket manager started")
}

// AddClient adds a client to the manager
func (m *WebSocketManager) AddClient(client *Client) {
	if !m.enabled {
		return
	}
	// Add to clients map
	m.clientsMutex.Lock()
	m.clients[client.ID] = client
	m.clientsMutex.Unlock()

	// Add to todo clients map
	m.todoMutex.Lock()
	if _, exists := m.todoClients[client.TodoListID]; !exists {
		m.todoClients[client.TodoListID] = make(map[string]*Client)
	}
	m.todoClients[client.TodoListID][client.ID] = client
	m.todoMutex.Unlock()
}

// RemoveClient removes a client from the manager
func (m *WebSocketManager) RemoveClient(clientID string) {
	if !m.enabled {
		return
	}
	m.clientsMutex.RLock()
	client, exists := m.clients[clientID]
	m.clientsMutex.RUnlock()

	if !exists {
		return
	}

	// Remove from todo clients map
	m.todoMutex.Lock()
	if todoClients, exists := m.todoClients[client.TodoListID]; exists {
		delete(todoClients, clientID)
		// If no more clients for this todo list, remove the todoList key
		if len(todoClients) == 0 {
			delete(m.todoClients, client.TodoListID)
		}
	}
	m.todoMutex.Unlock()

	// Remove from clients map
	m.clientsMutex.Lock()
	delete(m.clients, clientID)
	m.clientsMutex.Unlock()
}

// BroadcastToTodoList broadcasts a message to all clients of a todo list
func (m *WebSocketManager) BroadcastToTodoList(todoListID string, updatedBy string, todoList *models.TodoList) {
	if !m.enabled {
		return
	}
	event := WebSocketEvent{
		Type:      "update",
		TodoList:  todoList,
		UpdatedBy: updatedBy,
	}

	data, err := json.Marshal(event)
	if err != nil {
		log.Println("Error marshaling WebSocket event:", err)
		return
	}

	m.todoMutex.RLock()
	clients, exists := m.todoClients[todoListID]
	m.todoMutex.RUnlock()

	if !exists {
		return
	}

	for _, client := range clients {
		// Don't send to the client that updated it
		if client.ID == updatedBy {
			continue
		}

		if err := client.Connection.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Println("Error broadcasting to client:", err)
			// We'll handle the client disconnection elsewhere
		}
	}
}

// WebSocketHandler handles WebSocket connections
func WebSocketHandler(c *websocket.Conn) {
	if !Manager.enabled {
		log.Println("WebSocket connection rejected: WebSocket is disabled")
		return
	}

	// Get the todo list ID from the URL parameter
	todoListID := c.Params("id")
	if todoListID == "" {
		log.Println("Missing todo list ID for WebSocket connection")
		return
	}

	// Generate a client ID
	clientID := c.Query("client_id")
	if clientID == "" {
		log.Println("Missing client ID for WebSocket connection")
		return
	}

	// Create a new client
	client := &Client{
		ID:         clientID,
		Connection: c,
		TodoListID: todoListID,
	}

	// Add the client to the manager
	Manager.AddClient(client)
	defer Manager.RemoveClient(client.ID)

	// Welcome message
	welcomeEvent := WebSocketEvent{
		Type: "connected",
	}
	welcomeData, _ := json.Marshal(welcomeEvent)
	if err := c.WriteMessage(websocket.TextMessage, welcomeData); err != nil {
		log.Println("Error sending welcome message:", err)
		return
	}

	// Listen for messages from the client
	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			log.Println("Error reading message from WebSocket:", err)
			break
		}

		// We don't need to handle incoming messages for now as we're just broadcasting changes
		// But if we need to handle client messages in the future, we can add that here
	}
}

// WebSocketUpgrade is middleware that upgrades the connection to WebSocket
func WebSocketUpgrade() fiber.Handler {
	if !Manager.enabled {
		return func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
				"error": "WebSocket is disabled",
			})
		}
	}
	return websocket.New(WebSocketHandler, websocket.Config{
		EnableCompression: true,
	})
} 