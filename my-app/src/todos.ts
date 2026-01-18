interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class TodoApp {
  private todos: Todo[] = [];
  private nextId: number = 1;
  private filter: 'all' | 'active' | 'completed' = 'all';
  private appElement: HTMLElement;
  private inputElement: HTMLInputElement | null = null;

  constructor(appElement: HTMLElement) {
    this.appElement = appElement;
    this.loadTodos();
    this.render();
    this.setupEventListeners();
  }

  private loadTodos(): void {
    const stored = localStorage.getItem('todos');
    if (stored) {
      try {
        this.todos = JSON.parse(stored, (key, value) => {
          if (key === 'createdAt') {
            return new Date(value);
          }
          return value;
        });
        this.nextId =
          this.todos.length > 0 ? Math.max(...this.todos.map((t) => t.id)) + 1 : 1;
      } catch {
        this.todos = [];
      }
    }
  }

  private saveTodos(): void {
    localStorage.setItem('todos', JSON.stringify(this.todos));
    this.render();
  }

  private setupEventListeners(): void {
    setTimeout(() => {
      this.inputElement = document.querySelector('.todo-input') as HTMLInputElement;
      const addButton = document.querySelector('.add-todo-btn') as HTMLButtonElement;
      const filterButtons = document.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;

      addButton?.addEventListener('click', () => this.addTodo());
      this.inputElement?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.addTodo();
        }
      });

      filterButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          const filterValue = target.getAttribute('data-filter') as 'all' | 'active' | 'completed';
          this.setFilter(filterValue);
        });
      });

      // Setup individual todo event listeners
      document.querySelectorAll('.todo-item').forEach((item) => {
        const checkbox = item.querySelector('.todo-checkbox') as HTMLInputElement;
        const deleteBtn = item.querySelector('.delete-btn') as HTMLButtonElement;
        const editBtn = item.querySelector('.edit-btn') as HTMLButtonElement;
        const id = parseInt(item.getAttribute('data-id') || '0');

        checkbox?.addEventListener('change', () => this.toggleTodo(id));
        deleteBtn?.addEventListener('click', () => this.deleteTodo(id));
        editBtn?.addEventListener('click', () => this.editTodo(id));
      });

      // Clear completed button
      document.querySelector('.clear-completed-btn')?.addEventListener('click', () => {
        this.clearCompleted();
      });
    }, 0);
  }

  private addTodo(): void {
    if (!this.inputElement) return;

    const title = this.inputElement.value.trim();
    if (title === '') {
      this.inputElement.focus();
      return;
    }

    this.todos.push({
      id: this.nextId++,
      title,
      completed: false,
      createdAt: new Date(),
    });

    this.inputElement.value = '';
    this.saveTodos();
    this.inputElement.focus();
  }

  private toggleTodo(id: number): void {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
    }
  }

  private deleteTodo(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.saveTodos();
  }

  private editTodo(id: number): void {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    const newTitle = prompt('Edit todo:', todo.title);
    if (newTitle !== null && newTitle.trim() !== '') {
      todo.title = newTitle.trim();
      this.saveTodos();
    }
  }

  private clearCompleted(): void {
    if (confirm('Are you sure you want to delete all completed todos?')) {
      this.todos = this.todos.filter((t) => !t.completed);
      this.saveTodos();
    }
  }

  private setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.filter = filter;
    this.render();
  }

  private getFilteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active':
        return this.todos.filter((t) => !t.completed);
      case 'completed':
        return this.todos.filter((t) => t.completed);
      default:
        return this.todos;
    }
  }

  private render(): void {
    const filteredTodos = this.getFilteredTodos();
    const completedCount = this.todos.filter((t) => t.completed).length;
    const activeCount = this.todos.length - completedCount;

    this.appElement.innerHTML = `
      <div class="todo-container">
        <div class="todo-header">
          <h1>My Tasks</h1>
          <p class="todo-subtitle">Stay productive and organized</p>
        </div>

        <div class="todo-input-container">
          <input
            type="text"
            class="todo-input"
            placeholder="Add a new task..."
            autocomplete="off"
          />
          <button class="add-todo-btn" aria-label="Add todo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div class="filter-container">
          <button class="filter-btn active" data-filter="all">All (${this.todos.length})</button>
          <button class="filter-btn" data-filter="active">Active (${activeCount})</button>
          <button class="filter-btn" data-filter="completed">Completed (${completedCount})</button>
        </div>

        <div class="todos-list">
          ${
            filteredTodos.length === 0
              ? `<div class="empty-state">
                   <div class="empty-icon">📝</div>
                   <p>${this.getEmptyMessage()}</p>
                 </div>`
              : filteredTodos
                  .map(
                    (todo) => `
                    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} />
                      <span class="todo-text">${this.escapeHtml(todo.title)}</span>
                      <div class="todo-actions">
                        <button class="edit-btn" aria-label="Edit todo">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button class="delete-btn" aria-label="Delete todo">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  `
                  )
                  .join('')
          }
        </div>

        ${
          completedCount > 0
            ? `
              <div class="todo-footer">
                <button class="clear-completed-btn">Clear ${completedCount} completed ${completedCount === 1 ? 'task' : 'tasks'}</button>
              </div>
            `
            : ''
        }

        <div class="todo-stats">
          <div class="stat">
            <div class="stat-number">${this.todos.length}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat">
            <div class="stat-number">${activeCount}</div>
            <div class="stat-label">To Do</div>
          </div>
          <div class="stat">
            <div class="stat-number">${completedCount}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private getEmptyMessage(): string {
    switch (this.filter) {
      case 'active':
        return "You're all caught up! No active tasks.";
      case 'completed':
        return "No completed tasks yet. Keep working!";
      default:
        return "No tasks yet. Add one to get started!";
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
