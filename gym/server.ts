import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Standard lazy-initialized client wrapper
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("Warning: GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Local premium gym database and fallback routines to prevent 503 service failures
const CATEGORY_MOTIVATIONS: Record<string, { monologues: string[], quotes: string[], focus: string[] }> = {
  "sırt": {
    monologues: [
      "Dünya sessizliğe bürünmüş durumda. Sırt kasların, hayatın karşına çıkardığı rüzgarlara karşı duran ana omurgandır. Sen sessizlikte barı kavrarken, sıradan zihinler uykunun rehavetinde kayboluyor. Kürek kemiklerini kenetle. Kanat kaslarını arka ceplerine sokar gibi geriye kilitle. Bu çekiş, sadece ağırlığı kaldırmak değil; hayattaki tüm zorluklara göğüs gerecek kudreti kendinde toplama savaşıdır. Çek ve duruşunu sabitle!",
      "Çekmek, iradenin metalle kurduğu en dürüst diyalogdur. Sırtındaki her bir lifin gerildiğini hisset. Demir asla yalan söylemez ve asla kolaylaşmaz. Sen güçlenirsin. Kanatlarını ger, göğsünü kaldır, omurganı koru. Şüphelendiğin o saniyede, barı tüm gücünle kavra ve kendine çek. Sabah güneşi odanın pencerelerinden sızarken sen çoktan zaferini ilan etmiş olacaksın.",
      "Vücudunun arka zinciri, kaderinin sessiz taşıyıcısıdır. Çekiş gücü zayıf olanın duruşu da eğik olur. Kendine eğik bir yaşam değil, başı dik bir zafer inşa et. Kürek kemiklerinin arasındaki gerilim, senin gün içinde dimdik tutacak tek şeydir. Derin bir nefes al ve demiri uykudan uyandır."
    ],
    quotes: [
      "Korku ucuzdur. Ağır çekişler her zaman dürüsttür.",
      "Yük seni ezmez, onu taşımayı reddeden gevşek bir sırt ezer.",
      "Sessiz sabahlar, en gürültülü zaferleri inşa ettiğin kutsal zamanlardır."
    ],
    focus: [
      "Kürek kemiklerini birbirine sıkıca kilitleyerek omurga stabiliteni kur.",
      "Çekişi ellerinle değil, dirseklerini geriye doğru bir mızrak gibi fırlatarak başlat.",
      "Nefes alıp karnını şişir ve tüm gövdeni çelikten bir koruma kafesiyle kilitle."
    ]
  },
  "göğüs": {
    monologues: [
      "Göğüs kafesin, içindeki o sönmez ateşin zırhıdır. Bench pres sehpasına uzandığında üzerindeki ağırlığı sadece kaslarınla değil, ruhunla göğe fırlat. Sabahın bu soğuk vaktinde göğsünde hissettiğin o gerilim, yarının sarsılmaz kalkanıdır. Ayak tabanlarını yere mühürle, göğsünü şişir ve demirin seni ezmesine izin verme. Sen ondan daha sertsin. İt!",
      "Güçlü bir pres, zihnindeki şüpheleri gökyüzüne doğru savurmaktır. Bar göğsüne doğru inderken zamanın yavaşladığını hisset. Bu, kendinle baş başa kaldığın o kritik andır. Şüphelerinin ağırlığı barın ağırlığından daha ağırdır, önce zihnindeki barı kaldır. Kürek kemiklerini kilitle ve patlayarak yukarı fırlat!",
      "Halter göğüs hizasına indiğinde, kolaycıların kalbi sıkışır. Ama sen sabaha uykunu feda ederek buraya geldin. Bu ağır metali göğsünde taşırken hissettiğin baskı, seni sarsılmaz bir savaşçı yapacak olan cevherdir. Göğsünü ger ve tüm gücünle yukarı sür."
    ],
    quotes: [
      "Demir seni ezmedikçe zemin asla pes etmez.",
      "Zorluklar, göğsünü gererek üzerine yürümen gereken hedeflerdir.",
      "Metali yukarı preslerken aslında kaderini yukarı taşıyorsun."
    ],
    focus: [
      "Omuzlarını geride ve aşağıda tutarak yükün göğüs kaslarına binmesini sağla.",
      "Barı veya dambılları göğüs çizgisine kontrollü indir, asla göğsünden sektirme.",
      "Ayaklarınla zemini iterek (leg drive) oluşan kinetik enerjiyi barı fırlatmak için kullan."
    ]
  },
  "ön kol": {
    monologues: [
      "Ellerin ve ön kolların, bu dünyayı kavrama ve kaderini tutma gücündür. Barbell curl yaparken dirseklerini gövdenin yanına çak. Biceps kaslarının gerildiğini, damarlarından akan kor ateşi hisset. Her bir büküş, sabırla yoğrulmuş bir başyapıttır. Vücudunu sallamadan, sadece ön kolun saf gücüyle ağırlığa boyun eğdir.",
      "Sıkıca kavramadığın hiçbir şey senin değildir. Metali parmaklarınla adeta ezerek tut. Ön kollarından bicepsine yürüyen o gerilim, iradeni besleyen en temiz enerji kaynağıdır. Sallanmak kolay yoldur; hile yapma, dürüst ol. Kaslarında biriken o tatlı asit, dürüstlüğünün ödülüdür.",
      "Kolların gücü, dürüst tekrarların sonucudur. Her büküşte kaslarını zirvede 1 saniye sıkıştır. Vücudunun geriye yaylanmasına izin verme; stoik duruşunu koru. Bırak acı gelsin, onu buyur et ve içinde erit."
    ],
    quotes: [
      "Kavrayışın çelik gibiyse, hiçbir zorluk elinden kaçamaz.",
      "Sallanarak yapılan yüz tekrar, dürüstçe yapılan tek bir tekrardan daha değersizdir.",
      "Bileklerin bükülmüyorsa, iraden de asla bükülmez."
    ],
    focus: [
      "Dirseklerini gövdenin yanına sabitle ve hareket boyunca milim oynatma.",
      "Bileklerini içeri doğru aşırı bükmeyerek yükün ön kol tendonlarına zarar vermesini önle.",
      "Ağırlığı indirirken (negatif faz) yavaş kal, yerçekiminin kaslarını kontrol etmesine izin verme."
    ]
  },
  "arka kol": {
    monologues: [
      "İçindeki itiş performansının büyük kısmı arkada kalan o gizli güçten gelir. Triceps, tıpkı saklanmış bir yayın gerilmesi gibidir. Skull crusher hareketinde demir alnına yaklaşırken zihnini mutlak bir sükunetle doldur. Korkuya yer yok, kontrol senin parmaklarının ucunda. Yukarı it ve tricepsin yırtılırcasına gerildiğini hisset!",
      "Arka kolların, senin gölgedeki savaşçılarındır. Onlar görünmez ama en kritik itiş anlarında tüm yükü sırtlanırlar. Tıpkı senin kimse görmezken yaptığın bu sessiz idman gibi. Dirsek açını bozmadan, metali tavana doğru presle ve her lifteki kilitlenmeyi onurlandır.",
      "Skull crusher yaparken barın alnına inişi bir cesaret sınavıdır. Titreme, tereddüt etme. Dirseklerini içe doğru topla ve tricepsinle yeri göğe bağla. Tepede patlamayı yaşa ve kollarındaki demiri kilitle."
    ],
    quotes: [
      "Gizli alanlardaki çaba, en parlak sahnelerdeki zaferi belirler.",
      "Güçlü kollar sadece bicepsle kurulmaz; tricepsin arkasındaki disiplinle örülür.",
      "Her kilitlenme, zihnindeki bir engeli daha parçalamaktır."
    ],
    focus: [
      "Dirseklerinin yana doğru açılmasına asla izin verme, onları paralel tut.",
      "Omuz eklemini tamamen sabit tutarak hareketi sadece dirseğinden yönlendir.",
      "Aşağı inişte barı alnının hemen üzerine doğru kontrollü ve yavaşça sevk et."
    ]
  },
  "karın göbek": {
    monologues: [
      "Merkez bölgen senin çekirdeğindir. Plank duruşunda dururken belinin büküldüğü o anda zihnindeki sesleri sustur. Karın kaslarındaki o keskin gerilim yandığında hissettiğin şey acı değil; gevşekliğin ve uyuşukluğun bedeninden süzülüp gidişidir. Gövdeni çelikten bir plaka gibi sertleştir ve saniyelerin geçmesine meydan oku!",
      "Vücudunu birleştiren o merkez, senin dengen ve sarsılmaz kalendir. Hanging leg raise yaparken bacaklarını sallayarak değil, karın kaslarının saf, izole kasılmasıyla yukarı taşı. Saniyeler ilerledikçe karnındaki o ateş büyüyecektir; o ateşi körükle. Sen bir kayasın, fırtınalara diren.",
      "Karın bölgen zayıfsa, en ağır squat veya deadlift altında ikiye katlanırsın. Hayatın ağır yükleri altında ezilmemek için önce merkezini, o sarsılmaz çekirdeğini çelikle kapla. Sıkıştır, nefes ver ve kilitlen."
    ],
    quotes: [
      "Çekirdeğin sağlamsa, dışarıdaki hiçbir rüzgar seni yıkamaz.",
      "Acı geçer, geride bıraktığı sert ve kırılmaz bir merkez kalır.",
      "Zaman durduğunda karın kaslarının direncini ateşle."
    ],
    focus: [
      "Plank duruşunda kalçanın yukarı fırlamasına veya aşağı sarkmasına engel ol, düz bir çizgi ol.",
      "Asılırken bacak sallamaktan kaçınmak için kalça fleksörleri yerine alt karnını sıkıştır.",
      "Nefes verirken karnını içeri çekip koruma kalkanını (abdominal bracing) sonuna kadar sık."
    ]
  },
  "bacak": {
    monologues: [
      "Bacakların senin yeryüzündeki köklerindir. Squat barının o muazzam ağırlığı omuzlarına çöktüğünde dizlerinin titremesi zayıflık işareti değildir, bu sadece bedenin gerçeklikle yüzleştiği andır. Derin bir nefes al, kalçanı arkaya ver ve korkusuzca o derinliğe çök. Topuklarınla betonu ezerek, sanki dünyayı aşağı itiyormuşçasen fırla!",
      "Bacak antrenmanı her sporcunun karakter aynasıdır. Squat'ın en derin noktasında, o dipsiz kuyunun dibinde tek başınasın. Seni oradan çıkaracak şey sadece kas gücü değil; bu demirin altına yatmaya karar veren sarsılmaz iradendir. Hadi, bas topuklarınla ve ayağa kalk!",
      "Romanian deadlift yaparken arka bacaklarının gerilimle yırtılırcasına uzadığını hisset. Bu, kalçadan başlayan o muazzam arka zincir hareketidir. Başını nötr tut, kalçanı arkadaki görünmez bir duvara değdirmek ister gibi uzat. Kalkarken kalçayı sıkıştır ve gücü ilan et."
    ],
    quotes: [
      "Bacakları güçlü olmayan hiçbir imparatorluk ayakta kalamaz.",
      "Squat'ta derinlere inmekten korkan, zirveleri asla göremez.",
      "Ağırlığın altında çömelmek pes etmek değil; daha yüksek fırlamak için güç toplamaktır."
    ],
    focus: [
      "Dizlerini ayak başparmaklarının yönünde daima dışa doğru aç, içe kaçmalarına engel ol.",
      "Barı üst sırt trapez kaslarına mekanik yerleştir ve üst vücudunu tamamen arkaya kilitle.",
      "Nefesini aşağı inmeden önce karın boşluğuna doldurup (valsalva manevrası) omurganı koru."
    ]
  }
};

const getCategoryByKey = (exerciseName: string): string => {
  const nameLower = exerciseName.toLowerCase();
  if (nameLower.includes("sırt")) return "sırt";
  if (nameLower.includes("göğüs")) return "göğüs";
  if (nameLower.includes("ön kol")) return "ön kol";
  if (nameLower.includes("arka kol")) return "arka kol";
  if (nameLower.includes("karın") || nameLower.includes("göbek")) return "karın göbek";
  if (nameLower.includes("bacak")) return "bacak";
  return "sırt"; // default fallback
};

const getFallbackMotivation = (exerciseName: string, mentalBlockStr: string, focusLvl: string) => {
  const cat = getCategoryByKey(exerciseName || "");
  const data = CATEGORY_MOTIVATIONS[cat] || CATEGORY_MOTIVATIONS["sırt"];
  
  const randIdx = Math.floor(Math.abs((exerciseName || "").length) % data.monologues.length);
  const monologue = data.monologues[randIdx] + (mentalBlockStr ? ` Zihnindeki o "${mentalBlockStr}" engelini stoik bir kararlılıkla ezerek geç. Karanlıkta döktüğün her damla ter, yarınki zırhındır.` : "");
  
  return {
    monologue,
    quotes: data.quotes,
    focusPoints: data.focus,
    rhythmBpm: focusLvl === "hyper" ? 140 : focusLvl === "aggressive" ? 150 : 110,
    isFallback: true
  };
};

const getFallbackRoutine = (exerciseName: string, bodyWeightStr: string, targetWeightStr: string) => {
  const cat = getCategoryByKey(exerciseName || "");
  const targetVal = parseFloat(targetWeightStr) || 120;
  const barWeight = 20; // 20 kg standard bar
  
  const percentages = [40, 60, 80, 90];
  const warmups = percentages.map((pct, idx) => {
    const rawWeight = (targetVal * pct) / 100;
    const weight = Math.max(barWeight, Math.round(rawWeight / 2.5) * 2.5);
    const reps = 10 - idx * 2;
    
    let coachingCue = "Konsantre ol ve dürüst tekrarlar çıkar.";
    if (idx === 0) coachingCue = "Hafif yükle eklemleri uyandır, hareketi hisset.";
    else if (idx === 1) coachingCue = "Gerilimi yavaşça artır, kas grubuna kan pompala.";
    else if (idx === 2) coachingCue = "Ellerini tebeşirle. Barı bir mengene gibi sık.";
    else if (idx === 3) coachingCue = "Zihnini temizle, patlayıcı bir güçle tekli kaldırışı yap.";

    return {
      setNumber: idx + 1,
      weight,
      reps,
      intensityPct: pct,
      coachingCue,
      chalkRequired: pct >= 70
    };
  });

  const safetyNotes = CATEGORY_MOTIVATIONS[cat]?.focus.slice(0, 2) || [
    "Antrenmandan önce merkez bölgeni sıkıca kilitleyerek omurga emniyetini sağla.",
    "Bütün motor üniteleri devreye sokmak için acele etmeden, kontrollü bir tempo kullan."
  ];

  return {
    warmups,
    safetyNotes,
    mindsetKey: cat === "bacak" ? "SQUAT'A ÇÖK" : cat === "göğüs" ? "GÖĞSÜNÜ GER" : cat === "sırt" ? "YERİ AŞAĞI İT" : "METALE HÜKMET",
    estimatedDurationMin: 12,
    isFallback: true
  };
};

async function start() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Workout Routine API Route
  app.post("/api/gemini/workout", async (req, res) => {
    const { exercise, bodyWeight, targetWeight } = req.body;
    try {
      const targetVal = parseFloat(targetWeight) || 120;

      const ai = getGemini();
      const prompt = `
        Design a structured progressive warm-up routine leading up to a single max effort lift of ${targetVal} kg in the ${exercise || "Deadlift"}.
        Calculate safe progression sets scaling from roughly 40% up to 90% in 4 distinct sets.
        Context:
        - Exercise: ${exercise || "Deadlift"}
        - Athlete weight: ${bodyWeight || "80"} kg
        - Max Lift Goal today: ${targetVal} kg

        CRITICAL: All generated coaching clues, safety notes, and mindset keys MUST be fully in Turkish language ("Türkçe"). Ensure weights are realistically calculated in kg (kilograms) for standard metal plates (e.g. 20kg bar, and plates like 25, 20, 15, 10, 5, 2.5, 1.25 kg).
      `;

      let response;
      let lastError: any = null;
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash", "gemini-1.5-flash", "gemini-flash-latest"];

      for (const currentModel of modelsToTry) {
        try {
          console.log(`[Sunrise Server] Attempting workout plan generation with model: ${currentModel}`);
          response = await ai.models.generateContent({
            model: currentModel,
            contents: prompt,
            config: {
              systemInstruction: "You are an elite speed-and-power lifting coach crafting custom warm-up tables in Turkish. Your entire response parameter texts (coachingCue, safetyNotes, mindsetKey) must be in Turkish language ('Türkçe').",
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  warmups: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        setNumber: { type: Type.INTEGER },
                        weight: { type: Type.INTEGER, description: "The calculated bar weight in kg for this setup set." },
                        reps: { type: Type.INTEGER, description: "Warmup target rep count (usually 3 to 8, smaller reps as weight triggers)." },
                        intensityPct: { type: Type.INTEGER, description: "Percentage of target absolute peak lift." },
                        coachingCue: { type: Type.STRING, description: "A micro trigger keyword in Turkish: visual or alignment focus." },
                        chalkRequired: { type: Type.BOOLEAN, description: "Indicates hand chalk requirement if grip threat level is high (over 70% intensity)." }
                      },
                      required: ["setNumber", "weight", "reps", "intensityPct", "coachingCue", "chalkRequired"]
                    }
                  },
                  safetyNotes: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Two critical structural checkpoints in Turkish to prevent spine shear or lift failure before pull-off."
                  },
                  mindsetKey: { type: Type.STRING, description: "A highly concise three-word iron mantra in Turkish for focus." },
                  estimatedDurationMin: { type: Type.INTEGER, description: "Total recommended warm up duration in minutes." }
                },
                required: ["warmups", "safetyNotes", "mindsetKey", "estimatedDurationMin"]
              }
            }
          });

          if (response && response.text) {
            console.log(`[Sunrise Server] Successfully generated workout plan using model: ${currentModel}`);
            break;
          }
        } catch (err: any) {
          console.warn(`[Sunrise Server] Model ${currentModel} failed:`, err.message || err);
          lastError = err;
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("All cascade models failed to respond.");
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini.");
      }

      res.json(JSON.parse(responseText.trim()));
    } catch (error: any) {
      console.warn("Gemini API premium table generation failed. Activating safe progressive warmup offline model:", error.message || error);
      const fallback = getFallbackRoutine(exercise, bodyWeight, targetWeight);
      res.json(fallback);
    }
  });

  // Client SPA serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sunrise Server] Active on port ${PORT}`);
  });
}

start();
