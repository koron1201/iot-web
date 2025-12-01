import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"

import { PageQuickNav } from "@/components/PageQuickNav"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type SubmissionData = {
  id: number
  title: string
  subtitle: string
  description: string
  file_path: string | null
  thumbnail_path: string | null;
}

type DisplayCard = {
  id: number
  title: string
  subtitle: string
  rarity: string
  description: string
  file_path: string | null
  thumbnail_path: string | null;
}

export const Submission: React.FC = () => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoadingSubmissions(true);
      const response = await fetch("http://localhost:8000/submission/");
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      const data: SubmissionData[] = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const hasDeliverables = submissions.length > 0;

  const cards = useMemo<DisplayCard[]>(() => {
    if (!hasDeliverables || loadingSubmissions) return []

    const rarityPalette = ["★★★★★", "★★★★", "★★★★", "★★★", "★★★★★", "★★★★", "★★★", "★★★★★"]

    return submissions.map((item, index) => ({
      id: item.id,
      title: item.title,
      subtitle: item.subtitle || `PROJECT ${index + 1}`,
      rarity: rarityPalette[index % rarityPalette.length],
      description: item.description,
      file_path: item.file_path,
      thumbnail_path: item.thumbnail_path,
    }))
  }, [hasDeliverables, submissions, loadingSubmissions])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cardsRef = useRef<THREE.Mesh[]>([])
  const groupRef = useRef<THREE.Group | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [activeCard, setActiveCard] = useState<DisplayCard | null>(null);
  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);

  const rotationRef = useRef({ current: 0, target: 0 })
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, rotation: 0 })
  const lastMoveTimeRef = useRef(Date.now())

  const drawFallbackGradient = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#141E30")
    gradient.addColorStop(1, "#243B55")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
  }

  const createCardTexture = useCallback(async (card: DisplayCard): Promise<THREE.CanvasTexture> => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 768
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      // Return a dummy texture if context fails
      return new THREE.CanvasTexture(canvas);
    }

    const loadImage = (src: string): Promise<HTMLImageElement> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
      });

    const drawTitle = () => {
      const splitLines = (text: string, maxChars: number) => {
        const chars = Array.from(text)
        const lines: string[] = []
        for (let i = 0; i < chars.length; i += maxChars) {
          lines.push(chars.slice(i, i + maxChars).join(""))
        }
        return lines
      }
      
      // The title area is the bottom 120px of the canvas.
      const titleAreaY = canvas.height - 120;

      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, titleAreaY, canvas.width, 120);
      
      ctx.fillStyle = "#FFFFFF"
      ctx.textAlign = "center";
      ctx.font = "bold 36px 'Noto Sans JP', 'Roboto', sans-serif"
      const titleLines = splitLines(card.title, 14).slice(0, 2)
      titleLines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, titleAreaY + 40 + index * 44)
      })
    }

    // First, draw the background for the entire card
    drawFallbackGradient(ctx, canvas.width, canvas.height);

    if (card.thumbnail_path) {
      try {
        const img = await loadImage(`http://localhost:8000/${card.thumbnail_path}`);
        
        // Define the image area (the upper part of the card)
        const imageAreaHeight = canvas.height - 120; // Leave 120px for the title
        const padding = 20; // 左右の余白（例として20px）
        const imageAreaWidth = canvas.width - (padding * 2); // 余白を引いた幅

        // Calculate the scaled size to fit the area while maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const areaAspectRatio = imageAreaWidth / imageAreaHeight;

        let drawWidth = imageAreaWidth;
        let drawHeight = imageAreaHeight;

        if (imgAspectRatio > areaAspectRatio) {
          // Image is wider than the area, scale by width
          drawHeight = drawWidth / imgAspectRatio;
        } else {
          // Image is taller than the area, scale by height
          drawWidth = drawHeight * imgAspectRatio;
        }

        // Center the image within the image area, and also account for padding
        const offsetX = padding + (imageAreaWidth - drawWidth) / 2; // パディング+中央揃え
        const offsetY = (imageAreaHeight - drawHeight) / 2;

        // Draw the image in the calculated position and size
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      } catch (error) {
        console.error("Failed to load image, will only show fallback gradient:", error);
        // The background is already drawn, so nothing more to do on error.
      }
    }

    // Finally, draw the title in its own designated area
    drawTitle();
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.anisotropy = rendererRef.current?.capabilities.getMaxAnisotropy() || 1;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return;

    let isCancelled = false;
  
    const initScene = async () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    
      if (!hasDeliverables || cards.length === 0) {
        return;
      }

      rotationRef.current.current = 0
      rotationRef.current.target = 0

      const scene = new THREE.Scene()
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
      dirLight.position.set(5, 10, 7.5);
      scene.add(dirLight);
      sceneRef.current = scene

      const perspective = container.clientWidth / container.clientHeight || window.innerWidth / window.innerHeight
      const camera = new THREE.PerspectiveCamera(60, perspective, 0.1, 1000)
      camera.position.z = 12
      cameraRef.current = camera

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(window.devicePixelRatio || 1)
      renderer.setSize(container.clientWidth, container.clientHeight)
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)
      rendererRef.current = renderer

      const group = new THREE.Group()
      scene.add(group)
      groupRef.current = group

      cardsRef.current = []

      // Wait for all textures to be created
      const textures = await Promise.all(cards.map(card => createCardTexture(card)));

      if (isCancelled) return;

      const radius = Math.max(6, Math.min(12, cards.length * 1.5))
      const angleStep = (Math.PI * 2) / cards.length

      textures.forEach((texture, index) => {
        const card = cards[index];
        const angle = index * angleStep
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius

        const geometry = new THREE.PlaneGeometry(2.4, 3.6)
        const material = new THREE.MeshPhysicalMaterial({
          map: texture,
          color: 0xffffff,
          roughness: 0.25,
          metalness: 0.15,
          clearcoat: 0.8,
          clearcoatRoughness: 0.15,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide,
        })

        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, 0, z)
        mesh.userData = { cardData: card, index, texture }
        group.add(mesh)
        cardsRef.current.push(mesh)
      })

      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      const normalizeAngle = (angle: number) => {
        let normalized = angle % (Math.PI * 2)
        if (normalized > Math.PI) {
          normalized -= Math.PI * 2
        } else if (normalized < -Math.PI) {
          normalized += Math.PI * 2
        }
        return normalized
      }

      const getNearestCardIndex = () => {
        const currentRotation = normalizeAngle(rotationRef.current.current)
        const anglePerCard = (Math.PI * 2) / cards.length
        let nearestIndex = Math.round(-currentRotation / anglePerCard)
        while (nearestIndex < 0) nearestIndex += cards.length
        return nearestIndex % cards.length
      }

      const handleClick = (event: MouseEvent) => {
        if (!cameraRef.current || !rendererRef.current) return
        const rect = rendererRef.current.domElement.getBoundingClientRect()
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

        raycaster.setFromCamera(mouse, cameraRef.current)
        const intersects = raycaster.intersectObjects(cardsRef.current)

        if (intersects.length === 0) return
        const clickedCard = intersects[0].object as THREE.Mesh
        const nearestIndex = getNearestCardIndex()
        if (clickedCard.userData.index === nearestIndex) {
          setActiveCard(clickedCard.userData.cardData as DisplayCard)
        } else if (typeof clickedCard.userData.index === "number") {
          const anglePerCard = (Math.PI * 2) / cards.length
          rotationRef.current.target = normalizeAngle(-clickedCard.userData.index * anglePerCard)
        }
      }

      const handlePointerDown = (event: PointerEvent) => {
        isDraggingRef.current = true
        dragStartRef.current = {
          x: event.clientX,
          rotation: rotationRef.current.current,
        }
      }

      const handlePointerMove = (event: PointerEvent) => {
        if (!isDraggingRef.current) return
        const containerWidth = container.clientWidth || window.innerWidth
        const deltaX = event.clientX - dragStartRef.current.x
        const rotationAmount = (deltaX / containerWidth) * Math.PI * 2
        rotationRef.current.target = dragStartRef.current.rotation + rotationAmount
      }

      const handlePointerUp = () => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false
      }

      const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current) return
        const width = container.clientWidth || window.innerWidth
        const height = container.clientHeight || window.innerHeight
        cameraRef.current.aspect = width / height
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(width, height)
      }

      const animate = () => {
        if (isCancelled) return;
        animationFrameRef.current = requestAnimationFrame(animate)
        const currentRotation = rotationRef.current.current
        const targetRotation = rotationRef.current.target
        const diff = targetRotation - currentRotation
        if (Math.abs(diff) > 0.0001) {
          const speed = isDraggingRef.current ? 0.08 : 0.12
          rotationRef.current.current += diff * speed
          lastMoveTimeRef.current = Date.now()
        }

        if (groupRef.current) {
          groupRef.current.rotation.y = rotationRef.current.current
        }

        cardsRef.current.forEach((mesh) => {
          const cardPosition = mesh.position.clone()
          const toCenter = cardPosition.clone().negate()
          toCenter.y = 0
          toCenter.normalize()
          const angle = Math.atan2(toCenter.x, toCenter.z) + Math.PI
          mesh.rotation.y = angle
        })

        renderer.render(scene, camera)
      }

      renderer.domElement.addEventListener("click", handleClick)
      renderer.domElement.addEventListener("pointerdown", handlePointerDown)
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
      window.addEventListener("resize", handleResize)

      handleResize()
      animate()
    }
    
    initScene();

    return () => {
      isCancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [cards, createCardTexture, hasDeliverables])

  const handleDisplay = () => {
    if (activeCard && activeCard.file_path) {
      const webglUrl = `http://localhost:8000/${activeCard.file_path}`;
      window.location.href = webglUrl;
    } else {
      alert("表示するビルドデータが見つかりません。");
      setActiveCard(null);
    }
  };

  const handleDelete = async (submissionId: number) => {
    if (!window.confirm("この成果物を本当に削除しますか？この操作は元に戻せません。")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/submission/${submissionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('成果物の削除に失敗しました。');
      }
      
      alert('成果物が削除されました。');
      setActiveCard(null);
      fetchSubmissions();

    } catch (error) {
      console.error('Error deleting submission:', error);
      alert((error as Error).message);
    }
  };

  const [formTitle, setFormTitle] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formThumbnail, setFormThumbnail] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormFile(event.target.files[0]);
    } else {
      setFormFile(null);
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFormThumbnail(event.target.files[0]);
    } else {
      setFormThumbnail(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!formTitle || !formSubtitle || !formFile || !formThumbnail) {
      setSubmitError("タイトル、サブタイトル、ビルドデータ、サムネイルをすべて入力してください。");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", formTitle);
    formData.append("subtitle", formSubtitle);
    formData.append("description", formDescription);
    formData.append("file", formFile);
    formData.append("thumbnail_file", formThumbnail);

    try {
      const response = await fetch("http://localhost:8000/submission/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "成果物の投稿に失敗しました。");
      }

      alert("成果物が正常に投稿されました！");
      setFormTitle("");
      setFormSubtitle("");
      setFormDescription("");
      setFormFile(null);
      setFormThumbnail(null);
      setIsSubmissionFormOpen(false);
      fetchSubmissions();

    } catch (error: any) {
      setSubmitError(error.message);
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainContent = (
    <div
    className="relative min-h-screen w-full overflow-hidden text-white"
    style={{ background: "linear-gradient(180deg, #0f2027 0%, #203a43 40%, #2c5364 100%)" }}
    >
      <div ref={containerRef} className="absolute inset-0" />
        {hasDeliverables ? (
          <>
            <header className="pointer-events-none absolute left-1/2 top-12 z-10 w-full max-w-2xl -translate-x-1/2 space-y-3 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Interactive Showcase</p>
              <h1 className="text-3xl font-bold md:text-4xl">開封したい成果物をタップ！</h1>
              <p className="text-base text-white/70">
                ドラッグで回転、正面のカードをタップすると詳しい情報が表示されます。
              </p>
            </header>
            <div className="pointer-events-none absolute inset-x-0 bottom-12 z-10 text-center text-sm text-white/70">
              <span className="rounded-full border border-white/30 px-5 py-2 backdrop-blur">
                Tip: 画面をドラッグしてカルーセルを回転できます
              </span>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" />
          </>
        ) : (
          <div className="container mx-auto flex h-screen max-w-4xl flex-col items-center justify-center space-y-6 py-12 text-center">
            <header className="space-y-3">
              <h1 className="text-3xl font-bold">成果物紹介</h1>
              <p className="text-muted-foreground">
                研究室メンバーが取り組んだ制作物をまとめています。各プロジェクトの概要をご覧いただけます。
              </p>
            </header>
            <p className="text-muted-foreground">現在、公開できる成果物はありません。最初の成果物を投稿しましょう！</p>
          </div>
        )}
      
      {/* Action Choice Modal */}
      {activeCard && (
        <Dialog open={!!activeCard} onOpenChange={() => setActiveCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{activeCard.title}</DialogTitle>
              <DialogDescription>
                この成果物に対してどのアクションを実行しますか？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center">
              <Button onClick={handleDisplay}>表示</Button>
              <Button variant="destructive" onClick={() => handleDelete(activeCard.id)}>削除</Button>
              <Button variant="outline" onClick={() => setActiveCard(null)}>キャンセル</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* FAB and Submission Form Modal */}
      <Dialog open={isSubmissionFormOpen} onOpenChange={setIsSubmissionFormOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-full shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>新規成果物を投稿</DialogTitle>
            <DialogDescription>
              タイトル、サブタイトル、説明、そしてビルドデータを入力してください。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">タイトル</label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="subtitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">サブタイトル</label>
              <Input id="subtitle" value={formSubtitle} onChange={(e) => setFormSubtitle(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">説明</label>
              <Textarea id="description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
            </div>
            <div>
              <label htmlFor="file" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ビルドデータ (zip, etc.)</label>
              <Input id="file" type="file" onChange={handleFileChange} required />
            </div>
            <div>
              <label htmlFor="thumbnail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">サムネイル画像</label>
              <Input id="thumbnail" type="file" accept="image/*" onChange={handleThumbnailChange} required />
            </div>
            {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "投稿中..." : "投稿"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <>
      <PageQuickNav />
      {loadingSubmissions ? (
        <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(180deg, #0f2027 0%, #203a43 40%, #2c5364 100%)" }}>
          <p className="text-white text-lg">読み込み中...</p>
        </div>
      ) : mainContent}
    </>
  )
}

export default Submission