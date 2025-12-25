import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, CalendarApi, DayCellContentArg } from "@fullcalendar/core";
import type { DateSelectArg } from "@fullcalendar/core";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import BackgroundSettings from "@/components/calendar/Form/BackgroundSettings";
import ScheduleForm from "@/components/calendar/Form/ScheduleForm";
import type { ScheduleFormData } from "@/components/calendar/Form/ScheduleForm";
import { isHoliday } from "japanese-holidays";
import { API_BASE_URL } from "@/config/api";

// --- 型定義 ---
interface ApiEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string; 
  is_private?: boolean;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  is_private?: boolean;
  display?: 'background';
  opacity?: number;
}

// --- 定数 ---
const BACKGROUND_COLORS = new Set([
  "transparent", // なし (白)
  "#cce5ff",     // 休み (青)
  "#fff3cd",     // 休み (黄)
  "#ffc9c9"      // 休み (赤)
]);

const LABEL_PRESETS = [
  { color: "#3788d8", name: "デフォルト" }, 
  { color: "#28a745", name: "プライベート" },
  { color: "#dc3545", name: "重要" }, 
  { color: "#ffc107", name: "注意" },
  { color: "#6c757d", name: "その他" }, 
  { color: "#6f42c1", name: "会議" },
  { color: "#f06595", name: "記念日" }, 
  { color: "#fd7e14", name: "旅行" },
];

// --- ヘルパー関数 ---
const toDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const correctEndDateForCalendar = (end: string, allDay: boolean): string => {
  if (allDay) {
    const date = new Date(end);
    date.setDate(date.getDate() + 1);
    return toDateString(date);
  }
  return end;
};

const correctEndDateForDb = (end: string | null, allDay: boolean): string => {
  if (!end) return "";
  if (allDay) {
    const date = new Date(end);
    date.setDate(date.getDate() - 1);
    return toDateString(date);
  }
  return end;
};

