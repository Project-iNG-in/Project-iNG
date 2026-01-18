(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const i of e)if(i.type==="childList")for(const d of i.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function o(e){const i={};return e.integrity&&(i.integrity=e.integrity),e.referrerPolicy&&(i.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?i.credentials="include":e.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(e){if(e.ep)return;e.ep=!0;const i=o(e);fetch(e.href,i)}})();class r{todos=[];nextId=1;filter="all";appElement;inputElement=null;constructor(t){this.appElement=t,this.loadTodos(),this.render(),this.setupEventListeners()}loadTodos(){const t=localStorage.getItem("todos");if(t)try{this.todos=JSON.parse(t,(o,s)=>o==="createdAt"?new Date(s):s),this.nextId=this.todos.length>0?Math.max(...this.todos.map(o=>o.id))+1:1}catch{this.todos=[]}}saveTodos(){localStorage.setItem("todos",JSON.stringify(this.todos)),this.render()}setupEventListeners(){setTimeout(()=>{this.inputElement=document.querySelector(".todo-input");const t=document.querySelector(".add-todo-btn"),o=document.querySelectorAll(".filter-btn");t?.addEventListener("click",()=>this.addTodo()),this.inputElement?.addEventListener("keypress",s=>{s.key==="Enter"&&this.addTodo()}),o.forEach(s=>{s.addEventListener("click",e=>{const d=e.target.getAttribute("data-filter");this.setFilter(d)})}),document.querySelectorAll(".todo-item").forEach(s=>{const e=s.querySelector(".todo-checkbox"),i=s.querySelector(".delete-btn"),d=s.querySelector(".edit-btn"),l=parseInt(s.getAttribute("data-id")||"0");e?.addEventListener("change",()=>this.toggleTodo(l)),i?.addEventListener("click",()=>this.deleteTodo(l)),d?.addEventListener("click",()=>this.editTodo(l))}),document.querySelector(".clear-completed-btn")?.addEventListener("click",()=>{this.clearCompleted()})},0)}addTodo(){if(!this.inputElement)return;const t=this.inputElement.value.trim();if(t===""){this.inputElement.focus();return}this.todos.push({id:this.nextId++,title:t,completed:!1,createdAt:new Date}),this.inputElement.value="",this.saveTodos(),this.inputElement.focus()}toggleTodo(t){const o=this.todos.find(s=>s.id===t);o&&(o.completed=!o.completed,this.saveTodos())}deleteTodo(t){this.todos=this.todos.filter(o=>o.id!==t),this.saveTodos()}editTodo(t){const o=this.todos.find(e=>e.id===t);if(!o)return;const s=prompt("Edit todo:",o.title);s!==null&&s.trim()!==""&&(o.title=s.trim(),this.saveTodos())}clearCompleted(){confirm("Are you sure you want to delete all completed todos?")&&(this.todos=this.todos.filter(t=>!t.completed),this.saveTodos())}setFilter(t){this.filter=t,this.render()}getFilteredTodos(){switch(this.filter){case"active":return this.todos.filter(t=>!t.completed);case"completed":return this.todos.filter(t=>t.completed);default:return this.todos}}render(){const t=this.getFilteredTodos(),o=this.todos.filter(e=>e.completed).length,s=this.todos.length-o;this.appElement.innerHTML=`
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
          <button class="filter-btn" data-filter="active">Active (${s})</button>
          <button class="filter-btn" data-filter="completed">Completed (${o})</button>
        </div>

        <div class="todos-list">
          ${t.length===0?`<div class="empty-state">
                   <div class="empty-icon">📝</div>
                   <p>${this.getEmptyMessage()}</p>
                 </div>`:t.map(e=>`
                    <div class="todo-item ${e.completed?"completed":""}" data-id="${e.id}">
                      <input type="checkbox" class="todo-checkbox" ${e.completed?"checked":""} />
                      <span class="todo-text">${this.escapeHtml(e.title)}</span>
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
                  `).join("")}
        </div>

        ${o>0?`
              <div class="todo-footer">
                <button class="clear-completed-btn">Clear ${o} completed ${o===1?"task":"tasks"}</button>
              </div>
            `:""}

        <div class="todo-stats">
          <div class="stat">
            <div class="stat-number">${this.todos.length}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
          <div class="stat">
            <div class="stat-number">${s}</div>
            <div class="stat-label">To Do</div>
          </div>
          <div class="stat">
            <div class="stat-number">${o}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>
    `,this.setupEventListeners()}getEmptyMessage(){switch(this.filter){case"active":return"You're all caught up! No active tasks.";case"completed":return"No completed tasks yet. Keep working!";default:return"No tasks yet. Add one to get started!"}}escapeHtml(t){const o=document.createElement("div");return o.textContent=t,o.innerHTML}}const a=document.querySelector("#app");new r(a);
