import { NavLink } from "react-router-dom"

export const About: React.FC = () => {
  return (
    <div className="container py-12">
      {/* 見出し */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">研究室概要</h1>
      <h2 className="text-2xl font-semibold mt-8">スマートICTソリューション研究室（設立：2023年）</h2>

      {/* 概要文 */}
      <p className="mt-6 text-muted-foreground leading-relaxed">
        スマートICTソリューション研究室では、<span className="font-medium">「社会で使える人材の育成」</span>を目標に、
        最新のICT（情報通信技術）を活用して、より賢く便利な社会をつくる方法を探っています。
      </p>

      <h3 className="text-xl font-semibold mt-8">◆ 研究テーマ</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        IoT・AI・CPS・デジタルツイン・XR・メタバース・Web3など、
        次世代社会「Society 5.0」で注目される幅広い分野を対象としています。
        これらを組み合わせて、産業や日常生活に役立つ新しいシステムや体験を生み出します。
      </p>

      <ul className="list-disc list-inside mt-4 text-muted-foreground space-y-1">
        <li>IoTやAIを活用したスマート社会システムの設計</li>
        <li>デジタルツインやメタバースを用いた実世界との融合研究</li>
        <li>顧客行動モデルを活用したUXデザイン実習法の開発</li>
      </ul>

      <h3 className="text-xl font-semibold mt-8">◆ 教育方針</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        研究室では、<span className="font-medium">PBL（Project Based Learning）型実習</span>を通して
        「自ら考え、行動し、課題を解決できる力」を育てます。
        実際に手を動かしてシステムを作り、試行錯誤を繰り返すことで、技術と創造力を磨きます。
      </p>

      <p className="mt-3 text-muted-foreground leading-relaxed">
        また、他大学や学会とのコラボ活動、発表会などにも積極的に参加し、
        幅広い分野・年齢層の人々との交流を通じて視野を広げる機会を提供しています。
      </p>

      <h3 className="text-xl font-semibold mt-8">◆ 研究室の雰囲気</h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">
        明るくアットホームな雰囲気が特徴です。学生同士の仲も良く、
        夏合宿やクリスマス会、たこ焼きパーティーなどのイベントも開催しています。
        「研究を楽しむ」「ものづくりを楽しむ」環境の中で、自分の可能性を伸ばしていけます。
      </p>

      {/* 研究内容ページへのリンクボタン */}
      <NavLink
        to="/research"
        className="inline-block mt-8 bg-orange-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-orange-700 transition-colors"
      >
        研究内容はこちら
      </NavLink>

      {/* 教員紹介 */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold">教員紹介</h2>
        <div className="mt-4">
          <p className="font-medium text-lg">秋山 康智（Akiyama Koji）</p>
          <p className="text-muted-foreground mt-2">
            専門分野：IoTシステム、組込みソフトウェア、情報ネットワーク
          </p>
          <p className="text-muted-foreground mt-2">
            「自ら考え、試行錯誤を重ねながら新しい価値を創造できるエンジニアを育成します。」
          </p>
        </div>
      </section>

      {/* アクセス */}
      <section className="mt-16">
        <h2 className="text-2xl font-semibold mb-6">アクセス・所在地</h2>
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* 左：住所 */}
          <div className="flex-1 text-muted-foreground">
            <p className="text-lg font-medium mb-2">〒350-0394</p>
            <p>埼玉県比企郡鳩山町石坂</p>
            <p>東京電機大学 鳩山キャンパス 2号館2階 2212B室</p>
            <p className="mt-4 text-sm text-gray-500">
              Tokyodenki University Hatoyama Campus, Ishizaka, Hatoyama-machi, Hiki-gun, Saitama 350-0394, Japan
            </p>
          </div>

          {/* 右：Googleマップ */}
          <div className="flex-1 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2244.843497751896!2d139.3729168959935!3d35.985992902090985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018d58d0163c699%3A0x4bb44102891b914b!2z5p2x5Lqs6Zu75qmf5aSn5a2mIOWfvOeOiemzqeWxseOCreODo-ODs-ODkeOCuQ!5e0!3m2!1sja!2sjp!4v1762312454302!5m2!1sja!2sjp"
              width="100%"
              height="400"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="border-0 w-full h-[400px]"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
