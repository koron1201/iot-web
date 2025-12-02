import React, { useState, useEffect } from "react";

// 型定義
export interface ScheduleFormData {
  id?: string;
  title: string;
  start: string;
  end: string;
  isAllDay: boolean;
  is_private?: boolean;
  color: string;
}

interface ScheduleFormProps {
  initialEvent?: ScheduleFormData;
  onSubmit: (data: ScheduleFormData) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

// 通常のラベルのみ（背景色は削除）
const LABEL_PRESETS = [
  { color: "#3788d8", name: "デフォルト" },
  { color: "#28a745", name: "イベント" },
  { color: "#dc3545", name: "重要" },
  { color: "#ffc107", name: "注意" },
  { color: "#6c757d", name: "その他" },
  { color: "#6f42c1", name: "会議" },
  { color: "#f06595", name: "記念日" },
  { color: "#fd7e14", name: "旅行" },
];

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  initialEvent,
  onSubmit,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    start: "",
    end: "",
    isAllDay: false,
    is_private: false,
    color: "#3788d8",
  });

  useEffect(() => {
    if (initialEvent) {
      setFormData(initialEvent);
    }
  }, [initialEvent]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      if (name === "isAllDay") {
        const newIsAllDay = checked;
        let newStart = prev.start;
        let newEnd = prev.end;
        if (!newIsAllDay) {
          if (!newStart.includes("T")) newStart = `${newStart}T09:00`;
          if (!newEnd.includes("T")) newEnd = `${newEnd}T10:00`;
        }
        return { ...prev, isAllDay: newIsAllDay, start: newStart, end: newEnd };
      }
      if (name === "start" || name === "end") {
        if (prev.isAllDay && !value.includes("T")) {
           return { ...prev, [name]: `${value}T00:00` };
        }
        return { ...prev, [name]: value };
      }
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("タイトルを入力してください");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700">予定</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="タイトルを追加"
          className="border rounded p-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-3 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium cursor-pointer" htmlFor="allDay">
            終日
          </label>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="isAllDay"
              id="allDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4"
            />
            <label
              htmlFor="allDay"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                formData.isAllDay ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></label>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-gray-700 font-medium cursor-pointer block" htmlFor="private">
              ログインユーザー限定
            </label>
            <span className="text-xs text-gray-400">未ログインのユーザには表示されません</span>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              name="is_private"
              id="private"
              checked={formData.is_private || false}
              onChange={handleChange}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-4"
            />
            <label
              htmlFor="private"
              className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                formData.is_private ? "bg-blue-500" : "bg-gray-300"
              }`}
            ></label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">開始日時</label>
          <input
            type={formData.isAllDay ? "date" : "datetime-local"}
            name="start"
            value={formData.isAllDay && formData.start ? formData.start.split("T")[0] : formData.start}
            onChange={handleChange}
            className="border rounded p-2 text-gray-700 bg-white"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">終了日時</label>
          <input
            type={formData.isAllDay ? "date" : "datetime-local"}
            name="end"
            value={formData.isAllDay && formData.end ? formData.end.split("T")[0] : formData.end}
            onChange={handleChange}
            className="border rounded p-2 text-gray-700 bg-white"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-end">
           <label className="font-bold text-gray-700">ラベル色</label>
           <span className="text-xs text-gray-400">
             {LABEL_PRESETS.find(p => p.color === formData.color)?.name}
           </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {LABEL_PRESETS.map((preset) => (
            <button
              key={preset.color}
              type="button"
              onClick={() => setFormData({ ...formData, color: preset.color })}
              style={{ backgroundColor: preset.color }}
              className={`w-8 h-8 rounded-full transition-all border-2 ${
                formData.color === preset.color ? "border-black scale-110 shadow-md" : "border-transparent hover:scale-105"
              }`}
              title={preset.name}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 flex justify-between border-t gap-3">
        {onDelete && formData.id ? (
          <button
            type="button"
            onClick={() => onDelete(formData.id!)}
            className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition-colors font-semibold"
          >
            削除
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition-colors font-semibold"
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-black transition-colors font-semibold shadow-lg"
        >
          保存
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;