import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { type TradingBot, type BotExecution } from "@shared/schema";
import { Activity, TrendingUp, TrendingDown, Zap, Radio, AlertCircle } from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const MatrixRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#39ff14";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-rain" />;
};

const LiveTicker = ({ bots, executions }: { bots?: TradingBot[]; executions?: BotExecution[] }) => {
  const [tickerItems, setTickerItems] = useState<string[]>([]);

  useEffect(() => {
    const items: string[] = [];
    
    if (bots) {
      bots.forEach(bot => {
        if (bot.isActive) {
          items.push(`[BOT:${bot.name}] STATUS:ACTIVE`);
          if (bot.totalProfit) {
            items.push(`[${bot.name}] P&L:+${parseFloat(bot.totalProfit).toFixed(2)} USDT`);
          }
        }
      });
    }

    if (executions && executions.length > 0) {
      const recent = executions.slice(0, 5);
      recent.forEach(ex => {
        const profit = parseFloat(ex.profit || "0");
        items.push(`[EXEC:${ex.strategy}] ${profit >= 0 ? '↑' : '↓'} ${Math.abs(profit).toFixed(2)} USDT`);
      });
    }

    items.push("MEMPOOL:SCANNING", "NETWORK:OPTIMIZED", "LATENCY:12ms", "BLOCKCHAIN:SYNC", "WEBSOCKET:CONNECTED");

    setTickerItems(items.length > 0 ? items : ["SYSTEM:INITIALIZING..."]);
  }, [bots, executions]);

  return (
    <div className="bg-black border-b border-[#39ff14] overflow-hidden py-2">
      <div className="ticker-scroll flex gap-8 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <span key={idx} className="neon-green font-mono text-sm">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const CyberBotCard = ({ bot }: { bot: TradingBot }) => {
  const profit = parseFloat(bot.totalProfit || "0");
  const loss = parseFloat(bot.totalLoss || "0");
  const netPnL = profit - loss;
  const isPositive = netPnL >= 0;

  return (
    <div
      className={`cyber-card rounded-lg p-6 transition-all duration-300 hover:scale-105 ${
        bot.isActive ? "cyber-glow-cyan" : ""
      }`}
      data-testid={`terminal-bot-card-${bot.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3
            className="text-xl font-bold neon-cyan font-mono glitch"
            data-text={bot.name}
            data-testid={`terminal-bot-name-${bot.id}`}
          >
            {bot.name}
          </h3>
          <p className="text-xs text-gray-400 font-mono mt-1">{bot.tradingPair}</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              bot.isActive ? "bg-[#39ff14] pulse-neon" : "bg-gray-600"
            }`}
            data-testid={`terminal-bot-status-${bot.id}`}
          />
          <span className={`text-xs font-mono ${bot.isActive ? "neon-green" : "text-gray-500"}`}>
            {bot.isActive ? "ACTIVE" : "IDLE"}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">STRATEGY</span>
          <span className="text-sm neon-magenta font-mono uppercase">{bot.strategy}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">EXCHANGE</span>
          <span className="text-sm text-white font-mono uppercase">{bot.exchange}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">P&L</span>
          <span
            className={`text-lg font-bold font-mono ${
              isPositive ? "neon-green" : "neon-pink"
            }`}
            data-testid={`terminal-bot-pnl-${bot.id}`}
          >
            {isPositive ? "+" : ""}{netPnL.toFixed(2)} USDT
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">WIN RATE</span>
          <span className="text-sm neon-cyan font-mono" data-testid={`terminal-bot-winrate-${bot.id}`}>
            {parseFloat(bot.winRate || "0").toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">TRADES</span>
          <span className="text-sm text-white font-mono" data-testid={`terminal-bot-trades-${bot.id}`}>
            {bot.totalTrades || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const CyberChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="cyberGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ffff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00ffff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#00ffff" opacity={0.1} />
        <XAxis dataKey="name" stroke="#00ffff" style={{ fontSize: "12px", fontFamily: "monospace" }} />
        <YAxis stroke="#00ffff" style={{ fontSize: "12px", fontFamily: "monospace" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            border: "1px solid #00ffff",
            borderRadius: "4px",
            fontFamily: "monospace",
          }}
          labelStyle={{ color: "#00ffff" }}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#00ffff"
          strokeWidth={2}
          fill="url(#cyberGradient)"
          style={{ filter: "drop-shadow(0 0 8px #00ffff)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default function TerminalPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { isAuthenticated } = useAuth();

  const { data: bots, isLoading: botsLoading } = useQuery<TradingBot[]>({
    queryKey: isAuthenticated ? ["/api/trading-bots"] : ["/api/public/demo-bots"],
  });

  const { data: executions, isLoading: executionsLoading } = useQuery<BotExecution[]>({
    queryKey: isAuthenticated ? ["/api/bot-executions"] : ["/api/public/demo-executions"],
  });

  useEffect(() => {
    const newSocket = io({
      path: "/socket.io",
    });

    newSocket.on("connect", () => {
      console.log("Terminal: Connected to WebSocket");
      newSocket.emit("subscribe:trading");
    });

    newSocket.on("trading:event", (event) => {
      console.log("Terminal: Trading event received", event);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const activeBots = bots?.filter(bot => bot.isActive) || [];
  const totalProfit = bots?.reduce((sum, bot) => sum + parseFloat(bot.totalProfit || "0"), 0) || 0;
  const totalLoss = bots?.reduce((sum, bot) => sum + parseFloat(bot.totalLoss || "0"), 0) || 0;
  const netPnL = totalProfit - totalLoss;
  const totalTrades = bots?.reduce((sum, bot) => sum + (bot.totalTrades || 0), 0) || 0;

  const chartData = executions?.slice(0, 20).reverse().map((ex, idx) => ({
    name: `T${idx + 1}`,
    value: parseFloat(ex.profit || "0"),
    cumulative: executions.slice(0, idx + 1).reduce((sum, e) => sum + parseFloat(e.profit || "0"), 0),
  })) || [];

  return (
    <div className="cyber-bg min-h-screen w-full overflow-x-hidden relative font-mono">
      <MatrixRain />

      <div className="relative z-10">
        <LiveTicker bots={bots} executions={executions} />

        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-[#39ff14]/20 to-[#00ffff]/20 border-y border-[#39ff14] py-3">
            <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#39ff14]" />
                <div>
                  <p className="text-sm font-bold neon-green font-mono" data-testid="demo-mode-label">
                    DEMO MODE ACTIVE
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    Viewing sample trading data. Login to access your real trading bots.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/auth/login"}
                className="border-[#39ff14] text-[#39ff14] hover:bg-[#39ff14]/10 font-mono"
                data-testid="demo-login-button"
              >
                LOGIN FOR REAL DATA
              </Button>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold neon-cyan mb-2 crt-effect" data-testid="terminal-title">
              VALIFI CYBERPUNK TERMINAL
            </h1>
            <p className="text-sm neon-magenta">MATRIX TRADING INTERFACE v3.0.0</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="cyber-card-green rounded-lg p-4" data-testid="terminal-stat-active-bots">
              <div className="flex items-center gap-2 mb-2">
                <Radio className="w-4 h-4 text-[#39ff14]" />
                <span className="text-xs text-gray-400">ACTIVE BOTS</span>
              </div>
              <p className="text-3xl font-bold neon-green">{activeBots.length}</p>
            </div>

            <div className="cyber-card rounded-lg p-4" data-testid="terminal-stat-total-trades">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-[#00ffff]" />
                <span className="text-xs text-gray-400">TOTAL TRADES</span>
              </div>
              <p className="text-3xl font-bold neon-cyan">{totalTrades}</p>
            </div>

            <div className={`cyber-card-${netPnL >= 0 ? 'green' : 'magenta'} rounded-lg p-4`} data-testid="terminal-stat-net-pnl">
              <div className="flex items-center gap-2 mb-2">
                {netPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-[#39ff14]" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-[#ff1744]" />
                )}
                <span className="text-xs text-gray-400">NET P&L</span>
              </div>
              <p className={`text-3xl font-bold ${netPnL >= 0 ? 'neon-green' : 'neon-pink'}`}>
                {netPnL >= 0 ? "+" : ""}{netPnL.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">USDT</p>
            </div>

            <div className="cyber-card-magenta rounded-lg p-4" data-testid="terminal-stat-network">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#ff00ff]" />
                <span className="text-xs text-gray-400">NETWORK</span>
              </div>
              <p className="text-2xl font-bold neon-magenta">12ms</p>
              <p className="text-xs text-gray-500 mt-1">LATENCY</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="cyber-card rounded-lg p-6" data-testid="terminal-equity-chart">
              <h2 className="text-xl font-bold neon-cyan mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                EQUITY CURVE
              </h2>
              {chartData.length > 0 ? (
                <CyberChart data={chartData} />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p className="text-gray-500 font-mono">NO DATA AVAILABLE</p>
                </div>
              )}
            </div>

            <div className="cyber-card-magenta rounded-lg p-6" data-testid="terminal-recent-executions">
              <h2 className="text-xl font-bold neon-magenta mb-4">RECENT EXECUTIONS</h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {executions && executions.length > 0 ? (
                  executions.slice(0, 8).map((ex) => {
                    const profit = parseFloat(ex.profit || "0");
                    const bot = bots?.find(b => b.id === ex.botId);
                    return (
                      <div
                        key={ex.id}
                        className="flex justify-between items-center border-b border-gray-800 pb-2"
                        data-testid={`terminal-execution-${ex.id}`}
                      >
                        <div>
                          <p className="text-sm text-white font-mono">{bot?.tradingPair || 'PAIR'}</p>
                          <p className="text-xs text-gray-500 font-mono uppercase">{ex.strategy}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold font-mono ${profit >= 0 ? 'neon-green' : 'neon-pink'}`}>
                            {profit >= 0 ? "+" : ""}{profit.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{ex.status}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">NO EXECUTIONS YET</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold neon-cyan mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              ACTIVE TRADING BOTS
            </h2>
            {botsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cyber-card rounded-lg p-6 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-800 rounded"></div>
                      <div className="h-4 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : bots && bots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bots.map((bot) => (
                  <CyberBotCard key={bot.id} bot={bot} />
                ))}
              </div>
            ) : (
              <div className="cyber-card rounded-lg p-12 text-center">
                <p className="text-xl neon-magenta font-mono">NO BOTS DEPLOYED</p>
                <p className="text-sm text-gray-500 mt-2">Initialize trading systems to begin</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#00ffff] mt-12 py-4">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs neon-cyan font-mono">
              VALIFI KINGDOM PLATFORM © 2025 | CYBERPUNK TERMINAL | ALL SYSTEMS OPERATIONAL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
