import React, { useState, useEffect } from "react";

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
  
  // 日数計算
  const [dayCount, setDayCount] = useState(0);

  const backgroundEvents = events.filter(
    (e) =>
      e.display === "background" ||
      BG_COLORS.some((bg) => bg.color === e.color)
  );

  useEffect(() => {
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        const diffTime = Math.abs(e.getTime() - s.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setDayCount(diffDays + 1);
    } else {
        setDayCount(0);
    }
  }, [startDate, endDate]);

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

  // ★ 修正: タイトルを動的に変更 (1日より多いときのみ「一括登録」)
  const displayCount = multiSelectCount > 0 ? multiSelectCount : dayCount;
  const formTitle = displayCount > 1 ? `${displayCount}日分を一括登録` : "背景設定";

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">{formTitle}</h2>
      </div>

      {/* --- 新規追加フォーム --- */}
      <form onSubmit={handleAdd} className="flex flex-col gap-6 mb-6">
        
        <div className="flex flex-col">
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">開始日</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border rounded p-2 text-gray-700 bg-white"
                        required={multiSelectCount === 0}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">終了日</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border rounded p-2 text-gray-700 bg-white"
                        required={multiSelectCount === 0}
                    />
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="font-bold text-gray-700 mb-2 block">色を選択</label>
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
        </div>

        {/* フッターエリア */}
        <div className="mt-auto pt-4 border-t flex flex-col gap-4">
            
            {/* 一括削除ボタン: 1日でも選択されていれば表示 (前回の修正を維持) */}
            {((multiSelectCount > 0) || (dayCount > 0)) && onBulkDelete && (
                <button
                    type="button"
                    onClick={onBulkDelete}
                    className="w-full bg-red-100 text-red-600 py-2 rounded text-sm font-bold hover:bg-red-200 transition-colors border border-red-200"
                >
                    選択した日付の背景を削除
                </button>
            )}

            {/* キャンセル・追加ボタン */}
            <div className="flex justify-between gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors font-semibold"
                >
                    キャンセル
                </button>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-black transition-colors font-semibold shadow-lg"
                >
                    {multiSelectCount > 0 ? "適用" : "追加"}
                </button>
            </div>
        </div>
      </form>

      {/* --- 設定済みリスト --- */}
      <div className="flex-grow overflow-hidden flex flex-col border-t pt-4">
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
                  className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
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