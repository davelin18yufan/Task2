import { render, screen } from "@testing-library/react"
import "@testing-library/jest-dom"
import Calendar from "../components/Calendar"
import { format, addMonths, differenceInDays } from "date-fns"
import userEvent from "@testing-library/user-event"

describe("Calendar Component", () => {
  it("Should renders the calendar with correct month and year", () => {
    render(<Calendar />)
    const today = new Date()
    const monthYear = format(today, "yyyy年M月")
    expect(screen.getByText(monthYear)).toBeInTheDocument()
  })

  it("Should displays days of the week", () => {
    render(<Calendar />)
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    daysOfWeek.forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument()
    })
  })

  it("Should navigates to the next month", async () => {
    const user = userEvent.setup()
    render(<Calendar />)

    const today = new Date()
    const nextMonth = format(addMonths(today, 1), "yyyy年M月")
    const currentMonth = format(today, "yyyy年M月")
    // click to next month
    await user.click(screen.getByTestId("chevron-right"))
    expect(screen.getByText(nextMonth)).toBeInTheDocument()

    // click to back to current month
    await user.click(screen.getByTestId("chevron-left"))
    expect(screen.getByText(currentMonth)).toBeInTheDocument()
  })

  it("Should selects a date range", async () => {
    const user = userEvent.setup()
    render(<Calendar />)

    const startDateButton = screen.getByText("11日")
    const endDateButton = screen.getByText("13日")

    const startDate = new Date(2024, 6, 11)
    const endDate = new Date(2024, 6, 13)
    const formattedStartDate = format(startDate, "d日")
    const formattedEndDate = format(endDate, "d日")

    await user.click(startDateButton)
    expect(screen.getByText(formattedStartDate).parentElement).toHaveClass(
      "selected"
    )
    await user.click(endDateButton)

    expect(screen.getByText(formattedEndDate).parentElement).toHaveClass(
      "selected-range"
    )

    const formatSelectedRange = `共 ${
      differenceInDays(endDate, startDate) + 1
    } 天 ${differenceInDays(endDate, startDate)} 夜`

    expect(screen.getByText(formatSelectedRange)).toBeInTheDocument()
  })

  it("Should reset start date if second selection is early than previous", async () => {
    const user = userEvent.setup()
    render(<Calendar />)

    const firstSelection = screen.getByText("11日")
    const secondSelection = screen.getByText("9日")

    await user.click(firstSelection)
    await user.click(secondSelection)

    expect(firstSelection.parentElement).not.toHaveClass('selected')
    expect(secondSelection.parentElement).toHaveClass('selected')
  })
})
