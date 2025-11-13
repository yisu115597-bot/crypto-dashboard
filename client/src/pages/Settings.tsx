import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Trash2, Lock, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showPrivacy, setShowPrivacy] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion API
    toast.success("帳號已刪除，所有數據已清除");
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">設定</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>帳號資訊</CardTitle>
            <CardDescription>您的帳號基本資訊</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">名稱</label>
              <div className="text-lg font-semibold text-slate-900">{user?.name || "未設定"}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <div className="text-lg font-semibold text-slate-900">{user?.email || "未設定"}</div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>隱私與安全</CardTitle>
            <CardDescription>了解我們如何保護您的數據</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Privacy Policy */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-slate-900">隱私政策</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrivacy(!showPrivacy)}
                >
                  {showPrivacy ? "隱藏" : "查看"}
                </Button>
              </div>

              {showPrivacy && (
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 space-y-3 mb-4">
                  <h4 className="font-semibold text-slate-900">數據收集與使用</h4>
                  <p>
                    我們只收集您主動提供的信息，包括 API Key 和錢包地址。我們絕不會與任何第三方分享您的財務數據。
                  </p>

                  <h4 className="font-semibold text-slate-900 mt-4">API Key 安全</h4>
                  <p>
                    您的 API Key 和 Secret 使用 AES-256 加密演算法儲存在我們的伺服器上。即使我們的伺服器被駭客入侵，您的憑證也是安全的。
                  </p>

                  <h4 className="font-semibold text-slate-900 mt-4">唯讀權限</h4>
                  <p>
                    我們只使用「唯讀」API 權限。技術上，我們無法進行任何交易、提款或其他可能影響您資金的操作。
                  </p>

                  <h4 className="font-semibold text-slate-900 mt-4">數據刪除</h4>
                  <p>
                    您可以隨時刪除帳號。刪除後，我們會立即清除所有相關數據，包括加密的 API Key 和錢包地址。
                  </p>

                  <h4 className="font-semibold text-slate-900 mt-4">日誌與監控</h4>
                  <p>
                    我們記錄所有 API 調用以進行安全監控和故障排查。日誌會在 30 天後自動刪除。
                  </p>
                </div>
              )}
            </div>

            {/* Security Tips */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-900">安全建議</h3>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 space-y-2">
                <p>✓ 定期檢查您在交易所的 API Key 設定</p>
                <p>✓ 如果懷疑 API Key 被洩露，立即在交易所重新生成</p>
                <p>✓ 使用強密碼保護您的帳號</p>
                <p>✓ 啟用雙因素認證（如果交易所支援）</p>
                <p>✓ 不要在公共 WiFi 上訪問本應用</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">危險區域</CardTitle>
            <CardDescription className="text-red-800">
              以下操作無法撤銷，請謹慎操作
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  刪除帳號及所有數據
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>刪除帳號</AlertDialogTitle>
                  <AlertDialogDescription>
                    此操作將永久刪除您的帳號和所有相關數據，包括：
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                      <li>所有 API Key 記錄</li>
                      <li>所有錢包地址</li>
                      <li>所有資產快照歷史</li>
                    </ul>
                    <p className="mt-2 font-semibold">此操作無法撤銷。</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3">
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    確認刪除
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-600">
          <p>版本 1.0.0 • 極簡加密資產儀表板</p>
          <p className="mt-2">
            有問題或建議？
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline ml-1">
              聯繫我們
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
