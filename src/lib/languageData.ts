import { createContext } from "react";
import type { CameraSourceType, PlatformEventData } from "@/types/camera";
import type { ReportStatus } from "@/types/report";

export type Lang = "en" | "ar";

export const STORAGE_KEY = "firedetect.lang.v1";

export interface Dictionary {
  nav: { dashboard: string; map: string; report: string; admin: string };
  works: {
    title: string;
    m1title: string;
    m1body: string;
    m2title: string;
    m2body: string;
    m3title: string;
    m3body: string;
  };
  status: {
    title: string;
    body: string;
    cameraLabel: string;
    reportLabel: string;
    cameraAlarm: string;
    cameraRecent: string;
    cameraClear: string;
    reportNew: string;
    reportAck: string;
    reportFalse: string;
  };
  start: {
    title: string;
    body: string;
    s1title: string;
    s1body: string;
    s1cta: string;
    s2title: string;
    s2body: string;
    s2cta: string;
    s3title: string;
    s3body: string;
    s3cta: string;
  };
  footer: { tagline: string };

  common: {
    sourceLabel: Record<CameraSourceType, string>;
    reportStatusLabel: Record<ReportStatus, string>;
    contact: string;
    camera: string;
    acknowledge: string;
    falseAlarm: string;
    reset: string;
    alarmTag: string;
    mapUnavailable: string;
  };

  topBar: {
    tagline: string;
    cameras: string;
    live: string;
    alarms: string;
    offline: string;
    detectionServer: string;
    checking: string;
    connected: string;
    unreachable: string;
    zuluTime: string;
  };

  cameraRail: {
    camerasCount: string;
    add: string;
    emptyLine1: string;
    emptyLine2: string;
    emptyLine3: string;
    configureTitle: string;
    removeTitle: string;
    footerLine1: string;
    footerLine2: string;
  };

  statusPanels: {
    eventLog: string;
    eventsEmpty: string;
    streamDetail: string;
    selectCamera: string;
    fireAlarmTag: string;
    fireAlarmBody: string;
    idLabel: string;
    sourceLabel: string;
    urlLabel: string;
    signalLabel: string;
    locationLabel: string;
    addedLabel: string;
  };

  cameraFeed: {
    connecting: string;
    permissionDenied: string;
    streamOffline: string;
    fireAlarmBanner: string;
    live: string;
    demo: string;
    aiAnalyzing: string;
    corsBlocked: string;
    serverUnreachable: string;
    demoPlaceholder: string;
    getUserMediaUnsupported: string;
    noDeviceFound: string;
    missingStreamUrl: string;
    hlsUnsupported: string;
    cannotReachStream: string;
    streamUnavailable: string;
  };

  cameraDialog: {
    configureTitle: string;
    addTitle: string;
    hintWebcam: string;
    hintHls: string;
    hintMjpeg: string;
    hintDemo: string;
    name: string;
    namePlaceholder: string;
    sourceType: string;
    webcam: string;
    hls: string;
    mjpeg: string;
    device: string;
    detectingDevices: string;
    selectDevicePlaceholder: string;
    permErrorDenied: string;
    permErrorGeneric: string;
    streamUrl: string;
    locationLabel: string;
    locationPlaceholder: string;
    mapPosition: string;
    useMyLocation: string;
    locating: string;
    mapPositionBody: string;
    cancel: string;
    saveChanges: string;
    addCamera: string;
  };

  dashboard: {
    primaryFeed: string;
    configure: string;
    addMoreCameras: string;
    noCameraSelectedTitle: string;
    noCameraSelectedBody: string;
    addCameraCta: string;
    loadDemoCameras: string;
  };

  mapView: {
    emptyTitle: string;
    emptyBody: string;
    goToDashboard: string;
    loadingMap: string;
    legend: string;
    camAbbrev: string;
    openAbbrev: string;
  };