const getDatesInRange = (startDate: Date, endDate: Date) => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current < end) {
    dates.push(toDateString(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// --- 日付プレビュー用コンポーネント ---
const DayPreview = ({
  date,
  events,
  onAdd,
  onEdit,
  onClose,
  isAuthenticated,
}: {
  date: Date;
  events: CalendarEvent[];
  onAdd: () => void;
  onEdit: (event: CalendarEvent) => void;
  onClose: () => void;
  isAuthenticated: boolean;
}) => {
  const dateStr = toDateString(date);
  const dayEvents = events.filter((e) => e.start.startsWith(dateStr) && e.display !== 'background');
  const holidayName = isHoliday(date);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className={`text-xl font-bold ${holidayName || date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : ''}`}>
            {date.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })}
          </h2>
          {holidayName && <span className="text-sm text-red-500 font-bold">{holidayName}</span>}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>
      </div>
      <div className="mb-6">
        {dayEvents.length === 0 ? (
          <p className="text-gray-500 text-sm">予定はありません</p>
        ) : (
          <ul className="space-y-3">
            {dayEvents.map((event) => {
              const labelName = LABEL_PRESETS.find(p => p.color === event.color)?.name || "";
              return (
                <li
                  key={event.id}
                  onClick={() => isAuthenticated && onEdit(event)}
                  style={{ 
                      borderLeftColor: event.color || '#3788d8',
                      backgroundColor: event.color ? `${event.color}1A` : '#eff6ff' 
                  }}
                  className={`p-3 rounded border-l-4 ${isAuthenticated ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {event.is_private && <span title="ログイン限定" className="text-xs bg-gray-600 text-white px-1.5 py-0.5 rounded">🔒</span>}
                    {labelName && <span className="text-xs font-bold" style={{ color: event.color }}>{labelName}</span>}
                  </div>
                  <div className="font-bold text-base text-gray-800">{event.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {event.allDay ? "終日" : `${event.start.split("T")[1].slice(0, 5)} 〜  ${event.end.split("T")[1].slice(0, 5)}`}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isAuthenticated && (
        <button onClick={onAdd} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md">
          予定を追加
        </button>
      )}
    </div>
  );
};

// --- Calendar コンポーネント本体 ---
export const Calendar: React.FC = () => {
  const { user, logout, token, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [calendarApi, setCalendarApi] = useState<CalendarApi | null>(null);
  const [currentTitle, setCurrentTitle] = useState("");

  const[currentView, setCurrentView] = useState('dayGridMonth');

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [multiSelectedDates, setMultiSelectedDates] = useState<Set<string>>(new Set());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [formData, setFormData] = useState<ScheduleFormData | undefined>();

  const [bgStartDate, setBgStartDate] = useState("");
  const [bgEndDate, setBgEndDate] = useState("");

  const API_URL = `${API_BASE_URL}/calendar/`;

  // モード切替時にFullCalendarの選択を解除
  useEffect(() => {
    if (calendarApi) {
      calendarApi.unselect();
    }
  }, [isSettingsVisible, isFormVisible, calendarApi]);

  useEffect(() => {
    const fetchEvents = async () => {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const response = await fetch(API_URL, { headers });
        if (response.status === 401) {
          if (token) logout(); 
          return; 
        }
        if (!response.ok) throw new Error("データの取得に失敗しました");
        const data: ApiEvent[] = await response.json();
        const formattedEvents = data.map((event) => {
          const eventColor = event.color || "#3788d8";
          const isBackgroundEvent = BACKGROUND_COLORS.has(eventColor);
          return {
            ...event,
            id: event.id.toString(),
            end: correctEndDateForCalendar(event.end, event.allDay),
            color: eventColor,
            is_private: event.is_private,
            display: (isBackgroundEvent ? 'background' : undefined) as 'background' | undefined,
          };
        });
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    if (!isLoading) {
      fetchEvents();
    }
  }, [isAuthenticated, isLoading, token, logout]); 

  const handleDeleteEvent = async (eventId: string) => {
    if (!token) return;
    if (!window.confirm("削除しますか？")) return;
    try {
      const response = await fetch(`${API_URL}${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) { logout(); return; }
      if (response.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        handleCloseForm();
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteBackgroundsFromMultiSelect = async () => {
    if (!token) return;

    let targetEvents: CalendarEvent[] = [];

    if (multiSelectedDates.size > 0) {
        targetEvents = events.filter(event => {
            const eventDateStr = event.start.split('T')[0];
            return event.display === 'background' && multiSelectedDates.has(eventDateStr);
        });
    } 
    else if (bgStartDate && bgEndDate) {
        targetEvents = events.filter(event => {
            if (event.display !== 'background') return false;
            const s = event.start.split('T')[0];
            return s >= bgStartDate && s <= bgEndDate;
        });
    }

    if (targetEvents.length === 0) {
        alert("選択された範囲に削除可能な背景設定はありません。");
        return;
    }

    if (!window.confirm(`選択された範囲の背景 ${targetEvents.length} 件をすべて削除しますか？`)) {
        return;
    }

    try {
        for (const event of targetEvents) {
            const response = await fetch(`${API_URL}${event.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok && response.status !== 404) console.error(`Failed to delete event ${event.id}`);
        }
        const deletedIds = new Set(targetEvents.map(e => e.id));
        setEvents(prev => prev.filter(e => !deletedIds.has(e.id)));
        
        setMultiSelectedDates(new Set());
        setBgStartDate("");
        setBgEndDate("");
        alert("削除が完了しました。");
    } catch (error) {
        console.error("Batch delete failed:", error);
        alert("一部の削除に失敗しました。");
    }
  };

  const handleAddBackground = async (start: string, end: string, color: string, title: string) => {
    if (!token) return;
    
    const hasMultiSelect = multiSelectedDates.size > 0;
    const itemsToSave: { start: string; end: string }[] = [];

    if (hasMultiSelect) {
        multiSelectedDates.forEach(dateStr => {
            itemsToSave.push({
                start: dateStr,
                end: dateStr 
            });
        });
    } else {
        const current = new Date(start);
        const endDateObj = new Date(end);
        
        current.setHours(0, 0, 0, 0);
        endDateObj.setHours(0, 0, 0, 0);

        while (current <= endDateObj) {
            const dateStr = toDateString(current);
            itemsToSave.push({ start: dateStr, end: dateStr });
            current.setDate(current.getDate() + 1);
        }
    }

    try {
      for (const item of itemsToSave) {
          const dbEvent = {
            title: title,
            start: item.start,
            end: item.end, 
            allDay: true,
            is_private: false,
            color: color,
          };

          const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, 
            },
            body: JSON.stringify(dbEvent),
          });

          if (!response.ok) continue;
          const savedEvent = await response.json();
          
          const newEvent: CalendarEvent = {
            ...savedEvent,
            id: savedEvent.id.toString(),
            end: correctEndDateForCalendar(savedEvent.end, savedEvent.allDay),
            color: savedEvent.color,
            is_private: savedEvent.is_private,
            display: 'background'
          };
          setEvents(prev => [...prev, newEvent]);
      }
      
      setMultiSelectedDates(new Set());
      setBgStartDate("");
      setBgEndDate("");

    } catch (error) {
      console.error(error);
      alert("一部の保存に失敗しました");
    }
  };

  const setupFormForDate = (baseDate: Date) => {
    const startDate = new Date(baseDate);
    if (startDate.getHours() === 0 && startDate.getMinutes() === 0) {
        const now = new Date();
        startDate.setHours(now.getHours() + 1, 0, 0, 0);
    }
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);

    setFormData({
      title: "",
      start: toDateTimeLocal(startDate),
      end: toDateTimeLocal(endDate),
      isAllDay: false,
      is_private: false,
      color: "#3788d8",
    });
    setIsFormVisible(true);
  };

  const updateFormDate = (newStartDate: Date, newEndDate: Date, isAllDaySelect: boolean) => {
    setFormData((prevData) => {
      if (!prevData) return undefined;
      if (isAllDaySelect) {
        const startDateString = toDateString(newStartDate);
        const inclusiveEndDate = new Date(newEndDate);
        inclusiveEndDate.setDate(inclusiveEndDate.getDate() - 1);
        if (inclusiveEndDate.getTime() < newStartDate.getTime()) {
          return { ...prevData, start: startDateString, end: startDateString, isAllDay: true };
        }
        return { ...prevData, start: startDateString, end: toDateString(inclusiveEndDate), isAllDay: true };
      } else {
        const startDate = new Date(newStartDate);
        if (startDate.getHours() === 0 && startDate.getMinutes() === 0) {
          const now = new Date();
          startDate.setHours(now.getHours() + 1, 0, 0, 0);
        }
        const endDate = new Date(newEndDate);
        if (endDate.getTime() <= startDate.getTime()) {
            endDate.setHours(startDate.getHours() + 1);
        }
        return { ...prevData, start: toDateTimeLocal(startDate), end: toDateTimeLocal(endDate), isAllDay: false };
      }
    });
  };

  const handleOpenNewForm = () => {
    if (!user) return; 
    setIsPreviewVisible(false);
    setIsSettingsVisible(false); 
    
    setMultiSelectedDates(new Set());
    setBgStartDate("");
    setBgEndDate("");

    if (calendarApi) calendarApi.unselect();
    
    const now = new Date();
    setupFormForDate(now);
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setTimeout(() => {
        if (selectInfo.view && selectInfo.view.calendar) {
            selectInfo.view.calendar.unselect();
        }
    }, 0);

    const isAllDaySelect = selectInfo.allDay;
    const isKeyPressed = selectInfo.jsEvent ? selectInfo.jsEvent.shiftKey : false;

    if (isSettingsVisible) {
        if (isKeyPressed) {
            const datesInRange = getDatesInRange(selectInfo.start, selectInfo.end);
            const isRangeSelection = datesInRange.length > 1;
            
            setMultiSelectedDates(prev => {
               const newSet = new Set<string>(prev);

               if (bgStartDate && bgEndDate) {
                   const current = new Date(bgStartDate);
                   const end = new Date(bgEndDate);
                   current.setHours(0,0,0,0);
                   end.setHours(0,0,0,0);
                   
                   while (current <= end) {
                       newSet.add(toDateString(current));
                       current.setDate(current.getDate() + 1);
                   }
               }

               datesInRange.forEach(d => {
                   if (!isRangeSelection && newSet.has(d)) newSet.delete(d);
                   else newSet.add(d);
               });
               return newSet;
            });

            setBgStartDate("");
            setBgEndDate("");
        } else {
            setBgStartDate(toDateString(selectInfo.start));
            const endDateInclusive = new Date(selectInfo.end);
            endDateInclusive.setDate(endDateInclusive.getDate() - 1);
            setBgEndDate(toDateString(endDateInclusive));
            
            setMultiSelectedDates(new Set());
        }
        return; 
    }

    if (!isAllDaySelect && !isKeyPressed) {
       setFormData({
         title: "",
         start: toDateTimeLocal(selectInfo.start),
         end: toDateTimeLocal(selectInfo.end),
         isAllDay: false,
         is_private: false,
         color: "#3788d8",
       });
       setIsFormVisible(true);
       setIsPreviewVisible(false);
       setMultiSelectedDates(new Set());
       return;
    }

    if (isFormVisible) {
      if (isKeyPressed) {
         setMultiSelectedDates(prev => {
           const newSet = new Set<string>(prev);
           const datesInRange = getDatesInRange(selectInfo.start, selectInfo.end);
           const isRangeSelection = datesInRange.length > 1;
           datesInRange.forEach(d => {
               if (!isRangeSelection && newSet.has(d)) newSet.delete(d);
               else newSet.add(d);
           });
           return newSet;
         });
      } else {
         updateFormDate(selectInfo.start, selectInfo.end, isAllDaySelect);
         const datesInRange = getDatesInRange(selectInfo.start, selectInfo.end);
         const newSet = new Set<string>();
         datesInRange.forEach(d => newSet.add(d));
         setMultiSelectedDates(newSet);
      }
      return;
    }

    if (!user) {
       setMultiSelectedDates(new Set());
       setSelectedDate(selectInfo.start);
       setIsPreviewVisible(true);
       setIsFormVisible(false);
       return;
    }

    const datesInRange = getDatesInRange(selectInfo.start, selectInfo.end);
    const isRangeSelection = datesInRange.length > 1;

    if (isKeyPressed) {
        setMultiSelectedDates(prev => {
            const newSet = new Set<string>(prev);
            datesInRange.forEach(d => {
                if (!isRangeSelection && newSet.has(d)) {
                    newSet.delete(d);
                } else {
                    newSet.add(d);
                }
            });
            return newSet;
        });
        setIsPreviewVisible(false);
        if (!isFormVisible) setupFormForDate(selectInfo.start);
        setIsFormVisible(true);
        return;
    }

    if (isRangeSelection) {
        const newSet = new Set<string>();
        datesInRange.forEach(d => newSet.add(d));
        setMultiSelectedDates(newSet);
        setIsPreviewVisible(false);
        setupFormForDate(selectInfo.start);
        updateFormDate(selectInfo.start, selectInfo.end, isAllDaySelect);
        setIsFormVisible(true);
        return;
    }

    setMultiSelectedDates(new Set());
    setSelectedDate(selectInfo.start);
    
    setIsPreviewVisible(true);
    setIsFormVisible(false);
  };

  const handleAddFromPreview = () => {
    if (!selectedDate) return;
    setIsPreviewVisible(false); 
    setupFormForDate(selectedDate);
  };
  
  const handleDeleteFromMultiSelect = async () => {
    if (!token || multiSelectedDates.size === 0) return;
    const targetEvents = events.filter(event => {
        const eventDateStr = event.start.split('T')[0];
        return multiSelectedDates.has(eventDateStr);
    });
    if (targetEvents.length === 0) {
        alert("選択された日付に削除可能な予定はありません。");
        return;
    }
    if (!window.confirm(`選択された日付の予定 ${targetEvents.length} 件をすべて削除しますか？`)) {
        return;
    }
    try {
        for (const event of targetEvents) {
            const response = await fetch(`${API_URL}${event.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok && response.status !== 404) console.error(`Failed to delete event ${event.id}`);
        }
        const deletedIds = new Set(targetEvents.map(e => e.id));
        setEvents(prev => prev.filter(e => !deletedIds.has(e.id)));
        setMultiSelectedDates(new Set());
        alert("削除が完了しました。");
    } catch (error) {
        console.error("Batch delete failed:", error);
        alert("一部の削除に失敗しました。");
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    if (!user) {
      setSelectedDate(clickInfo.event.start || new Date());
      setIsPreviewVisible(true);
      setIsFormVisible(false);
      return;
    }
    
    if (isSettingsVisible) return;

    if(isFormVisible) return;
    
    const { id, title, startStr, endStr, allDay, backgroundColor, extendedProps } = clickInfo.event;
    if (clickInfo.event.display === 'background') return;

    const start = clickInfo.event.start!;
    let endObj = clickInfo.event.end;
    if (!endObj) {
       endObj = new Date(start);
       endObj.setDate(endObj.getDate() + 1);
    }
    const datesInRange = getDatesInRange(start, endObj);
    const newSet = new Set<string>();
    datesInRange.forEach(d => newSet.add(d));
    setMultiSelectedDates(newSet);

    const isPrivate = extendedProps?.is_private || false;

    setIsPreviewVisible(false);
    setFormData({
      id: id,
      title: title,
      start: allDay ? startStr : toDateTimeLocal(new Date(startStr)),
      end: allDay
        ? correctEndDateForDb(endStr, allDay)
        : toDateTimeLocal(new Date(endStr!)),
      isAllDay: allDay,
      is_private: isPrivate,
      color: backgroundColor || "#3788d8",
    });
    setIsFormVisible(true);
  };

  const handleEditFromPreview = (event: CalendarEvent) => {
    setIsPreviewVisible(false);
    setFormData({
        id: event.id,
        title: event.title,
        start: event.allDay ? event.start : toDateTimeLocal(new Date(event.start)),
        end: event.allDay ? correctEndDateForDb(event.end, event.allDay) : toDateTimeLocal(new Date(event.end)),
        isAllDay: event.allDay,
        is_private: event.is_private || false,
        color: event.color || "#3788d8",
    });
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setFormData(undefined);
    setMultiSelectedDates(new Set());
    if (calendarApi) {
        calendarApi.unselect();
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsVisible(false);
    setBgStartDate("");
    setBgEndDate("");
    setMultiSelectedDates(new Set());
    if (calendarApi) {
        calendarApi.unselect();
    }
  };

  const handleClosePreview = () => {
    setIsPreviewVisible(false);
    setSelectedDate(null);
  };

  const handleSaveEvent = async (formData: ScheduleFormData) => {
    if (!token) {
      alert("ログインが必要です。");
      return;
    }
    const isEditing = formData.id !== undefined;
    const isBulk = multiSelectedDates.size > 0 && !isEditing;

    try {
        if (isBulk) {
            const newEvents: ApiEvent[] = [];
            const dateStrings = Array.from(multiSelectedDates);
            for (const dateStr of dateStrings) {
                let startValue = formData.start;
                let endValue = formData.end;
                if (!formData.isAllDay) {
                    const timeStart = formData.start.split('T')[1] || "00:00";
                    const timeEnd = formData.end.split('T')[1] || "01:00";
                    startValue = `${dateStr}T${timeStart}`;
                    endValue = `${dateStr}T${timeEnd}`;
                } else {
                    startValue = dateStr;
                    endValue = dateStr;
                }
                const dbEvent = {
                    title: formData.title,
                    start: startValue,
                    end: endValue,
                    allDay: formData.isAllDay,
                    is_private: formData.is_private,
                    color: formData.color,
                };
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, 
                    },
                    body: JSON.stringify(dbEvent),
                });
                if (!response.ok) continue; 
                const saved: ApiEvent = await response.json();
                newEvents.push(saved);
            }
            const formattedNewEvents: CalendarEvent[] = newEvents.map((evt) => {
                const isBg = BACKGROUND_COLORS.has(evt.color || "");
                return {
                    ...evt,
                    id: evt.id.toString(),
                    end: correctEndDateForCalendar(evt.end, evt.allDay),
                    color: evt.color,
                    is_private: evt.is_private,
                    display: (isBg ? 'background' : undefined) as 'background' | undefined,
                };
            });
            setEvents(prev => [...prev, ...formattedNewEvents]);
            setMultiSelectedDates(new Set()); 
        } else {
            const dbEvent = {
                title: formData.title,
                start: formData.start,
                end: formData.end, 
                allDay: formData.isAllDay,
                is_private: formData.is_private,
                color: formData.color,
            };
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `${API_URL}${formData.id}` : API_URL;
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, 
                },
                body: JSON.stringify(dbEvent),
            });
            if (response.status === 401) { logout(); return; }
            if (!response.ok) throw new Error("Error");
            
            const savedEvent: ApiEvent = await response.json();
            const isBg = BACKGROUND_COLORS.has(savedEvent.color || "");
            
            const eventForCalendar: CalendarEvent = {
                ...savedEvent,
                id: savedEvent.id.toString(),
                end: correctEndDateForCalendar(savedEvent.end, savedEvent.allDay),
                color: savedEvent.color,
                is_private: savedEvent.is_private,
                display: (isBg ? 'background' : undefined) as 'background' | undefined,
            };
            if (isEditing) {
                setEvents((prev) => prev.map((e) => e.id === eventForCalendar.id ? eventForCalendar : e));
            } else {
                setEvents((prev) => [...prev, eventForCalendar]);
            }
        }
        handleCloseForm();
    } catch (error) { console.error(error); }
  };

  const handleToggleSettings = () => {
    if (!user) {
      alert("ログインが必要です");
      return;
    }
    setIsPreviewVisible(false);
    setIsFormVisible(false);
    
    setMultiSelectedDates(new Set());
    setBgStartDate("");
    setBgEndDate("");

    if (calendarApi) calendarApi.unselect();
    
    setIsSettingsVisible(true);
  };

  let previewEvents: CalendarEvent[] = [];
  if (isFormVisible && formData && !formData.id) {
      if (multiSelectedDates.size > 0) {
          multiSelectedDates.forEach(dateStr => {
              const startD = new Date(dateStr);
              const endD = new Date(startD);
              endD.setDate(endD.getDate() + 1);
              previewEvents.push({
                  id: `preview-${dateStr}`,
                  title: "",
                  start: dateStr,
                  end: toDateString(endD),
                  allDay: true,
                  color: formData.color,
                  is_private: false,
                  display: 'background'
              });
          });
      } else {
          previewEvents.push({
              id: "temp-preview",
              title: "",
              start: formData.start,
              end: formData.end,
              allDay: formData.isAllDay,
              color: formData.color,
              is_private: false,
              display: 'background',
          });
      }
  }

  const selectionEvents: CalendarEvent[] = [];
  if ((isSettingsVisible || (isFormVisible && formData?.id)) && multiSelectedDates.size > 0) {
      multiSelectedDates.forEach(dateStr => {
          const startD = new Date(dateStr);
          const endD = new Date(startD);
          endD.setDate(endD.getDate() + 1);
          selectionEvents.push({
              id: `sel-${dateStr}`,
              title: "",
              start: dateStr,
              end: toDateString(endD),
              allDay: true,
              color: "#bfdbfe", 
              display: 'background',
              is_private: false
          });
      });
  }

  // ★ 共通のクラス名生成ロジック（セルとヘッダーで共用）
  const getClassNameForDate = (date: Date) => {
      const classes: string[] = [];
      const dateStr = toDateString(date);
      const holidayName = isHoliday(date); 
      const day = date.getDay();

      const hasManualBackground = events.some(e => {
          if (e.display !== 'background') return false;
          const eStart = e.start.split('T')[0];
          const eEnd = e.end ? e.end.split('T')[0] : null;
          if (eEnd && eEnd > eStart) {
              return dateStr >= eStart && dateStr < eEnd;
          } else {
              return dateStr === eStart;
          }
      });

      // 選択状態かどうか判定
      const isBgRange = bgStartDate && bgEndDate && dateStr >= bgStartDate && dateStr <= bgEndDate;
      const isSelected = isBgRange || multiSelectedDates.has(dateStr);

      if (isSelected) {
          classes.push("!bg-blue-200"); 
      } else if (hasManualBackground) {
          classes.push("bg-white");
      } else {
          if (holidayName) classes.push("bg-red-50");
          else if (day === 0) classes.push("bg-red-50");
          else if (day === 6) classes.push("bg-blue-50");
      }

      // 文字色
      if (holidayName || day === 0) classes.push("text-red-500");
      else if (day === 6) classes.push("text-blue-500");

      return classes;
  };

  const renderDayCellContent = (arg: DayCellContentArg) => {
    const holidayName = isHoliday(arg.date);
    const isToday = arg.isToday;

    return (
      <div className="flex flex-col items-start w-full h-full">
        <div className="flex items-center">
          {holidayName && currentView === 'dayGridMonth' && (
            <span className="holiday-dot mr-1" data-tooltip={holidayName}></span>
          )}
           <span className={`z-10 ${isToday && currentView === 'dayGridMonth' ? 'today-circle' : ''}`}>
            {arg.dayNumberText.replace('日','')}
          </span>
        </div>
      </div>
    );
  };

  // ★ 修正: 選択数が > 1 の時だけ「一括登録」と表示
  const scheduleFormTitle = formData?.id 
    ? "予定の編集" 
    : multiSelectedDates.size > 1 // ★ ここを > 0 から > 1 に変更
      ? `${multiSelectedDates.size}日分を一括登録` 
      : "予定の追加";

  return (
    <div className="p-4 h-screen flex flex-col relative">

      {/* ログアウト時のみ表示される左上の「戻る」ボタン */}
      {!user && (
        <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-20 text-sm font-medium border border-gray-400 bg-white hover:bg-blue-100 py-2 px-3 rounded-lg">
          ホームに戻る
        </button>
      )}

      <div className="flex justify-between items-center mb-4 px-2">
        <div className="w-1/3">
           {user && <button onClick={handleToggleSettings} className="text-gray-500 p-2 rounded-md hover:bg-blue-100 text-xl">⚙️</button>}
           {user && <button onClick={handleOpenNewForm} className="text-sm font-medium border border-gray-400 hover:bg-blue-100 text-whitehover:bg-black py-2 px-3 rounded-lg">予定を追加</button>}
        </div>

        <div className="flex items-center justify-center gap-6 w-1/3">
            <button 
                onClick={() => calendarApi?.prev()}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light"
            >
                &lt;
            </button>
            <h2 className="text-lg font-bold text-gray-700 w-36 text-center select-none">
                {currentTitle}
            </h2>
            <button 
                onClick={() => calendarApi?.next()}
                className="text-gray-400 hover:text-gray-700 text-2xl font-light"
            >
                &gt;
            </button>
        </div>

       <div className="flex items-center justify-end gap-2 w-1/3">
                <button onClick={() => calendarApi?.today()} className="text-sm font-medium border border-gray-400 bg-whit hover:bg-blue-100 py-2 px-3 rounded-lg">今日</button>
   
                <div className="flex items-center border border-gray-300 rounded-lg text-sm">
                      <button
                        onClick={() => calendarApi?.changeView('dayGridMonth')}
                        className={`font-medium py-2 px-3 rounded-l-lg transition-colors ${
                          currentView === 'dayGridMonth'
                            ? 'bg-blue-400 text-white'
                            : 'bg-white text-gray-700 hover:bg-blue-100'
                        }`}
                     >
                        月
                      </button>
                    <button
                       onClick={() => calendarApi?.changeView('timeGridWeek')}
                      className={`font-medium py-2 px-3 border-l border-r border-gray-400 transition-colors ${
                         currentView === 'timeGridWeek'
                           ? 'bg-blue-400 text-white'
                           : 'bg-white text-gray-700 hover:bg-blue-100'
                       }`}
                     >
                        週
                      </button>
                    <button
                       onClick={() => calendarApi?.changeView('timeGridDay')}
                       className={`font-medium py-2 px-3 rounded-r-lg transition-colors ${
                         currentView === 'timeGridDay'
                           ? 'bg-blue-400 text-white'
                           : 'bg-white text-gray-700 hover:bg-blue-100'
                      }`}
                     >
                        日
                      </button>
                </div>
                <button onClick={() => {if (user) { logout() } else { navigate("/login")}}} className="text-sm font-mediumtext-gray-600 hover:text-blue-500 ml-2">{user ? "ログアウト" : "ログイン"}</button>
            </div>
      </div>

      <div className="flex-grow h-full"> 
        <div className="h-full flex flex-row gap-8"> 
          <div className="flex-grow">
            <FullCalendar
              headerToolbar={false} 
              datesSet={(arg) => {
                setCalendarApi(arg.view.calendar); 
                setCurrentTitle(arg.view.title);
                setCurrentView(arg.view.type);
              }}
              locale="ja"
              eventTimeFormat={{ 
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
              }}
              allDayText="終日"
              height="100%" 
              plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              slotDuration="00:30:00"
              selectable={true}
              events={[...events, ...previewEvents, ...selectionEvents]}
              
              // dayCellClassNames でマス目をハイライト
              dayCellClassNames={(arg) => getClassNameForDate(arg.date)}
              
              // dayHeaderClassNames でヘッダー(日付数字)もハイライト
              dayHeaderClassNames={(arg) => getClassNameForDate(arg.date)}
              
              dayCellContent={renderDayCellContent}
              select={handleDateSelect}
              eventClick={handleEventClick}
              businessHours={{
                daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
                startTime: "00:00",
                endTime: "24:00",
              }}
              weekends={true}
            />
          </div>

          {(isPreviewVisible || (isFormVisible && user) || (isSettingsVisible && user)) && (
            <div className="no-scrollbar w-[400px] min-w-[400px] max-w-[400px] flex-shrink-0 bg-white border-l p-4 overflow-y-auto shadow-xl z-10 box-border">
              
              {isSettingsVisible && user && (
                <BackgroundSettings 
                  events={events}
                  onAdd={handleAddBackground}
                  onDelete={handleDeleteEvent}
                  onClose={handleCloseSettings}
                  startDate={bgStartDate}
                  setStartDate={setBgStartDate}
                  endDate={bgEndDate}
                  setEndDate={setBgEndDate}
                  multiSelectCount={multiSelectedDates.size} 
                  onBulkDelete={handleDeleteBackgroundsFromMultiSelect}
                />
              )}

              {isPreviewVisible && selectedDate && !isFormVisible && !isSettingsVisible && (
                <DayPreview 
                  date={selectedDate}
                  events={events}
                  onAdd={handleAddFromPreview}
                  onEdit={handleEditFromPreview}
                  onClose={handleClosePreview}
                  isAuthenticated={isAuthenticated}
                />
              )}

              {isFormVisible && user && !isSettingsVisible && (
                <>
                  <ScheduleForm
                    initialEvent={formData}
                    onSubmit={handleSaveEvent}
                    onDelete={handleDeleteEvent}
                    onClose={handleCloseForm}
                    formTitle={scheduleFormTitle}
                    // ★ onBulkDeleteは「1日以上」で渡すが、表示はしない
                    onBulkDelete={multiSelectedDates.size > 0 && !formData?.id ? handleDeleteFromMultiSelect : undefined}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;