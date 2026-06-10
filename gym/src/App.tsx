import React, { useState, useEffect, useRef } from "react";
import { 
  Dumbbell, 
  Flame, 
  Zap, 
  Clock, 
  Compass, 
  Info, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  Square,
  AlertTriangle,
  Brain,
  History,
  Video,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LiftConfig, MotivationResponse, WarmupSet, RoutineResponse } from "./types";
import ExerciseVisualizer from "./components/ExerciseVisualizer";

const ALL_STOIC_QUOTES = [
  "Demir asla yalan söylemez. 100 kilo her zaman 100 kilodur.",
  "Kendine eğik bir yaşam değil, başı dik bir zafer inşa et.",
  "Korku ucuzdur. Ağır kaldırışlar her zaman dürüsttür.",
  "Yük seni ezmez; onu taşımayı reddeden zayıf iradeler ezer.",
  "Sessiz şafaklar, en gürültülü zaferleri inşa ettiğin kutsal zamanlardır.",
  "Sırtındaki her lifin gerilimi hisset. Sen güçlendikçe dünya kolaylaşacak.",
  "Metalle kurulan dürüst diyalog, şüphelerini darmadağın eder.",
  "Disiplin, zihninin bedenine fısıldadığı mutlak emirdir.",
  "Eklemlerin soğuk olabilir ama iraden sarsılmaz bir ateş gibi parlamalı.",
  "Sadece ağırlığı kaldırmıyorsun; şüphe pelerini yırtıp atıyorsun.",
  "Platformun soğuk sessizliğinde sadece demir ve senin sarsılmaz kararın var.",
  "Her dürüst tekrar, kendi geleceğini şekillendirdiğin bir çekiç darbesidir.",
  "Demir, içindeki gücü açığa çıkarmak isteyenler için dürüst bir aynadır.",
  "Maksimum kaldırışına giden yolda döktüğün tebeşir, sarsılmaz inancının mührüdür.",
  "Isınırken acele etme; kaslarını ve zihnini tek bir amaca kilitliyorsun.",
  "Acı geçicidir; pes etmenin getireceği o eğik baş ise kalıcı bir yenilgidir.",
  "Zayıflık sadece zihnin uydurduğu bir masaldır. Bara uzan ve masalı yırt!"
];

// Hardcoded paths to our magnificent generated assets
const GYM_ASSETS = {
  sunrise_gym_empty: "/src/assets/images/sunrise_gym_empty_1781030281990.png",
  athlete_deadlift_prep: "/src/assets/images/athlete_deadlift_prep_1781030298123.png",
  athlete_heavy_deadlift: "/src/assets/images/athlete_heavy_deadlift_1781030313979.png",
  athlete_mindset_rest: "/src/assets/images/athlete_mindset_rest_1781030330591.png"
};

// Beautiful static fallback motivation states and Turkish gym database
const CATEGORY_MOTIVATIONS: Record<string, { monologues: string[], quotes: string[], focus: string[] }> = {
  "sırt": {
    monologues: [
      "Dünya sessizliğe bürünmüş durumda. Sırt kasların, hayatın karşına çıkardığı rüzgarlara karşı duran ana omurgandır. Sen sessizlikte barı kavrarken, sıradan zihinler uykunun rehavetinde kayboluyor. Kürek kemiklerini kenetle. Kanat kaslarını arka ceplerine sokar gibi geriye kilitle. Bu çekiş, sadece ağırlığı kaldırmak değil; hayattaki tüm zorluklara göğüs gerecek kudreti kendinde toplama savaşıdır. Çek ve duruşunu sabitle!",
      "Çekmek, iradenin metalle kurduğu en dürüst diyalogdur. Sırtındaki her bir lifin gerildiğini hisset. Demir asla yalan söylemez ve asla kolaylaşmaz. Sen güçlenirsin. Kanatlarını ger, göğsünü kaldır, omurganı koru. Şüphelendiğin o saniyede, barı tüm gücünle kavra ve kendine çek. Sabah güneşi odanın pencerelerinden sızarken sen çoktan zaferini ilan etmiş olacaksın.",
      "Vücudunun arka zinciri, kaderinin sessiz taşıyıcısıdır. Çekiş gücü zayıf olanın duruşu da eğik olur. Kendine eğik bir yaşam değil, başı dik bir zafer inşa et. Kürek kemiklerinin arasındaki gerilim, senin gün içinde dimdik tutacak tek şeydir. Derin bir nefes al ve demiri uykudan uyandır."
    ],
    quotes: [
      "Korku ucuzdur. Ağır çekişler her zaman dürüsttür.",
      "Yük seni ezmez, onu taşımayı refus eden gevşek bir sırt ezer.",
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
      "Göğüs kafesin, içindeki o sönmez ateşin zırhıdır. Bench pres sehpasına uzandığında üzerindeki ağırlığı sadece kaslarınla değil, ruhunla göğe fırlat. Göğsünde hissettiğin o gerilim, yarının sarsılmaz kalkanıdır. Ayak tabanlarını yere mühürle, göğsünü şişir ve demirin seni ezmesine izin verme. Sen ondan daha sertsin. İt!",
      "Güçlü bir pres, zihnindeki şüpheleri gökyüzüne doğru savurmaktır. Bar göğsüne doğru inerken zamanın yavaşladığını hisset. Bu, kendinle baş başa kaldığın o kritik andır. Şüphelerinin ağırlığı barın ağırlığından daha ağırdır, önce zihnindeki barı kaldır. Kürek kemiklerini kilitle ve patlayarak yukarı fırlat!",
      "Halter göğüs hizasına indiğinde, kolaycıların kalbi sıkışır. Ama sen uykunu feda ederek buraya geldin. Bu ağır metali göğsünde taşırken hissettiğin baskı, seni sarsılmaz bir savaşçı yapacak olan cevherdir. Göğsünü ger ve tüm gücünle yukarı sür."
    ],
    quotes: [
      "Demir seni ezmedikçe zemin asla pes etmez.",
      "Zorluklar, göğsünü gererek üzerine yürümen gereken hedeflerdir.",
      "Metali yukarı preslerken aslında kaderini yukarı taşıyorsun."
    ],
    focus: [
      "Omuzlerini geride ve aşağıda tutarak yükün göğüs kaslarına binmesini sağla.",
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
      "Merkez bölgen senin çekirdeğindir. Plank duruşunda dururken belinin büküldüğü o anda zihnindeki sesleri sustur. Karın kaslarındaki o keskin gerilim yandığında hissettiğin şey acı değil; gevşekliğin ve uyuşukluğun bedeninden süzülüp gidişidir. Gövdeni çelikten bir plaka gibi sertleştir yardımıyla saniyelerin geçmesine meydan oku!",
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
      "Bacakların senin yeryüzündeki köklerindir. Squat barının o muazzam ağırlığı omuzlarına çöktüğünde dizlerinin titremesi zayıflık işareti değildir, bu sadece bedenin gerçeklikle yüzleştiği andır. Derin bir nefes al, kalçanı arkaya ver ve korkusuzca o derinliğe çök. Topuklarınla betonu ezerek, sanki dünyayı aşağı itiyormuşçasına fırla!",
      "Bacak antrenmanı her sporcunun karakter aynasıdır. Squat'ın en derin noktasında, o dipsiz kuyunun dibinde tek başınasın. Seni oradan çıkaracak şey sadece kas gücü değil; bu demirin altına yatmaya karar veren sarsılmaz iradendir. Hadi, bas topuklarınla ve ayağa kalk!",
      "Romanian deadlift yaparken arka bacaklarının gerilimle yırtılırcasına uzadığını hisset. Bu, kalçadan başlayan o muazzam arka zincir hareketidir. Başını nötr tut, kalçanı arkadaki görünmez bir duvara değdirmek ister gibi uzat. Kalkarken kalçayı sıkıştır yardımıyla gücü ilan et."
    ],
    quotes: [
      "Bacakları güçlü olmayan hiçbir imparatorluk ayakta kalamaz.",
      "Squat'ta derinlere inmekten korkan, zirveleri asla göremez.",
      "Ağırlığın altında çömelmek pes etmek değil; daha yüksek fırlamak için güç toplamaktır."
    ],
    focus: [
      "Dizlerini ayak başparmaklarının yönünde daima dışa doğru aç, içe kaçmalarına engel ol.",
      "Barı üst sırt trapez kaslarına mükemmel yerleştir ve üst vücudunu tamamen arkaya kilitle.",
      "Nefesini aşağı inmeden önce karın boşluğuna doldurup (valsalva manevrası) omurganı koru."
    ]
  }
};

