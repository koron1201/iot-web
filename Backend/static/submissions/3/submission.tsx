import { DecorativeNav } from "@/components/layout/DecorativeNav";
import { Button } from "@/components/ui/button";
import CircularCardCarousel from "@/components/ui/CircularCardCarousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmissionForm } from "@/components/submission/SubmissionForm";
import { useEffect, useState } from "react"; // useRef を削除
import { FilterSidebar } from "@/components/submission/FilterSidebar";
import { AdBanner } from "@/components/submission/AdBanner";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { IconContext } from "react-icons";

interface Submission {
  id: number;
  title: string;
  description: string | null;
  game_data_url: string | null;
  document_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

export const Submission: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // useRef の定義を削除

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("/api/submissions");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Submission[] = await response.json();
      console.log("Fetched submissions data:", data);

      // ダミーデータを30個生成
      const dummySubmissions: Submission[] = Array.from({ length: 50 }, (_, i) => ({
        id: 1000 + i, // 既存のIDと重複しないように大きな値から始める
        title: `ダミー成果物 ${i + 1}`,
        description: `これはダミーの成果物 ${i + 1} の説明です。`,
        game_data_url: null,
        document_url: null,
        thumbnail_url: `static/submissions/dummy/${(i % 5) + 1}.jpg`, // ダミー画像パス
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      // 既存のデータとダミーデータを結合
      setSubmissions([...data, ...dummySubmissions]);

    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      // エラー時もダミーデータのみ表示できるようにする
      const dummySubmissions: Submission[] = Array.from({ length: 30 }, (_, i) => ({
        id: 1000 + i,
        title: `ダミー成果物 ${i + 1}`,
        description: `これはダミーの成果物 ${i + 1} の説明です。`,
        game_data_url: null,
        document_url: null,
        thumbnail_url: `static/submissions/dummy/${(i % 5) + 1}.jpg`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setSubmissions(dummySubmissions);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmissionSuccess = () => {
    fetchSubmissions();
    setIsDialogOpen(false); // Close the dialog
  };

  const handleRandomSelect = () => {
    // ここにランダム選択のロジックを実装
    console.log("ランダム選択ボタンがクリックされました！");
    if (submissions.length > 0) {
      const randomIndex = Math.floor(Math.random() * submissions.length);
      const randomSubmission = submissions[randomIndex];
      alert(`ランダムに選ばれた成果物: ${randomSubmission.title}`);
      // TODO: カルーセルをこのカードに移動させるロジック
    } else {
      alert("表示する成果物がありません。");
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // デフォルトの右クリックメニューを無効化
    setIsDialogOpen(true); // ダイアログを開く
  };

  // 高さを揃えるための useEffect を削除

  const submissionItems = submissions.map(submission => {
    const imageUrl = submission.thumbnail_url
      ? `http://localhost:8000/${submission.thumbnail_url.replace(/\\/g, '/')}`
      : 'https://via.placeholder.com/150?text=No+Image'; // Fallback placeholder image
    return (
    <div key={submission.id} style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontSize: '1rem',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #ccc'
    }}>
      <h3 className="font-bold mt-2">{submission.title}</h3>
        <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <img src={imageUrl} alt={submission.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '5px' }} />
        </div>
    </div>
  )});

  return (
    <div className="container py-12 relative">
      <div className="flex items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                成果物紹介
        </h1>
        <div className="flex items-center gap-4">
          <DecorativeNav />
        </div>
      </div>

      {/* レスポンシブなカラムレイアウト */}
      <div className="flex flex-col md:flex-row gap-8 items-stretch">
        {/* 左カラム: 絞り込みとランダム選択ボタン (md以上で表示) */}
        <div className="hidden md:flex w-full md:w-1/5 flex-col justify-between h-full">
          <FilterSidebar />
          <div className="flex justify-center py-4">
            <Button onClick={handleRandomSelect} className="w-80 h-9 rounded-lg flex items-center justify-center" variant="outline">
              <GiPerspectiveDiceSixFacesRandom size={28} />
              <span>お試しボタン</span>
            </Button>
          </div>
        </div>

        {/* 中央カラム: カルーセル */}
        <main
          className="w-full md:w-3/5 overflow-hidden border rounded-lg shadow-sm relative pb-8 h-full"
          onContextMenu={handleContextMenu}
        >
          <CircularCardCarousel className="h-full" items={submissionItems.length > 0 ? submissionItems : [<p>投稿がありません</p>]} />
          {/* ランダム選択ボタン (md未満で表示) */}
          <div className="md:hidden absolute bottom-4 right-4">
            <Button onClick={handleRandomSelect} className="w-9 h-9 rounded-lg flex items-center justify-center" variant="outline">
              <GiPerspectiveDiceSixFacesRandom size={28} />
            </Button>
          </div>
        </main>

        {/* 右カラム: 広告 */}
        <aside className="w-full md:w-1/5 h-full">
          <AdBanner submissions={submissions} />
        </aside>
      </div>

      {/* 新規追加ボタンを Dialog に変更 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新規成果物投稿</DialogTitle>
          </DialogHeader>
          <SubmissionForm onSubmitSuccess={handleSubmissionSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Submission;