  reportFire: {
    receivedTitle: string;
    receivedBody: string;
    submitAnother: string;
    title: string;
    body: string;
    locationLabel: string;
    useMyLocation: string;
    locating: string;
    pinnedAt: (lat: string, lng: string) => string;
    clickMap: string;
    whatSeeing: string;
    descPlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    photoLabel: string;
    photoAlt: string;
    removePhoto: string;
    attachPhoto: string;
    geoUnavailable: string;
    geoFailed: string;
    chooseImage: string;
    photoReadFail: string;
    submit: string;
    submitting: string;
    genericError: string;
  };

  admin: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterNew: string;
    filterAck: string;
    filterFalse: string;
    loading: string;
    noneYet: string;
    noneMatch: string;
    openForm: string;
    viewOnMap: string;
  };

  formatEvent: (data: PlatformEventData) => string;
}

const en: Dictionary = {
  nav: { dashboard: "Dashboard", map: "Map", report: "Report a Fire", admin: "Admin" },
  works: {
    title: "How FireDetect works",
    m1title: "Any camera becomes a watcher",
    m1body: "Webcam, HLS stream, or MJPEG feed — point it at open land and it's a frame source. No proprietary hardware.",
    m2title: "AI and people, both watching",
    m2body: "A YOLOv8 fire/smoke model raises alarms on confirmed detections across frames. Anyone nearby can drop a pin the moment they see smoke themselves — no login.",
    m3title: "One live map, not two systems",
    m3body: "AI alarms and human reports sit on the same map as first-class equals, color-coded by the same status law.",
  },
  status: {
    title: "One status law, everywhere",
    body: "Every color on FireDetect means exactly one thing, consistently — on the map, in the dashboard, in a report popup. Nothing is colored for decoration.",
    cameraLabel: "Camera alarm state",
    reportLabel: "Public report status",
    cameraAlarm: "Active fire alarm",
    cameraRecent: "Recently alarmed",
    cameraClear: "Clear",
    reportNew: "Unverified report",
    reportAck: "Acknowledged",
    reportFalse: "False alarm",
  },
  start: {
    title: "Get started",
    body: "Three steps, no setup wizard. Each one opens the real tool.",
    s1title: "Add a camera",
    s1body: "This PC's webcam works immediately for testing. Set its map position so it shows up live.",
    s1cta: "Open the dashboard",
    s2title: "Watch the live map",
    s2body: "Every located camera and every public report, plotted together, updating in real time.",
    s2cta: "Open the map",
    s3title: "Report what you see",
    s3body: "Drop a pin, describe it, optionally attach a photo. No account required.",
    s3cta: "Report a fire",
  },
  footer: { tagline: "— protecting forests from fire." },

  common: {
    sourceLabel: {
      webcam: "LOCAL WEBCAM",
      hls: "HLS STREAM",
      mjpeg: "MJPEG STREAM",
      demo: "DEMO FEED",
    },
    reportStatusLabel: {
      new: "Unverified",
      acknowledged: "Acknowledged",
      false_alarm: "False Alarm",
    },
    contact: "Contact",
    camera: "Camera",
    acknowledge: "Acknowledge",
    falseAlarm: "False Alarm",
    reset: "Reset",
    alarmTag: "ALARM",
    mapUnavailable: "Map unavailable — set VITE_MAPBOX_TOKEN in .env.local and restart the dev server.",
  },

  topBar: {
    tagline: "Early Wildfire Detection",
    cameras: "Cameras",
    live: "Live",
    alarms: "Alarms",
    offline: "Offline",
    detectionServer: "Detection Server",
    checking: "Checking…",
    connected: "Connected",
    unreachable: "Unreachable",
    zuluTime: "Zulu Time",
  },

  cameraRail: {
    camerasCount: "Cameras",
    add: "Add",
    emptyLine1: "No cameras configured.",
    emptyLine2: "Add your PC webcam to test, or connect",
    emptyLine3: "an HLS/MJPEG camera.",
    configureTitle: "Configure",
    removeTitle: "Remove",
    footerLine1: "Detection runs on the server.",
    footerLine2: "Cameras only supply frames.",
  },

  statusPanels: {
    eventLog: "Event Log",
    eventsEmpty: "Platform events will appear here — cameras added, streams connected, errors.",
    streamDetail: "Stream Detail",
    selectCamera: "Select a camera to inspect its connection.",
    fireAlarmTag: "FIRE ALARM",
    fireAlarmBody: "The detection server confirmed a fire signature on this feed across consecutive frames.",
    idLabel: "ID",
    sourceLabel: "SOURCE",
    urlLabel: "URL",
    signalLabel: "SIGNAL",
    locationLabel: "LOCATION",
    addedLabel: "ADDED",
  },

  cameraFeed: {
    connecting: "Connecting",
    permissionDenied: "PERMISSION DENIED",
    streamOffline: "STREAM OFFLINE",
    fireAlarmBanner: "FIRE ALARM — SERVER CONFIRMED",
    live: "LIVE",
    demo: "DEMO",
    aiAnalyzing: "AI: SERVER ANALYZING",
    corsBlocked: "frame blocked by CORS",
    serverUnreachable: "detection server unreachable",
    demoPlaceholder: "Generated placeholder — not a real feed",
    getUserMediaUnsupported: "getUserMedia not supported in this browser",
    noDeviceFound: "no camera device found",
    missingStreamUrl: "missing stream URL",
    hlsUnsupported: "HLS not supported in this browser",
    cannotReachStream: "cannot reach stream",
    streamUnavailable: "stream unavailable",
  },

  cameraDialog: {
    configureTitle: "Configure Camera",
    addTitle: "Add Camera",
    hintWebcam: "Use a camera attached to this PC — good for testing.",
    hintHls: "HTTP Live Streaming URL (.m3u8). Most IP cameras/NVRs can publish HLS.",
    hintMjpeg: "Motion-JPEG over HTTP, e.g. http://192.168.1.50:8080/video",
    hintDemo: "A generated showcase feed — not user-configurable.",
    name: "Name",
    namePlaceholder: "e.g. Tower 12 — North Ridge",
    sourceType: "Source Type",
    webcam: "Webcam",
    hls: "HLS",
    mjpeg: "MJPEG",
    device: "Device",
    detectingDevices: "Detecting camera devices…",
    selectDevicePlaceholder: "Select device",
    permErrorDenied: "Camera permission denied — allow access to pick a device.",
    permErrorGeneric: "Could not list camera devices.",
    streamUrl: "Stream URL",
    locationLabel: "Location label (optional)",
    locationPlaceholder: "e.g. Sector A-1 · Ridge tower",
    mapPosition: "Map position (optional)",
    useMyLocation: "USE MY LOCATION",
    locating: "LOCATING…",
    mapPositionBody: "Puts this camera on the live map.",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    addCamera: "Add Camera",
  },

  dashboard: {
    primaryFeed: "Primary Feed",
    configure: "CONFIGURE",
    addMoreCameras: "Add more cameras to build out the monitoring wall.",
    noCameraSelectedTitle: "No camera selected",
    noCameraSelectedBody: "Add your first camera — this PC's webcam works out of the box for testing. Frames are analyzed by the detection server, which alone raises fire alarms.",
    addCameraCta: "ADD CAMERA",
    loadDemoCameras: "LOAD DEMO CAMERAS",
  },

  mapView: {
    emptyTitle: "Nothing on the map yet",
    emptyBody: "Set a camera's position from the Dashboard, or wait for a public fire report to appear here.",
    goToDashboard: "GO TO DASHBOARD",
    loadingMap: "Loading map…",
    legend: "Legend",
    camAbbrev: "cam",
    openAbbrev: "open",
  },

  reportFire: {
    receivedTitle: "Report received",
    receivedBody: "Thank you — your report is now visible on the live map for review.",
    submitAnother: "Submit another report",
    title: "Report a Fire",
    body: "Seeing smoke or flames? Drop a pin on the map (or use your location), tell us what you're seeing, and optionally attach a photo.",
    locationLabel: "Location",
    useMyLocation: "Use my current location",
    locating: "Locating…",
    pinnedAt: (lat, lng) => `Pinned at ${lat}, ${lng} — or click the map to move it.`,
    clickMap: "Or click anywhere on the map to drop a pin.",
    whatSeeing: "What are you seeing?",
    descPlaceholder: "e.g. Heavy smoke rising from the tree line behind the gas station",
    contactLabel: "Contact (optional)",
    contactPlaceholder: "Phone or email, in case we need details",
    photoLabel: "Photo (optional)",
    photoAlt: "Attached photo",
    removePhoto: "Remove photo",
    attachPhoto: "Attach a photo",
    geoUnavailable: "Geolocation isn't available in this browser — drop a pin on the map instead.",
    geoFailed: "Couldn't get your location — drop a pin on the map instead.",
    chooseImage: "Please choose an image file.",
    photoReadFail: "Couldn't read that photo — try another one.",
    submit: "Submit Report",
    submitting: "Submitting…",
    genericError: "Something went wrong — try again.",
  },

  admin: {
    title: "Reports",
    subtitle: "Every public fire report, newest first. Update status here or from the map popup.",
    filterAll: "All",
    filterNew: "Unverified",
    filterAck: "Acknowledged",
    filterFalse: "False Alarm",
    loading: "Loading reports…",
    noneYet: "No reports yet — they'll appear here the moment someone submits one.",
    noneMatch: "No reports match this filter.",
    openForm: "OPEN THE REPORT FORM",
    viewOnMap: "VIEW ON MAP",
  },

  formatEvent: (data) => {
    switch (data.kind) {
      case "cameraAdded":
        return `Camera added — ${data.name} (${en.common.sourceLabel[data.type]})`;
      case "cameraUpdated":
        return `Camera updated — ${data.name}`;
      case "cameraRemoved":
        return `Camera removed — ${data.name}`;
      case "demoCamerasLoaded":
        return `Demo cameras loaded — ${data.count} showcase feed${data.count === 1 ? "" : "s"} added`;
      case "streamLive":
        return `Stream live — ${data.name}${data.detail ? ` · ${data.detail}` : ""}`;
      case "streamError":
        return `Stream error — ${data.name}: ${data.detail ?? "unknown"}`;
      case "webcamDenied":
        return `Webcam permission denied — ${data.name}`;
      case "fireAlarm":
        return `FIRE ALARM — ${data.name} · confirmed by detection server`;
      case "alarmCleared":
        return `Alarm cleared — ${data.name}`;
    }
  },
};

