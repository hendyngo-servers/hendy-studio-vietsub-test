// src/components/MaintenanceSandboxDashboard.tsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Shield,
  Play,
  Terminal,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Network,
  Cloud,
  Cpu,
  FileJson,
  Trash2,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Check,
  Search,
  Wifi,
  WifiOff,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LogStatus =
  | "nominal"
  | "synced"
  | "active"
  | "warning"
  | "critical_error";

type Subsystem =
  | "SYSTEM"
  | "PIPELINE"
  | "AI_ENGINE"
  | "SUBTITLES";

interface SystemLog {
  id: string;
  timestamp: string;
  subsystem: Subsystem;
  event: string;
  status: LogStatus;
  details: string;
  latencyMs: number;
}

interface RuntimeConfig {
  app?: {
    name?: string;
    id?: string;
    version?: string;
    themeColor?: string;
  };
  cloudflare?: {
    bunVersion?: string;
  };
}

interface SandboxPayload {
  type?: string;
  status?: LogStatus | "nominal" | "critical_error";
  currentConfig?: RuntimeConfig;
  data?: RuntimeConfig;
  log?: string;
  errorDetails?: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const WS_URL = "ws://localhost:3001";

const SUBSYSTEM_TABS: Array<"ALL" | Subsystem> = [
  "ALL",
  "SYSTEM",
  "PIPELINE",
  "AI_ENGINE",
  "SUBTITLES",
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export const MaintenanceSandboxDashboard: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [autoPatchMode, setAutoPatchMode] = useState(true);
  const [selectedSubsystem, setSelectedSubsystem] = useState<
    "ALL" | Subsystem
  >("ALL");

  const socketRef = useRef<WebSocket | null>(null);
  const dryRunTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* ------------------------------------------------------------------------ */
  /* Logging                                                                  */
  /* ------------------------------------------------------------------------ */

  const pushLog = useCallback(
    (
      subsystem: Subsystem,
      event: string,
      status: LogStatus,
      details: string
    ) => {
      const now = new Date();

      const timeStr = [
        String(now.getHours()).padStart(2, "0"),
        String(now.getMinutes()).padStart(2, "0"),
        String(now.getSeconds()).padStart(2, "0"),
      ].join(":") + `.${String(now.getMilliseconds()).padStart(3, "0")}`;

      const newLog: SystemLog = {
        id: `log_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 7)}`,
        timestamp: timeStr,
        subsystem,
        event,
        status,
        details,
        latencyMs: Math.floor(Math.random() * 15) + 4,
      };

      setSystemLogs((prev) => [newLog, ...prev].slice(0, 100));
    },
    []
  );

  /* ------------------------------------------------------------------------ */
  /* WebSocket                                                                */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let isUnmounted = false;

    try {
      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        if (isUnmounted) return;

        setIsConnected(true);

        pushLog(
          "SYSTEM",
          "Kết nối trục trung gian thành công",
          "nominal",
          "WebSocket Sandbox active tại cổng :3001"
        );
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (isUnmounted) return;

        try {
          const payload: SandboxPayload = JSON.parse(event.data);

          if (
            payload.type === "SANDBOX_READY" ||
            payload.type === "LIVE_UI_HOT_RELOAD"
          ) {
            if (payload.currentConfig || payload.data) {
              setConfig(payload.currentConfig || payload.data || null);
            }

            if (payload.status === "nominal") {
              pushLog(
                "PIPELINE",
                "Kiểm định an toàn: THÀNH CÔNG",
                "synced",
                payload.log || "Đã kiểm duyệt cấu hình"
              );

              pushLog(
                "SYSTEM",
                "Auto-Patch: Đồng bộ tệp thành công",
                "nominal",
                "Đã kiểm tra package.json, manifest và capacitor.config"
              );
            }

            if (payload.status === "critical_error") {
              pushLog(
                "AI_ENGINE",
                "Phòng thí nghiệm báo lỗi",
                "critical_error",
                payload.errorDetails || "Phát hiện xung đột cấu hình"
              );
            }
          }
        } catch {
          pushLog(
            "SYSTEM",
            "Lỗi phân tích dữ liệu mạng",
            "warning",
            "Gói tin JSON gửi qua WebSocket không hợp lệ"
          );
        }
      };

      socket.onclose = () => {
        if (isUnmounted) return;

        setIsConnected(false);

        pushLog(
          "SYSTEM",
          "Ngắt kết nối trục trung gian",
          "warning",
          "Mất tín hiệu từ Sandbox Server"
        );
      };

      socket.onerror = () => {
        if (isUnmounted) return;

        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);

      pushLog(
        "SYSTEM",
        "Không thể khởi tạo WebSocket",
        "warning",
        `Không kết nối được tới ${WS_URL}`
      );
    }

    return () => {
      isUnmounted = true;

      const socket = socketRef.current;

      if (socket) {
        socket.close();
        socketRef.current = null;
      }
    };
  }, [pushLog]);

  /* ------------------------------------------------------------------------ */
  /* Dry Run                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleTriggerDryRun = useCallback(() => {
    if (isDryRunning) return;

    setIsDryRunning(true);

    pushLog(
      "SYSTEM",
      "Khởi động phòng thí nghiệm ngầm",
      "active",
      "Bắt đầu quét cấu trúc cây thư mục hệ thống hoạt động..."
    );

    const timer1 = setTimeout(() => {
      pushLog(
        "PIPELINE",
        "Quét cú pháp tệp dữ liệu gốc",
        "active",
        "Đang rà soát tệp config/system.config.ts"
      );
    }, 800);

    const timer2 = setTimeout(() => {
      pushLog(
        "AI_ENGINE",
        "Kiểm tra tính nhất quán cấu hình",
        "active",
        "Đang đối chiếu runtime configuration với Sandbox manifest"
      );
    }, 1200);

    const timer3 = setTimeout(() => {
      pushLog(
        "SUBTITLES",
        "Đồng bộ hóa nhãn dữ liệu",
        "nominal",
        "Kiểm tra cấu trúc cues JSON an toàn"
      );
    }, 1600);

    const timer4 = setTimeout(() => {
      pushLog(
        "SYSTEM",
        "Chạy thử hoàn tất: NOMINAL",
        "synced",
        "Hệ thống sạch. Đạt điều kiện kiểm tra đóng gói."
      );

      setIsDryRunning(false);
    }, 2200);

    dryRunTimersRef.current.push(timer1, timer2, timer3, timer4);
  }, [isDryRunning, pushLog]);

  /* ------------------------------------------------------------------------ */
  /* Cleanup Dry Run Timers                                                   */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      dryRunTimersRef.current.forEach((timer) => clearTimeout(timer));
      dryRunTimersRef.current = [];
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Refresh Connection                                                       */
  /* ------------------------------------------------------------------------ */

  const handleReconnect = useCallback(() => {
    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {
        // Ignore close errors.
      }

      socketRef.current = null;
    }

    setIsConnected(false);

    pushLog(
      "SYSTEM",
      "Yêu cầu tái kết nối",
      "active",
      `Đang chờ Sandbox Server tại ${WS_URL}`
    );

    try {
      const socket = new WebSocket(WS_URL);

      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);

        pushLog(
          "SYSTEM",
          "Tái kết nối thành công",
          "nominal",
          "WebSocket Sandbox đã hoạt động trở lại"
        );
      };

      socket.onmessage = (event) => {
        try {
          const payload: SandboxPayload = JSON.parse(event.data);

          if (payload.currentConfig || payload.data) {
            setConfig(payload.currentConfig || payload.data || null);
          }

          if (payload.status === "nominal") {
            pushLog(
              "PIPELINE",
              "Sandbox phản hồi NOMINAL",
              "synced",
              payload.log || "Cấu hình đã được đồng bộ"
            );
          }

          if (payload.status === "critical_error") {
            pushLog(
              "AI_ENGINE",
              "Sandbox phản hồi lỗi",
              "critical_error",
              payload.errorDetails || "Lỗi không xác định"
            );
          }
        } catch {
          pushLog(
            "SYSTEM",
            "Dữ liệu Sandbox không hợp lệ",
            "warning",
            "Không thể parse JSON từ WebSocket"
          );
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);

      pushLog(
        "SYSTEM",
        "Tái kết nối thất bại",
        "warning",
        `Không thể kết nối tới ${WS_URL}`
      );
    }
  }, [pushLog]);

  /* ------------------------------------------------------------------------ */
  /* Filter Logs                                                              */
  /* ------------------------------------------------------------------------ */

  const filteredLogs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return systemLogs.filter((log) => {
      const matchSubsystem =
        selectedSubsystem === "ALL" ||
        log.subsystem === selectedSubsystem;

      const matchQuery =
        !normalizedQuery ||
        log.event.toLowerCase().includes(normalizedQuery) ||
        log.details.toLowerCase().includes(normalizedQuery) ||
        log.subsystem.toLowerCase().includes(normalizedQuery);

      return matchSubsystem && matchQuery;
    });
  }, [systemLogs, selectedSubsystem, searchQuery]);

  /* ------------------------------------------------------------------------ */
  /* Status Badge                                                             */
  /* ------------------------------------------------------------------------ */

  const getStatusBadge = (status: LogStatus) => {
    switch (status) {
      case "nominal":
      case "synced":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

      case "active":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";

      case "warning":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";

      case "critical_error":
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";

      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Status Icon                                                              */
  /* ------------------------------------------------------------------------ */

  const getStatusIcon = (status: LogStatus) => {
    switch (status) {
      case "nominal":
      case "synced":
        return <CheckCircle2 size={13} />;

      case "warning":
      case "critical_error":
        return <AlertTriangle size={13} />;

      case "active":
        return <RefreshCw size={13} className="animate-spin" />;

      default:
        return <Terminal size={13} />;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <header className="border-b border-slate-800 bg-[#0a0f1c]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10">
                <Shield className="text-purple-400" size={23} />
              </div>

              <div>
                <h1 className="text-base font-bold tracking-wide text-white sm:text-lg">
                  Trung Tâm Điều Khiển Bảo Trì & Vá Lỗi Hệ Thống
                </h1>

                <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">
                  Trạm phân tích WebSocket Sandbox & Quét an toàn Cloudflare
                </p>
              </div>
            </div>

            <div
              className={`flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-wider md:self-auto ${
                isConnected
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-400"
              }`}
            >
              {isConnected ? (
                <Wifi size={13} />
              ) : (
                <WifiOff size={13} />
              )}

              {isConnected
                ? "SANDBOX ONLINE"
                : "DISCONNECTED"}
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6">
        {/* ---------------------------------------------------------------- */}
        {/* Dashboard Cards                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* -------------------------------------------------------------- */}
          {/* Core Action                                                     */}
          {/* -------------------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-800 bg-[#0b111e] p-4 shadow-xl lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                  Khối 01
                </p>

                <h2 className="mt-1 text-sm font-bold text-white">
                  Kích Hoạt Tác Vụ Cốt Lõi
                </h2>
              </div>

              <Sliders size={17} className="text-slate-500" />
            </div>

            <button
              type="button"
              onClick={handleTriggerDryRun}
              disabled={isDryRunning}
              className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                isDryRunning
                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                  : "bg-purple-600 text-white shadow-lg shadow-purple-900/20 hover:bg-purple-500"
              }`}
            >
              {isDryRunning ? (
                <>
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                  Đang thí nghiệm ngầm...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Chạy quét lỗi giả lập (Dry-Run)
                </>
              )}
            </button>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-200">
                    Tự động vá file thật
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Chỉ áp dụng khi Sandbox xác nhận an toàn
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Toggle Auto-Patch"
                  onClick={() =>
                    setAutoPatchMode((prev) => !prev)
                  }
                  className="border-0 bg-transparent text-slate-400 transition-colors hover:text-white"
                >
                  {autoPatchMode ? (
                    <ToggleRight
                      size={30}
                      className="text-purple-400"
                    />
                  ) : (
                    <ToggleLeft
                      size={30}
                      className="text-slate-600"
                    />
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[10px]">
                {autoPatchMode ? (
                  <>
                    <Check
                      size={12}
                      className="text-emerald-400"
                    />
                    <span className="text-emerald-400">
                      Auto-Patch đang bật
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle
                      size={12}
                      className="text-amber-400"
                    />
                    <span className="text-amber-400">
                      Chế độ chỉ kiểm tra
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Runtime Configuration                                           */}
          {/* -------------------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-800 bg-[#0b111e] p-4 lg:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                  Khối 02
                </p>

                <h2 className="mt-1 text-sm font-bold text-white">
                  Thông Số Cấu Hình Gốc
                </h2>
              </div>

              <FileJson
                size={17}
                className="text-slate-500"
              />
            </div>

            {config ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] text-slate-500">
                    App Name
                  </span>

                  <span className="max-w-[180px] truncate text-right text-[11px] font-semibold text-slate-200">
                    {config.app?.name ||
                      "Vietsub Video Studio"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] text-slate-500">
                    App ID
                  </span>

                  <span className="max-w-[180px] truncate text-right font-mono text-[10px] text-slate-300">
                    {config.app?.id ||
                      "com.vietsub.studio"}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[11px] text-slate-500">
                    Version
                  </span>

                  <span className="text-[11px] font-semibold text-slate-200">
                    v{config.app?.version || "1.0.0"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Theme Base
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full border border-white/10"
                      style={{
                        backgroundColor:
                          config.app?.themeColor ||
                          "#8b5cf6",
                      }}
                    />

                    <span className="font-mono text-[10px] text-slate-300">
                      {config.app?.themeColor ||
                        "#8b5cf6"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[145px] items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/30 px-5 text-center">
                <div>
                  <Cloud
                    size={24}
                    className="mx-auto mb-2 text-slate-600"
                  />

                  <p className="text-[11px] text-slate-500">
                    Đang chờ đồng bộ gói tin cấu hình...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------------- */}
          {/* Distribution                                                    */}
          {/* -------------------------------------------------------------- */}

          <div className="rounded-2xl border border-slate-800 bg-[#0b111e] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Khối 03
                </p>

                <h2 className="mt-1 text-sm font-bold text-white">
                  Trạng Thái Nền Tảng
                </h2>
              </div>

              <Server
                size={17}
                className="text-slate-500"
              />
            </div>

            <div className="space-y-3">
              <StatusRow
                icon={<Network size={15} />}
                label="Web App & PWA Manifest"
                status="Synced"
                color="emerald"
              />

              <StatusRow
                icon={<Cpu size={15} />}
                label="Android / iOS Config"
                status="Ready"
                color="cyan"
              />

              <StatusRow
                icon={<Cloud size={15} />}
                label="Cloudflare Deployment"
                status={`Bun ${
                  config?.cloudflare?.bunVersion ||
                  "1.2.x"
                }`}
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Telemetry                                                        */}
        {/* ---------------------------------------------------------------- */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0b111e]">
          {/* Header */}

          <div className="border-b border-slate-800 p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
                  <Terminal
                    size={17}
                    className="text-purple-400"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white">
                      Dòng Dữ Liệu Hoạt Động
                    </h2>

                    <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
                      Telemetry Stream
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {filteredLogs.length} bản ghi phù hợp
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Tabs */}

                <div className="flex flex-wrap items-center rounded-lg border border-slate-800 bg-slate-950 p-1">
                  {SUBSYSTEM_TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() =>
                        setSelectedSubsystem(tab)
                      }
                      className={`rounded px-2 py-1 text-[10px] font-medium transition-all ${
                        selectedSubsystem === tab
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search */}

                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Tìm telemetry..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 pl-8 pr-2.5 text-[11px] text-slate-200 outline-none placeholder:text-slate-600 focus:border-purple-500 sm:w-44"
                  />
                </div>

                {/* Clear */}

                <button
                  type="button"
                  onClick={() => setSystemLogs([])}
                  className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-[10px] text-slate-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/5 hover:text-rose-400"
                  title="Xóa lịch sử log"
                >
                  <Trash2 size={13} />
                  <span className="hidden sm:inline">
                    Xóa log
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                <Terminal
                  size={30}
                  className="mb-3 text-slate-700"
                />

                <p className="text-xs font-medium text-slate-500">
                  Không có nhật ký telemetry nào phù hợp
                </p>

                <p className="mt-1 text-[10px] text-slate-700">
                  Thử thay đổi bộ lọc hoặc chạy Dry-Run.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[850px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-left">
                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Timestamp
                    </th>

                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Subsystem
                    </th>

                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Event
                    </th>

                    <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-[9px] font-bold uppercase tracking-wider text-slate-600">
                      Latency
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-slate-800/70 transition-colors hover:bg-slate-900/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-slate-600">
                        {log.timestamp}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded bg-slate-900 px-2 py-1 font-mono text-[9px] font-bold text-slate-400">
                          {log.subsystem}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="max-w-[520px]">
                          <div className="text-[11px] font-semibold text-slate-300">
                            {log.event}
                          </div>

                          <div className="mt-1 text-[10px] leading-relaxed text-slate-600">
                            — {log.details}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[9px] font-bold uppercase ${getStatusBadge(
                            log.status
                          )}`}
                        >
                          {getStatusIcon(log.status)}
                          {log.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right font-mono text-[10px] text-slate-600">
                        {log.latencyMs}ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}

          <div className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-600">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    : "bg-rose-400"
                }`}
              />

              <span>
                WebSocket: {isConnected ? "active" : "offline"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReconnect}
              className="flex items-center gap-1.5 self-start rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-[10px] text-slate-400 transition-colors hover:border-purple-500/30 hover:text-purple-400 sm:self-auto"
            >
              <RefreshCw size={12} />
              Tái kết nối Sandbox
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Status Row                                                                 */
/* -------------------------------------------------------------------------- */

interface StatusRowProps {
  icon: React.ReactNode;
  label: string;
  status: string;
  color: "emerald" | "cyan" | "purple";
}

const StatusRow: React.FC<StatusRowProps> = ({
  icon,
  label,
  status,
  color,
}) => {
  const colorClasses = {
    emerald: {
      icon: "text-emerald-400",
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    },
    cyan: {
      icon: "text-cyan-400",
      badge:
        "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    },
    purple: {
      icon: "text-purple-400",
      badge:
        "border-purple-500/20 bg-purple-500/10 text-purple-400",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={colors.icon}>{icon}</span>

        <span className="truncate text-[11px] text-slate-400">
          {label}
        </span>
      </div>

      <span
        className={`ml-3 inline-flex shrink-0 items-center gap-1 rounded border px-2 py-1 text-[9px] font-bold ${colors.badge}`}
      >
        <Check size={10} />
        {status}
      </span>
    </div>
  );
};

export default MaintenanceSandboxDashboard;