// Complete exercise guide database with default targets (kg) and guidelines
const EXERCISE_DATA = [
  // Sırt
  { id: "s1", category: "sırt", name: "Sırt - Deadlift", defaultTarget: 140, defaultBody: 80, cue: "Yeryüzünü aşağı doğru itin; topuklarınızla yeri yarın.", safety: "Omurganızı bükmeyin, sırtınızı nötr tutun.", videoPid: "r4MzC8_Y908", avgCaloriesMin: 9.6 },
  { id: "s2", category: "sırt", name: "Sırt - Lat Pulldown", defaultTarget: 70, defaultBody: 80, cue: "Dirsekleri arka ceplerinize doğru çekin.", safety: "Omuzların kulaklarınıza yaklaşmasına izin vermeyin.", videoPid: "I8S7m6t-j78", avgCaloriesMin: 6.0 },
  { id: "s3", category: "sırt", name: "Sırt - Barbell Row", defaultTarget: 80, defaultBody: 80, cue: "Barı alt karnınıza doğru kürek çekin.", safety: "Gövde açısını sabit tutun, momentum kullanmayın.", videoPid: "RQU8K_ZQLgI", avgCaloriesMin: 7.2 },
  { id: "s4", category: "sırt", name: "Sırt - Barfiks", defaultTarget: 90, defaultBody: 80, cue: "Göğsünüzü bara doğru yükseltin.", safety: "Omuz eklemlerini aktif ve geride tutun.", videoPid: "eGo4IYlbE5g", avgCaloriesMin: 8.5 },

  // Göğüs
  { id: "g1", category: "göğüs", name: "Göğüs - Bench Press", defaultTarget: 100, defaultBody: 80, cue: "Barı gökyüzüne doğru patlayıcı şekilde presleyin.", safety: "Kürek kemiklerini sehpaya adeta sabitleyin.", videoPid: "vK_Yf3-A984", avgCaloriesMin: 7.5 },
  { id: "g2", category: "göğüs", name: "Göğüs - Incline Dumbbell Press", defaultTarget: 30, defaultBody: 80, cue: "Dambılları yukarıda birleştirmeden presleyin.", safety: "Dirsek açısını 45 derece civarında sabitleyin.", videoPid: "0G2_XI786BY", avgCaloriesMin: 6.8 },
  { id: "g3", category: "göğüs", name: "Göğüs - Chest Fly", defaultTarget: 15, defaultBody: 80, cue: "Büyük bir ağaca sarılır gibi göğsünüzü sıkıştırın.", safety: "Dirseğin aşırı geriye gitmesine izin vermeyin.", videoPid: "v7Inb7n_O2g", avgCaloriesMin: 5.5 },
  { id: "g4", category: "göğüs", name: "Göğüs - Şınav", defaultTarget: 80, defaultBody: 80, cue: "Tüm vücudunuzu bir kalıp gibi yukarı taşıyın.", safety: "Belinizin aşağı çökmesine engel olun.", videoPid: "_m31z7912Hc", avgCaloriesMin: 6.2 },

  // Ön Kol
  { id: "o1", category: "ön kol", name: "Ön Kol - Barbell Curl", defaultTarget: 40, defaultBody: 80, cue: "Dirseklerinizi gövdenize kelepçeleyin.", safety: "Vücudunuzu sallayarak hile yapmayın.", videoPid: "LY1V6Cw_Cq0", avgCaloriesMin: 4.8 },
  { id: "o2", category: "ön kol", name: "Ön Kol - Hammer Curl", defaultTarget: 18, defaultBody: 80, cue: "Demiri bir çekici sarsarcasına sıkıp kaldırın.", safety: "Bileklerinizin sağa sola kaçmasına engel olun.", videoPid: "zC3nLlEvin4", avgCaloriesMin: 4.2 },
  { id: "o3", category: "ön kol", name: "Ön Kol - Preacher Curl", defaultTarget: 30, defaultBody: 80, cue: "Arka kolu sehpaya gömün, üstte bicepsi zirvede sıkın.", safety: "Alt noktada dirsekleri aniden kilitlemeyin.", videoPid: "fIWP-FRFNbI", avgCaloriesMin: 4.0 },
  { id: "o4", category: "ön kol", name: "Ön Kol - Wrist Curl", defaultTarget: 25, defaultBody: 80, cue: "Sadece el bileklerinin hareketiyle ön kolu sıkıştırın.", safety: "Çok ağır dambıllarla biteği zorlamayın.", videoPid: "b_76u9Z-Hoc", avgCaloriesMin: 2.8 },

  // Arka Kol
  { id: "a1", category: "arka kol", name: "Arka Kol - Skull Crusher", defaultTarget: 35, defaultBody: 80, cue: "Barı alnınıza doğru sükunetle indirin.", safety: "Dirseklerin dışarı açılmasına izin vermeyin.", videoPid: "ir5PsAn2198", avgCaloriesMin: 4.5 },
  { id: "a2", category: "arka kol", name: "Arka Kol - Triceps Pushdown", defaultTarget: 25, defaultBody: 80, cue: "Halatı aşağıda iki yana ayırarak tricepsleri kilitleyin.", safety: "Omuzların öne yuvarlanmasını önleyin.", videoPid: "vB5OHsJ3EME", avgCaloriesMin: 4.2 },
  { id: "a3", category: "arka kol", name: "Arka Kol - Overhead Extension", defaultTarget: 20, defaultBody: 80, cue: "Dirsekleri yukarı sabitleyin, dambılı arkaya salın.", safety: "Belinizde aşırı kavis oluşmamasına dikkat edin.", videoPid: "68oW685Pz0g", avgCaloriesMin: 4.0 },
  { id: "a4", category: "arka kol", name: "Arka Kol - Dips", defaultTarget: 90, defaultBody: 80, cue: "Vücudunuzu dik tutarak arka kol gücüyle yükselin.", safety: "Omuz mobilitenizi aşacak kadar derine inmeyin.", videoPid: "0326dy_-WAI", avgCaloriesMin: 7.8 },

  // Karın Göbek
  { id: "k1", category: "karın göbek", name: "Karın - Hanging Leg Raise", defaultTarget: 80, defaultBody: 80, cue: "Bacaklarınızı karın gücüyle yukarı çekin.", safety: "Momentum kullanarak sallanmayın.", videoPid: "rOk_RsczS-U", avgCaloriesMin: 5.2 },
  { id: "k2", category: "karın göbek", name: "Karın - Plank", defaultTarget: 0, defaultBody: 80, cue: "Gövdenizi beton gibi sertleştirip saniyelere meydan okuyun.", safety: "Belinizin aşağı bükülmesine izin vermeyin.", videoPid: "TvxNkmjdhgE", avgCaloriesMin: 4.5 },
  { id: "k3", category: "karın göbek", name: "Karın - Mekik (Crunch)", defaultTarget: 0, defaultBody: 80, cue: "Kaburgalarınızı kalçanıza yaklaştırarak kasılın.", safety: "Elinizle başınızı öne doğru zorlamayın.", videoPid: "MKmrqco8Zxs", avgCaloriesMin: 4.8 },

  // Bacak
  { id: "b1", category: "bacak", name: "Bacak - Squat (Back Squat)", defaultTarget: 120, defaultBody: 80, cue: "Kalçanızı geriye verin, topuklarla fırlayarak kalkın.", safety: "Dizlerin içe bükülmesine asla izin vermeyin.", videoPid: "gcNh17C_PWA", avgCaloriesMin: 10.2 },
  { id: "b2", category: "bacak", name: "Bacak - Romanian Deadlift", defaultTarget: 100, defaultBody: 80, cue: "Kalçayı geriye uzatarak arka bacağın gerilimini hisset.", safety: "Başınızı nötr tutun, sırtınızı yuvarlamayın.", videoPid: "_Oy79S_769U", avgCaloriesMin: 8.8 },
  { id: "b3", category: "bacak", name: "Bacak - Leg Press", defaultTarget: 200, defaultBody: 80, cue: "Platformu ayağınızın ortasıyla güçlü şekilde itin.", safety: "Tepe noktasında dizlerinizi asla kilitlemeyin.", videoPid: "IZxyjW7MPpk", avgCaloriesMin: 7.8 },
  { id: "b4", category: "bacak", name: "Bacak - Lunge", defaultTarget: 24, defaultBody: 80, cue: "Adım atın ve dikey doğrultuda kontrollü şekilde çökün.", safety: "Öndeki dizin ayak parmaklarını aşırı geçmesini önleyin.", videoPid: "QOVaHWMq78U", avgCaloriesMin: 8.2 }
];

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