const ar: Dictionary = {
  nav: { dashboard: "لوحة التحكم", map: "الخريطة", report: "الإبلاغ عن حريق", admin: "الإدارة" },
  works: {
    title: "كيف يعمل FireDetect",
    m1title: "أي كاميرا تصبح مراقِبًا",
    m1body: "كاميرا ويب، بث HLS، أو تدفق MJPEG — وجّهها نحو الأرض المفتوحة لتصبح مصدر إطارات. لا حاجة لأجهزة خاصة.",
    m2title: "الذكاء الاصطناعي والناس، كلاهما يراقب",
    m2body: "يطلق نموذج YOLOv8 لكشف الحريق والدخان إنذارات عند تأكيد الكشف عبر الإطارات المتتالية. يمكن لأي شخص قريب وضع علامة موقع فور رؤية الدخان بنفسه — دون تسجيل دخول.",
    m3title: "خريطة حية واحدة، لا نظامان منفصلان",
    m3body: "تظهر إنذارات الذكاء الاصطناعي وبلاغات البشر على نفس الخريطة كطرفين متساويين، بترميز لوني موحّد للحالة.",
  },
  status: {
    title: "قانون ألوان واحد، في كل مكان",
    body: "كل لون في FireDetect يعني شيئًا واحدًا فقط، وبثبات — على الخريطة، في لوحة التحكم، وفي نافذة البلاغ. لا لون بلا معنى.",
    cameraLabel: "حالة إنذار الكاميرا",
    reportLabel: "حالة البلاغ العام",
    cameraAlarm: "إنذار حريق نشط",
    cameraRecent: "أُنذر مؤخرًا",
    cameraClear: "لا خطر",
    reportNew: "بلاغ غير مؤكد",
    reportAck: "تم الاطلاع عليه",
    reportFalse: "إنذار كاذب",
  },
  start: {
    title: "ابدأ الآن",
    body: "ثلاث خطوات، دون معالج إعداد. كل خطوة تفتح الأداة الحقيقية.",
    s1title: "أضف كاميرا",
    s1body: "كاميرا هذا الحاسوب تعمل فورًا للتجربة. حدّد موقعها على الخريطة لتظهر مباشرة.",
    s1cta: "افتح لوحة التحكم",
    s2title: "راقب الخريطة الحية",
    s2body: "كل كاميرا محدَّدة الموقع وكل بلاغ عام، معروضان معًا، ويتحدّثان لحظيًا.",
    s2cta: "افتح الخريطة",
    s3title: "أبلغ عمّا تراه",
    s3body: "ضع علامة على الموقع، صِف ما تراه، وأرفق صورة إن أردت. لا حاجة لحساب.",
    s3cta: "الإبلاغ عن حريق",
  },
  footer: { tagline: "— نحمي الغابات من الحرائق." },

  common: {
    sourceLabel: {
      webcam: "كاميرا محلية",
      hls: "بث HLS",
      mjpeg: "بث MJPEG",
      demo: "بث تجريبي",
    },
    reportStatusLabel: {
      new: "غير مؤكد",
      acknowledged: "تم الاطلاع عليه",
      false_alarm: "إنذار كاذب",
    },
    contact: "التواصل",
    camera: "كاميرا",
    acknowledge: "تأكيد الاطلاع",
    falseAlarm: "إنذار كاذب",
    reset: "إعادة تعيين",
    alarmTag: "إنذار",
    mapUnavailable: "الخريطة غير متاحة — عيّن VITE_MAPBOX_TOKEN في .env.local وأعد تشغيل خادم التطوير.",
  },

  topBar: {
    tagline: "كشف مبكر لحرائق الغابات",
    cameras: "الكاميرات",
    live: "مباشر",
    alarms: "الإنذارات",
    offline: "غير متصل",
    detectionServer: "خادم الكشف",
    checking: "جارٍ الفحص…",
    connected: "متصل",
    unreachable: "غير متاح",
    zuluTime: "توقيت زولو",
  },

  cameraRail: {
    camerasCount: "الكاميرات",
    add: "إضافة",
    emptyLine1: "لا توجد كاميرات مُعدّة.",
    emptyLine2: "أضف كاميرا هذا الحاسوب للتجربة، أو اربط",
    emptyLine3: "كاميرا HLS/MJPEG.",
    configureTitle: "إعداد",
    removeTitle: "إزالة",
    footerLine1: "يعمل الكشف على الخادم.",
    footerLine2: "الكاميرات توفر الإطارات فقط.",
  },

  statusPanels: {
    eventLog: "سجل الأحداث",
    eventsEmpty: "ستظهر أحداث المنصة هنا — إضافة كاميرات، اتصال البث، الأخطاء.",
    streamDetail: "تفاصيل البث",
    selectCamera: "اختر كاميرا لفحص اتصالها.",
    fireAlarmTag: "إنذار حريق",
    fireAlarmBody: "أكّد خادم الكشف وجود بصمة حريق في هذا البث عبر إطارات متتالية.",
    idLabel: "المعرّف",
    sourceLabel: "المصدر",
    urlLabel: "الرابط",
    signalLabel: "الإشارة",
    locationLabel: "الموقع",
    addedLabel: "أُضيفت",
  },

  cameraFeed: {
    connecting: "جارٍ الاتصال",
    permissionDenied: "تم رفض الإذن",
    streamOffline: "البث غير متصل",
    fireAlarmBanner: "إنذار حريق — أكّده الخادم",
    live: "مباشر",
    demo: "تجريبي",
    aiAnalyzing: "الذكاء الاصطناعي: الخادم يحلّل",
    corsBlocked: "تم حظر الإطار بسبب سياسة CORS",
    serverUnreachable: "خادم الكشف غير متاح",
    demoPlaceholder: "بث تجريبي مُولَّد — ليس بثًا حقيقيًا",
    getUserMediaUnsupported: "getUserMedia غير مدعوم في هذا المتصفح",
    noDeviceFound: "لم يتم العثور على جهاز كاميرا",
    missingStreamUrl: "رابط البث مفقود",
    hlsUnsupported: "HLS غير مدعوم في هذا المتصفح",
    cannotReachStream: "تعذّر الوصول إلى البث",
    streamUnavailable: "البث غير متاح",
  },

  cameraDialog: {
    configureTitle: "إعداد الكاميرا",
    addTitle: "إضافة كاميرا",
    hintWebcam: "استخدم كاميرا متصلة بهذا الحاسوب — مناسبة للتجربة.",
    hintHls: "رابط بث HLS (.m3u8). معظم كاميرات/مسجلات IP تدعم HLS.",
    hintMjpeg: "بث Motion-JPEG عبر HTTP، مثل http://192.168.1.50:8080/video",
    hintDemo: "بث تجريبي مُولَّد — غير قابل للتعديل.",
    name: "الاسم",
    namePlaceholder: "مثال: البرج 12 — الحافة الشمالية",
    sourceType: "نوع المصدر",
    webcam: "كاميرا ويب",
    hls: "HLS",
    mjpeg: "MJPEG",
    device: "الجهاز",
    detectingDevices: "جارٍ اكتشاف أجهزة الكاميرا…",
    selectDevicePlaceholder: "اختر جهازًا",
    permErrorDenied: "تم رفض إذن الكاميرا — امنح الوصول لاختيار جهاز.",
    permErrorGeneric: "تعذّر عرض أجهزة الكاميرا.",
    streamUrl: "رابط البث",
    locationLabel: "وصف الموقع (اختياري)",
    locationPlaceholder: "مثال: القطاع A-1 · برج الحافة",
    mapPosition: "الموقع على الخريطة (اختياري)",
    useMyLocation: "استخدام موقعي",
    locating: "جارٍ التحديد…",
    mapPositionBody: "يضع هذه الكاميرا على الخريطة الحية.",
    cancel: "إلغاء",
    saveChanges: "حفظ التغييرات",
    addCamera: "إضافة كاميرا",
  },

  dashboard: {
    primaryFeed: "البث الرئيسي",
    configure: "إعداد",
    addMoreCameras: "أضف المزيد من الكاميرات لتوسيع جدار المراقبة.",
    noCameraSelectedTitle: "لم يتم اختيار كاميرا",
    noCameraSelectedBody: "أضف أول كاميرا — كاميرا هذا الحاسوب تعمل فورًا للتجربة. يقوم خادم الكشف بتحليل الإطارات، وهو وحده من يطلق إنذارات الحريق.",
    addCameraCta: "إضافة كاميرا",
    loadDemoCameras: "تحميل كاميرات تجريبية",
  },

  mapView: {
    emptyTitle: "لا يوجد شيء على الخريطة بعد",
    emptyBody: "حدّد موقع كاميرا من لوحة التحكم، أو انتظر ظهور بلاغ حريق عام هنا.",
    goToDashboard: "الذهاب إلى لوحة التحكم",
    loadingMap: "جارٍ تحميل الخريطة…",
    legend: "المفتاح",
    camAbbrev: "كاميرا",
    openAbbrev: "مفتوح",
  },

  reportFire: {
    receivedTitle: "تم استلام البلاغ",
    receivedBody: "شكرًا لك — بلاغك ظاهر الآن على الخريطة الحية للمراجعة.",
    submitAnother: "إرسال بلاغ آخر",
    title: "الإبلاغ عن حريق",
    body: "هل ترى دخانًا أو ألسنة لهب؟ ضع علامة على الخريطة (أو استخدم موقعك)، وأخبرنا بما تراه، ويمكنك إرفاق صورة اختياريًا.",
    locationLabel: "الموقع",
    useMyLocation: "استخدام موقعي الحالي",
    locating: "جارٍ التحديد…",
    pinnedAt: (lat, lng) => `تم التثبيت عند ${lat}، ${lng} — أو انقر على الخريطة لتحريكه.`,
    clickMap: "أو انقر في أي مكان على الخريطة لوضع علامة.",
    whatSeeing: "ماذا ترى؟",
    descPlaceholder: "مثال: دخان كثيف يتصاعد من خط الأشجار خلف محطة الوقود",
    contactLabel: "التواصل (اختياري)",
    contactPlaceholder: "رقم هاتف أو بريد إلكتروني، في حال احتجنا لتفاصيل",
    photoLabel: "صورة (اختياري)",
    photoAlt: "الصورة المرفقة",
    removePhoto: "إزالة الصورة",
    attachPhoto: "إرفاق صورة",
    geoUnavailable: "تحديد الموقع الجغرافي غير متاح في هذا المتصفح — ضع علامة على الخريطة بدلًا من ذلك.",
    geoFailed: "تعذّر تحديد موقعك — ضع علامة على الخريطة بدلًا من ذلك.",
    chooseImage: "الرجاء اختيار ملف صورة.",
    photoReadFail: "تعذّرت قراءة الصورة — جرّب صورة أخرى.",
    submit: "إرسال البلاغ",
    submitting: "جارٍ الإرسال…",
    genericError: "حدث خطأ ما — حاول مجددًا.",
  },

  admin: {
    title: "البلاغات",
    subtitle: "كل بلاغ حريق عام، الأحدث أولًا. حدّث الحالة هنا أو من نافذة الخريطة.",
    filterAll: "الكل",
    filterNew: "غير مؤكد",
    filterAck: "تم الاطلاع عليه",
    filterFalse: "إنذار كاذب",
    loading: "جارٍ تحميل البلاغات…",
    noneYet: "لا توجد بلاغات بعد — ستظهر هنا بمجرد أن يرسل أحدهم بلاغًا.",
    noneMatch: "لا توجد بلاغات مطابقة لهذا الفلتر.",
    openForm: "افتح نموذج البلاغ",
    viewOnMap: "عرض على الخريطة",
  },

  formatEvent: (data) => {
    switch (data.kind) {
      case "cameraAdded":
        return `تمت إضافة كاميرا — ${data.name} (${ar.common.sourceLabel[data.type]})`;
      case "cameraUpdated":
        return `تم تحديث الكاميرا — ${data.name}`;
      case "cameraRemoved":
        return `تمت إزالة الكاميرا — ${data.name}`;
      case "demoCamerasLoaded":
        return `تم تحميل كاميرات تجريبية — أُضيف ${data.count} بثًا تجريبيًا`;
      case "streamLive":
        return `البث مباشر — ${data.name}${data.detail ? ` · ${data.detail}` : ""}`;
      case "streamError":
        return `خطأ في البث — ${data.name}: ${data.detail ?? "غير معروف"}`;
      case "webcamDenied":
        return `تم رفض إذن الكاميرا — ${data.name}`;
      case "fireAlarm":
        return `إنذار حريق — ${data.name} · أكّده خادم الكشف`;
      case "alarmCleared":
        return `تم مسح الإنذار — ${data.name}`;
    }
  },
};

export const DICTS: Record<Lang, Dictionary> = { en, ar };

export interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dictionary;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function loadLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}
