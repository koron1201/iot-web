import React, { useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color?: string;
  display?: 'background';
}

interface BackgroundSettingsProps {
  events: CalendarEvent[];
  onAdd: (start: string, end: string, color: string, title: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  multiSelectCount?: number;
  onBulkDelete?: () => void;
}

const BG_COLORS = [
  { color: "transparent", name: "授業あり" },
  { color: "#cce5ff", name: "休み" },
  { color: "#fff3cd", name: "振替授業日" },
  { color: "#ffc9c9", name: "特定日" },
];

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  events,
  onAdd,
  onDelete,
  onClose,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  multiSelectCount = 0,
  onBulkDelete,
}) => {
  const [selectedColor, setSelectedColor] = useState(BG_COLORS[0].color);

  const backgroundEvents = events.filter(
    (e) =>
      e.display === "background" ||
      BG_COLORS.some((bg) => bg.color === e.color)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (multiSelectCount === 0 && (!startDate || !endDate)) {
      alert("開始日と終了日を選択してください");
      return;
    }
    const colorObj = BG_COLORS.find((c) => c.color === selectedColor);
    const titleToSave = selectedColor === "transparent" ? "" : (colorObj?.name || "背景");
    onAdd(startDate, endDate, selectedColor, titleToSave);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 rounded-lg shadow-inner">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">📅 背景設定</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕ 閉じる
        </button>
      </div>

      {/* --- 新規追加フォーム --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <h3 className="font-bold text-sm text-gray-600 mb-3">新しい背景を追加</h3>
        
        {multiSelectCount > 0 ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-3 rounded text-sm text-center mb-4">
                <strong>{multiSelectCount}</strong> 日分の日付が選択されています
            </div>
        ) : (
            <>
                <p className="text-xs text-gray-400 mb-2">カレンダーをドラッグまたはShift+クリックで日付を選択</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div>
                    <label className="text-xs text-gray-500">開始日</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border rounded p-1 text-sm"
                        required={multiSelectCount === 0}
                    />
                    </div>
                    <div>
                    <label className="text-xs text-gray-500">終了日</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border rounded p-1 text-sm"
                        required={multiSelectCount === 0}
                    />
                    </div>
                </div>
            </>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">色を選択</label>
            <div className="grid grid-cols-2 gap-2">
              {BG_COLORS.map((bg) => (
                <button
                  key={bg.color}
                  type="button"
                  onClick={() => setSelectedColor(bg.color)}
                  className={`
                    flex items-center gap-2 p-2 rounded border text-left transition-all
                    ${selectedColor === bg.color ? "border-black bg-gray-100 ring-1 ring-black" : "border-gray-200 hover:bg-gray-50"}
                  `}
                >
                  <span 
                    className={`block w-6 h-6 rounded border ${bg.color === 'transparent' ? 'border-gray-300 border-dashed bg-white' : 'border-transparent'}`}
                    style={{ backgroundColor: bg.color }}
                  />
                  <span className="text-xs font-medium text-gray-700">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded text-sm font-bold hover:bg-black transition-colors"
          >
            {multiSelectCount > 0 ? `${multiSelectCount}日分の背景を追加` : "背景を追加"}
          </button>

          {multiSelectCount > 0 && onBulkDelete && (
            <button
              type="button"
              onClick={onBulkDelete}
              className="bg-red-100 text-red-600 py-2 rounded text-sm font-bold hover:bg-red-200 transition-colors border border-red-200"
            >
              選択した日付の背景を削除
            </button>
          )}
        </form>
      </div>

      {/* --- 設定済みリスト --- */}
      <div className="flex-grow overflow-hidden flex flex-col">
        <h3 className="font-bold text-sm text-gray-600 mb-2">設定済みの背景 ({backgroundEvents.length})</h3>
        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {backgroundEvents.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">設定なし</p>
          ) : (
            backgroundEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between bg-white p-2 rounded border shadow-sm"
                style={{ 
                    borderLeft: `4px solid ${event.color === 'transparent' ? '#ccc' : event.color}`,
                    borderLeftStyle: event.color === 'transparent' ? 'dashed' : 'solid'
                }}
              >
                <div className="text-xs">
                  <div className="font-bold text-gray-700">{event.title || "（なし）"}</div>
                  <div className="text-gray-500">
                    {event.start.split("T")[0]}
                    {event.start !== event.end && ` 〜 ${event.end.split("T")[0]}`}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(event.id)}
                  className="text-red-500 hover:bg-blue-100 p-1 rounded transition-colors"
                  title="削除"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundSettings;