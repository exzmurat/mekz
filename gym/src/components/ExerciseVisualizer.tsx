import React, { useState, useEffect } from "react";
import { Play, Pause, RefreshCw, Eye, Sparkles, CheckCircle2, Info, ArrowUp, Zap, Activity } from "lucide-react";

interface ExerciseVisualizerProps {
  exerciseId: string;
  name: string;
  category: "sırt" | "göğüs" | "ön kol" | "arka kol" | "karın göbek" | "bacak";
}

interface BiomechanicsDetail {
  primaryTarget: string;
  secondaryTarget: string;
  focusMuscle: string;
  setupCues: string[];
  executionSteps: string[];
  commonMistake: string;
  leverageTip: string;
  tensionType: "Aşama Başı Ağır" | "Zirvede Sıkışma" | "Esneme Ağırlıklı" | "Sürekli Gerilim";
}

export default function ExerciseVisualizer({ exerciseId, name, category }: ExerciseVisualizerProps) {
  const [activeTab, setActiveTab] = useState<"interactive" | "compare" | "anatomy">("interactive");
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState<"start" | "end">("start");

  // Auto animation loop to simulate the movement
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPhase((prev) => (prev === "start" ? "end" : "start"));
    }, 1600);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Biomechanical data & instructions for all 20 specific exercises
  const getExerciseDetails = (id: string): BiomechanicsDetail => {
    const detailsMap: Record<string, BiomechanicsDetail> = {
      // SIRT
      s1: {
        primaryTarget: "Gluteus Maximus & Erector Spinae (Kalça & Bel)",
        secondaryTarget: "Hamstrings, Üst Sırt, Trapezler",
        focusMuscle: "Arka Zincir & Bel Gücü",
        tensionType: "Aşama Başı Ağır",
        setupCues: ["Barı ayak ortasına konumlandır.", "Kaval kemiklerinizi barla temas ettirin.", "Göğsü kaldırıp omuzları geriye kilitleyin."],
        executionSteps: [
          "Bacaklarınızla yeri aşağı doğru iterek kaldırışı başlatın.",
          "Barın dikey bir hat çizerek kaval ve uyluk hattınıza yakın yükselmesini sağlayın.",
          "Tepe noktasında omurgayı geriye bükmeden kalçayı kilitleyin (lockout).",
          "Barı kontrollü şekilde zemine geri bırakıp yeni tekrar için pozisyon alın."
        ],
        commonMistake: "Sırtın bükülmesi (yuvarlak kedi sırtı), yükün omurgaya binmesi.",
        leverageTip: "Topuklarınızla yeri parçalamak ister gibi itin, barla aranızda boşluk kalmasın."
      },
      s2: {
        primaryTarget: "Latissimus Dorsi (Geniş Kanat Kasları)",
        secondaryTarget: "Biceps, Trapez, Arka Omuz",
        focusMuscle: "Üst Dış Kanat Eni",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Omuz genişliğinden biraz daha geniş bir pronasyon (avuçlar karşıya) tutuş yapın.", "Bacak destek aparatını uyluğunuza sabitleyin."],
        executionSteps: [
          "Omuzlarınızı aşağı ve geriye doğru bastırın (depresyon).",
          "Dirseklerinizi arka ceplerinize sokar gibi barı köprücük kemiğinize doğru çekin.",
          "Göğsünüzü yukarı kaldırın, tepe noktasında kürek kemiklerini iyice sıkıştırın.",
          "Ağırlığı direnç göstererek, lats kaslarınızı tamamen uzatana kadar yavaşça salın."
        ],
        commonMistake: "Ağırlığı geriye çok fazla yatarak çekip momentum kullanmak.",
        leverageTip: "Barı elinizle değil dirseklerinizle çekiyor gibi hayal edin; bicep katılımı azalır."
      },
      s3: {
        primaryTarget: "Latissimus Dorsi & Rhomboids (Orta Sırt)",
        secondaryTarget: "Arka Omuz, Biceps, Erector Spinae",
        focusMuscle: "Sırt Kalınlığı & Detayı",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Barı diz üstü hizasından hafifçe eğilerek kavrayın.", "Gövdeniz yere yaklaşık 45 derece eğimli olsun.", "Başınızı omurga hattında nötr tutun."],
        executionSteps: [
          "Karın kaslarınızı kilitleyerek omurga açınızı sabitleyin.",
          "Barı alt karnınıza doğru dirseklerinizi gövdenize yakın tutarak çekin.",
          "Tepe noktada kürek kemiklerinizi ortada birleştirip 1 saniye sıkıştırın.",
          "Kolları tamamen açarak sırtınızı başlangıç konumuna kadar esnetin."
        ],
        commonMistake: "Hareketi yaparken aşağı yukarı sürekli yaylanarak dikey momentum üretmek.",
        leverageTip: "Omurga açınız hareket boyu harici oynamasın, sırtın açılı yapısını koruyun."
      },
      s4: {
        primaryTarget: "Latissimus Dorsi & Teres Major (Kanat & Alt Kanat)",
        secondaryTarget: "Biceps, Ön kol, Karın kasları",
        focusMuscle: "Kendi Vücut Ağırlığıyla Genişleme",
        tensionType: "Esneme Ağırlıklı",
        setupCues: ["Bara asılın, omuz eklemlerini serbest bırakmayın (aktif omuz).", "Karın kaslarınızı ve kalçanızı kasılı tutun."],
        executionSteps: [
          "Kürek kemiklerinizi birleştirerek kendinizi yukarı çekmeye başlayın.",
          "Çenenizi barın üzerine çıkarırken göğsünüz dikey barda temas etmeye yaklaşsın.",
          "Zirve noktada 1 saniye duraklayın.",
          "Yavaşça kontrollü iniş (negatif faz) yaparak dirseklerinizi açın."
        ],
        commonMistake: "Ayakları savurarak (Kipping) momentumla kendinizi yukarı fırlatmak.",
        leverageTip: "Askıda kalıp dirsek açısını sıfırlayıp omuzları kilitleyerek negatifine direnin."
      },

      // GÖĞÜS
      g1: {
        primaryTarget: "Pectoralis Major (Orta & Alt Göğüs)",
        secondaryTarget: "Triceps, Ön Omuz (Anterior Deltoid)",
        focusMuscle: "Genel Göğüs Hacmi",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Gözleriniz barın tam dikey iz düşümünde olacak şekilde uzanın.", "Ayaklarınızı yere sıkıca basın, sırtınızda hafif ark oluşturun.", "Kürek kemiklerini sehpaya kilitleyin."],
        executionSteps: [
          "Barı kontrollü bir hızla göğüs kemiğinize (sternum) doğru indirin.",
          "Dirseklerinizi gövdenize 45-60 derece açıda tutun (kesinlikle 90 derece yana açmayın).",
          "Göğsünüze dokunduğunuz anda barı yukarıya doğru patlayıcı bir güçle itin.",
          "En tepe noktada göğüs kaslarını tamamen sıkıştırın, dirsekleri yumuşak kilitleyin."
        ],
        commonMistake: "Barı göğüs kemiğinden yay gibi zıplatmak ve kürek kemiklerini sehpadan ayırmak.",
        leverageTip: "Barı elinizle ortadan bükmek istiyormuş gibi dışa doğru tork oluşturarak sıkın."
      },
      g2: {
        primaryTarget: "Pectoralis Major Clavicular Head (Üst Göğüs)",
        secondaryTarget: "Ön Omuz, Triceps, Serratus",
        focusMuscle: "Üst Göğüs Dolgunluğu",
        tensionType: "Esneme Ağırlıklı",
        setupCues: ["Sehpa açısını 30 veya 45 dereceye ayarlayın.", "Dambılları dizlerinizin üzerine yerleştirin ve geriye uzanırken göğse alın."],
        executionSteps: [
          "Dambılları dirsekleriniz omuz hattının hafifçe önünde olacak şekilde konumlandırın.",
          "Ağırlıkları dikey hat boyu yukarı presleyin, tepe noktada hafifçe yaklaştırın.",
          "Aşağı inişte dambılları göğüs liflerinizde tam bir esneme hissedene kadar indirin.",
          "Negatif fazı yavaş en az 2 saniye sürdürerek kontrolü elden bırakmayın."
        ],
        commonMistake: "Sehpa açısını 45 dereceden yüksek yapıp yükü tamamen omuzlara bindirmek.",
        leverageTip: "Pres yaparken üst kol kemiklerinizi göğüs kemiğinizin ortasına doğru preslemeye odaklanın."
      },
      g3: {
        primaryTarget: "Pectoralis Major Lateral Fibers (Dış & İç Göğüs)",
        secondaryTarget: "Anterior Deltoid, Ön Kol",
        focusMuscle: "Yanal Göğüs Esnemesi",
        tensionType: "Esneme Ağırlıklı",
        setupCues: ["Sehpaya uzanın, dambılları avuç içleriniz birbirine bakacak şekilde kaldırın.", "Dirseklerinizi hafif bükülü (akrobat kemeri açısı) sabitleyin."],
        executionSteps: [
          "Dambılları göğüs çizgisi boyu kollarınızı yana açarak yarım daire çizer gibi indirin.",
          "Dirsek açınızı hareket boyunca asla değiştirmeyin (hareket prese dönmemeli).",
          "Göğüs liflerinizin son raddesine kadar esnediği yerde yarım saniye bekleyin.",
          "Büyük bir ağaca sarılır gibi dambılları yukarıda birleştirin, zirvede kası sıkın."
        ],
        commonMistake: "Dirsekleri çok fazla büküp hareketi dambıl presine dönüştürmek.",
        leverageTip: "Kollarınızı çok düz açıp omuz eklemine baskı yapmayın; hafif dirsek bükümü şarttır."
      },
      g4: {
        primaryTarget: "Pectoralis Major & Core (Göğüs & Çekirdek)",
        secondaryTarget: "Triceps, Ön Omuz, Karın",
        focusMuscle: "Vücut Mukavemeti & Push Sinerjisi",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Eller omuz genişliğinde yere koyulsun.", "Vücudunuz tepeden tırnağa kadar dümdüz bir tahta çizgisi gibi kilitlensin.", "Başınızı karşıya değil yere doğru hizalayın."],
        executionSteps: [
          "Gövdenizi yere yaklaştırırken dirseklerinizi geriye 45 derece açıyla yönlendirin.",
          "Göğsünüz yere 2 cm kalana kadar kontrollü şekilde alçalın.",
          "Yeri avuçlarınızla aşağı iterek başlangıç pozisyonuna yükselin.",
          "Tepe noktada sırtınızı üst kemikten yukarı doğru hafifçe kabartıp serratusu uyarın."
        ],
        commonMistake: "Karnın aşağı sarkması, belin çökmesi ve başın öne bükülmesi.",
        leverageTip: "Ayak parmaklarınızı ve kalçanızı sıkarak tüm gövdeyi tek parça blok halinde tutun."
      },

      // ÖN KOL
      o1: {
        primaryTarget: "Biceps Brachii Inner & Outer Head (Pazı Kasları)",
        secondaryTarget: "Brachialis, Ön Kol (Brachioradialis)",
        focusMuscle: "Biceps Tepe Noktası & Hacim",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Barı omuz genişliğinde supinasyon (avuç içi göğe) tutuşuyla kavrayın.", "Dirseklerinizi gövdenizin tam yanına sabitleyin."],
        executionSteps: [
          "Sadece dirsek eklemini bükerek barı yarım daire şeklinde yukarı doğru kaldırın.",
          "Yukarı kaldırış esnasında gövdenizi arkaya doğru sallamaktan kaçının.",
          "Tepe noktada bicepslerinizi en üst seviyede kasın.",
          "Barı en az 2 saniye sürecek şekilde yavaşça indirin, bicepste uzamayı hissedin."
        ],
        commonMistake: "Dirsekleri öne doğru aşırı fırlatıp yükü ön omuz kaslarına bindirmek.",
        leverageTip: "Sırtınızı duvara yaslayarak dirsek konumunu sabitleyebilir, hareketi izole edebilirsiniz."
      },
      o2: {
        primaryTarget: "Brachioradialis & Brachialis (Dış Ön Kol & Derin Biceps)",
        secondaryTarget: "Biceps Brachii, Parmak fleksörleri",
        focusMuscle: "Ön Kol Kalınlığı & Tutuş",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Dambılları avuç içleriniz birbirine dönük (nötr tutuş) olacak şekilde tutun.", "Dik durun, omuzları geriye kilitleyin."],
        executionSteps: [
          "Dambılı baş parmağınız yukarı bakacak şekilde dirseğinizi bükerek kaldırın.",
          "Bileğinizi sağa sola bükmeyerek düz çizgide çekiç gibi vuruş yapın.",
          "Üst noktada ön kol ve bicepsin kesişim bölgesindeki gerilimi hissedin.",
          "Aşırı acele etmeden ağırlığı aşağı yana doğru sabitleyin."
        ],
        commonMistake: "Bileği hareket ettirerek dambılı sallamak.",
        leverageTip: "Brakioradialis kasını maksimum seviye kıkırdatmak için dışa rotasyon yapmadan düz hareket ettirin."
      },
      o3: {
        primaryTarget: "Biceps Brachii Short Head (Kısa Baş & Biceps Pik)",
        secondaryTarget: "Brachialis, Ön kol fleksörleri",
        focusMuscle: "İzole Pazı Yüksekliği",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Preacher sehpasına dirseklerinizi ve kollarınızı tam yaslayın.", "Koltuk altınız sehpanın üst kısmına tam otursun."],
        executionSteps: [
          "Barı kontrollü şekilde dirsekleriniz tamamen açılmaya yakın olana kadar indirin.",
          "Alt noktadan momentum kullanmadan biceps gücüyle barı yukarı kıvırın.",
          "Üst noktada (sehpa açısı dikey olduğundan) yer çekimi azaldığı için tepe noktada kası ekstra sıkın.",
          "Barı kademeli olarak serbest bırakarak aşağı salın."
        ],
        commonMistake: "Aşağı inişte dirseği tamamen kitleyip aşırı gerilimde biceps tendonunu sakatlamak.",
        leverageTip: "Kademeli inişte son 5 derecelik açıda kontrollü yavaşlayın, asla ağırlığı bırakmayın."
      },
      o4: {
        primaryTarget: "Forearm Flexors / Extensors (Bilek & Ön Kol Lifleri)",
        secondaryTarget: "Tutuş gücü, parmak tendonları",
        focusMuscle: "Guclu Tutuş & Bilek Kalınlığı",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Ön kollarınızı sehpaya veya uyluklarınıza sabitleyin, bilekler boşlukta kalsın.", "Barı parmak uçlarınıza kadar kaydırarak gevşek kavrayın."],
        executionSteps: [
          "Barı önce parmak uçlarınızdan avucunuza doğru yuvarlayarak toplayın.",
          "Ardından bileğinizi yukarı bükerek barı en üst noktaya kadar kıvırın.",
          "Zirvede ön kollarınızda yanmayı hissedene dek kasın.",
          "Barı tekrar parmak uçlarına kadar yavaşça geri salın."
        ],
        commonMistake: "Çok yüksek ağırlık kullanıp yarım tekrarlar yapmak, ekleme gereksiz baskı uygulamak.",
        leverageTip: "Yüksek tekrarlarda (15-20 tekrar) yanma hissi odaklı çalışmak ön kolda çok daha verimlidir."
      },

      // ARKA KOL
      a1: {
        primaryTarget: "Triceps Brachii Long Head (Arka Kol Uzun Baş)",
        secondaryTarget: "Triceps Lateral & Medial Head, Ön Kol",
        focusMuscle: "Arka Kol Kütlesi",
        tensionType: "Aşama Başı Ağır",
        setupCues: ["Düz sehpaya uzanın, EZ Barı alnınızın hizasında dikey tutun.", "Üst kolunuzu yere dik açıdan hafifçe geriye (başınıza doğru yatarak) eğin."],
        executionSteps: [
          "Dirseklerinizi içeri doğru sabitleyin (iki yana açılmasına izin vermeyin).",
          "Barı sadece dirseklerinizi bükerek kafatası kemiğinizin (alnınızın) üzerine indirin.",
          "Alnınıza yaklaşan ağırlığı triceps kaslarınızı kullanarak yukarıya patlayıcı şekilde presleyin.",
          "Tepe noktada dirsekleri tamamen kilitleyip tricepsleri arkaya doğru kasın."
        ],
        commonMistake: "Dirsekleri iki yana açarak yükü omuzlara ve dirsek tendonuna kaydırmak.",
        leverageTip: "Üst kolları sehpaya hafif eğimli olacak şekilde geriye sabitlemek tricepste sürekli gerilimi korur."
      },
      a2: {
        primaryTarget: "Triceps Brachii Lateral Head (Dış Triceps At Nalı)",
        secondaryTarget: "Triceps Medial Head, Ön kol",
        focusMuscle: "Dıştan At Nalı Görünümü",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Kablolu istasyon katsayısını ayarlayın, avuçlar yere bakacak şekilde halatı/barı kavrayın.", "Dirseklerinizi vücudunuzun yanına sabitleyin, göğsü açın."],
        executionSteps: [
          "Üst gövdenizi sabitleyip, kabloyu sadece dirsek eklemi yardımıyla aşağıya doğru presleyin.",
          "En alt noktada halat kullanıyorsanız ellerinizi iki yana doğru açarak kasılma derecesini artırın.",
          "Tricepsleri en dipte 1 saniye kilitleyip sıkıştırın.",
          "Dirseklerinizi 90 derece bükene kadar ağırlığı yavaşça geri salın."
        ],
        commonMistake: "Omuzları öne doğru yuvarlayıp bastırırken göğüs ve ön omuz kaslarından yardım almak.",
        leverageTip: "Gövdenizi hafifçe öne eğip sadece dirsek ekleminizi menteşe gibi çalıştırın."
      },
      a3: {
        primaryTarget: "Triceps Brachii Long Head (Derin Esneme)",
        secondaryTarget: "Ön kol, karın stabilizasyonu",
        focusMuscle: "Yüksek Esneme Altında Triceps Gelişimi",
        tensionType: "Esneme Ağırlıklı",
        setupCues: ["Dik oturun veya ayakta durun, dambılı iki elinizle baş kemiğinde dikey tutun.", "Dirseklerinizi kulaklarınıza yakın sabitleyin."],
        executionSteps: [
          "Dambılı başınızın arkasına ense çukuruna doğru derinlemesine indirin.",
          "En alt seviyede tricepslerinizin maksimum uzamasını hissedin.",
          "Belinizi bükmeden veya göğsü öne fırlatmadan ağırlığı tavana doğru yukarı itin.",
          "Kolları yukarıda tamamen kilitleyerek tepe kasılmayı yakalayın."
        ],
        commonMistake: "Dirseklerin dışa aşırı açılması ve belin geriye doğru fazla bükülmesi.",
        leverageTip: "Core bölgesini sıkı tutarak belinizi emniyete alın, dirseklerin öne bakmasını sağlayın."
      },
      a4: {
        primaryTarget: "Triceps Brachii & Lower Chest (Arka Kol & Alt Göğüs)",
        secondaryTarget: "Ön Omuz, core kasları",
        focusMuscle: "Kendi Vücut Ağırlığıyla İtiş Gücü",
        tensionType: "Aşama Başı Ağır",
        setupCues: ["Dip barlarını kavrayın, kendinizi yukarı kaldırıp kollarınızı kilitleyin.", "Gövdenizi olabildiğince dik tutun (öne eğilmek göğsü uyarır)."],
        executionSteps: [
          "Dirseklerinizi geriye doğru bükerek gövdenizi aşağı indirmeye başlayın.",
          "Dirsek açınız 90 dereceye ulaşana kadar derinleşin.",
          "Triceps kaslarınızın gücünü kullanarak kendinizi yukarı doğru itin.",
          "Üstte kollarınızı tamamen kilitleyip tricepsleri sıkıştırın."
        ],
        commonMistake: "Çok hızlı çöküş yaparak omuz manşet eklemlerini zorlamak.",
        leverageTip: "Aşağı inişi 3 saniye yavaş yapın, yukarı çıkışta dirseklerinizi içeri bükülü tutun."
      },

      // KARIN GÖBEK
      k1: {
        primaryTarget: "Lower Abdominals (Alt Karın & Rectus Abdominis)",
        secondaryTarget: "İlios psoas (Kalça Fleksörleri), Tutuş Gücü",
        focusMuscle: "Alt Karın Keskinliği",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Barfiks barına ellerinizle asılın, omuzları kulaklardan uzak tutun.", "Gövdenizin sallanmasını durdurun."],
        executionSteps: [
          "Sadece kalçanızı ve bacaklarınızı karın gücüyle yukarı doğru kaldırın.",
          "Bacaklarınızı yere paralel veya daha yukarı seviyeye gelene kadar bükmeden kaldırın.",
          "En üst noktada kalçanızı hafifçe öne yuvarlayarak omurgayı büküp karın kasını tam sıkıştırın.",
          "Bacakları yavaşça başlangıç pozisyonuna indirirken karın kontrolünü elden bırakıp salmayın."
        ],
        commonMistake: "Gövdeyi çılgınca sallayarak momentumla bacakları yukarı fırlatmak.",
        leverageTip: "Sallanmayı önlemek için askıda kalırken sırt kanat kaslarınızı da aktif kitleyin."
      },
      k2: {
        primaryTarget: "Transversus Abdominis & Rectus Abdominis (Derin Merkez)",
        secondaryTarget: "Gluteus, Omuzlar, Bel desteği",
        focusMuscle: "Korselenme & Çekirdek Gücü",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Dirseklerinizi omuzların tam altına yerleştirerek yüzüstü köprü kurun.", "Ayak parmak uçlarınızda yükselin, kalçayı kitleyin."],
        executionSteps: [
          "Gövdenizi başınızdan topuklarınıza kadar tek bir düz çizgi haline getirin.",
          "Karnınızı içeri doğru vakumlayarak (abdominal bracing) tüm gücünüzle sıkın.",
          "Kalçanızı sıkarak belinizde oluşabilecek içe bükülmeleri (lordoz) sıfırlayın.",
          "Nefesinizi küçük ve kontrollü şekilde vererek bu statik duruşu koruyun."
        ],
        commonMistake: "Kalçanın gökyüzüne kalkması ya da karnın yere sarkıp beli ezmesi.",
        leverageTip: "Dirseklerinizle ayaklarınızı birbirine doğru çekmek istiyormuş gibi kasılma kuvveti oluşturun."
      },
      k3: {
        primaryTarget: "Upper Abdominals (Üst Karın Lifleri)",
        secondaryTarget: "Oblikler, transversus",
        focusMuscle: "Karın Kasları Paketi (Sixpack)",
        tensionType: "Zirvede Sıkışma",
        setupCues: ["Yere sırtüstü uzanın, dizlerinizi 90 derece bükün, ayakları yere basın.", "Ellerinizi şakaklara koyun (enseye değil)."],
        executionSteps: [
          "Karın kaslarınızı kasarak sadece göğüs kafesinizi leğen kemiğinize yaklaştırın.",
          "Belinizin alt kısmını tamamen yerde sabit tutarak sadece üst sırtı yukarı kaldırın.",
          "Zirve noktada nefesinizi tamamen boşaltarak karın kaslarınızı sımsıkı sıkın.",
          "Sırtı yavaşça yere geri bırakarak kontrollü esneme yapın."
        ],
        commonMistake: "Ellerle kafayı öne doğru çekerek boyun eklemini zorlamak, beli yerden ayırmak.",
        leverageTip: "Bütün hareketi kaburgaları içeri bükmek olarak düşünün, sırtınızı dümdüz kaldırmayın."
      },

      // BACAK
      b1: {
        primaryTarget: "Quadriceps & Gluteus Maximus (Ön Bacak & Kalça)",
        secondaryTarget: "Hamstrings, Core, Baldır, Erector Spinae",
        focusMuscle: "Tüm Vücut Gücü & Bacak Yoğunluğu",
        tensionType: "Aşama Başı Ağır",
        setupCues: ["Barı üst sırt trapezlerinize yerleştirip sıkıca kavrayın.", "Ayaklarınızı omuz genişliğinde açın, parmak uçlarını hafif dışa çevirin.", "Karın boşluğunuza nefes kilitleyin."],
        executionSteps: [
          "Sanki arkanızdaki görünmez alçak tabureye oturacak gibi kalçanızı geriye verin.",
          "Dizlerinizi ayak parmak hizasında dışa doğru bükerek çömelin.",
          "Uyluk kemikleriniz yere paralel seviyenin (paralel altı ideal) altına gelene dek çökün.",
          "Topuklarınızla yeri güçlüce aşağı iterek göğsünüzü kaldırmış halde ayağa fırlayın."
        ],
        commonMistake: "Dizlerin içeriye doğru bükülmesi (valgus) ve topukların yerden kalkması.",
        leverageTip: "Dizleri dışarı doğru itmeye odaklanarak kalça stabilizasyonunu artırın."
      },
      b2: {
        primaryTarget: "Hamstrings & Gluteus Maximus (Arka Bacak & Kalça)",
        secondaryTarget: "Erector Spinae (Bel), Adductor, Ön Kol",
        focusMuscle: "Arka Zincir Esnekliği & Kalınlık",
        tensionType: "Esneme Ağırlıklı",
        setupCues: ["Barı ayakta tutarak omuz genişliğinde kavrayın, dizlerinizi çok hafif (5 derece) büküp sabitleyin.", "Göğsünüzü dik tutun."],
        executionSteps: [
          "Barı uyluk kemiklerinizden aşağı kaydırırken kalçanızı olabildiğince geriye itin.",
          "Sırtınızın dikey hattını kesinlikle bozmadan (dümdüz sırt) barı kaval kemiği ortasına indirin.",
          "Arka bacaklarınızda (hamstrings) yoğun bir esneme hissettiğiniz alt sınırda kalın.",
          "Kalçanızı öne doğru güçlüce iterek gövdeyi kaldırın, tepede kalçayı kilitleyin."
        ],
        commonMistake: "Dizleri tamamen düz kilitlemek ya da sırtı yuvarlayarak aşağı inmeye çalışmak.",
        leverageTip: "Hareketi barı indirmek olarak değil, kalçayı olabildiğince geriye uzatmak olarak kurgulayın."
      },
      b3: {
        primaryTarget: "Quadriceps Femoris (Ön Bacak Dört Başlı Kaslar)",
        secondaryTarget: "Gluteus, Hamstrings",
        focusMuscle: "Diz Eklem Saf Kuvveti",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Makine koltuğuna belinizi tamamen sabitleyin, boşluk kalmasın.", "Ayaklarınızı platforma omuz genişliğinde yerleştirin."],
        executionSteps: [
          "Platformun emniyetini kapatın, ağırlığı dizlerinizi kendinize çekerek yavaşça indirin.",
          "Dizlerinizin göğsünüze çarpmayacağı en derin noktaya dek dizleri bükün (aktif esneme).",
          "Topuklarınızı kullanarak platformu yukarıya güçlü şekilde itin.",
          "Tepe noktada diz kapağı eklemlerini kesinlikle sert şekilde kilitlemeyin (hafif bükülü kalsın)."
        ],
        commonMistake: "Eklemleri korumak için tepe noktada dizleri aniden kilitlemek, kalçanın sehpadan ayrılması.",
        leverageTip: "Dizlerinizi tepe noktada tam kitlemeyerek gerilimin sürekli kasta kalmasını sağlarsınız."
      },
      b4: {
        primaryTarget: "Quadriceps & Gluteus (Ön Bacak & Kalça Sinerji)",
        secondaryTarget: "Hamstrings, Baldır, Çekirdek denge",
        focusMuscle: "Tek Bacak Denge & Kuvvet",
        tensionType: "Sürekli Gerilim",
        setupCues: ["Dambılları ellerinize alın, vücudunuz dik konumda olsun.", "Bacaklarınızı birleştirin, omuzları geriye alın."],
        executionSteps: [
          "Büyük bir adımla öne doğru adım atın.",
          "Arkadaki diziniz yere 1-2 cm kalana kadar dikey doğrultuda kontrollü şekilde çökün.",
          "Öndeki bacağın üst kısmı yere tam paralel seviyeye ulaşsın.",
          "Ön ayağınızı yere bastırarak geriye itin ve başlangıç konumuna geri yükselin."
        ],
        commonMistake: "Öndeki dizin yana doğru sallanması ve dengenin kaybolması.",
        leverageTip: "Adımınızı tren rayında yürür gibi hafif yanal bir açıklıkla atmak dengenizi kolaylaştırır."
      }
    };

    return detailsMap[id] || {
      primaryTarget: "Hedef Kas Grubu",
      secondaryTarget: "Destekleyici Kaslar",
      focusMuscle: "Ana Fokus",
      tensionType: "Sürekli Gerilim",
      setupCues: ["Eklemleri emniyete al.", "Doğru duruş pozisyonu belirle."],
      executionSteps: ["Hareketi kontrollü başlat.", "Zirvede kasılmayı gerçekleştir.", "Negatif fazı yavaşça salıp esnet."],
      commonMistake: "Terkniği bozarak momentum veya hileli tekrar arayışına girmek.",
      leverageTip: "Küçük ağırlıklarla zihin-kas bağlantısı kurun."
    };
  };

  const currentDetails = getExerciseDetails(exerciseId);

  // Custom vector and lines for each of the 23 exercises beautifully drawn dynamically
  const renderInteractiveDraftSVG = (currPhase: "start" | "end", sizeClass = "w-full h-44") => {
    const isStart = currPhase === "start";

    // Style colors
    const humanStyle = "stroke-neutral-200 fill-neutral-800/20 stroke-[3.5] stroke-linecap-round";
    const highlightStyle = "stroke-amber-500 fill-none stroke-[5] stroke-linecap-round filter drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]";
    const forceArrow = "stroke-emerald-400 fill-emerald-400 stroke-[2] marker-end";
    const floorLine = "stroke-neutral-800 stroke-[2.5]";
    const equipmentStyle = "stroke-neutral-400 fill-neutral-700 stroke-[3]";
    const weightsStyle = "fill-neutral-600 stroke-neutral-400 stroke-[1.5]";

    return (
      <svg viewBox="0 0 200 160" className={`${sizeClass} select-none overflow-visible`}>
        {/* Floor Line */}
        <line x1="15" y1="135" x2="185" y2="135" className={floorLine} />

        {/* Dynamic customized illustration for each exercise ID */}
        {(() => {
          switch (exerciseId) {
            // --- SIRT ---
            case "s1": // Deadlift
              return isStart ? (
                // Squatted pulling start pos
                <>
                  <path d="M 60 135 L 75 110 L 60 85 L 110 70" fill="none" className={humanStyle} /> {/* Legs to back */}
                  <line x1="110" y1="70" x2="80" y2="105" className={equipmentStyle} /> {/* Arms straight down to bar */}
                  <circle cx="115" cy="62" r="8" className={humanStyle} /> {/* Head */}
                  {/* Highlight posterior chain & erectors */}
                  <path d="M 60 85 L 110 70" fill="none" className={highlightStyle} />
                  {/* Barbell low */}
                  <circle cx="80" cy="110" r="4" className="fill-amber-500" />
                  <rect x="76" y="94" width="8" height="32" rx="2" className={weightsStyle} />
                  {/* Force arrow up */}
                  <path d="M 80 90 L 80 65" fill="none" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrow)" />
                </>
              ) : (
                // Standing lock out pos
                <>
                  <path d="M 80 135 L 80 100 L 82 55" fill="none" className={humanStyle} /> {/* Legs & torso erect */}
                  <line x1="82" y1="55" x2="80" y2="85" className={equipmentStyle} /> {/* Arms down holding bar */}
                  <circle cx="82" cy="45" r="8" className={humanStyle} /> {/* Head */}
                  {/* Highlight lats and lower back */}
                  <path d="M 80 100 L 82 55" fill="none" className={highlightStyle} />
                  {/* Barbell at hip level */}
                  <circle cx="80" cy="85" r="4" className="fill-amber-500" />
                  <rect x="76" y="69" width="8" height="32" rx="2" className={weightsStyle} />
                </>
              );

            case "s2": // Lat Pulldown
              return isStart ? (
                <>
                  {/* Seat bench */}
                  <line x1="60" y1="105" x2="110" y2="105" className="stroke-neutral-700 stroke-[4]" />
                  <path d="M 80 135 L 80 105 L 80 70" fill="none" className={humanStyle} /> {/* Spine */}
                  <path d="M 80 70 L 60 40" fill="none" className={humanStyle} /> {/* Left arm up */}
                  <path d="M 80 70 L 100 40" fill="none" className={humanStyle} /> {/* Right arm up */}
                  <circle cx="80" cy="60" r="7" className={humanStyle} /> {/* Head */}
                  {/* Cable Pulley */}
                  <line x1="80" y1="20" x2="80" y2="40" className="stroke-neutral-500 stroke-[1] stroke-dasharray-[2]" />
                  <line x1="50" y1="40" x2="110" y2="40" className={equipmentStyle} /> {/* Bar high */}
                </>
              ) : (
                <>
                  <line x1="60" y1="105" x2="110" y2="105" className="stroke-neutral-700 stroke-[4]" />
                  <path d="M 80 135 L 80 105 L 80 70" fill="none" className={humanStyle} /> {/* Spine */}
                  <path d="M 80 70 L 62 74 L 52 68" fill="none" className={humanStyle} /> {/* Left arm down */}
                  <path d="M 80 70 L 98 74 L 108 68" fill="none" className={humanStyle} /> {/* Right arm down */}
                  <circle cx="80" cy="60" r="7" className={humanStyle} /> {/* Head */}
                  {/* Highlight Lats contract */}
                  <path d="M 80 75 C 65 78, 65 95, 80 95" fill="none" className={highlightStyle} />
                  <path d="M 80 75 C 95 78, 95 95, 80 95" fill="none" className={highlightStyle} />
                  {/* Cable Bar down to collarbone */}
                  <line x1="80" y1="20" x2="80" y2="68" className="stroke-neutral-500 stroke-[1]" />
                  <line x1="50" y1="68" x2="110" y2="68" className="stroke-amber-500 stroke-[3]" />
                </>
              );

            case "s3": // Barbell Row
              return isStart ? (
                <>
                  <path d="M 50 135 L 68 120 L 60 92 L 102 85" fill="none" className={humanStyle} />  {/* Bent over posture */}
                  <circle cx="108" cy="78" r="7" className={humanStyle} />
                  {/* Hanging arms */}
                  <line x1="102" y1="85" x2="92" y2="112" className={equipmentStyle} />
                  {/* Barbell low */}
                  <circle cx="92" cy="112" r="4" className="fill-neutral-500" />
                  <rect x="88" y="96" width="8" height="32" rx="2" className={weightsStyle} />
                </>
              ) : (
                <>
                  <path d="M 50 135 L 68 120 L 60 92 L 102 85" fill="none" className={humanStyle} />
                  <circle cx="108" cy="78" r="7" className={humanStyle} />
                  {/* Middle row contraction */}
                  <path d="M 60 92 L 102 85" fill="none" className={highlightStyle} />
                  {/* Pulled Arms */}
                  <path d="M 102 85 L 85 80 L 85 88" fill="none" className={humanStyle} />
                  {/* Barbell pulled to stomach */}
                  <circle cx="85" cy="88" r="4" className="fill-amber-500" />
                  <rect x="81" y="72" width="8" height="32" rx="2" className={weightsStyle} />
                  {/* Tension signal */}
                  <path d="M 85 105 L 85 93" fill="none" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrow)" />
                </>
              );

            case "s4": // Barfiks (Pull up)
              return isStart ? (
                <>
                  <line x1="50" y1="20" x2="150" y2="20" className="stroke-neutral-600 stroke-[4]" /> {/* Pull up bar */}
                  <path d="M 100 20 L 100 60" fill="none" className={humanStyle} /> {/* Body hanging */}
                  <path d="M 100 60 L 100 110" fill="none" className={humanStyle} />
                  <circle cx="100" cy="50" r="7" className={humanStyle} />
                  {/* Arms straight hanging */}
                  <line x1="85" y1="20" x2="100" y2="58" className={humanStyle} />
                  <line x1="115" y1="20" x2="100" y2="58" className={humanStyle} />
                </>
              ) : (
                <>
                  <line x1="50" y1="20" x2="150" y2="20" className="stroke-neutral-600 stroke-[4]" />
                  {/* Back/body raised high */}
                  <path d="M 100 45 L 100 95" fill="none" className={humanStyle} />
                  <circle cx="100" cy="35" r="7" className={humanStyle} />
                  {/* Contracted back */}
                  <path d="M 100 45 L 100 70" fill="none" className={highlightStyle} />
                  {/* Arms pulling on bar chin over */}
                  <path d="M 85 20 L 92 38 L 100 43" fill="none" className={humanStyle} />
                  <path d="M 115 20 L 108 38 L 100 43" fill="none" className={humanStyle} />
                </>
              );

            // --- GÖĞÜS ---
            case "g1": // Bench Press
              return isStart ? (
                <>
                  <rect x="40" y="110" width="120" height="8" rx="1" className="fill-neutral-900" /> {/* Bench */}
                  <path d="M 60 110 L 140 110" fill="none" className={humanStyle} /> {/* Body lying */}
                  <circle cx="50" cy="110" r="7" className={humanStyle} /> {/* Head */}
                  {/* Arms extended straight */}
                  <line x1="85" y1="110" x2="85" y2="55" className={humanStyle} />
                  <line x1="115" y1="110" x2="115" y2="55" className={humanStyle} />
                  {/* Barbell up */}
                  <line x1="50" y1="55" x2="150" y2="55" className={equipmentStyle} />
                  <rect x="42" y="42" width="8" height="26" rx="2" className={weightsStyle} />
                  <rect x="150" y="42" width="8" height="26" rx="2" className={weightsStyle} />
                </>
              ) : (
                <>
                  <rect x="40" y="110" width="120" height="8" rx="1" className="fill-neutral-900" />
                  <path d="M 60 110 L 140 110" fill="none" className={humanStyle} />
                  <circle cx="50" cy="110" r="7" className={humanStyle} />
                  {/* Arms bent down to chest */}
                  <path d="M 85 110 L 70 120 L 85 102" fill="none" className={humanStyle} />
                  <path d="M 115 110 L 130 120 L 115 102" fill="none" className={humanStyle} />
                  {/* Highlight Pecs tight */}
                  <path d="M 85 110 L 115 110" fill="none" className={highlightStyle} />
                  {/* Barbell on chest */}
                  <line x1="50" y1="102" x2="150" y2="102" className="stroke-amber-500 stroke-[3]" />
                  <rect x="42" y="89" width="8" height="26" rx="2" className={weightsStyle} />
                  <rect x="150" y="89" width="8" height="26" rx="2" className={weightsStyle} />
                </>
              );

            case "g2": // Incline Dumbbell Press
              const benchXAngle = isStart ? 45 : 45;
              return isStart ? (
                <>
                  {/* Incline line */}
                  <line x1="45" y1="125" x2="135" y2="65" className="stroke-neutral-800 stroke-[6]" fill="none" />
                  <path d="M 60 115 L 120 75" fill="none" className={humanStyle} /> {/* Lying torso */}
                  <circle cx="130" cy="68" r="7" className={humanStyle} />
                  {/* Dumbbells low at shoulders */}
                  <path d="M 90 95 L 75 80" fill="none" className={humanStyle} />
                  <circle cx="75" cy="80" r="5" className="fill-neutral-600" />
                  <circle cx="105" cy="60" r="5" className="fill-neutral-600" />
                </>
              ) : (
                <>
                  <line x1="45" y1="125" x2="135" y2="65" className="stroke-neutral-800 stroke-[6]" fill="none" />
                  <path d="M 60 115 L 120 75" fill="none" className={humanStyle} />
                  <circle cx="130" cy="68" r="7" className={humanStyle} />
                  {/* Highlight upper pecs */}
                  <path d="M 95 90 L 115 78" fill="none" className={highlightStyle} />
                  {/* Dumbbells extended high */}
                  <line x1="90" y1="95" x2="80" y2="45" className={humanStyle} />
                  <line x1="102" y1="85" x2="110" y2="35" className={humanStyle} />
                  <circle cx="80" cy="45" r="6" className="fill-amber-500" />
                  <circle cx="110" cy="35" r="6" className="fill-amber-500" />
                </>
              );

            case "g3": // Chest Fly
              return isStart ? (
                <>
                  <rect x="40" y="110" width="120" height="8" rx="1" className="fill-neutral-900" />
                  <path d="M 60 110 L 140 110" fill="none" className={humanStyle} /> {/* Body */}
                  <circle cx="50" cy="110" r="7" className={humanStyle} />
                  {/* Wide arms open */}
                  <path d="M 100 110 C 65 110, 60 85, 55 75" fill="none" className={humanStyle} strokeWidth="3" />
                  <path d="M 100 110 C 135 110, 140 85, 145 75" fill="none" className={humanStyle} strokeWidth="3" />
                  <circle cx="55" cy="75" r="6" className="fill-neutral-600" />
                  <circle cx="145" cy="75" r="6" className="fill-neutral-600" />
                  {/* Tension stretch arrows */}
                  <path d="M 80 110 L 60 110" fill="none" stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrow)" />
                  <path d="M 120 110 L 140 110" fill="none" stroke="#e11d48" strokeWidth="2" markerEnd="url(#arrow)" />
                </>
              ) : (
                <>
                  <rect x="40" y="110" width="120" height="8" rx="1" className="fill-neutral-900" />
                  <path d="M 60 110 L 140 110" fill="none" className={humanStyle} />
                  <circle cx="50" cy="110" r="7" className={humanStyle} />
                  {/* Closed arms huddled up high */}
                  <path d="M 100 110 Q 85 85, 95 60" fill="none" className={humanStyle} />
                  <path d="M 100 110 Q 115 85, 105 60" fill="none" className={humanStyle} />
                  {/* Squeeze area highlight */}
                  <path d="M 95 60 L 105 60" fill="none" className={highlightStyle} />
                  <circle cx="95" cy="60" r="6" className="fill-amber-500" />
                  <circle cx="105" cy="60" r="6" className="fill-amber-500" />
                </>
              );

            case "g4": // Şınav (Push Up)
              return isStart ? (
                <>
                  {/* Torso straight high plank */}
                  <line x1="50" y1="135" x2="150" y2="135" className={floorLine} />
                  <path d="M 55 135 L 140 100" fill="none" className={humanStyle} /> {/* Plank line */}
                  <circle cx="145" cy="95" r="7" className={humanStyle} />
                  {/* Extended arms to floor */}
                  <line x1="120" y1="108" x2="120" y2="135" className={equipmentStyle} />
                </>
              ) : (
                <>
                  <line x1="50" y1="135" x2="150" y2="135" className={floorLine} />
                  {/* Torso low down to floor */}
                  <path d="M 55 135 L 140 112" fill="none" className={`${humanStyle} stroke-[4]`} />
                  <circle cx="145" cy="107" r="7" className={humanStyle} />
                  {/* Bent elbows */}
                  <path d="M 120 118 L 132 135" fill="none" className={humanStyle} />
                  {/* Chest working highlight */}
                  <circle cx="120" cy="118" r="8" className="fill-amber-500/30" />
                </>
              );

            // --- ÖN KOL ---
            case "o1": // Barbell Curl
              const curlAngle = isStart ? 130 : 65;
              return (
                <>
                  <path d="M 70 135 L 70 65" fill="none" className={humanStyle} /> {/* Torso */}
                  <circle cx="70" cy="55" r="7" className={humanStyle} />
                  {/* Standing arm */}
                  <line x1="70" y1="75" x2="80" y2="98" className={humanStyle} /> {/* Upper arm */}
                  <line x1="80" y1="98" x2={isStart ? 82 : 68} y2={isStart ? 122 : 72} className={`${humanStyle} stroke-[4]`} /> {/* Forearm */}
                  <circle cx={isStart ? 82 : 68} cy={isStart ? 122 : 72} r="5" className={isStart ? "fill-neutral-500" : "fill-amber-500"} />
                  {/* Highlight biceps peak (when up) */}
                  {!isStart && <path d="M 70 75 Q 82 78, 80 98" fill="none" className={highlightStyle} />}
                </>
              );

            case "o2": // Hammer Curl
              return (
                <>
                  <path d="M 70 135 L 70 65" fill="none" className={humanStyle} />
                  <circle cx="70" cy="55" r="7" className={humanStyle} />
                  {/* Side elbow locked */}
                  <line x1="70" y1="75" x2="82" y2="95" className={humanStyle} />
                  <line x1="82" y1="95" x2={isStart ? 85 : 72} y2={isStart ? 118 : 72} className={`${humanStyle} stroke-[4.5]`} />
                  {/* Neutral dumbbell sideways */}
                  <rect x={isStart ? 81 : 68} y={isStart ? 112 : 66} width="8" height="12" rx="1" className="fill-amber-500" />
                  {!isStart && <path d="M 82 95 L 72 72" fill="none" className={highlightStyle} />}
                </>
              );

            case "o3": // Preacher Curl
              return (
                <>
                  {/* Angled Preacher Pad */}
                  <line x1="60" y1="95" x2="110" y2="70" className="stroke-neutral-800 stroke-[8]" fill="none" />
                  <path d="M 50 135 L 50 85 L 75 75" fill="none" className={humanStyle} /> {/* Seated guy */}
                  <circle cx="75" cy="65" r="7" className={humanStyle} />
                  {/* Arm on pad */}
                  <line x1="70" y1="80" x2="100" y2="72" className={humanStyle} />
                  <line x1="100" y1="72" x2={isStart ? 120 : 85} y2={isStart ? 95 : 55} className={`${humanStyle} stroke-[4]`} />
                  <circle cx={isStart ? 120 : 85} cy={isStart ? 95 : 55} r="5" className="fill-amber-500" />
                </>
              );

            case "o4": // Wrist Curl
              return (
                <>
                  <rect x="50" y="90" width="100" height="45" rx="2" className="fill-neutral-900" /> {/* Bench */}
                  {/* Arm flat on bench, wrist hanging off */}
                  <path d="M 60 90 L 115 90" fill="none" className={`${humanStyle} stroke-[6]`} />
                  {/* Wrist joint curl up/down */}
                  <path d="M 115 90 L 132 90" fill="none" className={`${humanStyle} stroke-[4.5]`} />
                  <circle cx="132" cy={isStart ? 100 : 80} r="5" className="fill-amber-500 animate-pulse" />
                </>
              );

            // --- ARKA KOL ---
            case "a1": // Skull Crusher
              return (
                <>
                  <rect x="40" y="110" width="120" height="8" rx="1" className="fill-neutral-900" />
                  <path d="M 60 110 L 140 110" fill="none" className={humanStyle} /> {/* Body */}
                  <circle cx="50" cy="110" r="7" className={humanStyle} />
                  {/* Elbow vertical static, forearms bending backwards over forehead */}
                  <line x1="85" y1="110" x2="85" y2="85" className={`${humanStyle} stroke-[3.5]`} />
                  <line x1="85" y1="85" x2={isStart ? 65 : 85} y2={isStart ? 92 : 60} className={humanStyle} />
                  <circle cx={isStart ? 65 : 85} cy={isStart ? 92 : 60} r="5" className="fill-amber-500" />
                  {!isStart && <path d="M 85 110 L 85 85" fill="none" className={highlightStyle} />}
                </>
              );

            case "a2": // Triceps Pushdown
              return (
                <>
                  <line x1="140" y1="20" x2="140" y2="135" className="stroke-neutral-800 stroke-[5]" /> {/* Pulley bar */}
                  <path d="M 80 135 L 80 65" fill="none" className={humanStyle} />
                  <circle cx="80" cy="55" r="7" className={humanStyle} />
                  {/* Elbow pinned at side */}
                  <line x1="80" y1="75" x2="95" y2="90" className={humanStyle} />
                  <line x1="95" y1="90" x2={isStart ? 82 : 102} y2={isStart ? 75 : 120} className={`${humanStyle} stroke-[4]`} />
                  <circle cx={isStart ? 82 : 102} cy={isStart ? 75 : 120} r="5" className="fill-amber-500" />
                  {/* Triceps highlighting on extension */}
                  {!isStart && <polyline points="80,75 95,90" className={highlightStyle} />}
                </>
              );

            case "a3": // Overhead Extension
              return (
                <>
                  <path d="M 80 135 L 80 75" fill="none" className={humanStyle} />
                  <circle cx="80" cy="65" r="7" className={humanStyle} />
                  {/* Upper arms pointing high, elbows up */}
                  <line x1="80" y1="75" x2="92" y2="48" className={humanStyle} strokeWidth="3" />
                  <line x1="92" y1="48" x2={isStart ? 78 : 95} y2={isStart ? 72 : 22} className={`${humanStyle} stroke-[3.5]`} />
                  <circle cx={isStart ? 78 : 95} cy={isStart ? 72 : 22} r="5.5" className="fill-amber-500" />
                </>
              );

            case "a4": // Dips
              return (
                <>
                  <line x1="65" y1="85" x2="135" y2="85" className="stroke-neutral-800 stroke-[5]" /> {/* Parallel bar */}
                  {/* Body hovering */}
                  <path d="M 100 85 L 100 50" fill="none" className={humanStyle} />
                  <path d="M 100 85 L 94 118" fill="none" className={humanStyle} />
                  <circle cx="100" cy="40" r="7" className={humanStyle} />
                  {/* Arm bending */}
                  <path d={isStart ? "M 100 50 L 98 70 L 100 85" : "M 100 50 L 88 58 L 100 85"} fill="none" className={humanStyle} />
                </>
              );

            // --- KARIN GÖBEK ---
            case "k1": // Hanging Leg Raise
              const legAngle = isStart ? "M 100 85 L 100 128" : "M 100 85 L 138 85";
              return (
                <>
                  <line x1="70" y1="20" x2="130" y2="20" className="stroke-neutral-700 stroke-[5]" />
                  <line x1="100" y1="20" x2="100" y2="40" className={humanStyle} /> {/* Hanging on bar */}
                  <path d="M 100 40 L 100 85" fill="none" className={humanStyle} />
                  <path d={legAngle} fill="none" className={`${humanStyle} stroke-[4]`} />
                  <circle cx="100" cy="40" r="7" className={humanStyle} />
                  {!isStart && <circle cx="100" cy="72" r="10" className="fill-amber-500/30 animate-pulse" />}
                </>
              );

            case "k2": // Plank
              return (
                <>
                  <line x1="40" y1="125" x2="160" y2="125" className={floorLine} />
                  {/* Prone horizontal plank body */}
                  <path d="M 50 125 L 140 100" fill="none" className={`${humanStyle} stroke-[5.5]`} />
                  <circle cx="148" cy="94" r="7" className={humanStyle} />
                  {/* Forearms on floor */}
                  <polyline points="135,101 135,125" className={equipmentStyle} />
                  <circle cx="100" cy="110" r="14" className="fill-amber-500/20 filter blur-xs" />
                </>
              );

            case "k3": // Mekik (Crunch)
              return (
                <>
                  {/* Lying crunch flat floor */}
                  <path d="M 60 135 C 100 135, 110 115, 130 115" fill="none" className={humanStyle} /> {/* Lying leg bend */}
                  {/* Upper torso lifting */}
                  <path d="M 100 135 L 70 { isStart ? 135 : 120 }" fill="none" className={humanStyle} />
                  <circle cx={isStart ? 60 : 66} cy={isStart ? 135 : 112} r="7" className={humanStyle} />
                  {!isStart && <circle cx="92" cy="128" r="8" className="fill-amber-500/35" />}
                </>
              );

            // --- BACAK ---
            case "b1": // Squat
              const squatOffset = isStart ? 65 : 108;
              const kneePath = isStart 
                ? "M 100 135 L 100 102 L 100 65" 
                : "M 100 135 L 115 118 L 88 108 L 100 65";
              return (
                <>
                  <path d={kneePath} fill="none" className={`${humanStyle} stroke-[4.5]`} />
                  <circle cx="100" cy={isStart ? 54 : 54} r="8" className={humanStyle} />
                  {/* Barbell on shoulder */}
                  <circle cx="100" cy={isStart ? 65 : 65} r="4.5" className="fill-amber-500" />
                  <rect x="96" y={isStart ? 44 : 44} width="8" height="36" rx="2" className={weightsStyle} />
                  {/* Active highlight quads on deep push */}
                  {!isStart && <path d="M 100 135 L 115 118 L 88 108" fill="none" className={highlightStyle} />}
                </>
              );

            case "b2": // Romanian Deadlift
              return isStart ? (
                <>
                  {/* Standing tall */}
                  <path d="M 80 135 L 80 100 L 80 55" fill="none" className={humanStyle} />
                  <circle cx="80" cy="45" r="7" className={humanStyle} />
                  {/* Barbell high */}
                  <circle cx="80" cy="85" r="4" className={equipmentStyle} />
                  <rect x="76" y="69" width="8" height="32" rx="2" className={weightsStyle} />
                </>
              ) : (
                <>
                  {/* Hips pushed way back, chest angled low */}
                  <path d="M 60 135 L 75 115 L 60 92 L 102 85" fill="none" className={humanStyle} />
                  <circle cx="109" cy="78" r="7" className={humanStyle} />
                  {/* Tight Hamstrings highlighting */}
                  <path d="M 60 135 L 75 115 L 60 92" fill="none" className={highlightStyle} />
                  {/* Barbell gliding down thighs near shins */}
                  <circle cx="84" cy="114" r="4.5" className="fill-amber-500" />
                  <rect x="80" y="98" width="8" height="32" rx="2" className={weightsStyle} />
                </>
              );

            case "b3": // Leg Press
              return (
                <>
                  {/* 45 degree sled rails */}
                  <line x1="50" y1="130" x2="160" y2="50" className="stroke-neutral-800 stroke-[5]" />
                  {/* Seated torso fixed */}
                  <path d="M 60 115 L 75 110 L 108 128" fill="none" className={humanStyle} />
                  <circle cx="56" cy="105" r="7" className={humanStyle} />
                  {/* Foot press sled pushing */}
                  <line x1="120" y1={isStart ? 100 : 75} x2={isStart ? 102 : 62} y2={isStart ? 82 : 52} className={equipmentStyle} />
                  <rect x={isStart ? 105 : 68} y={isStart ? 75 : 45} width="12" height="24" rx="2" className="fill-amber-500" />
                </>
              );

            case "b4": // Lunge
              return isStart ? (
                <>
                  {/* Feet together standing */}
                  <path d="M 90 135 L 90 100 L 90 60" fill="none" className={humanStyle} />
                  <circle cx="90" cy="50" r="7" className={humanStyle} />
                  {/* Holding side dumbbells */}
                  <circle cx="98" cy="90" r="4" className="fill-neutral-600" />
                </>
              ) : (
                <>
                  {/* Split legs wide down */}
                  <path d="M 65 135 L 90 115 L 120 135" fill="none" className={humanStyle} />
                  {/* Torso straight over split */}
                  <path d="M 90 115 L 90 65" fill="none" className={humanStyle} />
                  <circle cx="90" cy="55" r="7" className={humanStyle} />
                  {/* Working knee active */}
                  <circle cx="90" cy="115" r="8" className="fill-amber-500/30" />
                </>
              );

            default:
              return (
                <rect x="70" y="50" width="60" height="60" rx="4" className="fill-neutral-900 stroke-neutral-800" />
              );
          }
        })()}
      </svg>
    );
  };

  return (
    <div className="mt-4 bg-neutral-900/90 rounded-xl border border-neutral-800 overflow-hidden shadow-lg">
      
      {/* Header controls & interactive tabs */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-850 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            BIOMEKANIK FORM BİLGİSAYARI
          </h4>
        </div>
        
        <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-850 self-end sm:self-auto">
          <button
            onClick={() => setActiveTab("interactive")}
            className={`px-3 py-1 text-[10px] uppercase font-mono rounded font-bold transition-all ${
              activeTab === "interactive"
                ? "bg-amber-500 text-neutral-950 font-black shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Form Similatörü
          </button>
          
          <button
            onClick={() => setActiveTab("compare")}
            className={`px-3 py-1 text-[10px] uppercase font-mono rounded font-bold transition-all ${
              activeTab === "compare"
                ? "bg-amber-500 text-neutral-950 font-black shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Aşama Karşılaştır
          </button>

          <button
            onClick={() => setActiveTab("anatomy")}
            className={`px-3 py-1 text-[10px] uppercase font-mono rounded font-bold transition-all ${
              activeTab === "anatomy"
                ? "bg-amber-500 text-neutral-950 font-black shadow-md"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            Anatomi Haritası
          </button>
        </div>
      </div>

      {/* Main interactive visualization panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 border-b border-neutral-850">
        
        {/* Left Section: Visual display frame */}
        <div className="md:col-span-5 bg-neutral-950 flex flex-col items-center justify-center p-4 relative min-h-[220px]">
          
          {activeTab === "compare" ? (
            <div className="w-full grid grid-cols-2 gap-2 h-full">
              <div className="bg-neutral-900/60 rounded-lg p-2 border border-neutral-850 flex flex-col items-center justify-between">
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold">1. Kurulum (Start)</span>
                {renderInteractiveDraftSVG("start", "h-28 w-full")}
                <span className="text-[8px] font-mono text-neutral-500 italic text-center leading-tight">Yükü emniyetle kavra.</span>
              </div>
              <div className="bg-neutral-900/60 rounded-lg p-2 border border-neutral-850 flex flex-col items-center justify-between">
                <span className="text-[9px] font-mono text-amber-500 uppercase tracking-widest font-bold">2. Kasılma (End)</span>
                {renderInteractiveDraftSVG("end", "h-28 w-full")}
                <span className="text-[8px] font-mono text-amber-400/80 italic text-center leading-tight">Zirvede sıkıştır.</span>
              </div>
            </div>
          ) : activeTab === "anatomy" ? (
            <div className="w-full flex flex-col justify-center gap-2.5 h-full p-2 py-4">
              <div className="bg-neutral-900/70 p-3 rounded-lg border border-neutral-850 flex flex-col gap-2">
                <span className="text-[9px] font-mono text-amber-500 font-bold uppercase tracking-wider block">ANATOMİK DETAY ANALİZİ</span>
                
                <div className="flex flex-col gap-1.5 border-t border-neutral-800 pt-2 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 uppercase font-mono">BİRİNCİL HEDEF:</span>
                    <span className="text-neutral-200 font-semibold text-right">{currentDetails.primaryTarget}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-850 pt-1">
                    <span className="text-neutral-500 uppercase font-mono">STABİLİZATÖRLER:</span>
                    <span className="text-neutral-300 text-right">{currentDetails.secondaryTarget}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-850 pt-1">
                    <span className="text-neutral-500 uppercase font-mono">GERİLİM MATRİSİ:</span>
                    <span className="text-amber-500 font-mono font-bold">{currentDetails.tensionType}</span>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-900/30 p-2.5 rounded-lg border border-neutral-850 text-[9px] font-mono text-neutral-400 flex items-center gap-1.5 leading-relaxed">
                <Info className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Biyomekanik Tavsiye:</strong> {currentDetails.leverageTip}
                </span>
              </div>
            </div>
          ) : (
            // Form simulation loop
            <div className="w-full flex flex-col items-center gap-3">
              <div className="absolute top-2 left-2 bg-neutral-900/90 border border-neutral-800 px-2 py-0.5 rounded text-[9px] font-mono text-amber-500 uppercase font-bold">
                {phase === "start" ? "Harekete Kurulum" : "Zirve Kasılma Fazı"}
              </div>

              {renderInteractiveDraftSVG(phase)}

              <div className="flex items-center gap-1.5 mt-2 bg-neutral-900 p-1 px-3 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 text-neutral-400 hover:text-white transition-all"
                  title={isPlaying ? "Simülasyonunu durdur" : "Simülasyonunu başlat"}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-amber-500" />}
                </button>
                
                <button
                  type="button"
                  onClick={() => setPhase((p) => (p === "start" ? "end" : "start"))}
                  className="p-1 text-neutral-400 hover:text-white transition-all border-l border-neutral-800 pl-1.5"
                  title="Fazı Manuel Değiştir"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
                <span className="text-[9px] font-mono text-neutral-500 lowercase ml-1">
                  {isPlaying ? "canlı biyodinamik aktif" : "simülasyon donduruldu"}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Right Section: Structured Steps Blueprint checklist */}
        <div className="md:col-span-7 p-4 sm:p-5 bg-neutral-900/40 flex flex-col justify-between gap-4">
          <div>
            <div className="flex justify-between items-start gap-2 mb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">{name}</h3>
                <span className="inline-block text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded mt-1">
                  Fokus: {currentDetails.focusMuscle}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[10px] text-neutral-500 font-mono uppercase block">SİNERJİ MODELİ</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase font-mono">{category === "karın göbek" ? "Çekirdek" : category}</span>
              </div>
            </div>

            {/* Steps & Guidelines layout */}
            <div className="flex flex-col gap-3.5 mt-3">
              
              {/* Kuruluk Cues */}
              <div>
                <span className="text-[9px] font-mono text-amber-500/80 font-bold uppercase tracking-wider block border-b border-neutral-800 pb-1 mb-1.5">
                  1. KURULUM VE BAŞLAMA POZİSYONU
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentDetails.setupCues.map((cue, idx) => (
                    <div key={idx} className="flex gap-1.5 text-[10px] text-neutral-300">
                      <span className="text-amber-500 font-bold font-mono">[{idx+1}]</span>
                      <span className="leading-snug">{cue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step checklist */}
              <div>
                <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider block border-b border-neutral-800 pb-1 mb-1.5">
                  2. SİLSİLE ADIMLARI VE KONTROL
                </span>
                <ul className="space-y-1">
                  {currentDetails.executionSteps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-[10px] text-neutral-400">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        <strong className="text-neutral-300 mr-1">{idx+1}. AŞAMA:</strong> {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* Golden Rule / Caution Panel */}
          <div className="mt-3 bg-rose-500/5 p-3 rounded-lg border border-rose-500/10 text-[10px] leading-relaxed flex gap-2">
            <span className="text-rose-500 font-black font-mono uppercase shrink-0 mt-0.5">[HATA ALARMI]</span>
            <div>
              <span className="text-rose-400 font-bold uppercase block text-[9px] mb-0.5">Sık Yapılan Kritik Teknik Hataları:</span>
              <span className="text-neutral-400">{currentDetails.commonMistake}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Footer descriptive biomechanics checklist */}
      <div className="p-3 bg-neutral-950 text-[10px] font-mono text-neutral-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span>ANA AKTİVATÖR: <strong className="text-neutral-300 uppercase">{currentDetails.primaryTarget}</strong></span>
        </div>
        <span className="text-[9px] text-neutral-600 uppercase text-right leading-tight">
          *DAWNLIFT Biyomekanik Laboratuvarı tarafından tescillenmiş form veritabanıdır.
        </span>
      </div>

    </div>
  );
}
