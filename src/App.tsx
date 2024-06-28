import "./App.css"
import Calendar from "./components/Calendar"
import { useState } from "react"

const CheckedList = () => {
  const [items, setItems] = useState([
    { text: "Dates Selection functionality.", checked: true },
    {
      text: "Disable “Non-Current Month” day.",
      checked: true,
    },
    { text: "Show current month.", checked: true },
    { text: "Click to select previous/next month.", checked: true },
    { text: "Bonus: Display weeks", checked: true },
    { text: "Bonus: Unit test", checked: true },
    { text: "Bonus: Click outside of Calendar will cancel selection", checked: false },
  ])

  const toggleChecked = (index:number) => {
    const newItems = [...items]
    newItems[index].checked = !newItems[index].checked
    setItems(newItems)
  }

  return (
    <div className="note">
      <h3>Checked List</h3>
      <ul className="checked-list">
        {items.map((item, index) => (
          <li
            key={index}
            className={`checked-item ${item.checked ? "" : "unchecked"}`}
            onClick={() => toggleChecked(index)}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  return (
    <main>
      <CheckedList />
      <Calendar />

    </main>
  )
}

export default App
