import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Settings, RefreshCw, TrendingUp } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch latest asset snapshot
  const { data: latestSnapshot, isLoading: snapshotLoading } = trpc.assets.getLatest.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch API keys list
  const { data: apiKeys = [] } = trpc.apiKeys.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch wallets list
  const { data: wallets = [] } = trpc.wallets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Sync assets mutation
  const syncMutation = trpc.assets.sync.useMutation();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
          <p className="text-slate-600">載入中...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="text-center max-w-md">
          <img src={APP_LOGO} alt="Logo" className="w-24 h-24 mx-auto mb-6 rounded-lg" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{APP_TITLE}</h1>
          <p className="text-lg text-slate-600 mb-2">極簡加密資產儀表板</p>
          <p className="text-slate-500 mb-8">
            安全、隱私優先的加密貨幣資產整合平台。一鍵查看您在幣安、OKX 等交易所的所有資產。
          </p>

          <Button
            onClick={() => {
              // 使用測試認證登入
              window.location.href = "/api/test-auth/login/user1";
            }}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            登入開始
          </Button>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600 mb-2">🔒</div>
              <h3 className="font-semibold text-slate-900 mb-1">安全加密</h3>
              <p className="text-sm text-slate-600">API Key 使用 AES-256 加密儲存</p>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600 mb-2">🔐</div>
              <h3 className="font-semibold text-slate-900 mb-1">隱私優先</h3>
              <p className="text-sm text-slate-600">唯讀 API，絕不涉及您的資金</p>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600 mb-2">⚡</div>
              <h3 className="font-semibold text-slate-900 mb-1">自動同步</h3>
              <p className="text-sm text-slate-600">每 10 分鐘自動更新資產數據</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view for authenticated users
  const assetsData = latestSnapshot?.assetsData || {};
  const totalValueUsd = parseFloat(latestSnapshot?.totalValueUsd || "0");
  const totalValueTwd = parseFloat(latestSnapshot?.totalValueTwd || "0");
  const assetCount = Object.keys(assetsData).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10 rounded" />
            <h1 className="text-2xl font-bold text-slate-900">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              設定
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
            >
              登出
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            歡迎回來，{user?.name || "用戶"}！
          </h2>
          <p className="text-slate-600">
            查看您的加密資產總覽和最新同步狀態
          </p>
        </div>

        {/* Asset Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Value Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium opacity-90">總資產價值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                ${totalValueUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm opacity-75">
                ≈ NT${totalValueTwd.toLocaleString("zh-TW", { maximumFractionDigits: 0 })}
              </p>
            </CardContent>
          </Card>

          {/* Connected Exchanges */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">已連接交易所</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">{apiKeys.length}</div>
              <p className="text-sm text-slate-600">
                {apiKeys.length === 0 ? "尚未連接任何交易所" : "個交易所已連接"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setLocation("/api-keys")}
              >
                <Plus className="w-4 h-4 mr-2" />
                新增交易所
              </Button>
            </CardContent>
          </Card>

          {/* Tracked Wallets */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">追蹤錢包</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-2">{wallets.length}</div>
              <p className="text-sm text-slate-600">
                {wallets.length === 0 ? "尚未追蹤任何錢包" : "個錢包已追蹤"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => setLocation("/wallets")}
              >
                <Plus className="w-4 h-4 mr-2" />
                新增錢包
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Assets Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>資產持倉</CardTitle>
              <CardDescription>
                {assetCount > 0
                  ? `共 ${assetCount} 項資產`
                  : "尚無資產數據，請先連接交易所或錢包"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "同步中..." : "立即同步"}
            </Button>
          </CardHeader>
          <CardContent>
            {snapshotLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400 mr-2" />
                <p className="text-slate-600">載入資產數據中...</p>
              </div>
            ) : assetCount === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">您還沒有連接任何交易所或錢包</p>
                <Button onClick={() => setLocation("/api-keys")}>
                  連接第一個交易所
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(assetsData).map(([key, asset]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900">{asset.symbol}</div>
                      <div className="text-sm text-slate-600">
                        {asset.source} • 可用: {asset.free.toFixed(8)} • 凍結: {asset.locked.toFixed(8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{asset.total.toFixed(8)}</div>
                      <div className="text-sm text-slate-600">
                        {asset.free > 0 && `${(asset.free / asset.total * 100).toFixed(1)}% 可用`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Sync Info */}
        {latestSnapshot && (
          <Card className="bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">
                最後更新：{new Date(latestSnapshot.createdAt).toLocaleString("zh-TW")}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
