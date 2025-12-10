from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse
from core.database import SessionLocal
from . import crud, schemas
import os

router = APIRouter(prefix="/research", tags=["research"])

# DB セッション依存関係
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 研究データ作成
@router.post("/", response_model=schemas.ResearchResponse)
def create_research(research: schemas.ResearchCreate, db: Session = Depends(get_db)):
    return crud.create_research(db, research)


# 研究データ削除
@router.delete("/{research_id}")
def delete_research(research_id: int, db: Session = Depends(get_db)):
    result = crud.delete_research(db, research_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Research not found")
    return {"message": "Deleted successfully", "id": research_id}


# 研究一覧取得
@router.get("/", response_model=list[schemas.ResearchResponse])
def read_research_list(db: Session = Depends(get_db)):
    return crud.get_research_list(db)


# 研究画像取得
@router.get("/image/{research_id}")
def get_research_image(research_id: int):
    folder_path = f"static/research/{research_id}"
    if not os.path.exists(folder_path):
        raise HTTPException(status_code=404, detail="Image folder not found")

    files = os.listdir(folder_path)
    if not files:
        raise HTTPException(status_code=404, detail="No image found in folder")

    # フォルダ内の最初のファイルを取得
    image_file = files[0]
    image_path = os.path.join(folder_path, image_file)
    return FileResponse(image_path)

# 固定データを一括登録
@router.post("/seed")
def seed_research(db: Session = Depends(get_db)):

    # あらかじめ決めておくデータ
    seed_data = [
        {
            "name": "A",
            "title": "映像分析による発達性協調運動障害 (DCD)検出方法の提案と実装",
            "description": "映像から人の動きをAIで分析し、フィードバックを行う。発達の特徴や苦手な運動を見つけることで、日常の中で気づかれにくい自身の身体の特徴にに関わる生きづらさに「気づき」を与えることを目指す。",
        },
        {
            "name": "B",
            "title": "マルチモーダル入力に基づく作業支援ロボット用インタフェースの開発",
            "description": "本研究では、自然言語・ジェスチャー・作業中の手元映像といったマルチモーダル入力を利用し、一般利用者でも直感的に操作できる日常生活や作業支援を目的とした協働ロボットアームのインタフェースを設計する。",
        },
        {
            "name": "C",
            "title": "生成AIによる自己音声メッセージを用いた自炊習慣支援システムの提案と実装",
            "description": "生成AIと音声合成を用い、自身の声による応援メッセージで自炊を促す支援システムを提案・実装した。心理的動機づけによる自炊支援に有効である可能性を示した。",
        },{
            "name": "D",
            "title": "ゲーミフィケーションによる研究室コミュニティの活性化支援の提案と実装",
            "description": "本研究は、研究室における交流不足や来室頻度の低さを解決するため、ゲーミフィケーションを活用した Web アプリケーションを提案・実装した。来室を促す在室者確認機能と、ポイント、バッジ、ランキング、マイ目標設定機能を導入した。これにより、メンバーの継続的な来室動機と相互作用の機会を創出し、コミュニティの自然な活性化を支援する。",
        },
        {
            "name": "E",
            "title": "画像認識と2D LiDARを用いた路面損傷検出システムの提案と実装",
            "description": "USBカメラと2D LiDARを車両に搭載し、自動で路面の損傷を検出するシステムを開発しています。",
        },
        {
            "name": "F",
            "title": "生成AIを用いたコミュニケーション支援方式の提案と実践評価",
            "description": "生成AIによる会話支援システムの研究を行っています。近年、コミュニケーション能力の重要性が高まる一方、初対面の会話に苦手意識を持つ人が多いです。本研究では、相手の発話に基づき、リアルタイムで複数の返答候補を提示し、関係構築や会話力の向上を支援します。",
        },
        {
            "name": "G",
            "title": "AIによるユーザー嗜好予測に基づくリプレイ映像自動抽出システムの提案と実装",
            "description": "スポーツ観戦者の心拍・声・表情といった生理データを機械学習で分析し、興奮した瞬間を自動的に抽出する研究です。抽出したシーンをARグラスへ提示し、個別最適化された観戦体験を実現します。",
        },
        {
            "name": "H",
            "title": "ライブ配信における個別最適化された視聴体験を実現するシーン提示方式の提案と実装評価",
            "description": "ライブ配信視聴の個別最適化に向け、音声文字起こしを基にLLMで話の切れ目によるシーン分割を行い、コメントの感情分析を用いてユーザ嗜好に合致した場面を提示する手法を提案する。",
        },
        {
            "name": "I",
            "title": "OCRを活用した小説内の固有名詞情報検索システムの提案と実装",
            "description": "文庫本画像をOCRで解析しテキストとページ位置を推定する仕組みを開発。固有名詞の自動抽出と説明提示を組み合わせ、読書理解を支援するWebアプリを構築する研究。",
        },
        {
            "name": "J",
            "title": "チーム対戦ゲームにおける戦略性のあるAI NPCの検討と実装",
            "description": "チーム対戦型のゲームにおいて、人間のプレイヤーの代わりとなれるようなAIプレイヤーの実装を目的とした研究。手法として人間のプレイデータを用いて模倣学習をさせ、それぞれに異なるプレイスタイルを実装させた。",
        },
        {
            "name": "K",
            "title": "BL法を用いた固定空間へのパッキング問題の検討と実践評価",
            "description": "固定された空間へ図形を詰め込むパッキング問題について、形状・重量・温度などさまざまな条件を考慮したパッキングアルゴリズムの開発と詰め込み作業を自動化するためのシステム開発を行っています。",
        },
        {
            "name": "L",
            "title": "魔法疑似体験システムの提案と実装",
            "description": "本研究では、アニメや映画に登場する魔法使いへの憧れを再現するため、IMUセンサーを搭載したステッキを用い、その軌跡を機械学習で認識して魔法エフェクトを発動させる疑似魔法体験システムを開発する。",
        },
        {
            "name": "M",
            "title": "情報の信頼度分析方式の検討と実践評価",
            "description": "生成AIを活用し、テキストの信頼性や文脈を多角的に自動評価するシステムを開発。評価の根拠をスコアやハイライト表示で可視化することで、情報利用者が目の前の情報の信用度を直感的に判断できるよう支援することを目的とする。",
        },
        {
            "name": "N",
            "title": "VRトレッドミルにおけるルート作成機能が 内発的動機付けと運動継続に与える影響と システムの実装と評価",
            "description": "従来のVRトレッドミルトレーニングは固定ルートなので受動的になりモチベーション低下の恐れがあります。そこで自由なルート作成を可能にし、能動的な運動とモチベーション維持を目指します。",
        },
        {
            "name": "O",
            "title": "仮想世界における人のつながりと絆向上のプロセスの提案と実践評価",
            "description": "本研究は、仮想世界を活用し、人々の絆を形成・向上させるシステムの構築を目的とする。絆形成の6段階と絆向上の5段階をモデル化し、ペルソナ「荒木渚」とアバター「奏」を設計した。今後は、実装と評価を進める。",
        },
        {
            "name": "P",
            "title": "UXを考慮した屋内自己位置推定機能による経路案内システムの提案と実装",
            "description": "私の研究では、大学キャンパスをモデルに屋内3D経路案内システムを開発しています。3Dモデル上で現在地と目的地間のルートを視覚的に表示し、利用者が迷わず移動できるよう支援することを目的としています。",
        },
        {
            "name": "Q",
            "title": "ユーザー意向に応じた動的スケジューリング支援システムの検討と実装",
            "description": "カレンダーの予定と生体情報をAIが常時監視し、ユーザーの状態に合わせてスケジュールを自動調整するシステムです。心拍や睡眠データから不調を予知し、AIが休憩を促すことで健康と効率の両立を実現します。",
        },
        {
            "name": "R",
            "title": "楽器音合成を用いた仮想ドラム演奏システムの提案と実装",
            "description": "VRによる仮想ドラム演奏とAIによるリアルタイム楽器音合成を用いて、騒音など周りの環境を気にすることなく本物のドラムのような演奏体験を実現するシステムを実装し、評価を行います。",
        },
    ]

    for item in seed_data:
        crud.create_research(db, schemas.ResearchCreate(**item))

    return {"message": "Seed data inserted"}