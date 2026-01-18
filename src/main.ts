import './style.css'
import { TodoApp } from './todos.ts'

const appElement = document.querySelector<HTMLDivElement>('#app')!
new TodoApp(appElement)
