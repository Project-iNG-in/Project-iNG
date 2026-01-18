import { TodoApp } from '../todos';

describe('TodoApp', () => {
  let container: HTMLDivElement;
  let todoApp: TodoApp;

  beforeEach(() => {
    // Clear DOM
    document.body.innerHTML = '';
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Create TodoApp instance for each test
    todoApp = new TodoApp(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    it('should create a TodoApp instance', () => {
      todoApp = new TodoApp(container);
      expect(todoApp).toBeInstanceOf(TodoApp);
    });

    it('should render the app with header', () => {
      todoApp = new TodoApp(container);
      const header = container.querySelector('.todo-header');
      expect(header).toBeInTheDocument();
      expect(header?.querySelector('h1')).toHaveTextContent('My Tasks');
    });

    it('should render input container', () => {
      todoApp = new TodoApp(container);
      const inputContainer = container.querySelector('.todo-input-container');
      expect(inputContainer).toBeInTheDocument();
      expect(inputContainer?.querySelector('.todo-input')).toBeInTheDocument();
      expect(inputContainer?.querySelector('.add-todo-btn')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      todoApp = new TodoApp(container);
      const filterBtns = container.querySelectorAll('.filter-btn');
      expect(filterBtns).toHaveLength(3);
      expect(filterBtns[0]).toHaveTextContent('All');
      expect(filterBtns[1]).toHaveTextContent('Active');
      expect(filterBtns[2]).toHaveTextContent('Completed');
    });

    it('should render stats section', () => {
      todoApp = new TodoApp(container);
      const stats = container.querySelectorAll('.stat');
      expect(stats).toHaveLength(3);
    });

    it('should load todos from localStorage', () => {
      const mockTodos = [
        { id: 1, title: 'Test todo', completed: false, createdAt: '2024-01-18T00:00:00.000Z' },
      ];
      (global.localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockTodos));

      todoApp = new TodoApp(container);
      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
    });

    it('should show empty state when no todos', () => {
      todoApp = new TodoApp(container);
      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveTextContent('No tasks yet. Add one to get started!');
    });
  });

  describe('Adding Todos', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
    });

    it('should add a new todo', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'New task';
      addBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('New task');
    });

    it('should clear input after adding todo', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'New task';
      addBtn.click();

      expect(input.value).toBe('');
    });

    it('should not add empty todo', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = '   ';
      addBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(0);
    });

    it('should add todo on Enter key', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;

      input.value = 'New task';
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      input.dispatchEvent(event);

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
    });

    it('should not add todo on other keys', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;

      input.value = 'New task';
      const event = new KeyboardEvent('keypress', { key: 'a' });
      input.dispatchEvent(event);

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(0);
    });

    it('should save todos to localStorage', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'New task';
      addBtn.click();

      expect(global.localStorage.setItem).toHaveBeenCalled();
    });

    it('should update stats after adding todo', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'New task';
      addBtn.click();

      const stats = container.querySelectorAll('.stat-number');
      expect(stats[0]).toHaveTextContent('1');
    });

    it('should add multiple todos', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Task 1';
      addBtn.click();

      input.value = 'Task 2';
      addBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(2);
    });
  });

  describe('Toggling Todos', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Test task';
      addBtn.click();
    });

    it('should toggle todo completion status', () => {
      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);

      checkbox.click();

      const todoItem = container.querySelector('.todo-item');
      expect(todoItem).toHaveClass('completed');
      expect(checkbox.checked).toBe(true);
    });

    it('should update stats when toggling todo', () => {
      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();

      const stats = container.querySelectorAll('.stat-number');
      expect(stats[1]).toHaveTextContent('0'); // Active
      expect(stats[2]).toHaveTextContent('1'); // Completed
    });

    it('should apply completed class to todo item', () => {
      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      const todoItem = container.querySelector('.todo-item');

      expect(todoItem).not.toHaveClass('completed');

      checkbox.click();

      expect(todoItem).toHaveClass('completed');
    });
  });

  describe('Deleting Todos', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Task to delete';
      addBtn.click();
    });

    it('should delete a todo', () => {
      const deleteBtn = container.querySelector('.delete-btn') as HTMLButtonElement;
      deleteBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(0);
    });

    it('should show empty state after deleting all todos', () => {
      const deleteBtn = container.querySelector('.delete-btn') as HTMLButtonElement;
      deleteBtn.click();

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeInTheDocument();
    });

    it('should save to localStorage after deletion', () => {
      (global.localStorage.setItem as jest.Mock).mockClear();

      const deleteBtn = container.querySelector('.delete-btn') as HTMLButtonElement;
      deleteBtn.click();

      expect(global.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Filtering Todos', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Active task';
      addBtn.click();

      input.value = 'Completed task';
      addBtn.click();

      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();
    });

    it('should filter by all todos', () => {
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[0].click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(2);
    });

    it('should filter by active todos', () => {
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[1].click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('Active task');
    });

    it('should filter by completed todos', () => {
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[2].click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('Completed task');
    });

    it('should mark active filter button', () => {
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[1].click();

      expect(filterBtns[0]).not.toHaveClass('active');
      expect(filterBtns[1]).toHaveClass('active');
      expect(filterBtns[2]).not.toHaveClass('active');
    });

    it('should show empty state for filter with no todos', () => {
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[2].click(); // Completed filter
      filterBtns[2].click(); // Switch to completed

      // Delete the completed todo
      const deleteBtn = container.querySelector('.delete-btn') as HTMLButtonElement;
      deleteBtn.click();

      const emptyState = container.querySelector('.empty-state');
      expect(emptyState).toBeInTheDocument();
    });
  });

  describe('Clear Completed', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Task 1';
      addBtn.click();

      input.value = 'Task 2';
      addBtn.click();

      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();
    });

    it('should show clear completed button when there are completed todos', () => {
      const clearBtn = container.querySelector('.clear-completed-btn');
      expect(clearBtn).toBeInTheDocument();
    });

    it('should clear all completed todos', () => {
      global.confirm = jest.fn(() => true);

      const clearBtn = container.querySelector('.clear-completed-btn') as HTMLButtonElement;
      clearBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(1);
      expect(todoItems[0]).toHaveTextContent('Task 2');
    });

    it('should not clear if user cancels confirmation', () => {
      global.confirm = jest.fn(() => false);

      const clearBtn = container.querySelector('.clear-completed-btn') as HTMLButtonElement;
      clearBtn.click();

      const todoItems = container.querySelectorAll('.todo-item');
      expect(todoItems).toHaveLength(2);
    });

    it('should hide clear button if no completed todos', () => {
      global.confirm = jest.fn(() => true);

      const clearBtn = container.querySelector('.clear-completed-btn') as HTMLButtonElement;
      clearBtn.click();

      // Re-render by using a filter
      const filterBtns = container.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
      filterBtns[0].click();

      const newClearBtn = container.querySelector('.clear-completed-btn');
      expect(newClearBtn).not.toBeInTheDocument();
    });
  });

  describe('Edit Todo', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Original task';
      addBtn.click();
    });

    it('should edit a todo', () => {
      global.prompt = jest.fn(() => 'Updated task');

      const editBtn = container.querySelector('.edit-btn') as HTMLButtonElement;
      editBtn.click();

      const todoText = container.querySelector('.todo-text');
      expect(todoText).toHaveTextContent('Updated task');
    });

    it('should not update if prompt is cancelled', () => {
      global.prompt = jest.fn(() => null);

      const editBtn = container.querySelector('.edit-btn') as HTMLButtonElement;
      editBtn.click();

      const todoText = container.querySelector('.todo-text');
      expect(todoText).toHaveTextContent('Original task');
    });

    it('should not update if empty string is provided', () => {
      global.prompt = jest.fn(() => '   ');

      const editBtn = container.querySelector('.edit-btn') as HTMLButtonElement;
      editBtn.click();

      const todoText = container.querySelector('.todo-text');
      expect(todoText).toHaveTextContent('Original task');
    });

    it('should save changes to localStorage', () => {
      global.prompt = jest.fn(() => 'Updated task');
      (global.localStorage.setItem as jest.Mock).mockClear();

      const editBtn = container.querySelector('.edit-btn') as HTMLButtonElement;
      editBtn.click();

      expect(global.localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Stats Display', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
    });

    it('should display initial stats as 0', () => {
      const stats = container.querySelectorAll('.stat-number');
      expect(stats[0]).toHaveTextContent('0'); // Total
      expect(stats[1]).toHaveTextContent('0'); // Active
      expect(stats[2]).toHaveTextContent('0'); // Completed
    });

    it('should update total todos count', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Task 1';
      addBtn.click();

      const stats = container.querySelectorAll('.stat-number');
      expect(stats[0]).toHaveTextContent('1');
    });

    it('should update active count when todo is completed', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Task 1';
      addBtn.click();

      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();

      const stats = container.querySelectorAll('.stat-number');
      expect(stats[1]).toHaveTextContent('0'); // Active
      expect(stats[2]).toHaveTextContent('1'); // Completed
    });
  });

  describe('HTML Escaping', () => {
    beforeEach(() => {
      todoApp = new TodoApp(container);
    });

    it('should escape HTML in todo title', () => {
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = '<script>alert("xss")</script>';
      addBtn.click();

      const todoText = container.querySelector('.todo-text');
      expect(todoText?.innerHTML).not.toContain('<script>');
      expect(todoText?.textContent).toContain('<script>alert');
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for empty state', () => {
      todoApp = new TodoApp(container);
      expect(container.innerHTML).toMatchSnapshot();
    });

    it('should match snapshot with todos', () => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Test task 1';
      addBtn.click();

      input.value = 'Test task 2';
      addBtn.click();

      expect(container.innerHTML).toMatchSnapshot();
    });

    it('should match snapshot with completed todo', () => {
      todoApp = new TodoApp(container);
      const input = container.querySelector('.todo-input') as HTMLInputElement;
      const addBtn = container.querySelector('.add-todo-btn') as HTMLButtonElement;

      input.value = 'Test task';
      addBtn.click();

      const checkbox = container.querySelector('.todo-checkbox') as HTMLInputElement;
      checkbox.click();

      expect(container.innerHTML).toMatchSnapshot();
    });
  });
});
