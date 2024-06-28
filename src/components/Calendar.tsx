import { useState, useRef } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isToday,
  differenceInDays,
} from "date-fns"
import { zhTW } from "date-fns/locale/zh-TW"
import { Chevron } from "./Chevron"
import { clsx } from "clsx"

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

/**
 * DateCell component for displaying a single date in a calendar.
 *
 * @component
 * @param {Function} props.onClick - The function to be called when the date cell is clicked.
 * @param {boolean} [props.disabled=false] - Whether the date cell is disabled.
 * @param {boolean} props.isToday - Whether the date cell represents today's date.
 * @param {boolean|null} props.isSelected - Whether the date cell is selected.
 * @param {boolean|null} props.isInRange - Whether the date cell is within a selected range.
 * @param {string} props.dateDisplay - The text to display in the date cell.
 * @returns {JSX.Element} A button element representing the date cell.
 */
const DateCell = ({
  onClick,
  disabled = false,
  isToday,
  isSelected,
  isInRange,
  dateDisplay,
}: {
  disabled?: boolean
  isToday: boolean
  isSelected: boolean | null
  isInRange: boolean | null
  onClick: () => void
  dateDisplay: string
}): JSX.Element => {
  return (
    <button
      className={clsx("column", "dayBtn", {
        disabled,
        today: isToday,
        selected: isSelected,
        "selected-range": isInRange,
      })}
      disabled={disabled}
      onClick={onClick}
    >
      <span>{dateDisplay}</span>
    </button>
  )
}

/**
 * DateRow component for wrapping DateCells in one row.
 *
 * @component
 * @param {React.ReactNode} children - For DateCells you want to wrap.
 * @returns {JSX.Element} A button element representing the date cell.
 *
 * @example
 * <DateRow>
 *  {days.map(day => <DateCell dateDisplay={day}/>)}
 * </DateRow>
 */
const DateRow = ({ children }: { children: React.ReactNode }): JSX.Element => {
  return <div className="row">{children}</div>
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectStart, setSelectStart] = useState<Date | null>(null)
  const [selectEnd, setSelectEnd] = useState<Date | null>(null)
  const calendarRef = useRef(null)

  // current month
  const startMonth = startOfMonth(currentDate)
  const endMonth = endOfMonth(currentDate)

  // dates start in first week + current month + dates end in last week
  const startDate = startOfWeek(startMonth)
  const endDate = endOfWeek(endMonth)

  const dateFormat = "d日"
  const DateRows: React.ReactNode[] = [] // row components
  let DateCells: React.ReactNode[] = [] // cell components

  let date = startDate // first day at first week

  // Render date cells
  while (date <= endDate) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(date, dateFormat)
      const cloneDate = date // store reference

      // All dates before end week
      DateCells.push(
        // if(!isSameMonth) disabled
        // if(isToDay) today
        // if((!start || !end) selected || !re-selected) selected
        // if(start && and both selected) selected-range
        <DateCell
          onClick={() => handleDatesSelect(cloneDate)}
          disabled={!isSameMonth(date, startMonth)}
          isToday={isToday(date)}
          isSelected={selectStart && !selectEnd && isSameDay(date, selectStart)}
          isInRange={
            selectStart &&
            selectEnd &&
            isWithinInterval(date, { start: selectStart, end: selectEnd })
          }
          key={date.toDateString()}
          dateDisplay={formattedDate}
        />
      )
      date = addDays(date, 1)
    }
    DateRows.push(<DateRow key={date.toDateString()}>{DateCells}</DateRow>)
    // clear array for next loop
    DateCells = []
  }

  const handleNextMonthClick = () => {
    setCurrentDate(addDays(endOfMonth(currentDate), 1))
  }

  const handlePrevMonthClick = () => {
    setCurrentDate(startOfMonth(addDays(startOfMonth(currentDate), -1)))
  }

  const handleDatesSelect = (date: Date) => {
    // Reset start on first click or both being selected
    if (!selectStart || (selectStart && selectEnd)) {
      setSelectStart(date)
      setSelectEnd(null)
    } else if (selectStart && !selectEnd) {
      // if start has been selected
      if (date < selectStart) {
        // assure user attempt to select before start -> reset start + keep end clear
        setSelectStart(date)
        setSelectEnd(null)
      } else {
        setSelectEnd(date)
      }
    }
  }

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const nights = differenceInDays(endDate, startDate)
    const totalDays = nights + 1

    return `共 ${totalDays} 天 ${nights} 夜`
  }

  return (
    <div className="calendar" ref={calendarRef}>
      {/* Header - Month */}
      <div className="calendar-header">
        <div
          className="month-select"
          onClick={handlePrevMonthClick}
          data-testid="chevron-left"
        >
          <Chevron size={16} orientation="left" />
        </div>

        <h4>{format(currentDate, "yyyy年M月")}</h4>

        <div
          className="month-select"
          onClick={handleNextMonthClick}
          data-testid="chevron-right"
        >
          <Chevron size={16} orientation="right" />
        </div>
      </div>

      {/* Body - Week / Date */}
      <div className="calendar-body">
        {/* Week */}
        <div className="row">
          {days.map((day, index) => (
            <button className="column" key={index}>
              {day}
            </button>
          ))}
        </div>

        {/* Dates */}
        {DateRows}
      </div>
      <div className="calendar-footer">
        <p>
          {selectStart && (
            <span>您選擇了 {format(selectStart, "PP", { locale: zhTW })} </span>
          )}
          {selectEnd && (
            <span>到 {format(selectEnd, "PP", { locale: zhTW })}</span>
          )}
        </p>
        {selectStart && selectEnd && (
          <p className="duration">{formatDateRange(selectStart, selectEnd)}</p>
        )}
      </div>
    </div>
  )
}

export default Calendar