const getFallbackMotivation = (exerciseName: string, mentalBlockStr: string, focusLvl: string): MotivationResponse => {
  const cat = getCategoryByKey(exerciseName);
  const data = CATEGORY_MOTIVATIONS[cat] || CATEGORY_MOTIVATIONS["sırt"];
  
  const randIdx = Math.floor(Math.abs(exerciseName.length) % data.monologues.length);
  const monologue = data.monologues[randIdx] + (mentalBlockStr ? ` Zihnindeki o "${mentalBlockStr}" engelini stoik bir kararlılıkla ezerek geç. Karanlıkta döktüğün her damla ter, yarınki zırhındır.` : "");
  
  return {
    monologue,
    quotes: data.quotes,
    focusPoints: data.focus,
    rhythmBpm: focusLvl === "hyper" ? 140 : focusLvl === "aggressive" ? 150 : 110
  };
};

const getFallbackRoutine = (exerciseName: string, bodyWeightStr: string, targetWeightStr: string): RoutineResponse => {
  const cat = getCategoryByKey(exerciseName);
  const targetVal = parseFloat(targetWeightStr) || 120;
  const barWeight = 20; // 20 kg standard bar
  
  const percentages = [40, 60, 80, 90];
  const warmups: WarmupSet[] = percentages.map((pct, idx) => {
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
    estimatedDurationMin: 12
  };
};

// Fallbacks are now dynamically computed based on metric defaults
const MOCK_MOTIVATION = getFallbackMotivation("Sırt - Deadlift", "Yorgun hissediyorum", "hyper");
const MOCK_ROUTINE = getFallbackRoutine("Sırt - Deadlift", "80", "150");

export default function App() {
  // Navigation & Tabs (Walkthrough removed and replaced with library)
  const [activeTab, setActiveTab] = useState<"library" | "planner">("library");
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState<"sırt" | "göğüs" | "ön kol" | "arka kol" | "karın göbek" | "bacak">("sırt");
  
  // Calorie Burn Calculator State (Minutes)
  const [calcDuration, setCalcDuration] = useState<number>(30);
  
  // Track active playing video card
  const [playingExerciseId, setPlayingExerciseId] = useState<string | null>(null);

  // Stateful Success Celebration pop-ups to replace alerts/cinematics
  const [showCelebration, setShowCelebration] = useState(false);

  // Soundscape Synth Simulator
  const [synthPlaying, setSynthPlaying] = useState(false);
  const [ambientPreset, setAmbientPreset] = useState<"dawn_ambient" | "heavy_rhythm" | "none">("none");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<any[]>([]);
  const synthIntervalRef = useRef<any>(null);

  // Input Fields for AI Generation (Configured globally in KG)
  const [exercise, setExercise] = useState("Sırt - Deadlift");
  const [bodyWeight, setBodyWeight] = useState("80");
  const [targetWeight, setTargetWeight] = useState("150");
  const [mentalBlock, setMentalBlock] = useState("Alarmım az önce çaldı ve bugün kendimi inanılmaz yorgun hissediyorum");
  const [focusLevel, setFocusLevel] = useState<"hyper" | "calm" | "aggressive">("hyper");

  // Output Status / State
  const [motivation, setMotivation] = useState<MotivationResponse>(MOCK_MOTIVATION);
  const [routine, setRoutine] = useState<RoutineResponse>(MOCK_ROUTINE);
  const [loadingRoutine, setLoadingRoutine] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Logs / Progression Track
  const [completedSets, setCompletedSets] = useState<Record<number, boolean>>({});
  const [sessionSuccess, setSessionSuccess] = useState(false);
  const [streakDays, setStreakDays] = useState(14);

  // Dynamic Quote Sidebar state
  const [currentQuoteIdx, setCurrentQuoteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuoteIdx((prev) => (prev + 1) % ALL_STOIC_QUOTES.length);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  const shuffleQuote = () => {
    setCurrentQuoteIdx((prev) => (prev + 1) % ALL_STOIC_QUOTES.length);
  };

  // Auto recalculate routine in real-time as users edit metrics
  useEffect(() => {
    const timer = setTimeout(() => {
      setRoutine(getFallbackRoutine(exercise, bodyWeight, targetWeight));
    }, 200);
    return () => clearTimeout(timer);
  }, [exercise, bodyWeight, targetWeight]);

  // Audio Synth triggers
  const startSynth = (preset: "dawn_ambient" | "heavy_rhythm") => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      stopSynth();

      if (preset === "dawn_ambient") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gainNode = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(55, ctx.currentTime);
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(55.2, ctx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(140, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        oscillatorsRef.current = [osc1, osc2, gainNode, filter];
      } else if (preset === "heavy_rhythm") {
        let step = 0;
        const bpm = motivation.rhythmBpm || 115;
        const stepInterval = 60 / bpm / 2;

        const runBeat = () => {
          if (!audioCtxRef.current) return;
          const time = audioCtxRef.current.currentTime;

          if (step % 4 === 0) {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            osc.frequency.setValueAtTime(110, time);
            osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
            gain.gain.setValueAtTime(0.3, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.start();
            osc.stop(time + 0.2);
          }

          if (step % 2 === 1) {
            const noiseNode = audioCtxRef.current.createOscillator();
            const filterNode = audioCtxRef.current.createBiquadFilter();
            const gain = audioCtxRef.current.createGain();
            noiseNode.type = "triangle";
            noiseNode.frequency.setValueAtTime(2500, time);
            filterNode.type = "bandpass";
            filterNode.frequency.setValueAtTime(8000, time);
            gain.gain.setValueAtTime(0.02, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            noiseNode.connect(filterNode);
            filterNode.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            noiseNode.start();
            noiseNode.stop(time + 0.06);
          }

          if (step % 8 === 0 || step === 3 || step === 5) {
            const osc = audioCtxRef.current.createOscillator();
            const gain = audioCtxRef.current.createGain();
            const f = step % 8 === 0 ? 41.2 : 48.9;
            osc.type = "sine";
            osc.frequency.setValueAtTime(f, time);
            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.01, time + 0.35);
            osc.connect(gain);
            gain.connect(audioCtxRef.current.destination);
            osc.start();
            osc.stop(time + 0.4);
          }

          step = (step + 1) % 16;
        };

        synthIntervalRef.current = setInterval(runBeat, stepInterval * 1000);
      }

      setSynthPlaying(true);
      setAmbientPreset(preset);
    } catch (e) {
      console.error("Web Audio initialization failure", e);
    }
  };

  const stopSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    oscillatorsRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    oscillatorsRef.current = [];
    setSynthPlaying(false);
    setAmbientPreset("none");
  };

  // Safe plate load computation function (Metric System - kg)
  const calculatePlates = (weight: number) => {
    const barWeight = 20; // 20 kg standard Olympic bar
    const sideWeight = (weight - barWeight) / 2;
    if (sideWeight <= 0) return "Boş Bar (20 kg)";

    // Standard metric steel plates in kilograms:
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const loaded: Array<{ plate: number; qty: number }> = [];
    let rem = sideWeight;

    plates.forEach((p) => {
      const count = Math.floor(rem / p);
      if (count > 0) {
        loaded.push({ plate: p, qty: count });
        rem = rem - (count * p);
      }
    });

    if (loaded.length === 0) {
      return "Boş Bar (20 kg)";
    }

    const label = loaded
      .map(({ plate, qty }) => `${qty}x${plate}kg`)
      .join(", ");

    return `Her iki yana: ${label}`;
  };

  // API Call: Gemini Workout Plan Generation
  const fetchWorkoutPlan = async () => {
    setLoadingRoutine(true);
    setErrorMessage("");
    setCompletedSets({});
    setSessionSuccess(false);
    try {
      const res = await fetch("/api/gemini/workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exercise,
          bodyWeight,
          targetWeight
        })
      });

      if (!res.ok) {
        throw new Error("Unable to contact backend coach. Activating offline routine profile.");
      }

      const data: RoutineResponse = await res.json();
      setRoutine(data);
    } catch (err: any) {
      console.warn(err);
      setErrorMessage("Güvenli yapısal antrenman koruma ayarları kullanılıyor.");
      setRoutine(getFallbackRoutine(exercise, bodyWeight, targetWeight));
    } finally {
      setLoadingRoutine(false);
    }
  };

  const handleSetToggle = (setNum: number) => {
    setCompletedSets((prev) => {
      const next = { ...prev, [setNum]: !prev[setNum] };
      // Check if all warmup sets are done
      const allDone = routine.warmups.every((s) => next[s.setNumber]);
      if (allDone) {
        setSessionSuccess(true);
      }
      return next;
    });
  };

  const claimSuccess = () => {
    setStreakDays((prev) => prev + 1);
    setActiveTab("planner");
    stopSynth();
    setSessionSuccess(false);
    setShowCelebration(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500 selection:text-neutral-950">
      
      {/* HUD Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur sticky top-0 z-50 px-4 py-3 sm:px-6 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/10">
              <div className="h-full w-full bg-neutral-950 rounded-[7px] flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
                DAWNLIFT GÜÇ MOTİVASYONU
              </h1>
              <p className="text-xs text-neutral-500 font-mono">DAWNLIFT MOTOR v1.5 // AMBER SİLÜETLER</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            {/* Streak Counter */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono">
              <Flame className="h-4 w-4 text-orange-500 fill-orange-500 animate-bounce" />
              <span className="text-neutral-400">Seri:</span>
              <span className="text-amber-400 font-bold">{streakDays} Gün</span>
            </div>

            {/* Synthesizer Control */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline text-xs text-neutral-500 font-mono">CANLI SES ÜRET:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-neutral-900 border border-neutral-800">
                <button
                  onClick={() => ambientPreset === "dawn_ambient" ? stopSynth() : startSynth("dawn_ambient")}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                    ambientPreset === "dawn_ambient"
                      ? "bg-neutral-800 text-amber-400 font-medium"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Atmosferik gün doğumu ortam sükuneti çalar"
                >
                  Ortam Sesi
                </button>
                <button
                  onClick={() => ambientPreset === "heavy_rhythm" ? stopSynth() : startSynth("heavy_rhythm")}
                  className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                    ambientPreset === "heavy_rhythm"
                      ? "bg-neutral-800 text-amber-400 font-bold"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                  title="Simüle edilmiş ritmik odaklanma melodisi çalar"
                >
                  Odak Ritmi
                </button>
                {synthPlaying && (
                  <button
                    onClick={stopSynth}
                    className="p-1 px-2 text-neutral-400 hover:text-red-400 rounded transition-colors"
                    title="Ses Sentezleyiciyi Durdur"
                  >
                    <VolumeX className="h-3 w-3 animate-pulse" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:grid md:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Navigation Sidebar Drawer & Stoic Quotes Underneath */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="flex flex-row md:flex-col gap-2 p-1.5 md:p-0 bg-neutral-900/40 md:bg-transparent rounded-xl border border-neutral-800/60 md:border-none">
            <button
              onClick={() => setActiveTab("library")}
              className={`flex-1 md:flex-initial text-left px-4 py-3.5 rounded-lg font-mono text-xs flex items-center gap-3 transition-all ${
                activeTab === "library"
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/5 border-l-2 border-amber-500 text-white shadow-md shadow-amber-500/5"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              <Compass className="h-4 w-4 text-amber-500" />
              <span className="font-semibold uppercase tracking-wider">Egzersiz Kütüphanesi</span>
            </button>

            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 md:flex-initial text-left px-4 py-3.5 rounded-lg font-mono text-xs flex items-center gap-3 transition-all ${
                activeTab === "planner"
                  ? "bg-gradient-to-r from-amber-500/20 to-orange-500/5 border-l-2 border-amber-500 text-white shadow-md shadow-amber-500/5"
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
              }`}
            >
              <Dumbbell className="h-4 w-4 text-amber-500" />
              <span className="font-semibold uppercase tracking-wider">Aşamalı Planlayıcı</span>
            </button>
          </div>

          {/* Dynamic Auto-rotating/shuffled Stoic Gym Motivation Card */}
          <div className="w-full flex flex-col gap-3.5 p-4 rounded-xl border border-neutral-900 bg-neutral-950/40">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-amber-500 font-bold border-b border-neutral-900 pb-2">
              <span className="flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                STOİK ODAK DESTEĞİ
              </span>
              <button 
                onClick={shuffleQuote}
                className="text-neutral-500 hover:text-amber-500 transition-colors p-0.5 rounded hover:bg-neutral-900"
                title="Sıradaki Sözü Getir"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.p
                key={currentQuoteIdx}
                initial={{ opacity: 0, scale: 0.98, y: 3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -3 }}
                transition={{ duration: 0.25 }}
                className="text-xs text-neutral-300 italic leading-relaxed font-serif min-h-[3.5rem]"
              >
                &ldquo;{ALL_STOIC_QUOTES[currentQuoteIdx]}&rdquo;
              </motion.p>
            </AnimatePresence>
            <div className="text-[9px] font-mono text-neutral-600 text-right uppercase tracking-wider">
              — DAWNLIFT SEREFLİ PLATFORMU
            </div>
          </div>
        </div>

        {/* Dynamic Display Center Stage */}
        <div className="md:col-span-9 flex flex-col gap-6">
          
          {/* Fallback notifications */}
          {errorMessage && (
            <div className="bg-neutral-900 border border-amber-500/30 rounded-lg p-3 px-4 flex items-center gap-3 text-amber-400 text-xs font-mono">
              <Info className="h-4 w-4 shrink-0 animate-bounce" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: Egzersiz Kütüphanesi */}
          {activeTab === "library" && (
            <div className="flex flex-col gap-6">
              
              {/* Category Cover Image Frame */}
              <div className="relative h-48 sm:h-64 w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 group shadow-2xl">
                <img
                  src={
                    selectedLibraryCategory === "sırt" ? GYM_ASSETS.athlete_heavy_deadlift :
                    selectedLibraryCategory === "göğüs" ? GYM_ASSETS.athlete_deadlift_prep :
                    selectedLibraryCategory === "bacak" ? GYM_ASSETS.athlete_mindset_rest :
                    GYM_ASSETS.sunrise_gym_empty
                  }
                  alt={selectedLibraryCategory}
                  className="object-cover w-full h-full object-center opacity-70 transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-1">
                  <span className="text-xs uppercase tracking-widest font-semibold text-amber-500 font-mono">EGZERSİZ KÜTÜPHANESİ</span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                    {selectedLibraryCategory.toUpperCase()} PRENSİPLERİ
                  </h2>
                  <p className="text-neutral-300 text-xs sm:text-sm max-w-xl">
                    Biomekanik açıdan test edilmiş, emniyetli ve dürüst çelik yüklemeleri.
                  </p>
                </div>
              </div>

              {/* Six categories switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {(["sırt", "göğüs", "ön kol", "arka kol", "karın göbek", "bacak"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedLibraryCategory(cat)}
                    className={`py-3 rounded-xl border font-mono text-xs uppercase tracking-wide transition-all ${
                      selectedLibraryCategory === cat
                        ? "bg-amber-500 text-neutral-950 font-bold border-amber-500 shadow-lg shadow-amber-500/10"
                        : "bg-neutral-900/60 border-neutral-950 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Interactive Calorie Burn Calculator Slider */}
              <div className="bg-gradient-to-r from-neutral-900 via-neutral-900/45 to-neutral-900 border-2 border-rose-500/20 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-2xl">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-rose-500/15 rounded-xl border border-rose-500/30 text-rose-500 mt-0.5">
                    <Flame className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                      🔥 Ort. Kalori Yakım Hesaplayıcı
                    </h4>
                    <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed max-w-md">
                      Egzersiz sürenizi aşağıdaki çubukla değiştirebilir veya hızlı süre butonlarını kullanarak her hareketin yakacağı tahmini kaloriyi anlık görebilirsiniz.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 shrink-0 lg:min-w-[340px] bg-neutral-950/60 p-4 rounded-xl border border-neutral-800/85">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs font-mono font-bold">
                      <span className="text-neutral-400">ANTRENMAN SÜRESİ:</span>
                      <span className="text-rose-400 text-sm font-extrabold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {calcDuration} DAKİKA
                      </span>
                    </div>
                    {/* Highly visible custom styled slider */}
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={calcDuration}
                      onChange={(e) => setCalcDuration(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40 
                        [&::-webkit-slider-runnable-track]:bg-neutral-800 [&::-webkit-slider-runnable-track]:rounded-lg [&::-webkit-slider-runnable-track]:h-2.5
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-rose-500/50 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-125
                        [&::-moz-range-track]:bg-neutral-800 [&::-moz-range-track]:rounded-lg [&::-moz-range-track]:h-2.5
                        [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-rose-500 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-rose-500/50 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-125"
                    />
                  </div>

                  {/* Preset Quick Selectors */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase mr-1">Hızlı Ayar:</span>
                    {([15, 30, 45, 60, 90] as const).map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setCalcDuration(mins)}
                        className={`text-[10px] flex-1 py-1 rounded font-mono font-bold transition-all border ${
                          calcDuration === mins
                            ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20"
                            : "bg-neutral-900 text-neutral-400 border-neutral-800/80 hover:bg-neutral-850 hover:text-rose-400"
                        }`}
                      >
                        {mins}dk
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Exercises Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {EXERCISE_DATA.filter(ex => ex.category === selectedLibraryCategory).map((ex) => (
                  <div
                    key={ex.id}
                    className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-between transition-all hover:border-neutral-700/80 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white tracking-wide">{ex.name}</h3>
                        <div className="flex gap-1.5 flex-wrap justify-end pl-2">
                          {ex.defaultTarget > 0 && (
                            <span className="text-[9px] font-mono bg-neutral-950 text-amber-400 border border-neutral-850 p-1 px-2 rounded">
                              {ex.defaultTarget} KG HEDEF
                            </span>
                          )}
                          <span className="text-[9px] font-mono bg-neutral-950 text-rose-400 border border-neutral-850 p-1 px-2 rounded flex items-center gap-1 font-bold">
                            <Flame className="h-3 w-3 text-rose-500" />
                            ~{ex.avgCaloriesMin} kcal/dk
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2 border-l border-amber-500/20 pl-3">
                        <div className="text-neutral-300 text-xs italic">
                          &ldquo;{ex.cue}&rdquo;
                        </div>
                        <div className="text-neutral-500 text-[10px] uppercase font-mono font-bold tracking-widest mt-1">
                          EMNİYET: {ex.safety}
                        </div>
                        <div className="text-rose-400 text-[10px] uppercase font-mono font-bold tracking-widest mt-1.5 flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-rose-500 animate-pulse shrink-0" />
                          <span>Tahmini Yakım ({calcDuration} dk):</span>
                          <span className="text-white font-extrabold font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            ~{Math.round((ex.avgCaloriesMin || 6) * calcDuration)} kcal
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Biomechanical Form Guide Visualizer */}
                    <AnimatePresence>
                      {playingExerciseId === ex.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ExerciseVisualizer 
                            exerciseId={ex.id} 
                            name={ex.name} 
                            category={ex.category as any} 
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-5 border-t border-neutral-900/80 pt-4 flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          setExercise(ex.name);
                          setTargetWeight(ex.defaultTarget.toString());
                          setBodyWeight(ex.defaultBody.toString());
                          setMotivation(getFallbackMotivation(ex.name, mentalBlock, focusLevel));
                          setRoutine(getFallbackRoutine(ex.name, ex.defaultBody.toString(), ex.defaultTarget.toString()));
                          setActiveTab("planner");
                          setErrorMessage(`Kütüphaneden ${ex.name} seçildi. Antrenman planlayıcınız hazır.`);
                        }}
                        className="flex-1 py-1.5 px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg bg-neutral-950 hover:bg-neutral-900 text-neutral-300 transition-all border border-neutral-850 hover:border-amber-500/50 flex items-center justify-center gap-1.5"
                      >
                        <Dumbbell className="h-3 w-3 shrink-0 text-amber-500" />
                        PROGRAMA EKLE
                      </button>

                      <button
                        onClick={() => setPlayingExerciseId(playingExerciseId === ex.id ? null : ex.id)}
                        className={`py-1.5 px-3 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                          playingExerciseId === ex.id
                            ? "bg-amber-500 text-neutral-950 border-amber-500 font-extrabold"
                            : "bg-amber-500/5 border-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-neutral-950 hover:border-amber-500"
                        }`}
                        title="Hareketi Nasıl Yapacağınızı Video/GIF Olarak İzleyin"
                      >
                        <Video className="h-3.5 w-3.5" />
                        {playingExerciseId === ex.id ? "REHBERİ KAPAT" : "NASIL YAPILIR?"}
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Informative block */}
              <div className="bg-gradient-to-r from-neutral-950 via-amber-950/10 to-neutral-950 p-6 rounded-2xl border border-neutral-900 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Güç Disiplini Hakkında</h4>
                  <p className="text-neutral-400 text-xs leading-relaxed mt-1">
                    Bu kütüphane; sırt, göğüs, ön kol, arka kol, çekirdek ve bacak kas grupları için tasarlanmış seçkin egzersiz formülleri içerir. Her kaldırış, zihnin odaklanması sırasındaki duruluk ve biomekanik dürüstlük göz önünde bulundurularak dürüst, aşamalı yüklemelere dayandırılmıştır.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Incremental Planner (Weight Progressive Calculator) */}
          {activeTab === "planner" && (
            <div className="flex flex-col gap-6">
              
              <div className="bg-neutral-900/40 rounded-2xl border border-neutral-900 p-6 flex flex-col gap-6">
                
                {/* Reactive Weight & Goal Settings form fields */}
                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-850 flex flex-col gap-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    KALDIRIŞ HEDEFİ VE ISINMA AYARLARI
                  </span>
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Seçilen Egzersiz</label>
                      <select
                        value={exercise}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExercise(val);
                          const match = EXERCISE_DATA.find(ex => ex.name === val);
                          if (match) {
                            setTargetWeight(match.defaultTarget.toString());
                            setBodyWeight(match.defaultBody.toString());
                          }
                        }}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-xs text-neutral-200 outline-none focus:border-amber-500 w-full font-mono"
                      >
                        {EXERCISE_DATA.map((ex) => (
                          <option key={ex.id} value={ex.name}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-neutral-400 uppercase">Vücut Ağırlığınız (kg)</label>
                      <input
                        type="number"
                        value={bodyWeight}
                        onChange={(e) => setBodyWeight(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-xs font-mono text-neutral-200 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-amber-500 uppercase font-bold">Hedef Maksimum Ağırlık (kg)</label>
                      <input
                        type="number"
                        value={targetWeight}
                        onChange={(e) => setTargetWeight(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 px-3 text-xs font-mono text-amber-500 outline-none focus:border-amber-500 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-neutral-900/60 pt-4">
                  <div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Aşamalı Isınma Planlayıcı</h2>
                    <p className="text-xs text-neutral-400 mt-1">
                      Hedefiniz olan {targetWeight || "150"} kg ağırlığına giden güvenli ısınma setlerini hesaplar.
                    </p>
                  </div>

                  <button
                    onClick={fetchWorkoutPlan}
                    disabled={loadingRoutine}
                    className="bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-2.5 px-5 rounded-lg text-xs font-mono font-bold text-amber-500 uppercase transition-all flex items-center gap-2 shadow-lg"
                  >
                    {loadingRoutine ? (
                      <>
                        <span className="animate-spin h-3.5 w-3.5 border-2 border-amber-500 border-t-transparent rounded-full" />
                        TABLO YENİDEN HESAPLANIYOR...
                      </>
                    ) : (
                      <>
                        <Compass className="h-4 w-4 animate-spin-slow" />
                        PROGRAM OLUŞTUR
                      </>
                    )}
                  </button>
                </div>

                {/* Micro indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-neutral-900 pt-5">
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">Sistem Modeli</span>
                    <span className="text-xs font-bold text-white block mt-1 uppercase tracking-wide">{exercise}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                      <Flame className="h-2.5 w-2.5 text-rose-500 shrink-0" /> Tahmini Isınma & Kalori
                    </span>
                    <span className="text-xs font-bold text-white block mt-1 tracking-wide">
                      {routine.estimatedDurationMin} Dakika / ~{Math.round((EXERCISE_DATA.find(ex => ex.name === exercise)?.avgCaloriesMin || 6) * (routine.estimatedDurationMin || 12))} kcal
                    </span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">Stoik Demir Mantrası</span>
                    <span className="text-xs font-bold text-amber-500 block mt-1 uppercase tracking-wide font-mono">{routine.mindsetKey}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-900">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase">Tamamlanan İlerleme</span>
                    <span className="text-xs font-bold text-white block mt-1 font-mono">
                      {Object.values(completedSets).filter(Boolean).length} / {routine.warmups.length} Set
                    </span>
                  </div>
                </div>

                {/* Warmup tables */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                    Aşamalı Isınma Basamakları
                  </span>
                  
                  <div className="space-y-3">
                    {routine.warmups.map((set) => {
                      const isDone = completedSets[set.setNumber];
                      return (
                        <div
                          key={set.setNumber}
                          onClick={() => handleSetToggle(set.setNumber)}
                          className={`group cursor-pointer p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            isDone
                              ? "bg-neutral-900/20 border-neutral-900 opacity-60"
                              : "bg-neutral-950 border-neutral-800/80 hover:border-amber-500/40 hover:bg-neutral-900/10"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`h-8 w-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center shrink-0 ${
                              isDone ? "bg-neutral-800 text-neutral-500" : "bg-neutral-900 text-amber-500 border border-neutral-800"
                            }`}>
                              W{set.setNumber}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-sm font-bold font-mono tracking-tight ${isDone ? "line-through text-neutral-500" : "text-white"}`}>
                                  {set.weight} kg
                                </span>
                                <span className="text-xs text-neutral-500">x</span>
                                <span className="text-xs font-bold text-neutral-300 font-mono">{set.reps} Tekrar</span>
                                
                                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 font-mono">
                                  %{set.intensityPct}
                                </span>

                                {set.chalkRequired && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono uppercase font-semibold">
                                    Tebeşir Gerekli
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-neutral-400 mt-1 leading-relaxed italic">
                                &ldquo;{set.coachingCue}&rdquo;
                              </p>
                              
                              {/* Plate Loader Spec calculation */}
                              <div className="mt-1 text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                                <span className="text-neutral-600">Bara Yüklenecek:</span>
                                {calculatePlates(set.weight)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-end sm:justify-start">
                            <div className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                              isDone ? "bg-amber-500 border-amber-500 text-neutral-950" : "border-neutral-700 bg-neutral-950 group-hover:border-neutral-500"
                            }`}>
                              {isDone && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Safe attempts checkpoints */}
                <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 flex flex-col gap-3">
                  <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    DEMİR PLATFORM GÜVENLİK PROTOKOLLERİ
                  </span>
                  <div className="space-y-2">
                    {routine.safetyNotes.map((note, idx) => (
                      <p key={idx} className="text-xs text-neutral-400 leading-relaxed pl-5 relative before:absolute before:left-1 before:top-2 before:h-1 before:w-1 before:bg-amber-500 before:rounded-full">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>

              </div>

              {/* Complete Workout Session Modal Trigger state */}
              {sessionSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-neutral-950 border-2 border-amber-500 p-6 rounded-2xl shadow-xl flex flex-col items-center text-center gap-4 py-8"
                >
                  <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/25">
                    <Trophy className="h-7 w-7 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider">Şafak Kaldırışı Tamamlandı!</h3>
                    <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                      Tüm aşamalı setler hassasiyetle uygulandı. Kasların sıcak, zihnin sakin ve güneş artık tamamen doğdu.
                    </p>
                  </div>
                  <button
                    onClick={claimSuccess}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-mono text-xs uppercase font-bold px-6 py-2.5 rounded-lg shadow"
                  >
                    Seriyi Kilitle & Tamamla
                  </button>
                </motion.div>
              )}

            </div>
          )}

        </div>

      </main>

      {/* Dynamic Stateful Success Celebration Modal Overlays */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.93, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 15 }}
              className="relative max-w-xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center gap-6 shadow-2xl shadow-amber-500/5 overflow-hidden"
            >
              
              {/* Premium abstract amber ambient glow in the card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500 blur-sm rounded-full" />
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

              {/* Coach Symbol with bounce */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-[1px] flex items-center justify-center shadow-lg shadow-amber-500/15">
                <div className="h-full w-full bg-neutral-950 rounded-[15px] flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-amber-400 animate-pulse" />
                </div>
              </div>

              {/* Title & Turkish Coach Headset Praise */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold block mb-1">ANTRENÖR BİLDİRİMİ // KULAKLIK CANLI</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white uppercase tracking-tight">DİSİPLİNE HÜKMETTİN!</h3>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mt-3 italic bg-neutral-950/50 p-4 rounded-xl border border-neutral-900 leading-relaxed">
                  &ldquo;Kulaklığına iyi bak sporcu, beni dinliyorsun: Hiç kimse seni zorlamazken, tüm dünya uykunun rehavetindeyken o demir bara yapışıp bu {targetWeight} kg ağırlığı ezmek her babayiğidin harcı değildir! Bu silsileyi dürüst bir stoik gibi tamamladın. Sırtını, ciğerini ve zihnini öyle bir kilitledin ki demir sana teslim oldu. Kararlılık rüzgarı arkanda, hiçbir engel seni yıkamaz! Şimdi git ve bu günü de darmadağın et. Disiplin her şeydir.&rdquo;
                </p>
              </div>

              {/* Dynamic stats tracker row */}
              <div className="w-full grid grid-cols-3 gap-3 border-y border-neutral-800/80 py-4 font-mono">
                <div className="text-center">
                  <span className="text-[9px] text-neutral-500 uppercase block">Seri Durumu</span>
                  <span className="text-sm font-bold text-amber-400 block mt-1">{streakDays} GÜN</span>
                </div>
                <div className="text-center border-x border-neutral-800/80">
                  <span className="text-[9px] text-neutral-500 uppercase block">Son Yükleme</span>
                  <span className="text-sm font-bold text-white block mt-1">{targetWeight} KG</span>
                </div>
                <div className="text-center">
                  <span className="text-[9px] text-neutral-500 uppercase block">Odak Seviyesi</span>
                  <span className="text-sm font-bold text-emerald-400 block mt-1">SEÇKİN</span>
                </div>
              </div>

              {/* Dynamic micro messages cards to boost Turkish motivation */}
              <div className="w-full text-left bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-3.5 rounded-xl border border-amber-500/20 text-xs text-amber-300 font-mono leading-normal flex items-start gap-2.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-1.5 animate-ping" />
                <div>
                  <span className="font-bold uppercase tracking-wider block">GÜNLÜK TAKTİK ALARMI:</span>
                  Yarın yine platformun soğuk sessizliğinde aynı disiplinle buluşalım. Tebeşirini eksik etme.
                </div>
              </div>

              {/* Close CTA button */}
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-3 rounded-xl bg-amber-500 text-neutral-950 font-mono font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
              >
                GÜÇ SERİSİNİ SÜRDÜR (YOLUNA DEVAM ET)
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aesthetic Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 backdrop-blur py-5 text-center text-[10px] font-mono text-neutral-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>DAWNLIFT STOİK MOTORU ÇALIŞIYOR v1.5 // PRESTİJLİ GÜÇ VE ANTRENMAN DENEYİMİ</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
            İSTASYON DURUMU: MÜKEMMEL // TÜM GÖSTERGELER NOMİNAL
          </span>
        </div>
      </footer>

    </div>
  );
}
